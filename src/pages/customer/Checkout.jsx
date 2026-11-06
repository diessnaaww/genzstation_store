import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext.jsx';
import { ArrowLeft, Send, CheckCircle2, Package, Zap, FileText, ShoppingBag } from 'lucide-react';

export const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, setCartItems } = useCart();

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    whatsappNumber: '',
    shippingAddress: '', // Khusus produk fisik
    targetAccount: '',   // Khusus produk digital (Nomor HP/Email)
    serviceBrief: '',    // Khusus produk layanan/jasa (Drive/Instruksi)
    notes: '',
  });

  // Deteksi pilar produk di dalam keranjang
  const hasPhysical = cartItems.some((item) => item.pillar === 'physical');
  const hasDigital = cartItems.some((item) => item.pillar === 'digital');
  const hasService = cartItems.some((item) => item.pillar === 'service');

  const formatIDR = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();

    if (!formData.customerName || !formData.whatsappNumber) {
      alert('Mohon lengkapi Nama dan Nomor WhatsApp Anda.');
      return;
    }

    // Nomor WhatsApp Admin Genzstation.id (Sesuaikan nomor Anda)
    const adminWA = '6285649750554';

    // Rincian Item Pesanan
    let itemsList = cartItems
      .map((item, index) => `${index + 1}. *${item.name}* (${item.quantity}x) = ${formatIDR(item.price * item.quantity)}`)
      .join('\n');

    // Format Pesanan WhatsApp
    let waMessage = `*PESANAN BARU - GENZSTATION.ID*\n`;
    waMessage += `===============================\n\n`;
    waMessage += `*DATA PEMBELI:*\n`;
    waMessage += `• Nama: ${formData.customerName}\n`;
    waMessage += `• No. WA: ${formData.whatsappNumber}\n\n`;

    if (hasPhysical) {
      waMessage += `*DETAIL PENGIRIMAN (PRODUK FISIK):*\n`;
      waMessage += `• Alamat: ${formData.shippingAddress || '-'}\n\n`;
    }

    if (hasDigital) {
      waMessage += `*DATA PENERIMA (PRODUK DIGITAL):*\n`;
      waMessage += `• No. HP / Email Akun: ${formData.targetAccount || '-'}\n\n`;
    }

    if (hasService) {
      waMessage += `*BRIEF / INSTRUKSI (LAYANAN JASA):*\n`;
      waMessage += `• Catatan/Link File: ${formData.serviceBrief || '-'}\n\n`;
    }

    waMessage += `*RINCIAN ITEM:*\n${itemsList}\n\n`;
    waMessage += `-------------------------------\n`;
    waMessage += `*TOTAL PEMBAYARAN: ${formatIDR(getTotalPrice())}*\n`;
    waMessage += `-------------------------------\n`;
    if (formData.notes) {
      waMessage += `Catatan Tambahan: ${formData.notes}\n`;
    }
    waMessage += `\n_Mohon instruksi metode pembayaran selanjutnya. Terima kasih!_`;

    // Buka WhatsApp
    const encodedMessage = encodeURIComponent(waMessage);
    window.open(`https://wa.me/${adminWA}?text=${encodedMessage}`, '_blank');

    // Kosongkan keranjang & kembali ke katalog
    if (setCartItems) setCartItems([]);
    alert('Pesanan berhasil dibuat! Anda diarahkan ke WhatsApp Admin.');
    navigate('/');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFF] flex flex-col items-center justify-center p-4">
        <ShoppingBag size={56} className="text-purple-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Keranjang Anda Kosong</h2>
        <p className="text-sm text-gray-500 mt-1 mb-6">Silakan pilih produk dari katalog terlebih dahulu.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-purple-600 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-purple-700 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          <span>Kembali ke Katalog</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFF] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Tombol Kembali */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Kembali ke Toko</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Formulir Checkout Pesanan</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form Informasi Pembeli & Pilar */}
          <form onSubmit={handleSubmitOrder} className="md:col-span-2 space-y-6">
            {/* 1. Informasi Pembeli Utama */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 border-b pb-3 text-base flex items-center gap-2">
                <CheckCircle2 size={18} className="text-purple-600" />
                Informasi Pembeli
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Contoh: Adiesti Nuri"
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor WhatsApp Aktif *</label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    required
                    value={formData.whatsappNumber}
                    onChange={handleInputChange}
                    placeholder="Contoh: 08123456789"
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Form Spesifik Pilar Physical */}
            {hasPhysical && (
              <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 border-b pb-3 text-base flex items-center gap-2 text-purple-800">
                  <Package size={18} className="text-purple-600" />
                  Alamat Pengiriman (Produk Fisik)
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Alamat Lengkap & Kode Pos *</label>
                  <textarea
                    name="shippingAddress"
                    rows="3"
                    required={hasPhysical}
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi, Kode Pos"
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  ></textarea>
                </div>
              </div>
            )}

            {/* 3. Form Spesifik Pilar Digital */}
            {hasDigital && (
              <div className="bg-white p-6 rounded-2xl border border-lime-100 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 border-b pb-3 text-base flex items-center gap-2 text-lime-800">
                  <Zap size={18} className="text-lime-600" />
                  Tujuan Pengisian (Produk Digital)
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor HP Kuota / Email Akun *</label>
                  <input
                    type="text"
                    name="targetAccount"
                    required={hasDigital}
                    value={formData.targetAccount}
                    onChange={handleInputChange}
                    placeholder="Nomor HP pengisian pulsa/kuota atau Email untuk Canva Pro"
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 4. Form Spesifik Pilar Service */}
            {hasService && (
              <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 border-b pb-3 text-base flex items-center gap-2 text-rose-800">
                  <FileText size={18} className="text-rose-600" />
                  Instruksi Pekerjaan (Layanan Jasa)
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tautan Berkas / Catatan Brief *</label>
                  <textarea
                    name="serviceBrief"
                    rows="3"
                    required={hasService}
                    value={formData.serviceBrief}
                    onChange={handleInputChange}
                    placeholder="Tautan Google Drive naskah Turnitin / detail brief desain logo yang diinginkan"
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  ></textarea>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all text-base"
            >
              <Send size={20} />
              <span>Kirim Pesanan via WhatsApp</span>
            </button>
          </form>

          {/* Ringkasan Pesanan */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit space-y-4">
            <h3 className="font-bold text-gray-900 border-b pb-3 text-base">Ringkasan Keranjang</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs border-b border-gray-50 pb-2">
                  <div>
                    <p className="font-bold text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-gray-400 mt-0.5">{item.quantity}x @ {formatIDR(item.price)}</p>
                  </div>
                  <span className="font-extrabold text-purple-700">{formatIDR(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 flex justify-between items-center text-sm">
              <span className="font-bold text-gray-700">Total Tagihan</span>
              <span className="font-extrabold text-purple-700 text-lg">{formatIDR(getTotalPrice())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;