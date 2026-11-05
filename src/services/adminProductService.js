import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getSafeErrorMessage } from '../utils/errorHandler'

function ensure() { if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.') }

export async function getAdminProducts() {
  ensure()
  const { data, error } = await supabase.from('products').select('*,categories(id,name,pillar),product_images(*),product_variants(*)').order('created_at', { ascending:false })
  if (error) throw new Error(getSafeErrorMessage(error))
  return data || []
}

export async function saveAdminProduct(product, images = [], variants = []) {
  ensure()
  const payload = {
    name: product.name, slug: product.slug, description: product.description,
    price: Number(product.price), original_price: product.original_price === '' ? null : Number(product.original_price),
    product_type: product.product_type, fulfillment_type: product.fulfillment_type,
    category_id: product.category_id || null, pillar: product.pillar || product.product_type,
    stock_quantity: Number(product.stock_quantity || 0), weight_gram: Number(product.weight_gram || 0),
    fulfillment_config: product.fulfillment_config || {}, is_active: product.is_active !== false,
  }
  let result
  if (product.id) result = await supabase.from('products').update(payload).eq('id',product.id).select().single()
  else result = await supabase.from('products').insert(payload).select().single()
  if (result.error) throw new Error(getSafeErrorMessage(result.error))
  const productId = result.data.id
  await supabase.from('product_images').delete().eq('product_id',productId)
  if (images.length) {
    const rows = images.map((image,index) => ({ product_id:productId,image_url:image.url,alt_text:image.alt_text||product.name,display_order:index }))
    const { error } = await supabase.from('product_images').insert(rows)
    if (error) throw new Error(getSafeErrorMessage(error))
  }
  await supabase.from('product_variants').delete().eq('product_id', productId)
  if (variants.length) {
    const variantRows = variants
      .filter((variant) => variant.variant_name?.trim() && variant.variant_value?.trim())
      .map((variant) => ({
        product_id: productId,
        variant_name: variant.variant_name.trim(),
        variant_value: variant.variant_value.trim(),
        additional_price: Number(variant.additional_price || 0),
        stock_quantity: Number(variant.stock_quantity || 0),
        sku: variant.sku?.trim() || null,
        is_active: variant.is_active !== false,
      }))
    if (variantRows.length) {
      const { error } = await supabase.from('product_variants').insert(variantRows)
      if (error) throw new Error(getSafeErrorMessage(error))
    }
  }
  return result.data
}

export async function deleteAdminProduct(id) {
  ensure()
  const { error } = await supabase.from('products').delete().eq('id',id)
  if (error) throw new Error(getSafeErrorMessage(error))
}
