/**
 * Automatic Delivery Status Updater
 * Checks orders periodically and updates status to 'delivered' 
 * when the estimated delivery date has passed
 */

const Order = require('../models/Order');

/**
 * Update orders that have reached their estimated delivery date
 * This function automatically marks orders as delivered when the date passes
 */
const updateDeliveredOrders = async () => {
  try {
    const now = new Date();
    
    // Find orders with explicit estimatedDeliveryDate in the past
    const ordersToUpdate = await Order.find({
      estimatedDeliveryDate: { $lt: now },
      status: { $ne: 'delivered' },
      isDelivered: false
    });

    if (ordersToUpdate.length === 0) {
      const cutoffDate = new Date(Date.now() - (2 * 24 * 60 * 60 * 1000));
      
      const oldOrders = await Order.find({
        createdAt: { $lt: cutoffDate },
        estimatedDeliveryDate: { $exists: false },
        status: { $ne: 'delivered' },
        isDelivered: false
      });

      if (oldOrders.length === 0) {
        // Silently skip if no orders to update
        return 0;
      }

      // Auto-mark old orders as delivered
      let updatedCount = 0;
      for (const order of oldOrders) {
        try {
          if (order.status === 'cancelled') {
            continue;
          }

          const previousStatus = order.status;
          order.status = 'delivered';
          order.isDelivered = true;
          order.deliveredAt = new Date();
          order.actualDeliveryDate = new Date();
          
          // Set estimated delivery date to 4 days after creation
          if (!order.estimatedDeliveryDate) {
            order.estimatedDeliveryDate = new Date(order.createdAt.getTime() + (4 * 24 * 60 * 60 * 1000));
          }

          // Ensure shipping address has all required fields
          if (order.shippingAddress) {
            order.shippingAddress.name = order.shippingAddress.name || 'Customer';
            order.shippingAddress.phone = order.shippingAddress.phone || 'N/A';
            order.shippingAddress.state = order.shippingAddress.state || 'N/A';
            order.shippingAddress.address = order.shippingAddress.address || 'Address not provided';
            order.shippingAddress.city = order.shippingAddress.city || 'N/A';
            order.shippingAddress.postalCode = order.shippingAddress.postalCode || '000000';
            order.shippingAddress.country = order.shippingAddress.country || 'India';
          }

          order.statusTimeline.push({
            status: 'delivered',
            timestamp: new Date(),
            location: order.currentLocation || 'Delivery complete',
            notes: 'Automatically marked as delivered - order age exceeded delivery window'
          });

          await order.save();
          updatedCount++;

          console.log(`✅ Order ${order.orderId} automatically updated: ${previousStatus} → delivered (auto-aged)`);
        } catch (itemError) {
          console.error(`⚠️  Failed to update order ${order.orderId}:`, itemError.message);
          continue;
        }
      }

      if (updatedCount > 0) {
        console.log(`✅ Auto-updated ${updatedCount} order(s) to delivered status (age-based)`);
      }

      return updatedCount;
    }

    console.log(`📦 Checking ${ordersToUpdate.length} order(s) for automatic delivery status update...`);

    let updatedCount = 0;

    for (const order of ordersToUpdate) {
      try {
        // Skip cancelled orders
        if (order.status === 'cancelled') {
          continue;
        }

        const previousStatus = order.status;

        // Update status to delivered
        order.status = 'delivered';
        order.isDelivered = true;
        order.deliveredAt = new Date();
        order.actualDeliveryDate = new Date();

        // Ensure shipping address has all required fields
        if (order.shippingAddress) {
          order.shippingAddress.name = order.shippingAddress.name || 'Customer';
          order.shippingAddress.phone = order.shippingAddress.phone || 'N/A';
          order.shippingAddress.state = order.shippingAddress.state || 'N/A';
          order.shippingAddress.address = order.shippingAddress.address || 'Address not provided';
          order.shippingAddress.city = order.shippingAddress.city || 'N/A';
          order.shippingAddress.postalCode = order.shippingAddress.postalCode || '000000';
          order.shippingAddress.country = order.shippingAddress.country || 'India';
        }

        // Add to status timeline
        order.statusTimeline.push({
          status: 'delivered',
          timestamp: new Date(),
          location: order.currentLocation || 'Delivery complete',
          notes: 'Automatically marked as delivered - estimated delivery date reached'
        });

        await order.save();
        updatedCount++;

        console.log(`✅ Order ${order.orderId} automatically updated: ${previousStatus} → delivered`);
      } catch (itemError) {
        console.error(`⚠️  Failed to update order ${order.orderId}:`, itemError.message);
        continue;
      }
    }

    if (updatedCount > 0) {
      console.log(`✅ Auto-updated ${updatedCount} order(s) to delivered status`);
    }

    return updatedCount;
  } catch (error) {
    console.error('❌ Error in automatic delivery status update:', error.message);
    return 0;
  }
};

/**
 * Start the scheduled task to check and update delivery status
 * Runs every 10 minutes by default
 * @param {number} intervalMs - Interval in milliseconds (default: 10 minutes)
 */
const startDeliveryStatusScheduler = (intervalMs = 10 * 60 * 1000) => {
  console.log('⏱️  Starting automatic delivery status scheduler...');
  console.log(`   Checking every ${intervalMs / 1000 / 60} minute(s) for orders to mark as delivered`);

  // Run immediately on startup
  updateDeliveredOrders();

  // Then schedule periodic checks
  setInterval(() => {
    updateDeliveredOrders();
  }, intervalMs);
};

module.exports = {
  updateDeliveredOrders,
  startDeliveryStatusScheduler
};
