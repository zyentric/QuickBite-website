import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HelpPage.css';

const FAQS = [
  { q: 'How do I track my order?', a: 'Go to My Orders and tap on any active order to see real-time tracking with a step-by-step progress indicator showing Placed, Preparing, Out for Delivery, and Delivered stages.' },
  { q: 'Can I cancel my order?', a: 'Yes! You can cancel your order as long as the restaurant hasn\'t started preparing it. Go to My Orders → tap the order → Cancel Order. Orders in "Preparing" or later stages cannot be cancelled.' },
  { q: 'What payment methods are accepted?', a: 'We accept Cash on Delivery (COD), UPI, Debit/Credit Cards, and Net Banking. Online payment options are available at checkout.' },
  { q: 'How do I add a saved address?', a: 'Go to Profile → Saved Addresses → Add New. You can save multiple addresses (Home, Work, etc.) and set a default for faster checkout.' },
  { q: 'How do I change my password?', a: 'Go to Profile → Settings → Change Password. You\'ll need to enter your current password and then set a new one.' },
  { q: 'How do I leave a review?', a: 'After your order is delivered, open the order from My Orders and tap "Leave a Review". Rate your experience from 1 to 5 stars and write a comment.' },
  { q: 'What if my food is wrong or missing items?', a: 'Please contact our support team immediately through the Help page. We\'ll arrange a replacement or refund as quickly as possible.' },
  { q: 'How are delivery charges calculated?', a: 'Delivery charges depend on your distance from the restaurant. Most orders within 3km are free. Orders over ₹500 also get free delivery.' },
  { q: 'Can I reorder a previous order?', a: 'Yes! Go to My Orders, open any completed order, and tap the "Reorder" button to add all the same items to your cart instantly.' },
  { q: 'How do I add items to favorites?', a: 'Tap the heart icon on any food item or food detail page. All your favorites are saved to your Favorites page for quick access.' },
];

export default function HelpPage() {
  const navigate = useNavigate();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => setOpenIdx(prev => prev === idx ? null : idx);

  return (
    <main id="help-page" className="help-page">
      <div className="container help-body">
        {/* Header */}
        <div className="help-header">
          <button className="help-back" onClick={() => navigate(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
            Back
          </button>
          <div className="help-header-text">
            <h1 className="help-title">Help Center</h1>
            <p className="help-sub">Find answers to common questions</p>
          </div>
        </div>

        {/* Search hint */}
        <div className="help-hero">
          <div className="help-hero-icon">🙋</div>
          <h2>How can we help you?</h2>
          <p>Browse our FAQs below or contact us directly</p>
        </div>

        {/* FAQ Accordion */}
        <div className="help-section">
          <h2 className="help-section-title">Frequently Asked Questions</h2>
          <div className="help-faq-list">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className={`help-faq-item ${openIdx === idx ? 'open' : ''}`}
                id={`faq-item-${idx}`}
              >
                <button
                  className="help-faq-question"
                  onClick={() => toggle(idx)}
                  aria-expanded={openIdx === idx}
                  id={`faq-toggle-${idx}`}
                >
                  <span>{faq.q}</span>
                  <svg
                    className="help-faq-chevron"
                    width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ transform: openIdx === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                  >
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                <div className={`help-faq-answer ${openIdx === idx ? 'open' : ''}`}>
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Us */}
        <div className="help-contact-card">
          <div className="help-contact-header">
            <span className="help-contact-icon">📞</span>
            <div>
              <h2 className="help-contact-title">Still need help?</h2>
              <p className="help-contact-sub">Our support team is here for you 24/7</p>
            </div>
          </div>
          <div className="help-contact-methods">
            <a className="help-contact-btn" href="mailto:support@quickbite.com" id="help-email-btn">
              <span>✉️</span>
              <div>
                <div className="help-contact-method-title">Email Support</div>
                <div className="help-contact-method-val">support@quickbite.com</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </a>
            <a className="help-contact-btn" href="tel:+918001234567" id="help-phone-btn">
              <span>📱</span>
              <div>
                <div className="help-contact-method-title">Phone Support</div>
                <div className="help-contact-method-val">+91 800 123 4567</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
