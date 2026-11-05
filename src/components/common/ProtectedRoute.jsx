import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

function ProtectedRoute({ children }) {
  const { user, loading, isSupabaseConfigured } = useAuth()
  const location = useLocation()
  if (!isSupabaseConfigured) return <Navigate to="/login" replace state={{ from: location.pathname, configurationRequired: true }} />
  if (loading) return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-zinc-500">Memuat sesi...</div>
  return user ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

export default ProtectedRoute
