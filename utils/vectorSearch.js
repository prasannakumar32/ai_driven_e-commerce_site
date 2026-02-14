const mongoose = require('mongoose');
const Product = require('../models/Product');

// Simple embedding generator (in production, use OpenAI or similar)
function generateEmbedding(text) {
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(1536).fill(0);
  
  words.forEach((word, index) => {
    const hash = simpleHash(word);
    for (let i = 0; i < 10; i++) {
      embedding[(hash + i) % 1536] = (embedding[(hash + i) % 1536] + 0.1) % 1;
    }
  });
  
  return embedding;
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

// Perform vector search
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
    
    // Calculate similarity scores with enhanced text matching
    const productsWithScores = products.map(product => {
      let similarity = 0;
      
      if (product.vectorEmbedding && product.vectorEmbedding.length > 0) {
        similarity = cosineSimilarity(queryEmbedding, product.vectorEmbedding);
      }
      
      // Enhanced text-based similarity for better matching
      const productText = `${product.name} ${product.description} ${product.brand} ${product.category} ${product.tags.join(' ')} ${product.features.join(' ')}`.toLowerCase();
      const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      
      let textSimilarity = 0;
      queryWords.forEach(word => {
        // Exact match in name gets highest weight
        if (product.name.toLowerCase().includes(word)) {
          textSimilarity += 0.3;
        }
        // Match in description gets medium weight
        else if (product.description.toLowerCase().includes(word)) {
          textSimilarity += 0.2;
        }
        // Match in tags gets medium weight
        else if (product.tags.some(tag => tag.toLowerCase().includes(word))) {
          textSimilarity += 0.15;
        }
        // Match in features gets lower weight
        else if (product.features.some(feature => feature.toLowerCase().includes(word))) {
          textSimilarity += 0.1;
        }
        // Partial match gets lowest weight
        else if (productText.includes(word)) {
          textSimilarity += 0.05;
        }
      });
      
      // Combine vector and text similarity
      const finalSimilarity = product.vectorEmbedding ? 
        (similarity * 0.6 + textSimilarity * 0.4) : // Weight vector more when available
        textSimilarity; // Use only text when no vector
      
      // Boost based on AI recommendation score and popularity
      const boostScore = (product.aiRecommendationScore || 0) * 0.1 + (product.popularity || 0) * 0.00001;
      
      return {
        ...product,
        vectorScore: Math.min(finalSimilarity + boostScore, 1.0)
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

// Hybrid search combining text and vector search
async function hybridSearch(query, filters = {}, limit = 20) {
  try {
    // Perform both searches in parallel
    const [textResults, vectorResults] = await Promise.all([
      // Text search
      Product.find({
        $text: { $search: query },
        ...filters
      })
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit * 2)
      .lean(),
      
      // Vector search
      vectorSearch(query, filters, limit * 2)
    ]);
    
    // Combine and deduplicate results
    const combinedResults = [];
    const seenIds = new Set();
    
    // Add vector results with higher weight
    vectorResults.forEach(product => {
      if (!seenIds.has(product._id.toString())) {
        // Boost vector results that have exact name matches
        let boostScore = product.vectorScore || 0;
        if (product.name.toLowerCase().includes(query.toLowerCase())) {
          boostScore += 0.2; // Significant boost for exact name matches
        }
        
        combinedResults.push({
          ...product,
          hybridScore: Math.min(boostScore * 0.7, 1.0)
        });
        seenIds.add(product._id.toString());
      }
    });
    
    // Add text results
    textResults.forEach(product => {
      if (!seenIds.has(product._id.toString())) {
        combinedResults.push({
          ...product,
          hybridScore: (product.score || 0) * 0.3
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
