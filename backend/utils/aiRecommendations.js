const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const AISearchEngine = require('./aiSearchEngine');
const aiSearchEngine = new AISearchEngine();
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

// Intent detection for chatbot
const detectIntent = (message) => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('search') || lowerMsg.includes('find') || lowerMsg.includes('looking for')) {
    return 'search';
  }
  if (lowerMsg.includes('recommend') || lowerMsg.includes('suggest')) {
    return 'recommendation';
  }
  if (lowerMsg.includes('order') || lowerMsg.includes('track') || lowerMsg.includes('delivery')) {
    return 'order_status';
  }
  if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('expensive')) {
    return 'price_inquiry';
  }
  if (lowerMsg.includes('help') || lowerMsg.includes('support') || lowerMsg.includes('how')) {
    return 'help';
  }
  if (lowerMsg.includes('category') || lowerMsg.includes('browse')) {
    return 'category_browse';
  }
  
  return 'general';
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

// Get related products using enhanced AI search engine
const getRelatedProducts = async (searchQuery, category = '', brand = '', limit = 8) => {
  try {
    console.log('Getting related products for:', searchQuery);
    
    // Initialize AI search engine if not already done
    if (!aiSearchEngine.isInitialized) {
      console.log('Initializing AI search engine...');
      await aiSearchEngine.initialize();
    }
    
    // Use enhanced AI search engine with timeout
    const results = await Promise.race([
      aiSearchEngine.search(searchQuery, { category, brand, limit }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI search timeout')), 5000)
      )
    ]);
    
    console.log('Enhanced AI search engine found', results.length, 'products');
    
    // Apply additional category-based filtering if needed
    const queryLower = searchQuery.toLowerCase();
    let enhancedResults = results;
    
    // Special handling for phone searches to ensure proper categorization
    if (queryLower.includes('iphone') || queryLower.includes('phone') || queryLower.includes('smartphone')) {
      enhancedResults = results.filter(product => {
        const productCategory = (product.category || '').toLowerCase();
        const productName = (product.name || '').toLowerCase();
        
        // Prioritize phone-related products
        return productCategory.includes('phone') || 
               productCategory.includes('smartphone') || 
               productCategory.includes('mobile') ||
               productName.includes('iphone') ||
               productName.includes('phone') ||
               (product.brand || '').toLowerCase() === 'apple';
      });
    }
    
    // If no specific category results, fallback to general search but prioritize relevant items
    if (enhancedResults.length === 0) {
      enhancedResults = results.sort((a, b) => {
        const aScore = calculateRelevanceScore(a, searchQuery);
        const bScore = calculateRelevanceScore(b, searchQuery);
        return bScore - aScore;
      });
    }
    
    return enhancedResults.slice(0, limit);
  } catch (error) {
    console.error('Error in AI search engine, using enhanced fallback:', error);
    
    // Enhanced fallback with proper categorization
    try {
      const Product = require('../models/Product');
      let query = {};
      const queryLower = searchQuery.toLowerCase();
      
      // Enhanced query building with category prioritization
      if (searchQuery) {
        query.$or = [
          { name: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { tags: { $in: [searchQuery.toLowerCase()] } },
          { features: { $in: [searchQuery.toLowerCase()] } },
          { brand: { $regex: searchQuery, $options: 'i' } },
          { category: { $regex: searchQuery, $options: 'i' } }
        ];
        
        // Add category-specific filters for better results
        if (queryLower.includes('iphone') || queryLower.includes('phone')) {
          query.$or.push(
            { category: { $regex: 'phone|smartphone|mobile', $options: 'i' } },
            { brand: 'Apple' }
          );
        }
      }
      
      if (category) query.category = category;
      if (brand) query.brand = brand;
      
      const products = await Product.find(query)
        .sort({ rating: -1, popularity: -1 })
        .limit(limit * 2) // Get more to filter better
        .populate('reviews.user', 'name');
      
      // Apply enhanced scoring
      const scoredProducts = products.map(p => {
        let score = calculateRelevanceScore(p.toObject(), searchQuery);
        return { ...p.toObject(), relevanceScore: score };
      });
      
      // Sort by relevance and return top results
      const finalResults = scoredProducts
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
      
      console.log('Enhanced fallback search found', finalResults.length, 'products');
      return finalResults;
    } catch (fallbackError) {
      console.error('Enhanced fallback search also failed:', fallbackError);
      return [];
    }
  }
};

// Helper function to calculate relevance score with aggressive iPhone prioritization
const calculateRelevanceScore = (product, searchQuery) => {
  let score = 0;
  const queryLower = searchQuery.toLowerCase();
  const isIPhoneSearch = queryLower.includes('iphone') || queryLower.includes('phone') || queryLower.includes('apple');
  const isTVSearch = queryLower.includes('tv') || queryLower.includes('television');
  
  const productName = (product.name || '').toLowerCase();
  const productCategory = (product.category || '').toLowerCase();
  const productBrand = (product.brand || '').toLowerCase();
  const productDescription = (product.description || '').toLowerCase();
  
  // AGGRESSIVE iPhone prioritization
  if (isIPhoneSearch) {
    // MASSIVE boost for iPhone/Apple products
    if (productName.includes('iphone') || productName.includes('apple')) {
      score += 20.0; // Huge boost
    }
    
    if (productBrand === 'apple') {
      score += 15.0; // Big boost for Apple brand
    }
    
    if (productCategory.includes('phone') || productCategory.includes('smartphone') || productCategory.includes('mobile')) {
      score += 10.0; // Boost for phone category
    }
    
    // HEAVY penalty for TV products when searching iPhone
    if (productCategory.includes('tv') || productCategory.includes('television') || 
        productName.includes('tv') || productName.includes('television')) {
      score -= 25.0; // Massive penalty for TVs
    }
    
    // Penalty for LG/Samsung TV products
    if ((productBrand === 'lg' || productBrand === 'samsung') && 
        (productCategory.includes('tv') || productCategory.includes('electronics'))) {
      score -= 20.0;
    }
  }
  
  // TV search prioritization
  if (isTVSearch) {
    if (productCategory.includes('tv') || productCategory.includes('television')) {
      score += 12.0;
    }
    
    // Penalty for phone products when searching TV
    if (productCategory.includes('phone') || productCategory.includes('smartphone')) {
      score -= 10.0;
    }
  }
  
  // Exact name match gets highest score (for non-iPhone searches)
  if (!isIPhoneSearch && productName.includes(queryLower)) {
    score += 15.0;
  }
  
  // Brand match (for non-iPhone searches)
  if (!isIPhoneSearch && productBrand.includes(queryLower)) {
    score += 8.0;
  }
  
  // Description match (minimal weight)
  if (productDescription.includes(queryLower)) {
    score += 2.0;
  }
  
  // Quality indicators (minimal weight)
  score += (product.rating || 0) * 0.5;
  score += (product.popularity || 0) * 0.01;
  
  return score;
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
    
    // Detect user intent
    const intent = detectIntent(message);
    
    let response = {
      message: '',
      suggestions: [],
      products: []
    };

    switch (intent) {
      case 'search':
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
      case 'price_inquiry':
        response = await handlePriceInquiry(message);
        break;
      case 'category_browse':
        response = await handleCategoryBrowse(message);
        break;
      default:
        response = handleGeneralQuery(message);
    }

    // Add follow-up suggestions if not already provided
    if (!response.suggestions || response.suggestions.length === 0) {
      response.suggestions = [
        'Search for products',
        'Get recommendations',
        'Browse categories'
      ];
    }

    return response;
  } catch (error) {
    console.error('Error in chatbot response:', error);
    return {
      message: 'I apologize, but I encountered an error. Please try again or contact support.',
      suggestions: ['Search for products', 'Get recommendations', 'Contact support'],
      products: []
    };
  }
};

// Handle product search queries
const handleProductSearch = async (message, userId) => {
  try {
    // Extract search terms from message
    const searchTerms = message
      .toLowerCase()
      .replace(/search|find|looking for|looking|show me|get|want/gi, '')
      .trim();
    
    if (!searchTerms) {
      return {
        message: 'What products would you like to search for? For example: "Find laptops", "Show me iPhones", "Search for blue shirts"',
        suggestions: [
          'Browse by category',
          'Get recommendations',
          'View trending products'
        ],
        products: []
      };
    }

    // Search for products
    const products = await Product.find({
      $or: [
        { name: { $regex: searchTerms, $options: 'i' } },
        { description: { $regex: searchTerms, $options: 'i' } },
        { category: { $regex: searchTerms, $options: 'i' } },
        { brand: { $regex: searchTerms, $options: 'i' } },
        { tags: { $in: [searchTerms.toLowerCase()] } }
      ]
    })
      .sort({ rating: -1, popularity: -1 })
      .limit(8);

    if (products.length === 0) {
      return {
        message: `I couldn't find any products matching "${searchTerms}". Would you like to try a different search or browse by category?`,
        suggestions: [
          'Browse by category',
          'View trending products',
          'Get recommendations'
        ],
        products: []
      };
    }

    return {
      message: `I found ${products.length} product(s) matching your search for "${searchTerms}". Here are the top results:`,
      products: products.slice(0, 5),
      suggestions: [
        `More results for "${searchTerms}"`,
        'Refine by category',
        'Get recommendations'
      ]
    };
  } catch (error) {
    console.error('Error in product search:', error);
    return {
      message: 'Sorry, I had trouble searching for products. Please try again.',
      suggestions: ['Browse by category', 'Get recommendations'],
      products: []
    };
  }
};

// Handle recommendation requests
const handleRecommendation = async (userId) => {
  try {
    let recommendations = [];

    if (userId) {
      try {
        const user = await User.findById(userId);
        if (user && user.browsingHistory && user.browsingHistory.length > 0) {
          // Get personalized recommendations based on browsing history
          const recentProductIds = user.browsingHistory
            .slice(-5)
            .map(item => item.product);

          recommendations = await Product.find({
            _id: { $nin: recentProductIds }
          })
            .sort({ rating: -1, popularity: -1 })
            .limit(8);
        }
      } catch (userError) {
        console.error('Error fetching user preferences:', userError);
      }
    }

    // Fallback to trending products if no personalized recommendations
    if (recommendations.length === 0) {
      recommendations = await Product.find({})
        .sort({ rating: -1, popularity: -1 })
        .limit(8);
    }

    return {
      message: userId 
        ? 'Based on your browsing history, here are some products you might like:'
        : 'Here are some trending products we think you\'ll love:',
      products: recommendations.slice(0, 5),
      suggestions: [
        'See more recommendations',
        'Similar products',
        'Featured deals'
      ]
    };
  } catch (error) {
    console.error('Error in recommendation:', error);
    return {
      message: 'I\'d love to give you personalized recommendations. Please check back later!',
      suggestions: ['Browse by category', 'Search for products'],
      products: []
    };
  }
};

// Handle price inquiry
const handlePriceInquiry = async (message) => {
  try {
    // Extract price range if mentioned
    const priceMatch = message.match(/\$?\d+(?:,\d{3})*(?:\.\d{2})?|\d+/g);
    let query = {};

    if (priceMatch) {
      const prices = priceMatch.map(p => parseInt(p));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      query.price = { $gte: minPrice, $lte: maxPrice };
    }

    const products = await Product.find(query)
      .sort({ rating: -1 })
      .limit(8);

    return {
      message: priceMatch 
        ? `I found ${products.length} products in the $${Math.min(...priceMatch)} - $${Math.max(...priceMatch)} range:` 
        : 'Here are some products available at various price points:',
      products: products.slice(0, 5),
      suggestions: [
        'Filter by category',
        'View all price ranges',
        'Get recommendations'
      ]
    };
  } catch (error) {
    console.error('Error in price inquiry:', error);
    return {
      message: 'Tell me your budget and I\'ll find products in that price range for you!',
      suggestions: ['Browse by category', 'Get recommendations'],
      products: []
    };
  }
};

// Handle category browse
const handleCategoryBrowse = async (message) => {
  try {
    // Get all unique categories
    const categories = await Product.distinct('category');
    
    const categoryMatch = categories.find(cat => 
      message.toLowerCase().includes(cat.toLowerCase())
    );

    let products = [];
    if (categoryMatch) {
      products = await Product.find({ category: categoryMatch })
        .sort({ rating: -1 })
        .limit(8);
    } else {
      products = await Product.find({})
        .sort({ rating: -1 })
        .limit(8);
    }

    return {
      message: categoryMatch
        ? `Here are the top products in the ${categoryMatch} category:`
        : 'Here are some popular products from various categories:',
      products: products.slice(0, 5),
      suggestions: [
        'View all categories',
        'Filter by price',
        'Get recommendations'
      ]
    };
  } catch (error) {
    console.error('Error in category browse:', error);
    return {
      message: 'Let me help you browse our product categories!',
      suggestions: ['Search for products', 'Get recommendations'],
      products: []
    };
  }
};

// Handle help requests
const handleHelp = () => {
  return {
    message: '🤖 I\'m your AI Shopping Assistant! Here\'s what I can help you with:\n\n📦 **Search Products** - Find items by name, category, or brand\n⭐ **Get Recommendations** - Discover personalized product suggestions\n💰 **Price Inquiry** - Find products in your budget\n📂 **Browse Categories** - Explore different product categories\n📋 **Track Orders** - Check your order status\n❓ **Need Help** - Answer your shopping questions',
    suggestions: [
      'Search for products',
      'Get recommendations',
      'Browse categories'
    ]
  };
};

// Handle order status queries
const handleOrderStatus = async (userId) => {
  try {
    if (!userId) {
      return {
        message: 'To check your order status, please log in to your account first.',
        suggestions: [
          'Login',
          'Search for products',
          'Get recommendations'
        ]
      };
    }

    const userOrders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    if (userOrders.length === 0) {
      return {
        message: 'You don\'t have any orders yet. Would you like to start shopping?',
        suggestions: [
          'Search for products',
          'Get recommendations',
          'Browse categories'
        ]
      };
    }

    const latestOrder = userOrders[0];
    return {
      message: `Your latest order (#${latestOrder.orderId}) is currently **${latestOrder.status.toUpperCase()}**. ${
        latestOrder.estimatedDeliveryDate 
          ? `Expected delivery: ${new Date(latestOrder.estimatedDeliveryDate).toLocaleDateString()}`
          : ''
      }`,
      suggestions: [
        'View all orders',
        'Continue shopping',
        'Contact support'
      ],
      products: []
    };
  } catch (error) {
    console.error('Error in order status:', error);
    return {
      message: 'I had trouble checking your orders. Please try again or contact support.',
      suggestions: ['Contact support', 'Search for products'],
      products: []
    };
  }
};

// Handle general queries
const handleGeneralQuery = (message) => {
  const greetings = ['hi', 'hello', 'hey', 'greetings'];
  const isGreeting = greetings.some(g => message.toLowerCase().includes(g));

  return {
    message: isGreeting
      ? '👋 Hello! I\'m your AI shopping assistant. How can I help you today?'
      : '💡 I can help you find products, get recommendations, check orders, and more! What would you like to do?',
    suggestions: [
      'Search for products',
      'Get recommendations',
      'Browse categories',
      'Check my orders'
    ]
  };
};

module.exports = {
  getRecommendations,
  getPersonalizedRecommendations,
  getChatbotResponse,
  getSimilarProducts,
  getTrendingProducts,
  getRelatedProducts
};
