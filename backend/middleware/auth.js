const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  console.log('Auth middleware - Token:', token);
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    console.log('Auth middleware - Decoded:', decoded);
    // Ensure consistent ID field naming
    req.user = {
      _id: decoded.id || decoded._id,
      email: decoded.email,
      role: decoded.role,
      ...decoded
    };
    next();
  } catch (error) {
    console.error('Auth middleware - Error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
