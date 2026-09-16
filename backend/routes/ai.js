const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const { getPersonalizedRecommendations, getChatbotResponse, getTrendingProducts } = require('../utils/aiRecommendations');
const { hybridSearch } = require('../utils/vectorSearch');
const { rankSearchResults, getAIRecommendations, reorderByRankedIds, isGeminiAvailable } = require('../utils/geminiService');
const jwt = require('jsonwebtoken');

// Optional auth — attaches req.userId if a valid token is present, never blocks the request
const optionalAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.userId = decoded.id;
    }
  } catch (_) { /* token invalid or missing — fine, continue as guest */ }
  next();
};

// Resolve 'current' placeholder to the real userId from token, else validate the raw id
const resolveUserId = (rawId, req) => {
  if (!rawId || rawId === 'current') return req.userId || null;
  return mongoose.Types.ObjectId.isValid(rawId) ? rawId : null;
};

// Get personalized recommendations for user
router.get('/recommendations/:userId', optionalAuth, async (req, res) => {
  try {
    const userId = resolveUserId(req.params.userId, req);

    let recommendations;
    if (userId) {
      recommendations = await getPersonalizedRecommendations(userId);
    } else {
      // Guest user — return trending products as recommendations
      const { getTrendingProducts } = require('../utils/aiRecommendations');
      recommendations = await getTrendingProducts(8);
    }

    res.json(recommendations);
  } catch (error) {
    console.error('Recommendations error:', error.message);
    // Never crash — return empty on error
    res.json([]);
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

    // Step 1: Get candidate products via hybrid search
    let candidates = [];
    try {
      candidates = await hybridSearch(query, filters, 30);
    } catch (searchErr) {
      console.error('[SmartSearch] hybridSearch failed, using fallback:', searchErr.message);
      // Fallback: simple regex search
      const fallbackQ = { $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { tags: { $in: [query.toLowerCase()] } }
      ]};
      if (filters.category) fallbackQ.category = filters.category;
      if (filters.brand) fallbackQ.brand = filters.brand;
      candidates = await Product.find(fallbackQ).sort({ rating: -1 }).limit(30).lean();
    }

    if (candidates.length === 0) {
      return res.json({ success: true, data: { products: [], searchQuery: query, totalCount: 0, searchType: 'no-results' } });
    }

    // Step 2: Re-rank with Gemini AI (with fallback to hybrid scores)
    let finalProducts = candidates;
    let searchType = 'hybrid';

    if (isGeminiAvailable()) {
      try {
        console.log(`[SmartSearch] Ranking ${candidates.length} candidates with Gemini AI for: "${query}"`);
        const { rankedIds, reasons } = await rankSearchResults(query, candidates);
        const extraProps = {};
        for (const [id, reason] of Object.entries(reasons)) {
          extraProps[id] = { aiReason: reason, aiScore: 1.0 };
        }
        finalProducts = reorderByRankedIds(candidates, rankedIds, extraProps);
        searchType = 'gemini-ai';
        console.log(`[SmartSearch] Gemini re-ranked ${finalProducts.length} results`);
      } catch (geminiErr) {
        console.error('[SmartSearch] Gemini ranking failed, using hybrid scores:', geminiErr.message);
      }
    }

    // Apply user preference boosts on top of AI ranking
    if (userPreferences.categories?.length || userPreferences.brands?.length) {
      finalProducts = finalProducts.map((p, idx) => ({
        ...p,
        aiScore: (p.aiScore || (1 - idx * 0.01)) +
          (userPreferences.categories?.includes(p.category) ? 0.05 : 0) +
          (userPreferences.brands?.includes(p.brand) ? 0.03 : 0)
      }));
    }

    return res.json({
      success: true,
      data: {
        products: finalProducts,
        searchQuery: query,
        appliedFilters: Object.keys(filters),
        totalCount: finalProducts.length,
        searchType
      }
    });
  } catch (error) {
    console.error('[SmartSearch] Fatal error:', error);
    res.status(500).json({ success: false, message: 'Smart search temporarily unavailable', data: { products: [], searchQuery: query, totalCount: 0 } });
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
