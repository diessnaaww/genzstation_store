import { supabase, isSupabaseConfigured } from '../services/googleSheets.js'
import { getSafeErrorMessage } from '../utils/errorHandler'

export async function getAddresses(userId) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const { data, error } = await supabase.from('addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false }).order('created_at')
  if (error) throw new Error(getSafeErrorMessage(error))
  return data || []
}

export async function createAddress(userId, address) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const payload = { ...address, user_id: userId, phone: address.phone || address.whatsapp, address_detail: address.address_detail || address.detail }
  const { data, error } = await supabase.from('addresses').insert(payload).select().single()
  if (error) throw new Error(getSafeErrorMessage(error))
  return data
}

export async function updateAddress(userId, addressId, address) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const payload = { ...address, phone: address.phone || address.whatsapp, address_detail: address.address_detail || address.detail }
  const { data, error } = await supabase.from('addresses').update(payload).eq('id', addressId).eq('user_id', userId).select().single()
  if (error) throw new Error(getSafeErrorMessage(error))
  return data
}

export async function deleteAddress(userId, addressId) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.from('addresses').delete().eq('id', addressId).eq('user_id', userId)
  if (error) throw new Error(getSafeErrorMessage(error))
}
