const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');
const { aiSearchEngine } = require('./aiSearchEngine');
const compromise = require('compromise');

// Simple tokenizer implementation
const tokenizer = {
  tokenize: (text) => {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }
};

// AI-powered product recommendations
const getRecommendations = async (product, userId = null) => {
  try {
    let recommendations = [];
    
    if (product) {
      // Get similar products based on current product
      recommendations = await getSimilarProducts(product, userId);
    } else if (userId) {
      // Get personalized recommendations for user
      recommendations = await getPersonalizedRecommendations(userId);
    } else {
      // Get general trending products
      recommendations = await getTrendingProducts();
    }

    return recommendations;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
};

// Get related products using AI search engine
const getRelatedProducts = async (searchQuery, category = '', brand = '', limit = 8) => {
  try {
    console.log('Getting related products for:', searchQuery);
    
    // Initialize AI search engine if not already done
    if (!aiSearchEngine.isInitialized) {
      console.log('Initializing AI search engine...');
      await aiSearchEngine.initialize();
    }
    
    // Use AI search engine with timeout
    const results = await Promise.race([
      aiSearchEngine.search(searchQuery, { category, brand, limit }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI search timeout')), 5000)
      )
    ]);
    
    console.log('AI search engine found', results.length, 'products');
    return results;
  } catch (error) {
    console.error('Error in AI search engine, using fallback:', error);
    
    // Fallback to simple database search
    try {
      const Product = require('../models/Product');
      let query = {};
      
      if (searchQuery) {
        query.$or = [
          { name: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { tags: { $in: [searchQuery.toLowerCase()] } },
          { features: { $in: [searchQuery.toLowerCase()] } },
          { brand: { $regex: searchQuery, $options: 'i' } },
          { category: { $regex: searchQuery, $options: 'i' } }
        ];
      }
      
      if (category) query.category = category;
      if (brand) query.brand = brand;
      
      const products = await Product.find(query)
        .sort({ rating: -1, popularity: -1 })
        .limit(limit)
        .populate('reviews.user', 'name');
      
      console.log('Fallback search found', products.length, 'products');
      return products.map(p => p.toObject());
    } catch (fallbackError) {
      console.error('Fallback search also failed:', fallbackError);
      return [];
    }
  }
};

// AI-powered category detection
const detectCategories = (searchQuery) => {
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

// AI-powered brand relationship calculation
const calculateBrandRelationships = (searchQuery, productBrand) => {
  let relationshipScore = 0;
  
  // Dynamic brand relationship mapping
  const brandRelationships = {
    apple: { competitors: ['samsung', 'google', 'dell', 'hp'], complementary: ['beats', 'logitech'] },
    samsung: { competitors: ['apple', 'google', 'lg', 'sony'], complementary: ['akg', 'logitech'] },
    google: { competitors: ['apple', 'samsung', 'microsoft', 'amazon'], complementary: ['logitech', 'anker'] },
    dell: { competitors: ['hp', 'lenovo', 'asus', 'acer'], complementary: ['microsoft', 'intel'] },
    hp: { competitors: ['dell', 'lenovo', 'asus', 'acer'], complementary: ['microsoft', 'intel'] },
    nike: { competitors: ['adidas', 'puma', 'reebok', 'under armour'], complementary: ['apple', 'garmin'] },
    adidas: { competitors: ['nike', 'puma', 'reebok', 'under armour'], complementary: ['apple', 'garmin'] }
  };
  
  // Check if search query mentions a brand
  Object.entries(brandRelationships).forEach(([brand, relationships]) => {
    if (searchQuery.includes(brand)) {
      if (relationships.competitors.includes(productBrand)) {
        relationshipScore += 0.3; // Competitor brand bonus
      } else if (relationships.complementary.includes(productBrand)) {
        relationshipScore += 0.2; // Complementary brand bonus
      } else if (brand === productBrand) {
        relationshipScore += 0.4; // Same brand bonus
      }
    }
  });
  
  return relationshipScore;
};

// Get similar products using AI analysis
const getSimilarProducts = async (product, userId) => {
  // Validate input product
  if (!product || !product._id) {
    console.log('Invalid product for similarity search');
    return [];
  }

  const query = {
    _id: { $ne: product._id },
    $or: [
      { category: product.category },
      { brand: product.brand },
      { tags: { $in: (product.tags || []) } }
    ]
  };

  try {
    const similarProducts = await Product.find(query)
      .sort({ rating: -1, popularity: -1 })
      .limit(10)
      .maxTimeMS(2000);

    // Apply AI scoring with null checks
    const scoredProducts = similarProducts.map(p => {
      let score = 0;
      
      // Category match with null checks
      if (p.category && product.category && p.category === product.category) {
        score += 0.4;
      }
      
      // Brand match with null checks
      if (p.brand && product.brand && p.brand === product.brand) {
        score += 0.3;
      }
      
      // Tag similarity with null checks
      const productTags = product.tags || [];
      const pTags = p.tags || [];
      const commonTags = pTags.filter(tag => productTags.includes(tag));
      score += commonTags.length * 0.1;
      
      // Price similarity with null checks
      if (product.price > 0 && p.price > 0) {
        const priceDiff = Math.abs(p.price - product.price) / product.price;
        if (priceDiff < 0.2) score += 0.2;
      }
      
      return { 
        ...p.toObject(), 
        aiScore: Math.min(score, 1.0) // Cap score at 1.0
      };
    });

    return scoredProducts
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 5);
  } catch (error) {
    console.error('Error in getSimilarProducts:', error);
    return [];
  }
};

// Get personalized recommendations for user
const getPersonalizedRecommendations = async (userId) => {
  try {
    // Enhanced validation for userId
    if (!userId || userId === 'current' || !mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Invalid userId for recommendations, returning trending products');
      return await getTrendingProducts();
    }

    const user = await User.findById(userId)
      .populate('browsingHistory.product')
      .populate('purchaseHistory.products.product')
      .maxTimeMS(3000); // Add timeout to prevent hanging

    if (!user) {
      console.log('User not found, returning trending products');
      return await getTrendingProducts();
    }

    // Validate user preferences structure
    if (!user.preferences) {
      user.preferences = {
        categories: [],
        brands: [],
        priceRange: { min: 0, max: 10000 }
      };
    }

    if (!user.aiProfile) {
      user.aiProfile = {
        interests: [],
        personalityTraits: [],
        recommendationWeights: {
          price: 0.3,
          brand: 0.2,
          category: 0.3,
          popularity: 0.2
        }
      };
    }

    // Analyze user behavior with error handling
    const userInterests = analyzeUserInterests(user);
    
    // Build query with fallback
    let query = {};
    try {
      if (userInterests.categories && userInterests.categories.length > 0) {
        query.$or = [
          { category: { $in: userInterests.categories } },
          { brand: { $in: userInterests.brands || [] } },
          { tags: { $in: userInterests.tags || [] } }
        ];
      } else {
        // Fallback to trending if no interests
        return await getTrendingProducts();
      }
    } catch (queryError) {
      console.error('Error building recommendation query:', queryError);
      return await getTrendingProducts();
    }
    
    // Get products with timeout and error handling
    let recommendations = [];
    try {
      recommendations = await Product.find(query)
        .sort({ rating: -1, popularity: -1 })
        .limit(20)
        .maxTimeMS(2000);
    } catch (dbError) {
      console.error('Error fetching recommendations from database:', dbError);
      return await getTrendingProducts();
    }

    // Apply personalized scoring with error handling
    const scoredRecommendations = recommendations.map(product => {
      try {
        let score = 0;
        const weights = user.aiProfile?.recommendationWeights || {
          price: 0.3,
          brand: 0.2,
          category: 0.3,
          popularity: 0.2
        };

        // Category preference with null checks
        if (userInterests.categories && userInterests.categories.includes(product.category)) {
          score += weights.category || 0.3;
        }

        // Brand preference with null checks
        if (userInterests.brands && userInterests.brands.includes(product.brand)) {
          score += weights.brand || 0.2;
        }

        // Price preference with null checks
        const priceRange = user.preferences?.priceRange || { min: 0, max: 10000 };
        if (product.price >= priceRange.min && product.price <= priceRange.max) {
          score += weights.price || 0.3;
        }

        // Popularity with null checks
        score += ((product.popularity || 0) / 100) * (weights.popularity || 0.2);

        return { 
          ...product.toObject(), 
          aiScore: Math.min(score, 1.0) // Cap score at 1.0
        };
      } catch (scoringError) {
        console.error('Error scoring product:', scoringError);
        return { 
          ...product.toObject(), 
          aiScore: 0.1 // Minimal score for errored items
        };
      }
    });

    // Sort and return results
    return scoredRecommendations
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 10);
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return await getTrendingProducts();
  }
};

// Analyze user interests from behavior
const analyzeUserInterests = (user) => {
  const interests = {
    categories: [],
    brands: [],
    tags: []
  };

  // Validate user object
  if (!user) {
    return interests;
  }

  // From browsing history with null checks
  if (user.browsingHistory && Array.isArray(user.browsingHistory)) {
    user.browsingHistory.forEach(item => {
      if (item && item.product) {
        const product = item.product;
        if (product.category && !interests.categories.includes(product.category)) {
          interests.categories.push(product.category);
        }
        if (product.brand && !interests.brands.includes(product.brand)) {
          interests.brands.push(product.brand);
        }
        if (product.tags && Array.isArray(product.tags)) {
          interests.tags.push(...product.tags);
        }
      }
    });
  }

  // From purchase history with null checks
  if (user.purchaseHistory && Array.isArray(user.purchaseHistory)) {
    user.purchaseHistory.forEach(order => {
      if (order && order.products && Array.isArray(order.products)) {
        order.products.forEach(item => {
          if (item && item.product) {
            const product = item.product;
            if (product.category && !interests.categories.includes(product.category)) {
              interests.categories.push(product.category);
            }
            if (product.brand && !interests.brands.includes(product.brand)) {
              interests.brands.push(product.brand);
            }
            if (product.tags && Array.isArray(product.tags)) {
              interests.tags.push(...product.tags);
            }
          }
        });
      }
    });
  }

  // Remove duplicates and limit with null checks
  interests.categories = [...new Set(interests.categories.filter(Boolean))].slice(0, 5);
  interests.brands = [...new Set(interests.brands.filter(Boolean))].slice(0, 5);
  interests.tags = [...new Set(interests.tags.filter(Boolean))].slice(0, 10);

  return interests;
};

// Get trending products
const getTrendingProducts = async () => {
  return await Product.find()
    .sort({ popularity: -1, rating: -1, numReviews: -1 })
    .limit(10);
};

// AI Chatbot responses
const getChatbotResponse = async (message, userId = null, context = {}) => {
  try {
    const doc = compromise(message.toLowerCase());
    const tokens = tokenizer.tokenize(message.toLowerCase());
    
    // Intent recognition
    const intent = recognizeIntent(tokens, doc);
    
    let response = {
      message: '',
      suggestions: [],
      products: []
    };

    switch (intent) {
      case 'product_search':
        response = await handleProductSearch(message, userId);
        break;
      case 'recommendation':
        response = await handleRecommendation(userId);
        break;
      case 'help':
        response = handleHelp();
        break;
      case 'order_status':
        response = await handleOrderStatus(userId);
        break;
      default:
        response = handleGeneralQuery(message);
    }

    return response;
  } catch (error) {
    console.error('Error in chatbot response:', error);
    return {
      message: 'I apologize, but I encountered an error. Please try again.',
      suggestions: ['Search for products', 'Get recommendations', 'Contact support']
    };
  }
};

// Recognize user intent
const recognizeIntent = (tokens, doc) => {
  const searchKeywords = ['search', 'find', 'look', 'show', 'product', 'item'];
  const recommendationKeywords = ['recommend', 'suggest', 'like', 'similar'];
  const helpKeywords = ['help', 'how', 'what', 'support'];
  const orderKeywords = ['order', 'status', 'tracking', 'delivery'];

  if (tokens.some(token => searchKeywords.includes(token))) {
    return 'product_search';
  }
  if (tokens.some(token => recommendationKeywords.includes(token))) {
    return 'recommendation';
  }
  if (tokens.some(token => helpKeywords.includes(token))) {
    return 'help';
  }
  if (tokens.some(token => orderKeywords.includes(token))) {
    return 'order_status';
  }

  return 'general';
};

// Handle product search queries
const handleProductSearch = async (message, userId) => {
  const doc = compromise(message);
  const entities = extractEntities(doc);
  
  let query = {};
  if (entities.category) query.category = entities.category;
  if (entities.brand) query.brand = entities.brand;
  if (entities.price) query.price = entities.price;

  const products = await Product.find(query)
    .sort({ rating: -1 })
    .limit(5);

  return {
    message: `I found ${products.length} products matching your search:`,
    products,
    suggestions: [
      'Show more results',
      'Filter by price',
      'Get recommendations'
    ]
  };
};

// Handle recommendation requests
const handleRecommendation = async (userId) => {
  const recommendations = await getPersonalizedRecommendations(userId);
  
  return {
    message: 'Based on your preferences, here are some products you might like:',
    products: recommendations.slice(0, 5),
    suggestions: [
      'View all recommendations',
      'Update preferences',
      'Search for products'
    ]
  };
};

// Handle help requests
const handleHelp = () => {
  return {
    message: 'I can help you with:\n• Finding products\n• Getting personalized recommendations\n• Checking order status\n• Product information\n• Shopping assistance',
    suggestions: [
      'Search for products',
      'Get recommendations',
      'Check order status'
    ]
  };
};

// Handle order status queries
const handleOrderStatus = async (userId) => {
  // This would integrate with your order system
  return {
    message: 'To check your order status, please provide your order number or log in to your account.',
    suggestions: [
      'View order history',
      'Track recent order',
      'Contact support'
    ]
  };
};

// Handle general queries
const handleGeneralQuery = (message) => {
  return {
    message: 'I can help you find products, get recommendations, and assist with your shopping. What would you like to do?',
    suggestions: [
      'Search for products',
      'Get recommendations',
      'Browse categories'
    ]
  };
};

// Extract entities from user message
const extractEntities = (doc) => {
  const entities = {};
  
  // Extract categories
  const categories = ['electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys'];
  categories.forEach(cat => {
    if (doc.has(cat)) {
      entities.category = cat;
    }
  });

  // Extract brands (simplified - in production, use a brand database)
  const brands = ['apple', 'samsung', 'nike', 'adidas', 'sony', 'lg'];
  brands.forEach(brand => {
    if (doc.has(brand)) {
      entities.brand = brand;
    }
  });

  // Extract price ranges
  if (doc.has('under') || doc.has('less than')) {
    entities.price = { $lte: 100 };
  }
  if (doc.has('over') || doc.has('more than')) {
    entities.price = { $gte: 500 };
  }

  return entities;
};

module.exports = {
  getRecommendations,
  getPersonalizedRecommendations,
  getChatbotResponse,
  getSimilarProducts,
  getTrendingProducts,
  getRelatedProducts
};
