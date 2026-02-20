const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { getRecommendations } = require('../utils/aiRecommendations');
const auth = require('../middleware/auth');

// Create new order (authenticated users only)
router.post('/', auth, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      taxPrice,
      shippingPrice,
      total
    } = req.body;

    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    console.log('📦 Order creation request:', {
      userId,
      paymentMethod,
      orderItemsCount: orderItems?.length,
      shippingAddress: shippingAddress ? 'provided' : 'missing'
    });

    // Validate required fields
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Validate shipping address has all required fields (email is optional)
    const requiredAddressFields = ['name', 'phone', 'address', 'city', 'state', 'postalCode', 'country'];
    for (const field of requiredAddressFields) {
      if (!shippingAddress[field]) {
        return res.status(400).json({ message: `Shipping address field "${field}" is required` });
      }
    }

    // Verify products and calculate prices
    let calculatedTotal = 0;
    const verifiedOrderItems = [];

    for (const item of orderItems) {
      // Handle both string ID and ObjectId
      const productId = typeof item.product === 'string' ? item.product : item.product._id;
      
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }

      verifiedOrderItems.push({
        name: product.name,
        quantity: item.quantity,
        image: product.images?.[0] || '',
        price: product.price,
        product: product._id
      });

      calculatedTotal += product.price * item.quantity;
    }

    // Use provided totals if available, otherwise calculate
    let finalTotal, finalTaxPrice, finalShippingPrice;
    
    if (total !== undefined && taxPrice !== undefined && shippingPrice !== undefined) {
      finalTotal = total;
      finalTaxPrice = taxPrice;
      finalShippingPrice = shippingPrice;
    } else {
      // Calculate if not provided
      finalTaxPrice = calculatedTotal * 0.08; // 8% tax
      finalShippingPrice = calculatedTotal > 100 ? 0 : 10; // Free shipping over ₹100
      finalTotal = calculatedTotal + finalTaxPrice + finalShippingPrice;
    }

    // Create order
    const orderData = {
      user: userId,
      orderItems: verifiedOrderItems,
      shippingAddress: {
        name: shippingAddress.name || '',
        phone: shippingAddress.phone || '',
        email: shippingAddress.email || '',
        address: shippingAddress.address || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        postalCode: shippingAddress.postalCode || '',
        country: shippingAddress.country || 'India'
      },
      paymentMethod: paymentMethod || 'COD',
      taxPrice: finalTaxPrice,
      shippingPrice: finalShippingPrice,
      totalPrice: finalTotal,
      isPaid: paymentMethod !== 'COD',
      isDelivered: false,
      status: paymentMethod === 'COD' ? 'pending' : 'processing'
    };
    
    // Ensure orderId exists before saving
    if (!orderData.orderId) {
      const currentYear = new Date().getFullYear();
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      orderData.orderId = `PKS_${currentYear}_${timestamp}_${randomSuffix}`;
    }
    
    console.log('📦 Creating order with data:', {
      itemCount: orderData.orderItems.length,
      totalPrice: orderData.totalPrice,
      paymentMethod: orderData.paymentMethod,
      status: orderData.status,
      orderId: orderData.orderId
    });
    
    const order = new Order(orderData);
    const createdOrder = await order.save();

    // Update product stock
    for (const item of verifiedOrderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, popularity: item.quantity }
      }, { runValidators: false });
    }

    console.log('✅ Order created successfully:', createdOrder._id);
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({ message: error.message || 'Error creating order' });
  }
});

// Get user's orders
router.get('/myorders', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

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
    const userId = new mongoose.Types.ObjectId(req.user?.id);
    
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
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin
    let isAuthorized = false;
    
    if (req.user?.isAdmin) {
      isAuthorized = true;
    } else if (order.user && req.user?.id && order.user._id.toString() === req.user.id) {
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
router.put('/:id/status', auth, async (req, res) => {
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
router.put('/:id/pay', auth, async (req, res) => {
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
router.get('/:id/recommendations', auth, async (req, res) => {
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
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    console.log(`🚫 Cancel order request for order ${req.params.id} by user ${req.user?.id}`);
    
    const order = await Order.findById(req.params.id).populate('user');
    
    if (!order) {
      console.log(`❌ Order not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log(`📋 Order found: ${order._id}, User: ${order.user?._id}, Status: ${order.status}`);

    // Check if user owns the order - handle both string and ObjectId comparisons
    const orderUserId = order.user?._id?.toString() || order.user?.toString() || '';
    const requestUserId = req.user?.id?.toString() || req.user?.id || '';
    
    console.log(`🔐 Authorization check: Order user ${orderUserId} !== Request user ${requestUserId}`);
    
    if (orderUserId !== requestUserId) {
      return res.status(401).json({ 
        message: 'Not authorized to cancel this order',
        debug: {
          orderUserId,
          requestUserId,
          orderUserType: typeof order.user,
          requestUserType: typeof req.user?.id
        }
      });
    }

    // Can only cancel pending or processing orders
    const cancelableStatuses = ['pending', 'processing'];
    const currentStatus = order.status?.toLowerCase();
    
    if (!cancelableStatuses.includes(currentStatus)) {
      return res.status(400).json({ 
        message: `Cannot cancel order with status "${order.status}". Orders can only be cancelled if they are pending or processing.` 
      });
    }

    console.log(`🔄 Starting cancellation process for order ${order._id}`);

    // Restore stock
    for (const item of order.orderItems) {
      try {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, popularity: -item.quantity }
        });
        console.log(`✅ Restored ${item.quantity} units for product ${item.product}`);
      } catch (stockError) {
        console.error(`❌ Failed to restore stock for product ${item.product}:`, stockError);
      }
    }

    order.status = 'cancelled';
    
    // Ensure shipping address has all required fields before saving
    if (!order.shippingAddress.email) {
      order.shippingAddress.email = order.shippingAddress.email || '';
    }
    if (!order.shippingAddress.name) {
      order.shippingAddress.name = order.shippingAddress.name || '';
    }
    if (!order.shippingAddress.phone) {
      order.shippingAddress.phone = order.shippingAddress.phone || '';
    }
    if (!order.shippingAddress.state) {
      order.shippingAddress.state = order.shippingAddress.state || '';
    }
    
    const updatedOrder = await order.save({ validateBeforeSave: false });

    console.log(`✅ Order ${order._id} successfully cancelled by user ${requestUserId}`);
    res.json(updatedOrder);
  } catch (error) {
    console.error('❌ Cancel order error:', error);
    res.status(500).json({ 
      message: 'Failed to cancel order: ' + error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get order statistics (admin only)
router.get('/stats/overview', auth, async (req, res) => {
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
