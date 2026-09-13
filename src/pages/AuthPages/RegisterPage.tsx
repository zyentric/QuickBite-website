import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './AuthPages.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { showToast('Please fill in all required fields', 'error'); return; }
    if (form.password !== form.confirmPassword) { showToast('Passwords do not match', 'error'); return; }
    if (form.password.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, phone: form.phone || undefined });
      showToast('Account created! Welcome to QuickBite!', 'success');
      navigate('/');
    } catch (err: any) {
      showToast(err.message || 'Registration failed. Try again.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <main id="register-page" className="auth-page">
      <div className="auth-card auth-card--wide">
        <Link to="/" className="auth-logo">
          <img src="/logo.png" alt="QuickBite" className="auth-logo-img" />
          <span>Quick<span style={{ color: 'var(--color-primary)' }}>Bite</span></span>
        </Link>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-sub">Join QuickBite and order your favourite food</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-form-row">
            <div className="auth-field">
              <label htmlFor="reg-name" className="auth-label">Full Name *</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input id="reg-name" type="text" className="input auth-input" placeholder="Your full name" value={form.name} onChange={set('name')} required />
              </div>
            </div>
            <div className="auth-field">
              <label htmlFor="reg-phone" className="auth-label">Phone Number</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.32 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <input id="reg-phone" type="tel" className="input auth-input" placeholder="+91 99999 99999" value={form.phone} onChange={set('phone')} />
              </div>
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="reg-email" className="auth-label">Email Address *</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <input id="reg-email" type="email" className="input auth-input" placeholder="your@email.com" value={form.email} onChange={set('email')} required />
            </div>
          </div>

          <div className="auth-form-row">
            <div className="auth-field">
              <label htmlFor="reg-password" className="auth-label">Password *</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input id="reg-password" type={showPass ? 'text' : 'password'} className="input auth-input" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
                <button type="button" className="auth-toggle-pass" onClick={() => setShowPass(p => !p)} aria-label="Toggle password">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
            <div className="auth-field">
              <label htmlFor="reg-confirm" className="auth-label">Confirm Password *</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input id="reg-confirm" type={showPass ? 'text' : 'password'} className="input auth-input" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
              </div>
            </div>
          </div>

          <button id="register-submit-btn" type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
        </div>
      </div>
    </main>
  );
}
