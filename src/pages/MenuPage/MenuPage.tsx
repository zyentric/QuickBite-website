import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import type { MenuItem, Restaurant } from '../../types';
import FoodCard from '../../components/FoodCard/FoodCard';
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard';
import './MenuPage.css';

const CATEGORIES = ['All', 'Meal', 'Snacks', 'Dessert', 'Drinks', 'Vegan'];
const SORTS = [
  { id: 'default', label: 'Default' },
  { id: 'top', label: 'Top Rated' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
];

export default function MenuPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initSearch = searchParams.get('search') || '';
  const initCat = searchParams.get('category') || 'All';

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initSearch);
  const [category, setCategory] = useState(initCat);
  const [sort, setSort] = useState('default');
  const [view, setView] = useState<'food' | 'restaurant'>('food');

  useEffect(() => {
    (async () => {
      try {
        const [menu, rests] = await Promise.all([api.menu.getAll(), api.restaurants.getAll()]);
        setMenuItems(Array.isArray(menu) ? menu : []);
        setRestaurants(Array.isArray(rests) ? rests : []);
      } catch { /* noop */ }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    let items = [...menuItems];
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
    }
    if (category && category !== 'All') {
      items = items.filter(i => (i.category || '').toLowerCase().includes(category.toLowerCase()));
    }
    if (sort === 'top') items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === 'price_asc') items.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') items.sort((a, b) => b.price - a.price);
    return items;
  }, [menuItems, search, category, sort]);

  const filteredRestaurants = useMemo(() => {
    if (!search.trim()) return restaurants;
    const q = search.toLowerCase();
    return restaurants.filter(r => r.name.toLowerCase().includes(q) || (r.cuisine || '').toLowerCase().includes(q));
  }, [restaurants, search]);

  return (
    <main id="menu-page" className="menu-page">
      {/* Header Bar */}
      <div className="menu-header-bar">
        <div className="container">
          <h1 className="menu-header-title">Explore Our Menu</h1>
          <p className="menu-header-sub">Browse {menuItems.length}+ dishes from {restaurants.length}+ local restaurants</p>
        </div>
      </div>

      <div className="container menu-body">
        {/* Search & Controls */}
        <div className="menu-controls">
          <div className="menu-search-wrap">
            <svg className="menu-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              id="menu-search-input"
              className="menu-search input"
              type="search"
              placeholder="Search dishes or restaurants..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="menu-sort-wrap">
            <label htmlFor="menu-sort-select" className="visually-hidden">Sort by</label>
            <select id="menu-sort-select" className="menu-sort input" value={sort} onChange={e => setSort(e.target.value)}>
              {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {/* View Toggle */}
          <div className="menu-view-toggle">
            <button id="menu-view-food" className={`menu-view-btn ${view === 'food' ? 'active' : ''}`} onClick={() => setView('food')} aria-pressed={view === 'food'}>
              Dishes
            </button>
            <button id="menu-view-restaurant" className={`menu-view-btn ${view === 'restaurant' ? 'active' : ''}`} onClick={() => setView('restaurant')} aria-pressed={view === 'restaurant'}>
              Restaurants
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        {view === 'food' && (
          <div className="menu-cats">
            {CATEGORIES.map(c => (
              <button
                key={c}
                id={`menu-cat-${c.toLowerCase()}`}
                className={`chip ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        <p className="menu-count">
          {loading ? 'Loading...' : view === 'food'
            ? `${filtered.length} dish${filtered.length !== 1 ? 'es' : ''} found`
            : `${filteredRestaurants.length} restaurant${filteredRestaurants.length !== 1 ? 's' : ''} found`}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="menu-grid">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="skeleton" style={{ height: 260 }} />)}
          </div>
        ) : view === 'food' ? (
          filtered.length > 0 ? (
            <div className="menu-grid">
              {filtered.map(item => (
                <FoodCard
                  key={item.id || item._id}
                  item={item}
                  onPress={item => navigate(`/food/${item.id || item._id}`, { state: { item } })}
                />
              ))}
            </div>
          ) : (
            <div className="menu-empty">
              <div className="menu-empty-icon">🔍</div>
              <h3>No dishes found</h3>
              <p>Try a different search term or category</p>
              <button className="btn btn-primary" onClick={() => { setSearch(''); setCategory('All'); }}>Clear Filters</button>
            </div>
          )
        ) : (
          filteredRestaurants.length > 0 ? (
            <div className="menu-rest-grid">
              {filteredRestaurants.map(r => <RestaurantCard key={r.id || r._id} restaurant={r} />)}
            </div>
          ) : (
            <div className="menu-empty">
              <div className="menu-empty-icon">🏪</div>
              <h3>No restaurants found</h3>
              <p>Try searching something else</p>
            </div>
          )
        )}
      </div>
    </main>
  );
}
