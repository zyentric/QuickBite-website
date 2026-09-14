import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import './OrderConfirmedPage.css';

const CANCEL_REASONS = [
  'Changed my mind / No longer hungry',
  'Delivery time is taking too long',
  'Ordered wrong items or duplicate order',
  'Need to change delivery address',
  'Other reason',
];

export default function OrderConfirmedPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [order, setOrder] = useState<any>(location.state?.order || null);
  const [countdown, setCountdown] = useState<number>(5);
  const [isCancelled, setIsCancelled] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const timerRef = useRef<any>(null);

  const targetId = order?._id || order?.id || id || '';

  // 1. Fetch order if not in location.state
  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!order && id) {
      api.orders.getById(id).then(data => {
        setOrder(data);
        if (data?.status === 'Cancelled') setIsCancelled(true);
      }).catch(() => {});
    }
  }, [id, isAuthenticated]);

  // 2. Countdown 5 seconds auto-redirect to Order Details
  useEffect(() => {
    if (isCancelled || showCancelModal || !targetId) return;

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          navigate(`/orders/${targetId}`, { state: { order } });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [targetId, isCancelled, showCancelModal, order]);

  // Handle Cancel Order
  const handleCancelClick = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!targetId) return;
    setCancelling(true);
    const reason = selectedReason === 'Other reason' ? (customReason || 'Other') : selectedReason;
    try {
      await api.orders.cancel(targetId, reason);
      setIsCancelled(true);
      setShowCancelModal(false);
      showToast('Order cancelled successfully', 'info');
      if (order) setOrder({ ...order, status: 'Cancelled' });
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const orderNumber = order?.orderNumber || targetId.slice(-6).toUpperCase() || 'XXXXXX';
  const deliveryPin = order?.deliveryPin;
  const items = order?.items || order?.rawItems || [];
  const address = order?.deliveryAddress?.formattedAddress || order?.deliveryAddress?.addressLine1 || order?.deliveryAddress?.address;

  // ── Render Cancelled View ──────────────────────────────────────────────────
  if (isCancelled) {
    return (
      <main id="order-confirmed-page" className="ocp-page">
        <div className="container ocp-body">
          <div className="ocp-card ocp-cancelled-card">
            <div className="ocp-cancel-badge">❌</div>
            <h1 className="ocp-title text-danger">Order Cancelled</h1>
            <p className="ocp-sub">Your order #{orderNumber} has been successfully cancelled. Any online payment will be refunded to your original payment method.</p>

            <div className="ocp-actions">
              <button
                className="btn btn-primary ocp-track-btn"
                onClick={() => navigate('/menu')}
                id="ocp-reorder-btn"
              >
                🍽️ Order Something Else
              </button>
              <button
                className="btn btn-outline ocp-continue-btn"
                onClick={() => navigate('/orders')}
                id="ocp-my-orders-btn"
              >
                View My Orders
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Render Success & Confirmation View ──────────────────────────────────────
  return (
    <main id="order-confirmed-page" className="ocp-page">
      <div className="container ocp-body">
        <div className="ocp-card">
          {/* Celebration Animation */}
          <div className="ocp-lottie">
            <div className="ocp-checkmark">
              <svg viewBox="0 0 52 52" className="ocp-check-svg">
                <circle className="ocp-check-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="ocp-check-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <div className="ocp-confetti">🎉</div>
          </div>

          <h1 className="ocp-title">Order Confirmed!</h1>
          <p className="ocp-sub">Your order is accepted and the kitchen has started preparing your delicious meal.</p>

          {/* 5-Second Auto-redirect Progress Banner */}
          <div className="ocp-timer-banner">
            <div className="ocp-timer-text">
              <span>⚡ Redirecting to Live Order Tracking in <strong>{countdown}s</strong></span>
              <button
                className="ocp-timer-instant-btn"
                onClick={() => navigate(`/orders/${targetId}`, { state: { order } })}
              >
                Go Now &rarr;
              </button>
            </div>
            <div className="ocp-timer-bar-wrap">
              <div
                className="ocp-timer-bar"
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Info Cards Row */}
          <div className="ocp-order-info">
            <div className="ocp-info-item">
              <span className="ocp-info-label">Order ID</span>
              <span className="ocp-info-val">#{orderNumber}</span>
            </div>
            {deliveryPin && (
              <div className="ocp-info-item">
                <span className="ocp-info-label">Delivery PIN</span>
                <span className="ocp-info-val ocp-pin">{deliveryPin}</span>
              </div>
            )}
            <div className="ocp-info-item">
              <span className="ocp-info-label">Estimated Delivery</span>
              <span className="ocp-info-val">25–35 mins ⚡</span>
            </div>
          </div>

          {/* Items Preview */}
          {items.length > 0 && (
            <div className="ocp-items-summary">
              <div className="ocp-items-header">
                <span>Items Ordered ({items.length})</span>
                <span>Total: ₹{(Number(order?.totalAmount || order?.price || 0)).toFixed(0)}</span>
              </div>
              <div className="ocp-items-list">
                {items.map((item: any, i: number) => {
                  const name = item.name || item.menuItem?.name || 'Dish';
                  return (
                    <div key={i} className="ocp-item-pill">
                      <span>{item.quantity || 1}× {name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Address Preview */}
          {address && (
            <div className="ocp-address-preview">
              <span className="ocp-address-icon">📍</span>
              <div className="ocp-address-text">
                <span className="ocp-address-title">Delivering to</span>
                <span className="ocp-address-val">{address}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="ocp-actions">
            <button
              className="btn btn-primary ocp-track-btn"
              onClick={() => navigate(`/orders/${targetId}`, { state: { order } })}
              id="ocp-track-order-btn"
            >
              📍 Track Order Details
            </button>
            <button
              className="btn btn-outline ocp-cancel-action-btn"
              onClick={handleCancelClick}
              id="ocp-cancel-btn"
            >
              ❌ Cancel Order
            </button>
          </div>

          <div className="ocp-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            You will receive real-time notifications and live status updates for this order.
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="ocp-modal-backdrop" onClick={() => setShowCancelModal(false)}>
          <div className="ocp-modal" onClick={e => e.stopPropagation()}>
            <div className="ocp-modal-header">
              <h3>Cancel This Order?</h3>
              <p>Please tell us why you want to cancel order #{orderNumber}:</p>
            </div>
            <div className="ocp-cancel-reasons">
              {CANCEL_REASONS.map((r, i) => (
                <label key={i} className="ocp-reason-label">
                  <input
                    type="radio"
                    name="cancelReason"
                    value={r}
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                  />
                  <span>{r}</span>
                </label>
              ))}
              {selectedReason === 'Other reason' && (
                <textarea
                  className="ocp-cancel-textarea"
                  placeholder="Tell us what happened..."
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  rows={3}
                />
              )}
            </div>
            <div className="ocp-modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Keep Order
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
