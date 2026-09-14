import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLocationContext } from '../../context/LocationContext';
import { api } from '../../services/api';
import logoImg from '../../assets/logo.png';
import LocationModal from '../LocationModal/LocationModal';
import './Navbar.css';

const FOOD_CATEGORIES = [
  { name: 'Pizza & Pasta', icon: '🍕', query: 'Pizza', desc: 'Cheesy bakes & crusts' },
  { name: 'Burgers & Wraps', icon: '🍔', query: 'Burger', desc: 'Loaded & crispy' },
  { name: 'Crispy Snacks', icon: '🍟', query: 'Snacks', desc: 'Finger food favorites' },
  { name: 'Sweet Desserts', icon: '🍰', query: 'Dessert', desc: 'Cakes, pastries & sweets' },
  { name: 'Chilled Drinks', icon: '🥤', query: 'Drink', desc: 'Shakes, mojitos & sodas' },
  { name: 'Clean & Vegan', icon: '🥗', query: 'Salad', desc: 'Fresh organic greens' },
  { name: 'Rice & Bowls', icon: '🍚', query: 'Rice', desc: 'Hearty comfort bowls' },
  { name: 'Biryani Specials', icon: '🍗', query: 'Biryani', desc: 'Royal aromatics & spices' },
];

export default function Navbar() {
  const { isAuthenticated, user, logout, openAuthModal } = useAuth();
  const { totalItems } = useCart();
  const { location: deliveryLoc, setIsLocationModalOpen } = useLocationContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const profileTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const categoryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch unread notification count
  useEffect(() => {
    if (isAuthenticated) {
      api.notifications.getUnreadCount().then(setUnreadCount).catch(() => {});
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated, location.pathname]);

  // Close menus on route change
  useEffect(() => {
    setProfileOpen(false);
    setCategoryOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside listener for profile and category dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Profile hover handlers
  const handleProfileEnter = () => {
    if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    setProfileOpen(true);
  };
  const handleProfileLeave = () => {
    profileTimeoutRef.current = setTimeout(() => setProfileOpen(false), 200);
  };

  // Category hover handlers
  const handleCategoryEnter = () => {
    if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
    setCategoryOpen(true);
  };
  const handleCategoryLeave = () => {
    categoryTimeoutRef.current = setTimeout(() => setCategoryOpen(false), 200);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/menu?search=${encodeURIComponent(search.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleCategoryClick = (query: string) => {
    setCategoryOpen(false);
    setMobileMenuOpen(false);
    navigate(`/menu?search=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const userInitial = (user?.name?.[0] || 'U').toUpperCase();
  const firstName = user?.name ? user.name.split(' ')[0] : 'Account';

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main Navigation">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo" aria-label="QuickBite Home">
            <img src={logoImg} alt="QuickBite" className="navbar-logo-img" />
            <span className="navbar-logo-text">Quick<span>Bite</span></span>
          </Link>

          {/* Delivery Location Bar (Swiggy/Zomato style) */}
          <button
            type="button"
            className="navbar-location-pill"
            onClick={() => setIsLocationModalOpen(true)}
            title="Change delivery location"
            aria-label={`Delivery location: ${deliveryLoc?.area || deliveryLoc?.city || 'Select Location'}`}
          >
            <div className="location-pin-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
              </svg>
            </div>
            <div className="location-pill-text">
              <span className="location-pill-label">Deliver to</span>
              <span className="location-pill-val">
                {deliveryLoc?.area || deliveryLoc?.city || 'Select Location'}
              </span>
            </div>
            <svg className="location-pill-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          {/* Search Bar */}
          <form className="navbar-search" onSubmit={handleSearch} role="search">
            <div className="navbar-search-icon" aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              id="navbar-search-input"
              className="navbar-search-input"
              type="search"
              placeholder="Search dishes, restaurants, cuisines..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search dishes and restaurants"
            />
            <button type="submit" className="navbar-search-btn" aria-label="Submit Search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>

          {/* Navigation Links & Actions */}
          <div className="navbar-actions">
            {/* Explore / Categories Hover Dropdown */}
            <div
              className="navbar-nav-item-wrapper"
              ref={categoryRef}
              onMouseEnter={handleCategoryEnter}
              onMouseLeave={handleCategoryLeave}
            >
              <button
                type="button"
                className={`navbar-link-btn ${categoryOpen ? 'active' : ''}`}
                onClick={() => setCategoryOpen(c => !c)}
                aria-haspopup="true"
                aria-expanded={categoryOpen}
              >
                <span>Categories</span>
                <svg className={`navbar-chevron-sm ${categoryOpen ? 'rotate' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>

              {/* Categories Mega Dropdown */}
              {categoryOpen && (
                <div className="navbar-categories-menu" role="menu">
                  <div className="categories-menu-header">
                    <strong>Explore Cravings</strong>
                    <Link to="/menu" onClick={() => setCategoryOpen(false)}>View All Menu →</Link>
                  </div>
                  <div className="categories-menu-grid">
                    {FOOD_CATEGORIES.map(cat => (
                      <button
                        key={cat.name}
                        type="button"
                        className="category-menu-item"
                        onClick={() => handleCategoryClick(cat.query)}
                      >
                        <span className="category-menu-icon">{cat.icon}</span>
                        <div className="category-menu-meta">
                          <strong>{cat.name}</strong>
                          <span>{cat.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Menu Link */}
            <Link
              to="/menu"
              className={`navbar-link ${location.pathname === '/menu' ? 'active' : ''}`}
              id="navbar-menu-link"
            >
              Full Menu
            </Link>

            {/* Offers Link */}
            <Link
              to="/menu?offers=true"
              className="navbar-link offers-link"
              id="navbar-offers-link"
            >
              <span className="offers-fire-icon">🔥</span>
              Offers
            </Link>

            {/* Favorites Icon */}
            {isAuthenticated && (
              <Link
                to="/favorites"
                className={`navbar-icon-btn ${location.pathname === '/favorites' ? 'active' : ''}`}
                id="navbar-favorites"
                title="My Favourites"
                aria-label="My Favourites"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={location.pathname === '/favorites' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </Link>
            )}

            {/* Notifications Icon */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                className={`navbar-icon-btn navbar-notif-btn ${location.pathname === '/notifications' ? 'active' : ''}`}
                id="navbar-notifications"
                title="Notifications"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unreadCount > 0 && <span className="navbar-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </Link>
            )}

            {/* Cart Button */}
            <Link
              to="/cart"
              className={`navbar-cart-btn ${location.pathname === '/cart' ? 'active' : ''}`}
              id="navbar-cart"
              title="Shopping Cart"
              aria-label={`Cart with ${totalItems} items`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {totalItems > 0 && <span className="navbar-cart-badge">{totalItems > 99 ? '99+' : totalItems}</span>}
            </Link>

            {/* Auth Buttons or User Profile Dropdown */}
            {!isAuthenticated ? (
              <div className="navbar-auth-btns">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  id="navbar-login-btn"
                  onClick={() => openAuthModal('login')}
                >
                  Log In
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  id="navbar-signup-btn"
                  onClick={() => openAuthModal('register')}
                >
                  Sign Up
                </button>
              </div>
            ) : (
              /* User Profile Pill & Modal */
              <div
                className="navbar-profile-wrapper"
                ref={profileRef}
                onMouseEnter={handleProfileEnter}
                onMouseLeave={handleProfileLeave}
              >
                <button
                  id="navbar-profile-btn"
                  className={`navbar-profile-btn ${profileOpen ? 'open' : ''}`}
                  onClick={() => setProfileOpen(p => !p)}
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                  aria-label="User Account Menu"
                >
                  <div className="navbar-avatar">
                    {userInitial}
                  </div>
                  <span className="navbar-profile-name">{firstName}</span>
                  <svg
                    className={`navbar-chevron ${profileOpen ? 'rotate' : ''}`}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>

                {/* Profile Dropdown Modal */}
                {profileOpen && (
                  <div className="navbar-dropdown" role="menu" aria-label="Profile options">
                    <div className="navbar-dropdown-header">
                      <div className="navbar-avatar-lg">{userInitial}</div>
                      <div className="navbar-dropdown-user-info">
                        <div className="navbar-dropdown-name">{user?.name || 'QuickBite User'}</div>
                        <div className="navbar-dropdown-email">{user?.email || 'user@quickbite.com'}</div>
                        <span className="navbar-role-badge">{user?.role || 'Customer'}</span>
                      </div>
                    </div>

                    <div className="navbar-dropdown-body">
                      <div className="navbar-dropdown-group-title">Account</div>
                      
                      <Link to="/profile" className="navbar-dropdown-item" onClick={() => setProfileOpen(false)} role="menuitem">
                        <div className="dropdown-item-icon profile-icon">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                        <div className="dropdown-item-text">
                          <span className="dropdown-item-title">My Profile</span>
                          <span className="dropdown-item-desc">Personal details & contact info</span>
                        </div>
                      </Link>

                      <Link to="/orders" className="navbar-dropdown-item" onClick={() => setProfileOpen(false)} role="menuitem">
                        <div className="dropdown-item-icon orders-icon">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1" ry="1"/></svg>
                        </div>
                        <div className="dropdown-item-text">
                          <span className="dropdown-item-title">My Orders</span>
                          <span className="dropdown-item-desc">Track active orders & history</span>
                        </div>
                      </Link>

                      <Link to="/addresses" className="navbar-dropdown-item" onClick={() => setProfileOpen(false)} role="menuitem">
                        <div className="dropdown-item-icon address-icon">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        </div>
                        <div className="dropdown-item-text">
                          <span className="dropdown-item-title">Saved Addresses</span>
                          <span className="dropdown-item-desc">Home, work & delivery spots</span>
                        </div>
                      </Link>

                      <Link to="/favorites" className="navbar-dropdown-item" onClick={() => setProfileOpen(false)} role="menuitem">
                        <div className="dropdown-item-icon fav-icon">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        </div>
                        <div className="dropdown-item-text">
                          <span className="dropdown-item-title">Favourites</span>
                          <span className="dropdown-item-desc">Bookmarked dishes & spots</span>
                        </div>
                      </Link>

                      <Link to="/notifications" className="navbar-dropdown-item" onClick={() => setProfileOpen(false)} role="menuitem">
                        <div className="dropdown-item-icon notif-icon">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                        </div>
                        <div className="dropdown-item-text">
                          <span className="dropdown-item-title">Notifications</span>
                          <span className="dropdown-item-desc">Order updates & offers</span>
                        </div>
                        {unreadCount > 0 && <span className="dropdown-item-badge">{unreadCount}</span>}
                      </Link>

                      <div className="navbar-dropdown-divider" />
                      <div className="navbar-dropdown-group-title">Preferences & Support</div>

                      <Link to="/settings" className="navbar-dropdown-item" onClick={() => setProfileOpen(false)} role="menuitem">
                        <div className="dropdown-item-icon settings-icon">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                        </div>
                        <div className="dropdown-item-text">
                          <span className="dropdown-item-title">Settings</span>
                          <span className="dropdown-item-desc">Language, security & alerts</span>
                        </div>
                      </Link>

                      <Link to="/help" className="navbar-dropdown-item" onClick={() => setProfileOpen(false)} role="menuitem">
                        <div className="dropdown-item-icon help-icon">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </div>
                        <div className="dropdown-item-text">
                          <span className="dropdown-item-title">Help & Support</span>
                          <span className="dropdown-item-desc">FAQs, support & contact</span>
                        </div>
                      </Link>

                      <div className="navbar-dropdown-divider" />
                      <button className="navbar-dropdown-item danger" onClick={handleLogout} role="menuitem">
                        <div className="dropdown-item-icon logout-icon">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        </div>
                        <div className="dropdown-item-text">
                          <span className="dropdown-item-title">Sign Out</span>
                          <span className="dropdown-item-desc">Log out of your account</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              id="navbar-mobile-menu-btn"
              className={`navbar-hamburger ${mobileMenuOpen ? 'open' : ''}`}
              onClick={() => setMobileMenuOpen(p => !p)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Mobile Slide Drawer */}
        {mobileMenuOpen && (
          <div className="navbar-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="navbar-mobile-drawer" onClick={e => e.stopPropagation()}>
              {/* Mobile Location Header */}
              <div
                className="navbar-mobile-loc-row"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsLocationModalOpen(true);
                }}
              >
                <span className="loc-icon">📍</span>
                <div className="loc-info">
                  <small>Deliver to</small>
                  <strong>{deliveryLoc?.area || deliveryLoc?.city || 'Fetch Location'}</strong>
                </div>
                <span className="loc-change">Change</span>
              </div>

              {isAuthenticated ? (
                <div className="navbar-mobile-user-card">
                  <div className="navbar-avatar-lg">{userInitial}</div>
                  <div className="navbar-mobile-user-meta">
                    <div className="navbar-mobile-name">{user?.name || 'QuickBite User'}</div>
                    <div className="navbar-mobile-email">{user?.email}</div>
                    <span className="navbar-role-badge">{user?.role || 'Customer'}</span>
                  </div>
                </div>
              ) : (
                <div className="navbar-mobile-auth-card">
                  <h4>Welcome to QuickBite</h4>
                  <p>Log in or sign up for live tracking & offers</p>
                  <div className="mobile-auth-btns">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => { setMobileMenuOpen(false); openAuthModal('login'); }}
                    >
                      Log In
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => { setMobileMenuOpen(false); openAuthModal('register'); }}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              )}

              <div className="navbar-mobile-links-list">
                <Link to="/" className={`navbar-mobile-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  Home
                </Link>
                <Link to="/menu" className={`navbar-mobile-link ${location.pathname === '/menu' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  Explore Full Menu
                </Link>
                <Link to="/menu?offers=true" className="navbar-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  <span>🔥</span>
                  Offers & Deals
                </Link>
                <Link to="/cart" className={`navbar-mobile-link ${location.pathname === '/cart' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  Shopping Cart {totalItems > 0 && <span className="mobile-badge">{totalItems}</span>}
                </Link>

                {isAuthenticated && (
                  <>
                    <div className="navbar-mobile-divider" />
                    <Link to="/orders" className={`navbar-mobile-link ${location.pathname === '/orders' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1" ry="1"/></svg>
                      My Orders
                    </Link>
                    <Link to="/favorites" className={`navbar-mobile-link ${location.pathname === '/favorites' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      Favourites
                    </Link>
                    <Link to="/addresses" className={`navbar-mobile-link ${location.pathname === '/addresses' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      Saved Addresses
                    </Link>
                    <Link to="/notifications" className={`navbar-mobile-link ${location.pathname === '/notifications' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                      Notifications {unreadCount > 0 && <span className="mobile-badge">{unreadCount}</span>}
                    </Link>
                    <Link to="/profile" className={`navbar-mobile-link ${location.pathname === '/profile' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      My Profile
                    </Link>
                    <Link to="/settings" className={`navbar-mobile-link ${location.pathname === '/settings' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                      Settings
                    </Link>
                    <Link to="/help" className={`navbar-mobile-link ${location.pathname === '/help' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      Help & Support
                    </Link>
                    <div className="navbar-mobile-divider" />
                    <button className="navbar-mobile-link danger" onClick={handleLogout}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Global Location Selection Modal */}
      <LocationModal />
    </>
  );
}
