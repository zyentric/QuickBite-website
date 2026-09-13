import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import type { MenuItem, Restaurant } from '../../types';
import { api } from '../../services/api';
import FoodCard from '../../components/FoodCard/FoodCard';
import './RestaurantPage.css';

const FALLBACK = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop';

export default function RestaurantPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant>((location.state?.restaurant || {}) as Restaurant);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(restaurant.menu || []);
  const [loading, setLoading] = useState(!restaurant.name);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const all = await api.restaurants.getAll();
        const matched = Array.isArray(all) ? all.find((r: any) => (r.id || r._id) === id || r.name === restaurant.name) : null;
        if (matched) {
          setRestaurant(matched);
          if (matched.menu && matched.menu.length > 0) {
            setMenuItems(matched.menu);
            return;
          }
        }
        // If restaurant menu is empty, fallback to menu items
        const allMenu = await api.menu.getAll();
        if (Array.isArray(allMenu) && allMenu.length > 0) {
          setMenuItems(allMenu);
        }
      } catch {
        // keep existing state
      } finally {
        setLoading(false);
      }
    };
    if (!restaurant.name || !restaurant.menu || restaurant.menu.length === 0) {
      loadRestaurant();
    }
  }, [id, restaurant.name, restaurant.menu]);

  const categories = ['All', ...Array.from(new Set(menuItems.map(i => i.category).filter(Boolean))) as string[]];

  const filtered = menuItems.filter(item => {
    const matchSearch = !search.trim() || item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'All' || item.category === selectedCat;
    return matchSearch && matchCat;
  });

  return (
    <main id="restaurant-page" className="restaurant-page">
      {/* Hero */}
      <div className="rp-hero">
        <img
          src={restaurant.image || FALLBACK}
          alt={restaurant.name}
          className="rp-hero-img"
          onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }}
        />
        <div className="rp-hero-overlay" />
        <button className="rp-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="rp-hero-info">
          <h1 className="rp-hero-name">{restaurant.name || 'Restaurant'}</h1>
          <p className="rp-hero-cuisine">{restaurant.cuisine || 'Multi-cuisine'}</p>
          <div className="rp-hero-meta">
            <span className="rp-hero-rating">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              {(restaurant.rating || 4.8).toFixed(1)}
            </span>
            <span className="rp-hero-chip">20–30 min</span>
            <span className="rp-hero-chip" style={{ color: '#059669' }}>Free Delivery</span>
          </div>
        </div>
      </div>

      <div className="container rp-body">
        {loading ? (
          <div className="rp-menu-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton" style={{ height: 260, borderRadius: 18 }} />
            ))}
          </div>
        ) : menuItems.length > 0 ? (
          <>
            {/* Controls */}
            <div className="rp-controls">
              <input
                id="restaurant-search-input"
                type="search"
                className="input rp-search"
                placeholder="Search in menu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="rp-cats">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`chip ${selectedCat === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCat(cat)}
                    aria-pressed={selectedCat === cat}
                  >{cat}</button>
                ))}
              </div>
            </div>

            {/* Menu Grid */}
            <div className="rp-menu-grid">
              {filtered.map(item => (
                <FoodCard
                  key={item.id || item._id}
                  item={item}
                  onPress={item => navigate(`/food/${item.id || item._id}`, { state: { item } })}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="menu-empty">
                <div className="menu-empty-icon">🔍</div>
                <h3>No items found</h3>
                <p>Try a different search</p>
              </div>
            )}
          </>
        ) : (
          <div className="rp-empty">
            <h3>Menu not available</h3>
            <p>This restaurant's menu will be loaded from the app.</p>
            <button className="btn btn-primary" onClick={() => navigate('/menu')}>Browse Full Menu</button>
          </div>
        )}
      </div>
    </main>
  );
}
