const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 10000;

// CORS: in development reflect all origins; in production same-domain only
const corsOptions = {
  origin: true,       // reflects the request origin — works for all localhost variants
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.use(express.static(path.join(__dirname, 'public')));

// Image routes
const imageRoutes = require('./server/imageRoutes');
app.use('/api/images', imageRoutes);

// MongoDB Atlas Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-ecommerce';
const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000, // Give Atlas more time to respond
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
};

console.log('📡 MongoDB Connection Attempt:');
console.log('   URI:', mongoURI.includes('mongodb+srv') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB');

mongoose.connect(mongoURI, mongoOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Server running without DB — all data operations will fail.');
    console.log('👉 Check: Atlas IP Whitelist, credentials in .env, or network connectivity.');
  });

const db = mongoose.connection;
db.on('error', (err) => console.error('MongoDB connection error:', err.message));

// Health check endpoint (before routes, no auth needed)
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const dbStatus = stateMap[dbState] || 'unknown';
  res.json({
    status: dbState === 1 ? 'ok' : 'degraded',
    database: dbStatus,
    uptime: Math.floor(process.uptime()) + 's',
    env: process.env.NODE_ENV || 'unknown',
    mongoURI: mongoURI.includes('mongodb+srv') ? 'Atlas (Cloud)' : 'Local'
  });
});

// Middleware: block DB-dependent routes if not connected
const requireDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'The database is temporarily unavailable. Please try again in a few moments.',
      hint: 'If this persists, please contact support.'
    });
  }
  next();
};

// Automatic delivery status updater
const { startDeliveryStatusScheduler } = require('./utils/deliveryStatusUpdater');

// Start the scheduler when MongoDB is connected
mongoose.connection.on('connected', () => {
  startDeliveryStatusScheduler(10 * 60 * 1000); // Check every 10 minutes
});

// Routes — all data routes require a live DB connection
app.use('/api/auth', requireDB, require('./routes/auth'));
app.use('/api/products', require('./routes/products')); // Products can be read without strict DB check
app.use('/api/cart', requireDB, require('./routes/cart'));
app.use('/api/orders', requireDB, require('./routes/orders'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/stripe', requireDB, require('./routes/stripe'));

// SPA Catch-all: Serve React app for all non-API routes
// This allows React Router to handle client-side routing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Catch all non-API routes and serve index.html for React Router
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔧 Backend API: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend: http://localhost:3000`);
});
