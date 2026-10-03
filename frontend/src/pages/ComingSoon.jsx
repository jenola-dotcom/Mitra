import { useLanguage } from '../context/LanguageContext'

export default function ComingSoon({ title, part }) {
  const { t } = useLanguage()
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sun-400/20 text-sun-500">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z" />
        </svg>
      </div>
      <h2 className="font-display text-xl font-semibold text-soil-900">{title}</h2>
      <p className="max-w-sm text-sm text-soil-700/80">
        {t('dashboards.comingInPart')}
        {part ? ` (${part})` : ''}
      </p>
    </div>
  )
}
