import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext.jsx';

export const CartDrawer = () => {
  const navigate = useNavigate();
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  if (!isCartOpen) return null;

  const formatIDR = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-purple-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-purple-600" />
              <h2 className="font-bold text-gray-900 text-lg">Keranjang Belanja</h2>
              <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {cartItems.reduce((total, item) => total + item.quantity, 0)} item
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xl bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                    <p className="text-xs font-extrabold text-purple-700 mt-1">
                      {formatIDR(item.price)}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-gray-500 hover:text-purple-600"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-bold text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-gray-500 hover:text-purple-600"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Hapus Item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 space-y-3">
                <ShoppingBag size={40} className="mx-auto text-gray-300" />
                <p className="text-sm font-semibold text-gray-500">Keranjang Anda masih kosong</p>
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-white space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="font-extrabold text-purple-700 text-lg">
                  {formatIDR(getTotalPrice())}
                </span>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
              >
                <span>Lanjut ke Checkout</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;