import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ToastContainer from './components/Toast/Toast';

// Pages
import HomePage from './pages/HomePage/HomePage';
import MenuPage from './pages/MenuPage/MenuPage';
import RestaurantPage from './pages/RestaurantPage/RestaurantPage';
import FoodDetailPage from './pages/FoodDetailPage/FoodDetailPage';
import CartPage from './pages/CartPage/CartPage';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import LoginPage from './pages/AuthPages/LoginPage';
import RegisterPage from './pages/AuthPages/RegisterPage';
import OrdersPage from './pages/OrdersPage/OrdersPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';

function AppLayout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/restaurant/:id" element={<RestaurantPage />} />
        <Route path="/food/:id" element={<FoodDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <AppLayout />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
