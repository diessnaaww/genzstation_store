# Genzstation.id

React storefront with Google Sheets database & authentication, customer carts, addresses, multi-origin dropship shipping calculator, WhatsApp checkout, and modular payment fee calculation.

## Run locally

```bash
npm install
npm run dev

Set only:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Run the Supabase migration files in timestamp order. Keep service role keys, database passwords, and payment secrets out of the frontend and Vite environment.
