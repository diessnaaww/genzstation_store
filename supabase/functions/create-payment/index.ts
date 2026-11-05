import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authHeader = req.headers.get('Authorization') || ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY')
    const environment = Deno.env.get('MIDTRANS_ENVIRONMENT') || 'sandbox'
    if (!serverKey) throw new Error('MIDTRANS_SERVER_KEY belum dikonfigurasi.')

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
    const { data: userData, error: authError } = await userClient.auth.getUser()
    if (authError || !userData.user) throw new Error('Sesi tidak valid.')

    const { order_id } = await req.json()
    if (!order_id) throw new Error('order_id wajib diisi.')
    const admin = createClient(supabaseUrl, serviceKey)
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('*,order_items(*),payments(*)')
      .eq('id', order_id)
      .eq('user_id', userData.user.id)
      .maybeSingle()
    if (orderError || !order) throw new Error('Pesanan tidak ditemukan atau bukan milik pelanggan.')
    if (order.order_status === 'cancelled' || order.payment_status === 'paid') throw new Error('Pesanan tidak dapat memulai pembayaran.')

    const apiBase = environment === 'production'
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions'
    const itemDetails = order.order_items.map((item: any) => ({
      id: item.product_id || item.id,
      price: Number(item.unit_price),
      quantity: Number(item.quantity),
      name: item.product_name_snapshot.slice(0, 50),
    }))
    const encoded = btoa(`${serverKey}:`)
    const response = await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${encoded}` },
      body: JSON.stringify({
        transaction_details: { order_id: order.order_number, gross_amount: Number(order.total_amount) },
        customer_details: { first_name: order.customer_name, email: order.customer_email || undefined, phone: order.customer_phone },
        item_details: itemDetails,
      }),
    })
    const body = await response.json()
    if (!response.ok) throw new Error(body.error_messages?.join(', ') || 'Gagal membuat transaksi Midtrans.')

    await admin.from('orders').update({ payment_status: 'pending' }).eq('id', order.id)
    await admin.from('payments').update({
      provider: 'midtrans',
      payment_method: 'midtrans',
      payment_status: 'pending',
      provider_reference: body.token,
      payment_url: body.redirect_url,
      expires_at: order.expires_at,
    }).eq('order_id', order.id)

    return new Response(JSON.stringify({ payment_url: body.redirect_url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Gagal membuat pembayaran.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
