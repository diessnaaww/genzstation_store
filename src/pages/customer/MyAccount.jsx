import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Heart,
  PackageCheck,
  Search,
  Loader2,
  MapPin,
  ShoppingBag,
  Save,
} from 'lucide-react';
import { fetchOrdersFromSheets } from '../../services/googleSheets.js';
import { initialProducts } from '../../data/products.js';
import { useCart } from '../../contexts/CartContext.jsx';

export const MyAccount = () => {
  const { addToCart } = useCart();

  // Simpan profil lokal di browser pelanggan
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('genz_profile');
    return saved
      ? JSON.parse(saved)
      : { name: '', whatsapp: '', address: '' };
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // State pencarian riwayat pesanan dari Google Sheets
  const [searchQuery, setSearchQuery] = useState(profile.whatsapp || '');
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Wishlist sederhana (ambil 2 produk contoh jika belum ada)
  const [wishlistIds] = useState(() => {
    const saved = localStorage.getItem('genz_wishlist');
    return saved ? JSON.parse(saved) : ['dig-01', 'phys-01'];
  });

  const wishlistProducts = initialProducts.filter((p) => wishlistIds.includes(p.id));

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('genz_profile', JSON.stringify(profile));
    if (profile.whatsapp && !searchQuery) {
      setSearchQuery(profile.whatsapp);
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleCheckOrders = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoadingOrders(true);
    setHasSearched(true);

    const allOrders = await fetchOrdersFromSheets();
    const cleanedQuery = searchQuery.replace(/^0/, '').trim().toLowerCase();

    const matched = allOrders.filter((row) => {
      const rowOrderId = String(row.Order_ID || '').toLowerCase();
      const rowWa = String(row.No_WA || '').replace(/^'/, '').trim();
      return (
        rowOrderId.includes(cleanedQuery) ||
        rowWa.includes(cleanedQuery)
      );
    });

    setOrders(matched.reverse());
    setIsLoadingOrders(false);
  };

  useEffect(() => {
    if (profile.whatsapp) {
      handleCheckOrders();
    }
  }, []);

  const formatIDR = (price) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);

  return (
    <div className="min-h-screen bg-[#FAFAFF] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">My Account</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Kelola profil pengiriman, daftar wishlist, dan pantau status resi pesanan Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Profil & Wishlist */}
          <div className="space-y-6">
            <form
              onSubmit={handleSaveProfile}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3.5"
            >
              <h2 className="font-bold text-gray-900 text-base flex items-center gap-2 border-b pb-2.5">
                <User size={18} className="text-purple-600" />
                <span>Profil Pelanggan</span>
              </h2>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Nama Anda"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nomor WhatsApp</label>
                <input
                  type="tel"
                  value={profile.whatsapp}
                  onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                  placeholder="08123456789"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Alamat Utama</label>
                <textarea
                  rows="2"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Alamat pengiriman default"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Save size={14} />
                <span>{profileSaved ? 'Profil Tersimpan!' : 'Simpan Profil'}</span>
              </button>
            </form>

            {/* Wishlist */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <h2 className="font-bold text-gray-900 text-base flex items-center gap-2 border-b pb-2.5">
                <Heart size={18} className="text-rose-500" />
                <span>Wishlist Favorit</span>
              </h2>
              <div className="space-y-3">
                {wishlistProducts.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 bg-gray-50 p-2.5 rounded-xl"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                      <p className="text-[11px] font-extrabold text-purple-700">
                        {formatIDR(item.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shrink-0"
                      title="Masukkan ke Keranjang"
                    >
                      <ShoppingBag size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Riwayat Pesanan & Cek Resi */}
          <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 h-fit">
            <h2 className="font-bold text-gray-900 text-base flex items-center gap-2 border-b pb-3">
              <PackageCheck size={18} className="text-emerald-600" />
              <span>Riwayat Pesanan & Lacak Resi</span>
            </h2>

            <form onSubmit={handleCheckOrders} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan Nomor WhatsApp atau Order ID (misal: GS-847291)"
                className="flex-1 p-3 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoadingOrders}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-3 rounded-xl flex items-center gap-1.5 shrink-0"
              >
                {isLoadingOrders ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                <span>Lacak</span>
              </button>
            </form>

            {isLoadingOrders ? (
              <div className="py-10 text-center text-xs text-gray-500">
                Memuat riwayat pesanan dari database...
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order, idx) => (
                  <div
                    key={order.Order_ID || idx}
                    className="p-4 rounded-2xl border border-gray-100 bg-gray-50/70 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono font-extrabold text-xs text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg">
                        {order.Order_ID}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        {order.Status_Resi || 'Menunggu Konfirmasi'}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-gray-800">{order.Rincian_Pesanan}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 pt-1 border-t border-gray-200/70">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-purple-600" />
                        Asal: {order.Kota_Supplier}
                      </span>
                      <span>{order.Tanggal}</span>
                      <span className="font-extrabold text-gray-900 text-xs">
                        {formatIDR(order.Total_Harga)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center space-y-2">
                <p className="text-xs text-gray-500">
                  {hasSearched
                    ? 'Tidak ditemukan pesanan untuk nomor WA / Order ID tersebut.'
                    : 'Masukkan Nomor WhatsApp Anda untuk melihat status pesanan dan nomor resi.'}
                </p>
                <Link
                  to="/shop"
                  className="inline-block text-xs font-bold text-purple-600 hover:underline"
                >
                  Mulai Belanja Sekarang &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;