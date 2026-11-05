import React, { useState, useMemo } from 'react';
import { initialProducts } from '../../data/products.js';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import { SearchBar } from '../../components/common/SearchBar.jsx';
import { FilterPanel } from '../../components/common/FilterPanel.jsx';
import { PackageSearch } from 'lucide-react';

export const Shop = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              product.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPillar = selectedPillar === 'all' || product.pillar === selectedPillar;
        return matchesSearch && matchesPillar;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        return 0; // default latest
      });
  }, [searchTerm, selectedPillar, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAFAFF] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Katalog */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Katalog Genzstation.id
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Temukan produk fisik, kuota & voucher digital, serta layanan jasa kreatif dalam satu tempat.
          </p>
        </div>

        {/* Baris Pencarian & Filter */}
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <FilterPanel
          selectedPillar={selectedPillar}
          setSelectedPillar={setSelectedPillar}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Grid Produk */}
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
            <p className="text-sm text-gray-500 mt-1">Coba kata kunci lain atau ubah filter pilar produk Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;