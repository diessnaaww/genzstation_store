import { supabase, isSupabaseConfigured } from '../services/googleSheets.js'
import { getSafeErrorMessage } from '../utils/errorHandler'
function ensure(){if(!isSupabaseConfigured)throw new Error('Supabase belum dikonfigurasi.')}
export async function getAdminCategories(){
  ensure()
  const {data,error}=await supabase.from('categories').select('*').order('pillar',{ascending:true}).order('name',{ascending:true})
  if(error)throw new Error(getSafeErrorMessage(error)); return data||[]
}
export async function saveAdminCategory(category){
  ensure()
  const payload={name:category.name,slug:category.slug,description:category.description,pillar:category.pillar,is_active:category.is_active!==false,image_url:category.image_url||null}
  const {data,error}=category.id
    ? await supabase.from('categories').update(payload).eq('id',category.id).select().single()
    : await supabase.from('categories').insert(payload).select().single()
  if(error)throw new Error(getSafeErrorMessage(error)); return data
}
export async function deleteAdminCategory(id){
  ensure()
  const {error}=await supabase.from('categories').delete().eq('id',id)
  if(error)throw new Error(getSafeErrorMessage(error))
}
