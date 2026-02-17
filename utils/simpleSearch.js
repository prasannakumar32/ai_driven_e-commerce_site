// Simple and effective search fix
const mongoose = require('mongoose');

// Simple search with aggressive iPhone prioritization
const simpleSearch = async (query, filters = {}, limit = 20) => {
  try {
    const queryLower = query.toLowerCase();
    const isIPhoneSearch = queryLower.includes('iphone') || queryLower.includes('phone') || queryLower.includes('apple');
    const isTVSearch = queryLower.includes('tv') || queryLower.includes('television');
    
    let searchQuery = {};
    
    if (query) {
      if (isIPhoneSearch) {
        // AGGRESSIVE iPhone search - prioritize iPhone/Apple products heavily
        searchQuery.$or = [
          // Exact iPhone matches (highest priority)
          { name: { $regex: 'iphone', $options: 'i' } },
          // Apple brand products (high priority)
          { brand: 'Apple' },
          // Phone category (medium priority)
          { category: { $regex: 'phone|smartphone|mobile', $options: 'i' } },
          // General text search (lowest priority)
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ];
      } else if (isTVSearch) {
        // TV search - prioritize TV products
        searchQuery.$or = [
          { category: { $regex: 'tv|television', $options: 'i' } },
          { name: { $regex: 'tv|television', $options: 'i' } },
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ];
      } else {
        // General search
        searchQuery.$or = [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { brand: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { tags: { $in: [query.toLowerCase()] } }
        ];
      }
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
    
    const Product = require('./models/Product');
    
    // Get products and apply aggressive scoring
    let products = await Product.find(searchQuery)
      .limit(limit * 3) // Get more for better filtering
      .populate('reviews.user', 'name')
      .lean();
    
    // Apply aggressive scoring
    const scoredProducts = products.map(product => {
      let score = 1.0;
      const productName = (product.name || '').toLowerCase();
      const productBrand = (product.brand || '').toLowerCase();
      const productCategory = (product.category || '').toLowerCase();
      
      // AGGRESSIVE iPhone prioritization
      if (isIPhoneSearch) {
        // MASSIVE boost for exact iPhone matches
        if (productName.includes('iphone')) {
          score += 50.0;
        }
        
        // HUGE boost for Apple brand
        if (productBrand === 'apple') {
          score += 30.0;
        }
        
        // BIG boost for phone category
        if (productCategory.includes('phone') || productCategory.includes('smartphone')) {
          score += 20.0;
        }
        
        // MASSIVE penalty for TV products
        if (productCategory.includes('tv') || productCategory.includes('television')) {
          score -= 100.0;
        }
        
        // HEAVY penalty for LG/Samsung TVs
        if ((productBrand === 'lg' || productBrand === 'samsung') && 
            (productCategory.includes('tv') || productCategory.includes('electronics'))) {
          score -= 50.0;
        }
      }
      
      // TV search prioritization
      if (isTVSearch) {
        if (productCategory.includes('tv') || productCategory.includes('television')) {
          score += 30.0;
        }
        
        // Penalty for phone products in TV search
        if (productCategory.includes('phone') || productCategory.includes('smartphone')) {
          score -= 20.0;
        }
      }
      
      // General exact name match bonus
      if (productName.includes(queryLower)) {
        score += 10.0;
      }
      
      // Brand match bonus
      if (productBrand.includes(queryLower)) {
        score += 5.0;
      }
      
      // Quality indicators (minimal weight)
      score += (product.rating || 0) * 0.1;
      score += (product.popularity || 0) * 0.01;
      
      return {
        ...product,
        searchScore: score
      };
    });
    
    // Sort by score and return top results
    return scoredProducts
      .sort((a, b) => b.searchScore - a.searchScore)
      .slice(0, limit);
      
  } catch (error) {
    console.error('Simple search error:', error);
    return [];
  }
};

module.exports = { simpleSearch };
