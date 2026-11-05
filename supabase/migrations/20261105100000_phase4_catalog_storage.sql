create extension if not exists "pgcrypto";

alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
update public.profiles set phone = whatsapp where phone is null and whatsapp is not null;

alter table public.user_roles add column if not exists id uuid default gen_random_uuid();
update public.user_roles set id = gen_random_uuid() where id is null;
alter table public.user_roles alter column id set not null;
create unique index if not exists user_roles_user_id_unique on public.user_roles(user_id);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(14,2) not null check (price >= 0),
  original_price numeric(14,2) check (original_price is null or original_price >= price),
  product_type text not null check (product_type in ('physical', 'digital', 'service')),
  fulfillment_type text not null check (fulfillment_type in ('shipping', 'digital_delivery', 'manual_service')),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  sku text unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_fulfillment_match check (
    (product_type = 'physical' and fulfillment_type = 'shipping') or
    (product_type = 'digital' and fulfillment_type = 'digital_delivery') or
    (product_type = 'service' and fulfillment_type = 'manual_service')
  )
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  unique (product_id, display_order)
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_name text not null,
  variant_value text not null,
  additional_price numeric(14,2) not null default 0 check (additional_price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  sku text unique,
  is_active boolean not null default true
);

alter table public.addresses add column if not exists phone text;
alter table public.addresses add column if not exists address_detail text;
update public.addresses set phone = whatsapp where phone is null and whatsapp is not null;
update public.addresses set address_detail = detail where address_detail is null and detail is not null;
alter table public.addresses alter column phone set not null;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='cart_items' and column_name='product_id' and data_type='text'
  ) then
    alter table public.cart_items rename column product_id to legacy_product_id;
    alter table public.cart_items add column product_id uuid;
    alter table public.cart_items add constraint cart_items_product_uuid_fkey foreign key (product_id) references public.products(id) on delete cascade;
  end if;
end $$;

alter table public.cart_items add column if not exists variant_id uuid references public.product_variants(id) on delete set null;

create index if not exists categories_active_idx on public.categories(is_active, name);
create index if not exists products_active_idx on public.products(is_active, created_at desc);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_slug_idx on public.products(slug);
create index if not exists product_images_product_idx on public.product_images(product_id, display_order);
create index if not exists product_variants_product_idx on public.product_variants(product_id, is_active);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories for each row execute procedure public.set_updated_at();
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute procedure public.set_updated_at();
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
drop trigger if exists addresses_updated_at on public.addresses;
create trigger addresses_updated_at before update on public.addresses for each row execute procedure public.set_updated_at();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories for select using (is_active = true or public.is_admin());
drop policy if exists "categories_admin_insert" on public.categories;
create policy "categories_admin_insert" on public.categories for insert with check (public.is_admin());
drop policy if exists "categories_admin_update" on public.categories;
create policy "categories_admin_update" on public.categories for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "categories_admin_delete" on public.categories;
create policy "categories_admin_delete" on public.categories for delete using (public.is_admin());

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products for select using (is_active = true or public.is_admin());
drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert" on public.products for insert with check (public.is_admin());
drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update" on public.products for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete" on public.products for delete using (public.is_admin());

drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read" on public.product_images for select using (
  exists (select 1 from public.products p where p.id = product_images.product_id and (p.is_active = true or public.is_admin()))
);
drop policy if exists "product_images_admin_write" on public.product_images;
create policy "product_images_admin_write" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_variants_public_read" on public.product_variants;
create policy "product_variants_public_read" on public.product_variants for select using (
  exists (select 1 from public.products p where p.id = product_variants.product_id and (p.is_active = true or public.is_admin()))
);
drop policy if exists "product_variants_admin_write" on public.product_variants;
create policy "product_variants_admin_write" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "roles_select_self" on public.user_roles;
create policy "roles_select_self" on public.user_roles for select using (auth.uid() = user_id or public.is_admin());
revoke all on public.user_roles from anon, authenticated;
grant select on public.user_roles to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('category-images', 'category-images', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product_images_public_read_objects" on storage.objects;
create policy "product_images_public_read_objects" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "category_images_public_read_objects" on storage.objects;
create policy "category_images_public_read_objects" on storage.objects for select using (bucket_id = 'category-images');
drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert" on storage.objects for insert with check (bucket_id in ('product-images','category-images') and public.is_admin());
drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update" on storage.objects for update using (bucket_id in ('product-images','category-images') and public.is_admin()) with check (bucket_id in ('product-images','category-images') and public.is_admin());
drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete" on storage.objects for delete using (bucket_id in ('product-images','category-images') and public.is_admin());

drop policy if exists "avatars_public_read_objects" on storage.objects;
create policy "avatars_public_read_objects" on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert" on storage.objects for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update" on storage.objects for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete" on storage.objects for delete using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
