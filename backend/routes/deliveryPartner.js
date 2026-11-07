const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get available orders for delivery (orders that are 'shipped' but not assigned to a delivery partner)
router.get('/available-orders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'delivery_partner') {
      return res.status(403).json({ message: 'Access denied. Only delivery partners can view available orders.' });
    }

    // Check if delivery partner is approved and available
    if (req.user.deliveryPartnerStatus !== 'approved' && req.user.deliveryPartnerStatus !== 'active') {
      return res.json([]); // Return empty array for pending partners
    }

    if (!req.user.isAvailable) {
      return res.json([]); // Return empty array if unavailable
    }

    const availableOrders = await Order.find({
      status: 'shipped',
      deliveryPartner: { $exists: false }
    })
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name images')
      .sort({ createdAt: 1 });

    res.json(availableOrders);
  } catch (error) {
    console.error('Error fetching available orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get orders assigned to the delivery partner
router.get('/my-orders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'delivery_partner') {
      return res.status(403).json({ message: 'Access denied. Only delivery partners can view their orders.' });
    }

    const myOrders = await Order.find({
      deliveryPartner: req.user._id,
      status: { $in: ['shipped', 'in-transit', 'out-for-delivery', 'delivered'] }
    })
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name images')
      .sort({ createdAt: -1 });

    res.json(myOrders);
  } catch (error) {
    console.error('Error fetching delivery partner orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get delivery partner statistics
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'delivery_partner') {
      return res.status(403).json({ message: 'Access denied. Only delivery partners can view their stats.' });
    }

    const stats = await Order.aggregate([
      { $match: { deliveryPartner: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: null,
          totalDeliveries: { $sum: 1 },
          completedDeliveries: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          inProgressDeliveries: {
            $sum: {
              $cond: [
                { $in: ['$status', ['shipped', 'in-transit', 'out-for-delivery']] },
                1,
                0
              ]
            }
          },
          totalEarnings: { $sum: '$shippingPrice' }
        }
      }
    ]);

    res.json(stats[0] || {
      totalDeliveries: 0,
      completedDeliveries: 0,
      inProgressDeliveries: 0,
      totalEarnings: 0
    });
  } catch (error) {
    console.error('Error fetching delivery partner stats:', error);
    res.json({ // Return default stats on error instead of 500
      totalDeliveries: 0,
      completedDeliveries: 0,
      inProgressDeliveries: 0,
      totalEarnings: 0
    });
  }
});

// Accept an order for delivery
router.put('/accept-order/:orderId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'delivery_partner') {
      return res.status(403).json({ message: 'Access denied. Only delivery partners can accept orders.' });
    }

    if (req.user.deliveryPartnerStatus !== 'approved' && req.user.deliveryPartnerStatus !== 'active') {
      return res.status(403).json({ message: 'Your delivery partner account is not approved yet.' });
    }

    if (!req.user.isAvailable) {
      return res.status(403).json({ message: 'You are currently marked as unavailable.' });
    }

    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'shipped') {
      return res.status(400).json({ message: 'Order is not ready for delivery' });
    }

    if (order.deliveryPartner) {
      return res.status(400).json({ message: 'Order is already assigned to a delivery partner' });
    }

    // Assign order to delivery partner
    order.deliveryPartner = req.user._id;
    order.deliveryPartnerAssignedAt = new Date();
    order.status = 'in-transit';

    // Initialize statusTimeline if it doesn't exist
    if (!order.statusTimeline || !Array.isArray(order.statusTimeline)) {
      order.statusTimeline = [];
    }

    order.statusTimeline.push({
      status: 'in-transit',
      timestamp: new Date(),
      location: 'Warehouse',
      notes: `Order assigned to delivery partner: ${req.user.name}`
    });

    await order.save();

    // Update delivery partner stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalDeliveries: 1 }
    });

    res.json(order);
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update order status (for delivery partner)
router.put('/update-status/:orderId', auth, async (req, res) => {
  try {
    console.log('📦 Update status request:', {
      orderId: req.params.orderId,
      userId: req.user._id,
      userRole: req.user.role,
      requestBody: req.body
    });

    if (req.user.role !== 'delivery_partner') {
      return res.status(403).json({ message: 'Access denied. Only delivery partners can update order status.' });
    }

    const { status, location, notes, carrier, trackingNumber } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Validate status value
    const validStatuses = ['in-transit', 'out-for-delivery', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be one of: in-transit, out-for-delivery, delivered' });
    }

    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('📦 Order found:', {
      orderId: order._id,
      currentStatus: order.status,
      deliveryPartner: order.deliveryPartner?.toString(),
      requesterId: req.user._id.toString()
    });

    // Verify the order is assigned to this delivery partner
    if (order.deliveryPartner?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This order is not assigned to you' });
    }

    // Validate status transition
    const validTransitions = {
      'shipped': ['in-transit'],
      'in-transit': ['out-for-delivery', 'delivered'],
      'out-for-delivery': ['delivered']
    };

    const allowedTransitions = validTransitions[order.status] || [];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${order.status} to ${status}`,
        currentStatus: order.status,
        requestedStatus: status,
        allowedTransitions
      });
    }

    // Update status
    const previousStatus = order.status;
    order.status = status;

    // Initialize statusTimeline if it doesn't exist
    if (!order.statusTimeline || !Array.isArray(order.statusTimeline)) {
      order.statusTimeline = [];
    }

    // Add to status timeline
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

    // Handle delivered status
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.actualDeliveryDate = new Date();
    }

    const updatedOrder = await order.save();

    console.log(`✅ Order status updated by delivery partner: ${previousStatus} → ${status}`);
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      errors: error.errors
    });

    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      return res.status(400).json({
        message: 'Validation error',
        details: validationErrors
      });
    }

    res.status(500).json({
      message: error.message || 'Failed to update order status',
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
  }
});

// Update delivery partner availability
router.put('/availability', auth, async (req, res) => {
  try {
    if (req.user.role !== 'delivery_partner') {
      return res.status(403).json({ message: 'Access denied. Only delivery partners can update availability.' });
    }

    const { isAvailable } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    res.json({ message: 'Availability updated successfully', isAvailable });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update delivery partner location
router.put('/location', auth, async (req, res) => {
  try {
    if (req.user.role !== 'delivery_partner') {
      return res.status(403).json({ message: 'Access denied. Only delivery partners can update location.' });
    }

    const { coordinates } = req.body;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ message: 'Valid coordinates [longitude, latitude] are required' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      currentLocation: {
        type: 'Point',
        coordinates: coordinates
      }
    });

    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
