import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import type { MenuItem } from '../../types';
import { useCart, getItemKey } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  DishShowcase,
  DishHeaderInfo,
  QualityBadges,
  DishAttributes,
  CustomizationSelector,
  RatingBreakdown,
  RelatedProducts,
} from './components';
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
  const [loading, setLoading] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, boolean>>({});
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [relatedItems, setRelatedItems] = useState<MenuItem[]>([]);

  const { addToCart, getItemQuantity, updateQuantity } = useCart();
  const { showToast } = useToast();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const itemId = getItemKey(item) || id || '';

  // Synchronize item state whenever the URL param :id or location.state changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedAddOns({});
    setShowFullDesc(false);

    const stateItem = location.state?.item;
    if (stateItem && (getItemKey(stateItem) === id || !id)) {
      setItem(stateItem);
      setLoading(false);
    } else if (id) {
      setLoading(true);
      api.menu
        .getAll()
        .then((all) => {
          const found = all.find((m: MenuItem) => getItemKey(m) === id || m.id === id || (m as any)._id === id);
          if (found) {
            setItem(found);
          }
        })
        .catch((err) => {
          console.error('Failed to load item:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [id, location.state]);

  // Fetch Related Suggestions whenever the active item changes
  useEffect(() => {
    if (!item?.name) return;
    const currentKey = getItemKey(item);
    api.menu
      .getAll({ category: item.category })
      .then((catItems) => {
        const filtered = (catItems || []).filter((m: MenuItem) => getItemKey(m) !== currentKey);
        if (filtered.length < 3) {
          api.menu.getAll().then((all) => {
            const more = (all || []).filter((m: MenuItem) => getItemKey(m) !== currentKey).slice(0, 6);
            setRelatedItems(more);
          });
        } else {
          setRelatedItems(filtered.slice(0, 6));
        }
      })
      .catch(() => {});
  }, [item?.name, item?.category, item?.id, (item as any)?._id]);

  const defaultImg = (item?.category && CATEGORY_IMAGES[item.category]) || FALLBACK;
  const [imgSrc, setImgSrc] = useState(item?.image || defaultImg);

  useEffect(() => {
    if (item?.image) {
      setImgSrc(item.image);
    } else if (item?.category && CATEGORY_IMAGES[item.category]) {
      setImgSrc(CATEGORY_IMAGES[item.category]);
    } else {
      setImgSrc(FALLBACK);
    }
  }, [item]);

  const qty = getItemQuantity(item);
  const isFav = isFavorite(itemId);

  const isVeg = useMemo(() => {
    if (item.isVeg !== undefined) return item.isVeg;
    const name = (item.name || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const isNonVeg =
      name.includes('chicken') ||
      name.includes('mutton') ||
      name.includes('fish') ||
      name.includes('prawn') ||
      name.includes('egg') ||
      name.includes('beef') ||
      name.includes('meat') ||
      name.includes('pork') ||
      desc.includes('chicken') ||
      desc.includes('fish') ||
      desc.includes('meat') ||
      desc.includes('pork');
    return !isNonVeg;
  }, [item]);

  const handleToggleAddOn = (addOnId: string) => {
    setSelectedAddOns((prev) => ({
      ...prev,
      [addOnId]: !prev[addOnId],
    }));
  };

  // Addon price calculation
  const addOnsTotal = useMemo(() => {
    return (
      item?.customizations?.reduce((total, section) => {
        return (
          total +
          section.options.reduce((secTotal, opt) => {
            return secTotal + (selectedAddOns[opt.id] ? opt.price : 0);
          }, 0)
        );
      }, 0) || 0
    );
  }, [item?.customizations, selectedAddOns]);

  const basePrice = item.price || 0;
  const effectiveUnitPrice = basePrice + addOnsTotal;

  const handleAdd = () => {
    addToCart({
      ...item,
      price: effectiveUnitPrice,
    });
    showToast(`${item.name} added to cart!`, 'success');
  };

  const handleIncrease = () => {
    if (itemId) updateQuantity(itemId, qty + 1);
  };

  const handleDecrease = () => {
    if (itemId) updateQuantity(itemId, qty - 1);
  };

  const handleQuickAddRelated = (relItem: MenuItem) => {
    addToCart(relItem);
    showToast(`${relItem.name} added to cart!`, 'success');
  };

  const handleFav = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to save favourites', 'info');
      openAuthModal('login');
      return;
    }
    const res = await toggleFavorite(item);
    showToast(
      res.isFavorite ? 'Saved to Favourites ❤️' : 'Removed from Favourites',
      res.isFavorite ? 'success' : 'info'
    );
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
          <button className="btn btn-primary" onClick={() => navigate('/menu')}>
            Browse Menu
          </button>
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
              <Link to={`/menu?category=${encodeURIComponent(item.category)}`}>{item.category}</Link>
            </>
          )}
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{item.name}</span>
        </nav>

        {/* 2-Column Desktop Showcase Card */}
        <div className="fdp-card-container">
          {/* Left Column: Media Showcase */}
          <DishShowcase
            item={item}
            imgSrc={imgSrc}
            defaultImg={defaultImg}
            onImgError={() => {
              if (imgSrc !== defaultImg) setImgSrc(defaultImg);
            }}
            isFav={isFav}
            isVeg={isVeg}
            onFavClick={handleFav}
            onBackClick={() => navigate(-1)}
          />

          {/* Right Column: Dish Info & Add-To-Cart */}
          <div className="fdp-info-col">
            <DishHeaderInfo item={item} effectiveUnitPrice={effectiveUnitPrice} />

            {/* Quality Badges */}
            <QualityBadges />

            {/* Attributes (Portion • Spice • Calories • ETA) */}
            <DishAttributes isVeg={isVeg} />

            {/* Description */}
            <div className="fdp-description-wrap">
              <h3 className="fdp-section-heading">Description</h3>
              <p className={`fdp-description ${showFullDesc ? 'expanded' : ''}`}>
                {item.description ||
                  'A freshly prepared gourmet specialty cooked with farm-fresh produce and exquisite spices for an authentic taste.'}
              </p>
              {(item.description?.length || 0) > 120 && (
                <button
                  className="fdp-readmore-btn"
                  onClick={() => setShowFullDesc(!showFullDesc)}
                >
                  {showFullDesc ? 'Read Less ▲' : 'Read More ▼'}
                </button>
              )}
            </div>

            {/* Customizations / Add-Ons */}
            <CustomizationSelector
              customizations={item.customizations}
              selectedAddOns={selectedAddOns}
              onToggleAddOn={handleToggleAddOn}
            />

            <div className="fdp-divider" />

            {/* Interactive Add to Cart / Quantity Action */}
            <div className="fdp-action-section">
              {qty === 0 ? (
                <button
                  id="food-detail-add-btn"
                  className="fdp-add-main-btn"
                  onClick={handleAdd}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  Add to Cart — ₹{effectiveUnitPrice.toFixed(0)}
                </button>
              ) : (
                <div className="fdp-qty-action-row">
                  <div className="fdp-qty-picker">
                    <button
                      className="fdp-qty-btn decrease"
                      onClick={handleDecrease}
                      id="food-detail-decrease-btn"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="fdp-qty-count">{qty}</span>
                    <button
                      className="fdp-qty-btn increase"
                      onClick={handleIncrease}
                      id="food-detail-increase-btn"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="fdp-view-cart-btn"
                    onClick={() => navigate('/cart')}
                    id="food-detail-view-cart-btn"
                  >
                    <span>View Cart ({qty})</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="fdp-guarantee-note">
              <span>🔒 100% Satisfaction Guarantee • Contactless Live Delivery</span>
            </div>
          </div>
        </div>

        {/* Ratings & Customer Reviews Breakdown */}
        <RatingBreakdown rating={item.rating || 4.8} />

        {/* Frequently Paired With / Related Suggestions */}
        <RelatedProducts relatedItems={relatedItems} onQuickAdd={handleQuickAddRelated} />
      </div>
    </main>
  );
}
