import { useCallback, useEffect, useState } from 'react'
import { MessageCircle, RefreshCw } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { checkPaymentStatus, createMidtransPayment, getMyOrder } from '../../services/orderService'
import { supabase, isSupabaseConfigured } from '../../services/supabase'

function OrderDetailPage() {
  const { orderNumber } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  const load = useCallback(async () => {
    try { setOrder(await getMyOrder(orderNumber)) } catch (caught) { setError(caught.message) } finally { setLoading(false) }
  }, [orderNumber])

  useEffect(() => { load() }, [load])

  const format = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

  const openWhatsApp = async () => {
    let phone = '6280000000000'
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('store_settings').select('value').eq('key', 'whatsapp_admin_number').maybeSingle()
      if (data?.value) phone = data.value
    }
    const lines = [
      `Halo Admin Genzstation, saya ingin mengonfirmasi pesanan ${order.order_number}.`,
      `Nama: ${order.customer_name}`,
      ...order.order_items.map((item) => `- ${item.product_name_snapshot} x${item.quantity}`),
      `Total: ${format(order.total_amount)}`,
      `Pemenuhan: ${order.fulfillment_type || 'mixed'}`,
      order.customer_notes ? `Catatan: ${order.customer_notes}` : '',
    ].filter(Boolean)
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer')
  }

  const pay = async () => {
    setActionMessage('')
    try {
      const result = await createMidtransPayment(order.id)
      if (result?.payment_url) window.location.assign(result.payment_url)
      else setActionMessage(result?.message || 'Sesi pembayaran belum tersedia.')
    } catch (caught) { setActionMessage(caught.message) }
  }

  const refreshPayment = async () => {
    setActionMessage('')
    try { await checkPaymentStatus(order.id); await load(); setActionMessage('Status pembayaran diperbarui.') } catch (caught) { setActionMessage(caught.message) }
  }

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-20 text-center text-zinc-500">Memuat pesanan...</div>
  if (error) return <div className="mx-auto max-w-5xl px-4 py-20 text-center"><p role="alert" className="text-red-700">{error}</p><Link to="/pesanan" className="mt-4 inline-block text-brand-purple">Kembali ke pesanan</Link></div>
  if (!order) return <div className="mx-auto max-w-5xl px-4 py-20 text-center font-bold">Pesanan tidak ditemukan.</div>

  const payment = order.payments?.[0]
  const canPay = payment?.provider === 'midtrans' || payment?.payment_method === 'midtrans'

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/pesanan" className="text-sm font-bold text-brand-purple">← Semua pesanan</Link>
      <div className="mt-5 rounded-3xl border border-zinc-100 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-brand-purple">Nomor pesanan</p><h1 className="mt-2 text-2xl font-extrabold">{order.order_number}</h1></div><div className="flex gap-2"><span className="h-fit rounded-full bg-brand-lavender px-3 py-2 text-xs font-bold">{order.order_status}</span><span className="h-fit rounded-full bg-zinc-100 px-3 py-2 text-xs font-bold">{order.payment_status}</span></div></div>
        <div className="mt-7 border-t border-zinc-100 pt-5"><h2 className="font-extrabold">Produk</h2><div className="mt-4 space-y-3">{order.order_items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><div><p className="font-bold">{item.product_name_snapshot}</p><p className="mt-1 text-xs text-zinc-500">{item.product_type} · {item.fulfillment_type} · {item.quantity} item</p></div><strong>{format(item.line_total)}</strong></div>)}</div><div className="mt-6 border-t border-zinc-100 pt-5 text-right"><p className="text-sm text-zinc-500">Subtotal <strong className="ml-3 text-brand-text">{format(order.subtotal)}</strong></p><p className="mt-2 text-lg font-extrabold">Total <strong className="ml-3 text-brand-purple">{format(order.total_amount)}</strong></p></div></div>
        {order.shipping_address_snapshot?.detail && <div className="mt-6 rounded-2xl bg-brand-bg p-4"><p className="text-sm font-bold">Alamat pengiriman</p><p className="mt-2 text-sm text-zinc-600">{order.recipient_name} · {order.recipient_phone}<br />{order.shipping_address_snapshot.detail}, {order.shipping_address_snapshot.city}</p></div>}
        <div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={openWhatsApp} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white"><MessageCircle className="h-4 w-4" />Hubungi Admin via WhatsApp</button>{canPay && <button type="button" onClick={pay} className="rounded-xl bg-brand-purple px-4 py-3 text-sm font-bold text-white">Lanjutkan pembayaran</button>}<button type="button" onClick={refreshPayment} className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold"><RefreshCw className="h-4 w-4" />Periksa status</button></div>
        {actionMessage && <p role="status" className="mt-4 rounded-xl bg-brand-lavender px-4 py-3 text-sm text-brand-deep">{actionMessage}</p>}
      </div>
    </div>
  )
}

export default OrderDetailPage
