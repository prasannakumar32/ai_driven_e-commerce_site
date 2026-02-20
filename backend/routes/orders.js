const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { getRecommendations } = require('../utils/aiRecommendations');
const auth = require('../middleware/auth');

// Guest authentication middleware (for COD orders)
const guestAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const guestId = req.headers['x-guest-id'];
  
  console.log('Guest auth - Token:', token);
  console.log('Guest auth - Guest ID:', guestId);
  
  if (token) {
    // If token is provided, use regular auth
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.user = decoded;
      req.isGuest = false;
      return next();
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  }
  
  // If no valid token but guest ID is provided, allow guest access
  if (guestId) {
    req.user = { id: null, isGuest: true, guestId: guestId };
    req.isGuest = true;
    return next();
  }
  
  // If neither token nor guest ID, deny access
  return res.status(401).json({ message: 'Authentication required' });
};

// Create new order (supports both authenticated and guest users)
router.post('/', guestAuth, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod
    } = req.body;

    const userId = req.user?.id || null;
    const isGuest = req.user?.isGuest || false;
    
    console.log('📦 Order creation request:', {
      userId,
      isGuest,
      paymentMethod,
      orderItemsCount: orderItems?.length,
      shippingAddress: shippingAddress ? 'provided' : 'missing'
    });

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Verify products and calculate prices
    let totalPrice = 0;
    const verifiedOrderItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      verifiedOrderItems.push({
        name: product.name,
        quantity: item.quantity,
        image: product.images[0],
        price: product.price,
        product: product._id
      });

      totalPrice += product.price * item.quantity;
    }

    // Calculate additional costs
    const taxPrice = totalPrice * 0.08; // 8% tax
    const shippingPrice = totalPrice > 100 ? 0 : 10; // Free shipping over $100
    const finalTotal = totalPrice + taxPrice + shippingPrice;

    // Create order
    const orderData = {
      user: userId,
      orderItems: verifiedOrderItems,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice: finalTotal,
      isPaid: false,
      isDelivered: false,
      status: paymentMethod === 'COD' ? 'pending' : 'processing',
      createdAt: new Date(),
      paidAt: paymentMethod === 'COD' ? null : new Date()
    };
    
    // Add guest ID if applicable
    if (isGuest && req.user?.guestId) {
      orderData.guestId = req.user.guestId;
    }
    
    console.log('📦 Creating order with data:', {
      ...orderData,
      user: typeof orderData.user,
      paymentMethod: orderData.paymentMethod,
      isGuest: isGuest,
      guestId: orderData.guestId
    });

    const order = new Order(orderData);

    // Update product stock
    for (const item of verifiedOrderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, popularity: item.quantity }
      });
    }

    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's orders
router.get('/myorders', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('orderItems.product', 'name images');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get seller's orders (MUST come before /:id route)
router.get('/seller', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access denied. Only sellers can view orders.' });
    }

    // Find orders that contain products from this seller
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images seller')
      .sort({ createdAt: -1 });

    // Filter orders to only include those with seller's products
    const sellerOrders = orders.filter(order => 
      order.orderItems.some(item => item.product.seller && item.product.seller.toString() === userId)
    ).map(order => ({
      ...order.toObject(),
      items: order.orderItems.filter(item => 
        item.product.seller && item.product.seller.toString() === userId
      ).map(item => ({
        quantity: item.quantity,
        product: {
          name: item.product.name,
          _id: item.product._id
        }
      })),
      customer: {
        name: order.user.name,
        email: order.user.email
      },
      total: order.orderItems
        .filter(item => item.product.seller && item.product.seller.toString() === userId)
        .reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }));

    res.json(sellerOrders);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get order by ID (MUST come after /seller route)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const guestId = req.headers['x-guest-id'];
    
    let isAuthorized = false;
    
    if (token && req.user?.isAdmin) {
      isAuthorized = true;
    } else if (order.user && req.user?.id && order.user._id.toString() === req.user.id) {
      isAuthorized = true;
    } else if (order.guestId && guestId && order.guestId === guestId) {
      isAuthorized = true;
    } else if (!order.user && !order.guestId) {
      // Public order (no user or guest ID)
      isAuthorized = true;
    }
    
    if (!isAuthorized) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (admin only)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!req.user?.isAdmin) {
      return res.status(401).json({ message: 'Admin access required' });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;

    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update payment status
router.put('/:id/pay', async (req, res) => {
  try {
    const { paymentResult } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = paymentResult;
    order.status = 'processing';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get AI recommendations based on order history
router.get('/:id/recommendations', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('orderItems.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const recommendations = [];
    
    // Get recommendations for each product in the order
    for (const item of order.orderItems) {
      const productRecommendations = await getRecommendations(item.product, order.user);
      recommendations.push(...productRecommendations);
    }

    // Remove duplicates and limit
    const uniqueRecommendations = recommendations
      .filter((rec, index, self) => 
        index === self.findIndex(r => r._id.toString() === rec._id.toString())
      )
      .slice(0, 10);

    res.json(uniqueRecommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel order
router.put('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user?.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Can only cancel pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel order in current status' });
    }

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, popularity: -item.quantity }
      });
    }

    order.status = 'cancelled';
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order statistics (admin only)
router.get('/stats/overview', async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(401).json({ message: 'Admin access required' });
    }

    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          averageOrderValue: { $avg: '$totalPrice' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json(stats[0] || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
