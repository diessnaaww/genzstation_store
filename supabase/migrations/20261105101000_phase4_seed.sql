insert into public.categories(name, slug, description, is_active) values
  ('Skincare & Beauty', 'skincare-beauty', 'Kebutuhan perawatan kulit dan kecantikan.', true),
  ('Fashion & Hijab', 'fashion-hijab', 'Busana dan hijab untuk aktivitas sehari-hari.', true),
  ('Accessories & Lifestyle', 'accessories-lifestyle', 'Aksesori dan produk lifestyle.', true),
  ('Food & Snacks', 'food-snacks', 'Makanan ringan dan sajian lokal.', true),
  ('Daily Essentials', 'daily-essentials', 'Kebutuhan harian praktis.', true),
  ('Digital Products', 'digital-products', 'Produk digital dan kebutuhan aplikasi.', true),
  ('Creative Services', 'creative-services', 'Layanan desain dan editing kreatif.', true),
  ('Printing & Custom', 'printing-custom', 'Percetakan dan produk custom.', true),
  ('Graduation & Merchandise', 'graduation-merchandise', 'Merchandise wisuda dan acara.', true)
on conflict (slug) do update set name = excluded.name, description = excluded.description, is_active = true;

insert into public.products(category_id, name, slug, description, price, original_price, product_type, fulfillment_type, stock_quantity, sku, is_active, created_at)
values
  ((select id from public.categories where slug='skincare-beauty'), '[DUMMY] Skincare Glow Set', 'skincare-glow-set', 'Paket skincare harian untuk rutinitas pagi dan malam.', 129000, 159000, 'physical', 'shipping', 18, 'DUMMY-SKIN-001', true, '2026-10-28'),
  ((select id from public.categories where slug='skincare-beauty'), '[DUMMY] Lip Tint Pop Color', 'lip-tint-pop-color', 'Lip tint ringan dengan hasil warna natural.', 49000, 59000, 'physical', 'shipping', 32, 'DUMMY-SKIN-002', true, '2026-10-21'),
  ((select id from public.categories where slug='fashion-hijab'), '[DUMMY] Hijab Everyday Premium', 'hijab-everyday', 'Hijab daily yang ringan dan adem.', 79000, 99000, 'physical', 'shipping', 24, 'DUMMY-FASH-001', true, '2026-10-30'),
  ((select id from public.categories where slug='accessories-lifestyle'), '[DUMMY] Totebag Minimal Canvas', 'totebag-minimal', 'Tas kanvas minimal untuk aktivitas harian.', 65000, 65000, 'physical', 'shipping', 15, 'DUMMY-ACC-001', true, '2026-10-26'),
  ((select id from public.categories where slug='food-snacks'), '[DUMMY] Snack Box Madura', 'snack-box-madura', 'Seleksi makanan ringan dalam kemasan gift box.', 85000, 95000, 'physical', 'shipping', 12, 'DUMMY-FOOD-001', true, '2026-10-18'),
  ((select id from public.categories where slug='daily-essentials'), '[DUMMY] Daily Essentials Organizer', 'daily-essentials-organizer', 'Set penyimpanan kebutuhan harian.', 42000, 42000, 'physical', 'shipping', 40, 'DUMMY-DLY-001', true, '2026-10-11'),
  ((select id from public.categories where slug='digital-products'), '[DUMMY] Paket Data 15GB', 'paket-data-15gb', 'Voucher paket data digital untuk kebutuhan internet.', 55000, 60000, 'digital', 'digital_delivery', 999, 'DUMMY-DIG-001', true, '2026-10-31'),
  ((select id from public.categories where slug='digital-products'), '[DUMMY] Pulsa Digital 25K', 'pulsa-digital-25k', 'Pulsa digital nominal 25 ribu.', 27000, 27000, 'digital', 'digital_delivery', 999, 'DUMMY-DIG-002', true, '2026-10-29'),
  ((select id from public.categories where slug='digital-products'), '[DUMMY] Voucher Streaming', 'voucher-streaming', 'Voucher layanan streaming mitra resmi.', 35000, 40000, 'digital', 'digital_delivery', 150, 'DUMMY-DIG-003', true, '2026-10-25'),
  ((select id from public.categories where slug='digital-products'), '[DUMMY] Digital Planner PDF', 'digital-planner-pdf', 'Template planner digital untuk aplikasi anotasi PDF.', 39000, 59000, 'digital', 'digital_delivery', 999, 'DUMMY-DIG-004', true, '2026-10-27'),
  ((select id from public.categories where slug='digital-products'), '[DUMMY] Layanan Aplikasi Digital Resmi', 'layanan-aplikasi-resmi', 'Bantuan layanan aplikasi legal sesuai ketentuan mitra.', 45000, 45000, 'digital', 'digital_delivery', 999, 'DUMMY-DIG-005', true, '2026-10-20'),
  ((select id from public.categories where slug='creative-services'), '[DUMMY] Desain Feed Instagram', 'desain-feed-instagram', 'Paket desain konten feed untuk personal brand atau bisnis.', 150000, 200000, 'service', 'manual_service', 10, 'DUMMY-SRV-001', true, '2026-10-31'),
  ((select id from public.categories where slug='creative-services'), '[DUMMY] Editing Video Reels', 'video-editing-reels', 'Editing video singkat sesuai brief pelanggan.', 125000, 125000, 'service', 'manual_service', 10, 'DUMMY-SRV-002', true, '2026-10-24'),
  ((select id from public.categories where slug='printing-custom'), '[DUMMY] Cetak Sticker Custom', 'print-sticker-custom', 'Produksi sticker berdasarkan desain pelanggan.', 75000, 90000, 'service', 'manual_service', 20, 'DUMMY-SRV-003', true, '2026-10-17'),
  ((select id from public.categories where slug='creative-services'), '[DUMMY] Administrasi Kreatif Etis', 'administrasi-kreatif-etis', 'Bantuan penyusunan materi, formatting, dan presentasi.', 100000, 100000, 'service', 'manual_service', 8, 'DUMMY-SRV-004', true, '2026-10-23'),
  ((select id from public.categories where slug='graduation-merchandise'), '[DUMMY] Merchandise Wisuda Custom', 'paket-merchandise-wisuda', 'Merchandise custom untuk paket acara wisuda.', 180000, 220000, 'service', 'manual_service', 10, 'DUMMY-SRV-005', true, '2026-10-30')
on conflict (slug) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  original_price = excluded.original_price,
  product_type = excluded.product_type,
  fulfillment_type = excluded.fulfillment_type,
  stock_quantity = excluded.stock_quantity,
  sku = excluded.sku,
  is_active = true;

insert into public.product_images(product_id, image_url, alt_text, display_order)
select p.id,
       case p.slug
         when 'skincare-glow-set' then 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&h=600&q=78'
         when 'lip-tint-pop-color' then 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&h=600&q=78'
         when 'hijab-everyday' then 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&h=600&q=78'
         when 'paket-data-15gb' then 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&h=600&q=78'
         when 'desain-feed-instagram' then 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&h=600&q=78'
         else 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&h=600&q=78'
       end,
       '[DUMMY] ' || p.name,
       0
from public.products p
where p.is_active
on conflict (product_id, display_order) do update set image_url = excluded.image_url, alt_text = excluded.alt_text;
