import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }

async function sha512(value: string) {
  const digest = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders })
  try {
    const notification = await req.json()
    const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY')
    if (!serverKey) return new Response(JSON.stringify({ error: 'Server key not configured' }), { status: 500, headers: corsHeaders })

    const expected = await sha512(`${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`)
    if (!notification.signature_key || notification.signature_key !== expected) {
      return new Response(JSON.stringify({ status: 'invalid_signature' }), { status: 401, headers: corsHeaders })
    }
    if (!notification.order_id || !notification.transaction_id || !notification.gross_amount) {
      return new Response(JSON.stringify({ status: 'invalid_notification' }), { status: 400, headers: corsHeaders })
    }

    const paymentStatus = ['capture', 'settlement'].includes(notification.transaction_status) ? 'paid'
      : ['deny', 'cancel', 'failure'].includes(notification.transaction_status) ? 'failed'
      : notification.transaction_status === 'expire' ? 'expired'
      : notification.transaction_status === 'refund' ? 'refunded' : 'pending'
    const eventType = String(notification.transaction_status || 'unknown')
    const eventId = `${notification.transaction_id}:${notification.status_code}:${notification.transaction_status}`
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const payload = {
      transaction_status: notification.transaction_status,
      status_code: notification.status_code,
      fraud_status: notification.fraud_status || null,
      payment_type: notification.payment_type || null,
    }
    const { data, error } = await admin.rpc('process_midtrans_event', {
      p_order_number: notification.order_id,
      p_transaction_id: notification.transaction_id,
      p_event_id: eventId,
      p_payment_status: paymentStatus,
      p_gross_amount: Number(notification.gross_amount),
      p_event_type: eventType,
      p_payload: payload,
    })
    if (error) return new Response(JSON.stringify({ status: 'invalid', error: error.message }), { status: 400, headers: corsHeaders })
    return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders })
  } catch {
    return new Response(JSON.stringify({ status: 'invalid' }), { status: 400, headers: corsHeaders })
  }
})
