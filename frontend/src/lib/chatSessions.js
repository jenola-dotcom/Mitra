const KEY_PREFIX = 'coopconnect_chat_sessions:'

function keyFor(uid) {
  return `${KEY_PREFIX}${uid}`
}

function readSessions(uid) {
  try {
    const raw = localStorage.getItem(keyFor(uid))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeSessions(uid, sessions) {
  localStorage.setItem(keyFor(uid), JSON.stringify(sessions))
}

export function listSessions(uid) {
  return readSessions(uid).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function createSession(uid, title) {
  const sessions = readSessions(uid)
  const session = {
    id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: title || 'New conversation',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  sessions.push(session)
  writeSessions(uid, sessions)
  return session
}

export function getSession(uid, sessionId) {
  return readSessions(uid).find((s) => s.id === sessionId) || null
}

export function appendMessage(uid, sessionId, message) {
  const sessions = readSessions(uid)
  const session = sessions.find((s) => s.id === sessionId)
  if (!session) return null
  session.messages.push(message)
  session.updatedAt = new Date().toISOString()
  // Auto-title the session from the first user message.
  if (session.title === 'New conversation') {
    const firstUserMsg = session.messages.find((m) => m.role === 'user')
    if (firstUserMsg) session.title = firstUserMsg.text.slice(0, 48)
  }
  writeSessions(uid, sessions)
  return session
}

export function deleteSession(uid, sessionId) {
  const sessions = readSessions(uid).filter((s) => s.id !== sessionId)
  writeSessions(uid, sessions)
}
