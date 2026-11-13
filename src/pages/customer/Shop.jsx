import React, { useState, useMemo } from 'react';
import { initialProducts } from '../../data/products.js';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import { SearchBar } from '../../components/common/SearchBar.jsx';
import { FilterPanel } from '../../components/common/FilterPanel.jsx';
import { PackageSearch, ShoppingBag, Truck, MapPin } from 'lucide-react';
import { useCart } from '../../contexts/CartContext.jsx';

export const Shop = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  const { cartItems, setIsCartOpen } = useCart();
  const totalCartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPillar = selectedPillar === 'all' || product.pillar === selectedPillar;
        return matchesSearch && matchesPillar;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        return 0;
      });
  }, [searchTerm, selectedPillar, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAFAFF] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header Toko */}
        <div className="flex justify-between items-center bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Genzstation.id
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Storefront 3 Pilar: Physical Products, Digital & Services
            </p>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-2xl transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            <ShoppingBag size={20} />
            <span className="hidden sm:inline text-xs font-bold">Keranjang</span>
            {totalCartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>

        {/* Banner Transparansi Pengiriman Multi-Wilayah */}
        <div className="bg-gradient-to-r from-purple-50 via-white to-amber-50/70 border border-purple-100 rounded-2xl p-3.5 sm:p-4 flex items-start sm:items-center gap-3 shadow-2xs">
          <div className="bg-purple-100 text-purple-700 p-2 rounded-xl shrink-0 mt-0.5 sm:mt-0">
            <Truck size={18} />
          </div>
          <div className="text-xs text-gray-600 leading-relaxed">
            <span className="font-bold text-gray-900">Info Transparansi Pengiriman: </span>
            Produk fisik dikirim langsung dari kota mitra supplier resmi kami (
            <span className="inline-flex items-center gap-0.5 font-semibold text-purple-700">
              <MapPin size={11} /> Sukoharjo, Kudus, & Kediri
            </span>
            ). Jika Anda membeli produk dari kota asal berbeda dalam satu pesanan, paket akan dikirim terpisah sesuai gudang masing-masing.
          </div>
        </div>

        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <FilterPanel
          selectedPillar={selectedPillar}
          setSelectedPillar={setSelectedPillar}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm my-8">
            <PackageSearch size={48} className="mx-auto text-purple-400 mb-3" />
            <h3 className="font-bold text-gray-800 text-lg">Produk Tidak Ditemukan</h3>
            <p className="text-sm text-gray-500 mt-1">
              Coba kata kunci lain atau ubah filter pilar produk Anda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;