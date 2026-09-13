import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/menu?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => { logout(); setProfileOpen(false); navigate('/'); };

  return (
    <nav className="navbar" role="navigation">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" aria-label="QuickBite Home">
          <img src="/logo.png" alt="QuickBite" className="navbar-logo-img" />
          <span className="navbar-logo-text">Quick<span>Bite</span></span>
        </Link>

        {/* Search Bar */}
        <form className="navbar-search" onSubmit={handleSearch} role="search">
          <div className="navbar-search-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            id="navbar-search-input"
            className="navbar-search-input"
            type="search"
            placeholder="Search dishes, restaurants..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search dishes and restaurants"
          />
          <button type="submit" className="navbar-search-btn" aria-label="Search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </form>

        {/* Right Actions */}
        <div className="navbar-actions">
          <Link to="/menu" className={`navbar-link ${location.pathname === '/menu' ? 'active' : ''}`}>
            Menu
          </Link>

          {/* Cart Button */}
          <Link to="/cart" className="navbar-cart-btn" id="navbar-cart" aria-label={`Cart with ${totalItems} items`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {totalItems > 0 && <span className="navbar-cart-badge">{totalItems > 99 ? '99+' : totalItems}</span>}
          </Link>

          {/* Auth */}
          {!isAuthenticated ? (
            <div className="navbar-auth-btns">
              <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          ) : (
            <div className="navbar-profile-wrapper">
              <button
                id="navbar-profile-btn"
                className="navbar-profile-btn"
                onClick={() => setProfileOpen(p => !p)}
                aria-haspopup="true"
                aria-expanded={profileOpen}
              >
                <div className="navbar-avatar">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="navbar-profile-name">{user?.name?.split(' ')[0]}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>

              {profileOpen && (
                <div className="navbar-dropdown" role="menu">
                  <div className="navbar-dropdown-header">
                    <div className="navbar-avatar-lg">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
                    <div>
                      <div className="navbar-dropdown-name">{user?.name}</div>
                      <div className="navbar-dropdown-email">{user?.email}</div>
                    </div>
                  </div>
                  <div className="navbar-dropdown-divider" />
                  <Link to="/orders" className="navbar-dropdown-item" onClick={() => setProfileOpen(false)} role="menuitem">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1" ry="1"/></svg>
                    My Orders
                  </Link>
                  <Link to="/profile" className="navbar-dropdown-item" onClick={() => setProfileOpen(false)} role="menuitem">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    My Profile
                  </Link>
                  <div className="navbar-dropdown-divider" />
                  <button className="navbar-dropdown-item danger" onClick={handleLogout} role="menuitem">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            id="navbar-mobile-menu-btn"
            className="navbar-hamburger"
            onClick={() => setMenuOpen(p => !p)}
            aria-label="Toggle mobile menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar-mobile-menu">
          <Link to="/" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/menu" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>Full Menu</Link>
          <Link to="/cart" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>Cart {totalItems > 0 && `(${totalItems})`}</Link>
          {isAuthenticated ? (
            <>
              <Link to="/orders" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>My Orders</Link>
              <Link to="/profile" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button className="navbar-mobile-link danger" onClick={() => { logout(); setMenuOpen(false); }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>Log In</Link>
              <Link to="/register" className="navbar-mobile-link highlight" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}

      {/* Backdrop for dropdown */}
      {profileOpen && <div className="navbar-backdrop" onClick={() => setProfileOpen(false)} />}
    </nav>
  );
}
