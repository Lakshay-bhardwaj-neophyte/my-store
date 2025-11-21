import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Package, ShoppingBag, Heart, Settings, ArrowLeft, LogOut } from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [userInfo, setUserInfo] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        joinDate: '',
        avatar: '👤'
    });

    const [editedInfo, setEditedInfo] = useState({ ...userInfo });
    const [orderHistory, setOrderHistory] = useState([]);
    const [favoriteProducts, setFavoriteProducts] = useState([]);

    // Fetch user data from backend
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const user = data.user;

                    const userData = {
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        address: user.address || 'No address added yet',
                        joinDate: new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric'
                        }),
                        avatar: '👤'
                    };

                    setUserInfo(userData);
                    setEditedInfo(userData);
                    setOrderHistory(user.orders || []);
                    setFavoriteProducts(user.favorites || []);
                } else if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const stats = [
        { label: 'Total Orders', value: orderHistory.length.toString(), icon: ShoppingBag, color: '#16a34a' },
        { label: 'Total Spent', value: `₹${orderHistory.reduce((sum, order) => sum + order.total, 0).toLocaleString()}`, icon: Package, color: '#0ea5e9' },
        { label: 'Favorites', value: favoriteProducts.length.toString(), icon: Heart, color: '#ef4444' },
        { label: 'Member Since', value: userInfo.joinDate, icon: Calendar, color: '#f59e0b' },
    ];

    const handleEdit = () => {
        setIsEditing(true);
        setEditedInfo({ ...userInfo });
    };

    const handleSave = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:5000/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: editedInfo.name,
                    phone: editedInfo.phone,
                    address: editedInfo.address
                })
            });

            if (response.ok) {
                setUserInfo({ ...editedInfo });
                const storedUser = JSON.parse(localStorage.getItem('user'));
                storedUser.name = editedInfo.name;
                localStorage.setItem('user', JSON.stringify(storedUser));
                setIsEditing(false);
            } else {
                alert('Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile. Please try again.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleCancel = () => {
        setEditedInfo({ ...userInfo });
        setIsEditing(false);
    };

    const handleChange = (field, value) => {
        setEditedInfo({ ...editedInfo, [field]: value });
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="loading-container" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    gap: '1rem'
                }}>
                    <div className="loading-spinner" style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #e5e7eb',
                        borderTop: '4px solid #16a34a',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <button className="back-to-store" onClick={() => navigate('/')}>
                <ArrowLeft size={20} />
                Back to Store
            </button>
            <button className="logout-button" onClick={handleLogout} style={{
                position: 'fixed',
                top: '2rem',
                right: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                zIndex: 100
            }}>
                <LogOut size={20} />
                Logout
            </button>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Order Details</h3>
                            <button className="close-modal" onClick={() => setSelectedOrder(null)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="order-info-summary">
                                <p><strong>Order ID:</strong> {selectedOrder.orderId}</p>
                                <p><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> <span className={`status-badge ${selectedOrder.status.toLowerCase()}`}>{selectedOrder.status}</span></p>
                            </div>
                            <div className="order-items-list">
                                {Array.isArray(selectedOrder.items) ? (
                                    selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="order-detail-item">
                                            <div className="item-image">{item.image}</div>
                                            <div className="item-info">
                                                <h4>{item.name}</h4>
                                                <p>Qty: {item.quantity}</p>
                                            </div>
                                            <div className="item-price">₹{item.price * item.quantity}</div>
                                        </div>
                                    ))
                                ) : (
                                    <p>Order details not available for this legacy order.</p>
                                )}
                            </div>
                            <div className="order-total-section">
                                <span>Total Amount</span>
                                <span>₹{selectedOrder.total}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="profile-container">
                {/* Profile Header Card */}
                <div className="profile-header-card">
                    <div className="profile-background"></div>
                    <div className="profile-content">
                        <div className="avatar-section">
                            <div className="avatar-wrapper">
                                <div className="avatar">{userInfo.avatar}</div>
                                <div className="avatar-ring"></div>
                            </div>
                        </div>
                        <div className="profile-info-header">
                            <h1>{userInfo.name}</h1>
                            <p className="member-since">
                                <Calendar size={16} />
                                Member since {userInfo.joinDate}
                            </p>
                        </div>
                        <button
                            className="edit-profile-btn"
                            onClick={isEditing ? handleSave : handleEdit}
                        >
                            {isEditing ? (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            ) : (
                                <>
                                    <Edit2 size={18} />
                                    Edit Profile
                                </>
                            )}
                        </button>
                        {isEditing && (
                            <button className="cancel-btn" onClick={handleCancel}>
                                <X size={18} />
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card" style={{ '--stat-color': stat.color }}>
                            <div className="stat-icon">
                                <stat.icon size={24} />
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="profile-main-grid">
                    {/* Personal Information */}
                    <div className="profile-section">
                        <div className="section-header">
                            <h2>
                                <User size={20} />
                                Personal Information
                            </h2>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <div className="info-icon">
                                    <User size={18} />
                                </div>
                                <div className="info-content">
                                    <label>Full Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedInfo.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            className="edit-input"
                                        />
                                    ) : (
                                        <p>{userInfo.name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon">
                                    <Mail size={18} />
                                </div>
                                <div className="info-content">
                                    <label>Email Address</label>
                                    <p>{userInfo.email}</p>
                                    <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>Email cannot be changed</small>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon">
                                    <Phone size={18} />
                                </div>
                                <div className="info-content">
                                    <label>Phone Number</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={editedInfo.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            className="edit-input"
                                        />
                                    ) : (
                                        <p>{userInfo.phone}</p>
                                    )}
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon">
                                    <MapPin size={18} />
                                </div>
                                <div className="info-content">
                                    <label>Address</label>
                                    {isEditing ? (
                                        <textarea
                                            value={editedInfo.address}
                                            onChange={(e) => handleChange('address', e.target.value)}
                                            className="edit-input"
                                            rows="2"
                                        />
                                    ) : (
                                        <p>{userInfo.address}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="profile-section">
                        <div className="section-header">
                            <h2>
                                <Package size={20} />
                                Recent Orders
                            </h2>
                        </div>
                        <div className="orders-list">
                            {orderHistory.length > 0 ? (
                                orderHistory.map((order, index) => (
                                    <div
                                        key={index}
                                        className="order-item clickable"
                                        onClick={() => setSelectedOrder(order)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="order-header">
                                            <span className="order-id">{order.orderId}</span>
                                            <span className={`order-status ${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="order-details">
                                            <div className="order-detail">
                                                <Calendar size={14} />
                                                <span>{new Date(order.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="order-detail">
                                                <ShoppingBag size={14} />
                                                <span>{Array.isArray(order.items) ? order.items.length : order.items} items</span>
                                            </div>
                                            <div className="order-total">₹{order.total}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                                    No orders yet. Start shopping to see your order history!
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Favorite Products */}
                    <div className="profile-section favorites-section">
                        <div className="section-header">
                            <h2>
                                <Heart size={20} />
                                Favorite Products
                            </h2>
                        </div>
                        <div className="favorites-grid">
                            {favoriteProducts.length > 0 ? (
                                favoriteProducts.map((product, index) => (
                                    <div key={index} className="favorite-card">
                                        <div className="favorite-image">{product.image}</div>
                                        <div className="favorite-info">
                                            <h4>{product.name}</h4>
                                            <p className="favorite-price">₹{product.price}</p>
                                        </div>
                                        <button className="quick-add-btn">Add to Cart</button>
                                    </div>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem', gridColumn: '1 / -1' }}>
                                    No favorite products yet. Add some to see them here!
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Account Settings */}
                    <div className="profile-section">
                        <div className="section-header">
                            <h2>
                                <Settings size={20} />
                                Account Settings
                            </h2>
                        </div>
                        <div className="settings-list">
                            <button className="setting-item">
                                <div className="setting-info">
                                    <h4>Change Password</h4>
                                    <p>Update your password to keep your account secure</p>
                                </div>
                                <span className="setting-arrow">›</span>
                            </button>
                            <button className="setting-item">
                                <div className="setting-info">
                                    <h4>Notification Preferences</h4>
                                    <p>Manage how you receive updates and alerts</p>
                                </div>
                                <span className="setting-arrow">›</span>
                            </button>
                            <button className="setting-item">
                                <div className="setting-info">
                                    <h4>Privacy Settings</h4>
                                    <p>Control your data and privacy options</p>
                                </div>
                                <span className="setting-arrow">›</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
