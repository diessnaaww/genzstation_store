import { useEffect, useMemo, useState } from 'react'
import { Edit3, Plus, Trash2 } from 'lucide-react'
import ProductFormModal from '../../components/admin/ProductFormModal'
import { deleteAdminProduct, getAdminProducts, saveAdminProduct } from '../../services/adminProductService'
import { getAdminCategories } from '../../services/adminCategoryService'

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [selected, setSelected] = useState(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [pillar, setPillar] = useState('')
  const [category, setCategory] = useState('')
  const [stock, setStock] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [productData, categoryData] = await Promise.all([getAdminProducts(), getAdminCategories()])
      setProducts(productData)
      setCategories(categoryData)
    } catch (caught) {
      setError(caught.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => products.filter((product) => {
    if (query && !product.name?.toLowerCase().includes(query.toLowerCase())) return false
    if (type && product.product_type !== type) return false
    if (pillar && product.pillar !== pillar && product.product_type !== pillar) return false
    if (category && product.category_id !== category) return false
    if (stock === 'low' && !(product.product_type === 'physical' && Number(product.stock_quantity) < 5)) return false
    if (stock === 'out' && !(product.product_type === 'physical' && Number(product.stock_quantity) <= 0)) return false
    if (stock === 'active' && !product.is_active) return false
    if (stock === 'inactive' && product.is_active) return false
    return true
  }), [products, query, type, pillar, category, stock])

  const save = async (form, images, variants) => {
    await saveAdminProduct(form, images, variants)
    await load()
    setToast(form.id ? 'Produk diperbarui' : 'Produk berhasil ditambahkan')
  }

  const remove = async (product) => {
    if (!window.confirm(`Hapus ${product.name}?`)) return
    try {
      await deleteAdminProduct(product.id)
      await load()
      setToast('Produk dihapus')
    } catch (caught) {
      setError(caught.message)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-bold uppercase text-brand-purple">Katalog</p><h2 className="mt-1 text-2xl font-extrabold">Produk</h2></div>
        <button type="button" onClick={() => { setSelected(null); setOpen(true) }} className="flex items-center gap-2 rounded-xl bg-brand-purple px-4 py-3 text-sm font-bold text-white"><Plus className="h-4 w-4" />Tambah Produk</button>
      </div>

      {toast && <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{toast}</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <input aria-label="Cari produk" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama produk..." className="min-w-52 rounded-xl border bg-white px-3 py-2 text-sm" />
        <select aria-label="Filter tipe" value={type} onChange={(event) => setType(event.target.value)} className="rounded-xl border bg-white px-3 py-2 text-sm"><option value="">Semua tipe</option><option value="physical">Physical</option><option value="digital">Digital</option><option value="service">Service</option></select>
        <select aria-label="Filter pilar" value={pillar} onChange={(event) => setPillar(event.target.value)} className="rounded-xl border bg-white px-3 py-2 text-sm"><option value="">Semua pilar</option><option value="physical">Physical Products</option><option value="digital">Digital Products</option><option value="service">Services & Solutions</option></select>
        <select aria-label="Filter kategori" value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border bg-white px-3 py-2 text-sm"><option value="">Semua kategori</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <select aria-label="Filter stok" value={stock} onChange={(event) => setStock(event.target.value)} className="rounded-xl border bg-white px-3 py-2 text-sm"><option value="">Semua status stok</option><option value="low">Stok rendah (&lt; 5)</option><option value="out">Stok habis</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select>
      </div>

      {loading ? <div className="mt-5 h-60 animate-pulse rounded-2xl bg-zinc-200" /> : filtered.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed bg-white py-16 text-center text-zinc-500">Tidak ada produk.</div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-zinc-100 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-zinc-50 text-xs uppercase text-zinc-400"><tr><th className="p-4">Produk</th><th className="p-4">Kategori</th><th className="p-4">Tipe</th><th className="p-4">Harga</th><th className="p-4">Stok</th><th className="p-4">Status</th><th className="p-4" /></tr></thead>
            <tbody>{filtered.map((product) => (
              <tr key={product.id} className="border-b last:border-0">
                <td className="p-4 font-bold">{product.name}</td><td className="p-4">{product.categories?.name || '-'}</td><td className="p-4">{product.product_type}</td>
                <td className="p-4">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}</td>
                <td className="p-4">{product.product_type === 'physical' ? product.stock_quantity : '-'}</td>
                <td className="p-4"><span className={`rounded-full px-2 py-1 text-xs font-bold ${product.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>{product.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
                <td className="p-4"><div className="flex gap-2"><button type="button" aria-label="Edit produk" onClick={() => { setSelected(product); setOpen(true) }} className="rounded-lg border p-2"><Edit3 className="h-4 w-4" /></button><button type="button" aria-label="Hapus produk" onClick={() => remove(product)} className="rounded-lg border p-2 text-red-600"><Trash2 className="h-4 w-4" /></button></div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {open && <ProductFormModal product={selected} categories={categories} onClose={() => setOpen(false)} onSave={save} />}
    </div>
  )
}

export default AdminProducts
