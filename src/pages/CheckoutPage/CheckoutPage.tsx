import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, getItemKey } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { DeliveryAddress } from '../../types';
import './CheckoutPage.css';

const AVAILABLE_COUPONS = [
  { code: 'QUICK50', label: 'Flat ₹50 OFF', desc: 'On orders above ₹199', minOrder: 199, discount: 50, type: 'flat' as const },
  { code: 'WELCOME', label: '20% OFF', desc: 'Up to ₹100 for your order', minOrder: 149, discount: 0.20, maxDiscount: 100, type: 'percent' as const },
  { code: 'FEAST25', label: '25% OFF', desc: 'Up to ₹150 on orders above ₹399', minOrder: 399, discount: 0.25, maxDiscount: 150, type: 'percent' as const },
  { code: 'FREEDEL', label: 'FREE Delivery', desc: 'Enjoy zero delivery charge', minOrder: 99, discount: 25, type: 'free_delivery' as const },
];

const DELIVERY_INSTRUCTIONS = [
  '🚪 Leave at door',
  '🔕 Do not ring bell',
  '📞 Call upon arrival',
  '🤝 Hand to me directly',
  '🏢 Leave at reception / guard',
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart } = useCart();
  const { isAuthenticated, user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const isOrderSubmitting = useRef(false);

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string>('custom');
  const [isAddingNewAddr, setIsAddingNewAddr] = useState(false);
  const [customAddr, setCustomAddr] = useState({
    label: 'Home',
    street: '',
    city: '',
    zip: '',
    saveToProfile: false,
  });

  // Delivery Speed & Instructions
  const [deliverySpeed, setDeliverySpeed] = useState<'standard' | 'express'>('standard');
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([]);
  const [specialNotes, setSpecialNotes] = useState('');

  // Coupons
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<typeof AVAILABLE_COUPONS[0] | null>(null);

  // Payment
  const [payMethod, setPayMethod] = useState<'cod' | 'upi' | 'card' | 'wallet'>('cod');
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  // Auto-detect location
  const handleFetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    setLocating(true);
    showToast('Detecting your location...', 'info');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const streetName = [addr.road || addr.street, addr.suburb || addr.neighbourhood].filter(Boolean).join(', ');
            setCustomAddr(prev => ({
              ...prev,
              street: streetName || data.display_name?.split(',').slice(0, 2).join(',') || '',
              city: addr.city || addr.town || addr.village || addr.city_district || '',
              zip: addr.postcode || '',
            }));
            showToast('Address detected from GPS! 📍', 'success');
          }
        } catch {
          showToast('GPS coordinates fetched. Please verify address.', 'info');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        showToast('Location permission denied or unavailable', 'error');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Only redirect to cart if user is not in the middle of submitting an order
    if (cartItems.length === 0 && !isOrderSubmitting.current && !loading) {
      navigate('/cart');
      return;
    }

    // Load saved addresses
    const loadAddresses = async () => {
      try {
        const profile = await api.auth.getProfile();
        const addrs = profile?.savedAddresses || user?.savedAddresses || [];
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          const defaultAddr = addrs.find((a: DeliveryAddress) => a.isDefault) || addrs[0];
          setSelectedAddrId(defaultAddr.id || defaultAddr._id || '0');
        }
      } catch {
        const addrs = user?.savedAddresses || [];
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          setSelectedAddrId(addrs[0].id || addrs[0]._id || '0');
        }
      }
    };
    loadAddresses();
  }, [isAuthenticated, cartItems.length]);

  // Financial Calculations
  const isFreeDeliveryEligible = totalPrice >= 499 || appliedCoupon?.type === 'free_delivery';
  const baseDeliveryFee = isFreeDeliveryEligible ? 0 : 25;
  const speedFee = deliverySpeed === 'express' ? 15 : 0;
  const deliveryFee = baseDeliveryFee + speedFee;
  const taxesAndCharges = Math.round(totalPrice * 0.05) + 5; // 5% GST + ₹5 packaging

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'flat') {
      discountAmount = appliedCoupon.discount;
    } else if (appliedCoupon.type === 'percent') {
      discountAmount = Math.min(Math.round(totalPrice * appliedCoupon.discount), appliedCoupon.maxDiscount || 100);
    } else if (appliedCoupon.type === 'free_delivery') {
      discountAmount = 25;
    }
  }
  const grandTotal = Math.max(0, totalPrice + deliveryFee + taxesAndCharges - (appliedCoupon?.type === 'free_delivery' ? 0 : discountAmount));

  // Handle Coupon Apply
  const handleApplyCoupon = (coupon: typeof AVAILABLE_COUPONS[0]) => {
    if (totalPrice < coupon.minOrder) {
      showToast(`Minimum order amount for ${coupon.code} is ₹${coupon.minOrder}`, 'error');
      return;
    }
    setAppliedCoupon(coupon);
    setCouponCode(coupon.code);
    showToast(`Coupon "${coupon.code}" applied! You saved ₹${coupon.type === 'free_delivery' ? 25 : (coupon.type === 'flat' ? coupon.discount : Math.min(Math.round(totalPrice * coupon.discount), coupon.maxDiscount || 100))}`, 'success');
  };

  const handleApplyCustomCode = () => {
    const code = couponCode.trim().toUpperCase();
    const found = AVAILABLE_COUPONS.find(c => c.code === code);
    if (!found) {
      showToast('Invalid coupon code', 'error');
      return;
    }
    handleApplyCoupon(found);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    showToast('Coupon removed', 'info');
  };

  const toggleInstruction = (inst: string) => {
    setSelectedInstructions(prev =>
      prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst]
    );
  };

  // Place Order Execution
  const handlePlaceOrder = async () => {
    // Validate delivery address
    let activeAddressPayload: any = null;

    if (selectedAddrId !== 'custom' && savedAddresses.length > 0) {
      const selected = savedAddresses.find(a => (a.id || a._id) === selectedAddrId);
      if (selected) {
        activeAddressPayload = {
          label: selected.label || 'Home',
          addressLine1: selected.addressLine1,
          addressLine2: selected.addressLine2 || '',
          city: selected.city,
          zipCode: selected.zipCode,
          latitude: selected.latitude,
          longitude: selected.longitude,
          formattedAddress: [selected.addressLine1, selected.addressLine2, selected.city, selected.zipCode].filter(Boolean).join(', ')
        };
      }
    }

    if (!activeAddressPayload) {
      if (!customAddr.street.trim() || !customAddr.city.trim()) {
        showToast('Please enter your complete delivery street and city', 'error');
        return;
      }
      activeAddressPayload = {
        label: customAddr.label,
        addressLine1: customAddr.street,
        city: customAddr.city,
        zipCode: customAddr.zip,
        formattedAddress: `${customAddr.street}, ${customAddr.city} - ${customAddr.zip}`,
      };

      // If user checked save to profile
      if (customAddr.saveToProfile) {
        try {
          await api.addresses.add({
            label: customAddr.label,
            addressLine1: customAddr.street,
            city: customAddr.city,
            zipCode: customAddr.zip,
          });
          refreshUser();
        } catch { /* noop */ }
      }
    }

    // Validate payment fields if online
    if (payMethod === 'upi' && !upiId.trim() && selectedUpiApp === 'custom') {
      showToast('Please enter a valid UPI ID (e.g. name@okhdfcbank)', 'error');
      return;
    }

    if (payMethod === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      showToast('Please complete all card payment fields', 'error');
      return;
    }

    isOrderSubmitting.current = true;
    setLoading(true);
    try {
      const isCod = payMethod === 'cod';
      const orderPayload = {
        items: cartItems.map(i => ({
          menuItem: getItemKey(i),
          quantity: Number(i.quantity) || 1,
          price: Number(i.price) || 0,
          name: i.name,
          image: i.image,
        })),
        totalAmount: grandTotal,
        subtotal: totalPrice,
        deliveryFee,
        discountAmount,
        couponCode: appliedCoupon?.code,
        deliveryAddress: activeAddressPayload,
        paymentMethod: isCod ? 'cod' : 'online',
        paymentStatus: isCod ? 'Pending' : 'PendingPayment',
        deliveryInstructions: [...selectedInstructions, specialNotes].filter(Boolean).join(' | '),
        deliverySpeed,
      };

      // 1. Create order on backend
      const res = await api.orders.create(orderPayload);
      const isMongoId = (id: string) => Boolean(id && /^[0-9a-fA-F]{24}$/.test(id));
      const dbOrderId = (res?._id || res?.id || res?.orderNumber || '').toString();

      if (isCod) {
        // 2. Confirm COD
        try {
          if (dbOrderId && isMongoId(dbOrderId)) {
            await api.orders.confirmCod(dbOrderId);
          }
        } catch { /* noop */ }
        clearCart();
        showToast('Order placed successfully via COD! 🎉', 'success');
        navigate(`/orders/${dbOrderId}`, { state: { order: res, showSuccessModal: true }, replace: true });
        return;
      }

      // 3. Online Payment via Razorpay
      try {
        let rzpOrderData: any = null;
        try {
          rzpOrderData = await api.orders.createRazorpayOrder(grandTotal);
        } catch (rzpErr: any) {
          console.warn('Backend createRazorpayOrder error:', rzpErr);
        }

        const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_T9PQfyBmr3B9g0';

        const options = {
          key: rzpKey,
          amount: (rzpOrderData?.amount || grandTotal * 100),
          currency: rzpOrderData?.currency || 'INR',
          name: 'QuickBite',
          description: 'QuickBite Food Delivery Order',
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop',
          order_id: rzpOrderData?.id,
          prefill: {
            name: user?.name || 'QuickBite Customer',
            email: user?.email || 'customer@quickbite.com',
            contact: user?.phone || '9999999999',
          },
          theme: {
            color: '#E85D22',
          },
          handler: async (response: any) => {
            try {
              if (dbOrderId && isMongoId(dbOrderId)) {
                await api.orders.verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  order_id: dbOrderId,
                });
              }
            } catch (vErr: any) {
              console.warn('Payment verification note:', vErr);
            }
            clearCart();
            showToast('Payment successful! Your order is placed 🎉', 'success');
            navigate(`/orders/${dbOrderId}`, { state: { order: { ...res, paymentStatus: 'Paid' }, showSuccessModal: true }, replace: true });
          },
          modal: {
            ondismiss: () => {
              isOrderSubmitting.current = false;
              setLoading(false);
              showToast('Payment was cancelled. You can retry or choose COD.', 'info');
            },
          },
        };

        if ((window as any).Razorpay) {
          const rzpInstance = new (window as any).Razorpay(options);
          rzpInstance.open();
        } else {
          // Fallback if Razorpay script is blocked
          clearCart();
          showToast('Order confirmed! 🎉', 'success');
          navigate(`/orders/${dbOrderId}`, { state: { order: res, showSuccessModal: true }, replace: true });
        }
      } catch (onlineErr: any) {
        isOrderSubmitting.current = false;
        showToast(onlineErr.message || 'Payment initialization failed', 'error');
      }

    } catch (err: any) {
      isOrderSubmitting.current = false;
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getAddrIcon = (label?: string) => {
    const l = (label || '').toLowerCase();
    if (l === 'home') return '🏠';
    if (l === 'work' || l === 'office') return '💼';
    return '📍';
  };

  return (
    <main id="checkout-page" className="checkout-page">
      <div className="container checkout-body">
        <div className="checkout-header-row">
          <h1 className="checkout-title">Secure Checkout</h1>
          <span className="checkout-badge">⚡ Instant Order Confirmation</span>
        </div>

        <div className="checkout-layout">
          {/* Left Column: Flow Steps */}
          <div className="checkout-form-col">
            
            {/* Step 1: Delivery Address */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <h2 className="checkout-card-title">
                  <span className="checkout-step-num">1</span>
                  <span>Delivery Address</span>
                </h2>
                {savedAddresses.length > 0 && !isAddingNewAddr && (
                  <button
                    type="button"
                    className="checkout-link-btn"
                    onClick={() => { setSelectedAddrId('custom'); setIsAddingNewAddr(true); }}
                  >
                    + Add New Address
                  </button>
                )}
              </div>

              {/* Saved Address Cards */}
              {savedAddresses.length > 0 && !isAddingNewAddr ? (
                <div className="checkout-saved-addrs">
                  {savedAddresses.map(addr => {
                    const id = addr.id || addr._id || '0';
                    const isSelected = selectedAddrId === id;
                    return (
                      <div
                        key={id}
                        className={`checkout-addr-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedAddrId(id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="checkout-addr-icon">{getAddrIcon(addr.label)}</div>
                        <div className="checkout-addr-info">
                          <div className="checkout-addr-label-row">
                            <span className="checkout-addr-label">{addr.label || 'Saved Address'}</span>
                            {addr.isDefault && <span className="checkout-default-chip">Default</span>}
                          </div>
                          <p className="checkout-addr-line">{addr.addressLine1} {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                          <p className="checkout-addr-city">{addr.city} - {addr.zipCode}</p>
                        </div>
                        <div className="checkout-addr-radio">
                          <div className={`radio-dot ${isSelected ? 'active' : ''}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Custom / New Address Form */
                <div className="checkout-custom-addr">
                  <button
                    type="button"
                    className="btn addr-detect-loc-btn"
                    onClick={handleFetchCurrentLocation}
                    disabled={locating}
                    style={{ marginBottom: '14px', width: '100%' }}
                  >
                    <span>{locating ? '⏳' : '📍'}</span>
                    <span>{locating ? 'Detecting Location...' : 'Use Current Location (Auto-Fill Address)'}</span>
                  </button>

                  <div className="checkout-label-selector">
                    {['Home', 'Work', 'Office', 'Other'].map(lbl => (
                      <button
                        key={lbl}
                        type="button"
                        className={`chip ${customAddr.label === lbl ? 'active' : ''}`}
                        onClick={() => setCustomAddr(a => ({ ...a, label: lbl }))}
                      >
                        {getAddrIcon(lbl)} {lbl}
                      </button>
                    ))}
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="checkout-street" className="checkout-label">Flat, House No., Street, Landmark *</label>
                    <input
                      id="checkout-street"
                      type="text"
                      className="input"
                      placeholder="e.g. Flat 402, Building A, Palm Street"
                      value={customAddr.street}
                      onChange={e => setCustomAddr(a => ({ ...a, street: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="checkout-row">
                    <div className="checkout-field">
                      <label htmlFor="checkout-city" className="checkout-label">City *</label>
                      <input
                        id="checkout-city"
                        type="text"
                        className="input"
                        placeholder="City"
                        value={customAddr.city}
                        onChange={e => setCustomAddr(a => ({ ...a, city: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="checkout-field">
                      <label htmlFor="checkout-zip" className="checkout-label">PIN Code *</label>
                      <input
                        id="checkout-zip"
                        type="text"
                        className="input"
                        placeholder="PIN Code"
                        value={customAddr.zip}
                        onChange={e => setCustomAddr(a => ({ ...a, zip: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <label className="checkout-checkbox-label">
                    <input
                      type="checkbox"
                      checked={customAddr.saveToProfile}
                      onChange={e => setCustomAddr(a => ({ ...a, saveToProfile: e.target.checked }))}
                    />
                    <span>Save this address for future orders</span>
                  </label>

                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      className="checkout-cancel-link"
                      onClick={() => {
                        setIsAddingNewAddr(false);
                        const first = savedAddresses[0];
                        setSelectedAddrId(first.id || first._id || '0');
                      }}
                    >
                      ← Back to saved addresses
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Delivery Speed & Instructions */}
            <div className="checkout-card">
              <h2 className="checkout-card-title">
                <span className="checkout-step-num">2</span>
                <span>Delivery Speed & Instructions</span>
              </h2>

              <div className="checkout-speed-options">
                <div
                  className={`checkout-speed-card ${deliverySpeed === 'standard' ? 'selected' : ''}`}
                  onClick={() => setDeliverySpeed('standard')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="checkout-speed-header">
                    <span className="checkout-speed-icon">⚡</span>
                    <div>
                      <div className="checkout-speed-title">Standard Delivery</div>
                      <div className="checkout-speed-time">25–35 mins</div>
                    </div>
                  </div>
                  <span className="checkout-speed-price">{isFreeDeliveryEligible ? 'FREE' : '₹25'}</span>
                </div>

                <div
                  className={`checkout-speed-card ${deliverySpeed === 'express' ? 'selected' : ''}`}
                  onClick={() => setDeliverySpeed('express')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="checkout-speed-header">
                    <span className="checkout-speed-icon">🚀</span>
                    <div>
                      <div className="checkout-speed-title">Express Priority</div>
                      <div className="checkout-speed-time">15–20 mins (Direct partner)</div>
                    </div>
                  </div>
                  <span className="checkout-speed-price">+{isFreeDeliveryEligible ? '₹15' : '₹40'}</span>
                </div>
              </div>

              <div className="checkout-instruction-pills">
                <span className="checkout-subheading">Delivery Instructions:</span>
                <div className="checkout-pills-row">
                  {DELIVERY_INSTRUCTIONS.map(inst => (
                    <button
                      key={inst}
                      type="button"
                      className={`chip ${selectedInstructions.includes(inst) ? 'active' : ''}`}
                      onClick={() => toggleInstruction(inst)}
                    >
                      {inst}
                    </button>
                  ))}
                </div>
              </div>

              <div className="checkout-field" style={{ marginTop: '14px' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Special instructions for restaurant or rider (optional)..."
                  value={specialNotes}
                  onChange={e => setSpecialNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="checkout-card">
              <h2 className="checkout-card-title">
                <span className="checkout-step-num">3</span>
                <span>Payment Method</span>
              </h2>

              <div className="checkout-pay-options">
                {/* COD */}
                <div
                  className={`checkout-pay-opt ${payMethod === 'cod' ? 'active' : ''}`}
                  onClick={() => setPayMethod('cod')}
                  role="button"
                  tabIndex={0}
                >
                  <span className="checkout-pay-icon">💵</span>
                  <div className="checkout-pay-details">
                    <div className="checkout-pay-label">Cash on Delivery (COD)</div>
                    <div className="checkout-pay-sub">Pay with cash or scan QR upon arrival</div>
                  </div>
                  <div className={`radio-dot ${payMethod === 'cod' ? 'active' : ''}`} />
                </div>

                {/* UPI */}
                <div
                  className={`checkout-pay-opt ${payMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPayMethod('upi')}
                  role="button"
                  tabIndex={0}
                >
                  <span className="checkout-pay-icon">📱</span>
                  <div className="checkout-pay-details">
                    <div className="checkout-pay-label">UPI (Instant & Free)</div>
                    <div className="checkout-pay-sub">Google Pay, PhonePe, Paytm, BHIM</div>
                  </div>
                  <div className={`radio-dot ${payMethod === 'upi' ? 'active' : ''}`} />
                </div>

                {payMethod === 'upi' && (
                  <div className="checkout-upi-section">
                    <div className="checkout-upi-apps">
                      {[
                        { id: 'gpay', name: 'Google Pay', icon: '🟢' },
                        { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
                        { id: 'paytm', name: 'Paytm UPI', icon: '🔵' },
                        { id: 'custom', name: 'Other UPI ID', icon: '⚡' },
                      ].map(app => (
                        <button
                          key={app.id}
                          type="button"
                          className={`checkout-upi-btn ${selectedUpiApp === app.id ? 'active' : ''}`}
                          onClick={() => setSelectedUpiApp(app.id)}
                        >
                          <span>{app.icon}</span>
                          <span>{app.name}</span>
                        </button>
                      ))}
                    </div>
                    {selectedUpiApp === 'custom' && (
                      <input
                        type="text"
                        className="input"
                        placeholder="Enter your VPA (e.g. username@okhdfcbank)"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        style={{ marginTop: '10px' }}
                      />
                    )}
                  </div>
                )}

                {/* Cards */}
                <div
                  className={`checkout-pay-opt ${payMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPayMethod('card')}
                  role="button"
                  tabIndex={0}
                >
                  <span className="checkout-pay-icon">💳</span>
                  <div className="checkout-pay-details">
                    <div className="checkout-pay-label">Credit / Debit Card</div>
                    <div className="checkout-pay-sub">Visa, Mastercard, RuPay, Maestro</div>
                  </div>
                  <div className={`radio-dot ${payMethod === 'card' ? 'active' : ''}`} />
                </div>

                {payMethod === 'card' && (
                  <div className="checkout-card-form">
                    <div className="checkout-field">
                      <label className="checkout-label">Card Number</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="4532 •••• •••• ••••"
                        maxLength={19}
                        value={cardDetails.number}
                        onChange={e => setCardDetails(c => ({ ...c, number: e.target.value }))}
                      />
                    </div>
                    <div className="checkout-row">
                      <div className="checkout-field">
                        <label className="checkout-label">Valid Thru</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardDetails.expiry}
                          onChange={e => setCardDetails(c => ({ ...c, expiry: e.target.value }))}
                        />
                      </div>
                      <div className="checkout-field">
                        <label className="checkout-label">CVV</label>
                        <input
                          type="password"
                          className="input"
                          placeholder="•••"
                          maxLength={4}
                          value={cardDetails.cvv}
                          onChange={e => setCardDetails(c => ({ ...c, cvv: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Bill */}
          <div className="checkout-summary-col">
            
            {/* Promo Code Card */}
            <div className="checkout-summary-card" style={{ marginBottom: '16px' }}>
              <h3 className="checkout-card-title" style={{ fontSize: '15px' }}>
                <span>🏷️ Apply Promo Code</span>
              </h3>

              {appliedCoupon ? (
                <div className="checkout-applied-coupon">
                  <div>
                    <span className="coupon-code-badge">✓ {appliedCoupon.code}</span>
                    <span className="coupon-applied-text">{appliedCoupon.label} applied</span>
                  </div>
                  <button type="button" className="coupon-remove-btn" onClick={handleRemoveCoupon}>
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="checkout-coupon-input-wrap">
                    <input
                      type="text"
                      className="input checkout-coupon-input"
                      placeholder="Enter Coupon Code"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <button
                      type="button"
                      className="btn btn-primary checkout-coupon-btn"
                      onClick={handleApplyCustomCode}
                      disabled={!couponCode.trim()}
                    >
                      Apply
                    </button>
                  </div>

                  <div className="checkout-quick-coupons">
                    {AVAILABLE_COUPONS.map(c => (
                      <div
                        key={c.code}
                        className="checkout-quick-coupon-item"
                        onClick={() => handleApplyCoupon(c)}
                        role="button"
                        tabIndex={0}
                      >
                        <span className="coupon-chip">{c.code}</span>
                        <span className="coupon-desc">{c.desc}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Bill Details */}
            <div className="checkout-summary-card">
              <h3 className="checkout-card-title">Bill Details</h3>

              <div className="checkout-items">
                {cartItems.map(item => (
                  <div key={item.id || item._id} className="checkout-item-row">
                    <span className="checkout-item-name">{item.quantity}× {item.name}</span>
                    <span className="checkout-item-price">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>

              <div className="checkout-summary-divider" />

              <div className="checkout-summary-rows">
                <div className="checkout-sum-row">
                  <span>Item Total</span>
                  <span>₹{totalPrice.toFixed(0)}</span>
                </div>
                <div className="checkout-sum-row">
                  <span>Delivery Partner Fee</span>
                  <span>{deliveryFee === 0 ? <span className="checkout-free">FREE</span> : `₹${deliveryFee}`}</span>
                </div>
                <div className="checkout-sum-row">
                  <span>Govt. Taxes & Restaurant Packaging</span>
                  <span>₹{taxesAndCharges}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="checkout-sum-row checkout-discount-row">
                    <span>Coupon Discount</span>
                    <span className="checkout-discount-val">− ₹{discountAmount}</span>
                  </div>
                )}
              </div>

              <div className="checkout-summary-divider" />

              <div className="checkout-sum-total">
                <span>To Pay</span>
                <span>₹{grandTotal.toFixed(0)}</span>
              </div>

              {/* Savings indicator */}
              {(isFreeDeliveryEligible || discountAmount > 0) && (
                <div className="checkout-savings-pill">
                  🎉 You saved ₹{(discountAmount + (isFreeDeliveryEligible ? 25 : 0)).toFixed(0)} on this order!
                </div>
              )}

              <button
                id="checkout-place-order-btn"
                className="btn btn-primary checkout-place-btn"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? <span className="auth-spinner" /> : null}
                {loading ? 'Processing Order...' : `Place Order • ₹${grandTotal.toFixed(0)}`}
              </button>

              <div className="checkout-secure">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                100% Safe & Encrypted Checkout
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
