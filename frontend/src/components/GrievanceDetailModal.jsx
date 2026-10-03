import { useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { GRIEVANCE_CATEGORIES } from '../constants/grievance'
import StatusBadge from './StatusBadge'
import GrievanceTimeline from './GrievanceTimeline'
import SyncStatusBadge from './SyncStatusBadge'

export default function GrievanceDetailModal({ grievance, onClose, children }) {
  const { t, language } = useLanguage()

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!grievance) return null

  const categoryLabel = t(
    GRIEVANCE_CATEGORIES.find((c) => c.value === grievance.category)?.labelKey || 'grievance.categoryOther'
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-soil-900/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-xl2 bg-white shadow-soft sm:rounded-xl2">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-soil-100 bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold text-soil-800">{grievance.referenceId}</span>
              <StatusBadge status={grievance.status} />
              <SyncStatusBadge grievance={grievance} />
            </div>
            <h3 className="mt-1 font-display text-lg font-semibold text-soil-900">{categoryLabel}</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-soil-700 hover:bg-soil-100" aria-label={t('grievance.close')}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-soil-700/60">{t('grievance.filedBy')}</dt>
              <dd className="font-medium text-soil-900">{grievance.farmerName}</dd>
            </div>
            <div>
              <dt className="text-soil-700/60">{t('grievance.district')}</dt>
              <dd className="font-medium text-soil-900">{grievance.district}</dd>
            </div>
            <div>
              <dt className="text-soil-700/60">{t('grievance.cooperativeSociety')}</dt>
              <dd className="font-medium text-soil-900">{grievance.cooperativeSociety || '—'}</dd>
            </div>
            <div>
              <dt className="text-soil-700/60">{t('grievance.assignedTo')}</dt>
              <dd className="font-medium text-soil-900">{grievance.assignedOfficialName || t('grievance.unassigned')}</dd>
            </div>
            <div>
              <dt className="text-soil-700/60">{t('grievance.filedOn')}</dt>
              <dd className="font-medium text-soil-900">
                {new Date(grievance.createdAt).toLocaleString(language === 'en' ? 'en-IN' : language, { dateStyle: 'medium', timeStyle: 'short' })}
              </dd>
            </div>
            <div>
              <dt className="text-soil-700/60">{t('grievance.lastUpdated')}</dt>
              <dd className="font-medium text-soil-900">
                {new Date(grievance.updatedAt).toLocaleString(language === 'en' ? 'en-IN' : language, { dateStyle: 'medium', timeStyle: 'short' })}
              </dd>
            </div>
          </dl>

          <div>
            <dt className="text-sm text-soil-700/60">{t('grievance.description')}</dt>
            <p className="mt-1 whitespace-pre-wrap rounded-xl bg-soil-50 p-3.5 text-sm text-soil-900">{grievance.description}</p>
          </div>

          {grievance.attachmentDataUrl && (
            <div>
              <dt className="text-sm text-soil-700/60">{t('grievance.attachment')}</dt>
              {grievance.attachmentDataUrl.startsWith('data:image') ? (
                <img src={grievance.attachmentDataUrl} alt={grievance.attachmentName || 'attachment'} className="mt-1.5 max-h-48 rounded-xl border border-soil-100 object-contain" />
              ) : (
                <a href={grievance.attachmentDataUrl} download={grievance.attachmentName} className="mt-1.5 inline-block text-sm font-medium text-leaf-600 hover:text-leaf-700">
                  {grievance.attachmentName || 'Download attachment'}
                </a>
              )}
            </div>
          )}

          {children && <div className="border-t border-soil-100 pt-5">{children}</div>}

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-soil-900">{t('grievance.timeline')}</h4>
            <GrievanceTimeline history={grievance.statusHistory} />
          </div>
        </div>
      </div>
    </div>
  )
}
