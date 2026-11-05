import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PriceDisplay({ price, originalPrice }) {
  const format = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <strong className="text-lg text-brand-purple">{format(price)}</strong>
      {originalPrice > price && <del className="text-xs text-zinc-400">{format(originalPrice)}</del>}
    </div>
  )
}

function ProductCard({ product }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/produk/${product.slug}`} className="group relative block aspect-[4/3] overflow-hidden bg-zinc-100" aria-label={`Lihat ${product.name}`}>
        <img src={product.images[0]} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold text-brand-deep shadow-sm">{product.productType}</span>
      </Link>
      <div className="p-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">{product.category}</p>
        <h3 className="mb-3 font-bold text-brand-text">{product.name}</h3>
        <div className="flex items-center justify-between gap-3">
          <PriceDisplay price={product.price} originalPrice={product.originalPrice} />
          <Link to={`/produk/${product.slug}`} aria-label={`Lihat detail ${product.name}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-purple text-white transition hover:bg-brand-deep"><ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
