import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import HomePage from './pages/customer/HomePage'
import ShopPage from './pages/customer/ShopPage'
import ProductDetailPage from './pages/customer/ProductDetailPage'
import AuthPage from './pages/auth/AuthPage'
import AccountPage from './pages/customer/AccountPage'
import CartPage from './pages/customer/CartPage'
import CheckoutPage from './pages/customer/CheckoutPage'
import ProtectedRoute from './components/common/ProtectedRoute'
import OrderHistoryPage from './pages/customer/OrderHistoryPage'
import OrderDetailPage from './pages/customer/OrderDetailPage'
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminOrders from './pages/admin/AdminOrders'
import AdminSettings from './pages/admin/AdminSettings'

function App() {
  return (
    <Routes>
      <Route element={<ProtectedAdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/katalog" element={<ShopPage />} />
        <Route path="/produk/:slug" element={<ProductDetailPage />} />
        <Route path="/keranjang" element={<CartPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/akun" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/pesanan" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
        <Route path="/pesanan/:orderNumber" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/forgot-password" element={<AuthPage mode="forgot-password" />} />
        <Route path="/reset-password" element={<AuthPage mode="reset-password" />} />
        <Route path="/tentang" element={<div className="mx-auto max-w-7xl px-4 py-16">Tentang Genzstation akan tersedia setelah konten bisnis dikonfirmasi.</div>} />
        <Route path="/kontak" element={<div className="mx-auto max-w-7xl px-4 py-16">Halaman kontak akan tersedia pada Phase 2.</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
