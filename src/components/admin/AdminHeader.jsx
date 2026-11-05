import { Menu } from 'lucide-react'

function AdminHeader({ title, onMenu }) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-zinc-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3"><button type="button" className="rounded-xl border border-zinc-200 p-2 lg:hidden" aria-label="Buka menu" onClick={onMenu}><Menu className="h-5 w-5" /></button><h1 className="text-lg font-extrabold sm:text-xl">{title}</h1></div>
      <span className="rounded-full bg-brand-lavender px-3 py-1 text-xs font-bold text-brand-deep">Single Seller</span>
    </header>
  )
}

export default AdminHeader
