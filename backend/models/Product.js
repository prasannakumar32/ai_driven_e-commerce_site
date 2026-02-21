const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  initialPrice: {
    type: Number,
    required: true,
    min: 0
  },
  highPrice: {
    type: Number,
    required: true,
    min: 0
  },
  offerPrice: {
    type: Number,
    required: false,
    min: 0
  },
  discountPercentage: {
    type: Number,
    min: 2,
    max: 25,
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys']
  },
  brand: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: false
  }],
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  features: [{
    type: String,
    trim: true
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  aiRecommendationScore: {
    type: Number,
    default: 0
  },
  popularity: {
    type: Number,
    default: 0
  },
  vectorEmbedding: {
    type: [Number],
    default: undefined
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate offer price based on discount percentage
productSchema.pre('save', function(next) {
  // Always calculate offer price
  if (this.discountPercentage > 0) {
    this.offerPrice = Math.round(this.initialPrice * (1 - (this.discountPercentage / 100)));
  } else {
    this.offerPrice = this.initialPrice;
  }
  next();
});

// Pre-validate middleware to ensure offerPrice is calculated before validation
productSchema.pre('validate', function(next) {
  // Calculate offer price if not set
  if (!this.offerPrice && this.initialPrice && this.discountPercentage !== undefined) {
    if (this.discountPercentage > 0) {
      this.offerPrice = Math.round(this.initialPrice * (1 - (this.discountPercentage / 100)));
    } else {
      this.offerPrice = this.initialPrice;
    }
  }
  next();
});

// Text search index for AI-powered search
productSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text',
  tags: 'text',
  features: 'text'
});

module.exports = mongoose.model('Product', productSchema);
