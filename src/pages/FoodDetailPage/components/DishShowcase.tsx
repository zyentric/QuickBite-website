import React from 'react';
import type { MenuItem } from '../../../types';

interface DishShowcaseProps {
  item: MenuItem;
  imgSrc: string;
  defaultImg: string;
  onImgError: () => void;
  isFav: boolean;
  isVeg: boolean;
  onFavClick: () => void;
  onBackClick: () => void;
}

export const DishShowcase: React.FC<DishShowcaseProps> = ({
  item,
  imgSrc,
  onImgError,
  isFav,
  isVeg,
  onFavClick,
  onBackClick,
}) => {
  return (
    <div className="fdp-media-col">
      <div className="fdp-image-wrap">
        <img
          src={imgSrc}
          alt={item.name}
          className="fdp-hero-img"
          onError={onImgError}
        />
        {/* Back Button */}
        <button className="fdp-back" onClick={onBackClick} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        {/* Favorite Button */}
        <button
          className={`fdp-fav ${isFav ? 'active' : ''}`}
          onClick={onFavClick}
          aria-label="Toggle favourite"
          id="food-detail-fav-btn"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isFav ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Overlay Badges */}
        <div className="fdp-hero-badges">
          <div className={`fdp-dietary ${isVeg ? 'veg' : 'non-veg'}`}>
            <div className="dietary-dot" />
            <span>{isVeg ? 'PURE VEG' : 'NON-VEG'}</span>
          </div>
          <div className="fdp-rating">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {(item.rating || 4.8).toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
};
