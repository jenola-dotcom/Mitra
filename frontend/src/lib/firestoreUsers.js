import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from './firebase'

export async function firestoreListUsersByRole(role) {
  const q = query(collection(db, 'users'), where('role', '==', role))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
}

export async function firestoreListAllUsers() {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
}
