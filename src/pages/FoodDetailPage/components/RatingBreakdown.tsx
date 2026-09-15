import React from 'react';

interface ReviewItem {
  id: string;
  userName: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    userName: 'Aarav Sharma',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    date: 'Yesterday',
    comment: 'Super fresh, hot, and packed with incredible authentic flavor! Best quality in the area.',
    verified: true,
  },
  {
    id: 'rev-2',
    userName: 'Priya Patel',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    rating: 4.8,
    date: '3 days ago',
    comment: 'Perfect portion size and delivered right on time. Highly recommended!',
    verified: true,
  },
  {
    id: 'rev-3',
    userName: 'Rohan Gupta',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    date: 'Last week',
    comment: 'Tastes like high-end restaurant food at a very pocket-friendly price.',
    verified: true,
  },
];

interface RatingBreakdownProps {
  rating: number;
  reviewsCount?: number;
}

export const RatingBreakdown: React.FC<RatingBreakdownProps> = ({
  rating,
  reviewsCount = 240,
}) => {
  return (
    <div className="fdp-reviews-section">
      <div className="fdp-reviews-header">
        <div>
          <h3 className="fdp-section-heading">Customer Ratings & Reviews</h3>
          <span className="fdp-reviews-sub">Verified reviews from food lovers</span>
        </div>
        <div className="fdp-overall-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="fdp-rating-summary-card">
        <div className="summary-score-col">
          <span className="big-score">{rating.toFixed(1)}</span>
          <div className="stars-row">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className="star-icon">★</span>
            ))}
          </div>
          <span className="total-ratings-label">{reviewsCount}+ verified ratings</span>
        </div>

        <div className="summary-bars-col">
          {[
            { label: '5★', pct: '78%' },
            { label: '4★', pct: '16%' },
            { label: '3★', pct: '4%' },
            { label: '2★', pct: '1%' },
            { label: '1★', pct: '1%' },
          ].map((bar, idx) => (
            <div key={idx} className="bar-row">
              <span className="bar-label">{bar.label}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: bar.pct }} />
              </div>
              <span className="bar-pct">{bar.pct}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Cards */}
      <div className="fdp-reviews-list">
        {DEFAULT_REVIEWS.map((rev) => (
          <div key={rev.id} className="fdp-review-card">
            <div className="review-card-header">
              <img src={rev.avatar} alt={rev.userName} className="reviewer-avatar" />
              <div className="reviewer-details">
                <div className="reviewer-name-row">
                  <span className="reviewer-name">{rev.userName}</span>
                  {rev.verified && <span className="verified-chip">✓ Verified</span>}
                </div>
                <span className="review-date">{rev.date}</span>
              </div>
              <div className="review-score-pill">
                <span>★ {rev.rating}</span>
              </div>
            </div>
            <p className="review-comment">{rev.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
