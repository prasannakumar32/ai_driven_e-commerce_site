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
      User.countDocuments({ role: { $in: ['customer', 'admin'] } }),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({
        $or: [
          { role: 'delivery_partner' },
          { vehicleType: { $exists: true } }
        ]
      }),
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: 'seller', sellerStatus: 'pending' }),
      User.countDocuments({
        $or: [
          { role: 'delivery_partner', deliveryPartnerStatus: 'pending' },
          { vehicleType: { $exists: true }, deliveryPartnerStatus: 'pending' }
        ]
      }),
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
    // Find users who either have role: 'delivery_partner' OR have delivery partner details
    const partners = await User.find({
      $or: [
        { role: 'delivery_partner' },
        { vehicleType: { $exists: true } },
        { deliveryPartnerStatus: { $exists: true } }
      ]
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(partners);
  } catch (error) {
    console.error('Error fetching delivery partners:', error);
    res.status(500).json({ message: error.message });
  }
});

// Approve delivery partner
router.put('/delivery-partners/:id/approve', auth, adminAuth, async (req, res) => {
  try {
    const partner = await User.findByIdAndUpdate(
      req.params.id,
      {
        deliveryPartnerStatus: 'active',
        role: 'delivery_partner' // Ensure role is set to delivery_partner
      },
      { new: true }
    ).select('-password');

    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
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

// Create new user
router.post('/users', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || 'customer',
      phone: phone || ''
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create test orders for delivery partners
router.post('/create-test-orders', auth, adminAuth, async (req, res) => {
  try {
    const { count = 5 } = req.body;

    // Get a customer user
    const customer = await User.findOne({ role: 'customer' });
    if (!customer) {
      return res.status(404).json({ message: 'No customer user found' });
    }

    // Get some products
    const products = await Product.find().limit(10);
    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    // Create test orders
    const orders = [];
    for (let i = 0; i < count; i++) {
      const order = new Order({
        user: customer._id,
        orderItems: [
          {
            name: products[i % products.length].name,
            quantity: 1,
            image: products[i % products.length].images[0],
            price: products[i % products.length].price,
            product: products[i % products.length]._id
          }
        ],
        shippingAddress: {
          name: customer.name,
          phone: '9876543210',
          email: customer.email,
          address: '123 Main Street',
          city: 'Namakkal',
          state: 'Tamil Nadu',
          postalCode: '637001',
          country: 'India'
        },
        paymentMethod: 'COD',
        taxPrice: 100,
        shippingPrice: 50,
        totalPrice: products[i % products.length].price + 150,
        isPaid: true,
        paidAt: new Date(),
        status: 'shipped', // Ready for delivery
        statusTimeline: [
          {
            status: 'pending',
            timestamp: new Date(Date.now() - 86400000),
            notes: 'Order created'
          },
          {
            status: 'processing',
            timestamp: new Date(Date.now() - 43200000),
            notes: 'Order processing'
          },
          {
            status: 'shipped',
            timestamp: new Date(),
            notes: 'Order shipped and ready for delivery'
          }
        ]
      });

      await order.save();
      orders.push(order);
    }

    res.json({
      message: `Created ${orders.length} test orders`,
      orders: orders.map(o => o.orderId)
    });
  } catch (error) {
    console.error('Error creating test orders:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
