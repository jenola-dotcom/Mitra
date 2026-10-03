import { statusMeta } from '../constants/grievance'
import { useLanguage } from '../context/LanguageContext'

const ACCENTS = {
  leaf: 'bg-leaf-100 text-leaf-700 border-[#B7DDD7]',
  clay: 'bg-clay-100 text-clay-600 border-[#D5EE9C]',
  sky: 'bg-sky-50 text-sky-600 border-[#B7DDD7]',
  sun: 'bg-sun-100 text-sun-500 border-[#D5EE9C]',
  alert: 'bg-alert-50 text-alert-600 border-alert-500/20',
}

export default function StatusBadge({ status }) {
  const { t } = useLanguage()
  const meta = statusMeta(status)
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ACCENTS[meta.accent]}`}>
      {t(meta.labelKey)}
    </span>
  )
}
