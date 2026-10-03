import { isFirebaseConfigured } from './firebase'
import { demoListUsersByRole, demoListAllUsers } from './demoAuth'
import { firestoreListUsersByRole, firestoreListAllUsers } from './firestoreUsers'

export async function listUsersByRole(role) {
  return isFirebaseConfigured ? firestoreListUsersByRole(role) : demoListUsersByRole(role)
}

export async function listAllUsers() {
  return isFirebaseConfigured ? firestoreListAllUsers() : demoListAllUsers()
}
