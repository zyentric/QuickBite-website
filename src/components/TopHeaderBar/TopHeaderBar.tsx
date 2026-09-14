import React from 'react';
import { useLocationContext } from '../../context/LocationContext';
import { Link } from 'react-router-dom';
import './TopHeaderBar.css';

export default function TopHeaderBar() {
  const {
    location,
    isLocationFetched,
    isLoadingLocation,
    setIsLocationModalOpen,
    detectGPSLocation,
  } = useLocationContext();

  const handleFetchLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    detectGPSLocation();
  };

  return (
    <div className="top-header-bar">
      <div className="top-header-inner">
        {/* Left Side: Delivery Location Bar */}
        <div className="top-header-left">
          <div
            className={`top-location-widget ${isLocationFetched ? 'fetched' : 'not-fetched'}`}
            onClick={() => setIsLocationModalOpen(true)}
            title="Click to change or select delivery location"
            role="button"
            tabIndex={0}
          >
            <div className="top-loc-icon-wrapper">
              {isLoadingLocation ? (
                <span className="top-loc-spinner" />
              ) : (
                <svg className="top-loc-pin" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
                </svg>
              )}
            </div>

            {isLocationFetched && location ? (
              <div className="top-loc-text">
                <span className="top-loc-tag">Delivering to:</span>
                <span className="top-loc-address" title={location.address}>
                  <strong>{location.area || location.city}</strong>
                  {location.city && location.city !== location.area ? `, ${location.city}` : ''}
                  {location.state ? ` (${location.state})` : ''}
                </span>
                <span className="top-loc-change-btn">Change</span>
              </div>
            ) : (
              <div className="top-loc-text not-fetched-text">
                <span className="top-loc-prompt">
                  {isLoadingLocation ? 'Locating your current GPS coordinates...' : 'Fetch your location'}
                </span>
                {!isLoadingLocation && (
                  <button
                    type="button"
                    className="top-loc-fetch-btn"
                    onClick={handleFetchLocation}
                  >
                    ⚡ Auto Detect GPS
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

     

        {/* Right Side: Quick Perks & Links */}
        <div className="top-header-right">
          <div className="top-perk-badge">
            <span className="perk-icon">⚡</span>
            <span>20-30 Min Fast Delivery</span>
          </div>
          <div className="top-header-links">
            <Link to="/help" className="top-header-link">Help & Support</Link>
            <span className="top-header-sep">•</span>
            <Link to="/orders" className="top-header-link">Track Order</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
