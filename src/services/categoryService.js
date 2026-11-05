import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getSafeErrorMessage } from '../utils/errorHandler'

export async function getActiveCategories() {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const { data, error } = await supabase.from('categories').select('id,name,slug,description,image_url').eq('is_active', true).order('name')
  if (error) throw new Error(getSafeErrorMessage(error))
  return data || []
}
