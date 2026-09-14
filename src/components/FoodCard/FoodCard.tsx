import { useState, useEffect, type MouseEvent } from 'react';
import type { MenuItem } from '../../types';
import { useCart, getItemKey } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useToast } from '../../context/ToastContext';
import './FoodCard.css';

const CATEGORY_IMAGES: Record<string, string> = {
  Meal: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop',
  Snacks: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=400&auto=format&fit=crop',
  Dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=400&auto=format&fit=crop',
  Drinks: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=400&auto=format&fit=crop',
  Vegan: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop',
};
const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop';

interface FoodCardProps {
  item: MenuItem;
  onPress?: (item: MenuItem) => void;
}

export default function FoodCard({ item, onPress }: FoodCardProps) {
  const { addToCart, getItemQuantity, updateQuantity } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();

  const itemId = getItemKey(item);
  const isFav = isFavorite(itemId);

  const defaultImg = (item.category && CATEGORY_IMAGES[item.category]) || FALLBACK;
  const [imgSrc, setImgSrc] = useState(item.image || defaultImg);

  useEffect(() => {
    setImgSrc(item.image || defaultImg);
  }, [item.image, defaultImg]);

  const qty = getItemQuantity(item);

  const handleAdd = (e: MouseEvent) => {
    e.stopPropagation();
    addToCart(item);
    showToast(`${item.name} added to cart!`, 'success');
  };

  const handleIncrease = (e: MouseEvent) => {
    e.stopPropagation();
    if (itemId) updateQuantity(itemId, qty + 1);
  };

  const handleDecrease = (e: MouseEvent) => {
    e.stopPropagation();
    if (itemId) updateQuantity(itemId, qty - 1);
  };

  const handleToggleFav = async (e: MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(item);
    showToast(isFav ? `${item.name} removed from favorites` : `${item.name} added to favorites! ❤️`, 'info');
  };

  const isVeg = item.isVeg ?? (item.category || '').toLowerCase().includes('veg');

  return (
    <div className="food-card card" onClick={() => onPress?.(item)} role="button" tabIndex={0}>
      {/* Image */}
      <div className="food-card-img-wrap">
        <img
          src={imgSrc}
          alt={item.name}
          className="food-card-img"
          onError={() => {
            if (imgSrc !== defaultImg) setImgSrc(defaultImg);
          }}
          loading="lazy"
        />
        {/* Rating badge */}
        <div className="food-card-rating">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          {(item.rating || 5.0).toFixed(1)}
        </div>
        {/* Veg/Non-veg FSSAI indicator */}
        <div className={`food-card-dietary ${isVeg ? 'veg' : 'non-veg'}`}>
          <div className="dietary-dot" />
        </div>
        {/* Heart Favorite Button */}
        <button
          className={`food-card-fav-btn ${isFav ? 'active' : ''}`}
          onClick={handleToggleFav}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isFav ? '#EF4444' : 'none'} stroke={isFav ? '#EF4444' : '#1E293B'} strokeWidth="2.2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        {/* Discount badge */}
        {item.discountBadge && <div className="food-card-deal-badge">{item.discountBadge}</div>}
      </div>

      {/* Content */}
      <div className="food-card-content">
        <h3 className="food-card-name">{item.name}</h3>
        <p className="food-card-desc">{item.description || 'Freshly prepared delicious dish'}</p>

        <div className="food-card-bottom">
          <div className="food-card-pricing">
            <span className="food-card-price">₹{item.price?.toFixed(0)}</span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="food-card-original">₹{item.originalPrice.toFixed(0)}</span>
            )}
          </div>

          {/* Cart Controls */}
          {qty === 0 ? (
            <button
              id={`add-to-cart-${item.id}`}
              className="food-card-add-btn"
              onClick={handleAdd}
              aria-label={`Add ${item.name} to cart`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          ) : (
            <div className="food-card-qty-ctrl">
              <button className="qty-btn minus" onClick={handleDecrease} aria-label="Decrease quantity">-</button>
              <span className="qty-num">{qty}</span>
              <button className="qty-btn plus" onClick={handleIncrease} aria-label="Increase quantity">+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
