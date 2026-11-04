const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get admin dashboard statistics
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalSellers,
      totalDeliveryPartners,
      totalOrders,
      totalProducts,
      pendingSellers,
      pendingDeliveryPartners,
      recentOrders
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ role: 'delivery_partner' }),
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: 'seller', sellerStatus: 'pending' }),
      User.countDocuments({ role: 'delivery_partner', deliveryPartnerStatus: 'pending' }),
      Order.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email')
    ]);

    const totalRevenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      users: totalUsers,
      sellers: totalSellers,
      deliveryPartners: totalDeliveryPartners,
      orders: totalOrders,
      products: totalProducts,
      pendingSellers,
      pendingDeliveryPartners,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all sellers with status
router.get('/sellers', auth, adminAuth, async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve seller
router.put('/sellers/:id/approve', auth, adminAuth, async (req, res) => {
  try {
    const seller = await User.findByIdAndUpdate(
      req.params.id,
      { sellerStatus: 'approved' },
      { new: true }
    ).select('-password');

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject seller
router.put('/sellers/:id/reject', auth, adminAuth, async (req, res) => {
  try {
    const seller = await User.findByIdAndUpdate(
      req.params.id,
      { sellerStatus: 'rejected' },
      { new: true }
    ).select('-password');

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all delivery partners with status
router.get('/delivery-partners', auth, adminAuth, async (req, res) => {
  try {
    const partners = await User.find({ role: 'delivery_partner' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve delivery partner
router.put('/delivery-partners/:id/approve', auth, adminAuth, async (req, res) => {
  try {
    const partner = await User.findByIdAndUpdate(
      req.params.id,
      { deliveryPartnerStatus: 'active' },
      { new: true }
    ).select('-password');

    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    res.json(partner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject delivery partner
router.put('/delivery-partners/:id/reject', auth, adminAuth, async (req, res) => {
  try {
    const partner = await User.findByIdAndUpdate(
      req.params.id,
      { deliveryPartnerStatus: 'suspended' },
      { new: true }
    ).select('-password');

    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    res.json(partner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders
router.get('/orders', auth, adminAuth, async (req, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;
    const filter = status ? { status } : {};

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('deliveryPartner', 'name phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Order.countDocuments(filter);

    res.json({ orders, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.put('/orders/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email').populate('deliveryPartner', 'name phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all products
router.get('/products', auth, adminAuth, async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const products = await Product.find()
      .populate('seller', 'name businessName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Product.countDocuments();

    res.json({ products, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product
router.delete('/products/:id', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { role, limit = 50, skip = 0 } = req.query;
    const filter = role ? { role } : {};

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await User.countDocuments(filter);

    res.json({ users, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role
router.put('/users/:id/role', auth, adminAuth, async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
