export const initialProducts = [
  // ==========================================
  // 1. PRODUK DIGITAL (DENGAN TOMBOL VARIASI)
  // ==========================================
  {
    id: 'dig-01',
    name: 'Canva Pro Premium',
    pillar: 'digital',
    category: 'App Premium',
    price: 10000, // Harga awal ("Mulai dari")
    image: '/images/canva-pro.jpg',
    description: 'Akses penuh template Pro, hapus latar belakang, dan Magic Studio.',
    variationConfig: {
      types: ['Implan / Invite', 'Famplan (Head)', 'Private'],
      durations: ['1 Bulan', '3 Bulan', '1 Tahun', 'Lifetime'],
      prices: {
        'Implan / Invite|1 Bulan': 10000,
        'Implan / Invite|3 Bulan': 20000,
        'Implan / Invite|1 Tahun': 35000,
        'Implan / Invite|Lifetime': 55000,
        'Famplan (Head)|1 Bulan': 25000,
        'Famplan (Head)|3 Bulan': 60000,
        'Famplan (Head)|1 Tahun': 140000,
        'Private|1 Bulan': 35000,
        'Private|3 Bulan': 90000,
        'Private|1 Tahun': 220000,
      },
    },
  },
  {
    id: 'dig-02',
    name: 'Netflix UHD 4K',
    pillar: 'digital',
    category: 'Streaming',
    price: 25000,
    image: '/images/netflix.jpg',
    description: 'Resolusi Ultra HD 4K, anti-household, garansi penuh selama masa aktif.',
    variationConfig: {
      types: ['Sharing (1P1U)', 'Semi-Private', 'Private'],
      durations: ['7 Hari', '1 Bulan', '3 Bulan'],
      prices: {
        'Sharing (1P1U)|7 Hari': 15000,
        'Sharing (1P1U)|1 Bulan': 32000,
        'Sharing (1P1U)|3 Bulan': 88000,
        'Semi-Private|1 Bulan': 55000,
        'Semi-Private|3 Bulan': 155000,
        'Private|1 Bulan': 135000,
        'Private|3 Bulan': 380000,
      },
    },
  },
  {
    id: 'dig-03',
    name: 'Spotify Premium',
    pillar: 'digital',
    category: 'Music & Audio',
    price: 15000,
    image: '/images/spotify.jpg',
    description: 'Bebas iklan, download lagu offline, bisa perpanjang akun lama.',
    variationConfig: {
      types: ['Implan / Invite', 'Famplan', 'Individual'],
      durations: ['1 Bulan', '3 Bulan', '1 Tahun'],
      prices: {
        'Implan / Invite|1 Bulan': 15000,
        'Implan / Invite|3 Bulan': 38000,
        'Famplan|1 Bulan': 22000,
        'Individual|1 Bulan': 35000,
        'Individual|3 Bulan': 95000,
        'Individual|1 Tahun': 280000,
      },
    },
  },
  {
    id: 'dig-04',
    name: 'Paket Kuota Data All Operator',
    pillar: 'digital',
    category: 'Pulsa & Kuota',
    price: 25000,
    image: '/images/kuota-data.jpg',
    description: 'Pengisian paket data internet langsung masuk ke nomor tujuan.',
    variationConfig: {
      types: ['Telkomsel', 'Indosat', 'XL / Axis', 'Tri'],
      durations: ['7 Hari (Mini)', '30 Hari (Bulanan)'],
      prices: {
        'Telkomsel|7 Hari (Mini)': 25000,
        'Telkomsel|30 Hari (Bulanan)': 55000,
        'Indosat|7 Hari (Mini)': 22000,
        'Indosat|30 Hari (Bulanan)': 50000,
        'XL / Axis|7 Hari (Mini)': 20000,
        'XL / Axis|30 Hari (Bulanan)': 48000,
        'Tri|7 Hari (Mini)': 18000,
        'Tri|30 Hari (Bulanan)': 45000,
      },
    },
  },

  // ==========================================
  // 2. PRODUK FISIK (DROPSHIP MULTI-SUPPLIER)
  // ==========================================
  {
    id: 'phys-01',
    name: 'Paket Skincare Glow Brightening',
    pillar: 'physical',
    category: 'Beauty & Skincare',
    price: 120000,
    originCity: 'Sukoharjo',
    image: '/images/skincare-glow.jpg',
    description: 'Paket perawatan wajah lengkap, pengiriman dari supplier Sukoharjo.',
  },
  {
    id: 'phys-02',
    name: 'Hijab Bella Square Premium',
    pillar: 'physical',
    category: 'Fashion & Style',
    price: 35000,
    originCity: 'Kudus',
    image: '/images/hijab-bella.jpg',
    description: 'Hijab segiempat bahan adem mudah dibentuk, pengiriman dari Kudus.',
  },
  {
    id: 'phys-03',
    name: 'Press-On Nail Art Custom Handmade',
    pillar: 'physical',
    category: 'Nail Art',
    price: 45000,
    originCity: 'Kediri',
    image: '/images/nail-art.jpg',
    description: 'Kuku tempel handmade reusable gratis Nail Prep Kit, pengiriman dari Kediri.',
  },

  // ==========================================
  // 3. LAYANAN JASA (GENZSTATION ACADEMIC & CREATIVE)
  // ==========================================
  {
    id: 'srv-01',
    name: 'Jasa Cek Plagiasi Turnitin (No-Repository)',
    pillar: 'service',
    category: 'Genzstation Academic',
    price: 5000,
    image: '/images/turnitin.jpg',
    description: 'Cek kemiripan skripsi/jurnal cepat 5-15 menit, aman tanpa masuk database.',
  },
  {
    id: 'srv-02',
    name: 'Jasa Parafrase & Penurunan Turnitin',
    pillar: 'service',
    category: 'Genzstation Academic',
    price: 50000,
    image: '/images/parafrase.jpg',
    description: 'Perbaikan struktur kalimat manual sesuai PUEBI hingga lolos batas kampus.',
  },
];