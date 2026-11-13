import React, { useState, useMemo } from 'react';
import { Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { initialProducts } from '../../data/products.js';
import { ProductCard } from '../../components/common/ProductCard.jsx';

export const Digital = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const digitalProducts = useMemo(
    () => initialProducts.filter((item) => item.pillar === 'digital'),
    []
  );

  // Ambil daftar subkategori unik dari produk digital (App Premium, Streaming, Music & Audio, Pulsa & Kuota)
  const digitalCategories = useMemo(
    () => ['all', ...new Set(digitalProducts.map((item) => item.category))],
    [digitalProducts]
  );

  const displayedProducts = useMemo(() => {
    if (selectedCategory === 'all') return digitalProducts;
    return digitalProducts.filter((item) => item.category === selectedCategory);
  }, [digitalProducts, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#FAFAFF] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Halaman Digital */}
        <div className="bg-white p-6 rounded-2xl border border-lime-200/70 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-lime-800 bg-lime-100 px-3 py-1 rounded-full">
              <Zap size={13} /> Pengiriman Instan & Tanpa Ongkir
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Produk Digital & App Premium
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">
              Bebas pilih tipe akun (<strong>Implan / Invite, Famplan, Sharing, Private</strong>) dan durasi pemakaian sesuai kebutuhan Anda.
            </p>
          </div>

          <div className="bg-lime-50 border border-lime-200 rounded-xl p-3 text-xs text-lime-900 space-y-1 shrink-0">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-lime-700" />
              <span>Cara Pemesanan Praktis:</span>
            </div>
            <p className="text-[11px] text-lime-800">
              1. Pilih variasi Tipe & Durasi pada kartu produk
              <br />
              2. Masukkan Email / No. HP tujuan saat Checkout
            </p>
          </div>
        </div>

        {/* Filter Subkategori Digital */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {digitalCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-lime-500 text-gray-950 shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-lime-400'
              }`}
            >
              {cat === 'all' ? `Semua Digital (${digitalProducts.length})` : cat}
            </button>
          ))}
        </div>

        {/* Grid Produk Digital */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center space-y-2">
            <Sparkles size={36} className="mx-auto text-lime-500" />
            <p className="text-sm font-bold text-gray-800">Belum ada produk di kategori ini</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Digital;