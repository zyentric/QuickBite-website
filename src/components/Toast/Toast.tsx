import React from 'react';
import { useToast } from '../../context/ToastContext';
import './Toast.css';

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`} role="alert">
          <div className="toast-icon-wrap">
            {t.type === 'success' && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
              </svg>
            )}
            {t.type === 'error' && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            )}
            {(t.type === 'info' || t.type === 'order') && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
          </div>
          <div className="toast-body">
            <p className="toast-msg">{t.message}</p>
            {t.sub && <p className="toast-sub">{t.sub}</p>}
          </div>
          <button className="toast-close" onClick={() => dismissToast(t.id)} aria-label="Dismiss notification">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
