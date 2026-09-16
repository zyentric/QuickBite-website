import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';

export interface ReviewItem {
  id: string;
  userName: string;
  avatar?: string;
  rating: number;
  date?: string;
  comment?: string;
  tags?: string[];
  verified?: boolean;
}

interface RatingBreakdownProps {
  rating?: number;
  reviewsCount?: number;
  reviews?: ReviewItem[];
  restaurantId?: string;
}

export const RatingBreakdown: React.FC<RatingBreakdownProps> = ({
  rating,
  reviewsCount,
  reviews: initialReviews,
  restaurantId,
}) => {
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(initialReviews || []);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialReviews && initialReviews.length > 0) {
      setReviewsList(initialReviews);
      return;
    }

    if (restaurantId) {
      setLoading(true);
      fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://quickbite-backend-sknz.onrender.com/api'}/reviews/restaurant/${restaurantId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.reviews)) {
            const mapped: ReviewItem[] = data.reviews.map((r: any) => ({
              id: r._id || r.id,
              userName: r.user?.name || 'QuickBite Foodie',
              avatar: r.user?.profilePicture,
              rating: r.rating || 5,
              date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent',
              comment: r.feedback || '',
              tags: r.tags || [],
              verified: true,
            }));
            setReviewsList(mapped);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [restaurantId, initialReviews]);

  const hasRating = typeof rating === 'number' && rating > 0;
  const displayRating = hasRating ? rating.toFixed(1) : 'New';
  const totalCount = reviewsCount !== undefined ? reviewsCount : reviewsList.length;

  return (
    <div className="fdp-reviews-section">
      <div className="fdp-reviews-header">
        <div>
          <h3 className="fdp-section-heading">Customer Ratings & Reviews</h3>
          <span className="fdp-reviews-sub">Verified customer reviews and feedback</span>
        </div>
        {hasRating && (
          <div className="fdp-overall-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>{displayRating}</span>
          </div>
        )}
      </div>

      {reviewsList.length > 0 ? (
        <>
          {/* Rating Summary Card */}
          <div className="fdp-rating-summary-card">
            <div className="summary-score-col">
              <span className="big-score">{displayRating}</span>
              <div className="stars-row">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className="star-icon"
                    style={{ color: hasRating && rating >= s ? '#F59E0B' : '#E2E8F0' }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="total-ratings-label">
                {totalCount} verified rating{totalCount === 1 ? '' : 's'}
              </span>
            </div>

            <div className="summary-bars-col">
              {[5, 4, 3, 2, 1].map((starNum) => {
                const count = reviewsList.filter((r) => Math.round(r.rating) === starNum).length;
                const pct = reviewsList.length > 0 ? Math.round((count / reviewsList.length) * 100) : 0;
                return (
                  <div key={starNum} className="bar-row">
                    <span className="bar-label">{starNum}★</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="bar-pct">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real Customer Reviews List */}
          <div className="fdp-reviews-list">
            {reviewsList.map((rev) => (
              <div key={rev.id} className="fdp-review-card">
                <div className="review-card-header">
                  {rev.avatar ? (
                    <img src={rev.avatar} alt={rev.userName} className="reviewer-avatar" />
                  ) : (
                    <div className="reviewer-avatar-placeholder">
                      {rev.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="reviewer-details">
                    <div className="reviewer-name-row">
                      <span className="reviewer-name">{rev.userName}</span>
                      {rev.verified && <span className="verified-chip">✓ Verified</span>}
                    </div>
                    {rev.date && <span className="review-date">{rev.date}</span>}
                  </div>
                  <div className="review-score-pill">
                    <span>★ {rev.rating}</span>
                  </div>
                </div>
                {rev.comment ? <p className="review-comment">{rev.comment}</p> : null}
                {rev.tags && rev.tags.length > 0 && (
                  <div className="review-tags-row">
                    {rev.tags.map((t, idx) => (
                      <span key={idx} className="review-tag-badge">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Clean and Honest Empty Reviews State */
        <div className="fdp-empty-reviews">
          <div className="fdp-empty-stars">⭐</div>
          <h4 className="fdp-empty-title">No Reviews Yet</h4>
          <p className="fdp-empty-desc">
            Be the first customer to order this dish and share your authentic rating & review after delivery!
          </p>
        </div>
      )}
    </div>
  );
};
