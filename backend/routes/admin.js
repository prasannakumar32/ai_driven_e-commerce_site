const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const getPagination = (query) => {
  const limit = query.limit === undefined ? 50 : Number(query.limit);
  const skip = query.skip === undefined ? 0 : Number(query.skip);

  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100 ||
      !Number.isSafeInteger(skip) || skip < 0) {
    return null;
  }

  return { limit, skip };
};

const deliveryPartnerFilter = {
  $or: [
    { role: 'delivery_partner' },
    { vehicleType: { $exists: true } },
    { deliveryPartnerStatus: { $exists: true } }
  ]
};

const orderStatusTransitions = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['in-transit', 'cancelled'],
  'in-transit': ['out-for-delivery', 'delivered', 'cancelled'],
  'out-for-delivery': ['delivered', 'cancelled'],
  delivered: [],
  cancelled: []
};

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
      User.countDocuments(),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments(deliveryPartnerFilter),
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: 'seller', sellerStatus: 'pending' }),
      User.countDocuments({
        $and: [deliveryPartnerFilter, { deliveryPartnerStatus: 'pending' }]
      }),
      Order.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email')
    ]);

    const deliveredOrderValue = await Order.aggregate([
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
      deliveredOrderValue: deliveredOrderValue[0]?.total || 0,
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
    const pagination = getPagination(req.query);
    if (!pagination) {
      return res.status(400).json({ message: 'Invalid pagination parameters' });
    }

    const filter = { role: 'seller' };
    const sellers = await User.find({ role: 'seller' })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(pagination.limit)
      .skip(pagination.skip);
    const total = await User.countDocuments(filter);

    res.json({ sellers, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve seller
router.put('/sellers/:id/approve', auth, adminAuth, async (req, res) => {
  try {
    const existingSeller = await User.findOne({ _id: req.params.id, role: 'seller' }).select('sellerStatus');

    if (!existingSeller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    const currentStatus = existingSeller.sellerStatus || 'pending';
    if (!['pending', 'rejected', 'suspended'].includes(currentStatus)) {
      return res.status(409).json({ message: `Cannot approve seller with status ${currentStatus}` });
    }

    const statusFilter = existingSeller.sellerStatus
      ? existingSeller.sellerStatus
      : { $exists: false };
    const seller = await User.findOneAndUpdate(
      { _id: existingSeller._id, role: 'seller', sellerStatus: statusFilter },
      { $set: { sellerStatus: 'approved' } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!seller) {
      return res.status(409).json({ message: 'Seller status changed. Refresh and try again.' });
    }
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject seller
router.put('/sellers/:id/reject', auth, adminAuth, async (req, res) => {
  try {
    const existingSeller = await User.findOne({ _id: req.params.id, role: 'seller' }).select('sellerStatus');

    if (!existingSeller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    if ((existingSeller.sellerStatus || 'pending') !== 'pending') {
      return res.status(409).json({ message: `Cannot reject seller with status ${existingSeller.sellerStatus}` });
    }

    const statusFilter = existingSeller.sellerStatus
      ? existingSeller.sellerStatus
      : { $exists: false };
    const seller = await User.findOneAndUpdate(
      { _id: existingSeller._id, role: 'seller', sellerStatus: statusFilter },
      { $set: { sellerStatus: 'rejected' } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!seller) {
      return res.status(409).json({ message: 'Seller status changed. Refresh and try again.' });
    }
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all delivery partners with status
router.get('/delivery-partners', auth, adminAuth, async (req, res) => {
  try {
    const pagination = getPagination(req.query);
    if (!pagination) {
      return res.status(400).json({ message: 'Invalid pagination parameters' });
    }

    if (req.query.available !== undefined && req.query.available !== 'true') {
      return res.status(400).json({ message: 'Invalid delivery partner filter' });
    }

    const filter = req.query.available === 'true'
      ? { role: 'delivery_partner', deliveryPartnerStatus: { $in: ['active', 'approved'] } }
      : deliveryPartnerFilter;
    const partners = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(pagination.limit)
      .skip(pagination.skip);
    const total = await User.countDocuments(filter);

    res.json({ deliveryPartners: partners, total });
  } catch (error) {
    console.error('Error fetching delivery partners:', error);
    res.status(500).json({ message: error.message });
  }
});

// Approve delivery partner
router.put('/delivery-partners/:id/approve', auth, adminAuth, async (req, res) => {
  try {
    const existingPartner = await User.findOne({
      _id: req.params.id,
      ...deliveryPartnerFilter
    }).select('deliveryPartnerStatus');

    if (!existingPartner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    const currentStatus = existingPartner.deliveryPartnerStatus || 'pending';
    if (!['pending', 'suspended'].includes(currentStatus)) {
      return res.status(409).json({ message: `Cannot approve delivery partner with status ${currentStatus}` });
    }

    const statusFilter = existingPartner.deliveryPartnerStatus
      ? existingPartner.deliveryPartnerStatus
      : { $exists: false };
    const partner = await User.findOneAndUpdate(
      { _id: existingPartner._id, ...deliveryPartnerFilter, deliveryPartnerStatus: statusFilter },
      { $set: { deliveryPartnerStatus: 'active', role: 'delivery_partner' } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!partner) {
      return res.status(409).json({ message: 'Delivery partner status changed. Refresh and try again.' });
    }
    console.log(`✅ Delivery partner approved: ${partner.name} (${partner.email})`);
    res.json(partner);
  } catch (error) {
    console.error('Error approving delivery partner:', error);
    res.status(500).json({ message: error.message });
  }
});

// Reject delivery partner
router.put('/delivery-partners/:id/reject', auth, adminAuth, async (req, res) => {
  try {
    const existingPartner = await User.findOne({
      _id: req.params.id,
      ...deliveryPartnerFilter
    }).select('deliveryPartnerStatus');

    if (!existingPartner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    const currentStatus = existingPartner.deliveryPartnerStatus || 'pending';
    if (!['pending', 'approved', 'active'].includes(currentStatus)) {
      return res.status(409).json({ message: `Cannot suspend delivery partner with status ${currentStatus}` });
    }

    const statusFilter = existingPartner.deliveryPartnerStatus
      ? existingPartner.deliveryPartnerStatus
      : { $exists: false };
    const partner = await User.findOneAndUpdate(
      { _id: existingPartner._id, ...deliveryPartnerFilter, deliveryPartnerStatus: statusFilter },
      { $set: { deliveryPartnerStatus: 'suspended' } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!partner) {
      return res.status(409).json({ message: 'Delivery partner status changed. Refresh and try again.' });
    }
    res.json(partner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders
router.get('/orders', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const pagination = getPagination(req.query);
    if (!pagination) {
      return res.status(400).json({ message: 'Invalid pagination parameters' });
    }

    const filter = status ? { status } : {};

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('deliveryPartner', 'name phone')
      .sort({ createdAt: -1 })
      .limit(pagination.limit)
      .skip(pagination.skip);

    const total = await Order.countDocuments(filter);

    res.json({ orders, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.put('/orders/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (typeof status !== 'string' || !Object.prototype.hasOwnProperty.call(orderStatusTransitions, status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.isDelivered && order.status !== 'delivered') {
      return res.status(409).json({ message: 'Order delivery state is inconsistent. Please review this order before updating it.' });
    }

    const allowedTransitions = orderStatusTransitions[order.status] || [];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        message: `Cannot change order status from ${order.status} to ${status}`,
        currentStatus: order.status,
        allowedTransitions
      });
    }

    if (status === 'in-transit' && !order.deliveryPartner) {
      return res.status(400).json({ message: 'Assign a delivery partner before moving the order to in-transit' });
    }

    const updatedAt = new Date();
    const update = {
      $set: { status },
      $push: {
        statusTimeline: {
          status,
          timestamp: updatedAt,
          location: order.currentLocation || '',
          notes: typeof notes === 'string' && notes.trim()
            ? notes.trim().slice(0, 500)
            : `Status changed by admin from ${order.status} to ${status}`
        }
      }
    };

    if (status === 'delivered') {
      update.$set.isDelivered = true;
      update.$set.deliveredAt = updatedAt;
      update.$set.actualDeliveryDate = updatedAt;
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: order._id, status: order.status },
      update,
      { new: true, runValidators: true }
    ).populate('user', 'name email').populate('deliveryPartner', 'name phone');

    if (!updatedOrder) {
      return res.status(409).json({ message: 'Order status changed while you were updating it. Refresh and try again.' });
    }

    res.json(updatedOrder);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// Assign delivery partner to order
router.put('/orders/:id/assign-delivery-partner', auth, adminAuth, async (req, res) => {
  try {
    const { deliveryPartnerId } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'shipped') {
      return res.status(400).json({ message: 'Order must be in shipped status to assign delivery partner' });
    }

    if (order.deliveryPartner) {
      return res.status(400).json({ message: 'Order already has a delivery partner assigned' });
    }

    const deliveryPartner = await User.findById(deliveryPartnerId);
    if (!deliveryPartner || deliveryPartner.role !== 'delivery_partner') {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    if (deliveryPartner.deliveryPartnerStatus !== 'active' && deliveryPartner.deliveryPartnerStatus !== 'approved') {
      return res.status(400).json({ message: 'Delivery partner is not active' });
    }

    order.deliveryPartner = deliveryPartnerId;
    order.deliveryPartnerAssignedAt = new Date();
    order.status = 'in-transit';
    order.statusTimeline.push({
      status: 'in-transit',
      timestamp: new Date(),
      location: 'Warehouse',
      notes: `Order assigned to delivery partner: ${deliveryPartner.name} by admin`
    });

    await order.save();

    // Update delivery partner stats
    await User.findByIdAndUpdate(deliveryPartnerId, {
      $inc: { totalDeliveries: 1 }
    });

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('deliveryPartner', 'name');

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all products
router.get('/products', auth, adminAuth, async (req, res) => {
  try {
    const pagination = getPagination(req.query);
    if (!pagination) {
      return res.status(400).json({ message: 'Invalid pagination parameters' });
    }

    const products = await Product.find()
      .populate('seller', 'name businessName')
      .sort({ createdAt: -1 })
      .limit(pagination.limit)
      .skip(pagination.skip);

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
    const { role } = req.query;
    const pagination = getPagination(req.query);
    if (!pagination) {
      return res.status(400).json({ message: 'Invalid pagination parameters' });
    }

    const filter = role ? { role } : {};

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(pagination.limit)
      .skip(pagination.skip);

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
    const user = await User.findById(req.params.id).select('_id role');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin' || String(user._id) === String(req.user._id)) {
      return res.status(403).json({ message: 'Admin accounts and your own account cannot be deleted here' });
    }

    const [orderCount, deliveryCount, productCount] = await Promise.all([
      Order.countDocuments({ user: user._id }),
      Order.countDocuments({ deliveryPartner: user._id }),
      Product.countDocuments({ seller: user._id })
    ]);

    if (orderCount || deliveryCount || productCount) {
      return res.status(409).json({
        message: 'Users with order history, assigned deliveries, or products cannot be deleted'
      });
    }

    const deletedUser = await User.findOneAndDelete({ _id: user._id, role: { $ne: 'admin' } });
    if (!deletedUser) {
      return res.status(403).json({ message: 'Admin accounts cannot be deleted here' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new user
router.post('/users', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedRole = role || 'customer';
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';

    if (!normalizedName || !normalizedEmail || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (normalizedName.length < 2 || normalizedName.length > 50) {
      return res.status(400).json({ message: 'Name must be between 2 and 50 characters long' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (!['customer', 'seller', 'delivery_partner', 'admin'].includes(normalizedRole)) {
      return res.status(400).json({ message: 'Invalid user role' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail }).select('_id');
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const emailPrefix = normalizedEmail.split('@')[0];
    let usernameBase = emailPrefix
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
    if (usernameBase.length < 3) {
      usernameBase = `user_${usernameBase}`;
    }
    usernameBase = (usernameBase || 'user').slice(0, 30);

    let username = usernameBase;
    let suffix = 1;
    while (await User.exists({ username })) {
      const suffixText = `_${suffix}`;
      username = `${usernameBase.slice(0, 30 - suffixText.length)}${suffixText}`;
      suffix += 1;
    }

    const user = new User({
      username,
      name: normalizedName,
      email: normalizedEmail,
      password,
      role: normalizedRole,
      phone: normalizedPhone
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || error.keyValue || {})[0];
      if (duplicateField === 'email') {
        return res.status(409).json({ message: 'User with this email already exists' });
      }
      if (duplicateField === 'username') {
        return res.status(409).json({ message: 'Unable to generate a unique username. Please try again.' });
      }
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((validationError) => validationError.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

module.exports = router;
