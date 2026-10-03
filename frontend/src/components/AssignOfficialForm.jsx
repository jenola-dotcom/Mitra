import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useGrievances } from '../context/GrievanceContext'
import { listUsersByRole } from '../lib/users'

export default function AssignOfficialForm({ grievance }) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { assignOfficial } = useGrievances()

  const [officials, setOfficials] = useState([])
  const [selectedOfficial, setSelectedOfficial] = useState(grievance.assignedOfficialId || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    listUsersByRole('official').then((list) => {
      if (active) setOfficials(list)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    setSelectedOfficial(grievance.assignedOfficialId || '')
  }, [grievance.assignedOfficialId])

  const handleAssign = async (e) => {
    e.preventDefault()
    setError('')
    const official = officials.find((o) => o.uid === selectedOfficial)
    if (!official) {
      setError('Please choose an official.')
      return
    }
    setSaving(true)
    try {
      await assignOfficial(grievance.id, {
        officialId: official.uid,
        officialName: official.name,
        byUid: user.uid,
        byName: user.name,
        currentStatus: grievance.status,
        wasAssigned: Boolean(grievance.assignedOfficialId),
      })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleAssign} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="label" htmlFor="official">{t('grievance.assignOfficial')}</label>
        <select id="official" className="input-field" value={selectedOfficial} onChange={(e) => setSelectedOfficial(e.target.value)}>
          <option value="">—</option>
          {officials.map((o) => (
            <option key={o.uid} value={o.uid}>{o.name}{o.district ? ` · ${o.district}` : ''}</option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={saving} className="btn-secondary">
        {grievance.assignedOfficialId ? t('grievance.reassign') : t('grievance.assignOfficial')}
      </button>
      {error && <p className="text-sm text-alert-600">{error}</p>}
    </form>
  )
}
