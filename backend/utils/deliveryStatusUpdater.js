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
    
    const ordersToUpdate = await Order.find({
      estimatedDeliveryDate: { $lt: now },
      status: { $ne: 'delivered' },
      isDelivered: false
    });

    if (ordersToUpdate.length === 0) {
      // Silently skip if no orders to update
      return;
    }

    console.log(`📦 Checking ${ordersToUpdate.length} order(s) for automatic delivery status update...`);

    let updatedCount = 0;

    for (const order of ordersToUpdate) {
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
    }

    if (updatedCount > 0) {
      console.log(`✅ Auto-updated ${updatedCount} order(s) to delivered status`);
    }

    return updatedCount;
  } catch (error) {
    console.error('❌ Error in automatic delivery status update:', error.message);
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
