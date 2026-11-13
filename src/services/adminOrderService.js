import { supabase, isSupabaseConfigured } from '../services/googleSheets.js'
import { getSafeErrorMessage } from '../utils/errorHandler'
function ensure(){if(!isSupabaseConfigured)throw new Error('Supabase belum dikonfigurasi.')}
export async function getAdminOrders(){
  ensure()
  const {data,error}=await supabase.from('orders').select('*,order_items(*),payments(*),order_status_history(*),shipping_details(*)').order('created_at',{ascending:false})
  if(error)throw new Error(getSafeErrorMessage(error)); return data||[]
}
export async function updateAdminOrderStatus(orderId,status,note='',shipping={}){
  ensure()
  const {data,error}=await supabase.rpc('update_order_status',{
    p_order_id:orderId,p_new_status:status,p_note:note,
    p_tracking_number:shipping.tracking_number||null,p_courier:shipping.courier||null,p_service_name:shipping.service_name||null
  })
  if(error)throw new Error(getSafeErrorMessage(error)); return data
}
export async function getAdminSettings(){
  ensure()
  const {data,error}=await supabase.from('store_settings').select('*')
  if(error)throw new Error(getSafeErrorMessage(error)); return Object.fromEntries((data||[]).map(item=>[item.key,item.value]))
}
export async function saveAdminSettings(settings){
  ensure()
  const rows=Object.entries(settings).map(([key,value])=>({key,value:String(value)}))
  const {error}=await supabase.from('store_settings').upsert(rows,{onConflict:'key'})
  if(error)throw new Error(getSafeErrorMessage(error))
}
