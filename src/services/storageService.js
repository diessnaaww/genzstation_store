import { supabase, isSupabaseConfigured } from '../lib/supabase'

const limits = { 'product-images': 5 * 1024 * 1024, 'category-images': 5 * 1024 * 1024, avatars: 2 * 1024 * 1024 }
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

export async function uploadImage(bucket, file, folder = '') {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  if (!allowedTypes.includes(file.type)) throw new Error('Gunakan file JPEG, PNG, atau WebP.')
  if (file.size > (limits[bucket] || 2 * 1024 * 1024)) throw new Error('Ukuran gambar melebihi batas yang diizinkan.')
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const uniqueName = `${folder ? `${folder}/` : ''}${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from(bucket).upload(uniqueName, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  return { path: uniqueName, url: getPublicImageUrl(bucket, uniqueName) }
}

export async function deleteImage(bucket, path) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

export function getPublicImageUrl(bucket, path) {
  if (!isSupabaseConfigured || !path) return ''
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}
