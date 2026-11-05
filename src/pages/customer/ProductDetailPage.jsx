import { ArrowLeft, CheckCircle2, PackageCheck, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PriceDisplay from '../../components/common/PriceDisplay'
import ProductCard from '../../components/common/ProductCard'
import QuantitySelector from '../../components/common/QuantitySelector'
import { products } from '../../data/products'
import { useCart } from '../../contexts/CartContext'
import { getProductBySlug } from '../../services/productService'
import { isSupabaseConfigured } from '../../lib/supabase'

function ProductDetailPage() {
  const { slug } = useParams()
  const staticProduct = products.find((item) => item.slug === slug)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [cartMessage, setCartMessage] = useState('')
  const [databaseProduct, setDatabaseProduct] = useState(null)
  const [databaseLoading, setDatabaseLoading] = useState(isSupabaseConfigured)
  const [databaseError, setDatabaseError] = useState('')
  const { addItem } = useCart()

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    let active = true
    getProductBySlug(slug).then((data) => {
      if (!active) return
      setDatabaseProduct(data)
    }).catch((error) => {
      if (active) setDatabaseError(error.message)
    }).finally(() => {
      if (active) setDatabaseLoading(false)
    })
    return () => { active = false }
  }, [slug])

  const product = databaseProduct ? {
    ...databaseProduct,
    originalPrice: Number(databaseProduct.original_price ?? databaseProduct.price),
    price: Number(databaseProduct.price),
    productType: databaseProduct.product_type,
    stockQuantity: databaseProduct.stock_quantity,
    category: databaseProduct.categories?.name || 'Produk',
    fulfillmentType: databaseProduct.fulfillment_type,
    images: [...(databaseProduct.product_images || [])].sort((a, b) => a.display_order - b.display_order).map((image) => image.image_url),
  } : staticProduct

  if (databaseLoading && isSupabaseConfigured) return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-zinc-500">Memuat detail produk...</div>
  if (databaseError && isSupabaseConfigured) return <div className="mx-auto max-w-7xl px-4 py-20 text-center"><p role="alert" className="text-red-700">{databaseError}</p></div>
  if (!product) return <div className="mx-auto max-w-7xl px-4 py-20 text-center"><p className="text-2xl font-extrabold">Produk tidak ditemukan</p><Link to="/katalog" className="mt-5 inline-block text-brand-purple">Kembali ke katalog</Link></div>

  const related = products.filter((item) => item.isActive && item.id !== product.id && item.category === product.category || item.isActive && item.id !== product.id && item.productType === product.productType).filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index).slice(0, 4)
  const fulfillmentIcon = product.productType === 'physical' ? PackageCheck : CheckCircle2
  const FulfillmentIcon = fulfillmentIcon

  const addToCart = async () => {
    await addItem(product, quantity)
    setCartMessage(`${quantity} produk ditambahkan ke keranjang sementara.`)
  }

  return (
    <div className="bg-brand-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/katalog" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-brand-purple"><ArrowLeft className="h-4 w-4" /> Kembali ke katalog</Link>
        <div className="grid gap-8 rounded-[2rem] bg-white p-4 sm:p-6 lg:grid-cols-[1.05fr_.95fr] lg:p-8">
          <div><div className="aspect-[4/3] overflow-hidden rounded-3xl bg-zinc-100"><img src={product.images[activeImage]} alt={product.name} className="h-full w-full object-cover" /></div><div className="mt-3 flex gap-3">{product.images.map((image, index) => <button key={image} type="button" onClick={() => setActiveImage(index)} aria-label={`Gambar ${index + 1}`} className={`h-16 w-16 overflow-hidden rounded-xl border-2 ${activeImage === index ? 'border-brand-purple' : 'border-transparent'}`}><img src={image} alt="" loading="lazy" className="h-full w-full object-cover" /></button>)}</div></div>
          <div>
            <div className="mb-4 flex flex-wrap gap-2"><span className="rounded-full bg-brand-lavender px-3 py-1 text-xs font-bold text-brand-deep">{product.category}</span><span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600">{product.productType}</span></div>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">{product.name}</h1>
            <div className="mt-5"><PriceDisplay price={product.price} originalPrice={product.originalPrice} large /></div>
            <p className="mt-6 leading-7 text-zinc-600">{product.description}</p>
            <div className="mt-6 rounded-2xl bg-brand-bg p-4"><div className="flex gap-3"><FulfillmentIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-purple" /><div><p className="text-sm font-bold">{product.productType === 'physical' ? `Stok tersedia: ${product.stockQuantity}` : product.productType === 'digital' ? 'Pemenuhan digital' : 'Pemenuhan melalui brief dan jadwal'}</p><p className="mt-1 text-sm text-zinc-500">{product.fulfillmentType}</p></div></div></div>
            <div className="mt-7 flex flex-wrap items-center gap-3"><QuantitySelector value={quantity} onChange={setQuantity} max={product.productType === 'physical' ? product.stockQuantity : 999} /><button type="button" onClick={addToCart} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-purple px-5 text-sm font-bold text-white hover:bg-brand-deep"><ShoppingBag className="h-4 w-4" /> Tambah ke Keranjang</button></div>
            {cartMessage && <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{cartMessage}</p>}
          </div>
        </div>
      </div>
      {related.length > 0 && <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"><h2 className="mb-6 text-2xl font-extrabold">Produk terkait</h2><div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
    </div>
  )
}

export default ProductDetailPage
