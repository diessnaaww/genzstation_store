import { Search } from 'lucide-react'

function SearchBar({ value, onChange, placeholder = 'Cari produk, voucher, atau jasa...' }) {
  return (
    <label className="flex w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <Search className="h-5 w-5 shrink-0 text-zinc-400" aria-hidden="true" />
      <span className="sr-only">{placeholder}</span>
      <input type="search" value={value} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-zinc-400" />
    </label>
  )
}

export default SearchBar
