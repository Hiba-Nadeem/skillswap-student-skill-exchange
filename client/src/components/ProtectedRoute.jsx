import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from './Loader.jsx'

// Wraps pages that require login. Logged-out users are sent to /login.
export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loader text="Checking your session..." />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

// Wraps login/register. As soon as a user is logged in (including right after
// a successful login or signup), this decides where they go next:
//   - no skills yet  -> profile page in setup mode
//   - otherwise      -> the page they originally wanted, or the dashboard
export function PublicOnlyRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loader />
  if (user) {
    const hasNoSkills = user.skillsToTeach.length === 0 && user.skillsToLearn.length === 0
    const target = hasNoSkills ? '/profile?welcome=1' : location.state?.from || '/dashboard'
    return <Navigate to={target} replace />
  }
  return <Outlet />
}
