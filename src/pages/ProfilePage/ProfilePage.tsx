import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { DeliveryAddress } from '../../types';
import './ProfilePage.css';

const LABEL_ICONS: Record<string, string> = {
  home: '🏠',
  work: '💼',
  office: '🏢',
  other: '📍',
};

const getLabelIcon = (label?: string) => LABEL_ICONS[(label || '').toLowerCase()] || '📍';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);
  const [fetchingAddresses, setFetchingAddresses] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
      });
    }

    // Fetch user profile and addresses
    const fetchDetails = async () => {
      try {
        const profile = await api.auth.getProfile();
        if (profile?.savedAddresses) {
          setSavedAddresses(profile.savedAddresses);
        } else if (user?.savedAddresses) {
          setSavedAddresses(user.savedAddresses);
        }
      } catch {
        setSavedAddresses(user?.savedAddresses || []);
      } finally {
        setFetchingAddresses(false);
      }
    };

    if (isAuthenticated) {
      fetchDetails();
    }
  }, [isAuthenticated, isLoading, user]);

  const handleSaveProfile = async () => {
    if (!form.name.trim()) {
      showToast('Please enter your name', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.auth.updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
      });
      await refreshUser();
      setEditing(false);
      showToast('Profile updated successfully! ✨', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Signed out successfully', 'info');
    navigate('/');
  };

  const defaultAddress = savedAddresses.find(a => a.isDefault) || savedAddresses[0];

  return (
    <main id="profile-page" className="profile-page">
      <div className="container profile-body">
        
        {/* Header Profile Card */}
        <div className="profile-header-card">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          </div>
          <div className="profile-header-info">
            <div className="profile-title-row">
              <h1 className="profile-name">{user?.name || 'QuickBite Foodie'}</h1>
              <span className="profile-role-badge">
                {user?.role === 'admin' ? '👑 Admin' : user?.role === 'shopkeeper' ? '🏪 Restaurant' : user?.role === 'delivery_man' ? '🛵 Rider' : '🍴 Foodie'}
              </span>
            </div>
            <p className="profile-email">{user?.email}</p>
            {user?.phone ? (
              <p className="profile-phone">📞 {user.phone}</p>
            ) : (
              <p className="profile-phone-missing">Add your phone number for delivery updates</p>
            )}
          </div>
          <button
            id="profile-edit-btn"
            className={`btn ${editing ? 'btn-outline' : 'btn-primary'} btn-sm profile-toggle-btn`}
            onClick={() => {
              if (editing) {
                setEditing(false);
              } else {
                setForm({ name: user?.name || '', phone: user?.phone || '' });
                setEditing(true);
              }
            }}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Edit Profile Form */}
        {editing && (
          <div className="profile-edit-card">
            <h2 className="profile-section-title">Edit Account Details</h2>
            <div className="profile-form">
              <div className="profile-field">
                <label htmlFor="profile-name" className="profile-label">Full Name *</label>
                <input
                  id="profile-name"
                  type="text"
                  className="input"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-phone" className="profile-label">Phone Number</label>
                <input
                  id="profile-phone"
                  type="tel"
                  className="input"
                  placeholder="e.g. +91 98765 43210"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>

              <div className="profile-field">
                <label className="profile-label">Email Address (Registered)</label>
                <input
                  type="email"
                  className="input"
                  value={user?.email || ''}
                  disabled
                  style={{ opacity: 0.65, cursor: 'not-allowed', background: '#F1F5F9' }}
                />
                <span className="profile-field-hint">Primary email cannot be changed</span>
              </div>

              <div className="profile-edit-actions">
                <button
                  id="profile-save-btn"
                  className="btn btn-primary profile-save-btn"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Address Preview Card */}
        <div className="profile-address-card">
          <div className="profile-address-header">
            <div>
              <h2 className="profile-section-title" style={{ margin: 0 }}>Primary Delivery Address</h2>
              <p className="profile-section-sub">Where your delicious orders will be delivered</p>
            </div>
            <button
              className="btn btn-outline btn-sm profile-manage-addr-btn"
              onClick={() => navigate('/addresses')}
            >
              {savedAddresses.length > 0 ? 'Manage All Addresses' : '+ Add Address'}
            </button>
          </div>

          {fetchingAddresses ? (
            <div className="profile-addr-loading">Loading saved addresses...</div>
          ) : defaultAddress ? (
            <div className="profile-default-addr-box">
              <span className="profile-addr-icon">{getLabelIcon(defaultAddress.label)}</span>
              <div className="profile-addr-content">
                <div className="profile-addr-label-row">
                  <span className="profile-addr-label">{defaultAddress.label || 'Home'}</span>
                  {defaultAddress.isDefault && <span className="profile-default-chip">Default Address</span>}
                </div>
                <p className="profile-addr-line">{defaultAddress.addressLine1} {defaultAddress.addressLine2 ? `, ${defaultAddress.addressLine2}` : ''}</p>
                <p className="profile-addr-city">{defaultAddress.city}{defaultAddress.state ? `, ${defaultAddress.state}` : ''} {defaultAddress.zipCode ? `- ${defaultAddress.zipCode}` : ''}</p>
              </div>
            </div>
          ) : (
            <div className="profile-no-addr-box">
              <span className="profile-no-addr-icon">📍</span>
              <div>
                <strong>No address added yet</strong>
                <p>Add your home or office address for fast 1-click food orders</p>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/addresses')}
                style={{ marginLeft: 'auto' }}
              >
                Add Address
              </button>
            </div>
          )}
        </div>

        {/* Quick Menu Links */}
        <div className="profile-links-card">
          <h2 className="profile-section-title">My Account & Activity</h2>
          <div className="profile-links">
            {[
              { id: 'profile-orders-link', icon: '📦', label: 'My Orders', sub: 'Track live orders & view history', path: '/orders' },
              { id: 'profile-favorites-link', icon: '❤️', label: 'My Favourites', sub: 'Saved dishes & wishlist', path: '/favorites' },
              { id: 'profile-notifications-link', icon: '🔔', label: 'Notifications', sub: 'Order updates & special offers', path: '/notifications' },
              { id: 'profile-addresses-link', icon: '📍', label: 'Saved Addresses', sub: 'Manage home, work & other addresses', path: '/addresses' },
              { id: 'profile-settings-link', icon: '⚙️', label: 'Settings', sub: 'Password, security & preferences', path: '/settings' },
              { id: 'profile-help-link', icon: '🙋', label: 'Help & Support', sub: 'Frequently asked questions & contact', path: '/help' },
              { id: 'profile-cart-link', icon: '🛒', label: 'Shopping Cart', sub: 'View items ready for checkout', path: '/cart' },
            ].map(link => (
              <button
                key={link.id}
                id={link.id}
                className="profile-link-row"
                onClick={() => navigate(link.path)}
              >
                <span className="profile-link-icon">{link.icon}</span>
                <div className="profile-link-info">
                  <span className="profile-link-label">{link.label}</span>
                  <span className="profile-link-sub">{link.sub}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            ))}
          </div>
        </div>

        {/* Logout Zone */}
        <div className="profile-danger-card">
          <button id="profile-logout-btn" className="btn btn-outline profile-logout-btn" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
