const mongoose = require('mongoose');
const Product = require('../models/Product');

// Atlas Vector Search integration - DISABLED due to configuration issues
class AtlasVectorSearch {
  constructor() {
    this.isInitialized = false;
    this.indexName = 'vector_index';
  }

  // Initialize Atlas Vector Search - DISABLED
  async initialize() {
    try {
      if (this.isInitialized) return;

      console.log('Atlas Vector Search is disabled - using fallback search...');
      this.isInitialized = false; // Keep disabled
    } catch (error) {
      console.error('Atlas Vector Search disabled:', error);
      this.isInitialized = false;
    }
  }

  // Perform Atlas vector search - DISABLED
  async search(query, filters = {}, limit = 20) {
    console.log('Atlas Vector Search disabled - returning empty results to trigger fallback');
    return []; // Always return empty to trigger fallback
  }

  // Generate query vector for Atlas
  generateQueryVector(query) {
    // Use the enhanced embedding generator
    const { generateEmbedding } = require('./vectorSearch');
    return generateEmbedding(query);
  }

  // Build Atlas filter from filters object
  buildAtlasFilter(filters) {
    const atlasFilters = [];

    if (filters.category) {
      atlasFilters.push({
        text: {
          query: filters.category,
          path: 'category'
        }
      });
    }

    if (filters.brand) {
      atlasFilters.push({
        text: {
          query: filters.brand,
          path: 'brand'
        }
      });
    }

    if (filters.priceRange) {
      atlasFilters.push({
        range: {
          path: 'price',
          gte: filters.priceRange.min || 0,
          lte: filters.priceRange.max || 100000
        }
      });
    }

    // Always return a valid filter object, never null
    return atlasFilters.length > 0 ? { compound: { filter: { and: atlasFilters } } } : { compound: { filter: { exists: { path: '_id' } } } };
  }

  // Enhance Atlas results with category prioritization
  enhanceAtlasResults(results, query, filters, limit) {
    const queryLower = query.toLowerCase();
    
    const enhancedResults = results.map(product => {
      let score = product.score || 0;
      
      // Category-specific prioritization
      if (queryLower.includes('iphone') || queryLower.includes('phone') || queryLower.includes('smartphone')) {
        const productCategory = (product.category || '').toLowerCase();
        const productBrand = (product.brand || '').toLowerCase();
        
        // Massive boost for phone category products
        if (productCategory.includes('phone') || productCategory.includes('smartphone') || productCategory.includes('mobile')) {
          score += 2.0;
        }
        
        // Additional boost for Apple brand when searching iPhone
        if (queryLower.includes('iphone') && productBrand === 'apple') {
          score += 1.5;
        }
      }
      
      if (queryLower.includes('tv') || queryLower.includes('television')) {
        const productCategory = (product.category || '').toLowerCase();
        if (productCategory.includes('tv') || productCategory.includes('television')) {
          score += 1.2;
        }
      }
      
      // Exact name match bonus
      if ((product.name || '').toLowerCase().includes(queryLower)) {
        score += 1.0;
      }
      
      return {
        ...product,
        atlasScore: score,
        vectorScore: score // Use consistent field name
      };
    });

    // Sort by enhanced score and limit results
    return enhancedResults
      .sort((a, b) => b.atlasScore - a.atlasScore)
      .slice(0, limit);
  }

  // Hybrid search combining Atlas and local search
  async hybridSearch(query, filters = {}, limit = 20) {
    try {
      // Try Atlas search first
      const atlasResults = await this.search(query, filters, limit);
      
      // Get local search results as backup
      const { hybridSearch: localHybridSearch } = require('./vectorSearch');
      const localResults = await localHybridSearch(query, filters, limit);
      
      // Combine results with Atlas getting priority
      const combinedResults = [];
      const seenIds = new Set();
      
      // Add Atlas results first with higher weight
      atlasResults.forEach(product => {
        if (!seenIds.has(product._id.toString())) {
          combinedResults.push({
            ...product,
            hybridScore: (product.atlasScore || 0) * 0.8 // Higher weight for Atlas
          });
          seenIds.add(product._id.toString());
        }
      });
      
      // Add local results that weren't in Atlas results
      localResults.forEach(product => {
        if (!seenIds.has(product._id.toString())) {
          combinedResults.push({
            ...product,
            hybridScore: (product.hybridScore || 0) * 0.6 // Lower weight for local
          });
          seenIds.add(product._id.toString());
        }
      });
      
      // Sort by hybrid score and return top results
      return combinedResults
        .sort((a, b) => b.hybridScore - a.hybridScore)
        .slice(0, limit);
        
    } catch (error) {
      console.error('Hybrid search error, using local search only:', error);
      const { hybridSearch } = require('./vectorSearch');
      return await hybridSearch(query, filters, limit);
    }
  }
}

// Export singleton instance
const atlasVectorSearch = new AtlasVectorSearch();

module.exports = {
  atlasVectorSearch,
  // Convenience functions
  atlasVectorSearchFunction: async (query, filters = {}, limit = 20) => {
    return await atlasVectorSearch.search(query, filters, limit);
  },
  atlasHybridSearch: async (query, filters = {}, limit = 20) => {
    return await atlasVectorSearch.hybridSearch(query, filters, limit);
  }
};
