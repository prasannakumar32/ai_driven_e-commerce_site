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
    
    // Find all active orders that haven't been delivered or cancelled
    const activeOrders = await Order.find({
      status: { $nin: ['delivered', 'cancelled'] },
      isDelivered: false
    });

    if (activeOrders.length === 0) {
      return 0;
    }

    console.log(`📦 Checking ${activeOrders.length} order(s) for smooth delivery status updates...`);

    let updatedCount = 0;

    for (const order of activeOrders) {
      try {
        const created = order.createdAt.getTime();
        // Default to 4 days if no estimated date
        const estimated = order.estimatedDeliveryDate 
          ? order.estimatedDeliveryDate.getTime() 
          : created + (4 * 24 * 60 * 60 * 1000);
          
        const totalDuration = estimated - created;
        const elapsed = now.getTime() - created;
        const progress = Math.max(0, elapsed / totalDuration); // 0.0 to 1.0+

        const previousStatus = order.status;
        let newStatus = previousStatus;
        let newLocation = order.currentLocation;
        let newNotes = '';
        let shouldUpdate = false;

        // Determine correct status based on time progress
        if (progress >= 1.0 && previousStatus !== 'delivered') {
          newStatus = 'delivered';
          newLocation = order.shippingAddress?.city || 'Destination';
          newNotes = 'Package delivered successfully';
        } else if (progress >= 0.8 && !['delivered', 'out-for-delivery'].includes(previousStatus)) {
          newStatus = 'out-for-delivery';
          newLocation = `Local Facility, ${order.shippingAddress?.city || 'Destination'}`;
          newNotes = 'Package is out for delivery';
        } else if (progress >= 0.5 && !['delivered', 'out-for-delivery', 'in-transit'].includes(previousStatus)) {
          newStatus = 'in-transit';
          newLocation = 'Regional Transit Hub';
          newNotes = 'Package is in transit to destination';
        } else if (progress >= 0.2 && !['delivered', 'out-for-delivery', 'in-transit', 'shipped'].includes(previousStatus)) {
          newStatus = 'shipped';
          newLocation = 'Origin Facility';
          newNotes = 'Package has left the origin facility';
        }

        // Only update if status actually transitions forward
        if (newStatus !== previousStatus) {
          order.status = newStatus;
          order.currentLocation = newLocation;
          
          if (newStatus === 'delivered') {
            order.isDelivered = true;
            order.deliveredAt = new Date();
            order.actualDeliveryDate = new Date();
          }

          // Ensure shipping address has required fields
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
            status: newStatus,
            timestamp: new Date(),
            location: newLocation,
            notes: newNotes || `Automatically updated status to ${newStatus}`
          });

          await order.save();
          updatedCount++;
          console.log(`✅ Order ${order.orderId} progressed: ${previousStatus} → ${newStatus} (${Math.round(progress * 100)}% time elapsed)`);
        }
      } catch (itemError) {
        console.error(`⚠️  Failed to update order ${order.orderId}:`, itemError.message);
        continue;
      }
    }

    if (updatedCount > 0) {
      console.log(`✅ Smooth delivery process updated ${updatedCount} order(s)`);
    }

    return updatedCount;
  } catch (error) {
    console.error('❌ Error in smooth delivery status update:', error.message);
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
