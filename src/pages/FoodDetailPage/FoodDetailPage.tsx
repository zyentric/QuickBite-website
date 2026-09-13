import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import './FoodDetailPage.css';

const CATEGORY_IMAGES: Record<string, string> = {
  Meal: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
  Snacks: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=600&auto=format&fit=crop',
  Dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=600&auto=format&fit=crop',
  Drinks: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop',
  Vegan: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop',
};
const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop';

export default function FoodDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const item = (location.state?.item || {}) as MenuItem;
  const { addToCart, cartItems, updateQuantity } = useCart();
  const { showToast } = useToast();

  const defaultImg = (item.category && CATEGORY_IMAGES[item.category]) || FALLBACK;
  const [imgSrc, setImgSrc] = useState(item.image || defaultImg);

  const cartItem = cartItems.find(i => i.id === item.id || i._id === item._id);
  const qty = cartItem?.quantity || 0;
  const [isFav, setIsFav] = useState(false);

  const isVeg = item.isVeg ?? (item.category || '').toLowerCase().includes('veg');

  const handleAdd = () => {
    addToCart(item);
    showToast(`${item.name} added to cart!`, 'success');
  };
  const handleIncrease = () => updateQuantity(item.id || item._id!, qty + 1);
  const handleDecrease = () => updateQuantity(item.id || item._id!, qty - 1);
  const handleFav = () => {
    setIsFav(f => !f);
    showToast(isFav ? 'Removed from Favourites' : 'Saved to Favourites ❤️', isFav ? 'info' : 'success');
  };

  if (!item.name) {
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
      {/* Hero Image */}
      <div className="fdp-hero">
        <img
          src={imgSrc}
          alt={item.name}
          className="fdp-hero-img"
          onError={() => {
            if (imgSrc !== defaultImg) setImgSrc(defaultImg);
          }}
        />
        <button className="fdp-back" onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button className={`fdp-fav ${isFav ? 'active' : ''}`} onClick={handleFav} aria-label="Toggle favourite" id="food-detail-fav-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Overlay badges */}
        <div className="fdp-hero-badges">
          <div className={`fdp-dietary ${isVeg ? 'veg' : 'non-veg'}`}>
            <div className="dietary-dot" />
            <span>{isVeg ? 'Veg' : 'Non-Veg'}</span>
          </div>
          <div className="fdp-rating">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            {(item.rating || 5.0).toFixed(1)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container fdp-body">
        <div className="fdp-top">
          <div>
            <h1 className="fdp-name">{item.name}</h1>
            {item.category && <span className="fdp-category">{item.category}</span>}
          </div>
          <div className="fdp-pricing">
            <span className="fdp-price">₹{item.price?.toFixed(0)}</span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="fdp-original">₹{item.originalPrice.toFixed(0)}</span>
            )}
          </div>
        </div>

        <p className="fdp-description">{item.description || 'A freshly prepared, delicious dish made with premium ingredients for an unforgettable taste experience.'}</p>

        {/* Info Pills */}
        <div className="fdp-info-row">
          <div className="fdp-info-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            20–30 min
          </div>
          <div className="fdp-info-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            FSSAI Certified
          </div>
          <div className="fdp-info-pill" style={{ color: '#059669' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Free Delivery
          </div>
        </div>

        <div className="fdp-divider" />

        {/* Add to Cart */}
        <div className="fdp-cart-section">
          {qty === 0 ? (
            <button
              id="food-detail-add-btn"
              className="btn btn-primary fdp-add-btn"
              onClick={handleAdd}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Add to Cart — ₹{item.price?.toFixed(0)}
            </button>
          ) : (
            <div className="fdp-qty-row">
              <div className="fdp-qty-ctrl">
                <button className="fdp-qty-btn" onClick={handleDecrease} id="food-detail-decrease-btn" aria-label="Decrease">−</button>
                <span className="fdp-qty-num">{qty}</span>
                <button className="fdp-qty-btn" onClick={handleIncrease} id="food-detail-increase-btn" aria-label="Increase">+</button>
              </div>
              <button className="btn btn-outline" onClick={() => navigate('/cart')} id="food-detail-view-cart-btn">
                View Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
