class AISearchEngine {
  constructor() {
    this.initialized = false;
    this.products = [];
    this.embeddings = new Map();
  }

  async initialize(products) {
    try {
      console.log('Initializing AI Search Engine...');
      this.products = products || [];
      
      // Build simple embeddings
      await this.buildSimpleEmbeddings();
      
      this.initialized = true;
      console.log('AI Search Engine initialized successfully');
    } catch (error) {
      console.error('Error initializing AI Search Engine:', error);
      throw error;
    }
  }

  async buildSimpleEmbeddings() {
    console.log('Building simple embeddings...');
    
    this.products.forEach(product => {
      const embedding = this.createSimpleEmbedding(product);
      this.embeddings.set(product._id.toString(), embedding);
    });
    
    console.log(`Built embeddings for ${this.embeddings.size} products`);
  }

  createSimpleEmbedding(product) {
    const embedding = new Array(100).fill(0);
    
    // Simple text encoding
    const text = `${product.name} ${product.description} ${(product.tags || []).join(' ')} ${(product.features || []).join(' ')}`;
    const words = text.toLowerCase().split(/\s+/);
    
    // Encode text features
    words.forEach((word, index) => {
      if (index < embedding.length) {
        let hash = 0;
        for (let i = 0; i < word.length; i++) {
          hash = ((hash << 5) - hash) + word.charCodeAt(i);
          hash = hash & hash;
        }
        embedding[index] = Math.abs(hash) / 1000000;
      }
    });
    
    // Encode numeric features
    embedding[50] = (product.price || 0) / 10000;
    embedding[51] = (product.rating || 0) / 5;
    embedding[52] = (product.popularity || 0) / 100;
    embedding[53] = (product.numReviews || 0) / 100;
    embedding[54] = (product.stock || 0) / 100;
    
    // Encode categorical features
    embedding[55] = (product.category || '').length / 50;
    embedding[56] = (product.brand || '').length / 50;
    embedding[57] = (product.discountPercentage || 0) / 100;
    
    // Apply activation function
    return embedding.map(val => Math.max(0, val));
  }

  async search(query, limit = 10) {
    if (!this.initialized) {
      return this.fallbackSearch(query, limit);
    }

    try {
      const queryEmbedding = this.createQueryEmbedding(query);
      const results = [];

      this.embeddings.forEach((embedding, productId) => {
        const product = this.products.find(p => p._id.toString() === productId);
        if (product) {
          const similarity = this.calculateSimilarity(queryEmbedding, embedding);
          results.push({ product, similarity });
        }
      });

      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(result => result.product);
    } catch (error) {
      console.error('AI search failed, using fallback:', error);
      return this.fallbackSearch(query, limit);
    }
  }

  createQueryEmbedding(query) {
    const embedding = new Array(100).fill(0);
    const words = query.toLowerCase().split(/\s+/);
    
    words.forEach((word, index) => {
      if (index < embedding.length) {
        let hash = 0;
        for (let i = 0; i < word.length; i++) {
          hash = ((hash << 5) - hash) + word.charCodeAt(i);
          hash = hash & hash;
        }
        embedding[index] = Math.abs(hash) / 1000000;
      }
    });
    
    return embedding.map(val => Math.max(0, val));
  }

  calculateSimilarity(embedding1, embedding2) {
    if (!embedding1 || !embedding2) return 0;
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    for (let i = 0; i < Math.min(embedding1.length, embedding2.length); i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    
    return dotProduct / (magnitude1 * magnitude2);
  }

  fallbackSearch(query, limit = 10) {
    const queryLower = query.toLowerCase();
    const results = [];
    
    this.products.forEach(product => {
      let score = 0;
      
      // Name matching
      if (product.name && product.name.toLowerCase().includes(queryLower)) {
        score += 10;
      }
      
      // Description matching
      if (product.description && product.description.toLowerCase().includes(queryLower)) {
        score += 5;
      }
      
      // Category matching
      if (product.category && product.category.toLowerCase().includes(queryLower)) {
        score += 3;
      }
      
      // Brand matching
      if (product.brand && product.brand.toLowerCase().includes(queryLower)) {
        score += 3;
      }
      
      // Tags matching
      if (product.tags) {
        product.tags.forEach(tag => {
          if (tag.toLowerCase().includes(queryLower)) {
            score += 2;
          }
        });
      }
      
      if (score > 0) {
        results.push({ product, score });
      }
    });
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(result => result.product);
  }

  async getRelatedProducts(productId, limit = 5) {
    if (!this.initialized) {
      return this.fallbackRelatedProducts(productId, limit);
    }

    try {
      const product = this.products.find(p => p._id.toString() === productId);
      if (!product) return [];

      const productEmbedding = this.embeddings.get(productId);
      if (!productEmbedding) return [];

      const results = [];

      this.embeddings.forEach((embedding, otherProductId) => {
        if (otherProductId !== productId) {
          const otherProduct = this.products.find(p => p._id.toString() === otherProductId);
          if (otherProduct) {
            const similarity = this.calculateSimilarity(productEmbedding, embedding);
            results.push({ product: otherProduct, similarity });
          }
        }
      });

      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(result => result.product);
    } catch (error) {
      console.error('Related products failed, using fallback:', error);
      return this.fallbackRelatedProducts(productId, limit);
    }
  }

  fallbackRelatedProducts(productId, limit = 5) {
    const product = this.products.find(p => p._id.toString() === productId);
    if (!product) return [];

    const results = [];

    this.products.forEach(otherProduct => {
      if (otherProduct._id.toString() !== productId) {
        let score = 0;

        // Same category
        if (product.category === otherProduct.category) {
          score += 5;
        }

        // Same brand
        if (product.brand === otherProduct.brand) {
          score += 3;
        }

        // Price range similarity
        const priceDiff = Math.abs(product.price - otherProduct.price);
        if (priceDiff < product.price * 0.2) {
          score += 2;
        }

        // Rating similarity
        const ratingDiff = Math.abs((product.rating || 0) - (otherProduct.rating || 0));
        if (ratingDiff < 1) {
          score += 1;
        }

        if (score > 0) {
          results.push({ product: otherProduct, score });
        }
      }
    });

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(result => result.product);
  }
}

module.exports = AISearchEngine;
