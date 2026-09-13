import { useNavigate } from 'react-router-dom';
import type { Restaurant } from '../../types';
import './RestaurantCard.css';

const FALLBACK = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="restaurant-card card"
      onClick={() => navigate(`/restaurant/${restaurant._id || restaurant.id}`, { state: { restaurant } })}
      role="button"
      tabIndex={0}
    >
      <div className="restaurant-card-img-wrap">
        <img
          src={restaurant.image || FALLBACK}
          alt={restaurant.name}
          className="restaurant-card-img"
          onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }}
          loading="lazy"
        />
      </div>
      <div className="restaurant-card-info">
        <div className="restaurant-card-top">
          <h3 className="restaurant-card-name">{restaurant.name}</h3>
          <div className="restaurant-card-rating">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#D97706"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>{(restaurant.rating || 4.8).toFixed(1)}</span>
          </div>
        </div>
        <p className="restaurant-card-cuisine">{restaurant.cuisine}</p>
        <div className="restaurant-card-meta">
          <div className="restaurant-card-time">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            20–30 min
          </div>
          <span className="restaurant-card-free">Free Delivery</span>
        </div>
      </div>
    </div>
  );
}
