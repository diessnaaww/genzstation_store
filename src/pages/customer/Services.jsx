import React, { useState, useMemo } from 'react';
import { FileText, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { initialProducts } from '../../data/products.js';
import { ProductCard } from '../../components/common/ProductCard.jsx';

export const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const serviceProducts = useMemo(
    () => initialProducts.filter((item) => item.pillar === 'service'),
    []
  );

  const serviceCategories = useMemo(
    () => ['all', ...new Set(serviceProducts.map((item) => item.category))],
    [serviceProducts]
  );

  const displayedServices = useMemo(() => {
    if (selectedCategory === 'all') return serviceProducts;
    return serviceProducts.filter((item) => item.category === selectedCategory);
  }, [serviceProducts, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#FAFAFF] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Halaman Services */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200/70 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
              <FileText size={13} /> Professional & Academic Services
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Layanan Jasa Profesional
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">
              Layanan cek plagiasi Turnitin No-Repository, parafrase karya ilmiah, olah data statistik, hingga kebutuhan kreatif digital dikerjakan rapi & tepat waktu.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 shrink-0">
            <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-3 text-xs">
              <div className="font-bold text-rose-800 flex items-center gap-1 mb-0.5">
                <ShieldCheck size={14} />
                <span>Privasi Aman</span>
              </div>
              <p className="text-[11px] text-gray-600">Akun Turnitin No-Repository</p>
            </div>
            <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 text-xs">
              <div className="font-bold text-purple-800 flex items-center gap-1 mb-0.5">
                <Clock size={14} />
                <span>Proses Cepat</span>
              </div>
              <p className="text-[11px] text-gray-600">Lampirkan link Drive saat Checkout</p>
            </div>
          </div>
        </div>

        {/* Filter Subkategori Jasa */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {serviceCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300'
              }`}
            >
              {cat === 'all' ? `Semua Layanan (${serviceProducts.length})` : cat}
            </button>
          ))}
        </div>

        {/* Grid Layanan Jasa */}
        {displayedServices.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedServices.map((service) => (
              <ProductCard key={service.id} product={service} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center space-y-2">
            <Sparkles size={36} className="mx-auto text-rose-500" />
            <p className="text-sm font-bold text-gray-800">Belum ada layanan jasa di kategori ini</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;