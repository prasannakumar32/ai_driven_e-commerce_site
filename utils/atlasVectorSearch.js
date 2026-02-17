const mongoose = require('mongoose');
const Product = require('../models/Product');

// Atlas Vector Search integration
class AtlasVectorSearch {
  constructor() {
    this.isInitialized = false;
    this.indexName = 'vector_index';
  }

  // Initialize Atlas Vector Search
  async initialize() {
    try {
      if (this.isInitialized) return;

      console.log('Initializing Atlas Vector Search...');
      
      // Check if vector search index exists
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      const productsCollection = collections.find(c => c.name === 'products');
      
      if (productsCollection) {
        console.log('Products collection found, checking vector index...');
        // In production, you would create the index here if it doesn't exist
        // This requires Atlas admin privileges
      }

      this.isInitialized = true;
      console.log('Atlas Vector Search initialized successfully');
    } catch (error) {
      console.error('Error initializing Atlas Vector Search:', error);
      // Continue without Atlas search, fallback to local vector search
    }
  }

  // Perform Atlas vector search
  async search(query, filters = {}, limit = 20) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Generate query vector
      const queryVector = this.generateQueryVector(query);
      
      // Build Atlas Search aggregation pipeline
      const pipeline = [
        {
          $search: {
            index: this.indexName,
            knnBeta: {
              vector: queryVector,
              path: 'vectorEmbedding',
              k: limit * 2, // Get more results for better filtering
              filter: this.buildAtlasFilter(filters)
            }
          }
        },
        {
          $project: {
            name: 1,
            description: 1,
            category: 1,
            brand: 1,
            price: 1,
            rating: 1,
            popularity: 1,
            tags: 1,
            features: 1,
            reviews: 1,
            score: { $meta: 'searchScore' }
          }
        },
        {
          $limit: limit * 2
        }
      ];

      // Execute Atlas Search
      const results = await Product.aggregate(pipeline);
      
      // Apply enhanced scoring and filtering
      return this.enhanceAtlasResults(results, query, filters, limit);
      
    } catch (error) {
      console.error('Atlas vector search error, falling back to local search:', error);
      // Fallback to local vector search
      const { vectorSearch } = require('./vectorSearch');
      return await vectorSearch(query, filters, limit);
    }
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

    return atlasFilters.length > 0 ? { and: atlasFilters } : null;
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
