// The 13 languages currently offered in CoopConnect's language selector:
// English + 12 scheduled languages, matching backend/app/languages.py's
// PRIORITY_LANGUAGE_CODES exactly (codes must match — they're sent
// straight to /api/chat, /api/translate, /api/speech/*).
//
// This is a curated subset of India's 22 scheduled languages, not the full
// list — a deliberate product decision to launch with fewer, better-tested
// languages rather than all 22 at partial quality. Backend/app/languages.py
// still has the full 22-language data if that's revisited later.
//
// This list only says which languages are OFFERED. It is NOT a claim that
// any given language is supported for translation/voice yet — that comes
// live from GET /api/languages/support (see LanguageContext.jsx).

export const SCHEDULED_LANGUAGES = [
  { code: 'en', enName: 'English', nativeName: 'English', scheduled: false },
  { code: 'as', enName: 'Assamese', nativeName: 'অসমীয়া', scheduled: true },
  { code: 'bn', enName: 'Bengali', nativeName: 'বাংলা', scheduled: true },
  { code: 'gu', enName: 'Gujarati', nativeName: 'ગુજરાતી', scheduled: true },
  { code: 'hi', enName: 'Hindi', nativeName: 'हिन्दी', scheduled: true },
  { code: 'kn', enName: 'Kannada', nativeName: 'ಕನ್ನಡ', scheduled: true },
  { code: 'ml', enName: 'Malayalam', nativeName: 'മലയാളം', scheduled: true },
  { code: 'mr', enName: 'Marathi', nativeName: 'मराठी', scheduled: true },
  { code: 'or', enName: 'Odia', nativeName: 'ଓଡ଼ିଆ', scheduled: true },
  { code: 'pa', enName: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', scheduled: true },
  { code: 'ta', enName: 'Tamil', nativeName: 'தமிழ்', scheduled: true },
  { code: 'te', enName: 'Telugu', nativeName: 'తెలుగు', scheduled: true },
  { code: 'ur', enName: 'Urdu', nativeName: 'اردو', scheduled: true },
]

if (SCHEDULED_LANGUAGES.length !== 13) {
  console.error('Expected exactly 13 languages (English + 12 scheduled)')
}

// Languages with a full, hand-written UI translation in i18n/translations.js.
// Everything outside this set uses English UI chrome (labels, buttons) —
// only the chatbot (via Gemini) and voice/translation (via Bhashini, where
// supported) localize for them. This is a deliberate, honest scope limit,
// not an oversight: machine-translating hundreds of UI strings for 10
// languages without review risks silently wrong legal/financial wording.
export const FULL_UI_LANGUAGES = ['en', 'hi', 'ta']