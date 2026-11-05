import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

function ProtectedAdminRoute() {
  const { user, loading } = useAuth()
  const [roleLoading, setRoleLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let active = true
    if (loading) return undefined
    setRoleLoading(true)
    setIsAdmin(false)
    if (!user || !isSupabaseConfigured) {
      setRoleLoading(false)
      return undefined
    }
    supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle().then(({ data, error }) => {
      if (active) {
        setIsAdmin(!error && data?.role === 'admin')
        setRoleLoading(false)
      }
    })
    return () => { active = false }
  }, [user, loading])

  if (loading || roleLoading) return <div className="flex min-h-screen items-center justify-center bg-brand-bg text-sm text-zinc-500">Memverifikasi akses admin...</div>
  if (!user || !isAdmin) return <Navigate to="/login" replace state={{ adminDenied: true }} />
  return <Outlet />
}

export default ProtectedAdminRoute
