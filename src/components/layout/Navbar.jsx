import { Menu, ShoppingBag, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'

const links = [['/', 'Beranda'], ['/katalog', 'Katalog'], ['/tentang', 'Tentang'], ['/kontak', 'Kontak']]

function Navbar() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const { count } = useCart()
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/95 backdrop-blur">
      <div className="bg-brand-deep px-4 py-2 text-center text-xs font-semibold text-white">Gratis ongkir area terpilih untuk pesanan tertentu · Promo berlaku terbatas</div>
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Navigasi utama">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-brand-deep"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-purple text-sm text-white">GS</span><span>Genzstation<span className="text-brand-coral">.</span></span></Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => `text-sm font-semibold transition hover:text-brand-purple ${isActive ? 'text-brand-purple' : 'text-zinc-600'}`}>{label}</NavLink>)}
        </div>
        <div className="flex items-center gap-2">
          <Link to={user ? '/akun' : '/login'} aria-label="Profil pelanggan" className="hidden h-10 w-10 items-center justify-center rounded-full text-zinc-600 hover:bg-brand-lavender sm:flex"><UserRound className="h-5 w-5" /></Link>
          <Link to="/keranjang" aria-label="Keranjang belanja" className="relative flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 hover:bg-brand-lavender"><ShoppingBag className="h-5 w-5" /><span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-coral px-1 text-[10px] font-bold text-white">{count}</span></Link>
          <button type="button" aria-label={open ? 'Tutup menu' : 'Buka menu'} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex h-10 w-10 items-center justify-center rounded-full md:hidden">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </nav>
      {open && <div className="border-t border-zinc-100 bg-white px-4 py-4 md:hidden"><div className="flex flex-col gap-1">{links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `rounded-xl px-4 py-3 text-sm font-semibold ${isActive ? 'bg-brand-lavender text-brand-purple' : 'text-zinc-600'}`}>{label}</NavLink>)}</div></div>}
    </header>
  )
}

export default Navbar
