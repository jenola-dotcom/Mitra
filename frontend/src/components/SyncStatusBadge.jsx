import { useLanguage } from '../context/LanguageContext'

export default function SyncStatusBadge({ grievance }) {
  const { t } = useLanguage()
  if (!grievance) return null

  if (grievance.syncStatus === 'local') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-soil-100 px-2 py-0.5 text-[11px] font-medium text-soil-700">
        <DotIcon className="text-soil-500" />
        {t('sync.local')}
      </span>
    )
  }

  if (grievance.syncStatus === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sun-400/15 px-2 py-0.5 text-[11px] font-medium text-sun-500">
        <DotIcon className="animate-pulse text-sun-500" />
        {t('sync.pending')}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-leaf-100 px-2 py-0.5 text-[11px] font-medium text-leaf-700">
      <DotIcon className="text-leaf-600" />
      {t('sync.synced')}
    </span>
  )
}

function DotIcon({ className }) {
  return <span className={`h-1.5 w-1.5 rounded-full bg-current ${className}`} />
}
