import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext.jsx';
import { Navbar } from './components/layout/Navbar.jsx';
import { CartDrawer } from './components/cart/CartDrawer.jsx';
import { Home } from './pages/customer/Home.jsx';
import { Shop } from './pages/customer/Shop.jsx';
import { Categories } from './pages/customer/Categories.jsx';
import { Digital } from './pages/customer/Digital.jsx';
import { Services } from './pages/customer/Services.jsx';
import { Promo } from './pages/customer/Promo.jsx';
import { MyAccount } from './pages/customer/MyAccount.jsx';
import { Checkout } from './pages/customer/Checkout.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Terjadi kesalahan tampilan.' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAFAFF] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm max-w-md space-y-3">
            <h2 className="text-lg font-extrabold text-gray-900">Halaman Mengalami Kendala</h2>
            <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl font-mono">
              {this.state.errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-purple-700"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-[#FAFAFF]">
          <Navbar />
          <CartDrawer />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/digital" element={<Digital />} />
              <Route path="/services" element={<Services />} />
              <Route path="/promo" element={<Promo />} />
              <Route path="/account" element={<MyAccount />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;