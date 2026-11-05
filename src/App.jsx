import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Shop from './pages/customer/Shop.jsx';

function App() {
  return (
    <div className="min-h-screen bg-[#FAFAFF]">
      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/shop" element={<Shop />} />
      </Routes>
    </div>
  );
}

export default App;