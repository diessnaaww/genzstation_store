import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function CategoryCard({ title, description, icon: Icon, accent, category }) {
  return (
    <Link to={`/katalog${category ? `?category=${encodeURIComponent(category)}` : ''}`} className="group rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}><Icon className="h-6 w-6" aria-hidden="true" /></div>
      <div className="flex items-end justify-between gap-2">
        <div><h3 className="font-bold text-brand-text">{title}</h3><p className="mt-1 text-sm text-zinc-500">{description}</p></div>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-zinc-300 transition group-hover:text-brand-purple" aria-hidden="true" />
      </div>
    </Link>
  )
}

export default CategoryCard
