import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src="/logo.png" alt="QuickBite" className="footer-logo-img" />
              <span className="footer-logo-text">Quick<span>Bite</span></span>
            </Link>
            <p className="footer-tagline">Fresh meals delivered in snaps. Quality food from the best local kitchens, at your doorstep in 20–30 minutes.</p>
            <div className="footer-trust">
              <span className="footer-trust-badge">FSSAI Certified</span>
              <span className="footer-trust-badge">ISO 9001</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Explore</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/menu">Full Menu</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/profile">My Profile</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h4 className="footer-col-title">Support</h4>
            <ul className="footer-links">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Track Order</a></li>
              <li><a href="#">Refund Policy</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Use</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contact</h4>
            <ul className="footer-links">
              <li>
                <a href="mailto:support@quickbite.app">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  support@quickbite.app
                </a>
              </li>
              <li>
                <a href="tel:+919999999999">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  +91 99999 99999
                </a>
              </li>
              <li style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Mon–Sun: 8:00 AM – 11:00 PM
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} QuickBite. All rights reserved. Crafted with passion for authentic taste &amp; great memories.
          </p>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
