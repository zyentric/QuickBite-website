import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MenuItem } from '../../../types';
import { getItemKey } from '../../../context/CartContext';

const CATEGORY_IMAGES: Record<string, string> = {
  Meal: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop',
  Snacks: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=400&auto=format&fit=crop',
  Dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=400&auto=format&fit=crop',
  Drinks: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=400&auto=format&fit=crop',
  Vegan: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop',
};
const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop';

const NON_VEG_REGEX = /chicken|meat|fish|mutton|prawn|egg|pork|beef|salmon|tuna|bacon|ham|turkey|seafood|wings|shrimp|crab|lobster|steak|ribs|sausage|pepperoni|skewer|kebab/i;

interface RelatedProductsProps {
  relatedItems: MenuItem[];
  onQuickAdd: (item: MenuItem) => void;
}

const RelatedCard: React.FC<{
  rel: MenuItem;
  onQuickAdd: (item: MenuItem) => void;
}> = ({ rel, onQuickAdd }) => {
  const navigate = useNavigate();
  const relKey = getItemKey(rel);
  const defaultImg = (rel.category && CATEGORY_IMAGES[rel.category]) || FALLBACK;
  const [imgSrc, setImgSrc] = useState(rel.image || defaultImg);
  const [addedAnim, setAddedAnim] = useState(false);

  const isNonVeg = rel.isVeg === false || Boolean((rel.name || '').match(NON_VEG_REGEX));
  const isVeg = rel.isVeg === true || !isNonVeg;

  const discountPercent =
    rel.originalPrice && rel.originalPrice > rel.price
      ? Math.round(((rel.originalPrice - rel.price) / rel.originalPrice) * 100)
      : 0;

  const handleClick = () => {
    navigate(`/food/${relKey}`, { state: { item: rel } });
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickAdd(rel);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1400);
  };

  return (
    <div
      className="fdp-related-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className="related-img-box">
        <img
          src={imgSrc}
          alt={rel.name}
          className="related-img"
          onError={() => {
            if (imgSrc !== defaultImg) {
              setImgSrc(defaultImg);
            }
          }}
          loading="lazy"
        />
        <div className="related-img-overlay-scrim" />

        {/* Dietary FSSAI Dot Badge */}
        <div className={`related-dietary-badge ${isVeg ? 'veg' : 'non-veg'}`}>
          <div className="dot" />
        </div>

        {/* Promo / Discount Badge */}
        {discountPercent > 0 ? (
          <div className="related-discount-badge">{discountPercent}% OFF</div>
        ) : rel.discountBadge ? (
          <div className="related-discount-badge">{rel.discountBadge}</div>
        ) : (
          <div className="related-bestseller-badge">★ TOP PICK</div>
        )}
      </div>

      <div className="related-body">
        <div className="related-header-meta">
          <span className="related-category-pill">{rel.category || 'Special'}</span>
          <span className="related-prep-time">⚡ 20m</span>
        </div>

        <h4 className="related-title" title={rel.name}>
          {rel.name}
        </h4>

        <div className="related-rating-row">
          <div className="related-star-pill">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>{(rel.rating || 4.7).toFixed(1)}</span>
          </div>
          <span className="related-review-count">(150+)</span>
        </div>

        <div className="related-footer">
          <div className="related-pricing">
            <span className="related-price">₹{rel.price.toFixed(0)}</span>
            {rel.originalPrice && rel.originalPrice > rel.price && (
              <span className="related-original-price">₹{rel.originalPrice.toFixed(0)}</span>
            )}
          </div>

          <button
            className={`related-add-btn ${addedAnim ? 'added' : ''}`}
            onClick={handleAddClick}
            aria-label={`Add ${rel.name} to cart`}
          >
            {addedAnim ? '✓ ADDED' : '+ ADD'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  relatedItems,
  onQuickAdd,
}) => {
  const navigate = useNavigate();

  if (!relatedItems || relatedItems.length === 0) return null;

  return (
    <div className="fdp-related-section">
      <div className="fdp-related-header">
        <div className="fdp-related-title-wrap">
          <span className="fdp-related-badge">✨ CHEF RECOMMENDATIONS</span>
          <h3 className="fdp-section-heading">Frequently Paired With</h3>
          <p className="fdp-related-sub">Foodies also love adding these delicious combos to their order</p>
        </div>

        <button
          className="fdp-view-all-related-btn"
          onClick={() => navigate('/menu')}
        >
          <span>Explore All</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="fdp-related-grid">
        {relatedItems.map((rel) => {
          const relKey = getItemKey(rel);
          return (
            <RelatedCard
              key={relKey}
              rel={rel}
              onQuickAdd={onQuickAdd}
            />
          );
        })}
      </div>
    </div>
  );
};
