"""
The 22 languages listed in the Eighth Schedule of the Indian Constitution,
plus English as the interface default/source language.

This list is just data (which languages exist and their codes) — it is NOT
a claim that Bhashini supports all of them for every task. Actual per-task,
per-language support is checked live against Bhashini in bhashini.py /
GET /api/languages/support, and only that live check is used to decide what
the frontend offers, never this static list by itself.

Codes follow the ISO 639 codes used across the AI4Bharat / IndicNLP
ecosystem, which Bhashini's models are built on. A few languages have more
than one script in real use (e.g. Kashmiri, Sindhi, Santali) — the native
name below is the most common default; this should be treated as a
reasonable default, not a verified-correct claim for every dialect/region.
"""

SCHEDULED_LANGUAGES = [
    {"code": "en", "en_name": "English", "native_name": "English", "scheduled": False},
    {"code": "as", "en_name": "Assamese", "native_name": "অসমীয়া", "scheduled": True},
    {"code": "bn", "en_name": "Bengali", "native_name": "বাংলা", "scheduled": True},
    {"code": "brx", "en_name": "Bodo", "native_name": "बड़ो", "scheduled": True},
    {"code": "doi", "en_name": "Dogri", "native_name": "डोगरी", "scheduled": True},
    {"code": "gu", "en_name": "Gujarati", "native_name": "ગુજરાતી", "scheduled": True},
    {"code": "hi", "en_name": "Hindi", "native_name": "हिन्दी", "scheduled": True},
    {"code": "kn", "en_name": "Kannada", "native_name": "ಕನ್ನಡ", "scheduled": True},
    {"code": "ks", "en_name": "Kashmiri", "native_name": "کٲشُر", "scheduled": True},
    {"code": "kok", "en_name": "Konkani", "native_name": "कोंकणी", "scheduled": True},
    {"code": "mai", "en_name": "Maithili", "native_name": "मैथिली", "scheduled": True},
    {"code": "ml", "en_name": "Malayalam", "native_name": "മലയാളം", "scheduled": True},
    {"code": "mni", "en_name": "Manipuri (Meitei)", "native_name": "মৈতৈলোন্", "scheduled": True},
    {"code": "mr", "en_name": "Marathi", "native_name": "मराठी", "scheduled": True},
    {"code": "ne", "en_name": "Nepali", "native_name": "नेपाली", "scheduled": True},
    {"code": "or", "en_name": "Odia", "native_name": "ଓଡ଼ିଆ", "scheduled": True},
    {"code": "pa", "en_name": "Punjabi", "native_name": "ਪੰਜਾਬੀ", "scheduled": True},
    {"code": "sa", "en_name": "Sanskrit", "native_name": "संस्कृतम्", "scheduled": True},
    {"code": "sat", "en_name": "Santali", "native_name": "ᱥᱟᱱᱛᱟᱲᱤ", "scheduled": True},
    {"code": "sd", "en_name": "Sindhi", "native_name": "سنڌي", "scheduled": True},
    {"code": "ta", "en_name": "Tamil", "native_name": "தமிழ்", "scheduled": True},
    {"code": "te", "en_name": "Telugu", "native_name": "తెలుగు", "scheduled": True},
    {"code": "ur", "en_name": "Urdu", "native_name": "اردو", "scheduled": True},
]

assert sum(1 for l in SCHEDULED_LANGUAGES if l["scheduled"]) == 22, (
    "Expected exactly 22 scheduled languages (English is the 23rd, non-scheduled, entry)"
)

LANGUAGE_CODES = [l["code"] for l in SCHEDULED_LANGUAGES]
LANGUAGE_NAMES_EN = {l["code"]: l["en_name"] for l in SCHEDULED_LANGUAGES}

# The 13-language subset actually offered in the language selector, per the
# product decision to launch with a curated set rather than all 22 at once
# (each of these still goes through the same live Bhashini support check —
# this list only says which are OFFERED, not which are confirmed supported).
PRIORITY_LANGUAGE_CODES = ["en", "ta", "hi", "te", "kn", "ml", "bn", "mr", "gu", "pa", "or", "as", "ur"]
assert len(PRIORITY_LANGUAGE_CODES) == 13
assert all(code in LANGUAGE_CODES for code in PRIORITY_LANGUAGE_CODES)

PRIORITY_LANGUAGES = [l for l in SCHEDULED_LANGUAGES if l["code"] in PRIORITY_LANGUAGE_CODES]