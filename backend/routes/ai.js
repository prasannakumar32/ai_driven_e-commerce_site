const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const { getPersonalizedRecommendations, getChatbotResponse } = require('../utils/aiRecommendations');
const { hybridSearch, vectorSearch } = require('../utils/vectorSearch');

// Get personalized recommendations for user
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const recommendations = await getPersonalizedRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// AI Chatbot endpoint
router.post('/chatbot', async (req, res) => {
  try {
    const { message, userId, context } = req.body;
    
    const response = await getChatbotResponse(message, userId, context);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Smart search with AI
router.post('/smart-search', async (req, res) => {
  try {
    const { query, userId, filters = {} } = req.body;
    
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        success: false,
        message: 'Database connection unavailable. Please try again later.',
        data: {
          products: [],
          searchQuery: req.body.query || '',
          appliedFilters: [],
          totalCount: 0
        }
      });
    }
    
    // Get user preferences if logged in
    let userPreferences = {
      categories: [],
      brands: [],
      priceRange: { min: 0, max: 100000 },
      interests: []
    };
    
    if (userId && userId !== 'current') {
      try {
        const user = await User.findById(userId);
        if (user) {
          userPreferences = {
            categories: user.preferences?.categories || [],
            brands: user.preferences?.brands || [],
            priceRange: user.preferences?.priceRange || { min: 0, max: 100000 },
            interests: user.aiProfile?.interests || []
          };
        }
      } catch (userError) {
        console.error('Error fetching user preferences:', userError);
      }
    }

    // Build smart query with AI enhancement
    let searchQuery = {};
    
    if (query) {
      // Use text search with AI-enhanced terms
      searchQuery.$text = { $search: query };
    }

    // Apply filters
    if (filters.category) searchQuery.category = filters.category;
    if (filters.brand) searchQuery.brand = filters.brand;
    if (filters.priceRange) {
      searchQuery.price = {
        $gte: filters.priceRange.min || 0,
        $lte: filters.priceRange.max || 100000
      };
    }

    try {
      // Use enhanced hybrid search combining text and vector search
      const products = await hybridSearch(query, filters, 20);
      
      // Apply enhanced AI-based reranking with aggressive iPhone prioritization
      const rankedProducts = products.map(product => {
        let score = product.hybridScore || product.vectorScore || 0;
        const queryLower = query.toLowerCase();
        const isIPhoneSearch = queryLower.includes('iphone') || queryLower.includes('phone') || queryLower.includes('apple');
        
        // AGGRESSIVE category-specific prioritization
        if (isIPhoneSearch) {
          const productCategory = (product.category || '').toLowerCase();
          const productBrand = (product.brand || '').toLowerCase();
          const productName = (product.name || '').toLowerCase();
          
          // MASSIVE boost for iPhone/Apple products
          if (productName.includes('iphone') || productName.includes('apple')) {
            score += 5.0; // Huge boost
          }
          
          if (productBrand === 'apple') {
            score += 3.0; // Big boost for Apple brand
          }
          
          if (productCategory.includes('phone') || productCategory.includes('smartphone') || productCategory.includes('mobile')) {
            score += 2.0; // Boost for phone category
          }
          
          // HEAVY penalty for TV products when searching iPhone
          if (productCategory.includes('tv') || productCategory.includes('television') || 
              productName.includes('tv') || productName.includes('television')) {
            score -= 10.0; // Massive penalty for TVs
          }
          
          // Penalty for LG/Samsung TV products
          if ((productBrand === 'lg' || productBrand === 'samsung') && 
              (productCategory.includes('tv') || productCategory.includes('electronics'))) {
            score -= 8.0;
          }
        }
        
        if (queryLower.includes('tv') || queryLower.includes('television')) {
          const productCategory = (product.category || '').toLowerCase();
          if (productCategory.includes('tv') || productCategory.includes('television')) {
            score += 2.0;
          }
        }
        
        // Boost score based on user preferences with null checks
        if (userPreferences.categories && userPreferences.categories.includes(product.category)) {
          score += 0.4;
        }
        if (userPreferences.brands && userPreferences.brands.includes(product.brand)) {
          score += 0.3;
        }
        if (product.price >= userPreferences.priceRange.min && 
            product.price <= userPreferences.priceRange.max) {
          score += 0.2;
        }
        
        return { 
          ...product, 
          aiScore: Math.min(score, 10.0) // Cap score for consistency
        };
      }).sort((a, b) => b.aiScore - a.aiScore);

      // Standardize response format
      res.json({
        success: true,
        data: {
          products: rankedProducts,
          searchQuery: query,
          appliedFilters: Object.keys(filters),
          totalCount: rankedProducts.length,
          searchType: 'enhanced-hybrid'
        }
      });
    } catch (dbError) {
      console.error('Database search error, using enhanced fallback:', dbError);
      
      // Enhanced fallback to simple search with category prioritization
      let fallbackQuery = {};
      const queryLower = query.toLowerCase();
      
      if (query) {
        fallbackQuery.$or = [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [query.toLowerCase()] } },
          { features: { $in: [query.toLowerCase()] } },
          { brand: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ];
        
        // Add category-specific boosts for phone searches
        if (queryLower.includes('iphone') || queryLower.includes('phone')) {
          fallbackQuery.$or.push(
            { category: { $regex: 'phone|smartphone|mobile', $options: 'i' } },
            { brand: 'Apple' }
          );
        }
      }
      
      if (filters.category) fallbackQuery.category = filters.category;
      if (filters.brand) fallbackQuery.brand = filters.brand;
      if (filters.priceRange) {
        fallbackQuery.price = {
          $gte: filters.priceRange.min || 0,
          $lte: filters.priceRange.max || 100000
        };
      }
      
      const fallbackProducts = await Product.find(fallbackQuery)
        .sort({ rating: -1, popularity: -1 })
        .limit(30) // Get more to filter better
        .populate('reviews.user', 'name');

      // Apply enhanced scoring to fallback results with aggressive iPhone prioritization
      const scoredFallbackProducts = fallbackProducts.map(product => {
        let score = Math.min((product.rating || 0) / 5, 1.0); // Base score from rating
        const productCategory = (product.category || '').toLowerCase();
        const productBrand = (product.brand || '').toLowerCase();
        const productName = (product.name || '').toLowerCase();
        const isIPhoneSearch = queryLower.includes('iphone') || queryLower.includes('phone') || queryLower.includes('apple');
        
        // AGGRESSIVE iPhone-specific scoring
        if (isIPhoneSearch) {
          // MASSIVE boost for iPhone/Apple products
          if (productName.includes('iphone') || productName.includes('apple')) {
            score += 8.0; // Huge boost
          }
          
          if (productBrand === 'apple') {
            score += 5.0; // Big boost for Apple brand
          }
          
          if (productCategory.includes('phone') || productCategory.includes('smartphone') || productCategory.includes('mobile')) {
            score += 3.0; // Boost for phone category
          }
          
          // HEAVY penalty for TV products when searching iPhone
          if (productCategory.includes('tv') || productCategory.includes('television') || 
              productName.includes('tv') || productName.includes('television')) {
            score -= 15.0; // Massive penalty for TVs
          }
          
          // Penalty for LG/Samsung TV products
          if ((productBrand === 'lg' || productBrand === 'samsung') && 
              (productCategory.includes('tv') || productCategory.includes('electronics'))) {
            score -= 12.0;
          }
        }
        
        if (queryLower.includes('tv') || queryLower.includes('television')) {
          if (productCategory.includes('tv') || productCategory.includes('television')) {
            score += 3.0;
          }
        }
        
        // Exact name match bonus (for non-iPhone searches)
        if (!isIPhoneSearch && productName.includes(queryLower)) {
          score += 2.0;
        }
        
        return {
          ...product.toObject(),
          aiScore: Math.min(score, 10.0)
        };
      }).sort((a, b) => b.aiScore - a.aiScore);

      // Standardize fallback response format
      res.json({
        success: true,
        data: {
          products: scoredFallbackProducts,
          searchQuery: req.body.query || '',
          appliedFilters: Object.keys(fallbackQuery),
          totalCount: scoredFallbackProducts.length
        }
      });
    }
  } catch (error) {
    console.error('Error in smart search:', error);
    const { query: searchQuery } = req.body;
    res.status(500).json({ 
      success: false,
      message: 'Smart search temporarily unavailable',
      data: {
        products: [],
        searchQuery: searchQuery || '',
        appliedFilters: [],
        totalCount: 0
      }
    });
  }
});

// Trending products based on AI analysis
router.get('/trending', async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database connection unavailable. Please try again later.',
        products: []
      });
    }
    
    let query = {};
    if (category) query.category = category;

    const trendingProducts = await Product.find(query)
      .sort({ popularity: -1, rating: -1, numReviews: -1 })
      .limit(parseInt(limit));

    res.json(trendingProducts);
  } catch (error) {
    console.error('Error fetching trending products:', error);
    res.status(500).json({ 
      message: 'Failed to fetch trending products',
      products: []
    });
  }
});

// Similar products based on AI analysis
router.get('/similar/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 5 } = req.query;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find similar products based on category, tags, and features
    const similarProducts = await Product.find({
      _id: { $ne: productId },
      $or: [
        { category: product.category },
        { brand: product.brand },
        { tags: { $in: product.tags } }
      ]
    })
    .sort({ rating: -1, popularity: -1 })
    .limit(parseInt(limit));

    res.json(similarProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user AI profile based on behavior
router.post('/update-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, productId, duration } = req.body;

    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!user || !product) {
      return res.status(404).json({ message: 'User or product not found' });
    }

    // Update browsing history
    if (action === 'view') {
      user.browsingHistory.push({
        product: productId,
        timestamp: new Date(),
        duration: duration || 0
      });

      // Update AI interests based on product
      const productTags = product.tags || [];
      const productCategory = product.category;
      
      user.aiProfile.interests = [...new Set([
        ...user.aiProfile.interests,
        ...productTags,
        productCategory
      ])];

      await user.save();
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
