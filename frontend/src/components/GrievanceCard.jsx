import { useLanguage } from '../context/LanguageContext'
import { GRIEVANCE_CATEGORIES } from '../constants/grievance'
import StatusBadge from './StatusBadge'
import SyncStatusBadge from './SyncStatusBadge'

export default function GrievanceCard({ grievance, onOpen, extra }) {
  const { t, language } = useLanguage()
  const categoryLabel = t(
    GRIEVANCE_CATEGORIES.find((c) => c.value === grievance.category)?.labelKey || 'grievance.categoryOther'
  )

  return (
    <button
      onClick={() => onOpen(grievance)}
      className="card flex w-full flex-col gap-2 p-4 text-left transition-shadow hover:shadow-soft sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold text-soil-700">{grievance.referenceId}</span>
          <StatusBadge status={grievance.status} />
          <SyncStatusBadge grievance={grievance} />
        </div>
        <p className="mt-1 truncate font-display text-base font-semibold text-soil-900">{categoryLabel}</p>
        <p className="mt-0.5 truncate text-sm text-soil-700/80">
          {grievance.cooperativeSociety || grievance.district} · {grievance.farmerName}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-xs text-soil-700/70">
        {extra}
        <span>
          {new Date(grievance.createdAt).toLocaleDateString(language === 'en' ? 'en-IN' : language, { dateStyle: 'medium' })}
        </span>
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-soil-700/50">
          <path d="M7.5 5 12.5 10 7.5 15" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  )
}
