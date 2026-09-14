import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { DeliveryAddress } from '../../types';
import './AddressesPage.css';

const LABEL_ICONS: Record<string, string> = {
  home: '🏠',
  work: '💼',
  office: '🏢',
  other: '📍',
};

const getLabelIcon = (label?: string) => LABEL_ICONS[(label || '').toLowerCase()] || '📍';

const emptyForm: Partial<DeliveryAddress> = {
  label: 'Home',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zipCode: '',
  isDefault: false,
};

export default function AddressesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editAddr, setEditAddr] = useState<DeliveryAddress | null>(null);
  const [form, setForm] = useState<Partial<DeliveryAddress>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login');
    const refreshAndLoad = async () => {
      try {
        const profile = await api.auth.getProfile();
        setAddresses(profile?.savedAddresses || []);
        refreshUser();
      } catch {
        setAddresses(user?.savedAddresses || []);
      }
    };
    if (isAuthenticated) refreshAndLoad();
  }, [isAuthenticated, isLoading]);

  const openAdd = () => {
    setEditAddr(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (addr: DeliveryAddress) => {
    setEditAddr(addr);
    setForm({ ...addr });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditAddr(null);
    setForm(emptyForm);
  };

  // Browser Geolocation + Reverse Geocoding
  const handleFetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setLocating(true);
    showToast('Detecting your location...', 'info');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const streetName = [
              addr.road || addr.street,
              addr.suburb || addr.neighbourhood || addr.residential,
            ]
              .filter(Boolean)
              .join(', ');

            setForm((prev) => ({
              ...prev,
              addressLine1: streetName || data.display_name?.split(',').slice(0, 2).join(',') || '',
              city: addr.city || addr.town || addr.village || addr.city_district || addr.county || '',
              state: addr.state || '',
              zipCode: addr.postcode || '',
              latitude,
              longitude,
            }));
            showToast('Location detected successfully! 📍', 'success');
          } else {
            showToast('Unable to get address name. Please fill in details.', 'info');
          }
        } catch {
          showToast('Location coordinates detected. Please confirm details.', 'info');
          setForm((prev) => ({ ...prev, latitude, longitude }));
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        let msg = 'Unable to fetch your location';
        if (error.code === error.PERMISSION_DENIED) msg = 'Location permission denied. Please allow location access.';
        showToast(msg, 'error');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSave = async () => {
    if (!form.addressLine1?.trim() || !form.city?.trim()) {
      showToast('Please fill in Address Line 1 and City', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editAddr?.id || editAddr?._id) {
        await api.addresses.update(editAddr.id || editAddr._id!, form);
        showToast('Address updated successfully!', 'success');
      } else {
        await api.addresses.add(form);
        showToast('Address added successfully!', 'success');
      }
      const profile = await api.auth.getProfile();
      setAddresses(profile?.savedAddresses || []);
      refreshUser();
      closeForm();
    } catch (err: any) {
      showToast(err.message || 'Failed to save address', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addr: DeliveryAddress) => {
    const id = addr.id || addr._id!;
    setDeleting(id);
    try {
      await api.addresses.delete(id);
      setAddresses((prev) => prev.filter((a) => (a.id || a._id) !== id));
      refreshUser();
      showToast('Address deleted', 'info');
    } catch {
      showToast('Failed to delete address', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (addr: DeliveryAddress) => {
    const id = addr.id || addr._id!;
    try {
      await api.addresses.setDefault(id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: (a.id || a._id) === id }))
      );
      refreshUser();
      showToast('Default address updated! ⭐', 'success');
    } catch {
      showToast('Failed to set default address', 'error');
    }
  };

  return (
    <main id="addresses-page" className="addr-page">
      <div className="container addr-body">
        <div className="addr-header">
          <button className="addr-back" onClick={() => navigate('/profile')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
            Profile
          </button>
          <h1 className="addr-title">Saved Delivery Addresses</h1>
          <button className="btn btn-primary btn-sm addr-add-btn" onClick={openAdd} id="addr-add-btn">
            + Add New Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="addr-empty">
            <div className="addr-empty-icon">📍</div>
            <h2>No addresses saved yet</h2>
            <p>Save your home, office, and other locations for fast 1-click food delivery</p>
            <button className="btn btn-primary" onClick={openAdd} id="addr-empty-add-btn">Add Your First Address</button>
          </div>
        ) : (
          <div className="addr-list">
            {addresses.map((addr) => {
              const id = addr.id || addr._id || '';
              return (
                <div key={id} className={`addr-card ${addr.isDefault ? 'default' : ''}`}>
                  <div className="addr-card-top">
                    <span className="addr-icon">{getLabelIcon(addr.label)}</span>
                    <div className="addr-info">
                      <div className="addr-label-row">
                        <span className="addr-label">{addr.label || 'Home'}</span>
                        {addr.isDefault && <span className="addr-default-badge">⭐ Default Delivery</span>}
                      </div>
                      <p className="addr-line1">{addr.addressLine1}</p>
                      {addr.addressLine2 && <p className="addr-line2">{addr.addressLine2}</p>}
                      <p className="addr-city-zip">{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zipCode ? `- ${addr.zipCode}` : ''}</p>
                    </div>
                  </div>

                  <div className="addr-card-actions">
                    {!addr.isDefault && (
                      <button
                        className="addr-action-btn set-default"
                        onClick={() => handleSetDefault(addr)}
                        id={`addr-setdefault-${id}`}
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      className="addr-action-btn edit"
                      onClick={() => openEdit(addr)}
                      id={`addr-edit-${id}`}
                    >
                      Edit
                    </button>
                    <button
                      className="addr-action-btn delete"
                      onClick={() => handleDelete(addr)}
                      disabled={deleting === id}
                      id={`addr-delete-${id}`}
                    >
                      {deleting === id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Address Form */}
        {showForm && (
          <div className="addr-modal-backdrop" onClick={closeForm}>
            <div className="addr-modal" onClick={(e) => e.stopPropagation()}>
              <div className="addr-modal-header">
                <h2>{editAddr ? 'Edit Address' : 'Add New Address'}</h2>
                <button className="addr-modal-close" onClick={closeForm}>×</button>
              </div>

              {/* Fetch GPS Location Button */}
              <button
                type="button"
                className="btn addr-detect-loc-btn"
                onClick={handleFetchCurrentLocation}
                disabled={locating}
              >
                <span>{locating ? '⏳' : '📍'}</span>
                <span>{locating ? 'Detecting Location...' : 'Use Current Location (Auto-Fill)'}</span>
              </button>

              <div className="addr-form">
                {/* Tag Selection */}
                <div className="addr-tag-group">
                  <label className="addr-form-label">Address Type</label>
                  <div className="addr-tags">
                    {['Home', 'Work', 'Office', 'Other'].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        className={`chip ${form.label === lbl ? 'active' : ''}`}
                        onClick={() => setForm((f) => ({ ...f, label: lbl }))}
                      >
                        {getLabelIcon(lbl)} {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="addr-field">
                  <label className="addr-form-label">House / Flat / Building / Street *</label>
                  <input
                    className="input"
                    placeholder="e.g. Flat 301, Silver Oak Apartments, 5th Cross"
                    value={form.addressLine1 || ''}
                    onChange={(e) => setForm((f) => ({ ...f, addressLine1: e.target.value }))}
                    required
                  />
                </div>

                <div className="addr-field">
                  <label className="addr-form-label">Landmark / Area (Optional)</label>
                  <input
                    className="input"
                    placeholder="e.g. Near Metro Station / Behind City Hospital"
                    value={form.addressLine2 || ''}
                    onChange={(e) => setForm((f) => ({ ...f, addressLine2: e.target.value }))}
                  />
                </div>

                <div className="addr-row">
                  <div className="addr-field">
                    <label className="addr-form-label">City *</label>
                    <input
                      className="input"
                      placeholder="City name"
                      value={form.city || ''}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="addr-field">
                    <label className="addr-form-label">State</label>
                    <input
                      className="input"
                      placeholder="State name"
                      value={form.state || ''}
                      onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="addr-field">
                  <label className="addr-form-label">PIN / Postal Code *</label>
                  <input
                    className="input"
                    placeholder="e.g. 560034"
                    value={form.zipCode || ''}
                    onChange={(e) => setForm((f) => ({ ...f, zipCode: e.target.value }))}
                    required
                  />
                </div>

                <label className="addr-checkbox">
                  <input
                    type="checkbox"
                    checked={!!form.isDefault}
                    onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                  />
                  <span>Make this my default delivery address</span>
                </label>

                <div className="addr-modal-btns">
                  <button type="button" className="btn btn-outline" onClick={closeForm}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary addr-save-btn"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
