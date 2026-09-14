import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { LocationProvider } from './context/LocationContext';
import TopHeaderBar from './components/TopHeaderBar/TopHeaderBar';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ToastContainer from './components/Toast/Toast';
import AuthModal from './components/AuthModal/AuthModal';

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
import OrderDetailPage from './pages/OrderDetailPage/OrderDetailPage';
import OrderConfirmedPage from './pages/OrderConfirmedPage/OrderConfirmedPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import FavoritesPage from './pages/FavoritesPage/FavoritesPage';
import NotificationsPage from './pages/NotificationsPage/NotificationsPage';
import AddressesPage from './pages/AddressesPage/AddressesPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import HelpPage from './pages/HelpPage/HelpPage';
import ReviewPage from './pages/ReviewPage/ReviewPage';

function AppLayout() {
  return (
    <>
      <TopHeaderBar />
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
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/order-confirmed/:id" element={<OrderConfirmedPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/addresses" element={<AddressesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/review/:id" element={<ReviewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      <ToastContainer />
      <AuthModal />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <FavoritesProvider>
              <BrowserRouter basename={import.meta.env.BASE_URL}>
                <AppLayout />
              </BrowserRouter>
            </FavoritesProvider>
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
