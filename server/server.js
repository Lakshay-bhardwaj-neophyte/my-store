const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = 'mongodb://localhost:27017/provision-store';
const JWT_SECRET = 'your-secret-key-change-in-production'; // Change this in production!

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    address: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    orders: [{
        orderId: String,
        date: Date,
        items: Number,
        total: Number,
        status: String,
    }],
    favorites: [{
        productId: Number,
        name: String,
        price: Number,
        image: String,
    }],
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Validation
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Create new user
        const user = new User({
            name,
            email,
            phone,
            password,
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get user profile (protected route)
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                createdAt: user.createdAt,
                orders: user.orders || [],
                favorites: user.favorites || [],
            },
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
});

// Update user profile (protected route)
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const { name, phone, address } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address !== undefined) user.address = address;

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
            },
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
});

// Add to favorites (protected route)
app.post('/api/user/favorites', authenticateToken, async (req, res) => {
    try {
        const { productId, name, price, image } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already in favorites
        const existingFavorite = user.favorites.find(fav => fav.productId === productId);
        if (existingFavorite) {
            return res.status(400).json({ message: 'Product already in favorites' });
        }

        user.favorites.push({ productId, name, price, image });
        await user.save();

        res.json({
            message: 'Added to favorites',
            favorites: user.favorites,
        });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ message: 'Server error adding to favorites' });
    }
});

// Remove from favorites (protected route)
app.delete('/api/user/favorites/:productId', authenticateToken, async (req, res) => {
    try {
        const { productId } = req.params;

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.favorites = user.favorites.filter(fav => fav.productId !== parseInt(productId));
        await user.save();

        res.json({
            message: 'Removed from favorites',
            favorites: user.favorites,
        });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ message: 'Server error removing from favorites' });
    }
});


// Create order (protected route)
app.post('/api/orders', authenticateToken, async (req, res) => {
    try {
        const { items, total } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const order = {
            orderId: `ORD-${Date.now()}`,
            date: new Date(),
            items: items,
            total,
            status: 'Processing',
        };

        user.orders.push(order);
        await user.save();

        res.status(201).json({
            message: 'Order created successfully',
            order,
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server error creating order' });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 MongoDB URI: ${MONGODB_URI}`);
});
