const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    sparse: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    image: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    }
  }],
  shippingAddress: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: false,
      default: ''
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'COD']
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'in-transit', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  // Timeline tracking for delivery status
  statusTimeline: [{
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'in-transit', 'out-for-delivery', 'delivered', 'cancelled'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    location: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    }
  }],
  // Delivery tracking
  trackingNumber: {
    type: String,
    default: ''
  },
  currentLocation: {
    type: String,
    default: ''
  },
  estimatedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  carrier: {
    type: String,
    default: ''
  },
  aiRecommendations: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    score: Number,
    reason: String
  }]
}, {
  timestamps: true
});

// Pre-save hook to generate order ID and initialize status timeline
orderSchema.pre('save', async function(next) {
  try {
    if (!this.orderId) {
      // Ensure _id exists before using it
      if (!this._id) {
        this._id = new mongoose.Types.ObjectId();
      }
      
      const currentYear = new Date().getFullYear();
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      this.orderId = `PKS_${currentYear}_${timestamp}_${randomSuffix}`;
    }

    // Initialize status timeline on first save
    if (!this.statusTimeline || this.statusTimeline.length === 0) {
      this.statusTimeline = [{
        status: 'pending',
        timestamp: new Date(),
        notes: 'Order created'
      }];
    }

    // Generate tracking number if not present
    if (!this.trackingNumber && this.orderId) {
      this.trackingNumber = `TRK_${this.orderId}`;
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Order', orderSchema);
