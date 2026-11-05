import { LayoutDashboard, ListFilter, LogOut, Package, Settings, ShoppingCart, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { signOut } from '../../services/authService'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Produk', icon: Package },
  { to: '/admin/categories', label: 'Kategori', icon: ListFilter },
  { to: '/admin/orders', label: 'Pesanan', icon: ShoppingCart },
  { to: '/admin/settings', label: 'Pengaturan', icon: Settings },
]

function AdminSidebar({ open, onClose }) {
  const { user } = useAuth()
  const handleLogout = async () => { await signOut(); window.location.assign('/login') }
  return (
    <>
      {open && <button aria-label="Tutup menu" type="button" className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-zinc-100 px-5"><div><p className="text-lg font-extrabold text-brand-purple">Genzstation</p><p className="text-xs font-semibold text-zinc-400">Admin Dashboard</p></div><button type="button" className="lg:hidden" aria-label="Tutup" onClick={onClose}><X className="h-5 w-5" /></button></div>
        <nav className="flex-1 space-y-1 p-3">{links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${isActive ? 'bg-brand-lavender text-brand-deep' : 'text-zinc-600 hover:bg-zinc-50'}`}><Icon className="h-4 w-4" />{label}</NavLink>)}</nav>
        <div className="border-t border-zinc-100 p-3"><p className="mb-2 truncate px-3 text-xs text-zinc-400">{user?.email}</p><button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" />Keluar</button></div>
      </aside>
    </>
  )
}

export default AdminSidebar
