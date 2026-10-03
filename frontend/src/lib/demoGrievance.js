// Local, in-browser grievance store used in demo mode (see lib/firebase.js /
// isFirebaseConfigured). Mirrors the Firestore document shape used in
// lib/grievanceService.js so farmer / official / admin screens can call one
// unified API regardless of which backend is active — see
// lib/grievance.js, which picks between this file and Firestore.
//
// Persists to localStorage, so it survives refresh and logout/login on the
// same device/browser, matching the brief's "must persist" requirement for
// the online (non-offline) demo. Full cross-device offline sync is Part 3.

const STORE_KEY = 'coopconnect_demo_grievances'
const EVENT_NAME = 'coopconnect:grievances-changed'

function readAll() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeAll(map) {
  localStorage.setItem(STORE_KEY, JSON.stringify(map))
  // Notify listeners in THIS tab (the native `storage` event only fires in
  // other tabs), so a farmer and official simulated in two tabs of the same
  // browser both see live updates, and a single-tab refresh always reflects
  // the latest state.
  window.dispatchEvent(new CustomEvent(EVENT_NAME))
}

function generateReferenceId(existingIds) {
  const year = new Date().getFullYear()
  let candidate
  do {
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
    candidate = `CC-${year}-${rand}`
  } while (existingIds.has(candidate))
  return candidate
}

/**
 * Demo mode has no security rules to violate (localStorage is private to
 * this browser already), so role-scoping here is only about matching the
 * live-mode function signature and giving each role the same shape of data
 * it would get from Firestore — not a security boundary.
 */
export function demoSubscribe(callback, viewer, _onError) {
  const handler = () => {
    const all = withSyncStatus(Object.values(readAll()))
    if (!viewer?.uid) return callback([])
    if (viewer.role === 'farmer') {
      return callback(all.filter((g) => g.farmerId === viewer.uid))
    }
    if (viewer.role === 'official') {
      return callback(all.filter((g) => g.assignedOfficialId === viewer.uid))
    }
    return callback(all) // admin
  }
  window.addEventListener(EVENT_NAME, handler)
  window.addEventListener('storage', handler)
  handler()
  return () => {
    window.removeEventListener(EVENT_NAME, handler)
    window.removeEventListener('storage', handler)
  }
}

function withSyncStatus(list) {
  // Demo mode has no remote server — localStorage *is* the source of truth,
  // so every write is durable the instant it lands. Labeled "local" (not
  // "synced") so the UI is honest that this isn't cloud sync — see
  // components/SyncStatusBadge.jsx.
  return list.map((g) => ({ ...g, syncStatus: 'local', fromCache: false }))
}

export function demoGetAll() {
  return withSyncStatus(Object.values(readAll())).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function demoSubmitGrievance({
  farmerId, farmerName, category, cooperativeSociety, district, description,
  attachmentName, attachmentDataUrl,
}) {
  const all = readAll()
  const existingIds = new Set(Object.values(all).map((g) => g.referenceId))
  const referenceId = generateReferenceId(existingIds)
  const now = new Date().toISOString()
  const id = `grv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const grievance = {
    id,
    referenceId,
    farmerId,
    farmerName,
    category,
    cooperativeSociety: cooperativeSociety || '',
    district,
    description,
    attachmentName: attachmentName || null,
    attachmentDataUrl: attachmentDataUrl || null,
    status: 'pending',
    assignedOfficialId: null,
    assignedOfficialName: null,
    createdAt: now,
    updatedAt: now,
    statusHistory: [
      {
        status: 'pending',
        note: 'Grievance filed by member.',
        byUid: farmerId,
        byName: farmerName,
        byRole: 'farmer',
        at: now,
      },
    ],
  }

  all[id] = grievance
  writeAll(all)
  return grievance
}

export function demoAddStatusUpdate(id, { status, note, byUid, byName, byRole }) {
  const all = readAll()
  const grievance = all[id]
  if (!grievance) throw new Error('Grievance not found.')

  const now = new Date().toISOString()
  grievance.status = status
  grievance.updatedAt = now
  grievance.statusHistory = [
    ...grievance.statusHistory,
    { status, note: note || '', byUid, byName, byRole, at: now },
  ]

  all[id] = grievance
  writeAll(all)
  return grievance
}

export function demoAssignOfficial(id, { officialId, officialName, byUid, byName }) {
  const all = readAll()
  const grievance = all[id]
  if (!grievance) throw new Error('Grievance not found.')

  const now = new Date().toISOString()
  const wasAssigned = Boolean(grievance.assignedOfficialId)
  grievance.assignedOfficialId = officialId
  grievance.assignedOfficialName = officialName
  grievance.updatedAt = now
  grievance.statusHistory = [
    ...grievance.statusHistory,
    {
      status: grievance.status,
      note: wasAssigned
        ? `Reassigned to ${officialName}.`
        : `Assigned to ${officialName}.`,
      byUid,
      byName,
      byRole: 'admin',
      at: now,
    },
  ]

  all[id] = grievance
  writeAll(all)
  return grievance
}