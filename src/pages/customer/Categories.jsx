import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Zap, FileText, MapPin, ArrowRight, Layers } from 'lucide-react';
import { initialProducts } from '../../data/products.js';

export const Categories = () => {
  const navigate = useNavigate();

  const categoryGroups = [
    {
      pillar: 'physical',
      title: 'Pilar 1: Produk Fisik (Multi-Supplier)',
      subtitle: 'Dikirim langsung dari mitra supplier terverifikasi di 3 kota',
      badgeColor: 'bg-purple-100 text-purple-700',
      icon: Package,
      subcategories: [
        {
          name: 'Beauty & Skincare',
          origin: 'Pengiriman dari Sukoharjo',
          desc: 'Paket perawatan wajah glowing, serum, dan kosmetik pilihan.',
        },
        {
          name: 'Fashion & Style',
          origin: 'Pengiriman dari Kudus',
          desc: 'Koleksi hijab daily outfit adem, modis, dan kekinian.',
        },
        {
          name: 'Nail Art',
          origin: 'Pengiriman dari Kediri',
          desc: 'Press-on nail art handmade reusable gratis Nail Prep Kit.',
        },
      ],
    },
    {
      pillar: 'digital',
      title: 'Pilar 2: Produk Digital',
      subtitle: 'Pengiriman instan ke email atau nomor HP tanpa ongkos kirim',
      badgeColor: 'bg-lime-100 text-lime-800',
      icon: Zap,
      subcategories: [
        {
          name: 'App Premium',
          origin: 'Instan via Email / Akun',
          desc: 'Canva Pro (Implan, Famplan, Private) berbagai pilihan durasi.',
        },
        {
          name: 'Streaming',
          origin: 'Instan via Email / Akun',
          desc: 'Netflix UHD 4K (Sharing 1P1U, Semi-Private, Private).',
        },
        {
          name: 'Music & Audio',
          origin: 'Instan via Email / Akun',
          desc: 'Spotify Premium Individual, Famplan, & Invite.',
        },
        {
          name: 'Pulsa & Kuota',
          origin: 'Instan ke Nomor HP',
          desc: 'Paket internet data dan pulsa all operator 24 jam.',
        },
      ],
    },
    {
      pillar: 'service',
      title: 'Pilar 3: Layanan Jasa Profesional',
      subtitle: 'Dikerjakan oleh tim ahli sesuai tenggat waktu dan brief Anda',
      badgeColor: 'bg-rose-100 text-rose-700',
      icon: FileText,
      subcategories: [
        {
          name: 'Genzstation Academic',
          origin: 'Hasil dikirim via WA / Email',
          desc: 'Jasa cek plagiasi Turnitin No-Repository, parafrase, & olah data.',
        },
      ],
    },
  ];

  const handleOpenCategory = (subName) => {
    navigate(`/shop?category=${encodeURIComponent(subName)}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFF] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers size={15} />
            <span>Direktori Katalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Kategori & Subkategori
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Pilih kategori di bawah untuk melihat produk beserta informasi kota asal pengiriman.
          </p>
        </div>

        <div className="space-y-8">
          {categoryGroups.map((group) => {
            const IconComponent = group.icon;
            return (
              <div key={group.pillar} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${group.badgeColor}`}>
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900">{group.title}</h2>
                    <p className="text-xs text-gray-500">{group.subtitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.subcategories.map((sub) => {
                    const count = initialProducts.filter(
                      (p) => p.category.toLowerCase() === sub.name.toLowerCase()
                    ).length;

                    return (
                      <button
                        key={sub.name}
                        onClick={() => handleOpenCategory(sub.name)}
                        className="text-left bg-white p-5 rounded-2xl border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <MapPin size={11} />
                              {sub.origin}
                            </span>
                            <span className="text-[11px] font-bold text-gray-400">
                              {count} item
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900 text-base group-hover:text-purple-700 transition-colors">
                            {sub.name}
                          </h3>
                          <p className="text-xs text-gray-500 leading-relaxed">{sub.desc}</p>
                        </div>

                        <div className="text-xs font-bold text-purple-600 flex items-center gap-1 pt-2 border-t border-gray-50">
                          <span>Lihat Produk</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Categories;