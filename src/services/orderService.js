import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getSafeErrorMessage } from '../utils/errorHandler'

export async function createCustomerOrder({ items, customer, shippingAddress = {}, notes = '', paymentMethod = 'whatsapp', idempotencyKey }) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const payload = {
    p_items: items.map((item) => ({
      product_slug: item.slug,
      variant_id: item.variant_id || null,
      quantity: Number(item.quantity),
    })),
    p_customer: customer,
    p_shipping_address: shippingAddress,
    p_notes: notes,
    p_payment_method: paymentMethod,
    p_idempotency_key: idempotencyKey,
  }
  const { data, error } = await supabase.rpc('create_customer_order', payload)
  if (error) throw new Error(getSafeErrorMessage(error))
  return data
}

export async function getMyOrders(page = 1, pageSize = 10) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const from = (Math.max(1, page) - 1) * pageSize
  const { data, error, count } = await supabase
    .from('orders')
    .select('*,payments(*),order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)
  if (error) throw new Error(getSafeErrorMessage(error))
  return { items: data || [], count: count || 0 }
}

export async function getMyOrder(orderIdOrNumber) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const query = supabase
    .from('orders')
    .select('*,payments(*),order_items(*),order_status_history(*),shipping_details(*)')
  const { data, error } = await (orderIdOrNumber.length === 36
    ? query.eq('id', orderIdOrNumber)
    : query.eq('order_number', orderIdOrNumber)).maybeSingle()
  if (error) throw new Error(getSafeErrorMessage(error))
  return data
}

export async function createMidtransPayment(orderId) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const { data, error } = await supabase.functions.invoke('create-payment', { body: { order_id: orderId } })
  if (error) throw new Error(error.message || 'Gagal membuat sesi pembayaran.')
  return data
}

export async function checkPaymentStatus(orderId) {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  const { data, error } = await supabase.functions.invoke('check-payment-status', { body: { order_id: orderId } })
  if (error) throw new Error(error.message || 'Gagal memeriksa status pembayaran.')
  return data
}
