import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

export function App() {
  return (
    <CartProvider>
      <Router>
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
      </Router>
    </CartProvider>
  );
}

export default App;