const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const mongoose = require('mongoose');
const getRecommendations = require('../utils/aiRecommendations').getRecommendations;
const getRelatedProducts = require('../utils/aiRecommendations').getRelatedProducts;

// AI-powered category detection for search
const detectSearchCategories = (searchQuery) => {
  const categories = [];
  const query = searchQuery.toLowerCase();
  
  // Dynamic category detection using keyword patterns
  const categoryPatterns = {
    phone: /phone|smartphone|mobile|iphone|android|samsung|google|pixel|galaxy/i,
    watch: /watch|smartwatch|smart watch|fitness tracker|wearable|apple watch|galaxy watch|garmin|fitbit/i,
    laptop: /laptop|notebook|computer|macbook|dell|hp|lenovo|asus|acer|msi|surface/i,
    tablet: /tablet|ipad|surface|android tablet|samsung tablet|kindle|fire tablet/i,
    clothing: /shirt|pants|dress|jeans|jacket|coat|t-shirt|polo|sweater|hoodie/i,
    shoes: /shoes|sneakers|boots|sandals|loafers|heels|flats|running shoes/i,
    home: /furniture|sofa|chair|table|bed|desk|lamp|decor|kitchen|bathroom/i,
    books: /book|novel|textbook|magazine|comic|ebook|audiobook|paperback/i
  };
  
  Object.entries(categoryPatterns).forEach(([category, pattern]) => {
    if (pattern.test(query)) {
      categories.push(category);
    }
  });
  
  return categories;
};

// AI-powered category term generation
const getCategoryTerms = (category) => {
  const termMappings = {
    phone: ['smartphone', 'mobile', 'iphone', 'android', 'samsung', 'google', 'pixel', 'galaxy', 'oneplus', 'xiaomi', 'oppo', 'vivo', 'nokia', 'motorola', 'lg'],
    watch: ['smartwatch', 'smart watch', 'apple watch', 'samsung galaxy watch', 'garmin', 'fitbit', 'fossil', 'fitness tracker', 'wearable', 'digital watch', 'analog watch'],
    laptop: ['notebook', 'computer', 'macbook', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'msi', 'razer', 'surface', 'thinkpad', 'pavilion', 'spectre', 'xps'],
    tablet: ['ipad', 'surface', 'android tablet', 'samsung tablet', 'lenovo tablet', 'asus tablet', 'microsoft surface', 'galaxy tab', 'kindle', 'fire tablet'],
    clothing: ['shirt', 'pants', 'dress', 'jeans', 'jacket', 'coat', 't-shirt', 'polo', 'sweater', 'hoodie', 'top', 'bottom', 'apparel'],
    shoes: ['sneakers', 'boots', 'sandals', 'loafers', 'heels', 'flats', 'running shoes', 'athletic shoes', 'footwear'],
    home: ['furniture', 'sofa', 'chair', 'table', 'bed', 'desk', 'lamp', 'decor', 'kitchen', 'bathroom', 'home decor', 'furnishings'],
    books: ['novel', 'textbook', 'magazine', 'comic', 'ebook', 'audiobook', 'paperback', 'hardcover', 'literature', 'reading']
  };
  
  return termMappings[category] || [];
};
const auth = require('../middleware/auth');

// Get all products with filtering and sorting using enhanced AI search
router.get('/', async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12,
      search
    } = req.query;

    // If there's a search query, use simple effective search
    if (search) {
      console.log('Using simple effective search for query:', search);
      
      try {
        const { simpleSearch } = require('../utils/simpleSearch');
        const filters = {};
        
        if (category) filters.category = category;
        if (brand) filters.brand = brand;
        if (minPrice || maxPrice) {
          filters.priceRange = {
            min: parseFloat(minPrice) || 0,
            max: parseFloat(maxPrice) || 100000
          };
        }
        if (rating) filters.rating = parseFloat(rating);
        
        // Use simple search with aggressive iPhone prioritization
        const products = await simpleSearch(search, filters, parseInt(limit) * 2);
        
        // Apply additional sorting if needed
        let sortedProducts = products;
        if (sort !== 'relevance') {
          sortedProducts = products.sort((a, b) => {
            const aValue = a[sort] || 0;
            const bValue = b[sort] || 0;
            return order === 'desc' ? bValue - aValue : aValue - bValue;
          });
        }
        
        // Apply pagination
        const skip = (page - 1) * limit;
        const paginatedProducts = sortedProducts.slice(skip, skip + parseInt(limit));
        
        res.json({
          products: paginatedProducts,
          currentPage: parseInt(page),
          totalPages: Math.ceil(sortedProducts.length / limit),
          totalProducts: sortedProducts.length
        });
        return;
      } catch (simpleSearchError) {
        console.error('Simple search failed, falling back to basic search:', simpleSearchError);
        // Continue to basic search as fallback
      }
    }

    // Basic search for non-search queries or as fallback
    let query = {};

    // Build filter query
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (rating) query.rating = { $gte: parseFloat(rating) };

    // Sort options
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reviews.user', 'name');

    const total = await Product.countDocuments(query);

    res.json({
      products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalProducts: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get products for a specific seller (MUST come before /:id route)
router.get('/seller', auth, async (req, res) => {
  try {
    console.log('Seller products route called');
    
    // Check if user is a seller
    if (!req.user || req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access denied. Only sellers can view products.' });
    }
    
    const sellerId = req.user.id;
    console.log('Seller products route - sellerId:', sellerId);
    
    const products = await Product.find({ seller: sellerId })
      .sort({ createdAt: -1 });
    
    console.log('Seller products route - found products:', products.length);
    res.json(products);
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Get product by ID (MUST come after /seller route)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get AI recommendations for a product
router.get('/:id/recommendations', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const recommendations = await getRecommendations(product, req.user?.id);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get related products based on search query
router.post('/related', async (req, res) => {
  try {
    const { searchQuery, category, brand, limit = 8 } = req.body;
    
    // Use the enhanced AI utility for related products
    const relatedProducts = await getRelatedProducts(searchQuery, category, brand, limit);

    res.json({
      products: relatedProducts,
      searchQuery,
      total: relatedProducts.length
    });
  } catch (error) {
    console.error('Error fetching related products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Search products with enhanced AI-powered semantic search
router.post('/search', async (req, res) => {
  try {
    const { query, filters = {}, userId } = req.body;
    
    console.log('Enhanced AI search called with query:', query);
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    try {
      // Use simple search with aggressive iPhone prioritization
      const { simpleSearch } = require('../utils/simpleSearch');
      const products = await simpleSearch(query, filters, 20);
      
      // Get AI recommendations if user is logged in and userId is valid
      let recommendations = [];
      if (userId && userId !== 'current' && mongoose.Types.ObjectId.isValid(userId)) {
        recommendations = await getRecommendations(null, userId);
      }

      res.json({
        products,
        recommendations,
        searchQuery: query,
        searchType: 'simple-aggressive'
      });
    } catch (simpleSearchError) {
      console.error('Simple search failed, using fallback:', simpleSearchError);
      
      // Fallback to basic search with enhanced scoring
      let searchQuery = {};
      
      // Text search
      searchQuery.$text = { $search: query };
      
      // Apply filters
      if (filters.category) searchQuery.category = filters.category;
      if (filters.brand) searchQuery.brand = filters.brand;
      if (filters.priceRange) {
        searchQuery.price = {
          $gte: filters.priceRange.min || 0,
          $lte: filters.priceRange.max || 10000
        };
      }

      let products = await Product.find(searchQuery)
        .sort({ score: { $meta: 'textScore' } })
        .limit(20)
        .populate('reviews.user', 'name');
      
      // Apply aggressive iPhone prioritization to fallback results
      const queryLower = query.toLowerCase();
      const isIPhoneSearch = queryLower.includes('iphone') || queryLower.includes('phone') || queryLower.includes('apple');
      
      if (isIPhoneSearch) {
        products = products.map(product => {
          let score = product.score || 0;
          const productCategory = (product.category || '').toLowerCase();
          const productBrand = (product.brand || '').toLowerCase();
          const productName = (product.name || '').toLowerCase();
          
          // AGGRESSIVE iPhone prioritization
          if (productName.includes('iphone') || productName.includes('apple')) {
            score += 30.0;
          }
          
          if (productBrand === 'apple') {
            score += 20.0;
          }
          
          if (productCategory.includes('phone') || productCategory.includes('smartphone')) {
            score += 15.0;
          }
          
          // HEAVY penalty for TV products
          if (productCategory.includes('tv') || productCategory.includes('television')) {
            score -= 40.0;
          }
          
          if ((productBrand === 'lg' || productBrand === 'samsung') && productCategory.includes('tv')) {
            score -= 30.0;
          }
          
          return { ...product.toObject(), enhancedScore: score };
        }).sort((a, b) => b.enhancedScore - a.enhancedScore);
      }

      // Get AI recommendations if user is logged in
      let recommendations = [];
      if (userId && userId !== 'current' && mongoose.Types.ObjectId.isValid(userId)) {
        recommendations = await getRecommendations(null, userId);
      }

      res.json({
        products,
        recommendations,
        searchQuery: query,
        searchType: 'fallback-enhanced'
      });
    }
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add review to product
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find(review => 
      review.user.toString() === userId
    );

    if (existingReview) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    const review = {
      user: userId,
      name: req.user.name,
      rating: parseInt(rating),
      comment
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new product (seller only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is a seller
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can create products' });
    }

    const {
      name,
      description,
      price,
      initialPrice,
      highPrice,
      offerPrice,
      discountPercentage,
      category,
      brand,
      stock,
      images = [],
      tags = [],
      features = []
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !brand || !stock) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Validate price and stock
    if (price <= 0 || stock < 0) {
      return res.status(400).json({ message: 'Price must be positive and stock cannot be negative' });
    }

    // Calculate price fields if not provided
    const finalInitialPrice = initialPrice || parseFloat(price);
    const finalHighPrice = highPrice || Math.round(parseFloat(price) * 1.3);
    const finalDiscountPercentage = discountPercentage || Math.floor(Math.random() * 24) + 2;
    const finalOfferPrice = offerPrice || Math.round(finalInitialPrice * (1 - (finalDiscountPercentage / 100)));

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      initialPrice: finalInitialPrice,
      highPrice: finalHighPrice,
      offerPrice: finalOfferPrice,
      discountPercentage: finalDiscountPercentage,
      category,
      brand,
      stock: parseInt(stock),
      images,
      tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(t => t),
      features: Array.isArray(features) ? features : features.split(',').map(f => f.trim()).filter(f => f),
      seller: req.user.id
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// Update a product (seller only)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is a seller
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can update products' });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the product belongs to the seller
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own products' });
    }

    const {
      name,
      description,
      price,
      initialPrice,
      highPrice,
      offerPrice,
      discountPercentage,
      category,
      brand,
      stock,
      images,
      tags,
      features
    } = req.body;

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (initialPrice) product.initialPrice = parseFloat(initialPrice);
    if (highPrice) product.highPrice = parseFloat(highPrice);
    if (offerPrice) product.offerPrice = parseFloat(offerPrice);
    if (discountPercentage !== undefined) product.discountPercentage = parseFloat(discountPercentage);
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (stock !== undefined) product.stock = parseInt(stock);
    if (images) product.images = images;
    if (tags) product.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(t => t);
    if (features) product.features = Array.isArray(features) ? features : features.split(',').map(f => f.trim()).filter(f => f);

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// Delete a product (seller only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is a seller
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can delete products' });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the product belongs to the seller
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

module.exports = router;
