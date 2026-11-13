import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { initialProducts } from '../../data/products.js';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import { SearchBar } from '../../components/common/SearchBar.jsx';
import { FilterPanel } from '../../components/common/FilterPanel.jsx';
import { PackageSearch, Truck, MapPin } from 'lucide-react';

export const Shop = () => {
  const [searchParams] = useSearchParams();
  const categoryQuery = searchParams.get('category') || '';

  const [searchTerm, setSearchTerm] = useState(categoryQuery);
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    setSearchTerm(categoryQuery);
  }, [categoryQuery]);

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
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Seluruh Katalog Produk
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Temukan kebutuhan produk fisik, aplikasi digital premium, dan layanan jasa profesional.
          </p>
        </div>

        {/* Banner Transparansi Pengiriman */}
        <div className="bg-gradient-to-r from-purple-50 via-white to-amber-50/70 border border-purple-100 rounded-2xl p-3.5 sm:p-4 flex items-start sm:items-center gap-3 shadow-2xs">
          <div className="bg-purple-100 text-purple-700 p-2 rounded-xl shrink-0 mt-0.5 sm:mt-0">
            <Truck size={18} />
          </div>
          <div className="text-xs text-gray-600 leading-relaxed">
            <span className="font-bold text-gray-900">Info Transparansi Pengiriman: </span>
            Produk fisik dikirim langsung dari kota mitra supplier resmi kami (
            <span className="inline-flex items-center gap-0.5 font-semibold text-purple-700">
              <MapPin size={11} /> Surabaya, Malang,Sukoharjo, Kudus, & Kediri
            </span>
            ). Pembelian dari kota asal berbeda akan dikirim terpisah sesuai gudang masing-masing.
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