const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { getRecommendations } = require('../utils/aiRecommendations');
const { assignDeliveryPartner } = require('../utils/deliveryPartnerAssignment');
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

    const userId = new mongoose.Types.ObjectId(req.user._id);
    
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
      try {
        // Handle both string ID and ObjectId
        const productId = typeof item.product === 'string' ? item.product : item.product._id;

        let product;

        // Fallback: If productId is "unknown" or invalid, try to find product by name
        if (!productId || productId === 'unknown' || productId === 'null' || productId === 'undefined') {
          console.warn('⚠️ Product ID is invalid, attempting to find by name:', item.name);
          
          // Try exact match first
          product = await Product.findOne({ name: item.name });
          
          // If not found, try case-insensitive match
          if (!product) {
            product = await Product.findOne({ 
              name: { $regex: new RegExp(`^${item.name}$`, 'i') } 
            });
          }
          
          // If still not found, try partial match
          if (!product) {
            product = await Product.findOne({ 
              name: { $regex: item.name, $options: 'i' } 
            });
          }
          
          if (!product) {
            console.error('❌ Product not found by name:', item.name);
            return res.status(404).json({
              message: `Product not found: ${item.name}. Please contact support with order details.`,
              error: 'PRODUCT_NOT_FOUND',
              productName: item.name
            });
          }
          console.log('✅ Found product by name:', product.name, 'ID:', product._id);
        } else {
          // Try to convert to ObjectId if it's a string
          try {
            product = await Product.findById(productId);
            if (!product) {
              console.error('❌ Product not found by ID:', productId);
              // Fallback to name search if ID lookup fails
              console.warn('⚠️ ID lookup failed, trying name fallback for:', item.name);
              product = await Product.findOne({ name: item.name });
              if (!product) {
                return res.status(404).json({ 
                  message: `Product not found with ID: ${productId}` 
                });
              }
              console.log('✅ Found product by name fallback:', product.name, 'ID:', product._id);
            }
          } catch (idError) {
            console.error('❌ Invalid ObjectId format:', productId, idError);
            // Fallback to name search
            console.warn('⚠️ Invalid ObjectId, trying name fallback for:', item.name);
            product = await Product.findOne({ name: item.name });
            if (!product) {
              return res.status(400).json({ 
                message: `Invalid product ID: ${productId}` 
              });
            }
            console.log('✅ Found product by name fallback:', product.name, 'ID:', product._id);
          }
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
          });
        }

        // Use seller data from request or fetch from product
        let sellerData = {
          seller: product.seller?.toString() || item.seller || 'unknown',
          sellerName: item.sellerName || 'Unknown',
          sellerBusinessName: item.sellerBusinessName || 'Unknown',
          sellerLocation: item.sellerLocation || null
        };

        // If seller information is missing from request, fetch it from User model
        if (!item.seller || item.seller === 'unknown' || !item.sellerName || item.sellerName === 'Unknown') {
          if (product.seller) {
            try {
              const sellerUser = await User.findById(product.seller);
              if (sellerUser) {
                sellerData.seller = product.seller.toString();
                sellerData.sellerName = sellerUser.name || 'Unknown';
                sellerData.sellerBusinessName = sellerUser.businessName || 'Unknown';
                // Extract seller location from addresses if available
                if (sellerUser.addresses && sellerUser.addresses.length > 0) {
                  const defaultAddress = sellerUser.addresses.find(addr => addr.isDefault) || sellerUser.addresses[0];
                  if (defaultAddress) {
                    sellerData.sellerLocation = {
                      city: defaultAddress.city,
                      state: defaultAddress.state,
                      country: defaultAddress.country
                    };
                  }
                }
              }
            } catch (sellerError) {
              console.warn('⚠️ Could not fetch seller details:', sellerError.message);
            }
          }
        }

        verifiedOrderItems.push({
          name: product.name,
          quantity: item.quantity,
          image: item.image || product.images?.[0] || '',
          price: product.price,
          product: product._id,
          seller: sellerData.seller,
          sellerName: sellerData.sellerName,
          sellerBusinessName: sellerData.sellerBusinessName,
          sellerLocation: sellerData.sellerLocation
        });

        calculatedTotal += product.price * item.quantity;
      } catch (itemError) {
        console.error('❌ Error processing order item:', item, itemError);
        return res.status(500).json({ 
          message: `Error processing item: ${item.name || 'Unknown'}`,
          error: itemError.message 
        });
      }
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
      paidAt: paymentMethod !== 'COD' ? Date.now() : undefined,
      paymentResult: paymentMethod !== 'COD' ? {
        id: paymentMethod === 'stripe' ? `stripe_${Date.now()}` : 'payment_id',
        status: 'completed',
        update_time: new Date().toISOString()
      } : undefined,
      isDelivered: false,
      status: paymentMethod === 'COD' ? 'pending' : 'processing',
      // Set estimated delivery date automatically (3-5 days from now)
      estimatedDeliveryDate: new Date(Date.now() + (4 * 24 * 60 * 60 * 1000)) // 4 days
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

    // Auto-assign delivery partner if order is created with 'shipped' status
    if (createdOrder.status === 'shipped' && !createdOrder.deliveryPartner) {
      console.log('📦 Order created with shipped status, attempting auto-assignment...');
      assignDeliveryPartner(createdOrder._id).catch(err => {
        console.error('Error in auto-assignment:', err);
      });
    }

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
    const userId = new mongoose.Types.ObjectId(req.user._id);

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
      .populate('orderItems.product', 'name images')
      .populate('deliveryPartner', 'name phone vehicleType vehicleNumber');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin
    let isAuthorized = false;
    
    if (req.user?.isAdmin) {
      isAuthorized = true;
    } else if (order.user && req.user?.id && order.user._id.toString() === req.user._id) {
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

// Update order status (admin only) - with timeline tracking
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, location, notes, estimatedDeliveryDate, carrier, trackingNumber } = req.body;

    if (!req.user?.isAdmin) {
      return res.status(401).json({ message: 'Admin access required' });
    }

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update status
    const previousStatus = order.status;
    order.status = status;

    // Add to status timeline
    if (!order.statusTimeline || !Array.isArray(order.statusTimeline)) {
      order.statusTimeline = [];
    }
    order.statusTimeline.push({
      status: status,
      timestamp: new Date(),
      location: location || order.currentLocation || '',
      notes: notes || ''
    });

    // Update location if provided
    if (location) {
      order.currentLocation = location;
    }

    // Update tracking information if provided
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (carrier) {
      order.carrier = carrier;
    }

    if (estimatedDeliveryDate) {
      order.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
    }

    // Handle delivered status
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.actualDeliveryDate = new Date();
    }

    // Auto-assign delivery partner when order is shipped
    if (status === 'shipped' && !order.deliveryPartner) {
      console.log('📦 Order status changed to shipped, attempting auto-assignment...');
      // Trigger auto-assignment in background (don't await to avoid slowing down response)
      assignDeliveryPartner(order._id).catch(err => {
        console.error('Error in auto-assignment:', err);
      });
    }

    // Handle cancelled status
    if (status === 'cancelled') {
      // Don't override delivery status if already delivered
      if (!order.isDelivered) {
        order.status = 'cancelled';
      }
    }

    const updatedOrder = await order.save();

    console.log(`✅ Order status updated: ${previousStatus} → ${status}`);
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: error.message || 'Failed to update order status' });
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

// Manual trigger to update delivery status for orders past their estimated delivery date
router.post('/admin/update-delivery-status', auth, async (req, res) => {
  try {
    // Check admin access
    if (!req.user?.isAdmin) {
      return res.status(401).json({ message: 'Admin access required' });
    }

    const { updateDeliveredOrders } = require('../utils/deliveryStatusUpdater');
    const updatedCount = await updateDeliveredOrders();

    res.json({
      message: `Successfully updated ${updatedCount || 0} order(s) to delivered status`,
      ordersUpdated: updatedCount || 0
    });
  } catch (error) {
    console.error('❌ Error updating delivery status:', error);
    res.status(500).json({ message: error.message || 'Failed to update delivery status' });
  }
});

// Auto-assign delivery partner to all unassigned shipped orders (admin only)
router.post('/admin/auto-assign-partners', auth, async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(401).json({ message: 'Admin access required' });
    }

    // Find all shipped orders without delivery partners
    const unassignedOrders = await Order.find({
      status: 'shipped',
      deliveryPartner: { $exists: false }
    });

    if (unassignedOrders.length === 0) {
      return res.json({
        message: 'No unassigned shipped orders found',
        assignedCount: 0
      });
    }

    console.log(`📋 Found ${unassignedOrders.length} unassigned shipped orders`);

    let assignedCount = 0;
    const assignmentResults = [];

    for (const order of unassignedOrders) {
      try {
        const partnerId = await assignDeliveryPartner(order._id);
        if (partnerId) {
          assignedCount++;
          assignmentResults.push({
            orderId: order._id,
            status: 'assigned',
            partnerId: partnerId
          });
        } else {
          assignmentResults.push({
            orderId: order._id,
            status: 'no-partner-available'
          });
        }
      } catch (err) {
        console.error(`Error assigning partner to order ${order._id}:`, err);
        assignmentResults.push({
          orderId: order._id,
          status: 'error',
          error: err.message
        });
      }
    }

    res.json({
      message: `Successfully assigned delivery partners to ${assignedCount} out of ${unassignedOrders.length} orders`,
      totalOrders: unassignedOrders.length,
      assignedCount: assignedCount,
      results: assignmentResults
    });
  } catch (error) {
    console.error('❌ Error in auto-assigning partners:', error);
    res.status(500).json({ message: error.message || 'Failed to auto-assign partners' });
  }
});

// Reassign order to a different delivery partner (admin only)
router.put('/:id/reassign-partner', auth, async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(401).json({ message: 'Admin access required' });
    }

    const { newPartnerId } = req.body;

    if (!newPartnerId) {
      return res.status(400).json({ message: 'New delivery partner ID is required' });
    }

    const { reassignDeliveryPartner } = require('../utils/deliveryPartnerAssignment');
    const updatedOrder = await reassignDeliveryPartner(req.params.id, newPartnerId);

    res.json({
      message: 'Order reassigned successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('❌ Error reassigning delivery partner:', error);
    res.status(500).json({ message: error.message || 'Failed to reassign delivery partner' });
  }
});

module.exports = router;
