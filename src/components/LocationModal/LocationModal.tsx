import { useState, useEffect } from 'react';
import { useLocationContext, type LocationData } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import './LocationModal.css';

const POPULAR_CITIES = [
  { city: 'Indore', area: 'Vijay Nagar', state: 'Madhya Pradesh' },
  { city: 'Mumbai', area: 'Bandra West', state: 'Maharashtra' },
  { city: 'Bengaluru', area: 'Koramangala', state: 'Karnataka' },
  { city: 'Delhi NCR', area: 'Connaught Place', state: 'Delhi' },
  { city: 'Hyderabad', area: 'Hitec City', state: 'Telangana' },
  { city: 'Pune', area: 'Koregaon Park', state: 'Maharashtra' },
  { city: 'Ahmedabad', area: 'Navrangpura', state: 'Gujarat' },
  { city: 'Jaipur', area: 'C Scheme', state: 'Rajasthan' },
];

export default function LocationModal() {
  const { isLocationModalOpen, setIsLocationModalOpen, setLocation, detectGPSLocation, isLoadingLocation } = useLocationContext();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  useEffect(() => {
    if (isLocationModalOpen && isAuthenticated) {
      api.addresses.getAll()
        .then((res: any) => {
          setSavedAddresses(Array.isArray(res) ? res : (res?.addresses || []));
        })
        .catch(() => {});
    }
  }, [isLocationModalOpen, isAuthenticated]);

  if (!isLocationModalOpen) return null;

  const handleSelectCity = (cityItem: typeof POPULAR_CITIES[0]) => {
    const loc: LocationData = {
      address: `${cityItem.area}, ${cityItem.city}, ${cityItem.state}`,
      area: cityItem.area,
      city: cityItem.city,
      state: cityItem.state,
    };
    setLocation(loc);
    setIsLocationModalOpen(false);
    showToast(`Delivery location set to ${cityItem.city}`, 'success');
  };

  const handleSelectSaved = (addr: any) => {
    const loc: LocationData = {
      address: addr.formattedAddress || `${addr.street}, ${addr.city}, ${addr.state}`,
      area: addr.street || addr.city,
      city: addr.city,
      state: addr.state,
      postalCode: addr.zipCode,
      lat: addr.location?.coordinates?.[1],
      lng: addr.location?.coordinates?.[0],
    };
    setLocation(loc);
    setIsLocationModalOpen(false);
    showToast(`Delivery location set to ${addr.label || addr.street}`, 'success');
  };

  const handleGPSDetect = async () => {
    const res = await detectGPSLocation();
    if (res) {
      setIsLocationModalOpen(false);
      showToast(`Location detected: ${res.area || res.city}`, 'success');
    } else {
      showToast('Could not access GPS. Please allow location permissions in your browser.', 'error');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const parts = query.trim().split(',');
    const area = parts[0]?.trim() || query.trim();
    const city = parts[1]?.trim() || parts[0]?.trim();

    const loc: LocationData = {
      address: query.trim(),
      area,
      city,
      state: '',
    };
    setLocation(loc);
    setIsLocationModalOpen(false);
    showToast(`Delivery location set to ${query.trim()}`, 'success');
  };

  return (
    <div className="location-modal-overlay" onClick={() => setIsLocationModalOpen(false)} role="dialog" aria-modal="true">
      <div className="location-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="location-modal-header">
          <div className="location-modal-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <h3>Select Delivery Location</h3>
          </div>
          <button
            className="location-modal-close"
            onClick={() => setIsLocationModalOpen(false)}
            aria-label="Close location modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* GPS Auto-Detect Button */}
        <div className="location-gps-bar">
          <button
            type="button"
            className="location-gps-btn"
            onClick={handleGPSDetect}
            disabled={isLoadingLocation}
          >
            <div className="location-gps-icon">
              {isLoadingLocation ? (
                <span className="gps-spinner" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="22" y1="12" x2="18" y2="12" />
                  <line x1="6" y1="12" x2="2" y2="12" />
                  <line x1="12" y1="6" x2="12" y2="2" />
                  <line x1="12" y1="22" x2="12" y2="18" />
                </svg>
              )}
            </div>
            <div className="location-gps-text">
              <strong>{isLoadingLocation ? 'Locating via GPS...' : 'Detect Current Location'}</strong>
              <span>Using GPS & real-time reverse geocoding</span>
            </div>
            <span className="location-gps-arrow">→</span>
          </button>
        </div>

        {/* Search Field */}
        <form onSubmit={handleManualSubmit} className="location-search-form">
          <div className="location-search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Type area, street name, city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="location-search-input"
          />
          {query.trim() && (
            <button type="submit" className="location-search-submit">
              Set
            </button>
          )}
        </form>

        {/* Saved Addresses (if logged in) */}
        {isAuthenticated && savedAddresses.length > 0 && (
          <div className="location-section">
            <div className="location-section-title">Saved Delivery Addresses</div>
            <div className="location-saved-list">
              {savedAddresses.map((addr) => (
                <button
                  key={addr._id || addr.id}
                  type="button"
                  className="location-saved-item"
                  onClick={() => handleSelectSaved(addr)}
                >
                  <div className="saved-item-icon">
                    {addr.label?.toLowerCase() === 'home' ? '🏠' : addr.label?.toLowerCase() === 'work' ? '🏢' : '📍'}
                  </div>
                  <div className="saved-item-details">
                    <strong>{addr.label || 'Saved Location'}</strong>
                    <p>{addr.street}, {addr.city} {addr.zipCode}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Cities */}
        <div className="location-section">
          <div className="location-section-title">Popular Cities & Areas</div>
          <div className="location-cities-grid">
            {POPULAR_CITIES.map((c) => (
              <button
                key={c.city}
                type="button"
                className="location-city-chip"
                onClick={() => handleSelectCity(c)}
              >
                <span className="city-name">{c.city}</span>
                <span className="city-area">{c.area}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
