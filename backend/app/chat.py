"""
/api/chat — retrieval-augmented chat endpoint.

Behavior:
  - Always retrieves the most relevant local knowledge-base document(s) first.
  - If OPENROUTER_API_KEY is configured, asks the LLM (OpenRouter) to answer using ONLY the
    retrieved context, in the requested language, and to say so plainly if
    the context doesn't cover the question — never inventing laws,
    deadlines, or eligibility (per the product brief).
  - If no API key is configured, returns the top retrieved document's text
    directly, labeled mode="demo" — still grounded, just not paraphrased by
    an LLM. This keeps the endpoint honestly functional with zero setup.
"""
import logging
import time
import httpx
import re
import os
from urllib.parse import quote

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional

from .config import IS_BHASHINI_CONFIGURED  # importing config also loads backend/.env
from .knowledge_base import retrieve, doc_text
from .languages import LANGUAGE_NAMES_EN, SCHEDULED_LANGUAGES
from . import bhashini
from .rag import retriever as rag_retriever

router = APIRouter()
logger = logging.getLogger("uvicorn.error")  # shows in the uvicorn console

# --- OpenRouter LLM. Key is read server-side only. ---
def _clean_key(raw: str) -> str:
    """Tolerate common .env mistakes: surrounding quotes, a pasted "Bearer "
    prefix, stray spaces/newlines inside the value."""
    k = (raw or "").strip().strip("\"'").strip()
    if k.lower().startswith("bearer "):
        k = k[7:]
    return "".join(k.split()).strip("\"'")


OPENROUTER_API_KEY = _clean_key(os.getenv("OPENROUTER_API_KEY", ""))
# "openrouter/free" = OpenRouter's free-models router. Override with
# OPENROUTER_MODEL in .env to pin a specific model (e.g. "...:free").
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openrouter/free").strip() or "openrouter/free"
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
# Optional extra models, tried only if you list them in .env as
# OPENROUTER_FALLBACK_MODELS=<slug>,<slug>. No model IDs are hardcoded here:
# free slugs change often and dead ones return HTTP 404.
OPENROUTER_FALLBACK_MODELS = [
    m.strip() for m in os.getenv("OPENROUTER_FALLBACK_MODELS", "").split(",") if m.strip()
]
# A chunk counts as "relevant PDF content" only if its FAISS cosine similarity
# is at least this. (The retriever's own floor, RAG_MIN_SIMILARITY, is lower and
# lets loosely related pages through.) Tune in .env: RAG_CHAT_THRESHOLD=0.45
try:
    RAG_CHAT_THRESHOLD = float(os.getenv("RAG_CHAT_THRESHOLD", "0.40"))
except ValueError:
    RAG_CHAT_THRESHOLD = 0.40
# A Google AI key (starts with "AQ." or "AIza") accidentally pasted into
# OPENROUTER_API_KEY, or kept in GEMINI_API_KEY, is detected and used through
# Google's API so the chatbot still answers. Real OpenRouter keys ("sk-or-")
# always use OpenRouter.
_GOOGLE_KEY = _clean_key(os.getenv("GEMINI_API_KEY", ""))
if not OPENROUTER_API_KEY.startswith("sk-or-") and OPENROUTER_API_KEY:
    _GOOGLE_KEY = _GOOGLE_KEY or OPENROUTER_API_KEY
IS_LLM_CONFIGURED = bool(OPENROUTER_API_KEY.startswith("sk-or-") or _GOOGLE_KEY)

# All 23 (22 scheduled + English) so the model can be asked to answer in any of
# them — this is independent of Bhashini and doesn't require it configured;
# the model's own multilingual generation handles the "live" (LLM-configured)
# path. Bhashini is only used below for the "demo" (no LLM key) path,
# where the knowledge base's static text needs translating instead of an
# LLM paraphrasing it.
LANGUAGE_NAMES = LANGUAGE_NAMES_EN


class ChatMessage(BaseModel):
    role: str
    text: str


class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    history: Optional[List[ChatMessage]] = None


class Citation(BaseModel):
    pdfName: str
    pageNumber: int


class ChatResponse(BaseModel):
    answer: Optional[str]
    source: Optional[str]
    officialLink: Optional[str]
    lastUpdated: Optional[str]
    mode: str  # "live" | "demo"
    # True if `answer` is actually in the requested language (via the model,
    # static translation, or a live Bhashini translation); False if it
    # silently fell back to English because nothing else was available.
    # Added so the frontend can show an honest notice instead of repeating
    # the earlier bug where English text was returned unlabeled.
    inRequestedLanguage: bool = True
    # Populated only when the answer came from the PDF/FAISS knowledge base
    # (backend/knowledge/) rather than the small built-in demo docs. Each
    # entry is a real (pdf_name, page_number) the answer was grounded in —
    # never invented. None/empty when RAG wasn't used for this answer.
    citations: Optional[List[Citation]] = None


def _call_llm_demo(message: str, language: str, context_docs) -> Optional[str]:
    """Built-in demo-KB path. (Name kept for minimal diff; now uses OpenRouter.)
    Returns None on any failure."""
    try:
        context_text = "\n\n".join(
            f"[{d['id']}] {doc_text(d, language)}" for d in context_docs
        ) or "(no matching document found)"
        lang_name = LANGUAGE_NAMES.get(language, "English")

        prompt = (
            "You are Mitra, an assistant for Indian cooperative members and farmers. "
            "Answer the user's question using ONLY the context below. If the context does not "
            "contain the answer, say plainly that you don't have verified information on that "
            "topic yet and suggest where to check (e.g. the official link) — never invent laws, "
            f"deadlines, or eligibility. Reply in {lang_name}.\n\n"
            f"Context:\n{context_text}\n\n"
            f"Question: {message}\n"
        )
        return _generate(prompt)
    except Exception:
        return None


KNOWLEDGE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "knowledge")
)


class LLMError(Exception):
    """Real LLM failure (auth, quota, rate limit, network, empty reply...).
    Name kept so the rest of the flow is unchanged; the provider is OpenRouter."""


class LLMQuotaExhausted(LLMError):
    """OpenRouter's daily free-tier quota is used up (HTTP 429 free-models-per-day).
    Retrying the same route or other free models cannot help until it resets."""


_working_model: Optional[str] = None  # kept for the check route / logs
_quota_blocked_until: float = 0.0      # epoch seconds; OpenRouter skipped until then
_dead_models: set = set()              # slugs that returned 404 (don't retry them)


def _is_daily_quota_429(r) -> bool:
    """True for the daily free-tier limit (not a transient per-minute 429)."""
    body = (r.text or "").lower()
    if "free-models-per-day" in body or "openrouter_free_tier_daily" in body:
        return True
    return r.headers.get("x-ratelimit-remaining", "") == "0" and "per-day" in body


def _block_until_reset(r) -> None:
    """Remember the exhaustion so later requests fail fast instead of calling
    OpenRouter again. Uses the reset time OpenRouter sends (epoch ms); else 1h."""
    global _quota_blocked_until
    reset = 0.0
    try:
        raw = r.headers.get("x-ratelimit-reset") or ""
        if not raw:
            raw = str(((r.json().get("error") or {}).get("metadata") or {}).get("headers", {}).get("X-RateLimit-Reset", ""))
        reset = float(raw) / 1000.0 if raw else 0.0
    except Exception:
        reset = 0.0
    now = time.time()
    _quota_blocked_until = reset if reset > now else now + 3600.0
    # Re-check at most every 10 min in case credits were added meanwhile.
    _quota_blocked_until = min(_quota_blocked_until, now + 600.0)


_LEAK_RE = re.compile(
    r"(here'?s a thinking process|thinking process\s*:|analy[sz]e the user'?s? (request|input|question)|"
    r"role\s*:\s*mitra|\bthe user is asking\b|\blet me think\b)",
    re.I,
)


def _looks_like_reasoning(text: str) -> bool:
    """Some free models print their chain-of-thought as the answer. Never show that."""
    return bool(_LEAK_RE.search(text[:600]))


def _extract_text(data: dict) -> str:
    """Pull the answer text out of an OpenRouter response, tolerating the
    different shapes providers return (string, list of parts, legacy 'text').
    Reasoning-only replies (content empty, text in 'reasoning') yield ''."""
    choice = (data.get("choices") or [{}])[0] or {}
    msg = choice.get("message") or {}
    content = msg.get("content")
    if isinstance(content, list):
        content = "".join(
            part.get("text", "") if isinstance(part, dict) else str(part) for part in content
        )
    text = (content or choice.get("text") or "").strip()
    return re.sub(r"<think>.*?</think>", "", text, flags=re.S | re.I).strip()


def _generate_openrouter(prompt: str) -> str:
    """Single place that talks to the LLM (OpenRouter chat completions).
    Returns text or raises LLMError carrying the real error (logged only).

    Why replies used to fail: free "reasoning" models spend the token budget
    thinking and return EMPTY content, free endpoints rate-limit (429), and
    some print their chain-of-thought as the answer. So: a generous token
    budget, low reasoning effort, and retries that rotate through fallback
    models with backoff before giving up."""
    global _working_model
    if not OPENROUTER_API_KEY:
        raise LLMError("OPENROUTER_API_KEY is not set in backend/.env")
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",  # optional attribution headers
        "X-Title": "Mitra - CoopConnect",
    }
    if time.time() < _quota_blocked_until:
        raise LLMQuotaExhausted("OpenRouter free-models-per-day quota exhausted (skipping until reset)")
    # Primary route (default openrouter/free) first, then only models the user
    # listed in .env. Each model gets up to 2 tries (transient errors only).
    models = [OPENROUTER_MODEL] + [m for m in OPENROUTER_FALLBACK_MODELS if m != OPENROUTER_MODEL]
    # Reasoning handling rotates per try: low effort -> reasoning off -> not sent.
    reasoning_variants = [{"effort": "low"}, {"enabled": False}, None]
    deadline = time.monotonic() + 75.0  # frontend allows 90s; stay under it

    last_err = "unknown error"
    attempt = 0
    for model in models:
        if model in _dead_models:
            continue
        for try_no in range(2):
            attempt += 1
            if time.monotonic() > deadline:
                raise LLMError(last_err + " (time budget exhausted)")
            # Empty replies are usually reasoning models running out of tokens
            # (worst for Indic scripts) -> give the retry more room.
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens": 1500 + 1500 * try_no,
            }
            rv = reasoning_variants[attempt % len(reasoning_variants)]
            if rv is not None:
                payload["reasoning"] = rv  # ignored by models without reasoning
            try:
                r = httpx.post(OPENROUTER_URL, headers=headers, json=payload, timeout=30.0)
                if r.status_code != 200:
                    last_err = f"OpenRouter HTTP {r.status_code}: {r.text[:300]}"
                    logger.error("OpenRouter call failed (attempt %d, %s): %s", attempt, model, last_err)
                    if r.status_code == 429:
                        if _is_daily_quota_429(r):
                            _block_until_reset(r)
                            raise LLMQuotaExhausted(last_err)  # no retries, no other free models
                        try:  # temporary rate limit: one short wait, then retry
                            wait = min(float(r.headers.get("retry-after", 2)), 4.0)
                        except ValueError:
                            wait = 2.0
                        time.sleep(wait)
                        continue
                    if r.status_code in (500, 502, 503, 504, 408):
                        time.sleep(1.0)
                        continue
                    if r.status_code == 404:
                        _dead_models.add(model)  # unavailable slug: never retry it
                        break
                    if r.status_code == 400:
                        continue  # maybe the reasoning param; next try varies it
                    raise LLMError(last_err)  # 401/402/403: retrying won't help
                data = r.json()
                if data.get("error"):
                    last_err = f"OpenRouter error: {str(data['error'])[:300]}"
                    logger.error("OpenRouter error (attempt %d, %s): %s", attempt, model, last_err)
                    time.sleep(0.8)
                    continue
                text = _extract_text(data)
                if not text:
                    last_err = "OpenRouter returned an empty response"
                    logger.warning("[LLM] empty content (attempt %d, requested=%s, served=%s, finish=%s); retrying",
                                   attempt, model, data.get("model"),
                                   ((data.get("choices") or [{}])[0] or {}).get("finish_reason"))
                    continue
                if _looks_like_reasoning(text):
                    last_err = "model returned its reasoning instead of an answer"
                    logger.warning("[LLM] reasoning text leaked (attempt %d, served=%s); retrying", attempt, data.get("model"))
                    continue
                _working_model = data.get("model") or model
                return _plain(text)
            except LLMError:
                raise
            except Exception as e:
                last_err = f"{type(e).__name__}: {e}"
                logger.error("OpenRouter request failed (attempt %d, %s): %s", attempt, model, last_err)
                time.sleep(0.6)
    raise LLMError(last_err)


def _generate_google(prompt: str) -> str:
    """Fallback provider: Google AI (Gemini) REST API, used only when the key
    in .env is a Google key instead of an OpenRouter one."""
    global _working_model
    key = _GOOGLE_KEY
    env_model = os.getenv("GEMINI_MODEL", "").strip()
    models = [m for m in ([env_model] if env_model and "1.5" not in env_model else [])
              + ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-flash-latest"]
              if m]
    models = list(dict.fromkeys(models))
    last_err = "unknown error"
    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        for with_thinking_off in (True, False):
            gen_cfg = {"temperature": 0.3, "maxOutputTokens": 1200}
            if with_thinking_off:
                gen_cfg["thinkingConfig"] = {"thinkingBudget": 0}
            payload = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": gen_cfg}
            try:
                r = httpx.post(url, headers={"x-goog-api-key": key, "Content-Type": "application/json"},
                               json=payload, timeout=30.0)
                if r.status_code in (401, 403):  # some key types want ?key=
                    r = httpx.post(url, params={"key": key}, json=payload, timeout=30.0)
                if r.status_code == 200:
                    data = r.json()
                    parts = ((data.get("candidates") or [{}])[0].get("content") or {}).get("parts") or []
                    text = "".join(p.get("text", "") for p in parts).strip()
                    if text:
                        _working_model = model
                        return _plain(text)
                    last_err = "Google AI returned an empty response"
                    break
                last_err = f"Google AI HTTP {r.status_code}: {r.text[:300]}"
                logger.error("Google AI call failed (model=%s): %s", model, last_err)
                if r.status_code == 400 and with_thinking_off:
                    continue  # model doesn't accept thinkingConfig -> retry without it
                if r.status_code in (429, 500, 503):
                    time.sleep(1.5)
                break
            except Exception as e:
                last_err = f"{type(e).__name__}: {e}"
                logger.error("Google AI request failed (model=%s): %s", model, last_err)
                break
        if "HTTP 404" not in last_err and "HTTP 429" not in last_err and "HTTP 503" not in last_err and "empty" not in last_err:
            break  # auth / bad request: other models won't help
    raise LLMError(last_err)


def _generate(prompt: str) -> str:
    """Single place that talks to the LLM. Uses OpenRouter for an 'sk-or-' key,
    otherwise Google AI for a Google key. If OpenRouter fails entirely and a
    separate Google key is configured, that is tried before giving up.
    Raises LLMError with the real reason."""
    if OPENROUTER_API_KEY.startswith("sk-or-"):
        try:
            return _generate_openrouter(prompt)
        except LLMError as e:
            if _GOOGLE_KEY:
                logger.warning("[LLM] OpenRouter failed (%s) -> trying Google AI", e)
                return _generate_google(prompt)
            raise
    if _GOOGLE_KEY:
        return _generate_google(prompt)
    raise LLMError("No API key set: put OPENROUTER_API_KEY=sk-or-... in backend/.env")


def _plain(text: str) -> str:
    """Final answers are plain text: strip Markdown bold/italic/headers/backticks."""
    text = re.sub(r"^\s*[*•]\s+", "- ", text, flags=re.M)      # "* item" -> "- item"
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text, flags=re.S)  # **bold**
    text = re.sub(r"__(.+?)__", r"\1", text, flags=re.S)       # __bold__
    text = re.sub(r"(?<!\w)\*(\S[^*\n]*?)\*(?!\w)", r"\1", text)  # *italic*
    text = re.sub(r"^\s*#{1,6}\s*", "", text, flags=re.M)      # # headers
    text = text.replace("**", "").replace("`", "")
    return text.strip()


_SOURCE_RE = re.compile(r"^\s*\[?\s*SOURCE\s*:?\s*\[?(\d+)\]?\s*\]?\s*[:.\-]?\s*", re.I)


def _call_llm_rag(message: str, language: str, chunks: list[dict]):
    """
    Relevant-PDF path. Relevance was already decided by the FAISS similarity
    threshold; the LLM does not judge it. The LLM gets the user query +
    retrieved PDF text and answers ONLY from that text, in the user's language.
    It only reports WHICH excerpt number it used (validated against the
    retrieved list) — filename, page and link always come from RAG metadata.
    Returns (answer_text, chunk_index), or (None, None) if the excerpts don't
    contain the answer (caller then uses the general-answer flow).
    Raises LLMError on failure.
    """
    context_text = "\n\n".join(f"Excerpt {i}:\n{c['text']}" for i, c in enumerate(chunks, 1))
    lang_name = LANGUAGE_NAMES.get(language, "English")
    native = _NATIVE_NAMES.get(language, lang_name)
    prompt = (
        "You are Mitra, an assistant for Indian cooperative members and farmers.\n"
        "Answer the user's question using ONLY the PDF excerpts below.\n"
        "Rules:\n"
        "- Use only facts explicitly stated in the excerpts. Add no outside knowledge.\n"
        "- Never invent or assume figures, percentages, dates, claim timelines, "
        "eligibility rules, names or procedures that are not in the excerpts.\n"
        "- If NONE of the excerpts contain the answer, output exactly NOT_IN_DOCUMENT and nothing else.\n"
        "- Otherwise the FIRST line must be: SOURCE: N  (N = the number of the excerpt your answer "
        "comes from). Then, on the next lines, the answer.\n"
        "- The answer must be short, clear and natural: usually 1 to 3 sentences.\n"
        "- Plain text only. No Markdown, no asterisks, no bold, no headings.\n"
        "- Do not write file names, page numbers or links in the answer, and do not explain your reasoning.\n"
        f"- Write the answer ONLY in {lang_name} ({native}), in its native script, even though the "
        "excerpts are in English.\n\n"
        f"PDF excerpts:\n{context_text}\n\n"
        f"Question: {message}\n"
    )
    raw = _generate(prompt)
    if "NOT_IN_DOCUMENT" in raw.upper().replace(" ", "_"):
        return None, None
    m = _SOURCE_RE.match(raw)
    if not m:
        logger.warning("[CHAT] RAG reply had no SOURCE line -> using general flow")
        return None, None
    idx = int(m.group(1)) - 1
    if not 0 <= idx < len(chunks):
        logger.warning("[CHAT] RAG reply cited excerpt %s out of range -> using general flow", m.group(1))
        return None, None
    text = raw[m.end():].strip()
    if not text:
        return None, None
    return text, idx


_NATIVE_NAMES = {l["code"]: l["native_name"] for l in SCHEDULED_LANGUAGES}

# Unicode blocks of each language's script, used to verify the model really
# answered in the requested language (not English).
_DEVA, _BENG, _ARAB = [(0x0900, 0x097F)], [(0x0980, 0x09FF)], [(0x0600, 0x06FF), (0x0750, 0x077F), (0xFB50, 0xFDFF), (0xFE70, 0xFEFF)]
_SCRIPT_RANGES = {
    "hi": _DEVA, "mr": _DEVA, "ne": _DEVA, "sa": _DEVA, "kok": _DEVA, "mai": _DEVA, "brx": _DEVA, "doi": _DEVA,
    "bn": _BENG, "as": _BENG, "mni": _BENG + [(0xABC0, 0xABFF)],
    "gu": [(0x0A80, 0x0AFF)], "pa": [(0x0A00, 0x0A7F)], "or": [(0x0B00, 0x0B7F)],
    "ta": [(0x0B80, 0x0BFF)], "te": [(0x0C00, 0x0C7F)], "kn": [(0x0C80, 0x0CFF)], "ml": [(0x0D00, 0x0D7F)],
    "ur": _ARAB, "ks": _ARAB, "sd": _ARAB, "sat": [(0x1C50, 0x1C7F)],
}


def _in_script(text: str, language: str) -> Optional[bool]:
    """True/False whether the reply is mostly in the language's own script.
    None for English / unknown codes (nothing to verify)."""
    ranges = _SCRIPT_RANGES.get(language)
    if not ranges:
        return None
    letters = [ch for ch in text if ch.isalpha()]
    if not letters:
        return True
    hits = sum(1 for ch in letters if any(a <= ord(ch) <= b for a, b in ranges))
    return hits / len(letters) >= 0.6  # allows names like PMFBY, PM-KISAN, rejects mixed scripts


def _ensure_language(text: str, language: str) -> str:
    """Strict language guarantee. If the model answered in the wrong language
    (typically English for a less-resourced language), (1) ask the model to
    translate its own answer, then (2) try Bhashini translation. Never returns
    an empty string; if nothing works the original answer is kept."""
    if _in_script(text, language) is not False:
        return text
    lang_name = LANGUAGE_NAMES.get(language, language)
    logger.warning("[CHAT] reply not in %s script; translating", lang_name)
    try:
        tr = _generate(
            f"Translate the text below into {lang_name} ({_NATIVE_NAMES.get(language, '')}), "
            "written in its native script. Keep it short. Output ONLY the translation: "
            "plain text, no Markdown, no asterisks, no English, no explanation.\n\n"
            f"Text: {text}"
        )
        if _in_script(tr, language):
            return tr
    except LLMError as e:
        logger.error("[CHAT] LLM translation failed: %s", e)
    if IS_BHASHINI_CONFIGURED:
        try:
            tr = bhashini.translate(text, "en", language)
            if tr and _in_script(tr, language):
                return _plain(tr)
        except Exception as e:
            logger.error("[CHAT] Bhashini translation failed: %s", e)
    return text


_LATIN_HINTS = {
    "hi": {"kya", "hai", "hain", "ka", "ki", "ke", "mein", "me", "kaise", "kyun", "kaun", "samiti",
           "samitiyon", "sahakari", "kisan", "aur", "ko", "se", "mujhe", "hota", "hoti", "uddeshya",
           "labh", "fayda", "batao", "bataiye", "kitna", "kab"},
    "ta": {"enna", "eppadi", "evvalavu", "vivasayam", "sangam", "kadan", "yen", "yaar", "enakku", "vendum"},
}
_SCRIPT_DEFAULT = {
    "hi": "hi", "bn": "bn", "gu": "gu", "pa": "pa", "or": "or", "ta": "ta", "te": "te",
    "kn": "kn", "ml": "ml", "ur": "ur", "sat": "sat",
}
_GREETINGS = {
    "hi", "hii", "hiii", "hello", "hey", "hola", "namaste", "namaskar", "namaskaram", "vanakkam", "pranam",
    "good", "morning", "evening", "afternoon", "mitra",
    "नमस्ते", "नमस्कार", "प्रणाम", "हैलो", "हेलो", "वणक्कम்", "வணக்கம்", "ஹலோ", "హలో", "నమస్కారం",
    "ನಮಸ್ಕಾರ", "ഹലോ", "നമസ്കാരം", "নমস্কার", "হ্যালো", "નમસ્તે", "ਸਤ", "ਸ੍ਰੀ", "ਅਕਾਲ", "ନମସ୍କାର", "السلام", "علیکم", "ہیلو", "آداب",
    "mitra", "मित्र", "மித்ரா",
}


def _effective_language(message: str, ui_language: str) -> str:
    """Answer in the language the user actually wrote in. Non-Latin script ->
    that script's language (the selected one if it matches). Latin letters:
    use the selected language; for English UI, spot romanized Hindi/Tamil."""
    letters = [ch for ch in message if ch.isalpha()]
    if not letters:
        return ui_language
    best, best_n = None, 0
    for code, ranges in _SCRIPT_RANGES.items():
        n = sum(1 for ch in letters if any(a <= ord(ch) <= b for a, b in ranges))
        if n > best_n:
            best, best_n = code, n
    if best and best_n / len(letters) >= 0.5:
        if ui_language in _SCRIPT_RANGES and _SCRIPT_RANGES[ui_language] == _SCRIPT_RANGES[best]:
            return ui_language  # same script family as the selected language
        return _SCRIPT_DEFAULT.get(best, best)
    if ui_language != "en":
        return ui_language
    words = set(re.findall(r"[a-z]+", message.lower()))
    for code, hints in _LATIN_HINTS.items():
        if len(words & hints) >= 2:
            return code
    return "en"


def _is_greeting(message: str) -> bool:
    """Short greetings never go to RAG, so they can't pick up a random PDF citation."""
    words = [w.strip(".,!?;:\"'()-।॥…") for w in message.lower().split()]  # split on spaces: \w breaks Indic vowel signs
    words = [w for w in words if w]
    if not words or len(words) > 5:
        return False
    return any(w in _GREETINGS for w in words) and all(w in _GREETINGS or len(w) <= 2 for w in words)


def _limit_words(text: str, max_words: int = 20) -> str:
    """Hard guarantee for the short-answer target: if the model runs long, cut
    at the last complete sentence within max_words; otherwise at a clean word
    boundary (no dangling comma) and close with a full stop."""
    words = text.split()
    if len(words) <= max_words:
        return text
    cut = " ".join(words[:max_words])
    last = max(cut.rfind(ch) for ch in (".", "?", "!", "।"))
    if last >= len(cut) // 2:
        return cut[: last + 1]
    comma = max(cut.rfind(","), cut.rfind("，"), cut.rfind("、"))
    if comma >= len(cut) // 2:  # end at the last complete phrase
        return cut[:comma].rstrip() + "."
    return cut.rstrip(" ,;:-–—") + "."


def _call_llm_general(message: str, language: str) -> str:
    """No relevant PDF: only the user's question goes to the LLM, which answers
    from its own knowledge. Short, plain text, in the user's language. No
    citation. Raises LLMError on failure."""
    lang_name = LANGUAGE_NAMES.get(language, "English")
    native = _NATIVE_NAMES.get(language, lang_name)
    prompt = (
        "You are Mitra, a friendly assistant for Indian cooperative members and farmers. "
        "Answer exactly what the question asks, correctly and clearly, and add nothing unrelated. "
        f"Reply ONLY in {lang_name} ({native}), written in its native script, even if the question "
        "is typed in Roman letters. "
        "Keep it short and natural: usually 1 to 3 sentences. "
        "If the question asks for examples (such as schemes), name the 3 or 4 most important real, "
        "well-known Indian ones. "
        "Plain text only: no Markdown, no asterisks, no bold, no bullet points, no headings. "
        "Do not mention documents, PDFs, pages or links, and never say a document does not mention something. "
        "If the message is just a greeting, greet back warmly in one sentence and ask how you can help. "
        "Do not explain your reasoning or show any thinking process. "
        "If unsure of a specific figure, date or rule, say so briefly instead of guessing.\n\n"
        f"Question: {message}\n"
    )
    return _limit_words(_ensure_language(_generate(prompt), language), 80)


def _last_resort_answer(message: str, language: str) -> Optional[str]:
    """Final safety net when every native-language LLM attempt failed: ask a
    SHORT English question (far cheaper for the model), then translate the
    result into the user's language (LLM, then Bhashini). None if it fails."""
    try:
        eng = _generate(
            "You are Mitra, an assistant for Indian cooperative members and farmers. "
            "Answer the question below correctly in 1 to 3 plain sentences (English, no Markdown). "
            "If unsure of a specific figure or rule, say so briefly.\n\n"
            f"Question: {message}\n"
        )
    except LLMError as e:
        logger.error("[CHAT] last-resort English answer failed: %s", e)
        return None
    if language == "en":
        return _limit_words(eng, 80)
    return _limit_words(_ensure_language_force(eng, language), 80)


def _ensure_language_force(text: str, language: str) -> str:
    """Like _ensure_language, but for text KNOWN to be English."""
    lang_name = LANGUAGE_NAMES.get(language, language)
    try:
        tr = _generate(
            f"Translate the text below into {lang_name} ({_NATIVE_NAMES.get(language, '')}), "
            "written in its native script. Output ONLY the translation, plain text, no English.\n\n"
            f"Text: {text}"
        )
        if _in_script(tr, language) is not False:
            return tr
    except LLMError as e:
        logger.error("[CHAT] forced LLM translation failed: %s", e)
    if IS_BHASHINI_CONFIGURED:
        try:
            tr = bhashini.translate(text, "en", language)
            if tr:
                return _plain(tr)
        except Exception as e:
            logger.error("[CHAT] Bhashini translation failed: %s", e)
    return text


def _unique_citations(chunks: list[dict]) -> list[Citation]:
    seen, out = set(), []
    for c in chunks:
        key = (c["pdf_name"], c["page_number"])
        if key not in seen:
            seen.add(key)
            out.append(Citation(pdfName=c["pdf_name"], pageNumber=int(c["page_number"])))
    return out


def _pdf_url(request: Request, pdf_name: str, page: int) -> Optional[str]:
    """Absolute link to the real PDF (opens at the cited page) — only if the
    file actually exists in backend/knowledge/; otherwise None, never a guess."""
    path = os.path.abspath(os.path.join(KNOWLEDGE_DIR, pdf_name))
    if not path.startswith(KNOWLEDGE_DIR + os.sep) or not os.path.isfile(path):
        return None
    base = str(request.base_url).rstrip("/")
    return f"{base}/api/knowledge/{quote(pdf_name)}#page={page}"


@router.get("/api/knowledge/{pdf_name}")
def serve_knowledge_pdf(pdf_name: str):
    """Serves an original PDF from backend/knowledge/ so citation links work."""
    path = os.path.abspath(os.path.join(KNOWLEDGE_DIR, pdf_name))
    if (
        not path.startswith(KNOWLEDGE_DIR + os.sep)
        or not path.lower().endswith(".pdf")
        or not os.path.isfile(path)
    ):
        raise HTTPException(status_code=404, detail="Not Found")
    return FileResponse(path, media_type="application/pdf")



def _translate_if_needed(text: str, language: str) -> tuple[str, bool]:
    """Shared by both the old demo path and the RAG no-LLM path: en/hi/ta
    text is assumed already correct; anything else is translated via
    Bhashini if configured and available, else left in English with
    inRequestedLanguage=False so the caller can say so honestly."""
    if language in ("en", "hi", "ta"):
        return text, True
    if IS_BHASHINI_CONFIGURED:
        try:
            return bhashini.translate(text, "en", language), True
        except bhashini.BhashiniError:
            pass
    return text, False


def _demo_answer(doc: dict, language: str) -> tuple[str, bool]:
    """
    Text for the no-LLM-key ("demo") path, in the requested language
    where possible.

    - en/hi/ta: static text already on the doc (see knowledge_base.py) —
      always correct, never a network call.
    - Any of the other 19 scheduled languages: translate the English text
      via Bhashini at request time (cached by Bhashini's own config cache,
      not re-fetched per request-shape). If Bhashini isn't configured, the
      language isn't supported for translation, or the call fails, this
      falls back to English — but returns inRequestedLanguage=False so the
      caller can say so honestly instead of repeating the earlier bug
      (silently returning English while claiming it matched the request).
    """
    if language in ("en", "hi", "ta"):
        return doc_text(doc, language), True

    base_text = doc_text(doc, "en")
    if IS_BHASHINI_CONFIGURED:
        try:
            return bhashini.translate(base_text, "en", language), True
        except bhashini.BhashiniError:
            pass
    return base_text, False


@router.get("/api/llm/check")
def llm_check():
    """Debug helper: makes one tiny LLM call and reports the real result/error."""
    try:
        return {"ok": True, "model": _working_model or OPENROUTER_MODEL, "reply": _generate("Reply with the single word: ok")}
    except LLMError as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")


@router.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest, request: Request):
    lang = _effective_language(req.message, req.language)  # answer in the language the user wrote in

    # --- 1. FAISS/RAG search. Relevance = FAISS similarity score vs. threshold
    # ONLY. No LLM decides whether a chunk is relevant. Greetings skip RAG. ---
    chunks = None  # None = no LLM configured -> old built-in demo path below
    if IS_LLM_CONFIGURED:
        found = []
        if not _is_greeting(req.message):
            try:
                found = rag_retriever.retrieve(req.message, top_k=3)
            except rag_retriever.RagUnavailableError as e:
                logger.warning("[CHAT] RAG unavailable (%s) -> treating as no relevant PDF", e)
            except Exception:
                logger.exception("[CHAT] RAG retrieval crashed -> treating as no relevant PDF")
        chunks = [c for c in found if c.get("score", 0) >= RAG_CHAT_THRESHOLD]
        logger.info(
            "[CHAT] lang=%s(ui=%s) | FAISS top scores=%s | threshold=%.2f -> relevant chunks: %d | query=%r",
            lang, req.language,
            [(c["page_number"], round(c.get("score", 0), 3)) for c in found],
            RAG_CHAT_THRESHOLD, len(chunks), req.message[:80],
        )

    if chunks is not None:
        try:
            if chunks:
                logger.info("[CHAT] relevant PDF content -> sending query + PDF text to OpenRouter")
                try:
                    answer_text, idx = _call_llm_rag(req.message, lang, chunks)
                except LLMError as e:
                    # Don't fail the user just because the grounded call failed:
                    # fall through to the general flow (no citation) and retry there.
                    logger.error("[CHAT] RAG LLM call failed (%s) -> trying general flow", e)
                    answer_text, idx = None, None
                if answer_text:
                    answer_text = _limit_words(_ensure_language(answer_text, lang), 80)
                    used = chunks[idx]
                    # Citation = exact metadata of the excerpt the answer came from.
                    cite = Citation(pdfName=used["pdf_name"], pageNumber=int(used["page_number"]))
                    return ChatResponse(
                        answer=answer_text,
                        source=f"{cite.pdfName}, Page {cite.pageNumber}",
                        officialLink=_pdf_url(request, cite.pdfName, cite.pageNumber),
                        lastUpdated=None,
                        mode="live",
                        inRequestedLanguage=True,
                        citations=[cite],
                    )
                logger.info("[CHAT] PDF text not used -> general flow")

            # No relevant PDF (or PDF lacks the answer): query only -> LLM. No citation.
            logger.info("[CHAT] -> sending query only to OpenRouter (no citation)")
            general = _call_llm_general(req.message, lang)
            return ChatResponse(
                answer=general, source=None, officialLink=None, lastUpdated=None,
                mode="live", inRequestedLanguage=True, citations=[],
            )
        except LLMError as e:
            # Real error goes to the log; the user gets a calm, non-technical reply.
            logger.error("[CHAT] LLM unavailable after all retries: %s", e)
            fallback = None if isinstance(e, LLMQuotaExhausted) else _last_resort_answer(req.message, lang)
            if fallback:
                return ChatResponse(
                    answer=fallback, source=None, officialLink=None, lastUpdated=None,
                    mode="live", inRequestedLanguage=True, citations=[],
                )
            return ChatResponse(
                answer="I'm having trouble getting an answer right now. Please try again in a moment.",
                source=None, officialLink=None, lastUpdated=None,
                mode="live", inRequestedLanguage=True, citations=[],
            )

    # --- 2. Fall back to the small built-in demo knowledge base (unchanged behavior) ---
    docs = retrieve(req.message, top_k=2)
    top = docs[0] if docs else None

    if IS_LLM_CONFIGURED:
        answer_text = _call_llm_demo(req.message, req.language, docs)
        if answer_text:
            return ChatResponse(
                answer=answer_text,
                source=top["source"] if top else None,
                officialLink=top["official_link"] if top else None,
                lastUpdated=top["last_updated"] if top else None,
                mode="live",
                inRequestedLanguage=True,  # the model was explicitly asked to reply in this language
            )
        # LLM call failed even though configured — fall through to demo
        # behavior below rather than returning an error, so the user still
        # gets a grounded answer if one exists.

    if top:
        answer_text, in_requested_language = _demo_answer(top, req.language)
        return ChatResponse(
            answer=answer_text,
            source=top["source"],
            officialLink=top["official_link"],
            lastUpdated=top["last_updated"],
            mode="demo",
            inRequestedLanguage=in_requested_language,
        )

    return ChatResponse(
        answer=None, source=None, officialLink=None, lastUpdated=None,
        mode="demo", inRequestedLanguage=True,
    )


# --- Startup warm-up (background) ------------------------------------------
# The frontend gives /api/chat only ~6s. The first request would otherwise pay
# for loading the embedding model AND discovering a working model name.
# Doing both once at startup keeps the first answer fast, and prints the real
# LLM status/error in the uvicorn console so problems are visible at once.
def _warmup():
    if not IS_LLM_CONFIGURED:
        logger.error("[LLM] No usable API key in backend/.env (OPENROUTER_API_KEY=sk-or-...) — chat cannot answer.")
    else:
        try:
            _generate("Reply with the single word: ok")
            logger.info("[LLM] ready, using model '%s'", _working_model)
        except Exception as e:
            logger.error("[LLM] NOT working: %s", e)


def _warm_rag():
    try:
        rag_retriever.retrieve("warm up", top_k=1)
        logger.info("[RAG] warmed up")
    except Exception as e:
        logger.warning("[RAG] warm-up skipped: %s", e)


import threading as _threading

_threading.Thread(target=_warm_rag, daemon=True, name="mitra-rag-warm").start()

_threading.Thread(target=_warmup, daemon=True, name="mitra-warmup").start()