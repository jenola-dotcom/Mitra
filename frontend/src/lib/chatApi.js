import { findOfflineAnswer } from './offlineFaq'
import { cacheGet, cacheSet } from './offlineCache'
import { findHardcodedAnswer } from './hardcodedAnswers'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function pageLabel(link) {
  const m = /#page=(\d+)/.exec(link || '')
  return m ? `View PDF → Page ${m[1]}` : undefined
}

function cacheKeyFor(message, language) {
  return `${language}:${message.trim().toLowerCase().slice(0, 120)}`
}

/**
 * Sends a chat message. Tries the live backend first (short timeout so a
 * slow/offline network doesn't hang the UI); on any failure, falls back to
 * a previously cached live answer for this same question if one exists,
 * then to the local offline FAQ; if neither matches, returns a clear
 * "not available offline" message rather than inventing an answer.
 */
export async function sendChatMessage({ message, language, history }) {
  const hardcoded = findHardcodedAnswer(message)
  if (hardcoded) return hardcoded

  const key = cacheKeyFor(message, language)

  if (navigator.onLine) {
    let failure = ''
    try {
      // Gemini (+ RAG) can take well over 6s; aborting early made valid
      // answers get replaced by the "not verified" fallback. Allow 90s.
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 90000)
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, language, history }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (res.ok) {
        const data = await res.json()
        const answer = {
          text: data.answer,
          source: data.source || null,
          officialLink: data.officialLink || null,
          // "View PDF → Page N" only when the backend sent a real page link.
          linkLabel: pageLabel(data.officialLink),
          lastUpdated: data.lastUpdated || null,
          mode: data.mode || 'live',
          // Lets the UI show an honest notice when the backend had to fall
          // back to English for a language it doesn't yet cover, instead
          // of silently displaying English as if it were the right answer.
          inRequestedLanguage: data.inRequestedLanguage !== false,
        }
        if (answer.text) {
          await cacheSet('chat-answer', key, answer, { source: answer.source, lastUpdated: answer.lastUpdated })
          return answer
        }
        failure = 'empty response from server'
      } else {
        let detail = `HTTP ${res.status}`
        try {
          const body = await res.json()
          if (body?.detail) detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail)
        } catch { /* ignore */ }
        failure = detail
      }
    } catch (err) {
      failure = err?.name === 'AbortError' ? 'the server took too long to respond' : (err?.message || 'could not reach the server')
    }
    // We ARE online but the backend call failed: never substitute canned
    // FAQ / "not verified" text — report the real problem instead.
    console.error('[chat] backend request failed:', failure)
    return {
      text: null,
      error: failure,
      source: null,
      officialLink: null,
      lastUpdated: null,
      mode: 'error',
    }
  }

  const cached = await cacheGet('chat-answer', key)
  if (cached) {
    return { ...cached.data, mode: 'cached', cachedAt: cached.cachedAt }
  }

  const offline = findOfflineAnswer(message, language)
  if (offline) return offline

  return {
    text: null,
    source: null,
    officialLink: null,
    lastUpdated: null,
    mode: 'unavailable',
  }
}