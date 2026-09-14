import { useNavigate, Link } from 'react-router-dom';
import { useCart, getItemKey } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import './CartPage.css';

const FALLBACK = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=200&auto=format&fit=crop';
const FREE_DELIVERY_THRESHOLD = 499;

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { showToast } = useToast();

  const isFreeDelivery = totalPrice >= FREE_DELIVERY_THRESHOLD;
  const remainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - totalPrice);
  const deliveryFee = isFreeDelivery ? 0 : 25;
  const taxesAndCharges = Math.round(totalPrice * 0.05) + 5; // 5% GST + ₹5 packaging
  const grandTotal = totalPrice + deliveryFee + taxesAndCharges;

  if (cartItems.length === 0) {
    return (
      <main id="cart-page" className="cart-page">
        <div className="container cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Explore our menu and add delicious dishes to satisfy your cravings</p>
          <button className="btn btn-primary cart-empty-btn" onClick={() => navigate('/menu')} id="cart-browse-menu-btn">
            Browse Menu
          </button>
        </div>
      </main>
    );
  }

  const freeDeliveryProgress = Math.min(100, Math.round((totalPrice / FREE_DELIVERY_THRESHOLD) * 100));

  return (
    <main id="cart-page" className="cart-page">
      <div className="container cart-body">
        {/* Header */}
        <div className="cart-header">
          <div>
            <h1 className="cart-title">Your Order Cart</h1>
            <p className="cart-subtitle">Review your items before proceeding to checkout</p>
          </div>
          <span className="cart-count-badge">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
        </div>

        {/* Free Delivery Bar */}
        <div className={`cart-free-del-bar ${isFreeDelivery ? 'unlocked' : ''}`}>
          <div className="cart-free-del-header">
            <span>
              {isFreeDelivery ? '🎉 You have unlocked FREE Delivery!' : `Add ₹${remainingForFreeDelivery} more for FREE Delivery`}
            </span>
            <span className="cart-free-del-percent">{freeDeliveryProgress}%</span>
          </div>
          <div className="cart-free-del-track">
            <div className="cart-free-del-fill" style={{ width: `${freeDeliveryProgress}%` }} />
          </div>
        </div>

        <div className="cart-layout">
          {/* Left: Items List */}
          <div className="cart-items-col">
            <div className="cart-items-card">
              <div className="cart-items-card-header">
                <span className="cart-card-title">Items in Cart ({cartItems.length})</span>
                <button
                  className="cart-clear-btn"
                  onClick={() => { clearCart(); showToast('Cart cleared', 'info'); }}
                  id="cart-clear-btn"
                >
                  Clear Cart
                </button>
              </div>

              <div className="cart-items-list">
                {cartItems.map(item => {
                  const itemKey = getItemKey(item);
                  return (
                    <div key={itemKey} className="cart-item">
                      <img
                        src={item.image || FALLBACK}
                        alt={item.name}
                        className="cart-item-img"
                        onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }}
                      />
                      <div className="cart-item-info">
                        <h3 className="cart-item-name">{item.name}</h3>
                        <p className="cart-item-unit-price">₹{item.price} per item</p>
                        <p className="cart-item-subtotal">₹{(item.price * item.quantity).toFixed(0)}</p>
                      </div>

                      <div className="cart-item-actions">
                        <div className="cart-qty-ctrl">
                          <button
                            className="cart-qty-btn"
                            onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                            id={`cart-decrease-${itemKey}`}
                            aria-label="Decrease quantity"
                          >−</button>
                          <span className="cart-qty-num">{item.quantity}</span>
                          <button
                            className="cart-qty-btn"
                            onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                            id={`cart-increase-${itemKey}`}
                            aria-label="Increase quantity"
                          >+</button>
                        </div>

                        <button
                          className="cart-remove-btn"
                          onClick={() => { removeFromCart(itemKey); showToast(`${item.name} removed`, 'info'); }}
                          id={`cart-remove-${itemKey}`}
                          aria-label="Remove item"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Guarantee Card */}
            <div className="cart-guarantee-card">
              <div className="cart-guarantee-item">
                <span className="cart-guarantee-icon">⚡</span>
                <div>
                  <strong>Superfast Delivery</strong>
                  <p>Hot & fresh meals at your doorstep in 25–35 minutes</p>
                </div>
              </div>
              <div className="cart-guarantee-item">
                <span className="cart-guarantee-icon">🛡️</span>
                <div>
                  <strong>Safe & Hygienic</strong>
                  <p>FSSAI certified partner kitchens & sanitized packaging</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Bill Summary */}
          <div className="cart-summary-col">
            <div className="cart-summary-card">
              <h2 className="cart-summary-title">Bill Details</h2>

              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span>Item Total</span>
                  <span>₹{totalPrice.toFixed(0)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Delivery Fee</span>
                  <span>{isFreeDelivery ? <span className="cart-free">FREE</span> : `₹${deliveryFee}`}</span>
                </div>
                <div className="cart-summary-row">
                  <span>GST & Packaging Charges</span>
                  <span>₹{taxesAndCharges}</span>
                </div>
                <div className="cart-summary-divider" />
                <div className="cart-summary-row cart-summary-total">
                  <span>To Pay</span>
                  <span>₹{grandTotal.toFixed(0)}</span>
                </div>
              </div>

              {isFreeDelivery && (
                <div className="cart-savings-pill">
                  🎉 Free delivery applied on orders above ₹{FREE_DELIVERY_THRESHOLD}!
                </div>
              )}

              <button
                id="cart-checkout-btn"
                className="btn btn-primary cart-checkout-btn"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout • ₹{grandTotal.toFixed(0)}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
              </button>

              <Link to="/menu" className="cart-continue-link">← Add More Items from Menu</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
