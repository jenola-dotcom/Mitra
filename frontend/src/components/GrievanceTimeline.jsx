import { useLanguage } from '../context/LanguageContext'
import StatusBadge from './StatusBadge'

export default function GrievanceTimeline({ history }) {
  const { language } = useLanguage()
  const sorted = [...(history || [])].sort((a, b) => new Date(a.at) - new Date(b.at))

  return (
    <ol className="space-y-4">
      {sorted.map((entry, i) => (
        <li key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-leaf-600 mt-1.5" />
            {i < sorted.length - 1 && <span className="w-px flex-1 bg-soil-200" />}
          </div>
          <div className="pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={entry.status} />
              <span className="text-xs text-soil-700/70">
                {new Date(entry.at).toLocaleString(language === 'en' ? 'en-IN' : language, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
            {entry.note && <p className="mt-1.5 text-sm text-soil-800">{entry.note}</p>}
            <p className="mt-1 text-xs text-soil-700/60 capitalize">
              {entry.byName} · {entry.byRole}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
