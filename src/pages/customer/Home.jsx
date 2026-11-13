import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, MapPin, Sparkles, ShieldCheck, Zap, Tag } from 'lucide-react';
import { initialProducts } from '../../data/products.js';
import { ProductCard } from '../../components/common/ProductCard.jsx';

export const Home = () => {
  const featuredProducts = initialProducts.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FAFAFF] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Hero Banner Promosi */}
        <section className="bg-gradient-to-br from-purple-700 via-purple-600 to-rose-500 rounded-3xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-xs text-xs font-bold px-3 py-1 rounded-full">
              <Sparkles size={14} />
              One-Stop Digital & Lifestyle Store
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              Belanja Produk Fisik, Aplikasi Premium & Jasa Akademik dalam Satu Tempat
            </h1>
            <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
              Mulai dari skincare, hijab, press-on nail art handmade, hingga Canva Pro dan jasa cek Turnitin No-Repository cepat & terpercaya.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/shop"
                className="bg-white text-purple-700 hover:bg-purple-50 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all"
              >
                <span>Jelajahi Katalog</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/promo"
                className="bg-purple-900/40 hover:bg-purple-900/60 border border-white/25 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center gap-2 transition-all"
              >
                <Tag size={16} />
                <span>Lihat Voucher Promo</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Banner Transparansi Pengiriman Multi-Wilayah */}
        <section className="bg-white border border-purple-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 text-purple-700 p-2.5 rounded-xl shrink-0">
              <Truck size={20} />
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <h2 className="font-bold text-gray-900 text-sm">
                Transparansi Pengiriman Multi-Supplier
              </h2>
              <p className="leading-relaxed">
                Produk fisik dikirim langsung dari mitra supplier resmi kami di{' '}
                <strong className="text-purple-700">Sukoharjo, Kudus, & Kediri</strong>. Pembelian lintas wilayah dikirim terpisah sesuai gudang asal dengan rincian ongkir transparan.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl shrink-0">
            <ShieldCheck size={15} />
            <span>100% Transparan & Amanah</span>
          </div>
        </section>

        {/* Ringkasan 3 Pilar (POSISI KODE LINK BERADA DI SINI) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pilar 1: Produk Fisik */}
          <Link
            to="/categories"
            className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-purple-300 transition-all shadow-2xs space-y-2"
          >
            <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
              <MapPin size={13} /> Physical Products
            </span>
            <h3 className="font-bold text-gray-900 text-base">Skincare, Hijab & Nail Art</h3>
            <p className="text-xs text-gray-500">
              Kurasi produk fisik pilihan langsung dari supplier Sukoharjo, Kudus, dan Kediri.
            </p>
          </Link>

          {/* Pilar 2: Produk Digital */}
          <Link
            to="/digital"
            className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-lime-400 transition-all shadow-2xs space-y-2"
          >
            <span className="inline-flex items-center gap-1 text-xs font-bold text-lime-800 bg-lime-100 px-2.5 py-1 rounded-lg">
              <Zap size={13} /> Digital Products
            </span>
            <h3 className="font-bold text-gray-900 text-base">App Premium, Pulsa & Kuota</h3>
            <p className="text-xs text-gray-500">
              Bebas pilih variasi tipe (Private, Famplan, Sharing, Implan) & durasi aktif.
            </p>
          </Link>

          {/* Pilar 3: Layanan Jasa */}
          <Link
            to="/services"
            className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-rose-300 transition-all shadow-2xs space-y-2"
          >
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
              <Sparkles size={13} /> Professional Services
            </span>
            <h3 className="font-bold text-gray-900 text-base">Turnitin & Bantuan Akademik</h3>
            <p className="text-xs text-gray-500">
              Layanan cek plagiasi No-Repository cepat, parafrase, serta olah data ilmiah.
            </p>
          </Link>
        </section>

        {/* Produk Pilihan */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Produk & Layanan Populer</h2>
              <p className="text-xs text-gray-500">Pilihan favorit pelanggan Genzstation.id</p>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;