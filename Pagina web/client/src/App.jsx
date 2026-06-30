import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import HomePage from './pages/HomePage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminProductosPage from './pages/admin/AdminProductosPage'
import AdminProductoFormPage from './pages/admin/AdminProductoFormPage'
import AdminPedidosPage from './pages/admin/AdminPedidosPage'

function RequireAuth({ children }) {
  const { admin, loading } = useAdminAuth()
  if (loading) return <div className="min-h-screen bg-cream flex items-center justify-center text-ink-muted text-sm">Cargando…</div>
  if (!admin) return <Navigate to="/admin/login" replace />
  return children
}

function StoreLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/producto/:id" element={<ProductDetailPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <CartProvider>
          <Routes>
            {/* Panel admin */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="productos" element={<AdminProductosPage />} />
              <Route path="productos/nuevo" element={<AdminProductoFormPage />} />
              <Route path="productos/:id" element={<AdminProductoFormPage />} />
              <Route path="pedidos" element={<AdminPedidosPage />} />
            </Route>

            {/* Tienda pública */}
            <Route path="/*" element={<StoreLayout />} />
          </Routes>
        </CartProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  )
}
