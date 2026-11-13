import { supabase, isSupabaseConfigured } from '../services/googleSheets.js'
import { getSafeErrorMessage } from '../utils/errorHandler'

export async function getProfile(userId) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw new Error(getSafeErrorMessage(error))
  return data
}

export async function updateProfile(userId, profile) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const phone = profile.phone || profile.whatsapp
  if (phone && !/^(\+62|62|0)[0-9]{8,14}$/.test(phone)) throw new Error('Format nomor WhatsApp tidak valid.')
  const payload = { full_name: String(profile.full_name || '').trim(), phone, whatsapp: phone, avatar_url: profile.avatar_url || null, updated_at: new Date().toISOString() }
  const { data, error } = await supabase.from('profiles').update(payload).eq('id', userId).select().single()
  if (error) throw new Error(getSafeErrorMessage(error))
  return data
}
