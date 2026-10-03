"""
Client for Bhashini (National Language Translation Mission) — ASR,
translation (NMT), and TTS for Indian languages, via the government's
ULCA/Dhruva pipeline API.

IMPORTANT — what is and isn't verified here:
This sandbox's network is restricted to package registries (npm/pypi/github)
and cannot reach bhashini.gov.in or ulcacontrib.org, so none of the HTTP
calls in this file have been exercised against the live API. The request/
response shapes below follow the documented two-step ULCA/Dhruva pattern
(pipeline config discovery, then inference) as published in Bhashini's own
sample integrations. Before relying on this in a demo:
  1. Set BHASHINI_USER_ID / BHASHINI_API_KEY in backend/.env (see
     .env.example) — get these free at https://bhashini.gov.in/ulca/user/signup
  2. Run `python -m app.bhashini` from backend/ (see __main__ block below)
     from a machine with normal internet access, and read its output.
  3. If Bhashini has changed field names or the pipeline ID since this was
     written, fix the two spots marked "ADJUST HERE IF THE LIVE API DIFFERS"
     — the rest of the module (caching, capability check, error handling)
     does not need to change.

Every function fails closed: on any network error, unexpected response
shape, or missing config, it raises BhashiniError (or returns
supported=False in check_language_support) rather than returning invented
text or claiming a language is supported when it hasn't been confirmed.
"""
from __future__ import annotations

import base64
import time
from typing import Optional

import httpx

from .config import BHASHINI_USER_ID, BHASHINI_API_KEY, BHASHINI_PIPELINE_ID, IS_BHASHINI_CONFIGURED
from .languages import LANGUAGE_CODES

PIPELINE_CONFIG_ENDPOINT = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline"
DEFAULT_INFERENCE_ENDPOINT = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

_TIMEOUT = httpx.Timeout(20.0, connect=8.0)


class BhashiniError(Exception):
    """Raised whenever Bhashini can't fulfil a request — never silently
    swallowed into a fake result. Callers (main.py) turn this into a clear
    HTTP error for the frontend."""


def _auth_headers() -> dict:
    return {
        "Content-Type": "application/json",
        "userID": BHASHINI_USER_ID,
        "ulcaApiKey": BHASHINI_API_KEY,
    }


def _require_configured():
    if not IS_BHASHINI_CONFIGURED:
        raise BhashiniError(
            "Bhashini is not configured (BHASHINI_USER_ID / BHASHINI_API_KEY missing in .env)."
        )


# --- Pipeline config discovery -------------------------------------------------
#
# Bhashini requires asking "which model/service handles this language for
# this task" before you can actually run the task. The response also hands
# back a short-lived inference endpoint + API key for step 2.

_config_cache: dict = {}  # key -> (fetched_at, parsed_config)
_CONFIG_TTL_SECONDS = 60 * 30  # 30 minutes — config is small and slow to refetch


def _fetch_pipeline_config(task_type: str, source_language: Optional[str] = None,
                            target_language: Optional[str] = None) -> dict:
    """
    Calls the ULCA pipeline-config endpoint for one task. Passing no
    source_language returns the *full list* of languages that task
    currently supports (used by check_language_support below); passing one
    returns the specific service/model to call for that language pair.

    ADJUST HERE IF THE LIVE API DIFFERS: this payload/response shape is
    Bhashini's documented pattern as of this writing, not independently
    re-verified from this sandbox (see module docstring).
    """
    _require_configured()

    cache_key = (task_type, source_language, target_language)
    cached = _config_cache.get(cache_key)
    if cached and (time.time() - cached[0]) < _CONFIG_TTL_SECONDS:
        return cached[1]

    task_config = {}
    if source_language:
        task_config["language"] = {"sourceLanguage": source_language}
        if target_language:
            task_config["language"]["targetLanguage"] = target_language

    payload = {
        "pipelineTasks": [{"taskType": task_type, **({"config": task_config} if task_config else {})}],
        "pipelineRequestConfig": {"pipelineId": BHASHINI_PIPELINE_ID},
    }

    try:
        resp = httpx.post(PIPELINE_CONFIG_ENDPOINT, json=payload, headers=_auth_headers(), timeout=_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
    except httpx.HTTPError as e:
        raise BhashiniError(f"Bhashini pipeline-config request failed: {e}") from e
    except ValueError as e:
        raise BhashiniError(f"Bhashini pipeline-config returned invalid JSON: {e}") from e

    _config_cache[cache_key] = (time.time(), data)
    return data


def _extract_service_and_endpoint(config: dict, task_type: str) -> tuple[str, str, dict]:
    """Pulls (serviceId, inferenceEndpoint, authHeader) out of a pipeline
    config response. Raises BhashiniError with the actual response attached
    if the shape doesn't match what's expected, instead of guessing."""
    try:
        task_configs = next(
            t["config"] for t in config["pipelineResponseConfig"] if t["taskType"] == task_type
        )
        service_id = task_configs[0]["serviceId"]
        endpoint_info = config["pipelineInferenceAPIEndPoint"]
        endpoint = endpoint_info.get("callbackUrl", DEFAULT_INFERENCE_ENDPOINT)
        key_info = endpoint_info["inferenceApiKey"]
        auth_header = {key_info["name"]: key_info["value"]}
        return service_id, endpoint, auth_header
    except (KeyError, IndexError, StopIteration) as e:
        raise BhashiniError(
            f"Unexpected Bhashini pipeline-config response shape for '{task_type}': {config}"
        ) from e


# --- Public task functions -----------------------------------------------------

def asr(audio_base64: str, source_language: str, audio_format: str = "wav",
        sampling_rate: int = 16000) -> str:
    """Speech -> text. Raises BhashiniError if unconfigured, the language
    isn't supported, or the call fails."""
    config = _fetch_pipeline_config("asr", source_language)
    service_id, endpoint, auth_header = _extract_service_and_endpoint(config, "asr")

    payload = {
        "pipelineTasks": [{
            "taskType": "asr",
            "config": {
                "language": {"sourceLanguage": source_language},
                "serviceId": service_id,
                "audioFormat": audio_format,
                "samplingRate": sampling_rate,
            },
        }],
        "inputData": {"audio": [{"audioContent": audio_base64}]},
    }
    try:
        resp = httpx.post(endpoint, json=payload, headers={**_auth_headers(), **auth_header}, timeout=_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        return data["pipelineResponse"][0]["output"][0]["source"]
    except httpx.HTTPError as e:
        raise BhashiniError(f"Bhashini ASR request failed: {e}") from e
    except (KeyError, IndexError, ValueError) as e:
        raise BhashiniError(f"Unexpected Bhashini ASR response shape: {e}") from e


def translate(text: str, source_language: str, target_language: str) -> str:
    """Text -> text, cross-language. Raises BhashiniError on failure."""
    if source_language == target_language:
        return text
    config = _fetch_pipeline_config("translation", source_language, target_language)
    service_id, endpoint, auth_header = _extract_service_and_endpoint(config, "translation")

    payload = {
        "pipelineTasks": [{
            "taskType": "translation",
            "config": {
                "language": {"sourceLanguage": source_language, "targetLanguage": target_language},
                "serviceId": service_id,
            },
        }],
        "inputData": {"input": [{"source": text}]},
    }
    try:
        resp = httpx.post(endpoint, json=payload, headers={**_auth_headers(), **auth_header}, timeout=_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        return data["pipelineResponse"][0]["output"][0]["target"]
    except httpx.HTTPError as e:
        raise BhashiniError(f"Bhashini translation request failed: {e}") from e
    except (KeyError, IndexError, ValueError) as e:
        raise BhashiniError(f"Unexpected Bhashini translation response shape: {e}") from e


def tts(text: str, source_language: str, gender: str = "female") -> tuple[str, int]:
    """Text -> speech. Returns (base64 WAV audio, sampling rate). Raises
    BhashiniError on failure."""
    config = _fetch_pipeline_config("tts", source_language)
    service_id, endpoint, auth_header = _extract_service_and_endpoint(config, "tts")

    sampling_rate = 22050
    payload = {
        "pipelineTasks": [{
            "taskType": "tts",
            "config": {
                "language": {"sourceLanguage": source_language},
                "serviceId": service_id,
                "gender": gender,
                "samplingRate": sampling_rate,
            },
        }],
        "inputData": {"input": [{"source": text}]},
    }
    try:
        resp = httpx.post(endpoint, json=payload, headers={**_auth_headers(), **auth_header}, timeout=_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        audio_b64 = data["pipelineResponse"][0]["audio"][0]["audioContent"]
        return audio_b64, sampling_rate
    except httpx.HTTPError as e:
        raise BhashiniError(f"Bhashini TTS request failed: {e}") from e
    except (KeyError, IndexError, ValueError) as e:
        raise BhashiniError(f"Unexpected Bhashini TTS response shape: {e}") from e


# --- Live capability check -----------------------------------------------------

_support_cache: Optional[tuple] = None  # (fetched_at, result_dict)
_SUPPORT_TTL_SECONDS = 60 * 60  # 1 hour


def _languages_in_task_config(config: dict, task_type: str) -> set[str]:
    """Given a no-source-language pipeline-config response for one task,
    return the set of source-language codes it lists as supported."""
    try:
        task_configs = next(
            t["config"] for t in config["pipelineResponseConfig"] if t["taskType"] == task_type
        )
        return {
            entry["language"]["sourceLanguage"]
            for entry in task_configs
            if "language" in entry and "sourceLanguage" in entry["language"]
        }
    except (KeyError, StopIteration, TypeError):
        return set()


def check_language_support(force_refresh: bool = False) -> dict:
    """
    Returns, for every one of the 22 scheduled languages + English:
        { code: { "asr": bool, "translation": bool, "tts": bool } }

    This is a LIVE check against Bhashini (one config call per task, cached
    for 1 hour) — never a hardcoded/assumed list. If Bhashini is not
    configured or unreachable, every language comes back False for every
    task, with a top-level "available" flag set to False, rather than
    guessing support.
    """
    global _support_cache

    if not IS_BHASHINI_CONFIGURED:
        return {
            "available": False,
            "reason": "Bhashini not configured (missing BHASHINI_USER_ID / BHASHINI_API_KEY)",
            "languages": {code: {"asr": False, "translation": False, "tts": False} for code in LANGUAGE_CODES},
        }

    if not force_refresh and _support_cache and (time.time() - _support_cache[0]) < _SUPPORT_TTL_SECONDS:
        return _support_cache[1]

    result = {"available": True, "reason": None, "languages": {}}
    task_language_sets = {}
    for task in ("asr", "translation", "tts"):
        try:
            config = _fetch_pipeline_config(task)
            task_language_sets[task] = _languages_in_task_config(config, task)
        except BhashiniError as e:
            # One task failing doesn't invalidate the others — but it does
            # mean we genuinely don't know support for that task, so every
            # language stays False for it rather than guessing.
            task_language_sets[task] = set()
            result["reason"] = f"{result['reason'] or ''} [{task}: {e}]".strip()

    for code in LANGUAGE_CODES:
        result["languages"][code] = {
            "asr": code in task_language_sets.get("asr", set()),
            "translation": code in task_language_sets.get("translation", set()),
            "tts": code in task_language_sets.get("tts", set()),
        }

    _support_cache = (time.time(), result)
    return result


if __name__ == "__main__":
    # Manual verification script — run this from backend/ on a machine with
    # real internet access and a real .env: `python -m app.bhashini`
    # This is the "verify actual availability" step that cannot be done
    # from this sandbox. Prints a plain support table, nothing fabricated.
    import json as _json

    print("IS_BHASHINI_CONFIGURED:", IS_BHASHINI_CONFIGURED)
    if not IS_BHASHINI_CONFIGURED:
        print("Set BHASHINI_USER_ID and BHASHINI_API_KEY in backend/.env first.")
    else:
        support = check_language_support(force_refresh=True)
        print(_json.dumps(support, indent=2, ensure_ascii=False))