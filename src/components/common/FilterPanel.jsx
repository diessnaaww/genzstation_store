import React from 'react';

export const FilterPanel = ({ selectedPillar, setSelectedPillar, sortBy, setSortBy }) => {
  const pillars = [
    { id: 'all', label: 'Semua Pilar' },
    { id: 'physical', label: 'Physical Products' },
    { id: 'digital', label: 'Digital Products' },
    { id: 'service', label: 'Services & Solutions' },
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      {/* Tab Filter Pilar */}
      <div className="flex flex-wrap gap-2">
        {pillars.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPillar(p.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedPillar === p.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Dropdown Sort Harga */}
      <div className="flex items-center gap-2 self-end md:self-auto">
        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Urutkan:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-xs rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium text-gray-700"
        >
          <option value="latest">Terbaru</option>
          <option value="price-low">Harga: Rendah ke Tinggi</option>
          <option value="price-high">Harga: Tinggi ke Rendah</option>
        </select>
      </div>
    </div>
  );
};