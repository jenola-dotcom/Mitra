import { useRef, useState } from 'react'
import { MicArt } from './AgriIcons'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useGrievances } from '../context/GrievanceContext'
import { GRIEVANCE_CATEGORIES, MAX_ATTACHMENT_BYTES } from '../constants/grievance'
import { TN_DISTRICTS, districtLabel } from '../constants/districts'
import { bhashiniAsr } from '../lib/bhashiniApi'

// Web Speech API language tags. Browser support for Tamil/Hindi speech
// recognition varies by browser/OS (Chrome/Android generally best) — this
// is flagged in the UI itself (see "unsupported" state below) rather than
// assumed to work everywhere. Languages outside this map fall back to
// Bhashini below, only when the live capability check confirms support.
const SPEECH_LANG = { en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN' }

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read file.'))
    reader.readAsDataURL(file)
  })
}

export default function GrievanceForm({ onSubmitted }) {
  const { user } = useAuth()
  const { t, language, currentSupport } = useLanguage()
  const { submitGrievance } = useGrievances()

  const [category, setCategory] = useState('')
  const [cooperativeSociety, setCooperativeSociety] = useState(user?.pacsSociety || '')
  const [district, setDistrict] = useState(user?.district || TN_DISTRICTS[0].en)
  const [description, setDescription] = useState('')
  const [attachment, setAttachment] = useState(null) // { name, dataUrl }
  const [attachError, setAttachError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successRef, setSuccessRef] = useState('')

  // --- Speech-to-text for the description field ONLY (per spec: never for
  // name/phone/district/PACS or other fields). Recognized speech is placed
  // into the existing textarea for the farmer to review, edit, and correct
  // before submitting -- it never auto-submits the form.
  const [listening, setListening] = useState(false)
  const [speechError, setSpeechError] = useState('')
  const recognitionRef = useRef(null)
  const mediaRecorderRef = useRef(null)

  const browserSpeechSupported =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition) &&
    SPEECH_LANG[language]

  // Visible to the UI as "speech available at all" — either the browser
  // covers this language, or Bhashini's live check confirmed ASR support
  // for it. Never assumed true for a language neither has confirmed.
  const speechSupported = browserSpeechSupported || currentSupport.asr

  const toggleListening = async () => {
    setSpeechError('')
    if (listening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      } else {
        recognitionRef.current?.stop()
      }
      return
    }

    if (browserSpeechSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.lang = SPEECH_LANG[language]
      recognition.interimResults = false
      recognition.maxAlternatives = 1
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript
        // Append rather than overwrite, and never touch other fields --
        // preserves whatever the farmer already typed (Tamil, English, or
        // Tanglish) instead of clobbering it.
        setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript))
      }
      recognition.onerror = (e) => {
        setListening(false)
        if (e.error === 'not-allowed' || e.error === 'permission-denied') {
          setSpeechError(t('grievance.speechPermissionDenied'))
        } else {
          setSpeechError(t('grievance.speechError'))
        }
      }
      recognition.onend = () => setListening(false)
      recognitionRef.current = recognition
      recognition.start()
      setListening(true)
      return
    }

    // Browser doesn't cover this language — fall back to recording +
    // Bhashini ASR, only if live support was actually confirmed for it.
    if (!currentSupport.asr) {
      setSpeechError(t('grievance.speechUnsupported'))
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())
        setListening(false)
        try {
          const blob = new Blob(chunks, { type: 'audio/webm' })
          const transcript = await bhashiniAsr(blob, language)
          if (transcript) setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript))
        } catch {
          setSpeechError(t('grievance.speechError'))
        }
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setListening(true)
    } catch {
      setSpeechError(t('grievance.speechPermissionDenied'))
      setListening(false)
    }
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    setAttachError('')
    if (!file) {
      setAttachment(null)
      return
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachError(t('grievance.attachmentTooLarge'))
      e.target.value = ''
      setAttachment(null)
      return
    }
    const dataUrl = await readFileAsDataUrl(file)
    setAttachment({ name: file.name, dataUrl })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (submitting) return // guards against double-click / double-submit
    if (!category) {
      setError(t('grievance.selectCategory'))
      return
    }
    setSubmitting(true)
    try {
      const result = await submitGrievance({
        farmerId: user.uid,
        farmerName: user.name,
        category,
        cooperativeSociety,
        district,
        description,
        attachmentName: attachment?.name,
        attachmentDataUrl: attachment?.dataUrl,
      })
      setSuccessRef(result.referenceId)
      setCategory('')
      setDescription('')
      setAttachment(null)
      onSubmitted?.(result)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5">
      {successRef && (
        <div className="rounded-xl bg-leaf-50 px-3.5 py-2.5 text-sm text-leaf-700">
          {t('grievance.submitSuccess')} <span className="font-mono font-semibold">{successRef}</span>
        </div>
      )}

      <div>
        <label className="label" htmlFor="category">{t('grievance.category')}</label>
        <select id="category" className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">{t('grievance.selectCategory')}</option>
          {GRIEVANCE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{t(c.labelKey)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="society">{t('grievance.cooperativeSociety')}</label>
          <input
            id="society"
            className="input-field"
            value={cooperativeSociety}
            onChange={(e) => setCooperativeSociety(e.target.value)}
            placeholder={t('grievance.cooperativeSocietyPlaceholder')}
          />
        </div>
        <div>
          <label className="label" htmlFor="district">{t('grievance.district')}</label>
          <select id="district" required className="input-field" value={district} onChange={(e) => setDistrict(e.target.value)}>
            {TN_DISTRICTS.map((d) => (
              <option key={d.id} value={d.en}>{districtLabel(d.id, language)}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="label" htmlFor="description">{t('grievance.description')}</label>
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              aria-pressed={listening}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                listening ? 'bg-alert-50 text-alert-600' : 'bg-soil-100 text-soil-700 hover:bg-soil-200'
              }`}
              title={listening ? t('grievance.speechStop') : t('grievance.speechStart')}
            >
              {listening ? `● ${t('grievance.speechListening')}` : <span className="inline-flex items-center gap-1"><MicArt size={18} />{t('grievance.speechStart')}</span>}
            </button>
          )}
        </div>
        <textarea
          id="description"
          required
          rows={4}
          className="input-field resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('grievance.descriptionPlaceholder')}
        />
        {!speechSupported && (
          <p className="mt-1 text-xs text-soil-700/60">{t('grievance.speechUnsupported')}</p>
        )}
        {speechError && <p className="mt-1 text-xs text-alert-600">{speechError}</p>}
      </div>

      <div>
        <label className="label" htmlFor="attachment">{t('grievance.attachment')}</label>
        <input id="attachment" type="file" accept="image/*,application/pdf" onChange={handleFile} className="block w-full text-sm text-soil-700 file:mr-3 file:rounded-lg file:border-0 file:bg-soil-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-soil-800 hover:file:bg-soil-200" />
        <p className="mt-1 text-xs text-soil-700/60">{t('grievance.attachmentHint')}</p>
        {attachError && <p className="mt-1 text-xs text-alert-600">{attachError}</p>}
        {attachment && <p className="mt-1 text-xs text-leaf-700">{attachment.name}</p>}
      </div>

      {error && (
        <div role="alert" className="rounded-xl bg-alert-50 px-3.5 py-2.5 text-sm text-alert-600">{error}</div>
      )}

      <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
        {submitting ? t('grievance.submitting') : t('grievance.submit')}
      </button>
    </form>
  )
}