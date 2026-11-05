import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { isSupabaseConfigured, supabase } from '../../services/supabase'
import { createCustomerOrder } from '../../services/orderService'

function CheckoutPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const [addresses, setAddresses] = useState([])
  const [addressId, setAddressId] = useState('')
  const [form, setForm] = useState({ name: '', whatsapp: '', notes: '', brief: '', schedule: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('whatsapp')
  const [shipping, setShipping] = useState({
    recipient_name: '', recipient_phone: '', province: '', city: '', district: '',
    village: '', postal_code: '', detail: '', courier_note: '',
  })

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return
    supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }).then(({ data }) => {
      setAddresses(data || [])
      const defaultAddress = data?.find((address) => address.is_default)
      if (defaultAddress) setAddressId(defaultAddress.id)
    })
  }, [user])

  if (!items.length) return <div className="mx-auto max-w-7xl px-4 py-20 text-center"><p className="text-2xl font-extrabold">Tidak ada produk untuk checkout</p><Link to="/katalog" className="mt-5 inline-block text-brand-purple">Kembali ke katalog</Link></div>

  const hasPhysical = items.some((item) => item.productType === 'physical')
  const hasDigital = items.some((item) => item.productType === 'digital')
  const hasService = items.some((item) => item.productType === 'service')
  const format = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

  const submit = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || !/^(\+62|62|0)[0-9]{8,14}$/.test(form.whatsapp)) {
      setError('Lengkapi nama dan nomor WhatsApp dengan format yang valid.')
      return
    }
    if (!user || !isSupabaseConfigured) {
      setError('Masuk dan hubungkan Supabase sebelum membuat pesanan.')
      return
    }
    let shippingAddress = {}
    if (hasPhysical) {
      if (addressId) {
        const address = addresses.find((item) => item.id === addressId)
        if (!address) {
          setError('Alamat pengiriman tidak ditemukan.')
          return
        }
        shippingAddress = {
          recipient_name: address.recipient_name,
          recipient_phone: address.phone || address.whatsapp,
          province: address.province,
          city: address.city,
          district: address.district,
          village: address.village,
          postal_code: address.postal_code || '',
          detail: address.address_detail || address.detail || '',
          courier_note: address.courier_note || '',
        }
      } else {
        shippingAddress = {
          ...shipping,
          recipient_name: shipping.recipient_name || form.name,
          recipient_phone: shipping.recipient_phone || form.whatsapp,
        }
      }
      if (!shippingAddress.recipient_name || !shippingAddress.recipient_phone || !shippingAddress.detail) {
        setError('Lengkapi nama penerima, nomor penerima, dan detail alamat.')
        return
      }
    }
    if (hasService && !form.brief.trim()) {
      setError('Brief layanan wajib diisi.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const idempotencyKey = crypto.randomUUID()
      const order = await createCustomerOrder({
        items: items.map((item) => ({
          slug: item.slug || item.id,
          quantity: item.quantity,
        })),
        customer: { name: form.name, phone: form.whatsapp, email: user.email || '' },
        shippingAddress,
        notes: [form.notes, hasService ? `Brief: ${form.brief}` : '', form.schedule ? `Jadwal: ${form.schedule}` : ''].filter(Boolean).join('\n'),
        paymentMethod,
        idempotencyKey,
      })
      await clearCart()
      navigate(`/pesanan/${order.order_number}`, { state: { paymentMethod } })
    } catch (caught) {
      setError(caught.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-purple">Review pesanan</p><h1 className="mt-2 text-3xl font-extrabold">Checkout</h1>
      {(hasPhysical || hasDigital || hasService) && <div className="mt-5 rounded-2xl bg-brand-lavender px-4 py-3 text-sm text-brand-deep"><strong>Catatan pemenuhan:</strong> Pesanan mencakup kebutuhan yang berbeda. Barang fisik membutuhkan pengiriman, produk digital dikirim secara digital, dan jasa memerlukan brief serta jadwal.</div>}
      <form onSubmit={submit} className="mt-7 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-zinc-100 bg-white p-6"><h2 className="font-extrabold">Informasi pelanggan</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Nama lengkap<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-3 text-sm font-normal" /></label><label className="text-sm font-bold">WhatsApp<input required value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-3 text-sm font-normal" /></label></div></section>
          {hasPhysical && <section className="rounded-3xl border border-zinc-100 bg-white p-6"><h2 className="font-extrabold">Alamat pengiriman</h2>{user && addresses.length ? <div className="mt-4 space-y-2">{addresses.map((address) => <label key={address.id} className="flex cursor-pointer gap-3 rounded-2xl border border-zinc-200 p-4"><input type="radio" name="address" checked={addressId === address.id} onChange={() => setAddressId(address.id)} /><span><strong>{address.recipient_name}</strong><br /><span className="text-sm text-zinc-500">{address.detail}, {address.city}</span></span></label>)}</div> : <div className="mt-4 grid gap-3 sm:grid-cols-2"><input required placeholder="Nama penerima" value={shipping.recipient_name} onChange={(event) => setShipping({ ...shipping, recipient_name: event.target.value })} className="rounded-xl border border-zinc-200 px-3 py-3 text-sm" /><input required placeholder="Nomor penerima WhatsApp" value={shipping.recipient_phone} onChange={(event) => setShipping({ ...shipping, recipient_phone: event.target.value })} className="rounded-xl border border-zinc-200 px-3 py-3 text-sm" /><input required placeholder="Provinsi" value={shipping.province} onChange={(event) => setShipping({ ...shipping, province: event.target.value })} className="rounded-xl border border-zinc-200 px-3 py-3 text-sm" /><input required placeholder="Kabupaten/Kota" value={shipping.city} onChange={(event) => setShipping({ ...shipping, city: event.target.value })} className="rounded-xl border border-zinc-200 px-3 py-3 text-sm" /><input required placeholder="Kecamatan" value={shipping.district} onChange={(event) => setShipping({ ...shipping, district: event.target.value })} className="rounded-xl border border-zinc-200 px-3 py-3 text-sm" /><input required placeholder="Kelurahan/Desa" value={shipping.village} onChange={(event) => setShipping({ ...shipping, village: event.target.value })} className="rounded-xl border border-zinc-200 px-3 py-3 text-sm" /><input required placeholder="Alamat lengkap" value={shipping.detail} onChange={(event) => setShipping({ ...shipping, detail: event.target.value })} className="sm:col-span-2 rounded-xl border border-zinc-200 px-3 py-3 text-sm" /><input placeholder="Kode pos" value={shipping.postal_code} onChange={(event) => setShipping({ ...shipping, postal_code: event.target.value })} className="rounded-xl border border-zinc-200 px-3 py-3 text-sm" /><input placeholder="Catatan kurir" value={shipping.courier_note} onChange={(event) => setShipping({ ...shipping, courier_note: event.target.value })} className="rounded-xl border border-zinc-200 px-3 py-3 text-sm" /></div>}</section>}
          {hasService && <section className="rounded-3xl border border-zinc-100 bg-white p-6"><h2 className="font-extrabold">Brief layanan</h2><textarea required value={form.brief} onChange={(event) => setForm({ ...form, brief: event.target.value })} placeholder="Jelaskan kebutuhan, referensi, tenggat, dan format hasil" className="mt-4 min-h-32 w-full rounded-xl border border-zinc-200 px-3 py-3 text-sm" /><label className="mt-4 block text-sm font-bold">Preferensi jadwal<input type="datetime-local" value={form.schedule} onChange={(event) => setForm({ ...form, schedule: event.target.value })} className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-3 text-sm font-normal" /></label></section>}
          {hasDigital && <section className="rounded-3xl border border-zinc-100 bg-white p-6"><h2 className="font-extrabold">Pemenuhan digital</h2><p className="mt-2 text-sm text-zinc-500">Produk digital tidak memerlukan alamat pengiriman. Informasi tujuan voucher atau aktivasi akan dikonfirmasi sebelum pemrosesan pesanan.</p></section>}
          <section className="rounded-3xl border border-zinc-100 bg-white p-6"><label className="text-sm font-bold">Catatan pesanan<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Instruksi tambahan (opsional)" className="mt-2 min-h-24 w-full rounded-xl border border-zinc-200 px-3 py-3 text-sm font-normal" /></label></section>
        </div>
        <aside id="order-review" className="h-fit rounded-3xl border border-zinc-100 bg-white p-6"><h2 className="font-extrabold">Ringkasan pesanan</h2><div className="mt-5 space-y-4">{items.map((item) => <div key={item.id} className="flex justify-between gap-3 text-sm"><span>{item.name} × {item.quantity}</span><strong>{format(item.price * item.quantity)}</strong></div>)}</div><div className="mt-5 border-t border-zinc-100 pt-4"><div className="flex justify-between text-sm"><span>Subtotal</span><strong>{format(subtotal)}</strong></div><div className="mt-3 flex justify-between text-sm"><span>Pengiriman</span><span className="text-zinc-500">Belum dihitung</span></div><div className="mt-4 flex justify-between"><span className="font-bold">Total</span><strong className="text-brand-purple">{format(subtotal)}</strong></div></div><fieldset className="mt-5"><legend className="text-sm font-bold">Metode pembayaran</legend><div className="mt-3 space-y-2"><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 p-3 text-sm"><input type="radio" name="payment-method" checked={paymentMethod === 'whatsapp'} onChange={() => setPaymentMethod('whatsapp')} />WhatsApp checkout <span className="ml-auto text-xs text-zinc-400">Unpaid</span></label><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 p-3 text-sm"><input type="radio" name="payment-method" checked={paymentMethod === 'midtrans'} onChange={() => setPaymentMethod('midtrans')} />Midtrans <span className="ml-auto text-xs text-zinc-400">Sandbox</span></label></div></fieldset>{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<button type="submit" disabled={loading} className="mt-6 w-full rounded-xl bg-brand-purple px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? 'Membuat pesanan...' : 'Buat pesanan'}</button><p className="mt-3 text-center text-xs text-zinc-400">Pesanan hanya dianggap berhasil dibuat setelah disimpan di database.</p></aside>
      </form>
    </div>
  )
}

export default CheckoutPage
