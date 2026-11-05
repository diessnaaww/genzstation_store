# Phase 5 Testing Checklist

- [ ] Build passes.
- [ ] Physical checkout rejects missing shipping address.
- [ ] Frontend manipulated prices do not affect database totals.
- [ ] Inactive products cannot be ordered.
- [ ] Stock is not reduced below zero.
- [ ] Two customers cannot read each other's orders.
- [ ] Double submission returns the existing idempotent order.
- [ ] WhatsApp message includes the database order number but does not mark payment as paid.
- [ ] Midtrans sandbox success changes payment and order status through server processing.
- [ ] Midtrans sandbox failure and expiry update status safely.
- [ ] Invalid webhook signature is rejected.
- [ ] Duplicate webhook does not process twice.
- [ ] Wrong webhook amount is rejected.
