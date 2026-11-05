import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const supabaseConfigError = !url || !anonKey
  ? 'Konfigurasi Supabase belum tersedia. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.'
  : url.includes('your-project') || anonKey.includes('your-anon-key')
    ? 'Konfigurasi Supabase masih menggunakan nilai placeholder.'
    : null

export const isSupabaseConfigured = !supabaseConfigError
export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null
