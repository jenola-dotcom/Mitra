import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'
import { useLanguage } from '../context/LanguageContext'

/**
 * Wrap any route that requires a logged-in user. Pass `allowedRoles` to
 * additionally restrict the route to specific roles — a farmer hitting
 * /official is redirected to their own dashboard rather than seeing an
 * error, since the role list is fixed and known at login time.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner label={t('common.loading')} />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />
  }

  return children
}

export function roleHome(role) {
  switch (role) {
    case 'farmer':
      return '/farmer'
    case 'official':
      return '/official'
    case 'admin':
      return '/admin'
    default:
      return '/login'
  }
}
