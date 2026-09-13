import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import './CartPage.css';

const FALLBACK = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=200&auto=format&fit=crop';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { showToast } = useToast();

  const deliveryFee = 0;
  const taxes = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + deliveryFee + taxes;

  if (cartItems.length === 0) {
    return (
      <main id="cart-page" className="cart-page">
        <div className="container cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some delicious items from our menu</p>
          <button className="btn btn-primary" onClick={() => navigate('/menu')} id="cart-browse-menu-btn">
            Browse Menu
          </button>
        </div>
      </main>
    );
  }

  return (
    <main id="cart-page" className="cart-page">
      <div className="container cart-body">
        {/* Header */}
        <div className="cart-header">
          <h1 className="cart-title">My Cart</h1>
          <span className="cart-count">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items-col">
            {cartItems.map(item => (
              <div key={item.id || item._id} className="cart-item">
                <img
                  src={item.image || FALLBACK}
                  alt={item.name}
                  className="cart-item-img"
                  onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }}
                />
                <div className="cart-item-info">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <p className="cart-item-price">₹{item.price} × {item.quantity}</p>
                  <p className="cart-item-subtotal">₹{(item.price * item.quantity).toFixed(0)}</p>
                </div>
                <div className="cart-item-actions">
                  <div className="cart-qty-ctrl">
                    <button
                      className="cart-qty-btn"
                      onClick={() => updateQuantity(item.id || item._id!, item.quantity - 1)}
                      id={`cart-decrease-${item.id}`}
                      aria-label="Decrease quantity"
                    >−</button>
                    <span className="cart-qty-num">{item.quantity}</span>
                    <button
                      className="cart-qty-btn"
                      onClick={() => updateQuantity(item.id || item._id!, item.quantity + 1)}
                      id={`cart-increase-${item.id}`}
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                  <button
                    className="cart-remove-btn"
                    onClick={() => { removeFromCart(item.id || item._id!); showToast(`${item.name} removed`, 'info'); }}
                    id={`cart-remove-${item.id}`}
                    aria-label="Remove item"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* Clear Cart */}
            <button
              className="cart-clear-btn"
              onClick={() => { clearCart(); showToast('Cart cleared', 'info'); }}
              id="cart-clear-btn"
            >
              Clear All Items
            </button>
          </div>

          {/* Bill Summary */}
          <div className="cart-summary-col">
            <div className="cart-summary-card">
              <h2 className="cart-summary-title">Order Summary</h2>

              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{totalPrice.toFixed(0)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Delivery Fee</span>
                  <span className="cart-free">FREE</span>
                </div>
                <div className="cart-summary-row">
                  <span>GST & Taxes (5%)</span>
                  <span>₹{taxes}</span>
                </div>
                <div className="cart-summary-divider" />
                <div className="cart-summary-row cart-summary-total">
                  <span>Total Amount</span>
                  <span>₹{grandTotal.toFixed(0)}</span>
                </div>
              </div>

              <div className="cart-savings">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                You're saving ₹0 on delivery!
              </div>

              <button
                id="cart-checkout-btn"
                className="btn btn-primary cart-checkout-btn"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout — ₹{grandTotal.toFixed(0)}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
              </button>

              <Link to="/menu" className="cart-continue-link">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
