// Firestore-backed grievance data layer (live Firebase mode). Mirrors
// lib/demoGrievance.js's shape and function signatures so lib/grievance.js
// can pick between the two transparently.
//
// Collection: grievances/{autoId}
// See firebase/firestore.rules for the access rules this depends on.

import {
  collection, addDoc, doc, updateDoc, onSnapshot, query, orderBy, where,
  serverTimestamp, arrayUnion, Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

const COLLECTION = 'grievances'

function generateReferenceId() {
  const year = new Date().getFullYear()
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `CC-${year}-${rand}`
}

function fromSnapshot(snap) {
  const data = snap.data()
  return {
    id: snap.id,
    ...data,
    // Normalize Firestore Timestamps to ISO strings so components never
    // need to know whether they're looking at demo or live data.
    createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
    updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
    statusHistory: (data.statusHistory || []).map((entry) => ({
      ...entry,
      at: entry.at?.toDate?.().toISOString() || entry.at || null,
    })),
    // Part 3: surfaces Firestore's own pending-write state, so the UI can
    // show "Pending Sync" for a write made while offline, flipping to
    // "Synced" the instant it's acknowledged by the server.
    syncStatus: snap.metadata.hasPendingWrites ? 'pending' : 'synced',
    fromCache: snap.metadata.fromCache,
  }
}

/**
 * Role-scoped subscription. This MUST match firestore.rules exactly:
 * security rules do not filter query results — a query that could return a
 * document the caller isn't allowed to read fails the whole listener with
 * "permission-denied", not a partial result. So farmers and officials each
 * get a narrowed query (their own docs only); only admins query the full
 * collection, which the rules already allow broadly.
 *
 * ROOT-CAUSE FIX (2026-09-29): the previous version added `orderBy('createdAt')`
 * on top of the `where(...)` filter below. Firestore requires a composite
 * index for "equality filter on field A + orderBy on field B", and that
 * index only exists once explicitly deployed (`firebase deploy --only
 * firestore:indexes`) — it is NOT created just because
 * firestore.indexes.json lists it. Until deployed, the query fails with
 * `failed-precondition: The query requires an index`, which the error
 * handler below was swallowing into an empty list — exactly reproducing
 * "You haven't filed any grievances yet" for farmers, while Admin's
 * unfiltered query (needs no composite index) kept working. Filtered
 * queries now use `where` ONLY (no server-side orderBy — no composite
 * index needed at all), and results are sorted client-side instead. This
 * removes the failure mode entirely rather than depending on a manual
 * deploy step.
 *
 * `viewer` is { uid, role }. Falls back to no-op if missing (logged out).
 */
export function firestoreSubscribe(callback, viewer, onError) {
  if (!viewer?.uid || !viewer?.role) {
    callback([])
    return () => {}
  }

  let q
  if (viewer.role === 'farmer') {
    q = query(collection(db, COLLECTION), where('farmerId', '==', viewer.uid))
  } else if (viewer.role === 'official') {
    q = query(collection(db, COLLECTION), where('assignedOfficialId', '==', viewer.uid))
  } else {
    // admin — rules already grant broad read access to this role. No
    // `where` filter here, so the plain orderBy needs no composite index
    // (kept for admin only, where it's cheap/safe).
    q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  }

  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snap) => {
      const list = snap.docs.map(fromSnapshot)
      // Sort newest-first client-side — see comment above for why this
      // isn't done via a server-side orderBy for farmer/official queries.
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      callback(list)
    },
    (err) => {
      // Surface the real Firestore error (permission-denied, missing index,
      // offline, etc.) to the UI via onError instead of only logging it and
      // silently showing an empty list — a farmer/official/admin seeing
      // "no grievances" now can tell the difference between "you truly
      // have none" and "something is broken".
      console.error('Grievance subscription error:', err)
      onError?.(err)
      callback([])
    }
  )
}

export async function firestoreSubmitGrievance({
  farmerId, farmerName, category, cooperativeSociety, district, description,
  attachmentName, attachmentDataUrl,
}) {
  const referenceId = generateReferenceId()
  const now = Timestamp.now()

  const docRef = await addDoc(collection(db, COLLECTION), {
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
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
  })

  return { id: docRef.id, referenceId }
}

export async function firestoreAddStatusUpdate(id, { status, note, byUid, byName, byRole }) {
  const ref = doc(db, COLLECTION, id)
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
    statusHistory: arrayUnion({
      status,
      note: note || '',
      byUid,
      byName,
      byRole,
      at: Timestamp.now(),
    }),
  })
}

export async function firestoreAssignOfficial(id, { officialId, officialName, byUid, byName, currentStatus, wasAssigned }) {
  const ref = doc(db, COLLECTION, id)
  await updateDoc(ref, {
    assignedOfficialId: officialId,
    assignedOfficialName: officialName,
    updatedAt: serverTimestamp(),
    statusHistory: arrayUnion({
      status: currentStatus,
      note: wasAssigned ? `Reassigned to ${officialName}.` : `Assigned to ${officialName}.`,
      byUid,
      byName,
      byRole: 'admin',
      at: Timestamp.now(),
    }),
  })
}