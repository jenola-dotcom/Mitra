import { useMemo, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useGrievances } from '../../context/GrievanceContext'
import GrievanceCard from '../../components/GrievanceCard'
import GrievanceDetailModal from '../../components/GrievanceDetailModal'
import GrievanceStatusForm from '../../components/GrievanceStatusForm'
import AssignOfficialForm from '../../components/AssignOfficialForm'
import LoadingSpinner from '../../components/LoadingSpinner'

const FILTERS = ['all', 'unassigned', 'escalated']

export default function AdminGrievances() {
  const { t } = useLanguage()
  const { grievances, loading, syncError } = useGrievances()
  const [selectedId, setSelectedId] = useState(null)
  const [filter, setFilter] = useState('all')
  const selected = grievances.find((g) => g.id === selectedId) || null

  const filtered = useMemo(() => {
    if (filter === 'unassigned') return grievances.filter((g) => !g.assignedOfficialId)
    if (filter === 'escalated') return grievances.filter((g) => g.status === 'escalated')
    return grievances
  }, [grievances, filter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-soil-900">{t('grievance.allCases')}</h1>
        <p className="mt-1 text-sm text-soil-700/80">{t('dashboards.adminSubtitle')}</p>
      </div>

      {syncError && (
        <div role="alert" className="rounded-xl bg-alert-50 px-3.5 py-2.5 text-sm text-alert-600">
          {t('common.syncError')}
        </div>
      )}

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-xl border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f ? 'border-leaf-600 bg-leaf-50 text-leaf-700' : 'border-soil-200 text-soil-700 hover:bg-soil-100'
            }`}
          >
            {f === 'all' ? t('grievance.allCases') : f === 'unassigned' ? t('grievance.unassignedFilter') : t('grievance.statusEscalated')}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner label={t('common.loading')} />
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-sm text-soil-700/80">{t('grievance.noGrievancesYet')}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((g) => (
            <GrievanceCard
              key={g.id}
              grievance={g}
              onOpen={(gr) => setSelectedId(gr.id)}
              extra={<span>{g.assignedOfficialName || t('grievance.unassigned')}</span>}
            />
          ))}
        </div>
      )}

      {selected && (
        <GrievanceDetailModal grievance={selected} onClose={() => setSelectedId(null)}>
          <div className="space-y-5">
            <AssignOfficialForm grievance={selected} />
            <GrievanceStatusForm grievance={selected} />
          </div>
        </GrievanceDetailModal>
      )}
    </div>
  )
}