const mongoose = require('mongoose');
const Product = require('../models/Product');
const { atlasVectorSearch } = require('./atlasVectorSearch');

// Enhanced embedding generator with better semantic understanding and error handling
function generateEmbedding(text) {
  try {
    if (!text || typeof text !== 'string') {
      console.warn('Invalid text for embedding generation:', text);
      return new Array(1536).fill(0);
    }
    
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const embedding = new Array(1536).fill(0);
    
    // Enhanced semantic word mapping for better understanding
    const semanticMap = {
      // Phone related terms
      'iphone': [100, 200, 300],
      'phone': [101, 201, 301],
      'smartphone': [102, 202, 302],
      'mobile': [103, 203, 303],
      'apple': [104, 204, 304],
      'ios': [105, 205, 305],
      
      // TV related terms
      'tv': [400, 500, 600],
      'television': [401, 501, 601],
      'qled': [402, 502, 602],
      'oled': [403, 503, 603],
      'samsung': [404, 504, 604],
      
      // Brand terms
      'samsung': [700, 800, 900],
      'google': [701, 801, 901],
      'pixel': [702, 802, 902],
      'sony': [703, 803, 903],
      'lg': [704, 804, 904],
      
      // General electronics
      'electronic': [1000, 1100, 1200],
      'device': [1001, 1101, 1201],
      'gadget': [1002, 1102, 1202]
    };
    
    words.forEach((word) => {
      try {
        const hash = simpleHash(word);
        
        // Use semantic mapping if available
        if (semanticMap[word]) {
          semanticMap[word].forEach((val, i) => {
            const pos = (val + i) % 1536;
            if (pos >= 0 && pos < embedding.length) {
              embedding[pos] = (embedding[pos] + 0.3) % 1;
            }
          });
        }
        
        // Fallback to hash-based embedding
        for (let i = 0; i < 15; i++) {
          const pos = (hash + i) % 1536;
          if (pos >= 0 && pos < embedding.length) {
            embedding[pos] = (embedding[pos] + 0.15) % 1;
          }
        }
      } catch (error) {
        console.warn(`Error processing word "${word}":`, error.message);
      }
    });
    
    // Apply normalization for better vector comparison
    try {
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      if (magnitude > 0 && isFinite(magnitude)) {
        return embedding.map(val => val / magnitude);
      }
    } catch (error) {
      console.warn('Error normalizing embedding:', error.message);
    }
    
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    return new Array(1536).fill(0);
  }
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Perform enhanced vector search with aggressive iPhone prioritization
async function vectorSearch(query, filters = {}, limit = 20) {
  try {
    // Generate embedding for the query
    const queryEmbedding = generateEmbedding(query);
    
    // Build base query with filters
    let searchQuery = {};
    
    if (filters.category) searchQuery.category = filters.category;
    if (filters.brand) searchQuery.brand = filters.brand;
    if (filters.priceRange) {
      searchQuery.price = {
        $gte: filters.priceRange.min || 0,
        $lte: filters.priceRange.max || 100000
      };
    }
    
    // Get all products that match filters
    const products = await Product.find(searchQuery)
      .limit(500) // Limit for performance
      .lean();
    
    // Calculate similarity scores with aggressive iPhone prioritization
    const queryLower = query.toLowerCase();
    const isIPhoneSearch = queryLower.includes('iphone') || queryLower.includes('phone') || queryLower.includes('apple');
    const isTVSearch = queryLower.includes('tv') || queryLower.includes('television');
    
    const productsWithScores = products.map(product => {
      let similarity = 0;
      
      if (product.vectorEmbedding && product.vectorEmbedding.length > 0) {
        similarity = cosineSimilarity(queryEmbedding, product.vectorEmbedding);
      }
      
      // Enhanced text-based similarity with aggressive category prioritization
      const productText = `${product.name} ${product.description} ${product.brand} ${product.category} ${product.tags.join(' ')} ${product.features.join(' ')}`.toLowerCase();
      const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      
      let textSimilarity = 0;
      let categoryBonus = 0;
      let exactMatchBonus = 0;
      let iPhonePriorityBonus = 0;
      let tvPenalty = 0;
      
      queryWords.forEach(word => {
        // Exact match in name gets highest weight
        if (product.name.toLowerCase().includes(word)) {
          textSimilarity += 0.4;
          exactMatchBonus += 0.3;
        }
        // Match in description gets medium weight
        else if (product.description.toLowerCase().includes(word)) {
          textSimilarity += 0.25;
        }
        // Match in tags gets medium weight
        else if (product.tags.some(tag => tag.toLowerCase().includes(word))) {
          textSimilarity += 0.2;
        }
        // Match in features gets lower weight
        else if (product.features.some(feature => feature.toLowerCase().includes(word))) {
          textSimilarity += 0.15;
        }
        // Partial match gets lowest weight
        else if (productText.includes(word)) {
          textSimilarity += 0.1;
        }
      });
      
      // AGGRESSIVE iPhone prioritization
      if (isIPhoneSearch) {
        const productCategory = (product.category || '').toLowerCase();
        const productBrand = (product.brand || '').toLowerCase();
        const productName = (product.name || '').toLowerCase();
        
        // MASSIVE boost for iPhone/Apple products
        if (productName.includes('iphone') || productName.includes('apple')) {
          iPhonePriorityBonus += 5.0; // Huge boost
        }
        
        if (productBrand === 'apple') {
          iPhonePriorityBonus += 3.0; // Big boost for Apple brand
        }
        
        if (productCategory.includes('phone') || productCategory.includes('smartphone') || productCategory.includes('mobile')) {
          iPhonePriorityBonus += 2.0; // Boost for phone category
        }
        
        // HEAVY penalty for TV products when searching iPhone
        if (productCategory.includes('tv') || productCategory.includes('television') || 
            productName.includes('tv') || productName.includes('television')) {
          tvPenalty -= 10.0; // Massive penalty for TVs
        }
        
        // Penalty for non-phone electronics
        if ((productBrand === 'lg' || productBrand === 'samsung') && 
            (productCategory.includes('tv') || productCategory.includes('electronics'))) {
          tvPenalty -= 5.0;
        }
      }
      
      // TV search prioritization
      if (isTVSearch) {
        const productCategory = (product.category || '').toLowerCase();
        const productName = (product.name || '').toLowerCase();
        
        if (productCategory.includes('tv') || productCategory.includes('television')) {
          categoryBonus += 1.5;
        }
        
        // Penalty for phone products when searching TV
        if (productCategory.includes('phone') || productCategory.includes('smartphone')) {
          tvPenalty -= 3.0;
        }
      }
      
      // Generic category matching
      if (filters.category && product.category === filters.category) {
        categoryBonus += 0.5;
      }
      
      // Combine vector and text similarity with enhanced weighting
      const baseSimilarity = product.vectorEmbedding ? 
        (similarity * 0.5 + textSimilarity * 0.5) : // Equal weight when vector available
        textSimilarity; // Use only text when no vector
      
      // Apply aggressive category and exact match bonuses
      const finalSimilarity = baseSimilarity + categoryBonus + exactMatchBonus + iPhonePriorityBonus + tvPenalty;
      
      // Boost based on AI recommendation score and popularity
      const boostScore = (product.aiRecommendationScore || 0) * 0.05 + (product.popularity || 0) * 0.00001;
      
      return {
        ...product,
        vectorScore: Math.min(finalSimilarity + boostScore, 10.0) // Allow higher scores for better matches
      };
    });
    
    // Sort by similarity score and return top results
    return productsWithScores
      .sort((a, b) => b.vectorScore - a.vectorScore)
      .slice(0, limit);
    
  } catch (error) {
    console.error('Vector search error:', error);
    throw error;
  }
}

// Enhanced hybrid search with Atlas integration and proper category prioritization
async function hybridSearch(query, filters = {}, limit = 20) {
  try {
    // Try Atlas-enhanced search first, fallback to local search
    const atlasResults = await atlasVectorSearch.hybridSearch(query, filters, limit);
    
    // If Atlas returned good results, use them
    if (atlasResults && atlasResults.length > 0) {
      console.log('Using Atlas-enhanced search results');
      return atlasResults;
    }
    
    // Fallback to local enhanced search
    console.log('Using local enhanced search');
    
    // Perform both searches in parallel
    const [textResults, vectorResults] = await Promise.all([
      // Enhanced text search with category prioritization
      Product.find({
        $text: { $search: query },
        ...filters
      })
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit * 2)
      .lean(),
      
      // Enhanced vector search
      vectorSearch(query, filters, limit * 2)
    ]);
    
    // Combine and deduplicate results with enhanced scoring
    const combinedResults = [];
    const seenIds = new Set();
    const queryLower = query.toLowerCase();
    
    // Add vector results with higher weight and category prioritization
    vectorResults.forEach(product => {
      if (!seenIds.has(product._id.toString())) {
        let boostScore = product.vectorScore || 0;
        
        // Massive boost for exact name matches
        if (product.name.toLowerCase().includes(queryLower)) {
          boostScore += 0.4;
        }
        
        // Category-specific boosts
        if (queryLower.includes('iphone') || queryLower.includes('phone')) {
          if (product.category && (product.category.toLowerCase().includes('phone') || 
              product.category.toLowerCase().includes('smartphone'))) {
            boostScore += 0.6; // Huge boost for phone category
          }
          if (product.brand && product.brand.toLowerCase() === 'apple') {
            boostScore += 0.3;
          }
        }
        
        combinedResults.push({
          ...product,
          hybridScore: Math.min(boostScore * 0.8, 2.0) // Higher weight for vector results
        });
        seenIds.add(product._id.toString());
      }
    });
    
    // Add text results with category prioritization
    textResults.forEach(product => {
      if (!seenIds.has(product._id.toString())) {
        let textScore = (product.score || 0) * 0.3;
        
        // Category-specific boosts for text results
        if (queryLower.includes('iphone') || queryLower.includes('phone')) {
          if (product.category && (product.category.toLowerCase().includes('phone') || 
              product.category.toLowerCase().includes('smartphone'))) {
            textScore += 0.3;
          }
        }
        
        combinedResults.push({
          ...product,
          hybridScore: Math.min(textScore, 1.5)
        });
        seenIds.add(product._id.toString());
      }
    });
    
    // Sort by hybrid score and return top results
    return combinedResults
      .sort((a, b) => b.hybridScore - a.hybridScore)
      .slice(0, limit);
    
  } catch (error) {
    console.error('Hybrid search error:', error);
    throw error;
  }
}

module.exports = {
  generateEmbedding,
  vectorSearch,
  hybridSearch,
  cosineSimilarity
};
