// Local, in-browser demo authentication.
//
// This is NOT production-secure — it stores users in localStorage with no
// server-side verification, purely so the three-role demo works instantly
// and (from Part 3 onward) offline. It mirrors just enough of the Firebase
// Auth surface (onAuthStateChanged-style subscription, signIn, signUp,
// signOut) that AuthContext can treat both providers the same way.

const USERS_KEY = 'coopconnect_demo_users'
const SESSION_KEY = 'coopconnect_demo_session'

const SEED_USERS = [
  {
    uid: 'demo-farmer-001',
    name: 'Murugan Selvam',
    email: 'farmer@demo.coopconnect.in',
    password: 'Farmer@123',
    role: 'farmer',
    district: 'Madurai',
    state: 'Tamil Nadu',
    phone: '9600000001',
    preferredLanguage: 'ta',
    pacsSociety: 'Madurai East PACS',
  },
  {
    uid: 'demo-official-001',
    name: 'Priya Ramaswamy',
    email: 'official@demo.coopconnect.in',
    password: 'Official@123',
    role: 'official',
    district: 'Madurai',
    state: 'Tamil Nadu',
    phone: '9600000002',
    preferredLanguage: 'en',
    designation: 'PACS Cooperative Officer',
  },
  {
    uid: 'demo-admin-001',
    name: 'Admin User',
    email: 'admin@demo.coopconnect.in',
    password: 'Admin@123',
    role: 'admin',
    district: 'Madurai',
    state: 'Tamil Nadu',
    phone: '9600000003',
    preferredLanguage: 'en',
  },
]

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS))
      return [...SEED_USERS]
    }
    const parsed = JSON.parse(raw)
    // Ensure seed accounts always exist even if localStorage was partially cleared.
    const byEmail = new Map(parsed.map((u) => [u.email, u]))
    for (const seed of SEED_USERS) {
      if (!byEmail.has(seed.email)) byEmail.set(seed.email, seed)
    }
    return [...byEmail.values()]
  } catch {
    return [...SEED_USERS]
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function stripPassword(user) {
  if (!user) return null
  const { password, ...safe } = user
  return safe
}

const listeners = new Set()

function notify() {
  const session = getCurrentUser()
  listeners.forEach((cb) => cb(session))
}

export function onDemoAuthChange(callback) {
  listeners.add(callback)
  // Fire immediately with current state, like Firebase's onAuthStateChanged.
  callback(getCurrentUser())
  return () => listeners.delete(callback)
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export async function demoSignIn(email, password) {
  const users = readUsers()
  const found = users.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase()
  )
  if (!found) {
    throw new Error('No account found with this email.')
  }
  if (found.password !== password) {
    throw new Error('Incorrect password.')
  }
  const safe = stripPassword(found)
  localStorage.setItem(SESSION_KEY, JSON.stringify(safe))
  notify()
  return safe
}

export async function demoSignUp({
  name, email, password, role, district, state, phone, preferredLanguage,
  designation, pacsSociety,
}) {
  if (!['farmer', 'official', 'admin'].includes(role)) {
    throw new Error('Invalid role.')
  }
  const users = readUsers()
  if (users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
    throw new Error('An account with this email already exists.')
  }
  const newUser = {
    uid: `demo-${role}-${Date.now()}`,
    name,
    email,
    password,
    role,
    district: district || '',
    state: state || 'Tamil Nadu',
    phone: phone || '',
    preferredLanguage: preferredLanguage || 'en',
    ...(role === 'official' ? { designation: designation || '' } : {}),
    ...(role === 'farmer' ? { pacsSociety: pacsSociety || '' } : {}),
  }
  users.push(newUser)
  writeUsers(users)
  const safe = stripPassword(newUser)
  localStorage.setItem(SESSION_KEY, JSON.stringify(safe))
  notify()
  return safe
}

export async function demoSignOut() {
  localStorage.removeItem(SESSION_KEY)
  notify()
}

/** Used by the admin "assign official" picker in demo mode. */
export function demoListUsersByRole(role) {
  return readUsers()
    .filter((u) => u.role === role)
    .map(stripPassword)
}

/** Used by the admin user directory (Part 5). */
export function demoListAllUsers() {
  return readUsers().map(stripPassword)
}

export const DEMO_ACCOUNTS = SEED_USERS.map(({ password, ...rest }) => ({
  ...rest,
  password, // intentionally kept here only for the login page's "fill demo credentials" helper
}))
