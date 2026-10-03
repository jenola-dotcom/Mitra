from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from .config import CORS_ORIGINS, IS_GEMINI_CONFIGURED, IS_BHASHINI_CONFIGURED
from .chat import router as chat_router
from .languages import SCHEDULED_LANGUAGES, PRIORITY_LANGUAGES
from . import bhashini
from .rag import retriever as rag_retriever

app = FastAPI(title="Mitra API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "gemini_configured": IS_GEMINI_CONFIGURED,
        "bhashini_configured": IS_BHASHINI_CONFIGURED,
        # True only if build_index.py has actually been run and produced a
        # non-empty index — never true just because the RAG code exists.
        "rag_ready": rag_retriever.is_ready(),
    }


@app.get("/api/languages")
def list_languages():
    """The 13 languages currently offered in the selector (English + 12
    scheduled languages — see PRIORITY_LANGUAGE_CODES in languages.py).
    Pure data — does NOT imply Bhashini support; pair with
    /api/languages/support for that."""
    return {"languages": PRIORITY_LANGUAGES}


@app.get("/api/languages/support")
def language_support():
    """
    Live-checked ASR/translation/TTS support per language, straight from
    Bhashini (cached ~1 hour) — never a hardcoded guess. If Bhashini isn't
    configured or is unreachable, every language reports unsupported and
    `available: false`, so the frontend can show that honestly instead of
    claiming coverage that hasn't been confirmed.
    """
    return bhashini.check_language_support()


class TranslateRequest(BaseModel):
    text: str
    sourceLanguage: str = "en"
    targetLanguage: str


@app.post("/api/translate")
def translate_text(req: TranslateRequest):
    if not IS_BHASHINI_CONFIGURED:
        raise HTTPException(status_code=503, detail="Bhashini is not configured on this server.")
    try:
        translated = bhashini.translate(req.text, req.sourceLanguage, req.targetLanguage)
        return {"text": translated, "translated": True}
    except bhashini.BhashiniError as e:
        raise HTTPException(status_code=502, detail=str(e))


class AsrRequest(BaseModel):
    audioBase64: str
    language: str
    audioFormat: str = "wav"
    samplingRate: int = 16000


@app.post("/api/speech/asr")
def speech_to_text(req: AsrRequest):
    if not IS_BHASHINI_CONFIGURED:
        raise HTTPException(status_code=503, detail="Bhashini is not configured on this server.")
    try:
        text = bhashini.asr(req.audioBase64, req.language, req.audioFormat, req.samplingRate)
        return {"text": text}
    except bhashini.BhashiniError as e:
        raise HTTPException(status_code=502, detail=str(e))


class TtsRequest(BaseModel):
    text: str
    language: str
    gender: str = "female"


@app.post("/api/speech/tts")
def text_to_speech(req: TtsRequest):
    if not IS_BHASHINI_CONFIGURED:
        raise HTTPException(status_code=503, detail="Bhashini is not configured on this server.")
    try:
        audio_base64, sampling_rate = bhashini.tts(req.text, req.language, req.gender)
        return {"audioBase64": audio_base64, "samplingRate": sampling_rate, "format": "wav"}
    except bhashini.BhashiniError as e:
        raise HTTPException(status_code=502, detail=str(e))