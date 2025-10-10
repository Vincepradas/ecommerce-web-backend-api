require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/Auth.Route');
const productRoutes = require('./routes/Products.Route');
const orderRoutes = require('./routes/Orders.Route');
const cartRoutes = require('./routes/Cart.Route');
const paymentRoutes = require('./routes/Payments.Route');
const userRoutes = require('./routes/Profile.Route');
const vendorProducts = require('./routes/Vendor.Route');
const reviews = require('./routes/Reviews.Route');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(cookieParser());

const corsOptions = {
    origin: '*' || process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', 
        httpOnly: true,
    },
}));

// Body parser middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/vendorproducts', vendorProducts);
app.use('/api/reviews', reviews);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
