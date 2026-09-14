import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import logoImg from '../../assets/logo.png';
import './AuthModal.css';

export default function AuthModal() {
  const { isAuthModalOpen, authModalTab, closeAuthModal, login, register } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTab(authModalTab);
    setError('');
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        if (!email.trim() || !password) {
          setError('Please enter both email and password.');
          setLoading(false);
          return;
        }
        await login(email.trim(), password);
        showToast('Logged in successfully! Welcome back.', 'success');
      } else {
        if (!name.trim() || !email.trim() || !password) {
          setError('Please fill all required fields.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
        });
        showToast('Account created successfully! Welcome to QuickBite.', 'success');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('customer@quickbite.com');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="auth-modal-overlay" onClick={closeAuthModal} role="dialog" aria-modal="true">
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="auth-modal-close"
          onClick={closeAuthModal}
          aria-label="Close auth modal"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Left Side: Brand Banner (QuickBite Brand Identity) */}
        <div className="auth-modal-banner">
          <div className="auth-banner-header">
            <div className="auth-banner-logo">
              <img src={logoImg} alt="QuickBite" />
              <span>Quick<span>Bite</span></span>
            </div>
            <h2>{tab === 'login' ? 'Welcome Back!' : 'Join QuickBite'}</h2>
            <p>
              {tab === 'login'
                ? 'Get access to your Orders, Wishlist, Saved Addresses & Instant Checkout.'
                : 'Sign up to discover the best food deals, live tracking & 20-min delivery.'}
            </p>
          </div>

          <div className="auth-banner-features">
            <div className="auth-feature-item">
              <span className="auth-feature-icon">⚡</span>
              <div>
                <strong>Superfast Delivery</strong>
                <span>Hot meals delivered in 20–30 mins</span>
              </div>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon">🎁</span>
              <div>
                <strong>Exclusive Discounts</strong>
                <span>Up to 50% OFF with code QUICK30</span>
              </div>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon">📍</span>
              <div>
                <strong>Live Order Tracking</strong>
                <span>Real-time GPS updates from kitchen to door</span>
              </div>
            </div>
          </div>

          <div className="auth-banner-footer-note">
            <span>⭐ Trusted by 50,000+ happy food lovers</span>
          </div>
        </div>

        {/* Right Side: Consistent Form Container */}
        <div className="auth-modal-form-side">
          {/* Tab Switcher */}
          <div className="auth-modal-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setError(''); }}
            >
              Log In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
              onClick={() => { setTab('register'); setError(''); }}
            >
              Sign Up
            </button>
          </div>

          {error && <div className="auth-modal-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-modal-form">
            {tab === 'register' ? (
              <>
                <div className="auth-input-group">
                  <label htmlFor="auth-name">Full Name *</label>
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <label htmlFor="auth-phone">Phone Number</label>
                  <input
                    id="auth-phone"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="auth-input-group">
                  <label htmlFor="auth-email">Email Address *</label>
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <label htmlFor="auth-password">Password *</label>
                  <input
                    id="auth-password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="auth-input-group">
                  <label htmlFor="auth-email">Email Address *</label>
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <label htmlFor="auth-password">Password *</label>
                  <input
                    id="auth-password"
                    type="password"
                    placeholder="Enter password (min. 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-demo-hint">
                  <button
                    type="button"
                    className="auth-demo-fill-btn"
                    onClick={handleDemoFill}
                  >
                    ⚡ Auto-fill Demo Account
                  </button>
                </div>
              </>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
              id="auth-modal-submit-btn"
            >
              {loading ? (
                <span className="auth-spinner" />
              ) : tab === 'login' ? (
                'Log In to QuickBite'
              ) : (
                'Create Account & Start Ordering'
              )}
            </button>
          </form>

          <div className="auth-modal-footer">
            {tab === 'login' ? (
              <p>
                New to QuickBite?{' '}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => { setTab('register'); setError(''); }}
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Existing User?{' '}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => { setTab('login'); setError(''); }}
                >
                  Log In
                </button>
              </p>
            )}
            <button
              type="button"
              className="auth-guest-link"
              onClick={closeAuthModal}
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
