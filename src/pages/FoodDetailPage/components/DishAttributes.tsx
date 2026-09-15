import React from 'react';

interface DishAttributesProps {
  isVeg: boolean;
}

export const DishAttributes: React.FC<DishAttributesProps> = ({ isVeg }) => {
  return (
    <div className="fdp-attributes-wrap">
      {/* Primary Metrics Grid */}
      <div className="fdp-attributes-card">
        <div className="attribute-col">
          <span className="attr-icon">🍽️</span>
          <div className="attr-text-wrap">
            <span className="attr-label">Portion Size</span>
            <strong className="attr-val">Serves 1–2 (350g)</strong>
          </div>
        </div>

        <div className="attr-divider" />

        <div className="attribute-col">
          <span className="attr-icon">{isVeg ? '🌶️' : '🔥'}</span>
          <div className="attr-text-wrap">
            <span className="attr-label">Spice Intensity</span>
            <strong className="attr-val">{isVeg ? 'Medium Spice' : 'Hot & Fiery'}</strong>
          </div>
        </div>

        <div className="attr-divider" />

        <div className="attribute-col">
          <span className="attr-icon">⏱️</span>
          <div className="attr-text-wrap">
            <span className="attr-label">Fresh Prep & ETA</span>
            <strong className="attr-val">20–30 Mins</strong>
          </div>
        </div>
      </div>

      {/* Nutritional Macros Bar */}
      <div className="fdp-nutrition-bar">
        <span className="nutrition-title">Nutritional Estimate:</span>
        <div className="nutrition-pills-row">
          <div className="nutrition-pill cal">
            <span className="pill-dot orange" />
            <span>Calories: <strong>~380 kcal</strong></span>
          </div>
          <div className="nutrition-pill protein">
            <span className="pill-dot blue" />
            <span>Protein: <strong>18g</strong></span>
          </div>
          <div className="nutrition-pill carbs">
            <span className="pill-dot green" />
            <span>Carbs: <strong>42g</strong></span>
          </div>
          <div className="nutrition-pill fats">
            <span className="pill-dot yellow" />
            <span>Fats: <strong>12g</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
