import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { wsService } from '../../services/WebSocketService';
import type { CustomerOrderSummary } from '../../types';
import './OrdersPage.css';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pendingpayment: { label: 'Pending Payment', color: '#D97706', bg: '#FEF3C7' },
  placed:        { label: 'Order Placed',    color: '#2563EB', bg: '#DBEAFE' },
  accepted:      { label: 'Accepted',        color: '#7C3AED', bg: '#EDE9FE' },
  preparing:     { label: 'Preparing',       color: '#D97706', bg: '#FEF3C7' },
  readyforpickup:{ label: 'Ready for Pickup',color: '#059669', bg: '#D1FAE5' },
  outfordelivery:{ label: 'Out for Delivery',color: '#E85D22', bg: '#FFF4EB' },
  delivered:     { label: 'Delivered',       color: '#059669', bg: '#D1FAE5' },
  cancelled:     { label: 'Cancelled',       color: '#EF4444', bg: '#FEF2F2' },
};

const isStatusActive = (status?: string) => {
  const s = (status || '').toLowerCase().replace(/[\s_-]/g, '');
  return ['pendingpayment', 'placed', 'accepted', 'preparing', 'readyforpickup', 'outfordelivery', 'pending'].includes(s) || !s;
};

const isStatusDelivered = (status?: string) => {
  const s = (status || '').toLowerCase().replace(/[\s_-]/g, '');
  return s === 'delivered' || s === 'completed';
};

const isStatusCancelled = (status?: string) => {
  const s = (status || '').toLowerCase().replace(/[\s_-]/g, '');
  return s === 'cancelled' || s === 'canceled';
};

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=200&auto=format&fit=crop';

type TabType = 'Active' | 'Completed' | 'Cancelled';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>('Active');

  const loadOrders = useCallback(async () => {
    try {
      const res = await api.orders.getMyOrders();
      let raw: any[] = Array.isArray(res) ? res : (res?.orders || []);

      // If empty, also check local storage
      if (raw.length === 0) {
        try {
          const local = JSON.parse(localStorage.getItem('quickbite_local_orders') || '[]');
          if (Array.isArray(local) && local.length > 0) raw = local;
        } catch { /* noop */ }
      }

      const normalized: CustomerOrderSummary[] = raw.map((o: any) => ({
        ...o,
        id: o._id || o.id || o.orderNumber,
        _id: o._id || o.id || o.orderNumber,
        orderNumber: o.orderNumber || (o._id || o.id)?.toString().slice(-6).toUpperCase(),
        status: o.status || 'Placed',
        paymentStatus: o.paymentStatus || 'Paid',
        items: (o.items || o.rawItems || []).map((it: any) => ({
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
        totalAmount: Number(o.totalAmount || o.price || 0),
        createdAt: o.createdAt || o.date || new Date().toISOString(),
      }));
      setOrders(normalized);
    } catch {
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { navigate('/login'); return; }
    if (isAuthenticated) loadOrders();

    // Real-time updates
    const unsub = wsService.subscribe((evt) => {
      if (evt.type === 'ORDER_STATUS_CHANGED') {
        setOrders(prev => prev.map(o => (o.id === evt.orderId || o._id === evt.orderId) ? { ...o, status: evt.status } : o));
        showToast(evt.message, 'order');
      }
    });
    return () => unsub();
  }, [isAuthenticated, authLoading]);

  const handleReorder = (order: CustomerOrderSummary) => {
    const items = order.items || order.rawItems || [];
    items.forEach((item: any) => {
      const mi = item.menuItem || item;
      addToCart({
        id: mi.id || mi._id || '',
        _id: mi._id,
        name: mi.name || item.name || '',
        price: Number(mi.price || item.price || 0),
        description: mi.description || '',
        image: mi.image || item.image,
        category: mi.category,
        rating: mi.rating,
      });
    });
    showToast('Items added to cart!', 'success');
    navigate('/cart');
  };

  const filtered = orders.filter(o => {
    if (tab === 'Active') return isStatusActive(o.status);
    if (tab === 'Completed') return isStatusDelivered(o.status);
    return isStatusCancelled(o.status);
  });

  const getStatus = (s?: string) => {
    const key = (s || '').toLowerCase().replace(/[\s_-]/g, '');
    return STATUS_MAP[key] || { label: s || 'Order Placed', color: '#2563EB', bg: '#DBEAFE' };
  };

  const tabs: TabType[] = ['Active', 'Completed', 'Cancelled'];
  const tabCounts = {
    Active: orders.filter(o => isStatusActive(o.status)).length,
    Completed: orders.filter(o => isStatusDelivered(o.status)).length,
    Cancelled: orders.filter(o => isStatusCancelled(o.status)).length,
  };

  return (
    <main id="orders-page" className="orders-page">
      <div className="container orders-body">
        <div className="orders-header">
          <div>
            <h1 className="orders-title">My Orders</h1>
            <p className="orders-sub">Track and manage your food orders</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="orders-tabs">
          {tabs.map(t => (
            <button
              key={t}
              id={`orders-tab-${t.toLowerCase()}`}
              className={`orders-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
            >
              {t}
              {tabCounts[t] > 0 && <span className="orders-tab-badge">{tabCounts[t]}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="orders-list">
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 18 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">
              {tab === 'Active' ? '⏳' : tab === 'Completed' ? '✅' : '❌'}
            </div>
            <h2>No {tab.toLowerCase()} orders</h2>
            <p>
              {tab === 'Active' ? "You don't have any active orders right now." :
               tab === 'Completed' ? "Your delivered orders will appear here." :
               "No cancelled orders."}
            </p>
            {tab !== 'Completed' && (
              <button className="btn btn-primary" onClick={() => navigate('/menu')} id="orders-browse-btn">Order Now</button>
            )}
          </div>
        ) : (
          <div className="orders-list">
            {filtered.map(order => {
              const st = getStatus(order.status);
              const items = order.items || order.rawItems || [];
              const firstImg = items[0]?.image || items[0]?.menuItem?.image || FALLBACK_IMG;
              return (
                <div
                  key={order.id || order._id}
                  className="order-card"
                  onClick={() => navigate(`/orders/${order.id || order._id}`, { state: { order } })}
                  role="button"
                  tabIndex={0}
                  id={`order-card-${order.id || order._id}`}
                >
                  <img
                    src={firstImg}
                    alt="Order"
                    className="order-card-thumb"
                    onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                  />
                  <div className="order-card-main">
                    <div className="order-card-top">
                      <div>
                        <div className="order-id">Order #{order.orderNumber || (order._id || order.id)?.toString().slice(-6).toUpperCase()}</div>
                        <div className="order-date">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}</div>
                      </div>
                      <span className="order-status-badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                    <div className="order-card-items">
                      {items.slice(0, 3).map((item: any, i: number) => (
                        <span key={i} className="order-item-name">
                          {item.quantity || 1}× {item.name || item.menuItem?.name || 'Dish'}
                        </span>
                      ))}
                      {items.length > 3 && <span className="order-item-more">+{items.length - 3} more</span>}
                    </div>
                    <div className="order-card-bottom">
                      <div className="order-total">₹{(Number(order.totalAmount || order.price || 0)).toFixed(0)}</div>
                      <div className="order-card-actions">
                        {order.status === 'Delivered' && (
                          <button
                            className="order-reorder-btn"
                            onClick={e => { e.stopPropagation(); handleReorder(order); }}
                            id={`order-reorder-${order.id || order._id}`}
                          >
                            🔁 Reorder
                          </button>
                        )}
                        <div className="order-view-btn">
                          View Details
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                        </div>
                      </div>
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

