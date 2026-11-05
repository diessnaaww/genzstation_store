import { Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import PriceDisplay from '../../components/common/PriceDisplay'
import QuantitySelector from '../../components/common/QuantitySelector'
import { useCart } from '../../contexts/CartContext'

function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart()
  if (!items.length) return <div className="mx-auto max-w-7xl px-4 py-20 text-center"><p className="text-2xl font-extrabold">Keranjang masih kosong</p><Link to="/katalog" className="mt-5 inline-block rounded-xl bg-brand-purple px-5 py-3 text-sm font-bold text-white">Lihat katalog</Link></div>
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-brand-purple">Belanja</p><h1 className="mt-2 text-3xl font-extrabold">Keranjang</h1></div><button type="button" onClick={clearCart} className="text-sm font-bold text-red-600">Kosongkan</button></div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">{items.map((item) => <article key={item.id} className="grid grid-cols-[88px_1fr] gap-4 rounded-3xl border border-zinc-100 bg-white p-4 sm:grid-cols-[112px_1fr_auto]"><Link to={`/produk/${item.slug}`}><img src={item.image || ''} alt={item.name} loading="lazy" className="h-full max-h-28 w-full rounded-2xl bg-zinc-100 object-cover" /></Link><div><p className="text-xs font-bold uppercase text-zinc-400">{item.productType}</p><Link to={`/produk/${item.slug}`} className="mt-1 block font-bold">{item.name}</Link><PriceDisplay price={item.price} /></div><div className="col-start-2 flex items-center justify-between gap-2 sm:col-start-auto sm:flex-col"><QuantitySelector value={item.quantity} onChange={(quantity) => updateQuantity(item.id, quantity)} /><button type="button" onClick={() => removeItem(item.id)} aria-label={`Hapus ${item.name}`} className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div></article>)}</div>
        <aside className="h-fit rounded-3xl border border-zinc-100 bg-white p-6"><h2 className="font-extrabold">Ringkasan</h2><div className="mt-5 flex justify-between text-sm"><span>Subtotal</span><strong>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(subtotal)}</strong></div><Link to="/checkout" className="mt-6 block rounded-xl bg-brand-purple px-4 py-3 text-center text-sm font-bold text-white">Lanjut ke Checkout</Link></aside>
      </div>
    </div>
  )
}

export default CartPage
