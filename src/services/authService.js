import { supabase, isSupabaseConfigured } from '../services/googleSheets.js'
import { getSafeErrorMessage } from '../utils/errorHandler'

export async function signUp({ email, password, fullName, whatsapp }) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, whatsapp } },
  })
  if (error) throw new Error(getSafeErrorMessage(error))
  return data
}

export async function signIn({ email, password }) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(getSafeErrorMessage(error))
  return data
}

export async function signOut() {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(getSafeErrorMessage(error))
}

export async function resetPassword(email) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw new Error(getSafeErrorMessage(error))
}
