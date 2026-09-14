import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import type { MenuItem } from '../../types';
import { useCart, getItemKey } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './FoodDetailPage.css';

const CATEGORY_IMAGES: Record<string, string> = {
  Meal: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
  Snacks: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=800&auto=format&fit=crop',
  Dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=800&auto=format&fit=crop',
  Drinks: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop',
  Vegan: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
};
const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop';

export default function FoodDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<MenuItem>((location.state?.item || {}) as MenuItem);
  const [loading, setLoading] = useState(!location.state?.item);
  const { addToCart, getItemQuantity, updateQuantity } = useCart();
  const { showToast } = useToast();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const itemId = getItemKey(item);

  useEffect(() => {
    if (!item?.name && id) {
      api.menu.getAll().then(all => {
        const found = all.find((m: MenuItem) => getItemKey(m) === id);
        if (found) setItem(found);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id, item]);

  const defaultImg = (item?.category && CATEGORY_IMAGES[item.category]) || FALLBACK;
  const [imgSrc, setImgSrc] = useState(item?.image || defaultImg);

  useEffect(() => {
    if (item?.image) setImgSrc(item.image);
    else if (item?.category && CATEGORY_IMAGES[item.category]) setImgSrc(CATEGORY_IMAGES[item.category]);
  }, [item]);

  const qty = getItemQuantity(item);

  const isFav = isFavorite(itemId);
  const isVeg = item.isVeg ?? (item.category || '').toLowerCase().includes('veg');

  const handleAdd = () => {
    addToCart(item);
    showToast(`${item.name} added to cart!`, 'success');
  };
  const handleIncrease = () => { if (itemId) updateQuantity(itemId, qty + 1); };
  const handleDecrease = () => { if (itemId) updateQuantity(itemId, qty - 1); };
  const handleFav = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to save favourites', 'info');
      openAuthModal('login');
      return;
    }
    const res = await toggleFavorite(item);
    showToast(res.isFavorite ? 'Saved to Favourites ❤️' : 'Removed from Favourites', res.isFavorite ? 'success' : 'info');
  };

  if (loading) {
    return (
      <main className="fdp-page">
        <div className="container fdp-empty">
          <div className="spinner" />
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading dish details...</p>
        </div>
      </main>
    );
  }

  if (!item?.name) {
    return (
      <main className="fdp-page">
        <div className="container fdp-empty">
          <h2>Item not found</h2>
          <button className="btn btn-primary" onClick={() => navigate('/menu')}>Browse Menu</button>
        </div>
      </main>
    );
  }

  return (
    <main id="food-detail-page" className="fdp-page">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="fdp-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/menu">Menu</Link>
          {item.category && (
            <>
              <span className="breadcrumb-sep">/</span>
              <Link to={`/menu?search=${encodeURIComponent(item.category)}`}>{item.category}</Link>
            </>
          )}
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{item.name}</span>
        </nav>

        {/* 2-Column Desktop Showcase Layout */}
        <div className="fdp-card-container">
          {/* Left Column: Media Showcase */}
          <div className="fdp-media-col">
            <div className="fdp-image-wrap">
              <img
                src={imgSrc}
                alt={item.name}
                className="fdp-hero-img"
                onError={() => {
                  if (imgSrc !== defaultImg) setImgSrc(defaultImg);
                }}
              />
              {/* Back Button */}
              <button className="fdp-back" onClick={() => navigate(-1)} aria-label="Go back">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              {/* Favorite Button */}
              <button
                className={`fdp-fav ${isFav ? 'active' : ''}`}
                onClick={handleFav}
                aria-label="Toggle favourite"
                id="food-detail-fav-btn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>

              {/* Overlay Badges */}
              <div className="fdp-hero-badges">
                <div className={`fdp-dietary ${isVeg ? 'veg' : 'non-veg'}`}>
                  <div className="dietary-dot" />
                  <span>{isVeg ? '100% Veg' : 'Non-Veg'}</span>
                </div>
                <div className="fdp-rating">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  {(item.rating || 4.8).toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dish Info & Add-To-Cart */}
          <div className="fdp-info-col">
            <div className="fdp-header-meta">
              <div className="fdp-tag-row">
                {item.category && <span className="fdp-category-badge">{item.category}</span>}
                <span className="fdp-kitchen-badge">🔥 Prepared Fresh</span>
              </div>

              <h1 className="fdp-title">{item.name}</h1>

              <div className="fdp-pricing-box">
                <span className="fdp-main-price">₹{item.price?.toFixed(0)}</span>
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="fdp-strike-price">₹{item.originalPrice.toFixed(0)}</span>
                )}
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="fdp-discount-chip">
                    {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>
            </div>

            <p className="fdp-description">
              {item.description || 'A freshly prepared gourmet specialty cooked with farm-fresh produce and exquisite spices for an authentic taste.'}
            </p>

            {/* Delivery Trust Badges */}
            <div className="fdp-perks-grid">
              <div className="fdp-perk-item">
                <span className="perk-icon">⚡</span>
                <div>
                  <strong>20–30 Mins</strong>
                  <span>Express Delivery</span>
                </div>
              </div>
              <div className="fdp-perk-item">
                <span className="perk-icon">🛡️</span>
                <div>
                  <strong>FSSAI Certified</strong>
                  <span>Safety Sealed Packaging</span>
                </div>
              </div>
              <div className="fdp-perk-item">
                <span className="perk-icon">🛵</span>
                <div>
                  <strong>Free Delivery</strong>
                  <span>On orders above ₹199</span>
                </div>
              </div>
            </div>

            <div className="fdp-divider" />

            {/* Interactive Add to Cart / Quantity Bar */}
            <div className="fdp-action-section">
              {qty === 0 ? (
                <button
                  id="food-detail-add-btn"
                  className="fdp-add-main-btn"
                  onClick={handleAdd}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  Add to Cart — ₹{item.price?.toFixed(0)}
                </button>
              ) : (
                <div className="fdp-qty-action-row">
                  <div className="fdp-qty-picker">
                    <button className="fdp-qty-btn decrease" onClick={handleDecrease} id="food-detail-decrease-btn" aria-label="Decrease quantity">−</button>
                    <span className="fdp-qty-count">{qty}</span>
                    <button className="fdp-qty-btn increase" onClick={handleIncrease} id="food-detail-increase-btn" aria-label="Increase quantity">+</button>
                  </div>
                  <button className="fdp-view-cart-btn" onClick={() => navigate('/cart')} id="food-detail-view-cart-btn">
                    <span>View Cart ({qty})</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>
              )}
            </div>

            <div className="fdp-guarantee-note">
              <span>🔒 100% Satisfaction Guarantee • Live GPS Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
