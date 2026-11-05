import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import FilterPanel from '../../components/common/FilterPanel'
import ProductCard from '../../components/common/ProductCard'
import SearchBar from '../../components/common/SearchBar'
import { categories, products } from '../../data/products'
import { useProducts } from '../../hooks/useProducts'
import { isSupabaseConfigured } from '../../lib/supabase'

const PAGE_SIZE = 8

function ShopPage() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [values, setValues] = useState({
    search: params.get('q') || '',
    category: params.get('category') || '',
    type: params.get('type') || '',
    min: params.get('min') || '',
    max: params.get('max') || '',
    sort: params.get('sort') || 'newest',
  })
  const dbCatalog = useProducts({
    page,
    pageSize: PAGE_SIZE,
    search: values.search,
    category: values.category,
    type: values.type,
    minPrice: values.min,
    maxPrice: values.max,
    sort: values.sort,
  })

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 350)
    return () => clearTimeout(timer)
  }, [])

  const updateValues = (next) => {
    setValues(next)
    setPage(1)
    const entries = Object.entries(next).filter(([, value]) => value !== '')
    setParams(Object.fromEntries(entries), { replace: true })
  }

  const resetFilters = () => {
    updateValues({ search: '', category: '', type: '', min: '', max: '', sort: 'newest' })
  }

  const filtered = useMemo(() => {
    const result = products.filter((product) => product.isActive)
      .filter((product) => product.name.toLowerCase().includes(values.search.toLowerCase()))
      .filter((product) => !values.category || product.category === values.category)
      .filter((product) => !values.type || product.productType === values.type)
      .filter((product) => !values.min || product.price >= Number(values.min))
      .filter((product) => !values.max || product.price <= Number(values.max))
    if (values.sort === 'price-low') return [...result].sort((a, b) => a.price - b.price)
    if (values.sort === 'price-high') return [...result].sort((a, b) => b.price - a.price)
    return [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [values])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const databasePageCount = Math.max(1, Math.ceil(dbCatalog.count / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const dbVisible = dbCatalog.items.map((product) => ({
    ...product,
    originalPrice: Number(product.original_price ?? product.price),
    productType: product.product_type,
    stockQuantity: product.stock_quantity,
    category: product.categories?.name || 'Produk',
    images: [...(product.product_images || [])].sort((a, b) => a.display_order - b.display_order).map((image) => image.image_url),
    price: Number(product.price),
  }))

  return (
    <div className="bg-brand-bg">
      <header className="border-b border-zinc-100 bg-white"><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-purple">Katalog Genzstation</p><h1 className="text-3xl font-extrabold">Temukan kebutuhanmu</h1><div className="mt-6 max-w-2xl"><SearchBar value={values.search} onChange={(value) => updateValues({ ...values, search: value })} /></div></div></header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <FilterPanel values={values} onChange={updateValues} onReset={resetFilters} categories={categories} open={filtersOpen} onToggle={() => setFiltersOpen((value) => !value)} />
        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500"><strong className="text-brand-text">{isSupabaseConfigured ? dbCatalog.count : filtered.length}</strong> produk ditemukan</p>
            <label className="flex items-center gap-2 text-sm text-zinc-500">Urutkan<select value={values.sort} onChange={(event) => updateValues({ ...values, sort: event.target.value })} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-brand-text outline-none"><option value="newest">Produk terbaru</option><option value="price-low">Harga terendah</option><option value="price-high">Harga tertinggi</option></select></label>
          </div>
          {dbCatalog.error ? <div role="alert" className="rounded-3xl bg-red-50 px-6 py-10 text-center text-sm text-red-700">{dbCatalog.error}</div> : (isSupabaseConfigured ? dbCatalog.loading : loading) ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-3xl bg-zinc-200" />)}</div> : (isSupabaseConfigured ? dbVisible.length : visible.length) ? <><div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{(isSupabaseConfigured ? dbVisible : visible).map((product) => <ProductCard key={product.id} product={product} />)}</div><div className="mt-8 flex justify-center gap-2">{Array.from({ length: isSupabaseConfigured ? databasePageCount : pageCount }, (_, index) => index + 1).map((number) => <button key={number} type="button" onClick={() => setPage(number)} aria-current={number === safePage ? 'page' : undefined} className={`h-10 w-10 rounded-xl text-sm font-bold ${number === safePage ? 'bg-brand-purple text-white' : 'border border-zinc-200 bg-white'}`}>{number}</button>)}</div></> : <div className="rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center"><p className="font-bold">Produk tidak ditemukan</p><p className="mt-2 text-sm text-zinc-500">Coba ubah kata pencarian atau reset filter.</p><button type="button" onClick={resetFilters} className="mt-5 rounded-xl bg-brand-purple px-4 py-2 text-sm font-bold text-white">Reset filter</button></div>}
        </section>
      </div>
    </div>
  )
}

export default ShopPage
