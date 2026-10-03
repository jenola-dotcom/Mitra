import { KNOWLEDGE_BASE } from '../data/knowledgeBase'

function score(message, entry) {
  const text = message.toLowerCase()
  let points = 0
  for (const kw of entry.keywords) {
    if (text.includes(kw.toLowerCase())) points += kw.length > 4 ? 2 : 1
  }
  return points
}

/**
 * Returns the best-matching cached answer for a message, or null if nothing
 * scores above a minimal relevance threshold — in which case the caller
 * should say verified information isn't available offline, rather than
 * guessing (per the brief's "never invent" rule).
 */
export function findOfflineAnswer(message, language = 'en') {
  let best = null
  let bestScore = 0
  for (const entry of KNOWLEDGE_BASE) {
    const s = score(message, entry)
    if (s > bestScore) {
      bestScore = s
      best = entry
    }
  }
  if (!best || bestScore === 0) return null

  return {
    text: best.summary[language] || best.summary.en,
    source: best.source,
    officialLink: best.officialLink,
    lastUpdated: best.lastUpdated,
    mode: 'cached',
  }
}
