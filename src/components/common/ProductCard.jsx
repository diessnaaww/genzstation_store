import React from 'react';
import { ShoppingBag, Star, Zap, CheckCircle2, Package } from 'lucide-react';
import { useCart } from '../../contexts/CartContext.jsx';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  // Helper badge sesuai tipe produk
  const getTypeBadge = (type) => {
    switch (type) {
      case 'digital':
        return { label: 'Digital', bg: 'bg-lime-100 text-lime-800 border-lime-300', icon: Zap };
      case 'service':
        return { label: 'Jasa / Service', bg: 'bg-rose-100 text-rose-800 border-rose-300', icon: CheckCircle2 };
      default:
        return { label: 'Fisik', bg: 'bg-purple-100 text-purple-800 border-purple-300', icon: Package };
    }
  };

  const badge = getTypeBadge(product.type);
  const BadgeIcon = badge.icon;

  const formatIDR = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      <div className="relative overflow-hidden aspect-square bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badge Tipe Produk */}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${badge.bg}`}>
          <BadgeIcon size={12} />
          {badge.label}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-center gap-1 text-amber-500 text-xs font-medium mb-1">
            <Star size={14} className="fill-amber-400 stroke-amber-400" />
            <span>{product.rating}</span>
            <span className="text-gray-400">({product.category})</span>
          </div>
          <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through block">
                {formatIDR(product.originalPrice)}
              </span>
            )}
            <span className="font-extrabold text-purple-700 text-base">
              {formatIDR(product.price)}
            </span>
          </div>

          <button
            onClick={() => addToCart(product)}
            className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center"
            title="Tambah ke Keranjang"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};