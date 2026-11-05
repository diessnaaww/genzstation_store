import { RotateCcw, SlidersHorizontal } from 'lucide-react'

function FilterPanel({ values, onChange, onReset, categories, open, onToggle }) {
  const update = (key, value) => onChange({ ...values, [key]: value })
  return (
    <>
      <button type="button" onClick={onToggle} className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold lg:hidden"><SlidersHorizontal className="h-4 w-4" /> Filter produk</button>
      <aside className={`${open ? 'block' : 'hidden'} rounded-3xl border border-zinc-100 bg-white p-5 lg:block`}>
        <div className="mb-6 flex items-center justify-between"><h2 className="font-bold">Filter</h2><button type="button" onClick={onReset} className="flex items-center gap-1 text-xs font-bold text-brand-purple"><RotateCcw className="h-3.5 w-3.5" /> Reset</button></div>
        <div className="space-y-6">
          <fieldset><legend className="mb-3 text-sm font-bold">Tipe produk</legend><div className="space-y-2">{[['', 'Semua'], ['physical', 'Produk fisik'], ['digital', 'Produk digital'], ['service', 'Jasa']].map(([value, label]) => <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600"><input type="radio" name="productType" checked={values.type === value} onChange={() => update('type', value)} className="accent-violet-600" />{label}</label>)}</div></fieldset>
          <fieldset><legend className="mb-3 text-sm font-bold">Kategori</legend><div className="max-h-64 space-y-2 overflow-y-auto pr-1">{categories.map((category) => <label key={category.name} className="flex cursor-pointer items-start gap-2 text-sm text-zinc-600"><input type="radio" name="category" checked={values.category === category.name} onChange={() => update('category', category.name)} className="mt-1 accent-violet-600" /><span>{category.name}</span></label>)}</div></fieldset>
          <fieldset><legend className="mb-3 text-sm font-bold">Rentang harga</legend><div className="grid grid-cols-2 gap-2"><input aria-label="Harga minimum" type="number" min="0" value={values.min} onChange={(event) => update('min', event.target.value)} placeholder="Min" className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-brand-purple" /><input aria-label="Harga maksimum" type="number" min="0" value={values.max} onChange={(event) => update('max', event.target.value)} placeholder="Max" className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-brand-purple" /></div></fieldset>
        </div>
      </aside>
    </>
  )
}

export default FilterPanel
