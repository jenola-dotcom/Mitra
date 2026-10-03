import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useGrievances } from '../../context/GrievanceContext'
import GrievanceForm from '../../components/GrievanceForm'
import GrievanceCard from '../../components/GrievanceCard'
import GrievanceDetailModal from '../../components/GrievanceDetailModal'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function FarmerGrievances() {
  const { t } = useLanguage()
  const { myGrievances, loading, syncError } = useGrievances()
  const [selectedId, setSelectedId] = useState(null)
  const [showForm, setShowForm] = useState(myGrievances.length === 0)
  const selected = myGrievances.find((g) => g.id === selectedId) || null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-soil-900">{t('nav.grievances')}</h1>
          <p className="mt-1 text-sm text-soil-700/80">{t('grievance.myGrievances')}</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="btn-secondary">
          {showForm ? t('grievance.close') : t('grievance.newGrievance')}
        </button>
      </div>

      {syncError && (
        <div role="alert" className="rounded-xl bg-alert-50 px-3.5 py-2.5 text-sm text-alert-600">
          {t('common.syncError')}
        </div>
      )}

      {showForm && <GrievanceForm onSubmitted={() => setShowForm(false)} />}

      {loading ? (
        <LoadingSpinner label={t('common.loading')} />
      ) : myGrievances.length === 0 ? (
        <div className="card p-8 text-center text-sm text-soil-700/80">{t('grievance.noGrievancesYet')}</div>
      ) : (
        <div className="space-y-3">
          {myGrievances.map((g) => (
            <GrievanceCard key={g.id} grievance={g} onOpen={(gr) => setSelectedId(gr.id)} />
          ))}
        </div>
      )}

      {selected && (
        <GrievanceDetailModal grievance={selected} onClose={() => setSelectedId(null)} />
      )}
    </div>
  )
}