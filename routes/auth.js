const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Register user
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    
    const { 
      username,
      name, 
      email, 
      password, 
      role = 'customer',
      businessName,
      businessType,
      gstNumber,
      phone
    } = req.body;

    // Validate required fields
    if (!username || !name || !email || !password) {
      return res.status(400).json({ message: 'Username, name, email, and password are required' });
    }

    // Validate username format and length
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ message: 'Username must be between 3 and 30 characters long' });
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores' });
    }

    // Validate name length
    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({ message: 'Name must be between 2 and 50 characters long' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Validate seller-specific fields
    if (role === 'seller') {
      if (!businessName || !businessType || !phone) {
        return res.status(400).json({ message: 'Business name, business type, and phone are required for sellers' });
      }
      
      if (phone.length < 10) {
        return res.status(400).json({ message: 'Please enter a valid phone number' });
      }
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Create new user with additional fields
    const userData = {
      username,
      name,
      email,
      password,
      role
    };

    // Add seller-specific fields if role is seller
    if (role === 'seller') {
      userData.businessName = businessName;
      userData.businessType = businessType;
      userData.gstNumber = gstNumber;
      userData.phone = phone;
    }

    console.log('Creating user with data:', userData);
    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    console.log('User created successfully:', { id: user._id, role: user.role });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        businessType: user.businessType
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'username') {
        return res.status(400).json({ message: 'Username is already taken' });
      } else if (field === 'email') {
        return res.status(400).json({ message: 'Email is already registered' });
      }
      return res.status(400).json({ message: `${field} already exists` });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error during registration: ' + error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        businessType: user.businessType,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('browsingHistory.product', 'name images price')
      .populate('purchaseHistory.products.product', 'name images price');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, preferences } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (name) user.name = name;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      preferences: user.preferences
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    const user = await User.findById(req.user.id);
    user.preferences = { ...user.preferences, ...preferences };
    
    await user.save();

    res.json(user.preferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update AI profile
router.put('/ai-profile', auth, async (req, res) => {
  try {
    const { aiProfile } = req.body;
    
    const user = await User.findById(req.user.id);
    user.aiProfile = { ...user.aiProfile, ...aiProfile };
    
    await user.save();

    res.json(user.aiProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user browsing history
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('browsingHistory.product', 'name images price category')
      .select('browsingHistory');

    res.json(user.browsingHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to browsing history
router.post('/history', auth, async (req, res) => {
  try {
    const { productId, duration = 0 } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // Add to browsing history
    user.browsingHistory.push({
      product: productId,
      timestamp: new Date(),
      duration
    });

    // Keep only last 50 items
    if (user.browsingHistory.length > 50) {
      user.browsingHistory = user.browsingHistory.slice(-50);
    }

    await user.save();

    res.json({ message: 'Browsing history updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear browsing history
router.delete('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.browsingHistory = [];
    await user.save();

    res.json({ message: 'Browsing history cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
module.exports.auth = auth;
