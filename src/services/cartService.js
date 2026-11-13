import { supabase, isSupabaseConfigured } from '../services/googleSheets.js'
import { getSafeErrorMessage } from '../utils/errorHandler'

export async function getCart(userId) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const { data, error } = await supabase.from('carts').select('id,cart_items(id,product_id,variant_id,quantity,products(id,name,slug,price,stock_quantity,product_type,product_images(image_url,display_order))').eq('user_id', userId).maybeSingle()
  if (error) throw new Error(getSafeErrorMessage(error))
  return data
}

export async function addToCart(cartId, productId, quantity, variantId = null) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Kuantitas tidak valid.')
  const { data: product, error: productError } = await supabase.from('products').select('id,product_type,stock_quantity,is_active').eq('id', productId).eq('is_active', true).maybeSingle()
  if (productError) throw new Error(getSafeErrorMessage(productError))
  if (!product) throw new Error('Produk tidak tersedia.')
  const maxQuantity = product.product_type === 'physical' ? product.stock_quantity : 999
  if (quantity > maxQuantity) throw new Error('Kuantitas melebihi stok yang tersedia.')
  const { error } = await supabase.from('cart_items').upsert(
    { cart_id: cartId, product_id: productId, variant_id: variantId, quantity },
    { onConflict: 'cart_id,product_id' },
  )
  if (error) throw new Error(getSafeErrorMessage(error))
}

export async function updateCartItem(cartId, itemId, quantity) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Kuantitas tidak valid.')
  const { data: item, error: itemError } = await supabase.from('cart_items').select('cart_id,product_id,products(product_type,stock_quantity,is_active)').eq('id', itemId).eq('cart_id', cartId).maybeSingle()
  if (itemError) throw new Error(getSafeErrorMessage(itemError))
  if (!item?.products?.is_active) throw new Error('Produk tidak tersedia.')
  const maxQuantity = item.products.product_type === 'physical' ? item.products.stock_quantity : 999
  if (quantity > maxQuantity) throw new Error('Kuantitas melebihi stok yang tersedia.')
  const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', itemId).eq('cart_id', cartId)
  if (error) throw new Error(getSafeErrorMessage(error))
}

export async function removeCartItem(cartId, itemId) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.from('cart_items').delete().eq('id', itemId).eq('cart_id', cartId)
  if (error) throw new Error(getSafeErrorMessage(error))
}
