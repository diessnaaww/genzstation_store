# Order and Payment Status Flow

Order statuses: pending, confirmed, processing, ready_to_ship, shipped, completed, cancelled, refunded.

Payment statuses: unpaid, pending, paid, failed, expired, refunded, partially_refunded.

WhatsApp checkout starts with `unpaid`. Midtrans starts with `pending`; only an authenticated webhook or server status reconciliation can set `paid`.
