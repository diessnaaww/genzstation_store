alter table public.categories add column if not exists pillar text;
update public.categories set pillar = case
  when name ilike '%digital%' or name ilike '%voucher%' or name ilike '%pulsa%' or name ilike '%credit%' then 'digital'
  when name ilike '%design%' or name ilike '%editing%' or name ilike '%print%' or name ilike '%academic%' or name ilike '%merchandise%' then 'service'
  else 'physical'
end where pillar is null;
alter table public.categories add constraint categories_pillar_check check (pillar in ('physical','digital','service'));

alter table public.products add column if not exists weight_gram integer check (weight_gram is null or weight_gram >= 0);
alter table public.products add column if not exists fulfillment_config jsonb not null default '{}'::jsonb;
alter table public.products add column if not exists pillar text;
update public.products set pillar=product_type where pillar is null;
alter table public.products add constraint products_pillar_check check (pillar in ('physical','digital','service'));

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (order_status in (
  'pending','awaiting_payment','paid','processing','ready_to_ship','shipped','completed','cancelled','refunded'
));

alter table public.store_settings enable row level security;
drop policy if exists "store_settings_admin_select" on public.store_settings;
create policy "store_settings_admin_select" on public.store_settings for select using (public.is_admin() or key='whatsapp_admin_number');
drop policy if exists "store_settings_admin_write" on public.store_settings;
create policy "store_settings_admin_write" on public.store_settings for all using (public.is_admin()) with check (public.is_admin());

insert into public.store_settings(key,value) values
('business_name','Genzstation.id'),('tagline','Your Everyday Digital & Lifestyle Store'),
('shipping_origin','Pamekasan'),('payment_whatsapp_enabled','true'),('payment_online_enabled','false')
on conflict (key) do nothing;

create or replace function public.update_order_status(
  p_order_id uuid,
  p_new_status text,
  p_note text default null,
  p_tracking_number text default null,
  p_courier text default null,
  p_service_name text default null
) returns jsonb
language plpgsql security definer set search_path=public
as $$
declare
  v_order public.orders%rowtype;
  v_allowed boolean := false;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  select * into v_order from public.orders where id=p_order_id for update;
  if not found then raise exception 'Order not found'; end if;

  v_allowed := case
    when v_order.order_status='pending' and p_new_status in ('awaiting_payment','cancelled') then true
    when v_order.order_status='awaiting_payment' and p_new_status in ('paid','cancelled','refunded') then true
    when v_order.order_status='paid' and p_new_status in ('processing','cancelled','refunded') then true
    when v_order.order_status='processing' and p_new_status in ('ready_to_ship','completed','cancelled','refunded') then true
    when v_order.order_status='ready_to_ship' and p_new_status in ('shipped','cancelled','refunded') then true
    when v_order.order_status='shipped' and p_new_status in ('completed','refunded') then true
    else false
  end;
  if not v_allowed then raise exception 'Invalid order status transition: % -> %',v_order.order_status,p_new_status; end if;

  update public.orders set
    order_status=p_new_status,
    payment_status=case
      when p_new_status='awaiting_payment' then 'pending'
      when p_new_status='paid' then 'paid'
      when p_new_status='cancelled' then case when payment_status='paid' then payment_status else 'failed' end
      when p_new_status='refunded' then 'refunded'
      else payment_status
    end,
    updated_at=now()
  where id=p_order_id;

  insert into public.order_status_history(order_id,previous_status,new_status,note,changed_by)
  values(p_order_id,v_order.order_status,p_new_status,coalesce(p_note,'Status updated by admin'),auth.uid());

  if p_new_status in ('ready_to_ship','shipped') and (p_tracking_number is not null or p_courier is not null) then
    insert into public.shipping_details(order_id,courier,service_name,tracking_number,shipping_status,shipped_at)
    values(p_order_id,p_courier,p_service_name,p_tracking_number,
      case when p_new_status='shipped' then 'shipped' else 'ready_to_ship' end,
      case when p_new_status='shipped' then now() else null end);
  end if;
  return jsonb_build_object('order_id',p_order_id,'previous_status',v_order.order_status,'new_status',p_new_status);
end;
$$;
revoke all on function public.update_order_status(uuid,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.update_order_status(uuid,text,text,text,text,text) to authenticated;
