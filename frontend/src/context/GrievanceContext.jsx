import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import {
  subscribeGrievances, submitGrievance, addStatusUpdate, assignOfficial,
} from '../lib/grievance'

const GrievanceContext = createContext(null)

export function GrievanceProvider({ children }) {
  const { user } = useAuth()
  const [grievances, setGrievances] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncError, setSyncError] = useState(null)

  useEffect(() => {
    if (!user) {
      setGrievances([])
      setLoading(false)
      setSyncError(null)
      return
    }
    setLoading(true)
    setSyncError(null)
    // Pass the viewer so the query itself is scoped by role (required in
    // live Firebase mode — see lib/firestoreGrievance.js). The listener is
    // re-subscribed whenever user.uid or user.role changes (e.g. logout /
    // switch account), and always cleaned up on unmount or before the next
    // subscription — no duplicate listeners left running.
    const unsubscribe = subscribeGrievances(
      (list) => {
        setGrievances(list)
        setLoading(false)
      },
      { uid: user.uid, role: user.role },
      (err) => {
        // A real Firestore error (permission-denied, offline, etc.) — not
        // "you have zero grievances". Surfaced so the UI can tell the
        // difference instead of showing a misleading empty state.
        setSyncError(err?.code || err?.message || 'sync-error')
        setLoading(false)
      }
    )
    return unsubscribe
  }, [user?.uid, user?.role])

  // The query is already scoped server-side (live mode) or at the source
  // (demo mode) — see above — so `grievances` already IS "my grievances" /
  // "assigned to me" depending on role. These stay as plain aliases (not
  // re-filters) so existing farmer/official pages that read
  // myGrievances/assignedToMe keep working unchanged.
  const myGrievances = useMemo(
    () => (user?.role === 'farmer' ? grievances : []),
    [grievances, user]
  )

  const assignedToMe = useMemo(
    () => (user?.role === 'official' ? grievances : []),
    [grievances, user]
  )

  const getById = (id) => grievances.find((g) => g.id === id) || null

  const value = {
    grievances,      // all — used by admin
    myGrievances,    // used by farmer
    assignedToMe,     // used by official
    loading,
    syncError,        // non-null only on a real Firestore error, not "zero results"
    getById,
    submitGrievance,
    addStatusUpdate,
    assignOfficial,
  }

  return <GrievanceContext.Provider value={value}>{children}</GrievanceContext.Provider>
}

export function useGrievances() {
  const ctx = useContext(GrievanceContext)
  if (!ctx) throw new Error('useGrievances must be used within a GrievanceProvider')
  return ctx
}