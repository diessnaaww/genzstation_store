import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext.jsx';
import { saveOrderToSheets } from '../../services/sheetsService.js';
import { ArrowLeft, Send, CheckCircle2, Package, Zap, FileText, ShoppingBag, Loader2 } from 'lucide-react';

export const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, setCartItems } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    whatsappNumber: '',
    shippingAddress: '',
    targetAccount: '',
    serviceBrief: '',
    notes: '',
  });

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

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!formData.customerName || !formData.whatsappNumber) {
      alert('Mohon lengkapi Nama dan Nomor WhatsApp Anda.');
      return;
    }

    setIsSubmitting(true);

    // 1. Kelompokkan data untuk Google Sheets & WhatsApp
    const uniquePillars = [...new Set(cartItems.map((item) => item.pillar))].join(', ');
    const uniqueOrigins = [...new Set(cartItems.map((item) => item.originCity || 'Digital/Pusat'))].join(', ');
    const itemsSummaryText = cartItems
      .map((item) => `${item.name} (${item.quantity}x)`)
      .join('; ');

    // 2. Simpan ke Database Google Sheets via Service Terpusat
    const sheetResult = await saveOrderToSheets({
      customerName: formData.customerName,
      whatsappNumber: formData.whatsappNumber,
      pillars: uniquePillars,
      itemsSummary: itemsSummaryText,
      originCities: uniqueOrigins,
      shippingAddress: formData.shippingAddress,
      targetAccount: formData.targetAccount,
      serviceBrief: formData.serviceBrief,
      totalPrice: getTotalPrice(),
    });

    const orderIdText = sheetResult?.orderId ? ` (${sheetResult.orderId})` : '';

    // 3. Susun Rincian Paket Multi-Supplier untuk WhatsApp
    const groupedByOrigin = cartItems.reduce((acc, item) => {
      const origin = item.originCity || 'Non-Fisik / Pusat';
      if (!acc[origin]) acc[origin] = [];
      acc[origin].push(item);
      return acc;
    }, {});

    let itemsListWA = '';
    Object.keys(groupedByOrigin).forEach((origin, idx) => {
      itemsListWA += `\n📦 *Paket ${idx + 1} (Asal: ${origin})*\n`;
      groupedByOrigin[origin].forEach((item) => {
        itemsListWA += `  • ${item.name} (${item.quantity}x) = ${formatIDR(item.price * item.quantity)}\n`;
      });
    });

    const adminWA = '6285649750554';
    let waMessage = `*PESANAN BARU${orderIdText} - GENZSTATION.ID*\n`;
    waMessage += `===============================\n\n`;
    waMessage += `*DATA PEMBELI:*\n`;
    waMessage += `• Nama: ${formData.customerName}\n`;
    waMessage += `• No. WA: ${formData.whatsappNumber}\n\n`;

    if (hasPhysical) {
      waMessage += `*ALAMAT PENGIRIMAN:*\n`;
      waMessage += `• ${formData.shippingAddress || '-'}\n\n`;
    }
    if (hasDigital) {
      waMessage += `*TUJUAN PRODUK DIGITAL:*\n`;
      waMessage += `• ${formData.targetAccount || '-'}\n\n`;
    }
    if (hasService) {
      waMessage += `*BRIEF LAYANAN JASA:*\n`;
      waMessage += `• ${formData.serviceBrief || '-'}\n\n`;
    }

    waMessage += `*RINCIAN ITEM:*${itemsListWA}\n`;
    waMessage += `-------------------------------\n`;
    waMessage += `*SUBTOTAL PRODUK: ${formatIDR(getTotalPrice())}*\n`;
    waMessage += `-------------------------------\n`;
    if (hasPhysical) {
      waMessage += `_Catatan: Ongkir dihitung sesuai kota asal masing-masing supplier._\n`;
    }

    const encodedMessage = encodeURIComponent(waMessage);
    window.open(`https://wa.me/${adminWA}?text=${encodedMessage}`, '_blank');

    setIsSubmitting(false);
    if (setCartItems) setCartItems([]);
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
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Kembali ke Toko</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Formulir Checkout Pesanan</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <form onSubmit={handleSubmitOrder} className="md:col-span-2 space-y-6">
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
                    placeholder="Tautan Google Drive naskah Turnitin / detail brief desain yang diinginkan"
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  ></textarea>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 active:scale-[0.99] text-white font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Menyimpan Pesanan...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>Kirim Pesanan via WhatsApp</span>
                </>
              )}
            </button>
          </form>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit space-y-4">
            <h3 className="font-bold text-gray-900 border-b pb-3 text-base">Ringkasan Keranjang</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs border-b border-gray-50 pb-2">
                  <div>
                    <p className="font-bold text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-gray-400 mt-0.5">
                      {item.quantity}x @ {formatIDR(item.price)}
                      {item.originCity ? ` • Asal: ${item.originCity}` : ''}
                    </p>
                  </div>
                  <span className="font-extrabold text-purple-700">{formatIDR(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 flex justify-between items-center text-sm">
              <span className="font-bold text-gray-700">Subtotal Produk</span>
              <span className="font-extrabold text-purple-700 text-lg">{formatIDR(getTotalPrice())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;