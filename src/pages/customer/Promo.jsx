import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TicketPercent, Copy, Check, Sparkles, Clock, ArrowRight } from 'lucide-react';

export const Promo = () => {
  const [copiedCode, setCopiedCode] = useState('');

  const promos = [
    {
      code: 'GENZBARU',
      title: 'Diskon Pelanggan Baru 10%',
      desc: 'Berlaku untuk pembelian pertama semua kategori produk fisik maupun digital.',
      minOrder: 'Min. belanja Rp 50.000',
      badge: 'New Member',
      color: 'from-purple-600 to-indigo-600',
    },
    {
      code: 'SKRIPSIAMAN',
      title: 'Potongan Rp 5.000 Jasa Akademik',
      desc: 'Khusus layanan Parafrase & Penurunan Skor Turnitin maupun Olah Data Statistik.',
      minOrder: 'Min. order Rp 50.000',
      badge: 'Genzstation Academic',
      color: 'from-rose-500 to-pink-600',
    },
    {
      code: 'FREEKITNAILS',
      title: 'Gratis Complete Nail Prep Kit',
      desc: 'Otomatis mendapatkan lem jel, kikir mini, stik kutikula & alcohol swab di setiap set Press-On Nails.',
      minOrder: 'Tanpa minimal pembelian',
      badge: 'Bonus Produk',
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFF] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">
            <TicketPercent size={16} />
            <span>Penawaran Spesial</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Voucher, Diskon & Promo
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Salin kode voucher di bawah ini dan lampirkan saat konfirmasi pesanan di halaman Checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {promos.map((promo) => (
            <div
              key={promo.code}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className={`bg-gradient-to-r ${promo.color} p-4 text-white`}>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                    <Sparkles size={10} />
                    {promo.badge}
                  </span>
                  <h3 className="font-extrabold text-lg mt-2 leading-snug">{promo.title}</h3>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-xs text-gray-600 leading-relaxed">{promo.desc}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                    <Clock size={13} />
                    <span>{promo.minOrder}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-2.5">
                <div className="flex items-center justify-between bg-gray-50 border border-dashed border-gray-300 rounded-xl px-3 py-2">
                  <span className="font-mono font-extrabold text-xs text-gray-800">
                    {promo.code}
                  </span>
                  <button
                    onClick={() => handleCopy(promo.code)}
                    className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    {copiedCode === promo.code ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        <span className="text-emerald-600">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>

                <Link
                  to="/shop"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Gunakan Sekarang</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Promo;