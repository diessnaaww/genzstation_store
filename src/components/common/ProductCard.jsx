import React, { useState } from 'react';
import { ShoppingCart, Check, MapPin, Sparkles } from 'lucide-react';
import { useCart } from '../../contexts/CartContext.jsx';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const hasVariations = Boolean(product.variationConfig);
  const variationConfig = product.variationConfig || {};

  // State pilihan variasi default (ambil opsi pertama)
  const [selectedType, setSelectedType] = useState(
    hasVariations ? variationConfig.types[0] : ''
  );
  const [selectedDuration, setSelectedDuration] = useState(
    hasVariations ? variationConfig.durations[0] : ''
  );

  // Hitung harga aktif berdasarkan variasi yang dipilih
  const variantKey = `${selectedType}|${selectedDuration}`;
  const currentPrice = hasVariations
    ? variationConfig.prices[variantKey] ?? product.price
    : product.price;

  const isVariantAvailable = hasVariations
    ? variationConfig.prices[variantKey] !== undefined
    : true;

  // Saat pembeli mengganti Tipe (misal: Sharing -> Private), pastikan durasi otomatis menyesuaikan yang tersedia
  const handleSelectType = (newType) => {
    setSelectedType(newType);
    if (variationConfig.prices[`${newType}|${selectedDuration}`] === undefined) {
      const firstValidDuration = variationConfig.durations.find(
        (dur) => variationConfig.prices[`${newType}|${dur}`] !== undefined
      );
      if (firstValidDuration) {
        setSelectedDuration(firstValidDuration);
      }
    }
  };

  const formatIDR = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!isVariantAvailable) return;

    // Susun item keranjang unik berdasarkan variasi agar tidak tertimpa jika beli beda paket
    const itemToAdd = hasVariations
      ? {
          ...product,
          id: `${product.id}-${selectedType}-${selectedDuration}`,
          name: `${product.name} [${selectedType} • ${selectedDuration}]`,
          price: currentPrice,
        }
      : product;

    addToCart(itemToAdd);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const pillarBadgeStyles = {
    physical: 'bg-purple-100 text-purple-700',
    digital: 'bg-lime-100 text-lime-800',
    service: 'bg-rose-100 text-rose-700',
  };

  const pillarLabels = {
    physical: 'Physical',
    digital: 'Digital',
    service: 'Service',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      <div>
        {/* Gambar Produk */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            onError={(e) => {
              e.target.src = 'https://placehold.co/400x400/f3e8ff/7e22ce?text=Genzstation';
            }}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <span
            className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
              pillarBadgeStyles[product.pillar] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {pillarLabels[product.pillar] || product.pillar}
          </span>

          {product.originCity && (
            <span className="absolute bottom-2.5 left-2.5 bg-black/65 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-lg flex items-center gap-1">
              <MapPin size={10} />
              {product.originCity}
            </span>
          )}
        </div>

        {/* Detail Informasi Produk */}
        <div className="p-3.5 sm:p-4 space-y-2.5">
          <div>
            <p className="text-[11px] font-medium text-gray-400">{product.category}</p>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1 mt-0.5">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* TOMBOL VARIASI KHUSUS PRODUK DIGITAL */}
          {hasVariations && (
            <div className="pt-2 border-t border-gray-100 space-y-2.5">
              {/* Pilihan Tipe Akun (Famplan / Private / Sharing / Implan) */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1 mb-1.5">
                  <Sparkles size={10} className="text-purple-500" />
                  Pilih Tipe:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {variationConfig.types.map((type) => {
                    const isActive = selectedType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleSelectType(type)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                          isActive
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pilihan Durasi Pemakaian */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Durasi Pemakaian:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {variationConfig.durations.map((duration) => {
                    const isActive = selectedDuration === duration;
                    const isAvailable =
                      variationConfig.prices[`${selectedType}|${duration}`] !== undefined;

                    return (
                      <button
                        key={duration}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedDuration(duration)}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-lg border transition-all ${
                          !isAvailable
                            ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                            : isActive
                            ? 'bg-lime-500 text-gray-950 border-lime-500 font-bold shadow-xs'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-lime-400'
                        }`}
                      >
                        {duration}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Harga & Tombol Aksi */}
      <div className="p-3.5 sm:p-4 pt-0 space-y-2.5">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] text-gray-400 block">
              {hasVariations ? 'Harga Varian' : 'Harga'}
            </span>
            <span className="text-base sm:text-lg font-extrabold text-purple-700">
              {isVariantAvailable ? formatIDR(currentPrice) : 'Tidak Tersedia'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isVariantAvailable}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            !isVariantAvailable
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isAdded
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
          }`}
        >
          {isAdded ? (
            <>
              <Check size={15} />
              <span>Masuk Keranjang</span>
            </>
          ) : (
            <>
              <ShoppingCart size={15} />
              <span>Tambah ke Keranjang</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;