create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  idempotency_key text unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  subtotal numeric(14,2) not null check (subtotal >= 0),
  shipping_cost numeric(14,2) not null default 0 check (shipping_cost >= 0),
  discount_amount numeric(14,2) not null default 0 check (discount_amount >= 0),
  total_amount numeric(14,2) not null check (total_amount >= 0),
  order_status text not null default 'pending',
  payment_status text not null default 'unpaid',
  fulfillment_type text,
  recipient_name text,
  recipient_phone text,
  shipping_address_snapshot jsonb,
  customer_notes text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_status_check check (order_status in ('pending','confirmed','processing','ready_to_ship','shipped','completed','cancelled','refunded')),
  constraint orders_payment_status_check check (payment_status in ('unpaid','pending','paid','failed','expired','refunded','partially_refunded'))
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name_snapshot text not null,
  variant_snapshot jsonb,
  product_type text not null check (product_type in ('physical','digital','service')),
  fulfillment_type text not null check (fulfillment_type in ('shipping','digital_delivery','manual_service')),
  unit_price numeric(14,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity >= 1),
  line_total numeric(14,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'whatsapp',
  payment_method text,
  provider_transaction_id text,
  provider_reference text,
  amount numeric(14,2) not null check (amount >= 0),
  payment_status text not null default 'unpaid',
  payment_url text,
  paid_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_status_check check (payment_status in ('unpaid','pending','paid','failed','expired','refunded','partially_refunded')),
  unique (provider, provider_transaction_id)
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text,
  provider_transaction_id text,
  order_number text,
  event_type text,
  payload jsonb,
  processing_status text not null default 'received',
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint payment_events_event_unique unique (provider, event_id),
  constraint payment_events_status_check check (processing_status in ('received','processed','ignored','invalid','failed'))
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  previous_status text,
  new_status text not null,
  note text,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.shipping_details (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  courier text,
  service_name text,
  tracking_number text,
  shipping_status text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  key text primary key,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.store_settings(key, value)
values ('whatsapp_admin_number','6280000000000')
on conflict (key) do nothing;

create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create index if not exists orders_status_idx on public.orders(order_status, payment_status);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists payments_order_idx on public.payments(order_id);
create index if not exists payment_events_transaction_idx on public.payment_events(provider_transaction_id);
create index if not exists status_history_order_idx on public.order_status_history(order_id, created_at desc);
create index if not exists shipping_details_order_idx on public.shipping_details(order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;
alter table public.order_status_history enable row level security;
alter table public.shipping_details enable row level security;
alter table public.store_settings enable row level security;

drop policy if exists "orders_select_self" on public.orders;
create policy "orders_select_self" on public.orders for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "order_items_select_self" on public.order_items;
create policy "order_items_select_self" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_items.order_id and (o.user_id = auth.uid() or public.is_admin()))
);

drop policy if exists "payments_select_self" on public.payments;
create policy "payments_select_self" on public.payments for select using (
  exists (select 1 from public.orders o where o.id = payments.order_id and (o.user_id = auth.uid() or public.is_admin()))
);

drop policy if exists "order_history_select_self" on public.order_status_history;
create policy "order_history_select_self" on public.order_status_history for select using (
  exists (select 1 from public.orders o where o.id = order_status_history.order_id and (o.user_id = auth.uid() or public.is_admin()))
);

drop policy if exists "shipping_select_self" on public.shipping_details;
create policy "shipping_select_self" on public.shipping_details for select using (
  exists (select 1 from public.orders o where o.id = shipping_details.order_id and (o.user_id = auth.uid() or public.is_admin()))
);

drop policy if exists "store_settings_public_read" on public.store_settings;
create policy "store_settings_public_read" on public.store_settings for select using (key in ('whatsapp_admin_number'));

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders for each row execute procedure public.set_updated_at();
drop trigger if exists payments_updated_at on public.payments;
create trigger payments_updated_at before update on public.payments for each row execute procedure public.set_updated_at();
drop trigger if exists shipping_updated_at on public.shipping_details;
create trigger shipping_updated_at before update on public.shipping_details for each row execute procedure public.set_updated_at();

create or replace function public.create_customer_order(
  p_items jsonb,
  p_customer jsonb,
  p_shipping_address jsonb default '{}'::jsonb,
  p_notes text default '',
  p_payment_method text default 'whatsapp',
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing public.orders%rowtype;
  v_order public.orders%rowtype;
  v_item jsonb;
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_quantity integer;
  v_unit_price numeric(14,2);
  v_subtotal numeric(14,2) := 0;
  v_order_number text;
  v_payment_status text := 'unpaid';
  v_has_physical boolean := false;
  v_fulfillment text;
  v_shipping jsonb;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;
  if coalesce(p_customer->>'name','') = '' or coalesce(p_customer->>'phone','') !~ '^(\+62|62|0)[0-9]{8,14}$' then
    raise exception 'Valid customer name and WhatsApp number are required';
  end if;
  if p_payment_method not in ('whatsapp','midtrans') then
    raise exception 'Invalid payment method';
  end if;
  if p_idempotency_key is not null then
    select * into v_existing from public.orders where idempotency_key = p_idempotency_key and user_id = v_user_id;
    if found then
      return jsonb_build_object('id',v_existing.id,'order_number',v_existing.order_number,'total_amount',v_existing.total_amount,'idempotent',true);
    end;
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := nullif(v_item->>'quantity','')::integer;
    if v_quantity is null or v_quantity < 1 then
      raise exception 'Quantity must be at least one';
    end if;

    select * into v_product
    from public.products
    where slug = v_item->>'product_slug' and is_active = true;
    if not found then
      raise exception 'Product is inactive or unavailable';
    end if;

    v_unit_price := v_product.price;
    v_variant := null;
    if nullif(v_item->>'variant_id','') is not null then
      select * into v_variant from public.product_variants
      where id = (v_item->>'variant_id')::uuid and product_id = v_product.id and is_active = true
      for update;
      if not found then
        raise exception 'Variant is unavailable';
      end if;
      v_unit_price := v_unit_price + v_variant.additional_price;
      if v_product.product_type = 'physical' and v_variant.stock_quantity < v_quantity then
        raise exception 'Insufficient variant stock';
      end if;
    elsif v_product.product_type = 'physical' then
      select * into v_product from public.products where id = v_product.id for update;
      if v_product.stock_quantity < v_quantity then
        raise exception 'Insufficient product stock';
      end if;
    end if;

    v_subtotal := v_subtotal + (v_unit_price * v_quantity);
    if v_product.product_type = 'physical' then
      v_has_physical := true;
    end if;
  end loop;

  if v_has_physical and (
    coalesce(p_shipping_address->>'recipient_name','') = '' or
    coalesce(p_shipping_address->>'recipient_phone','') = '' or
    coalesce(p_shipping_address->>'detail','') = ''
  ) then
    raise exception 'A complete shipping address is required for physical products';
  end if;

  v_fulfillment := case
    when v_has_physical then 'shipping'
    else 'mixed'
  end;
  v_shipping := case when v_has_physical then p_shipping_address else '{}'::jsonb end;
  v_order_number := 'GS-' || to_char(now(),'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));
  if p_payment_method = 'midtrans' then v_payment_status := 'pending'; end if;

  insert into public.orders(
    order_number,idempotency_key,user_id,customer_name,customer_email,customer_phone,
    subtotal,shipping_cost,discount_amount,total_amount,order_status,payment_status,
    fulfillment_type,recipient_name,recipient_phone,shipping_address_snapshot,customer_notes,
    expires_at
  ) values (
    v_order_number,p_idempotency_key,v_user_id,p_customer->>'name',nullif(p_customer->>'email',''),p_customer->>'phone',
    v_subtotal,0,0,v_subtotal,'pending',v_payment_status,v_fulfillment,
    nullif(p_shipping_address->>'recipient_name',''),nullif(p_shipping_address->>'recipient_phone',''),v_shipping,p_notes,
    now() + interval '24 hours'
  ) returning * into v_order;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    select * into v_product from public.products where slug = v_item->>'product_slug' and is_active = true;
    v_quantity := (v_item->>'quantity')::integer;
    v_unit_price := v_product.price;
    v_variant := null;
    if nullif(v_item->>'variant_id','') is not null then
      select * into v_variant from public.product_variants where id=(v_item->>'variant_id')::uuid and product_id=v_product.id and is_active=true;
      v_unit_price := v_unit_price + v_variant.additional_price;
      update public.product_variants set stock_quantity=stock_quantity-v_quantity where id=v_variant.id and stock_quantity>=v_quantity;
    elsif v_product.product_type='physical' then
      update public.products set stock_quantity=stock_quantity-v_quantity where id=v_product.id and stock_quantity>=v_quantity;
      if not found then raise exception 'Insufficient product stock during order creation'; end if;
    end if;

    insert into public.order_items(
      order_id,product_id,variant_id,product_name_snapshot,variant_snapshot,
      product_type,fulfillment_type,unit_price,quantity,line_total
    ) values (
      v_order.id,v_product.id,v_variant.id,v_product.name,
      case when v_variant.id is null then null else jsonb_build_object('name',v_variant.variant_name,'value',v_variant.variant_value,'additional_price',v_variant.additional_price) end,
      v_product.product_type,v_product.fulfillment_type,v_unit_price,v_quantity,v_unit_price*v_quantity
    );
  end loop;

  insert into public.payments(order_id,provider,payment_method,amount,payment_status,expires_at)
  values (v_order.id,
    case when p_payment_method='midtrans' then 'midtrans' else 'whatsapp' end,
    p_payment_method,v_subtotal,v_payment_status,v_order.expires_at);

  insert into public.order_status_history(order_id,previous_status,new_status,note,changed_by)
  values (v_order.id,null,'pending','Order created by customer',v_user_id);

  delete from public.cart_items ci
  using public.carts c
  where ci.cart_id=c.id and c.user_id=v_user_id;

  return jsonb_build_object(
    'id',v_order.id,'order_number',v_order.order_number,'total_amount',v_order.total_amount,'idempotent',false
  );
end;
$$;

revoke all on function public.create_customer_order(jsonb,jsonb,jsonb,text,text,text) from public;
grant execute on function public.create_customer_order(jsonb,jsonb,jsonb,text,text,text) to authenticated;

create or replace function public.process_midtrans_event(
  p_order_number text,
  p_transaction_id text,
  p_event_id text,
  p_payment_status text,
  p_gross_amount numeric(14,2),
  p_event_type text,
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_payment public.payments%rowtype;
  v_previous_payment text;
  v_previous_order text;
  v_event_id text;
begin
  if auth.role() <> 'service_role' then
    raise exception 'Server-side payment processing required';
  end if;
  if p_order_number is null or p_transaction_id is null or p_gross_amount is null then
    raise exception 'Invalid notification';
  end if;

  select * into v_order from public.orders where order_number=p_order_number for update;
  if not found then raise exception 'Order not found'; end if;

  select * into v_payment from public.payments where order_id=v_order.id order by created_at desc limit 1 for update;
  if not found or v_payment.provider <> 'midtrans' then raise exception 'Midtrans payment not found'; end if;
  if p_gross_amount <> v_order.total_amount then raise exception 'Gross amount mismatch'; end if;
  if coalesce(v_payment.provider_transaction_id,'') <> '' and v_payment.provider_transaction_id <> p_transaction_id then
    raise exception 'Transaction does not match payment';
  end if;

  v_event_id := coalesce(p_event_id, p_transaction_id || ':' || p_event_type);
  insert into public.payment_events(
    provider,event_id,provider_transaction_id,order_number,event_type,payload,processing_status,processed_at
  ) values (
    'midtrans',v_event_id,p_transaction_id,p_order_number,p_event_type,p_payload,'received',null
  ) on conflict (provider,event_id) do nothing;
  if not found then
    return jsonb_build_object('status','duplicate','processed',false);
  end if;

  v_previous_payment := v_payment.payment_status;
  v_previous_order := v_order.order_status;

  update public.payments set
    provider_transaction_id=p_transaction_id,
    payment_status=p_payment_status,
    paid_at=case when p_payment_status='paid' then now() else paid_at end
  where id=v_payment.id
  returning * into v_payment;

  if p_payment_status='paid' and v_order.payment_status <> 'paid' then
    update public.orders set payment_status='paid',order_status='confirmed',updated_at=now() where id=v_order.id;
    insert into public.order_status_history(order_id,previous_status,new_status,note,changed_by)
    values (v_order.id,v_previous_order,'confirmed','Midtrans payment confirmed',null);
  elsif p_payment_status='expired' and v_order.payment_status in ('pending','unpaid') then
    update public.orders set payment_status='expired',order_status='cancelled',updated_at=now() where id=v_order.id;
    insert into public.order_status_history(order_id,previous_status,new_status,note,changed_by)
    values (v_order.id,v_previous_order,'cancelled','Payment expired',null);
    update public.products p set stock_quantity=p.stock_quantity+oi.quantity
    from public.order_items oi
    where oi.order_id=v_order.id and oi.product_id=p.id and oi.product_type='physical' and oi.variant_id is null;
    update public.product_variants v set stock_quantity=v.stock_quantity+oi.quantity
    from public.order_items oi
    where oi.order_id=v_order.id and oi.variant_id=v.id;
  elsif p_payment_status='failed' and v_order.payment_status not in ('paid','refunded','partially_refunded') then
    update public.orders set payment_status='failed',updated_at=now() where id=v_order.id;
  end if;

  update public.payment_events set processing_status='processed',processed_at=now()
  where provider='midtrans' and event_id=v_event_id;
  update public.orders set updated_at=now() where id=v_order.id;

  return jsonb_build_object('status','processed','payment_status',p_payment_status,'order_status',v_order.order_status);
end;
$$;

revoke all on function public.process_midtrans_event(text,text,text,text,numeric,text,jsonb) from public;
