import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { statesAvailable, districtsFor, pacsFor } from '../../data/pacsRecords'

export default function PacsFinder() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const states = statesAvailable()

  const [state, setState] = useState(user?.state && states.includes(user.state) ? user.state : states[0] || 'Tamil Nadu')
  const districts = districtsFor(state)
  const [district, setDistrict] = useState(
    user?.district && districts.includes(user.district) ? user.district : districts[0] || 'Madurai'
  )

  const results = pacsFor(state, district)

  const handleStateChange = (e) => {
    const newState = e.target.value
    setState(newState)
    const newDistricts = districtsFor(newState)
    setDistrict(newDistricts[0] || '')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-soil-900">{t('nav.pacs')}</h1>
        <p className="mt-1 text-sm text-soil-700/80">
          Sample PACS directory for this prototype — currently seeded for Tamil Nadu / Madurai; more states and districts are added the same way.
        </p>
      </div>

      <div className="card flex flex-wrap gap-3 p-4">
        <div className="min-w-[160px] flex-1">
          <label className="label">{t('grievance.district')} state</label>
          <select className="input-field" value={state} onChange={handleStateChange}>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="min-w-[160px] flex-1">
          <label className="label">{t('grievance.district')}</label>
          <select className="input-field" value={district} onChange={(e) => setDistrict(e.target.value)}>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="card p-8 text-center text-sm text-soil-700/80">
          No sample PACS records for this district yet. Try Tamil Nadu → Madurai for the seeded demo data.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((p) => (
            <div key={p.id} className="card p-5">
              <h2 className="font-display text-base font-semibold text-soil-900">{p.name}</h2>
              <p className="mt-1 text-sm text-soil-700/80">{p.address}</p>
              <p className="mt-1 text-sm text-soil-700/80">📞 {p.phone}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.services.map((s) => (
                  <span key={s} className="rounded-full bg-leaf-50 px-2.5 py-1 text-xs font-medium text-leaf-700">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
