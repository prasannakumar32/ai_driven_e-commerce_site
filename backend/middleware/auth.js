const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    // Ensure consistent ID field naming
    req.user = {
      _id: decoded.id || decoded._id,
      email: decoded.email,
      role: decoded.role,
      ...decoded
    };
    next();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Auth middleware - Error:', error.message);
    }
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
