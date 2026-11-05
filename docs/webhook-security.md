# Webhook Security

The Midtrans webhook verifies SHA-512 signature key, gross amount, transaction ID, and order reference before processing. Events use a provider/event idempotency key. The server stores only the minimal notification fields needed for reconciliation. Invalid signatures and mismatched amounts are rejected. Payment redirects are never used as proof of payment.
