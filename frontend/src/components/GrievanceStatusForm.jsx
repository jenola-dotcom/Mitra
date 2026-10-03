import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useGrievances } from '../context/GrievanceContext'
import { GRIEVANCE_STATUSES } from '../constants/grievance'

export default function GrievanceStatusForm({ grievance, onSaved }) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { addStatusUpdate } = useGrievances()

  const [status, setStatus] = useState(grievance.status)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    if (!note.trim()) {
      setError(t('grievance.noteRequired'))
      return
    }
    setSaving(true)
    try {
      await addStatusUpdate(grievance.id, {
        status,
        note: note.trim(),
        byUid: user.uid,
        byName: user.name,
        byRole: user.role,
      })
      setNote('')
      onSaved?.()
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <div>
        <label className="label" htmlFor="status">{t('grievance.updateStatus')}</label>
        <select id="status" className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
          {GRIEVANCE_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{t(s.labelKey)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="note">{t('grievance.addNote')}</label>
        <textarea
          id="note"
          rows={3}
          className="input-field resize-none"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('grievance.notePlaceholder')}
        />
      </div>
      {error && <p className="text-sm text-alert-600">{error}</p>}
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? t('grievance.saving') : t('grievance.saveUpdate')}
      </button>
    </form>
  )
}
