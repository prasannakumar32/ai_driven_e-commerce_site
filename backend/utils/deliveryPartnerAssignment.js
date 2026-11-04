const User = require('../models/User');
const Order = require('../models/Order');

/**
 * Automatically assign a delivery partner to an order based on:
 * 1. Operating area match
 * 2. Availability status
 * 3. Rating (higher rated partners get priority)
 * 4. Current workload (fewer active orders get priority)
 */
const assignDeliveryPartner = async (orderId) => {
  try {
    console.log('🔄 Attempting to auto-assign delivery partner for order:', orderId);

    // Get the order
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('❌ Order not found for auto-assignment');
      return null;
    }

    // Check if order already has a delivery partner
    if (order.deliveryPartner) {
      console.log('ℹ️  Order already has a delivery partner assigned');
      return order.deliveryPartner;
    }

    // Only auto-assign if order is shipped
    if (order.status !== 'shipped') {
      console.log('ℹ️  Order is not ready for delivery (status:', order.status, ')');
      return null;
    }

    // Get delivery address city/state
    const deliveryCity = order.shippingAddress?.city?.toLowerCase() || '';
    const deliveryState = order.shippingAddress?.state?.toLowerCase() || '';

    // Find available delivery partners
    const availablePartners = await User.find({
      role: 'delivery_partner',
      deliveryPartnerStatus: { $in: ['approved', 'active'] },
      isAvailable: true
    });

    if (!availablePartners || availablePartners.length === 0) {
      console.log('ℹ️  No available delivery partners found');
      return null;
    }

    console.log(`📋 Found ${availablePartners.length} available delivery partners`);

    // Score each partner based on multiple criteria
    const scoredPartners = await Promise.all(
      availablePartners.map(async (partner) => {
        let score = 0;

        // 1. Operating area match (highest priority - 40 points)
        const partnerOperatingArea = partner.operatingArea?.toLowerCase() || '';
        if (partnerOperatingArea) {
          // Check if partner's operating area matches delivery city or state
          if (partnerOperatingArea.includes(deliveryCity) ||
              partnerOperatingArea.includes(deliveryState) ||
              deliveryCity.includes(partnerOperatingArea) ||
              deliveryState.includes(partnerOperatingArea)) {
            score += 40;
            console.log(`✓ ${partner.name}: Operating area match (+40)`);
          }
        }

        // 2. Rating (medium priority - 30 points)
        // Higher rating = higher score (normalized to 0-30)
        const ratingScore = (partner.rating || 0) * 6; // 5 stars * 6 = 30 max
        score += ratingScore;
        console.log(`✓ ${partner.name}: Rating score (${partner.rating || 0} stars = +${ratingScore})`);

        // 3. Current workload (lower priority - 30 points)
        // Fewer active orders = higher score
        const activeOrdersCount = await Order.countDocuments({
          deliveryPartner: partner._id,
          status: { $in: ['shipped', 'in-transit', 'out-for-delivery'] }
        });
        const workloadScore = Math.max(0, 30 - (activeOrdersCount * 5)); // Each active order reduces score by 5
        score += workloadScore;
        console.log(`✓ ${partner.name}: Workload score (${activeOrdersCount} active orders = +${workloadScore})`);

        // 4. Total deliveries experience (bonus - 10 points)
        const experienceScore = Math.min(10, partner.totalDeliveries || 0);
        score += experienceScore;
        console.log(`✓ ${partner.name}: Experience score (${partner.totalDeliveries || 0} deliveries = +${experienceScore})`);

        return {
          partner,
          score,
          activeOrdersCount
        };
      })
    );

    // Sort by score (highest first)
    scoredPartners.sort((a, b) => b.score - a.score);

    // Get the best partner
    const bestMatch = scoredPartners[0];

    if (!bestMatch || bestMatch.score < 20) {
      // Minimum score threshold to ensure quality match
      console.log('ℹ️  No suitable delivery partner found (best score below threshold)');
      return null;
    }

    console.log(`✅ Best match: ${bestMatch.partner.name} (score: ${bestMatch.score})`);

    // Assign the partner to the order
    order.deliveryPartner = bestMatch.partner._id;
    order.deliveryPartnerAssignedAt = new Date();
    order.status = 'in-transit';
    order.statusTimeline.push({
      status: 'in-transit',
      timestamp: new Date(),
      location: 'Warehouse',
      notes: `Order auto-assigned to delivery partner: ${bestMatch.partner.name}`
    });

    await order.save();

    // Update delivery partner stats
    await User.findByIdAndUpdate(bestMatch.partner._id, {
      $inc: { totalDeliveries: 1 }
    });

    console.log(`✅ Order ${orderId} assigned to delivery partner ${bestMatch.partner.name}`);

    return bestMatch.partner._id;
  } catch (error) {
    console.error('❌ Error in auto-assigning delivery partner:', error);
    return null;
  }
};

/**
 * Reassign an order to a different delivery partner
 */
const reassignDeliveryPartner = async (orderId, newPartnerId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const newPartner = await User.findById(newPartnerId);
    if (!newPartner || newPartner.role !== 'delivery_partner') {
      throw new Error('Invalid delivery partner');
    }

    // Remove from old partner's stats
    if (order.deliveryPartner) {
      await User.findByIdAndUpdate(order.deliveryPartner, {
        $inc: { totalDeliveries: -1 }
      });
    }

    // Assign to new partner
    order.deliveryPartner = newPartnerId;
    order.deliveryPartnerAssignedAt = new Date();
    order.statusTimeline.push({
      status: order.status,
      timestamp: new Date(),
      location: order.currentLocation || '',
      notes: `Order reassigned to delivery partner: ${newPartner.name}`
    });

    await order.save();

    // Update new partner's stats
    await User.findByIdAndUpdate(newPartnerId, {
      $inc: { totalDeliveries: 1 }
    });

    console.log(`✅ Order ${orderId} reassigned to ${newPartner.name}`);
    return order;
  } catch (error) {
    console.error('❌ Error reassigning delivery partner:', error);
    throw error;
  }
};

/**
 * Get nearby delivery partners based on location
 */
const getNearbyDeliveryPartners = async (city, state, limit = 10) => {
  try {
    const searchTerms = [city, state].filter(Boolean).join(' ');

    const partners = await User.find({
      role: 'delivery_partner',
      deliveryPartnerStatus: { $in: ['approved', 'active'] },
      isAvailable: true,
      $or: [
        { operatingArea: { $regex: city, $options: 'i' } },
        { operatingArea: { $regex: state, $options: 'i' } }
      ]
    })
      .limit(limit)
      .sort({ rating: -1, totalDeliveries: -1 });

    return partners;
  } catch (error) {
    console.error('❌ Error getting nearby delivery partners:', error);
    return [];
  }
};

module.exports = {
  assignDeliveryPartner,
  reassignDeliveryPartner,
  getNearbyDeliveryPartners
};
