import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, Search, Package, User } from 'lucide-react';
import './App.css';
import UserProfile from './UserProfile';
import Login from './Login';
import Signup from './Signup';

const ProvisionStore = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Check if user is logged in on component mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const initialProducts = [
    { id: 1, name: 'Rice (1kg)', price: 60, category: 'Grains', image: '🌾', stock: 50 },
    { id: 2, name: 'Wheat Flour (1kg)', price: 45, category: 'Grains', image: '🌾', stock: 40 },
    { id: 3, name: 'Sugar (1kg)', price: 50, category: 'Groceries', image: '🍬', stock: 30 },
    { id: 4, name: 'Cooking Oil (1L)', price: 150, category: 'Oils', image: '🛢️', stock: 25 },
    { id: 5, name: 'Tea Powder (250g)', price: 120, category: 'Beverages', image: '☕', stock: 35 },
    { id: 6, name: 'Coffee Powder (200g)', price: 180, category: 'Beverages', image: '☕', stock: 20 },
    { id: 7, name: 'Salt (1kg)', price: 25, category: 'Groceries', image: '🧂', stock: 60 },
    { id: 8, name: 'Turmeric Powder (100g)', price: 40, category: 'Spices', image: '🌶️', stock: 45 },
    { id: 9, name: 'Red Chilli Powder (100g)', price: 50, category: 'Spices', image: '🌶️', stock: 40 },
    { id: 10, name: 'Pulses - Toor Dal (1kg)', price: 140, category: 'Pulses', image: '🫘', stock: 30 },
    { id: 11, name: 'Soap Bar', price: 35, category: 'Toiletries', image: '🧼', stock: 50 },
    { id: 12, name: 'Detergent Powder (1kg)', price: 120, category: 'Cleaning', image: '🧺', stock: 25 },
  ];

  const [products] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCart, setShowCart] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', product: null });

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      showToast(`${product.name} quantity increased!`, product);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
      showToast(`${product.name} added to cart!`, product);
    }
  };

  const showToast = (message, product) => {
    setToast({ show: true, message, product });
    setTimeout(() => {
      setToast({ show: false, message: '', product: null });
    }, 3000);
  };

  const getProductQuantity = (productId) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const updateQuantity = (id, change) => {
    setCart(cart.map(item =>
      item.id === id
        ? { ...item, quantity: Math.max(0, item.quantity + change) }
        : item
    ).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const filteredProducts = products.filter(p =>
    (selectedCategory === 'All' || p.category === selectedCategory) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Package size={32} />
            <h1>R.R. Provision Store</h1>
          </div>
          <div className="header-buttons">
            {user ? (
              <button onClick={() => navigate('/profile')} className="profile-button">
                <User size={20} />
                <span>{user.name}</span>
              </button>
            ) : (
              <button onClick={() => navigate('/login')} className="login-button">
                Login
              </button>
            )}
            <button onClick={() => setShowCart(!showCart)} className="cart-button">
              <ShoppingCart size={20} />
              <span>Cart</span>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-badge">🎉 Fresh Arrivals Daily</span>
            <h1 className="hero-title">
              Your Trusted
              <span className="gradient-text"> Neighborhood Store</span>
            </h1>
            <p className="hero-description">
              Quality groceries and essentials delivered fresh to your doorstep.
              Experience the convenience of shopping from home with the best prices in town.
            </p>
            <div className="hero-buttons">
              <button className="hero-btn primary" onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}>
                Shop Now
                <span className="btn-arrow">→</span>
              </button>
              <button className="hero-btn secondary" onClick={() => navigate('/signup')}>
                Join Now
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-icon">🌾</div>
              <div className="card-info">
                <h4>Fresh Grains</h4>
                <p>Premium Quality</p>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">☕</div>
              <div className="card-info">
                <h4>Beverages</h4>
                <p>Best Selection</p>
              </div>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">🌶️</div>
              <div className="card-info">
                <h4>Spices</h4>
                <p>Authentic Taste</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-item">
          <div className="stat-number">500+</div>
          <div className="stat-label">Products</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">10K+</div>
          <div className="stat-label">Happy Customers</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">24/7</div>
          <div className="stat-label">Support</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">Fast</div>
          <div className="stat-label">Delivery</div>
        </div>
      </div>

      <div className="container">
        {/* Search and Filter Section */}
        <div className="search-section" id="products">
          <div className="section-header-main">
            <h2>Browse Our Products</h2>
            <p>Find everything you need for your daily essentials</p>
          </div>
          <div className="search-box">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="categories">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? 'category-btn active' : 'category-btn'}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="main-content">
          <div className="products-section-full">
            <h2>Products</h2>
            <div className="products-grid">
              {filteredProducts.map(product => {
                const quantityInCart = getProductQuantity(product.id);
                return (
                  <div key={product.id} className="product-card">
                    <div className="product-image">{product.image}</div>
                    <h3>{product.name}</h3>
                    <p className="product-category">{product.category}</p>
                    <div className="product-info">
                      <span className="product-price">₹{product.price}</span>
                      <span className="product-stock">Stock: {product.stock}</span>
                    </div>
                    {quantityInCart === 0 ? (
                      <button onClick={() => addToCart(product)} className="add-btn">
                        Add to Cart
                      </button>
                    ) : (
                      <div className="product-quantity-controls">
                        <button onClick={() => updateQuantity(product.id, -1)} className="qty-btn">
                          <Minus size={16} />
                        </button>
                        <span className="qty-display">{quantityInCart}</span>
                        <button onClick={() => updateQuantity(product.id, 1)} className="qty-btn">
                          <Plus size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Cart Modal/Overlay */}
      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-section" onClick={(e) => e.stopPropagation()}>
            <div className="cart-card">
              <div className="cart-header">
                <div className="cart-header-content">
                  <ShoppingCart size={24} />
                  <h2>Shopping Cart</h2>
                  {totalItems > 0 && <span className="cart-count-badge">{totalItems}</span>}
                </div>
                <button onClick={() => setShowCart(false)} className="close-cart">
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="empty-cart-container">
                  <div className="empty-cart-icon">🛒</div>
                  <h3>Your cart is empty</h3>
                  <p>Add some products to get started!</p>
                  <button className="continue-shopping-btn" onClick={() => setShowCart(false)}>
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map(item => (
                      <div key={item.id} className="cart-item">
                        <div className="cart-item-image">{item.image}</div>
                        <div className="cart-item-details">
                          <div className="cart-item-header">
                            <div>
                              <h4>{item.name}</h4>
                              <p className="item-category">{item.category}</p>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="remove-btn" title="Remove item">
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="cart-item-footer">
                            <div className="quantity-controls">
                              <button onClick={() => updateQuantity(item.id, -1)} title="Decrease quantity">
                                <Minus size={16} />
                              </button>
                              <span>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} title="Increase quantity">
                                <Plus size={16} />
                              </button>
                            </div>
                            <div className="item-pricing">
                              <span className="item-price">₹{item.price} each</span>
                              <span className="item-total">₹{item.price * item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cart-summary">
                    <div className="summary-row">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>₹{totalAmount}</span>
                    </div>
                    <div className="summary-row">
                      <span>Delivery Fee</span>
                      <span className="free-badge">FREE</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-row total-row">
                      <span>Total</span>
                      <span className="total-amount">₹{totalAmount}</span>
                    </div>
                    {totalAmount >= 500 && (
                      <div className="savings-badge">
                        🎉 You're saving on delivery!
                      </div>
                    )}
                  </div>

                  <div className="cart-footer">
                    <button className="checkout-btn">
                      <span>Proceed to Checkout</span>
                      <span className="btn-arrow">→</span>
                    </button>
                    <button onClick={() => setCart([])} className="clear-btn">
                      Clear Cart
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="toast-notification">
          <div className="toast-content">
            <div className="toast-icon">✓</div>
            <div className="toast-message">
              <strong>{toast.message}</strong>
              <p>Item added successfully</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App component with routing
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProvisionStore />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
};

// Export the App component
export default App;