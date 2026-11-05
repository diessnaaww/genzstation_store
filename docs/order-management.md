# Order Management

- Orders are created only through the `create_customer_order` PostgreSQL RPC.
- The RPC authenticates the session, validates the customer, resolves products by server-side slug, recalculates prices, validates stock, snapshots transaction data, creates history, clears the cart, and is atomic.
- Frontend prices and shipping costs are not trusted.
- Guest checkout is not used to create financial records; registration and authentication are required.
- WhatsApp checkout stores an order first. Opening WhatsApp never changes payment status.
