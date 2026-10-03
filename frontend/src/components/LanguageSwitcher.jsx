import { useLanguage } from '../context/LanguageContext'

export default function LanguageSwitcher({ compact = false }) {
  const { language, setLanguage, languages, languageSupport } = useLanguage()

  const fullUi = languages.filter((l) => l.fullUi)
  const others = languages.filter((l) => !l.fullUi)

  // Suffix built only from the live Bhashini check — never assumed. Blank
  // if the check hasn't returned yet or Bhashini isn't configured, so we
  // never show a checkmark for something unverified.
  const suffixFor = (code) => {
    const support = languageSupport.languages?.[code]
    if (!support) return ''
    const bits = []
    if (support.asr) bits.push('🎤')
    if (support.tts) bits.push('🔊')
    if (support.translation) bits.push('🌐')
    return bits.length ? ` (${bits.join('')})` : ''
  }

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Choose language</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className={
          compact
            ? 'appearance-none rounded-lg border border-soil-200 bg-white pl-2.5 pr-6 py-1 text-sm font-semibold text-soil-800 shadow-sm cursor-pointer focus:outline-none'
            : 'appearance-none rounded-xl border border-soil-200 bg-white pl-3 pr-8 py-2 text-sm font-medium text-soil-800 cursor-pointer focus:border-leaf-500 focus:ring-1 focus:ring-leaf-500 outline-none'
        }
      >
        <optgroup label="Full interface">
          {fullUi.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.nativeLabel}</option>
          ))}
        </optgroup>
        <optgroup label="Chatbot &amp; voice only (interface stays in English)">
          {others.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeLabel}{suffixFor(lang.code)}
            </option>
          ))}
        </optgroup>
      </select>
      <svg
        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-4 w-4 text-soil-700/60"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </label>
  )
}