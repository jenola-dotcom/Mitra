import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { GrievanceProvider } from './context/GrievanceContext'
import ProtectedRoute, { roleHome } from './components/ProtectedRoute'
import AppShell from './components/AppShell'
import LoadingSpinner from './components/LoadingSpinner'
import Login from './pages/Login'
import Register from './pages/Register'
import FarmerDashboard from './pages/dashboards/FarmerDashboard'
import OfficialDashboard from './pages/dashboards/OfficialDashboard'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import FarmerGrievances from './pages/farmer/Grievances'
import Chatbot from './pages/farmer/Chatbot'
import Schemes from './pages/farmer/Schemes'
import PacsFinder from './pages/farmer/PacsFinder'
import OfficialCases from './pages/official/Cases'
import AdminGrievances from './pages/admin/Grievances'
import AdminUsers from './pages/admin/Users'

function Shell({ children }) {
  return <AppShell>{children}</AppShell>
}

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  return <Navigate to={user ? roleHome(user.role) : '/login'} replace />
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (user) return <Navigate to={roleHome(user.role)} replace />
  return children
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <GrievanceProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />

            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

            {/* Farmer */}
            <Route path="/farmer" element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <Shell><FarmerDashboard /></Shell>
              </ProtectedRoute>
            } />
            <Route path="/farmer/chatbot" element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <Shell><Chatbot /></Shell>
              </ProtectedRoute>
            } />
            <Route path="/farmer/schemes" element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <Shell><Schemes /></Shell>
              </ProtectedRoute>
            } />
            <Route path="/farmer/pacs" element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <Shell><PacsFinder /></Shell>
              </ProtectedRoute>
            } />
            <Route path="/farmer/grievances" element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <Shell><FarmerGrievances /></Shell>
              </ProtectedRoute>
            } />

            {/* Official */}
            <Route path="/official" element={
              <ProtectedRoute allowedRoles={['official']}>
                <Shell><OfficialDashboard /></Shell>
              </ProtectedRoute>
            } />
            <Route path="/official/cases" element={
              <ProtectedRoute allowedRoles={['official']}>
                <Shell><OfficialCases /></Shell>
              </ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Shell><AdminDashboard /></Shell>
              </ProtectedRoute>
            } />
            <Route path="/admin/grievances" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Shell><AdminGrievances /></Shell>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Shell><AdminUsers /></Shell>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </GrievanceProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}
