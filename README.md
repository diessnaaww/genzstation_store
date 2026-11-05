# Genzstation.id

React storefront with Supabase authentication, customer carts, addresses, server-side orders, WhatsApp checkout, and modular Midtrans integration.

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Set only:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Run the Supabase migration files in timestamp order. Keep service role keys, database passwords, and payment secrets out of the frontend and Vite environment.
