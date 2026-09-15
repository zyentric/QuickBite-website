import React from 'react';

export const QualityBadges: React.FC = () => {
  return (
    <div className="fdp-quality-grid">
      <div className="fdp-quality-item">
        <div className="quality-icon-box green">🌿</div>
        <div className="quality-text-col">
          <strong>100% Fresh</strong>
          <span>Farm ingredients</span>
        </div>
      </div>

      <div className="fdp-quality-item">
        <div className="quality-icon-box blue">🛡️</div>
        <div className="quality-text-col">
          <strong>Hygiene 5★</strong>
          <span>Sanitized kitchen</span>
        </div>
      </div>

      <div className="fdp-quality-item">
        <div className="quality-icon-box orange">⚡</div>
        <div className="quality-text-col">
          <strong>Hot & Fresh</strong>
          <span>Cooked on order</span>
        </div>
      </div>

      <div className="fdp-quality-item">
        <div className="quality-icon-box purple">👨‍🍳</div>
        <div className="quality-text-col">
          <strong>Chef's Secret</strong>
          <span>Authentic recipe</span>
        </div>
      </div>
    </div>
  );
};
