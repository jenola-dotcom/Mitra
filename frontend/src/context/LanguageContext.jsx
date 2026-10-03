import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { translations } from '../i18n/translations'
import { SCHEDULED_LANGUAGES, FULL_UI_LANGUAGES } from '../constants/languages'
import { getLanguageSupport } from '../lib/bhashiniApi'

const LanguageContext = createContext(null)
const STORAGE_KEY = 'coopconnect_lang'

// Full list of 23 (22 scheduled + English), same shape the old 3-language
// LANGUAGES export used, so LanguageSwitcher.jsx and anything else reading
// `languages` from context doesn't need to change its expectations.
const ALL_LANGUAGES = SCHEDULED_LANGUAGES.map((l) => ({
  code: l.code,
  label: l.enName,
  nativeLabel: l.nativeName,
  fullUi: FULL_UI_LANGUAGES.includes(l.code),
}))

function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj)
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'en'
  })

  // Live per-language ASR/translation/TTS support from Bhashini (see
  // backend/app/bhashini.py) — fetched once, not assumed. Starts as "we
  // don't know yet" (available: false) so nothing claims support before
  // the check comes back; components should treat a still-loading check
  // the same as "not supported" rather than blocking on it.
  const [languageSupport, setLanguageSupport] = useState({ available: false, languages: {} })

  useEffect(() => {
    getLanguageSupport().then(setLanguageSupport)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const setLanguage = useCallback((code) => {
    setLanguageState(code)
    localStorage.setItem(STORAGE_KEY, code)
  }, [])

  const t = useCallback(
    (key) => {
      const value = getByPath(translations[language], key)
      if (value !== undefined) return value
      // Fall back to English rather than showing a raw key. This is also
      // what happens today for every one of the 19 scheduled languages
      // that don't have a full UI dictionary yet (see FULL_UI_LANGUAGES in
      // constants/languages.js) — deliberate, not a bug: interface chrome
      // stays in English for those until real translations are reviewed
      // and added, while the chatbot and voice features still localize.
      const fallback = getByPath(translations.en, key)
      return fallback !== undefined ? fallback : key
    },
    [language]
  )

  /** Per-task support for the currently selected language, defaulting to
   * false (not "true until proven otherwise") while the check is pending
   * or if Bhashini isn't configured. */
  const currentSupport = languageSupport.languages?.[language] || {
    asr: false, translation: false, tts: false,
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      languages: ALL_LANGUAGES,
      languageSupport,      // { available, languages: { code: {asr,translation,tts} } }
      currentSupport,       // shortcut for the active language
      isFullUiLanguage: FULL_UI_LANGUAGES.includes(language),
    }),
    [language, setLanguage, t, languageSupport, currentSupport]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}