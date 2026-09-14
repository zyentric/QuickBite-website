import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import './ReviewPage.css';

export default function ReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isAuthenticated) { navigate('/login'); return null; }

  const handleSubmit = async () => {
    if (rating === 0) { showToast('Please select a rating', 'error'); return; }
    setSubmitting(true);
    try {
      await api.reviews.submit({ orderId: id!, rating, review });
      setSubmitted(true);
      showToast('Thank you for your review! ⭐', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <main className="review-page">
        <div className="container review-body">
          <div className="review-card review-success">
            <div className="review-success-icon">⭐</div>
            <h2>Thank You!</h2>
            <p>Your review has been submitted successfully.</p>
            <button className="btn btn-primary" onClick={() => navigate('/orders')} id="review-back-btn">Back to Orders</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="review-page" className="review-page">
      <div className="container review-body">
        <div className="review-card">
          <button className="review-back-btn" onClick={() => navigate(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
            Back
          </button>

          <h1 className="review-title">Leave a Review</h1>
          <p className="review-sub">How was your order? Share your experience!</p>

          {/* Star Rating */}
          <div className="review-stars-section">
            <div className="review-stars" role="group" aria-label="Rate your experience">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className={`review-star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${star} stars`}
                  id={`review-star-${star}`}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="review-rating-label">
              {rating === 0 ? 'Tap to rate' : rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent! 🎉'}
            </div>
          </div>

          {/* Text Review */}
          <div className="review-field">
            <label htmlFor="review-text" className="review-label">Your Review (optional)</label>
            <textarea
              id="review-text"
              className="review-textarea input"
              placeholder="Tell us what you loved (or what we can improve)..."
              value={review}
              onChange={e => setReview(e.target.value)}
              rows={4}
            />
          </div>

          <button
            id="review-submit-btn"
            className="btn btn-primary review-submit-btn"
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
          >
            {submitting ? 'Submitting...' : 'Submit Review ⭐'}
          </button>
        </div>
      </div>
    </main>
  );
}
