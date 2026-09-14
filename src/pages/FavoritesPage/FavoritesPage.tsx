import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import type { MenuItem } from '../../types';
import './FavoritesPage.css';

const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const { favorites, loading, removeFavorite, refreshFavorites } = useFavorites();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login');
    else refreshFavorites();
  }, [isAuthenticated, isLoading]);

  const handleRemove = async (item: MenuItem) => {
    const id = item.id || item._id!;
    await removeFavorite(id);
    showToast(`${item.name} removed from favorites`, 'info');
  };

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item);
    showToast(`${item.name} added to cart!`, 'success');
  };

  return (
    <main id="favorites-page" className="fav-page">
      <div className="container fav-body">
        <div className="fav-header">
          <h1 className="fav-title">❤️ My Favourites</h1>
          <p className="fav-sub">{favorites.length} saved item{favorites.length !== 1 ? 's' : ''}</p>
        </div>

        {loading ? (
          <div className="fav-grid">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 18 }} />)}
          </div>
        ) : favorites.length === 0 ? (
          <div className="fav-empty">
            <div className="fav-empty-icon">🤍</div>
            <h2>No favourites yet</h2>
            <p>Save your favourite dishes and they'll appear here</p>
            <button className="btn btn-primary" onClick={() => navigate('/menu')} id="fav-browse-btn">
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="fav-grid">
            {favorites.map(item => {
              const isVeg = item.isVeg ?? (item.category || '').toLowerCase().includes('veg');
              return (
                <div key={item.id || item._id} className="fav-card card">
                  <div className="fav-card-img-wrap" onClick={() => navigate(`/food/${item.id || item._id}`, { state: { item } })}>
                    <img
                      src={item.image || FALLBACK}
                      alt={item.name}
                      className="fav-card-img"
                      onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }}
                      loading="lazy"
                    />
                    <div className={`fav-dietary ${isVeg ? 'veg' : 'non-veg'}`}><div className="dietary-dot" /></div>
                    {item.rating && (
                      <div className="fav-rating">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        {item.rating.toFixed(1)}
                      </div>
                    )}
                    <button
                      className="fav-heart-btn active"
                      onClick={e => { e.stopPropagation(); handleRemove(item); }}
                      aria-label="Remove from favorites"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                  </div>
                  <div className="fav-card-body" onClick={() => navigate(`/food/${item.id || item._id}`, { state: { item } })}>
                    <div className="fav-card-name">{item.name}</div>
                    <div className="fav-card-cat">{item.category}</div>
                    <div className="fav-card-bottom">
                      <div className="fav-card-pricing">
                        <span className="fav-price">₹{item.price.toFixed(0)}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="fav-original">₹{item.originalPrice.toFixed(0)}</span>
                        )}
                      </div>
                      <button
                        className="fav-add-btn"
                        onClick={e => { e.stopPropagation(); handleAddToCart(item); }}
                        aria-label={`Add ${item.name} to cart`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
