import { Mail, MessageCircle, Package, Smartphone, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import CategoryCard from '../../components/common/CategoryCard'
import ProductCard from '../../components/common/ProductCard'
import SearchBar from '../../components/common/SearchBar'
import { categoryGroups } from '../../data/homeData'
import { products } from '../../data/products'
import { useCategories } from '../../hooks/useCategories'
import { useProducts } from '../../hooks/useProducts'
import { isSupabaseConfigured } from '../../lib/supabase'

const categoryIcons = { Package, Smartphone, Sparkles }

function ProductSection({ eyebrow, title, items, linkTo }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-coral">{eyebrow}</p><h2 className="text-2xl font-extrabold sm:text-3xl">{title}</h2></div>
        <Link to={linkTo || '/katalog'} className="text-sm font-bold text-brand-purple">Lihat semua</Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{items.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    </section>
  )
}

function HomePage() {
  const [search, setSearch] = useState('')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const { categories: databaseCategories } = useCategories()
  const newestDatabase = useProducts({ page: 1, pageSize: 8, sort: 'newest' })
  const newArrivals = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4)
  const bestSellers = products.filter((product) => product.bestSeller).slice(0, 4)
  const physical = products.filter((product) => product.productType === 'physical').slice(0, 4)
  const digital = products.filter((product) => product.productType === 'digital').slice(0, 4)
  const services = products.filter((product) => product.productType === 'service').slice(0, 4)
  const databaseNewest = newestDatabase.items.map((product) => ({
    ...product,
    slug: product.slug,
    originalPrice: Number(product.original_price ?? product.price),
    price: Number(product.price),
    productType: product.product_type,
    stockQuantity: product.stock_quantity,
    category: product.categories?.name || 'Produk',
    images: [...(product.product_images || [])].sort((a, b) => a.display_order - b.display_order).map((image) => image.image_url),
  }))
  const newestItems = isSupabaseConfigured && databaseNewest.length ? databaseNewest.slice(0, 4) : newArrivals

  return (
    <>
      <section className="relative overflow-hidden bg-brand-lavender/60">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-lime/60 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.1fr_.9fr] md:py-20 lg:px-8">
          <div className="relative">
            <p className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold text-brand-purple shadow-sm">ONE-STOP SHOPPING FOR GEN Z</p>
            <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-brand-text sm:text-5xl lg:text-6xl">Semua kebutuhanmu, <span className="text-brand-purple">satunya di sini.</span></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">Produk fisik, kebutuhan digital, dan layanan kreatif dalam satu toko yang mudah diakses.</p>
            <div className="mt-8 max-w-xl"><SearchBar value={search} onChange={setSearch} /></div>
            <div className="mt-6 flex flex-wrap gap-3"><Link to={`/katalog${search ? `?q=${encodeURIComponent(search)}` : ''}`} className="rounded-xl bg-brand-purple px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-purple/20 transition hover:bg-brand-deep">Cari Produk</Link><a href="https://wa.me/6280000000000" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-brand-purple/20 bg-white px-5 py-3 text-sm font-bold text-brand-purple transition hover:border-brand-purple"><MessageCircle className="h-4 w-4" /> Chat WhatsApp</a></div>
          </div>
          <div className="relative hidden min-h-[360px] items-center justify-center md:flex"><div className="absolute h-72 w-72 rounded-full bg-brand-purple shadow-2xl shadow-brand-purple/20" /><div className="relative grid w-64 rotate-3 grid-cols-2 gap-3"><div className="h-36 rounded-3xl bg-white p-5 shadow-xl"><span className="text-4xl">✨</span><p className="mt-8 text-xs font-bold">Lifestyle</p></div><div className="mt-8 h-36 rounded-3xl bg-brand-lime p-5 shadow-xl"><span className="text-4xl">📱</span><p className="mt-8 text-xs font-bold">Digital</p></div><div className="-mt-5 h-36 rounded-3xl bg-brand-coral p-5 text-white shadow-xl"><span className="text-4xl">🎨</span><p className="mt-8 text-xs font-bold">Creative</p></div><div className="mt-2 h-36 rounded-3xl bg-white p-5 shadow-xl"><span className="text-4xl">🛍️</span><p className="mt-8 text-xs font-bold">Favorite</p></div></div></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8"><p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-purple">Kategori unggulan</p><h2 className="text-2xl font-extrabold sm:text-3xl">Jelajahi semua kebutuhan</h2></div>
        {isSupabaseConfigured && databaseCategories.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {databaseCategories.map((category) => (
              <Link key={category.id} to={`/katalog?category=${encodeURIComponent(category.name)}`} className="rounded-full border border-brand-purple/20 bg-white px-4 py-2 text-sm font-bold text-brand-purple hover:bg-brand-lavender">{category.name}</Link>
            ))}
          </div>
        )}
        <div className="grid gap-5 lg:grid-cols-3">{categoryGroups.map((group) => <div key={group.title}><div className="mb-4 flex items-center gap-3 rounded-3xl border border-zinc-100 bg-white p-4"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${group.accent}`}>{(() => { const Icon = categoryIcons[group.iconName]; return <Icon className="h-6 w-6" /> })()}</div><div><h3 className="font-extrabold">{group.title}</h3><p className="text-xs text-zinc-500">{group.description}</p></div></div><div className="grid gap-2">{group.categories.map((category) => <CategoryCard key={category} title={category} description="Lihat koleksi" icon={categoryIcons[group.iconName]} accent={group.accent} category={category} />)}</div></div>)}</div>
      </section>

      <div className="bg-white"><ProductSection eyebrow="Favorit pelanggan" title="Produk terlaris" items={bestSellers} /></div>
      <ProductSection eyebrow="Baru datang" title="Produk terbaru" items={newestItems} />
      <div className="bg-white"><ProductSection eyebrow="Produk fisik" title="Fashion, beauty & lifestyle" items={physical} linkTo="/katalog?type=physical" /></div>
      <ProductSection eyebrow="Produk digital" title="Cepat, praktis, dan legal" items={digital} linkTo="/katalog?type=digital" />
      <div className="bg-white"><ProductSection eyebrow="Services & Solutions" title="Layanan kreatif pilihan" items={services} linkTo="/katalog?type=service" /></div>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-deep px-6 py-10 text-white sm:px-10 md:flex md:items-center md:justify-between">
          <div className="relative max-w-xl"><p className="text-sm font-bold text-brand-lime">Promo & update</p><h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Dapatkan info produk baru dan penawaran spesial.</h2></div>
          {subscribed ? <p role="status" className="mt-6 rounded-xl bg-white/10 px-5 py-3 text-sm font-bold md:mt-0">Terima kasih! Pendaftaran promo UI sudah dicatat.</p> : <form onSubmit={(event) => { event.preventDefault(); setSubscribed(true) }} className="mt-6 flex max-w-md gap-2 md:mt-0"><label className="sr-only" htmlFor="newsletter-email">Email newsletter</label><div className="flex min-w-0 flex-1 items-center rounded-xl bg-white px-3 text-brand-text"><Mail className="h-4 w-4 text-zinc-400" /><input id="newsletter-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email kamu" className="min-w-0 flex-1 border-0 px-3 py-3 text-sm outline-none" /></div><button type="submit" className="rounded-xl bg-brand-lime px-4 text-sm font-bold text-brand-deep">Daftar</button></form>}
        </div>
      </section>
    </>
  )
}

export default HomePage
