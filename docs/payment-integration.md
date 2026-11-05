# Midtrans Integration

Configure these secrets only in Supabase Edge Functions:

- `MIDTRANS_SERVER_KEY`
- `MIDTRANS_ENVIRONMENT=sandbox`

Do not add these values as `VITE_` environment variables. Deploy `create-payment`, `midtrans-webhook`, and `check-payment-status` with the Supabase CLI. Keep production mode disabled until sandbox testing is approved.
