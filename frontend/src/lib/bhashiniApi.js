// Thin client for the backend's Bhashini-backed endpoints. Every function
// here can legitimately fail (Bhashini not configured, language not
// supported, network down) — callers must handle rejection and fall back
// gracefully (e.g. to the browser's own speech APIs), never assume success.

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Live per-language support for asr/translation/tts, straight from the
 * backend's Bhashini check (see backend/app/bhashini.py). Returns
 * { available: false, languages: {...all false} } on any failure — never
 * throws, so callers can treat "couldn't check" the same as "not
 * supported" and safely fall back to browser APIs.
 */
export async function getLanguageSupport() {
  try {
    const res = await fetch(`${API_BASE}/api/languages/support`)
    if (!res.ok) throw new Error(`status ${res.status}`)
    return await res.json()
  } catch {
    return { available: false, languages: {} }
  }
}

/** Blob (recorded audio) -> base64 string, no data: URL prefix. */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Speech -> text via Bhashini, for languages the browser's own
 * SpeechRecognition doesn't cover. Throws on failure — callers should
 * catch and show a clear message, not retry silently.
 */
export async function bhashiniAsr(audioBlob, language) {
  const audioBase64 = await blobToBase64(audioBlob)
  const res = await fetch(`${API_BASE}/api/speech/asr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, language, audioFormat: 'webm', samplingRate: 16000 }),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `ASR failed (${res.status})`)
  const data = await res.json()
  return data.text
}

/**
 * Text -> speech via Bhashini. Returns a playable object URL; caller is
 * responsible for revoking it (URL.revokeObjectURL) once done.
 */
export async function bhashiniTts(text, language) {
  const res = await fetch(`${API_BASE}/api/speech/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language }),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `TTS failed (${res.status})`)
  const data = await res.json()
  const byteChars = atob(data.audioBase64)
  const bytes = new Uint8Array(byteChars.length)
  for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i)
  const blob = new Blob([bytes], { type: 'audio/wav' })
  return URL.createObjectURL(blob)
}

/** Text -> text, cross-language, via Bhashini. Throws on failure. */
export async function bhashiniTranslate(text, targetLanguage, sourceLanguage = 'en') {
  const res = await fetch(`${API_BASE}/api/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sourceLanguage, targetLanguage }),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `Translate failed (${res.status})`)
  const data = await res.json()
  return data.text
}