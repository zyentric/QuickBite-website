import React from 'react';
import type { MenuItem } from '../../../types';

interface DishHeaderInfoProps {
  item: MenuItem;
  effectiveUnitPrice: number;
}

export const DishHeaderInfo: React.FC<DishHeaderInfoProps> = ({ item, effectiveUnitPrice }) => {
  const discountPercent =
    item.originalPrice && item.originalPrice > item.price
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : 0;

  const savingsAmount =
    item.originalPrice && item.originalPrice > item.price
      ? item.originalPrice - item.price
      : 0;

  return (
    <div className="fdp-header-meta">
      <div className="fdp-tag-row">
        {item.category && <span className="fdp-category-badge">{item.category}</span>}
        <span className="fdp-kitchen-badge">🔥 Cooked Fresh to Order</span>
        <span className="fdp-recommend-badge">✨ 98% Recommend</span>
        {discountPercent > 0 && (
          <span className="fdp-savings-pill">Save ₹{savingsAmount.toFixed(0)}</span>
        )}
      </div>

      <h1 className="fdp-title">{item.name}</h1>

      <div className="fdp-pricing-box">
        <span className="fdp-main-price">₹{effectiveUnitPrice.toFixed(0)}</span>
        {item.originalPrice && item.originalPrice > item.price && (
          <span className="fdp-strike-price">₹{item.originalPrice.toFixed(0)}</span>
        )}
        {discountPercent > 0 && (
          <span className="fdp-discount-chip">{discountPercent}% OFF</span>
        )}
      </div>
    </div>
  );
};
