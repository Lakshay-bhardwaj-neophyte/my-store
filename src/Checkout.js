import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, ShieldCheck, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Success
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState([]);
    const [user, setUser] = useState(null);
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zip: '',
        phone: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    useEffect(() => {
        // Load cart and user from local storage
        const storedUser = localStorage.getItem('user');
        const storedCart = localStorage.getItem('cart'); // Assuming cart is persisted in localStorage, if not we might need to pass it via state or context. 
        // For now, let's assume the cart is passed via navigation state or we need to persist it.
        // Actually, in App.js cart is state. I should probably use a Context or pass it via navigate state.
        // But to keep it simple and robust, let's assume we'll modify App.js to save cart to localStorage or use navigate state.

        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setAddress(prev => ({
                ...prev,
                street: parsedUser.address || '',
                phone: parsedUser.phone || ''
            }));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    // We need to get the cart items. Since App.js manages cart state, we should pass it.
    // However, for a standalone page, it's better if the cart is in localStorage.
    // I'll update App.js to save cart to localStorage later.
    // For now, let's try to read from location state or localStorage.

    useEffect(() => {
        const savedCart = localStorage.getItem('cart_items');
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            if (parsedCart.length === 0) {
                navigate('/');
            } else {
                setCart(parsedCart);
            }
        } else {
            navigate('/');
        }
    }, [navigate]);

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleAddressSubmit = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate payment processing
        setTimeout(async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Not authenticated');

                const response = await fetch('http://localhost:5000/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        items: cart.map(item => ({
                            productId: item.id,
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price,
                            image: item.image
                        })),
                        total: totalAmount,
                        shippingAddress: address,
                        paymentMethod
                    })
                });

                if (response.ok) {
                    setStep(3);
                    localStorage.removeItem('cart_items'); // Clear cart
                    // We also need to clear cart in App.js. We can do this by dispatching a custom event or relying on App.js to check localStorage.
                    window.dispatchEvent(new Event('cartUpdated'));
                } else {
                    alert('Payment failed. Please try again.');
                }
            } catch (error) {
                console.error('Payment error:', error);
                alert('An error occurred. Please try again.');
            } finally {
                setLoading(false);
            }
        }, 2000);
    };

    if (step === 3) {
        return (
            <div className="checkout-success">
                <div className="success-card">
                    <div className="success-icon">
                        <CheckCircle size={64} />
                    </div>
                    <h1>Order Placed Successfully!</h1>
                    <p>Thank you for your purchase. Your order has been confirmed.</p>
                    <div className="order-summary-mini">
                        <p>Amount Paid: <strong>₹{totalAmount}</strong></p>
                        <p>Estimated Delivery: <strong>2 Days</strong></p>
                    </div>
                    <button onClick={() => navigate('/')} className="home-btn">
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <header className="checkout-header">
                <div className="header-content">
                    <button onClick={() => navigate('/')} className="back-btn">
                        <ArrowLeft size={20} /> Back
                    </button>
                    <h1>Checkout</h1>
                    <div className="secure-badge">
                        <ShieldCheck size={16} /> Secure Checkout
                    </div>
                </div>
            </header>

            <div className="checkout-container">
                <div className="checkout-main">
                    {/* Progress Steps */}
                    <div className="checkout-steps">
                        <div className={`step ${step >= 1 ? 'active' : ''}`}>
                            <div className="step-number">1</div>
                            <span>Address</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${step >= 2 ? 'active' : ''}`}>
                            <div className="step-number">2</div>
                            <span>Payment</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${step >= 3 ? 'active' : ''}`}>
                            <div className="step-number">3</div>
                            <span>Done</span>
                        </div>
                    </div>

                    {step === 1 ? (
                        <div className="step-content fade-in">
                            <h2><MapPin size={20} /> Shipping Address</h2>
                            <form onSubmit={handleAddressSubmit} className="checkout-form">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={user?.name || ''}
                                        disabled
                                        className="disabled-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Street Address</label>
                                    <input
                                        type="text"
                                        required
                                        value={address.street}
                                        onChange={e => setAddress({ ...address, street: e.target.value })}
                                        placeholder="House No, Street Name"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            required
                                            value={address.city}
                                            onChange={e => setAddress({ ...address, city: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <input
                                            type="text"
                                            required
                                            value={address.state}
                                            onChange={e => setAddress({ ...address, state: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>ZIP Code</label>
                                        <input
                                            type="text"
                                            required
                                            value={address.zip}
                                            onChange={e => setAddress({ ...address, zip: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input
                                            type="tel"
                                            required
                                            value={address.phone}
                                            onChange={e => setAddress({ ...address, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="primary-btn">
                                    Continue to Payment
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="step-content fade-in">
                            <h2><CreditCard size={20} /> Payment Method</h2>
                            <form onSubmit={handlePayment} className="checkout-form">
                                <div className="payment-methods">
                                    <label className={`method-card ${paymentMethod === 'card' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="card"
                                            checked={paymentMethod === 'card'}
                                            onChange={() => setPaymentMethod('card')}
                                        />
                                        <div className="method-info">
                                            <span className="method-title">Credit/Debit Card</span>
                                            <span className="method-icons">💳</span>
                                        </div>
                                    </label>
                                    <label className={`method-card ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="upi"
                                            checked={paymentMethod === 'upi'}
                                            onChange={() => setPaymentMethod('upi')}
                                        />
                                        <div className="method-info">
                                            <span className="method-title">UPI</span>
                                            <span className="method-icons">📱</span>
                                        </div>
                                    </label>
                                    <label className={`method-card ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cod"
                                            checked={paymentMethod === 'cod'}
                                            onChange={() => setPaymentMethod('cod')}
                                        />
                                        <div className="method-info">
                                            <span className="method-title">Cash on Delivery</span>
                                            <span className="method-icons">💵</span>
                                        </div>
                                    </label>
                                </div>

                                {paymentMethod === 'card' && (
                                    <div className="card-details fade-in">
                                        <div className="form-group">
                                            <label>Card Number</label>
                                            <input
                                                type="text"
                                                placeholder="0000 0000 0000 0000"
                                                maxLength="19"
                                                value={cardNumber}
                                                onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                                                required
                                            />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Expiry Date</label>
                                                <input
                                                    type="text"
                                                    placeholder="MM/YY"
                                                    maxLength="5"
                                                    value={expiry}
                                                    onChange={e => setExpiry(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>CVV</label>
                                                <input
                                                    type="password"
                                                    placeholder="123"
                                                    maxLength="3"
                                                    value={cvv}
                                                    onChange={e => setCvv(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button type="submit" className="primary-btn pay-btn" disabled={loading}>
                                    {loading ? (
                                        <span className="loading-spinner-small"></span>
                                    ) : (
                                        <>Pay ₹{totalAmount}</>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                <div className="checkout-sidebar">
                    <div className="order-summary-card">
                        <h3>Order Summary</h3>
                        <div className="summary-items">
                            {cart.map(item => (
                                <div key={item.id} className="summary-item">
                                    <div className="summary-item-info">
                                        <span className="item-name">{item.name}</span>
                                        <span className="item-qty">x{item.quantity}</span>
                                    </div>
                                    <span className="item-price">₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{totalAmount}</span>
                        </div>
                        <div className="summary-row">
                            <span>Delivery</span>
                            <span className="free-text">FREE</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-total">
                            <span>Total</span>
                            <span>₹{totalAmount}</span>
                        </div>
                        <div className="security-note">
                            <ShieldCheck size={14} />
                            Payments are secure and encrypted
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
