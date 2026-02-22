const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
// Configure CORS - supports both development and production
const corsOptions = {
  origin: (origin, callback) => {
    if (process.env.NODE_ENV === 'production') {
      // In production, frontend is served from same domain
      callback(null, true);
    } else {
      // In development, allow localhost
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:10000'];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    }
  },
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
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

console.log('📡 MongoDB Connection Attempt:');
console.log('   URI:', mongoURI.includes('mongodb+srv') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB');
console.log('   Host:', mongoURI.includes('mongodb+srv') ? 'Cloud' : 'localhost:27017');

mongoose.connect(mongoURI, mongoOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    console.log(`📊 Database: ${mongoURI.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB'}`);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Server will continue running without database connection');
  });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB Atlas connection error:'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/stripe', require('./routes/stripe'));

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
