create or replace function public.update_order_status(
  p_order_id uuid,
  p_new_status text,
  p_note text default null,
  p_tracking_number text default null,
  p_courier text default null,
  p_service_name text default null
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_order public.orders%rowtype;
  v_allowed boolean := false;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  v_allowed := case
    when v_order.order_status = 'pending' and p_new_status in ('awaiting_payment','cancelled') then true
    when v_order.order_status = 'awaiting_payment' and p_new_status in ('paid','cancelled','refunded') then true
    when v_order.order_status = 'paid' and p_new_status in ('processing','cancelled','refunded') then true
    when v_order.order_status = 'processing' and p_new_status in ('ready_to_ship','completed','cancelled','refunded') then true
    when v_order.order_status = 'ready_to_ship' and p_new_status in ('shipped','cancelled','refunded') then true
    when v_order.order_status = 'shipped' and p_new_status in ('completed','refunded') then true
    else false
  end;

  if not v_allowed then
    raise exception 'Invalid order status transition: % -> %', v_order.order_status, p_new_status;
  end if;

  update public.orders set
    order_status = p_new_status,
    payment_status = case
      when p_new_status = 'awaiting_payment' then 'pending'
      when p_new_status = 'paid' then 'paid'
      when p_new_status = 'cancelled' then case when payment_status = 'paid' then payment_status else 'failed' end
      when p_new_status = 'refunded' then 'refunded'
      else payment_status
    end,
    updated_at = now()
  where id = p_order_id;

  if p_new_status in ('cancelled','refunded') then
    update public.products p
    set stock_quantity = p.stock_quantity + oi.quantity,
        updated_at = now()
    from public.order_items oi
    where oi.order_id = p_order_id
      and oi.product_id = p.id
      and oi.product_type = 'physical'
      and oi.variant_id is null;

    update public.product_variants v
    set stock_quantity = v.stock_quantity + oi.quantity
    from public.order_items oi
    where oi.order_id = p_order_id
      and oi.variant_id = v.id;
  end if;

  insert into public.order_status_history(order_id, previous_status, new_status, note, changed_by)
  values (p_order_id, v_order.order_status, p_new_status, coalesce(p_note,'Status updated by admin'), auth.uid());

  if p_new_status in ('ready_to_ship','shipped') and (p_tracking_number is not null or p_courier is not null) then
    update public.shipping_details set
      courier = excluded.courier,
      service_name = excluded.service_name,
      tracking_number = excluded.tracking_number,
      shipping_status = excluded.shipping_status,
      shipped_at = excluded.shipped_at,
      updated_at = now()
    from (
      select p_courier as courier,
             p_service_name as service_name,
             p_tracking_number as tracking_number,
             case when p_new_status='shipped' then 'shipped' else 'ready_to_ship' end as shipping_status,
             case when p_new_status='shipped' then now() else null end as shipped_at
    ) excluded
    where shipping_details.order_id = p_order_id;

    if not found then
      insert into public.shipping_details(order_id,courier,service_name,tracking_number,shipping_status,shipped_at)
      values (
        p_order_id,p_courier,p_service_name,p_tracking_number,
        case when p_new_status='shipped' then 'shipped' else 'ready_to_ship' end,
        case when p_new_status='shipped' then now() else null end
      );
    end if;
  end if;

  return jsonb_build_object(
    'order_id', p_order_id,
    'previous_status', v_order.order_status,
    'new_status', p_new_status
  );
end;
$$;

revoke all on function public.update_order_status(uuid,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.update_order_status(uuid,text,text,text,text,text) to authenticated;
