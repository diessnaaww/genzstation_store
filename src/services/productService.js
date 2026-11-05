import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getSafeErrorMessage } from '../utils/errorHandler'

export async function getProducts({ page = 1, pageSize = 12, search = '', category = '', type = '', minPrice = '', maxPrice = '', sort = 'newest' } = {}) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  let query = supabase.from('products').select('*,categories(name),product_images(image_url,alt_text,display_order),product_variants(*)', { count: 'exact' }).eq('is_active', true)
  if (search.trim()) query = query.ilike('name', `%${search.trim()}%`)
  if (category) {
    const { data: categoryRow } = await supabase.from('categories').select('id,slug,name').or(`slug.eq.${category},name.eq.${category}`).maybeSingle()
    if (categoryRow?.id) query = query.eq('category_id', categoryRow.id)
  }
  if (type) query = query.eq('product_type', type)
  if (minPrice !== '') query = query.gte('price', Number(minPrice))
  if (maxPrice !== '') query = query.lte('price', Number(maxPrice))
  if (sort === 'price-low') query = query.order('price', { ascending: true })
  else if (sort === 'price-high') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })
  const from = (Math.max(1, page) - 1) * pageSize
  const { data, error, count } = await query.range(from, from + pageSize - 1)
  if (error) throw new Error(getSafeErrorMessage(error))
  return { items: data || [], count: count || 0 }
}

export async function getProductBySlug(slug) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const { data, error } = await supabase.from('products').select('*,categories(name,slug),product_images(image_url,alt_text,display_order),product_variants(*)').eq('slug', slug).eq('is_active', true).maybeSingle()
  if (error) throw new Error(getSafeErrorMessage(error))
  return data
}
