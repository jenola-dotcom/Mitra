"""
Configuration for the CoopConnect backend.

Every secret comes from an environment variable — nothing is hardcoded here,
and nothing here is ever sent to the frontend. Copy .env.example to .env and
fill in GEMINI_API_KEY to enable live Gemini responses; without it, the
/api/chat endpoint runs in "demo" mode (returns retrieval-grounded answers
from the local knowledge base only, clearly labeled, never inventing).
"""
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

# --- Bhashini (National Language Translation Mission) ---
# Free government API for Indic-language ASR / translation / TTS. Sign up at
# https://bhashini.gov.in/ulca/user/signup to get BHASHINI_USER_ID and
# BHASHINI_API_KEY (the "ulcaApiKey"). Both blank = every Bhashini-backed
# feature is disabled cleanly (see bhashini.py) rather than failing or
# faking a result.
#
# BHASHINI_PIPELINE_ID defaults to a pipeline ID observed in public
# Bhashini/ULCA sample code as of this writing. This sandbox cannot reach
# bhashini.gov.in to confirm it's still current — verify it against the
# Bhashini developer portal / Postman collection on your own machine before
# relying on it, and override via env var if it has changed.
BHASHINI_USER_ID = os.getenv("BHASHINI_USER_ID", "").strip()
BHASHINI_API_KEY = os.getenv("BHASHINI_API_KEY", "").strip()
BHASHINI_PIPELINE_ID = os.getenv("BHASHINI_PIPELINE_ID", "64392f96daac500b55c543cd").strip()
IS_BHASHINI_CONFIGURED = bool(BHASHINI_USER_ID and BHASHINI_API_KEY)

# Comma-separated list of origins allowed to call this API (your frontend's
# dev/prod URL). Defaults cover the Vite dev server.
_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", _default_origins).split(",") if o.strip()]

IS_GEMINI_CONFIGURED = bool(GEMINI_API_KEY)