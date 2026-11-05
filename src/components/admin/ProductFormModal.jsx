import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Plus, Trash2, X } from 'lucide-react'
import { deleteImage, uploadImage } from '../../services/storageService'

const empty = {
  name: '',
  slug: '',
  description: '',
  price: '',
  original_price: '',
  product_type: 'physical',
  fulfillment_type: 'shipping',
  category_id: '',
  pillar: 'physical',
  stock_quantity: 0,
  weight_gram: 0,
  fulfillment_config: {},
  is_active: true,
}

function ProductFormModal({ product, categories, onClose, onSave }) {
  const [form, setForm] = useState(empty)
  const [images, setImages] = useState([])
  const [variants, setVariants] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (product) {
      setForm({
        ...product,
        original_price: product.original_price ?? '',
        fulfillment_config: product.fulfillment_config || {},
      })
      setImages((product.product_images || [])
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map((item) => ({
          url: item.image_url,
          path: item.image_url.includes('/storage/v1/object/public/') ? item.image_url.split('/product-images/').pop() : '',
          alt_text: item.alt_text || product.name,
        })))
      setVariants((product.product_variants || []).map((variant) => ({ ...variant })))
    } else {
      setForm(empty)
      setImages([])
      setVariants([])
    }
  }, [product])

  const typeChanged = (value) => {
    const fulfillment = value === 'physical' ? 'shipping' : value === 'digital' ? 'digital_delivery' : 'manual_service'
    setForm({ ...form, product_type: value, pillar: value, fulfillment_type: fulfillment })
    if (value !== 'physical') setVariants([])
  }

  const upload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const uploaded = await uploadImage('product-images', file, form.slug || 'products')
      setImages([...images, { url: uploaded.url, path: uploaded.path, alt_text: form.name }])
    } catch (caught) {
      setError(caught.message)
    } finally {
      event.target.value = ''
    }
  }

  const removeImage = async (index) => {
    const image = images[index]
    if (image.path) await deleteImage('product-images', image.path).catch(() => {})
    setImages(images.filter((_, itemIndex) => itemIndex !== index))
  }

  const moveImage = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= images.length) return
    const reordered = [...images]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    setImages(reordered)
  }

  const updateVariant = (index, field, value) => {
    setVariants(variants.map((variant, variantIndex) => variantIndex === index ? { ...variant, [field]: value } : variant))
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onSave({
        ...form,
        fulfillment_type: form.product_type === 'physical' ? 'shipping' : form.product_type === 'digital' ? 'digital_delivery' : 'manual_service',
      }, images, variants)
      onClose()
    } catch (caught) {
      setError(caught.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
      <form onSubmit={submit} className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">{product ? 'Edit Produk' : 'Produk Baru'}</h2>
          <button type="button" aria-label="Tutup" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold sm:col-span-2">Nama Produk<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-xl border px-3 py-3" /></label>
          <label className="text-sm font-bold">Slug<input required value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="mt-2 w-full rounded-xl border px-3 py-3" /></label>
          <label className="text-sm font-bold">Kategori<select required value={form.category_id || ''} onChange={(event) => setForm({ ...form, category_id: event.target.value })} className="mt-2 w-full rounded-xl border px-3 py-3"><option value="">Pilih kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="text-sm font-bold">Pilar<select value={form.pillar} onChange={(event) => typeChanged(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-3"><option value="physical">Physical Products</option><option value="digital">Digital Products</option><option value="service">Services & Solutions</option></select></label>
          <label className="text-sm font-bold">Tipe Produk<select value={form.product_type} onChange={(event) => typeChanged(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-3"><option value="physical">Physical</option><option value="digital">Digital</option><option value="service">Service</option></select></label>
          <label className="text-sm font-bold">Harga Normal<input required type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="mt-2 w-full rounded-xl border px-3 py-3" /></label>
          <label className="text-sm font-bold">Harga Diskon (opsional)<input type="number" min="0" value={form.original_price} onChange={(event) => setForm({ ...form, original_price: event.target.value })} className="mt-2 w-full rounded-xl border px-3 py-3" /></label>

          {form.product_type === 'physical' && <>
            <label className="text-sm font-bold">Stok<input type="number" min="0" value={form.stock_quantity} onChange={(event) => setForm({ ...form, stock_quantity: event.target.value })} className="mt-2 w-full rounded-xl border px-3 py-3" /></label>
            <label className="text-sm font-bold">Berat (gram)<input type="number" min="0" value={form.weight_gram} onChange={(event) => setForm({ ...form, weight_gram: event.target.value })} className="mt-2 w-full rounded-xl border px-3 py-3" /></label>
          </>}
          {form.product_type === 'digital' && <label className="text-sm font-bold sm:col-span-2">Link/File/Akses Digital<input value={form.fulfillment_config?.digital_destination || ''} onChange={(event) => setForm({ ...form, fulfillment_config: { ...form.fulfillment_config, digital_destination: event.target.value } })} className="mt-2 w-full rounded-xl border px-3 py-3" /></label>}
          {form.product_type === 'service' && <label className="text-sm font-bold sm:col-span-2">Estimasi pengerjaan (hari)<input type="number" min="1" value={form.fulfillment_config?.estimate_days || ''} onChange={(event) => setForm({ ...form, fulfillment_config: { ...form.fulfillment_config, estimate_days: Number(event.target.value) } })} className="mt-2 w-full rounded-xl border px-3 py-3" /></label>}
          <label className="text-sm font-bold sm:col-span-2">Deskripsi<textarea value={form.description || ''} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 min-h-28 w-full rounded-xl border px-3 py-3" /></label>
          <label className="flex items-center gap-2 text-sm font-bold sm:col-span-2"><input type="checkbox" checked={form.is_active !== false} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />Produk aktif</label>
        </div>

        {form.product_type === 'physical' && (
          <section className="mt-5">
            <div className="flex items-center justify-between"><p className="text-sm font-bold">Variasi Produk</p><button type="button" onClick={() => setVariants([...variants, { variant_name: '', variant_value: '', additional_price: 0, stock_quantity: 0, sku: '', is_active: true }])} className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold"><Plus className="h-3 w-3" />Variasi</button></div>
            <div className="mt-3 space-y-2">
              {variants.map((variant, index) => (
                <div key={variant.id || index} className="grid gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_1fr_1fr_100px_1fr_auto]">
                  <input aria-label="Nama variasi" placeholder="Ukuran/Warna" value={variant.variant_name} onChange={(event) => updateVariant(index, 'variant_name', event.target.value)} className="rounded-lg border px-2 py-2 text-sm" />
                  <input aria-label="Nilai variasi" placeholder="Value" value={variant.variant_value} onChange={(event) => updateVariant(index, 'variant_value', event.target.value)} className="rounded-lg border px-2 py-2 text-sm" />
                  <input aria-label="Harga tambahan" type="number" min="0" placeholder="+Harga" value={variant.additional_price} onChange={(event) => updateVariant(index, 'additional_price', event.target.value)} className="rounded-lg border px-2 py-2 text-sm" />
                  <input aria-label="Stok variasi" type="number" min="0" placeholder="Stok" value={variant.stock_quantity} onChange={(event) => updateVariant(index, 'stock_quantity', event.target.value)} className="rounded-lg border px-2 py-2 text-sm" />
                  <input aria-label="SKU variasi" placeholder="SKU" value={variant.sku || ''} onChange={(event) => updateVariant(index, 'sku', event.target.value)} className="rounded-lg border px-2 py-2 text-sm" />
                  <button type="button" aria-label="Hapus variasi" onClick={() => setVariants(variants.filter((_, variantIndex) => variantIndex !== index))} className="rounded-lg border p-2 text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-4">
          <p className="text-sm font-bold">Gambar Produk</p>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} className="mt-2 block w-full text-sm" />
          <div className="mt-3 flex flex-wrap gap-3">
            {images.map((image, index) => (
              <div key={`${image.url}-${index}`} className="relative h-20 w-20">
                <img src={image.url} alt="" className="h-full w-full rounded-xl object-cover" />
                <button type="button" aria-label="Hapus gambar" onClick={() => removeImage(index)} className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white"><X className="h-3 w-3" /></button>
                <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-white p-1 shadow">
                  <button type="button" aria-label="Pindahkan kiri" disabled={index === 0} onClick={() => moveImage(index, -1)}><ArrowLeft className="h-3 w-3" /></button>
                  <button type="button" aria-label="Pindahkan kanan" disabled={index === images.length - 1} onClick={() => moveImage(index, 1)}><ArrowRight className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border px-4 py-3 text-sm font-bold">Batal</button>
          <button disabled={saving} className="rounded-xl bg-brand-purple px-4 py-3 text-sm font-bold text-white">{saving ? 'Menyimpan...' : 'Simpan Produk'}</button>
        </div>
      </form>
    </div>
  )
}

export default ProductFormModal
