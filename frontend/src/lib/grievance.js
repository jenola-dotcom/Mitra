import { isFirebaseConfigured } from './firebase'
import {
  demoSubscribe, demoSubmitGrievance, demoAddStatusUpdate, demoAssignOfficial,
} from './demoGrievance'
import {
  firestoreSubscribe, firestoreSubmitGrievance, firestoreAddStatusUpdate, firestoreAssignOfficial,
} from './firestoreGrievance'

/**
 * Subscribe to the grievance list scoped to `viewer` ({ uid, role }), live.
 * Returns an unsubscribe function. The query itself is narrowed by role —
 * see firestoreGrievance.js for why this must happen at the query level in
 * live mode, not by fetching everything and filtering client-side.
 * `onError`, if given, receives the raw Firestore error (live mode only)
 * so the UI can distinguish "genuinely no grievances" from "sync is broken".
 */
export function subscribeGrievances(callback, viewer, onError) {
  return isFirebaseConfigured
    ? firestoreSubscribe(callback, viewer, onError)
    : demoSubscribe(callback, viewer, onError)
}

export async function submitGrievance(payload) {
  return isFirebaseConfigured ? firestoreSubmitGrievance(payload) : demoSubmitGrievance(payload)
}

export async function addStatusUpdate(id, payload) {
  return isFirebaseConfigured ? firestoreAddStatusUpdate(id, payload) : demoAddStatusUpdate(id, payload)
}

export async function assignOfficial(id, payload) {
  return isFirebaseConfigured ? firestoreAssignOfficial(id, payload) : demoAssignOfficial(id, payload)
}