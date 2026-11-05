import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrders } from '../../services/orderService'

const PAGE_SIZE = 10

function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getMyOrders(page, PAGE_SIZE).then((result) => {
      if (active) { setOrders(result.items); setCount(result.count) }
    }).catch((caught) => {
      if (active) setError(caught.message)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [page])

  const format = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-purple">Akun pelanggan</p>
      <h1 className="mt-2 text-3xl font-extrabold">Pesanan Saya</h1>
      {loading && <div className="mt-6 h-40 animate-pulse rounded-3xl bg-zinc-100" />}
      {error && <p role="alert" className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {!loading && !error && !orders.length && <div className="mt-6 rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center"><p className="font-bold">Belum ada pesanan</p><Link to="/katalog" className="mt-4 inline-block text-sm font-bold text-brand-purple">Mulai belanja</Link></div>}
      {!!orders.length && <div className="mt-6 space-y-3">{orders.map((order) => <Link key={order.id} to={`/pesanan/${order.order_number}`} className="block rounded-2xl border border-zinc-100 bg-white p-5 transition hover:border-brand-purple/30"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-extrabold">{order.order_number}</p><p className="mt-1 text-xs text-zinc-500">{new Date(order.created_at).toLocaleString('id-ID')}</p></div><div className="text-right"><strong className="text-brand-purple">{format(order.total_amount)}</strong><div className="mt-1 flex gap-2 text-xs"><span className="rounded-full bg-brand-lavender px-2 py-1">{order.order_status}</span><span className="rounded-full bg-zinc-100 px-2 py-1">{order.payment_status}</span></div></div></div></Link>)}</div>}
      {pageCount > 1 && <div className="mt-6 flex justify-center gap-2">{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button key={number} type="button" onClick={() => setPage(number)} className={`h-10 w-10 rounded-xl text-sm font-bold ${number === page ? 'bg-brand-purple text-white' : 'border border-zinc-200 bg-white'}`}>{number}</button>)}</div>}
    </div>
  )
}

export default OrderHistoryPage
