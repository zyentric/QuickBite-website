import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { wsService } from '../../services/WebSocketService';
import TrackingMap from '../../components/TrackingMap/TrackingMap';
import type { CustomerOrderSummary, RawOrderItem } from '../../types';
import './OrderDetailPage.css';

const STATUS_STEPS = [
  { key: 'Placed', label: 'Order Placed', icon: '📋' },
  { key: 'Accepted', label: 'Accepted', icon: '👨‍🍳' },
  { key: 'Preparing', label: 'Preparing Food', icon: '🍳' },
  { key: 'ReadyForPickup', label: 'Ready for Pickup', icon: '📦' },
  { key: 'OutForDelivery', label: 'Out for Delivery', icon: '🛵' },
  { key: 'Delivered', label: 'Delivered', icon: '✅' },
];

const CANCEL_REASONS = [
  'Changed my mind / No longer hungry',
  'Delivery time is taking too long',
  'Ordered wrong items or duplicate order',
  'Need to change delivery address',
  'Found a better deal elsewhere',
  'Other reason',
];

const getStatusIndex = (status: string) => {
  switch (status) {
    case 'PendingPayment': case 'Placed': return 0;
    case 'Accepted': return 1;
    case 'Preparing': return 2;
    case 'ReadyForPickup': return 3;
    case 'OutForDelivery': return 4;
    case 'Delivered': return 5;
    case 'Cancelled': return -1;
    default: return 0;
  }
};

const getStatusTheme = (status: string) => {
  switch (status) {
    case 'Preparing': return { label: 'Preparing Food', color: '#D97706', bg: '#FEF3C7' };
    case 'OutForDelivery': return { label: 'Out for Delivery', color: '#E85D22', bg: '#FFF4EB' };
    case 'ReadyForPickup': return { label: 'Ready for Pickup', color: '#7C3AED', bg: '#F3E8FF' };
    case 'Accepted': return { label: 'Order Accepted', color: '#2563EB', bg: '#EFF6FF' };
    case 'Placed': return { label: 'Order Placed', color: '#2563EB', bg: '#EFF6FF' };
    case 'Delivered': return { label: 'Delivered Successfully', color: '#059669', bg: '#ECFDF5' };
    case 'Cancelled': return { label: 'Order Cancelled', color: '#DC2626', bg: '#FEE2E2' };
    default: return { label: status, color: '#6B7280', bg: '#F3F4F6' };
  }
};

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=200&auto=format&fit=crop';
const CANCELLABLE = ['PendingPayment', 'Placed', 'Accepted'];

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [order, setOrder] = useState<CustomerOrderSummary | null>(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  // Success Confirmation Modal
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(Boolean(location.state?.showSuccessModal));
  const [successCountdown, setSuccessCountdown] = useState<number>(5);
  const successTimerRef = useRef<any>(null);

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // 5-second countdown on success modal
  useEffect(() => {
    if (!showSuccessModal) return;
    setSuccessCountdown(5);
    successTimerRef.current = setInterval(() => {
      setSuccessCountdown(prev => {
        if (prev <= 1) {
          clearInterval(successTimerRef.current);
          setShowSuccessModal(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (successTimerRef.current) clearInterval(successTimerRef.current);
    };
  }, [showSuccessModal]);

  const handleDismissSuccessModal = () => {
    if (successTimerRef.current) clearInterval(successTimerRef.current);
    setShowSuccessModal(false);
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { navigate('/login'); return; }
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const data = await api.orders.getById(id);
        const normalized: CustomerOrderSummary = {
          ...data,
          id: data._id || data.id || id,
          _id: data._id || data.id || id,
          orderNumber: data.orderNumber || (data._id || data.id || id)?.toString().slice(-6).toUpperCase(),
          status: data.status || 'Placed',
          paymentStatus: data.paymentStatus || 'Paid',
          items: (data.items || (data as any).rawItems || []).map((it: any) => ({
            ...it,
            quantity: Number(it.quantity) || 1,
            price: Number(it.price || it.menuItem?.price || 0),
            name: it.name || it.menuItem?.name || 'Food Item',
            menuItem: it.menuItem && typeof it.menuItem === 'object' ? it.menuItem : {
              name: it.name || (typeof it.menuItem === 'string' ? it.menuItem : 'Food Item'),
              price: Number(it.price || 0),
              image: it.image || FALLBACK_IMG,
            },
            image: it.image || it.menuItem?.image || FALLBACK_IMG,
          })),
          totalAmount: Number(data.totalAmount || (data as any).price || 0),
          createdAt: data.createdAt || (data as any).date || new Date().toISOString(),
        };
        setOrder(normalized);
      } catch (err: any) {
        showToast(err.message || 'Failed to load order', 'error');
      } finally { setLoading(false); }
    };

    if (!order) fetchOrder();

    // Real-time status updates via WebSocket
    const unsub = wsService.subscribe((evt) => {
      if (evt.orderId === id && evt.type === 'ORDER_STATUS_CHANGED') {
        setOrder(prev => prev ? { ...prev, status: evt.status } : prev);
        showToast(`Order update: ${evt.status}`, 'order');
      }
    });
    return () => unsub();
  }, [id, isAuthenticated, authLoading]);

  // Handle Order Cancellation
  const handleConfirmCancel = async () => {
    if (!id) return;
    setCancelling(true);
    const reason = selectedReason === 'Other reason' ? (customReason || 'Other') : selectedReason;
    try {
      await api.orders.cancel(id, reason);
      setOrder(prev => prev ? { ...prev, status: 'Cancelled' } : null);
      setShowCancelModal(false);
      showToast('Order cancelled successfully', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  // Reorder flow
  const handleReorder = () => {
    const items = order?.items || order?.rawItems || [];
    items.forEach((item: RawOrderItem) => {
      const mi = item.menuItem || item;
      const itemId = (mi as any).id || (mi as any)._id || '';
      if (itemId || (mi as any).name) {
        addToCart({
          id: itemId,
          _id: (mi as any)._id,
          name: (mi as any).name || 'Dish',
          price: (mi as any).price || item.price || 0,
          description: (mi as any).description || '',
          image: (mi as any).image,
          category: (mi as any).category,
          rating: (mi as any).rating,
        });
      }
    });
    showToast('Items added to cart! 🛒', 'success');
    navigate('/cart');
  };

  if (loading) {
    return (
      <main className="odp-page">
        <div className="container odp-body">
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16, marginBottom: 16 }} />)}
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="odp-page">
        <div className="container odp-body">
          <div className="odp-empty">
            <div className="odp-empty-icon">📦</div>
            <h2>Order not found</h2>
            <button className="btn btn-primary" onClick={() => navigate('/orders')}>Back to Orders</button>
          </div>
        </div>
      </main>
    );
  }

  const status = order.status || 'Placed';
  const theme = getStatusTheme(status);
  const stepIdx = getStatusIndex(status);
  const isCancelled = status === 'Cancelled';
  const isDelivered = status === 'Delivered';
  const canCancel = CANCELLABLE.includes(status);
  const items = order.items || order.rawItems || [];
  const orderNumber = order.orderNumber || (order._id || order.id)?.slice(-6).toUpperCase();

  return (
    <main id="order-detail-page" className="odp-page">
      <div className="container odp-body">
        {/* Header */}
        <div className="odp-header">
          <button className="odp-back-btn" onClick={() => navigate('/orders')} aria-label="Back to orders">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
            All Orders
          </button>
          <div className="odp-header-right">
            <span className="odp-order-num">Order #{orderNumber}</span>
            <span className="odp-status-badge" style={{ background: theme.bg, color: theme.color }}>{theme.label}</span>
          </div>
        </div>

        {/* Status Tracker */}
        {!isCancelled ? (
          <div className="odp-tracker-card">
            <div className="odp-tracker-header">
              <h2 className="odp-section-title">Live Tracking</h2>
              <span className="odp-eta-badge">⏱️ Est. Delivery: 25–35 mins</span>
            </div>
            <div className="odp-tracker">
              {STATUS_STEPS.map((step, idx) => {
                const isDone = idx <= stepIdx;
                const isActive = idx === stepIdx;
                return (
                  <div key={step.key} className={`odp-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                    <div className="odp-step-dot">
                      {isDone && !isActive ? <span>✓</span> : <span>{step.icon}</span>}
                    </div>
                    <span className="odp-step-label">{step.label}</span>
                    {idx < STATUS_STEPS.length - 1 && <div className={`odp-step-line ${isDone ? 'done' : ''}`} />}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="odp-cancelled-banner">
            <span style={{ fontSize: '20px' }}>❌</span>
            <div>
              <div style={{ fontWeight: 800 }}>This order has been cancelled</div>
              <div style={{ fontSize: '13px', opacity: 0.85 }}>Any charged amount will be refunded within 24 hours.</div>
            </div>
          </div>
        )}

        {/* Live Leaflet OpenStreetMap Tracking Card */}
        {!isCancelled && (
          <TrackingMap
            startLat={(order.shopkeeper as any)?.latitude || (order as any).shopkeeperLatitude || 30.7180}
            startLng={(order.shopkeeper as any)?.longitude || (order as any).shopkeeperLongitude || 76.7350}
            destLat={order.deliveryAddress?.latitude || (order as any).destLatitude || 30.7046}
            destLng={order.deliveryAddress?.longitude || (order as any).destLongitude || 76.7179}
            orderStatus={status}
            driverName={order.deliveryMan?.name || 'Rajesh Delivery Partner'}
            driverPhone={order.deliveryMan?.phone || '+91 98765 43210'}
            destinationAddress={order.deliveryAddress?.formattedAddress || order.deliveryAddress?.addressLine1 || order.deliveryAddress?.address || 'Your Delivery Location'}
          />
        )}

        <div className="odp-grid">
          {/* Left Column: Items & Address */}
          <div className="odp-left">
            {/* Items */}
            <div className="odp-card">
              <h2 className="odp-section-title">Order Items ({items.length})</h2>
              <div className="odp-items">
                {items.map((item: any, i: number) => {
                  const menuItem = item.menuItem || item;
                  const name = menuItem?.name || item.name || 'Dish Item';
                  const price = menuItem?.price || item.price || 0;
                  const img = menuItem?.image || item.image || FALLBACK_IMG;
                  return (
                    <div key={i} className="odp-item-row">
                      <img
                        src={img}
                        alt={name}
                        className="odp-item-img"
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                      />
                      <div className="odp-item-info">
                        <div className="odp-item-name">{name}</div>
                        <div className="odp-item-meta">₹{price} × {item.quantity || 1}</div>
                      </div>
                      <div className="odp-item-price">₹{(price * (item.quantity || 1)).toFixed(0)}</div>
                    </div>
                  );
                })}
              </div>
              <div className="odp-total-row">
                <span>Total Amount Paid</span>
                <span className="odp-total-val">₹{order.totalAmount?.toFixed(0) || order.price?.toFixed(0)}</span>
              </div>
            </div>

            {/* Delivery Address */}
            {order.deliveryAddress && (
              <div className="odp-card">
                <h2 className="odp-section-title">📍 Delivery Address</h2>
                <div className="odp-address">
                  {order.deliveryAddress.label && <div className="odp-addr-label">{order.deliveryAddress.label}</div>}
                  <div>{order.deliveryAddress.formattedAddress || order.deliveryAddress.addressLine1 || order.deliveryAddress.address}</div>
                  {order.deliveryAddress.city && <div>{order.deliveryAddress.city} {order.deliveryAddress.zipCode}</div>}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Payment, PIN, Partner, Actions */}
          <div className="odp-right">
            {/* Delivery PIN Card */}
            {order.deliveryPin && !isCancelled && (
              <div className="odp-card odp-pin-card">
                <span className="odp-pin-title">Share PIN with Delivery Partner</span>
                <span className="odp-pin">{order.deliveryPin}</span>
                <span className="odp-pin-desc">Required to confirm delivery of your meal</span>
              </div>
            )}

            {/* Payment Info */}
            <div className="odp-card">
              <h2 className="odp-section-title">💳 Payment Details</h2>
              <div className="odp-info-rows">
                <div className="odp-info-row">
                  <span>Method</span>
                  <span>{order.paymentMethod === 'cod' || order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod || 'COD'}</span>
                </div>
                <div className="odp-info-row">
                  <span>Status</span>
                  <span className={`odp-pay-status ${(order.paymentStatus || 'pending').toLowerCase()}`}>
                    {order.paymentStatus || 'Paid'}
                  </span>
                </div>
                {order.couponCode && (
                  <div className="odp-info-row">
                    <span>Coupon Applied</span>
                    <span style={{ color: '#059669', fontWeight: 800 }}>{order.couponCode}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Partner */}
            {order.deliveryMan && !isCancelled && (
              <div className="odp-card">
                <h2 className="odp-section-title">🛵 Delivery Partner</h2>
                <div className="odp-partner">
                  <div className="odp-partner-avatar">{order.deliveryMan.name?.[0]?.toUpperCase() || 'D'}</div>
                  <div className="odp-partner-details">
                    <div className="odp-partner-name">{order.deliveryMan.name || 'Assigned Rider'}</div>
                    {order.deliveryMan.vehicleType && (
                      <div className="odp-partner-meta">{order.deliveryMan.vehicleType} • {order.deliveryMan.vehicleNumber}</div>
                    )}
                    {order.deliveryMan.phone && (
                      <a href={`tel:${order.deliveryMan.phone}`} className="odp-partner-call">
                        📞 Call Partner ({order.deliveryMan.phone})
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="odp-actions">
              {isDelivered && (
                <button
                  className="btn btn-primary odp-action-btn"
                  onClick={() => navigate(`/review/${order.id || order._id}`, { state: { order } })}
                >
                  ⭐ Rate & Review Order
                </button>
              )}

              <button className="btn btn-outline odp-action-btn" onClick={handleReorder}>
                🔁 Reorder Items
              </button>

              {canCancel && (
                <button className="btn odp-cancel-btn" onClick={() => setShowCancelModal(true)}>
                  Cancel Order
                </button>
              )}
            </div>

            {/* Order date */}
            {order.createdAt && (
              <div className="odp-date">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>

        {/* Celebration / Order Confirmed Modal */}
        {showSuccessModal && order && (
          <div className="odp-modal-backdrop" onClick={handleDismissSuccessModal}>
            <div className="odp-success-modal" onClick={e => e.stopPropagation()}>
              <button
                className="odp-modal-close"
                onClick={handleDismissSuccessModal}
                title="Close modal and view live tracking"
              >
                ×
              </button>

              {/* Checkmark animation */}
              <div className="odp-success-lottie">
                <div className="odp-checkmark">
                  <svg viewBox="0 0 52 52" className="odp-check-svg">
                    <circle className="odp-check-circle" cx="26" cy="26" r="25" fill="none" />
                    <path className="odp-check-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                  </svg>
                </div>
                <div className="odp-confetti">🎉</div>
              </div>

              <h2 className="odp-success-modal-title">Order Confirmed!</h2>
              <p className="odp-success-modal-sub">
                Your order is placed and the kitchen is preparing your delicious meal.
              </p>

              {/* 5-sec countdown bar */}
              <div className="odp-timer-banner">
                <div className="odp-timer-text">
                  <span>⚡ Auto-closing in <strong>{successCountdown}s</strong></span>
                  <button
                    className="odp-timer-instant-btn"
                    onClick={handleDismissSuccessModal}
                  >
                    View Details Now &rarr;
                  </button>
                </div>
                <div className="odp-timer-bar-wrap">
                  <div
                    className="odp-timer-bar"
                    style={{ width: `${((5 - successCountdown) / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Order key metrics */}
              <div className="odp-modal-info-grid">
                <div className="odp-modal-info-item">
                  <span className="odp-modal-label">Order ID</span>
                  <span className="odp-modal-val">#{orderNumber}</span>
                </div>
                {order.deliveryPin && (
                  <div className="odp-modal-info-item">
                    <span className="odp-modal-label">Delivery PIN</span>
                    <span className="odp-modal-val odp-modal-pin">{order.deliveryPin}</span>
                  </div>
                )}
                <div className="odp-modal-info-item">
                  <span className="odp-modal-label">Total Amount</span>
                  <span className="odp-modal-val text-primary font-extrabold">₹{(Number(order.totalAmount || order.price || 0)).toFixed(0)}</span>
                </div>
                <div className="odp-modal-info-item">
                  <span className="odp-modal-label">Payment</span>
                  <span className="odp-modal-val">{order.paymentMethod === 'online' ? 'Paid Online' : 'Cash on Delivery (COD)'}</span>
                </div>
              </div>

              {/* Ordered items preview */}
              {items.length > 0 && (
                <div className="odp-modal-items-preview">
                  <div className="odp-modal-items-title">Items Ordered ({items.length})</div>
                  <div className="odp-modal-pills">
                    {items.map((it: any, i: number) => {
                      const name = it.name || it.menuItem?.name || 'Dish';
                      return (
                        <span key={i} className="odp-modal-pill">
                          {it.quantity || 1}× {name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="odp-success-modal-actions">
                <button
                  className="btn btn-primary odp-modal-track-btn"
                  onClick={handleDismissSuccessModal}
                >
                  📍 Track Order Live
                </button>
                {canCancel && (
                  <button
                    className="btn btn-outline odp-modal-cancel-btn"
                    onClick={() => {
                      handleDismissSuccessModal();
                      setShowCancelModal(true);
                    }}
                  >
                    ❌ Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Modal */}
        {showCancelModal && (
          <div className="odp-modal-backdrop" onClick={() => setShowCancelModal(false)}>
            <div className="odp-modal" onClick={e => e.stopPropagation()}>
              <div className="odp-modal-header">
                <h3>Cancel Order #{orderNumber}?</h3>
                <button className="odp-modal-close" onClick={() => setShowCancelModal(false)}>×</button>
              </div>
              <p className="odp-modal-sub">Please let us know why you'd like to cancel this order:</p>

              <div className="odp-reasons-list">
                {CANCEL_REASONS.map(reason => (
                  <label key={reason} className={`odp-reason-item ${selectedReason === reason ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="cancel_reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {selectedReason === 'Other reason' && (
                <textarea
                  className="input odp-reason-text"
                  placeholder="Tell us more about why you're cancelling..."
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  rows={3}
                />
              )}

              <div className="odp-modal-actions">
                <button className="btn btn-outline" onClick={() => setShowCancelModal(false)}>
                  Keep Order
                </button>
                <button
                  className="btn odp-confirm-cancel-btn"
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
