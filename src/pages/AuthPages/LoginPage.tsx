import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './AuthPages.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) { showToast('Please fill in all fields', 'error'); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
      showToast('Welcome back! Logged in successfully.', 'success');
      navigate('/');
    } catch (err: any) {
      showToast(err.message || 'Login failed. Check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="login-page" className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <img src="/logo.png" alt="QuickBite" className="auth-logo-img" />
          <span>Quick<span style={{ color: 'var(--color-primary)' }}>Bite</span></span>
        </Link>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-sub">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field">
            <label htmlFor="login-email" className="auth-label">Email Address</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <input id="login-email" type="email" className="input auth-input" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="login-password" className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input id="login-password" type={showPass ? 'text' : 'password'} className="input auth-input" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
              <button type="button" className="auth-toggle-pass" onClick={() => setShowPass(p => !p)} aria-label={showPass ? 'Hide password' : 'Show password'}>
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <button id="login-submit-btn" type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Sign Up Free</Link>
        </div>
      </div>
    </main>
  );
}
