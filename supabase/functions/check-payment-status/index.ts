import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization') || ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY')
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
    const { data: userData, error: authError } = await userClient.auth.getUser()
    if (authError || !userData.user) throw new Error('Sesi tidak valid.')
    const { order_id } = await req.json()
    const admin = createClient(supabaseUrl, serviceKey)
    const { data: order, error } = await admin.from('orders').select('*').eq('id', order_id).eq('user_id', userData.user.id).maybeSingle()
    if (error || !order) throw new Error('Pesanan tidak ditemukan.')
    if (!serverKey) throw new Error('MIDTRANS_SERVER_KEY belum dikonfigurasi.')

    const encoded = btoa(`${serverKey}:`)
    const environment = Deno.env.get('MIDTRANS_ENVIRONMENT') || 'sandbox'
    const base = environment === 'production' ? 'https://api.midtrans.com/v2' : 'https://api.sandbox.midtrans.com/v2'
    const response = await fetch(`${base}/${encodeURIComponent(order.order_number)}/status`, { headers: { Authorization: `Basic ${encoded}` } })
    const status = await response.json()
    if (!response.ok) throw new Error(status.status_message || 'Status tidak dapat diperiksa.')

    const paymentStatus = ['capture', 'settlement'].includes(status.transaction_status) ? 'paid'
      : ['deny', 'cancel', 'failure'].includes(status.transaction_status) ? 'failed'
      : status.transaction_status === 'expire' ? 'expired' : 'pending'
    await admin.rpc('process_midtrans_event', {
      p_order_number: order.order_number,
      p_transaction_id: status.transaction_id,
      p_event_id: `${status.transaction_id}:${status.status_code}:${status.transaction_status}`,
      p_payment_status: paymentStatus,
      p_gross_amount: Number(status.gross_amount),
      p_event_type: status.transaction_status,
      p_payload: { transaction_status: status.transaction_status, payment_type: status.payment_type || null },
    })
    const { data: refreshed } = await admin.from('orders').select('payment_status,order_status').eq('id', order.id).single()
    return new Response(JSON.stringify(refreshed || {}), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Gagal memeriksa status.' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
})
