// Delivery Status Management Utility
export const deliveryStatuses = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  IN_TRANSIT: 'in-transit',
  OUT_FOR_DELIVERY: 'out-for-delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const deliveryStatusTransitions = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['in-transit', 'cancelled'],
  'in-transit': ['out-for-delivery'],
  'out-for-delivery': ['delivered'],
  delivered: [],
  cancelled: []
};

export const statusDescriptions = {
  pending: 'Order has been received and is waiting to be processed',
  processing: 'Order is being prepared for shipment',
  shipped: 'Order has been shipped from our warehouse',
  'in-transit': 'Order is in transit to delivery location',
  'out-for-delivery': 'Order is out for delivery today',
  delivered: 'Order has been successfully delivered',
  cancelled: 'Order has been cancelled'
};

export const statusIcons = {
  pending: '📋',
  processing: '⚙️',
  shipped: '📦',
  'in-transit': '🚚',
  'out-for-delivery': '🚛',
  delivered: '✅',
  cancelled: '❌'
};

export const getStatusColor = (status) => {
  const colorMap = {
    pending: '#ff9800',      // orange
    processing: '#2196f3',   // blue
    shipped: '#2196f3',      // blue
    'in-transit': '#2196f3', // blue
    'out-for-delivery': '#ff9800', // orange
    delivered: '#4caf50',    // green
    cancelled: '#f44336'     // red
  };
  return colorMap[status] || '#757575'; // grey default
};

export const getNextPossibleStatuses = (currentStatus) => {
  return deliveryStatusTransitions[currentStatus] || [];
};

export const formatDeliveryDate = (date) => {
  if (!date) return 'Not available';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDeliveryDateTime = (date) => {
  if (!date) return 'Not available';
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/*
 * Example usage for updating delivery status with all details:
 * 
 * const updateDelivery = async (orderId, updateData) => {
 *   try {
 *     const response = await orderAPI.updateOrderStatus(orderId, {
 *       status: 'out-for-delivery',
 *       location: 'In vehicle for delivery',
 *       notes: 'Package arriving between 2 PM - 4 PM',
 *       trackingNumber: 'TRK_PKS_2026_1708876543_ABC123',
 *       estimatedDeliveryDate: new Date(Date.now() + 24*60*60*1000),
 *       carrier: 'DTDC'
 *     });
 *     console.log('Delivery updated:', response.data);
 *   } catch (error) {
 *     console.error('Error updating delivery:', error);
 *   }
 * };
 */
