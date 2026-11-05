import { Minus, Plus } from 'lucide-react'

function QuantitySelector({ value, onChange, max = 999 }) {
  const change = (amount) => onChange(Math.min(max, Math.max(1, value + amount)))
  return (
    <div className="flex items-center rounded-xl border border-zinc-200 bg-white">
      <button type="button" aria-label="Kurangi jumlah" onClick={() => change(-1)} className="flex h-11 w-11 items-center justify-center"><Minus className="h-4 w-4" /></button>
      <output aria-label="Jumlah produk" className="min-w-12 text-center text-sm font-bold">{value}</output>
      <button type="button" aria-label="Tambah jumlah" onClick={() => change(1)} className="flex h-11 w-11 items-center justify-center"><Plus className="h-4 w-4" /></button>
    </div>
  )
}

export default QuantitySelector
