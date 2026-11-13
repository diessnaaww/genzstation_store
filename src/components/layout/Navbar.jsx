import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Home,
  Store,
  LayoutGrid,
  Zap,
  FileText,
  TicketPercent,
  User,
  ShoppingBag,
  Menu,
  X,
  MessageCircle,
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext.jsx';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartItems, setIsCartOpen } = useCart();

  const totalCartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const navMenus = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Shop', path: '/shop', icon: Store },
    { name: 'Categories', path: '/categories', icon: LayoutGrid },
    { name: 'Digital', path: '/digital', icon: Zap },
    { name: 'Services', path: '/services', icon: FileText },
    { name: 'Promo', path: '/promo', icon: TicketPercent },
    { name: 'My Account', path: '/account', icon: User },
  ];

  const getLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
      isActive
        ? 'bg-purple-600 text-white shadow-xs'
        : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-rose-500 flex items-center justify-center text-white font-black text-base shadow-sm">
              GS
            </div>
            <div>
              <span className="font-extrabold text-gray-900 text-base sm:text-lg tracking-tight block leading-none">
                Genzstation<span className="text-purple-600">.id</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium hidden sm:block">
                3-Pillar Digital & Lifestyle
              </span>
            </div>
          </Link>

          {/* Menu Utama Desktop (Digital & Services Terpisah) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navMenus.map((menu) => {
              const IconComponent = menu.icon;
              return (
                <NavLink
                  key={menu.path}
                  to={menu.path}
                  end={menu.path === '/'}
                  className={getLinkClass}
                >
                  <IconComponent size={14} />
                  <span>{menu.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Aksi Kanan: CS WhatsApp, Keranjang, & Toggle Mobile */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://wa.link/j6x8x5"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all"
            >
              <MessageCircle size={15} />
              <span>CS Admin</span>
            </a>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
              aria-label="Keranjang Belanja"
            >
              <ShoppingBag size={18} />
              <span className="hidden xl:inline text-xs font-bold">Keranjang</span>
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Tombol Menu Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Buka Menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Menu Utama (Tampilan HP / Tablet) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 pt-3 pb-5 space-y-1.5 shadow-lg">
          {navMenus.map((menu) => {
            const IconComponent = menu.icon;
            return (
              <NavLink
                key={menu.path}
                to={menu.path}
                end={menu.path === '/'}
                onClick={() => setIsMobileMenuOpen(false)}
                className={getLinkClass}
              >
                <IconComponent size={16} />
                <span>{menu.name}</span>
              </NavLink>
            );
          })}
          <a
            href="https://wa.link/j6x8x5"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 mt-2"
          >
            <MessageCircle size={16} />
            <span>Hubungi CS Admin via WhatsApp</span>
          </a>
        </div>
      )}
    </header>
  );
};

export default Navbar;