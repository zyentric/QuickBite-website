import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './SettingsPage.css';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, logout, changePassword } = useAuth();
  const { showToast } = useToast();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const [showPw, setShowPw] = useState(false);

  if (!isLoading && !isAuthenticated) { navigate('/login'); return null; }

  const handleChangePw = async () => {
    if (!currentPw || !newPw || !confirmPw) { showToast('Please fill in all fields', 'error'); return; }
    if (newPw !== confirmPw) { showToast('New passwords do not match', 'error'); return; }
    if (newPw.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
    setChangingPw(true);
    try {
      await changePassword(currentPw, newPw);
      showToast('Password changed successfully!', 'success');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: any) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally { setChangingPw(false); }
  };

  return (
    <main id="settings-page" className="settings-page">
      <div className="container settings-body">
        <div className="settings-header">
          <button className="settings-back" onClick={() => navigate('/profile')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
            Profile
          </button>
          <h1 className="settings-title">Settings</h1>
        </div>

        {/* Change Password */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon">🔒</span>
            <div>
              <h2 className="settings-card-title">Change Password</h2>
              <p className="settings-card-sub">Update your account password</p>
            </div>
          </div>

          <div className="settings-form">
            <div className="form-field">
              <label htmlFor="settings-current-pw" className="form-label">Current Password</label>
              <div className="pw-input-wrap">
                <input
                  id="settings-current-pw"
                  className="input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="settings-new-pw" className="form-label">New Password</label>
              <input
                id="settings-new-pw"
                className="input"
                type={showPw ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="settings-confirm-pw" className="form-label">Confirm New Password</label>
              <input
                id="settings-confirm-pw"
                className="input"
                type={showPw ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
              />
            </div>
            <label className="settings-show-pw" htmlFor="settings-show-pw-toggle">
              <input id="settings-show-pw-toggle" type="checkbox" checked={showPw} onChange={() => setShowPw(s => !s)} />
              <span>Show passwords</span>
            </label>
            <button
              className="btn btn-primary settings-submit-btn"
              onClick={handleChangePw}
              disabled={changingPw}
              id="settings-change-pw-btn"
            >
              {changingPw ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>

        {/* Links */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon">📄</span>
            <div>
              <h2 className="settings-card-title">Legal</h2>
            </div>
          </div>
          <div className="settings-links">
            <a className="settings-link-item" href="https://quickbite.com/terms" target="_blank" rel="noopener noreferrer" id="settings-terms-link">
              <span>Terms & Conditions</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </a>
            <a className="settings-link-item" href="https://quickbite.com/privacy" target="_blank" rel="noopener noreferrer" id="settings-privacy-link">
              <span>Privacy Policy</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </a>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-card danger-card">
          <button className="settings-logout-btn" onClick={() => { logout(); navigate('/'); }} id="settings-logout-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
