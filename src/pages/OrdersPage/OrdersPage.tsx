import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { Order } from '../../types';
import './OrdersPage.css';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PendingPayment: { label: 'Pending Payment', color: '#D97706', bg: '#FEF3C7' },
  Placed:        { label: 'Order Placed',    color: '#2563EB', bg: '#DBEAFE' },
  Accepted:      { label: 'Accepted',        color: '#7C3AED', bg: '#EDE9FE' },
  Preparing:     { label: 'Preparing',       color: '#D97706', bg: '#FEF3C7' },
  ReadyForPickup:{ label: 'Ready for Pickup',color: '#059669', bg: '#D1FAE5' },
  OutForDelivery:{ label: 'Out for Delivery',color: '#E85D22', bg: '#FFF4EB' },
  Delivered:     { label: 'Delivered',       color: '#059669', bg: '#D1FAE5' },
  Cancelled:     { label: 'Cancelled',       color: '#EF4444', bg: '#FEF2F2' },
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { navigate('/login'); return; }
    (async () => {
      try {
        const res = await api.orders.getMyOrders();
        const list = Array.isArray(res) ? res : (res?.orders || res?.data || []);
        setOrders(list);
      } catch { showToast('Failed to load orders', 'error'); }
      finally { setLoading(false); }
    })();
  }, [isAuthenticated, authLoading]);

  const getStatus = (s: string) => STATUS_MAP[s] || { label: s, color: '#666', bg: '#F3F4F6' };

  return (
    <main id="orders-page" className="orders-page">
      <div className="container orders-body">
        <div className="orders-header">
          <div>
            <h1 className="orders-title">My Orders</h1>
            <p className="orders-sub">Track and manage your food orders</p>
          </div>
        </div>

        {loading ? (
          <div className="orders-list">
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 18 }} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">📦</div>
            <h2>No orders yet</h2>
            <p>When you place an order, it will appear here</p>
            <button className="btn btn-primary" onClick={() => navigate('/menu')} id="orders-browse-btn">Order Now</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const st = getStatus(order.status);
              const items = order.items || [];
              return (
                <div
                  key={order.id || order._id}
                  className="order-card"
                  onClick={() => navigate(`/orders/${order.id || order._id}`, { state: { order } })}
                  role="button"
                  tabIndex={0}
                >
                  <div className="order-card-top">
                    <div>
                      <div className="order-id">Order #{order.orderNumber || (order._id || order.id)?.slice(-6).toUpperCase()}</div>
                      <div className="order-date">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                    </div>
                    <span className="order-status-badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                  <div className="order-card-items">
                    {items.slice(0, 3).map((item, i) => (
                      <span key={i} className="order-item-name">
                        {item.quantity}× {item.menuItem?.name || item.name || 'Item'}
                      </span>
                    ))}
                    {items.length > 3 && <span className="order-item-more">+{items.length - 3} more</span>}
                  </div>
                  <div className="order-card-bottom">
                    <div className="order-total">₹{order.totalAmount?.toFixed(0)}</div>
                    <div className="order-view-btn">
                      View Details
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
