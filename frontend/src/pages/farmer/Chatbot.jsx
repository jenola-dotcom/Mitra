import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { sendChatMessage } from '../../lib/chatApi'
import { bhashiniAsr, bhashiniTts } from '../../lib/bhashiniApi'
import {
  listSessions, createSession, getSession, appendMessage, deleteSession,
} from '../../lib/chatSessions'
import { suggestedQuestions } from '../../data/knowledgeBase'
import { MitraLogo, QUICK_ICONS, SproutIcon } from '../../components/AgriIcons'

// Browsers only ship native speech support for a handful of languages, and
// even that varies by OS/browser. These three are the ones we know work
// reasonably (see GrievanceForm.jsx for the same map). Everything else
// falls back to Bhashini below, IF the live capability check confirms
// support — never assumed.
const SPEECH_LANG = {
  en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN',
  // Chrome/Android support many more Indian languages natively. If the browser
  // or OS doesn't actually support one, we fall back to Bhashini below.
  te: 'te-IN', kn: 'kn-IN', ml: 'ml-IN', bn: 'bn-IN', mr: 'mr-IN',
  gu: 'gu-IN', pa: 'pa-IN', or: 'or-IN', as: 'as-IN', ur: 'ur-IN',
}
const CORE_SPEECH = ['en', 'hi', 'ta']

// Does this browser have a voice for the language? (speechSynthesis silently
// does nothing when it doesn't.)
function hasBrowserVoice(browserLang) {
  try {
    const prefix = browserLang.split('-')[0].toLowerCase()
    return (window.speechSynthesis?.getVoices() || []).some((v) => v.lang?.toLowerCase().startsWith(prefix))
  } catch {
    return false
  }
}

function ModeTag({ mode }) {
  const { t } = useLanguage()
  const map = {
    live: { label: t('chat.modeLive'), cls: 'bg-leaf-100 text-leaf-700' },
    demo: { label: t('chat.modeDemo'), cls: 'bg-sun-400/15 text-sun-500' },
    cached: { label: t('chat.modeCached'), cls: 'bg-sky-50 text-sky-600' },
    unavailable: { label: t('chat.modeUnavailable'), cls: 'bg-alert-50 text-alert-600' },
  }
  // Never show internal-mode labels (demo / cached / verified) to users.
  if (mode === 'demo' || mode === 'cached' || mode === 'official' || mode === 'error' || mode === 'unavailable') return null
  const meta = map[mode] || map.cached
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.cls}`}>{meta.label}</span>
}

export default function Chatbot() {
  const { user } = useAuth()
  const { t, language, currentSupport } = useLanguage()

  const [sessions, setSessions] = useState(() => listSessions(user.uid))
  const [activeId, setActiveId] = useState(() => sessions[0]?.id || null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)
  const [listening, setListening] = useState(false)
  const [voiceNotice, setVoiceNotice] = useState('')
  const scrollRef = useRef(null)
  const recognitionRef = useRef(null)
  const mediaRecorderRef = useRef(null)

  const active = activeId ? getSession(user.uid, activeId) : null

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [active?.messages?.length])

  const refreshSessions = () => setSessions(listSessions(user.uid))

  const handleNewSession = () => {
    const session = createSession(user.uid)
    refreshSessions()
    setActiveId(session.id)
  }

  const handleDelete = (id) => {
    deleteSession(user.uid, id)
    refreshSessions()
    if (activeId === id) setActiveId(null)
  }

  const speak = async (text) => {
    if (!voiceOn) return
    const browserLang = SPEECH_LANG[language]
    if (browserLang && window.speechSynthesis && (CORE_SPEECH.includes(language) || hasBrowserVoice(browserLang))) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = browserLang
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
      return
    }
    // Browser TTS doesn't cover this language — only try Bhashini if the
    // live check actually confirmed TTS support for it.
    if (currentSupport.tts) {
      try {
        const url = await bhashiniTts(text, language)
        const audio = new Audio(url)
        audio.onended = () => URL.revokeObjectURL(url)
        audio.play()
      } catch {
        // Voice is a convenience; a failed TTS call shouldn't interrupt
        // the (already-delivered) text answer.
      }
    }
  }

  // Recording + Bhashini ASR, used when the browser can't recognise the language.
  const recordWithBhashini = async () => {
    // Only if the live capability check actually confirmed support.
    if (!currentSupport.asr) {
      setVoiceNotice(t('chat.voiceUnsupported'))
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
          const text = await bhashiniAsr(blob, language)
          if (text) setInput((prev) => (prev ? `${prev} ${text}` : text))
        } catch {
          setVoiceNotice(t('chat.voiceError'))
        }
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setListening(true)
    } catch {
      setVoiceNotice(t('grievance.speechPermissionDenied'))
      setListening(false)
    }
  }

  const startListening = async () => {
    setVoiceNotice('')
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const browserLang = SPEECH_LANG[language]

    if (SpeechRecognition && browserLang) {
      const recognition = new SpeechRecognition()
      recognition.lang = browserLang
      recognition.interimResults = false
      recognition.maxAlternatives = 1
      recognition.onresult = (e) => {
        setInput((prev) => (prev ? `${prev} ${e.results[0][0].transcript}` : e.results[0][0].transcript))
      }
      recognition.onend = () => setListening(false)
      recognition.onerror = (e) => {
        setListening(false)
        // Browser can't recognise this language -> Bhashini fallback.
        if (e?.error === 'language-not-supported' || e?.error === 'service-not-allowed') {
          recordWithBhashini()
        }
      }
      recognitionRef.current = recognition
      recognition.start()
      setListening(true)
      return
    }

    recordWithBhashini()
  }

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      return
    }
    recognitionRef.current?.stop()
    setListening(false)
  }

  const handleSend = async (textOverride) => {
    const text = (textOverride ?? input).trim()
    if (!text) return

    let session = active
    if (!session) {
      session = createSession(user.uid)
      refreshSessions()
      setActiveId(session.id)
    }

    appendMessage(user.uid, session.id, { role: 'user', text, at: new Date().toISOString() })
    refreshSessions()
    setInput('')
    setSending(true)

    try {
      const history = (getSession(user.uid, session.id)?.messages || []).slice(-6)
      const answer = await sendChatMessage({ message: text, language, history })
      appendMessage(user.uid, session.id, {
        role: 'assistant',
        text: answer.text || (answer.mode === 'unavailable' ? t('chat.requestFailed') : `${t('chat.requestFailed')}${answer.error ? ` (${answer.error})` : ''}`),
        source: answer.source,
        officialLink: answer.officialLink,
        linkLabel: answer.linkLabel,
        lastUpdated: answer.lastUpdated,
        mode: answer.mode,
        inRequestedLanguage: answer.inRequestedLanguage,
        at: new Date().toISOString(),
      })
      if (answer.text) speak(answer.text)
    } catch {
      appendMessage(user.uid, session.id, {
        role: 'assistant',
        text: t('chat.requestFailed'),
        mode: 'error',
        at: new Date().toISOString(),
      })
    } finally {
      refreshSessions()
      setSending(false)
    }
  }

  const messages = active?.messages || []
  const quick = suggestedQuestions(language)

  return (
    <div className="flex h-[calc(100vh-9rem)] gap-4 lg:h-[calc(100vh-6rem)]">
      {/* Session list */}
      <aside className="hidden w-64 shrink-0 flex-col gap-3 sm:flex">
        <button onClick={handleNewSession} className="btn-primary w-full justify-center">
          + {t('chat.newSession')}
        </button>
        <div className="flex-1 space-y-1.5 overflow-y-auto rounded-2xl bg-wheat-100/60 p-2">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                s.id === activeId ? 'bg-white text-leaf-700 font-medium shadow-sm' : 'text-soil-700 hover:bg-white/70'
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <SproutIcon size={16} className="shrink-0" />
                <span className="truncate">{s.title}</span>
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); handleDelete(s.id) }}
                className="ml-2 shrink-0 text-soil-700/40 opacity-0 hover:text-alert-600 group-hover:opacity-100"
              >
                ✕
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-soil-100 bg-white shadow-soft">
        <div className="flex items-center justify-between gap-3 border-b border-soil-100 bg-gradient-to-r from-leaf-50 via-white to-sun-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <MitraLogo size={38} />
            <div>
              <h1 className="font-display text-base font-semibold leading-tight text-soil-900">{t('nav.chatbot')}</h1>
              <p className="flex items-center gap-1.5 text-[11px] text-leaf-700">
                <span className="h-1.5 w-1.5 rounded-full bg-leaf-500" /> {t('appName')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setVoiceOn((v) => !v)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              voiceOn ? 'border-leaf-500/40 bg-leaf-100 text-leaf-700' : 'border-soil-200 bg-white text-soil-700 hover:bg-soil-50'
            }`}
          >
            {voiceOn ? '🔊 ' : '🔈 '}{voiceOn ? t('chat.voiceOn') : t('chat.voiceOff')}
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-white to-wheat-50 px-4 py-5">
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-2xl animate-rise flex-col items-center justify-center gap-4 text-center">
              <MitraLogo size={64} />
              <p className="max-w-md text-sm text-soil-700/90">{t('chat.emptyState')}</p>
              <div className="grid w-full gap-2.5 sm:grid-cols-2">
                {quick.map((q, idx) => {
                  const Icon = QUICK_ICONS[idx % QUICK_ICONS.length]
                  return (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="flex items-center gap-3 rounded-2xl border border-soil-100 bg-white p-3 text-left text-xs leading-snug text-soil-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-leaf-500/50 hover:shadow-soft"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-leaf-50 to-sun-50">
                        <Icon size={24} />
                      </span>
                      <span>{q}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex animate-rise items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role !== 'user' && <MitraLogo size={28} />}
                <div className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'rounded-2xl rounded-br-md bg-gradient-to-br from-leaf-500 to-leaf-700 text-white'
                    : 'rounded-2xl rounded-bl-md border border-soil-100 bg-white text-soil-900'
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.role === 'assistant' && m.inRequestedLanguage === false && (
                    <p className="mt-1 text-[11px] text-alert-600">{t('chat.fallbackToEnglish')}</p>
                  )}
                  {m.role === 'assistant' && m.mode && (m.source || m.officialLink || !['error', 'unavailable', 'demo', 'cached', 'official'].includes(m.mode)) && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-soil-100 pt-2">
                      <ModeTag mode={m.mode} />
                      {m.source && (m.linkLabel && m.officialLink ? (
                        <a href={m.officialLink} target="_blank" rel="noreferrer" className="text-[11px] text-leaf-700 underline">{t('chat.source')}: {m.source}</a>
                      ) : (
                        <span className="text-[11px] text-soil-700/60">{t('chat.source')}: {m.source}</span>
                      ))}
                      {m.officialLink && (
                        <a href={m.officialLink} target="_blank" rel="noreferrer" className="rounded-full bg-leaf-50 px-2.5 py-1 text-[11px] font-medium text-leaf-700 hover:bg-leaf-100">
                          {m.linkLabel || t('chat.officialLink')}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="flex items-end gap-2">
              <MitraLogo size={28} />
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-soil-100 bg-white px-4 py-3 shadow-sm">
                <span className="flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="h-1.5 w-1.5 animate-dot rounded-full bg-leaf-500" style={{ animationDelay: `${d * 0.15}s` }} />
                  ))}
                </span>
                <span className="text-xs text-soil-700/70">{t('chat.thinking')}</span>
              </div>
            </div>
          )}
        </div>

        {messages.length > 0 && (
          <div className="flex gap-2 overflow-x-auto border-t border-soil-100 bg-white px-4 py-2">
            {quick.map((q, idx) => {
              const Icon = QUICK_ICONS[idx % QUICK_ICONS.length]
              return (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  disabled={sending}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-soil-200 bg-wheat-50 px-3 py-1.5 text-[11px] text-soil-800 transition-colors hover:border-leaf-500/50 hover:bg-leaf-50 disabled:opacity-50"
                >
                  <Icon size={14} />
                  <span className="max-w-[16rem] truncate">{q}</span>
                </button>
              )
            })}
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); handleSend() }}
          className="flex items-center gap-2 border-t border-soil-100 bg-white px-4 py-3"
        >
          <button
            type="button"
            onClick={listening ? stopListening : startListening}
            className={`shrink-0 rounded-full p-3 transition-all ${
              listening ? 'animate-pulse bg-alert-50 text-alert-600 ring-2 ring-alert-500/30' : 'bg-sun-50 text-sun-500 hover:bg-sun-100'
            }`}
            aria-label="Voice input"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3Zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.92V21h2v-2.08A7 7 0 0019 12h-2Z" />
            </svg>
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat.inputPlaceholder')}
            className="input-field flex-1 rounded-full bg-wheat-50 px-5"
          />
          <button type="submit" disabled={sending || !input.trim()} className="btn-primary shrink-0 rounded-full px-5">
            {t('chat.send')}
          </button>
        </form>
        {voiceNotice && <p className="px-4 pb-2 text-xs text-alert-600">{voiceNotice}</p>}
      </div>
    </div>
  )
}
