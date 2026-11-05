function PriceDisplay({ price, originalPrice, large = false }) {
  const format = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <strong className={large ? 'text-3xl text-brand-purple' : 'text-lg text-brand-purple'}>{format(price)}</strong>
      {originalPrice > price && <del className="text-sm text-zinc-400">{format(originalPrice)}</del>}
    </div>
  )
}

export default PriceDisplay
