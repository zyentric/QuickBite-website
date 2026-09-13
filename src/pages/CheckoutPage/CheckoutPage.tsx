import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [addr, setAddr] = useState({ street: '', city: '', zip: '' });
  const [payMethod, setPayMethod] = useState<'cod' | 'online'>('cod');
  const [loading, setLoading] = useState(false);

  const taxes = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + taxes;

  if (!isAuthenticated) { navigate('/login'); return null; }
  if (cartItems.length === 0) { navigate('/cart'); return null; }

  const handlePlaceOrder = async () => {
    if (!addr.street.trim() || !addr.city.trim()) { showToast('Please fill in your delivery address', 'error'); return; }
    setLoading(true);
    try {
      const orderPayload = {
        items: cartItems.map(i => ({
          menuItem: i.id || i._id,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount: grandTotal,
        deliveryAddress: { address: `${addr.street}, ${addr.city}${addr.zip ? ' - ' + addr.zip : ''}` },
        paymentMethod: payMethod,
        paymentStatus: payMethod === 'cod' ? 'Pending' : 'Paid',
      };
      const res = await api.orders.create(orderPayload);
      clearCart();
      showToast('Order placed successfully! 🎉', 'success', `Your order #${res?.orderNumber || ''} has been placed.`);
      navigate('/orders');
    } catch (err: any) {
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <main id="checkout-page" className="checkout-page">
      <div className="container checkout-body">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-layout">
          {/* Left: Form */}
          <div className="checkout-form-col">
            {/* Delivery Address */}
            <div className="checkout-card">
              <h2 className="checkout-card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Delivery Address
              </h2>
              <div className="checkout-field">
                <label htmlFor="checkout-street" className="checkout-label">Street / Landmark *</label>
                <input id="checkout-street" type="text" className="input" placeholder="House no., Street, Area..." value={addr.street} onChange={e => setAddr(a => ({ ...a, street: e.target.value }))} required />
              </div>
              <div className="checkout-row">
                <div className="checkout-field">
                  <label htmlFor="checkout-city" className="checkout-label">City *</label>
                  <input id="checkout-city" type="text" className="input" placeholder="City" value={addr.city} onChange={e => setAddr(a => ({ ...a, city: e.target.value }))} required />
                </div>
                <div className="checkout-field">
                  <label htmlFor="checkout-zip" className="checkout-label">PIN Code</label>
                  <input id="checkout-zip" type="text" className="input" placeholder="4XXXXX" value={addr.zip} onChange={e => setAddr(a => ({ ...a, zip: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="checkout-card">
              <h2 className="checkout-card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                Payment Method
              </h2>
              <div className="checkout-pay-options">
                {[
                  { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when your order arrives', icon: '💵' },
                  { id: 'online', label: 'Online Payment', sub: 'UPI, Cards, Wallets (coming soon)', icon: '💳' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    id={`checkout-pay-${opt.id}`}
                    className={`checkout-pay-opt ${payMethod === opt.id ? 'active' : ''}`}
                    onClick={() => setPayMethod(opt.id as 'cod' | 'online')}
                    aria-pressed={payMethod === opt.id}
                  >
                    <span className="checkout-pay-icon">{opt.icon}</span>
                    <div>
                      <div className="checkout-pay-label">{opt.label}</div>
                      <div className="checkout-pay-sub">{opt.sub}</div>
                    </div>
                    {payMethod === opt.id && (
                      <svg className="checkout-pay-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="checkout-summary-col">
            <div className="checkout-summary-card">
              <h2 className="checkout-card-title">Order Summary</h2>
              <div className="checkout-items">
                {cartItems.map(item => (
                  <div key={item.id} className="checkout-item-row">
                    <span className="checkout-item-name">{item.quantity}× {item.name}</span>
                    <span className="checkout-item-price">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="checkout-summary-divider" />
              <div className="checkout-summary-rows">
                <div className="checkout-sum-row"><span>Subtotal</span><span>₹{totalPrice.toFixed(0)}</span></div>
                <div className="checkout-sum-row"><span>Delivery</span><span className="checkout-free">FREE</span></div>
                <div className="checkout-sum-row"><span>GST (5%)</span><span>₹{taxes}</span></div>
              </div>
              <div className="checkout-summary-divider" />
              <div className="checkout-sum-total"><span>Total</span><span>₹{grandTotal.toFixed(0)}</span></div>

              <button
                id="checkout-place-order-btn"
                className="btn btn-primary checkout-place-btn"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? <span className="auth-spinner" /> : null}
                {loading ? 'Placing Order...' : `Place Order — ₹${grandTotal.toFixed(0)}`}
              </button>

              <div className="checkout-secure">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Secure & encrypted payment
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
