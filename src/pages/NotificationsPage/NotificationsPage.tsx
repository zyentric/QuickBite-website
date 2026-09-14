import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Notification } from '../../types';
import './NotificationsPage.css';

const getIcon = (type?: string) => {
  switch (type) {
    case 'order': return '📋';
    case 'delivery': return '🛵';
    case 'promotion': return '🎁';
    default: return '🔔';
  }
};

const timeAgo = (dateStr?: string) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { navigate('/login'); return; }
    const fetch = async () => {
      try {
        const data = await api.notifications.getAll();
        setNotifications(data);
        api.notifications.markAllRead();
      } catch { setNotifications([]); }
      finally { setLoading(false); }
    };
    if (isAuthenticated) fetch();
  }, [isAuthenticated, isLoading]);

  return (
    <main id="notifications-page" className="notif-page">
      <div className="container notif-body">
        <div className="notif-header">
          <button className="notif-back" onClick={() => navigate(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
            Back
          </button>
          <h1 className="notif-title">Notifications</h1>
          {!loading && notifications.length > 0 && <span className="notif-count">{notifications.length}</span>}
        </div>

        {loading ? (
          <div className="notif-list">
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14, marginBottom: 12 }} />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty">
            <div className="notif-empty-icon">🔕</div>
            <h2>No notifications</h2>
            <p>You're all caught up! We'll notify you about your orders and offers.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map((n, idx) => {
              const id = n.id || n._id || String(idx);
              return (
                <div
                  key={id}
                  className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                  onClick={() => { if (n.orderId) navigate(`/orders/${n.orderId}`); }}
                  role={n.orderId ? 'button' : 'listitem'}
                  id={`notification-${id}`}
                >
                  <div className="notif-icon-wrap">
                    <span className="notif-icon">{getIcon(n.type)}</span>
                    {!n.isRead && <span className="notif-unread-dot" />}
                  </div>
                  <div className="notif-content">
                    <div className="notif-item-title">{n.title || 'QuickBite Update'}</div>
                    <div className="notif-item-msg">{n.message}</div>
                    <div className="notif-item-time">{timeAgo(n.createdAt)}</div>
                  </div>
                  {n.orderId && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="notif-chevron"><path d="m9 18 6-6-6-6"/></svg>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
