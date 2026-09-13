import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  if (!isLoading && !isAuthenticated) { navigate('/login'); return null; }

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Name is required', 'error'); return; }
    setSaving(true);
    try {
      await api.auth.updateProfile({ name: form.name.trim(), phone: form.phone });
      await refreshUser();
      setEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally { setSaving(false); }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  return (
    <main id="profile-page" className="profile-page">
      <div className="container profile-body">
        {/* Header Card */}
        <div className="profile-header-card">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          </div>
          <div className="profile-header-info">
            <h1 className="profile-name">{user?.name || 'User'}</h1>
            <p className="profile-email">{user?.email}</p>
            {user?.phone && <p className="profile-phone">{user.phone}</p>}
          </div>
          <button
            id="profile-edit-btn"
            className={`btn ${editing ? 'btn-outline' : 'btn-primary'} btn-sm`}
            onClick={() => { if (editing) { setEditing(false); } else { setForm({ name: user?.name || '', phone: user?.phone || '' }); setEditing(true); } }}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="profile-edit-card">
            <h2 className="profile-section-title">Edit Profile</h2>
            <div className="profile-form">
              <div className="profile-field">
                <label htmlFor="profile-name" className="profile-label">Full Name</label>
                <input id="profile-name" type="text" className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="profile-field">
                <label htmlFor="profile-phone" className="profile-label">Phone Number</label>
                <input id="profile-phone" type="tel" className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 99999 99999" />
              </div>
              <div className="profile-field">
                <label className="profile-label">Email Address</label>
                <input type="email" className="input" value={user?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                <span className="profile-field-hint">Email cannot be changed</span>
              </div>
              <button id="profile-save-btn" className="btn btn-primary profile-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="profile-links-card">
          <h2 className="profile-section-title">Account</h2>
          <div className="profile-links">
            {[
              { id: 'orders-link', icon: '📦', label: 'My Orders', sub: 'View all your past orders', path: '/orders' },
              { id: 'cart-link', icon: '🛒', label: 'My Cart', sub: 'Items waiting to be ordered', path: '/cart' },
              { id: 'menu-link', icon: '🍽️', label: 'Browse Menu', sub: 'Discover new dishes', path: '/menu' },
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

        {/* Danger Zone */}
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
