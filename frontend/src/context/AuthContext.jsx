import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../lib/firebase'
import {
  onDemoAuthChange,
  demoSignIn,
  demoSignUp,
  demoSignOut,
} from '../lib/demoAuth'

const AuthContext = createContext(null)

const VALID_ROLES = ['farmer', 'official', 'admin']

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // { uid, name, email, role, district, state, ... }
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsub = onAuthStateChanged(auth, async (fbUser) => {
        if (!fbUser) {
          setUser(null)
          setLoading(false)
          return
        }
        try {
          const profileRef = doc(db, 'users', fbUser.uid)
          const snap = await getDoc(profileRef)
          if (snap.exists()) {
            setUser({ uid: fbUser.uid, email: fbUser.email, ...snap.data() })
          } else {
            // Auth record exists but no Firestore profile (shouldn't normally happen).
            setUser(null)
          }
        } catch (err) {
          console.error('Failed to load user profile:', err)
          setUser(null)
        } finally {
          setLoading(false)
        }
      })
      return unsub
    }

    // Demo mode
    const unsub = onDemoAuthChange((session) => {
      setUser(session)
      setLoading(false)
    })
    return unsub
  }, [])

  const login = useCallback(async (email, password) => {
    setAuthError('')
    try {
      if (isFirebaseConfigured) {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        const snap = await getDoc(doc(db, 'users', cred.user.uid))
        if (!snap.exists()) {
          throw new Error('No profile found for this account. Contact an administrator.')
        }
        return { uid: cred.user.uid, email: cred.user.email, ...snap.data() }
      }
      return await demoSignIn(email, password)
    } catch (err) {
      const message = humanizeAuthError(err)
      setAuthError(message)
      throw new Error(message)
    }
  }, [])

  const register = useCallback(async (form) => {
    setAuthError('')
    const {
      name, email, password, role, district, state, phone, preferredLanguage,
      designation, pacsSociety,
    } = form
    if (!VALID_ROLES.includes(role)) {
      const msg = 'Please select a valid role.'
      setAuthError(msg)
      throw new Error(msg)
    }
    try {
      if (isFirebaseConfigured) {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        const profile = {
          name,
          role,
          district: district || '',
          state: state || 'Tamil Nadu',
          phone: phone || '',
          preferredLanguage: preferredLanguage || 'en',
          ...(role === 'official' ? { designation: designation || '' } : {}),
          ...(role === 'farmer' ? { pacsSociety: pacsSociety || '' } : {}),
          createdAt: serverTimestamp(),
        }
        await setDoc(doc(db, 'users', cred.user.uid), profile)
        return { uid: cred.user.uid, email: cred.user.email, ...profile }
      }
      return await demoSignUp(form)
    } catch (err) {
      const message = humanizeAuthError(err)
      setAuthError(message)
      throw new Error(message)
    }
  }, [])

  const logout = useCallback(async () => {
    if (isFirebaseConfigured) {
      await firebaseSignOut(auth)
    } else {
      await demoSignOut()
    }
    setUser(null)
  }, [])

  const value = {
    user,
    loading,
    authError,
    login,
    register,
    logout,
    isDemoMode: !isFirebaseConfigured,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

function humanizeAuthError(err) {
  const code = err?.code || ''
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address looks invalid.'
    case 'auth/user-not-found':
      return 'No account found with this email.'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    default:
      return err?.message || 'Something went wrong. Please try again.'
  }
}
