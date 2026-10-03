import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useGrievances } from '../../context/GrievanceContext'
import GrievanceCard from '../../components/GrievanceCard'
import GrievanceDetailModal from '../../components/GrievanceDetailModal'
import GrievanceStatusForm from '../../components/GrievanceStatusForm'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function OfficialCases() {
  const { t } = useLanguage()
  const { assignedToMe, loading, syncError } = useGrievances()
  const [selectedId, setSelectedId] = useState(null)
  const selected = assignedToMe.find((g) => g.id === selectedId) || null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-soil-900">{t('nav.assignedCases')}</h1>
        <p className="mt-1 text-sm text-soil-700/80">{t('dashboards.officialSubtitle')}</p>
      </div>

      {syncError && (
        <div role="alert" className="rounded-xl bg-alert-50 px-3.5 py-2.5 text-sm text-alert-600">
          {t('common.syncError')}
        </div>
      )}

      {loading ? (
        <LoadingSpinner label={t('common.loading')} />
      ) : assignedToMe.length === 0 ? (
        <div className="card p-8 text-center text-sm text-soil-700/80">{t('grievance.noCasesAssigned')}</div>
      ) : (
        <div className="space-y-3">
          {assignedToMe.map((g) => (
            <GrievanceCard key={g.id} grievance={g} onOpen={(gr) => setSelectedId(gr.id)} />
          ))}
        </div>
      )}

      {selected && (
        <GrievanceDetailModal grievance={selected} onClose={() => setSelectedId(null)}>
          <GrievanceStatusForm grievance={selected} onSaved={() => {}} />
        </GrievanceDetailModal>
      )}
    </div>
  )
}