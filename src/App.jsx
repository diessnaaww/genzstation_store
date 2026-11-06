import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Shop from './pages/customer/Shop.jsx';
import Checkout from './pages/customer/Checkout.jsx';
import CartDrawer from './components/cart/CartDrawer.jsx';

function App() {
  return (
    <div className="min-h-screen bg-[#FAFAFF]">
      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>

      <CartDrawer />
    </div>
  );
}

export default App;