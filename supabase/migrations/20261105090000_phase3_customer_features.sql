create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  whatsapp text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_whatsapp_format check (whatsapp is null or whatsapp ~ '^(\+62|62|0)[0-9]{8,14}$')
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipient_name text not null,
  whatsapp text not null,
  label text not null default 'Rumah' check (label in ('Rumah', 'Kantor', 'Lainnya')),
  province text not null,
  city text not null,
  district text not null,
  village text not null,
  detail text not null,
  postal_code text,
  courier_note text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists addresses_user_id_idx on public.addresses(user_id);
create index if not exists addresses_default_idx on public.addresses(user_id, is_default);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id text not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

create index if not exists cart_items_cart_id_idx on public.cart_items(cart_id);

create or replace function public.handle_new_customer()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles(id, full_name, whatsapp, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'whatsapp', ''),
    nullif(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  insert into public.user_roles(user_id, role) values (new.id, 'customer') on conflict (user_id) do nothing;
  insert into public.carts(user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_customer();

create or replace function public.ensure_one_default_address()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.is_default then
    update public.addresses
      set is_default = false, updated_at = now()
      where user_id = new.user_id and id <> new.id and is_default = true;
  end;
  return new;
end;
$$;

drop trigger if exists ensure_one_default_address_trigger on public.addresses;
create trigger ensure_one_default_address_trigger
before insert or update of is_default on public.addresses
for each row execute procedure public.ensure_one_default_address();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "roles_select_self" on public.user_roles;
create policy "roles_select_self" on public.user_roles for select using (auth.uid() = user_id);

drop policy if exists "addresses_select_self" on public.addresses;
create policy "addresses_select_self" on public.addresses for select using (auth.uid() = user_id);
drop policy if exists "addresses_insert_self" on public.addresses;
create policy "addresses_insert_self" on public.addresses for insert with check (auth.uid() = user_id);
drop policy if exists "addresses_update_self" on public.addresses;
create policy "addresses_update_self" on public.addresses for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "addresses_delete_self" on public.addresses;
create policy "addresses_delete_self" on public.addresses for delete using (auth.uid() = user_id);

drop policy if exists "carts_select_self" on public.carts;
create policy "carts_select_self" on public.carts for select using (auth.uid() = user_id);
drop policy if exists "carts_insert_self" on public.carts;
create policy "carts_insert_self" on public.carts for insert with check (auth.uid() = user_id);
drop policy if exists "carts_update_self" on public.carts;
create policy "carts_update_self" on public.carts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "cart_items_select_self" on public.cart_items;
create policy "cart_items_select_self" on public.cart_items for select using (
  exists (select 1 from public.carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid())
);
drop policy if exists "cart_items_insert_self" on public.cart_items;
create policy "cart_items_insert_self" on public.cart_items for insert with check (
  exists (select 1 from public.carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid())
);
drop policy if exists "cart_items_update_self" on public.cart_items;
create policy "cart_items_update_self" on public.cart_items for update using (
  exists (select 1 from public.carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid())
) with check (
  exists (select 1 from public.carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid())
);
drop policy if exists "cart_items_delete_self" on public.cart_items;
create policy "cart_items_delete_self" on public.cart_items for delete using (
  exists (select 1 from public.carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid())
);
