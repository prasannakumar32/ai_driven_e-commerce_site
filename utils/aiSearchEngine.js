// Optimized AI search engine with caching and indexing

// Simple LRU Cache implementation
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key) {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }
  
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
  
  has(key) {
    return this.cache.has(key);
  }
  
  clear() {
    this.cache.clear();
  }
}

class AISearchEngine {
  constructor() {
    this.productVectors = new Map();
    this.categoryVectors = new Map();
    this.brandVectors = new Map();
    this.word2vecModel = null;
    this.tfidfVectorizer = null;
    this.isInitialized = false;
    this.mlModels = {
      semantic: null,
      category: null,
      brand: null
    };
    
    // Performance optimizations
    this.searchCache = new LRUCache(1000); // Cache recent searches
    this.productIndex = new Map(); // Quick product lookup
    this.categoryIndex = new Map(); // Category-based indexing
    this.brandIndex = new Map(); // Brand-based indexing
    this.tagIndex = new Map(); // Tag-based indexing
    this.initializationPromise = null; // Prevent multiple initializations
  }

  // Optimized initialization with promise caching
  async initialize() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    this.initializationPromise = this._doInitialize();
    return this.initializationPromise;
  }
  
  async _doInitialize() {
    try {
      console.log('Initializing optimized AI Search Engine...');
      const startTime = Date.now();
      
      // Load product data with optimized query
      const Product = require('../models/Product');
      const products = await Product.find({})
        .select('_id name description category brand price rating popularity tags features')
        .lean() // Use lean for better performance
        .maxTimeMS(3000);
      
      console.log('Loaded', products.length, 'products for AI processing');
      
      // Build indexes first for faster lookups
      this.buildIndexes(products);
      
      // Initialize ML models with reduced complexity
      await this.initializeOptimizedMLModels(products);
      
      // Build optimized vectors
      await this.buildOptimizedVectors(products);
      
      this.isInitialized = true;
      const initTime = Date.now() - startTime;
      console.log(`AI Search Engine initialized in ${initTime}ms with ${products.length} products`);
    } catch (error) {
      console.error('Error initializing AI Search Engine:', error);
      this.initializationPromise = null; // Reset on error
      this.isInitialized = false;
    }
  }

  // Build performance indexes
  buildIndexes(products) {
    console.log('Building performance indexes...');
    
    products.forEach(product => {
      const id = product._id.toString();
      
      // Product index for O(1) lookup
      this.productIndex.set(id, product);
      
      // Category index
      if (!this.categoryIndex.has(product.category)) {
        this.categoryIndex.set(product.category, []);
      }
      this.categoryIndex.get(product.category).push(id);
      
      // Brand index
      if (!this.brandIndex.has(product.brand)) {
        this.brandIndex.set(product.brand, []);
      }
      this.brandIndex.get(product.brand).push(id);
      
      // Tag index
      (product.tags || []).forEach(tag => {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, []);
        }
        this.tagIndex.get(tag).push(id);
      });
    });
    
    console.log('Indexes built successfully');
  }
  
  // Initialize optimized ML models with reduced complexity
  async initializeOptimizedMLModels(products) {
    // Simplified Word2Vec with reduced dimensions
    this.word2vecModel = this.createOptimizedWord2VecModel(products);
    
    // Simplified TF-IDF
    this.tfidfVectorizer = this.createOptimizedTFIDFVectorizer(products);
    
    // Lightweight semantic model
    this.mlModels.semantic = this.createOptimizedSemanticModel(products);
    
    // Simplified category and brand models
    this.mlModels.category = this.createOptimizedCategoryModel(products);
    this.mlModels.brand = this.createOptimizedBrandModel(products);
  }

  // Create optimized Word2Vec model with reduced complexity
  createOptimizedWord2VecModel(products) {
    const word2vec = {
      vocabulary: new Set(),
      wordVectors: new Map(),
      dimensions: 50, // Reduced dimensions for performance
      learningRate: 0.01,
      epochs: 10 // Reduced epochs for faster initialization
    };

    // Build vocabulary from product data
    products.forEach(product => {
      const text = `${product.name} ${product.description} ${(product.tags || []).join(' ')} ${(product.features || []).join(' ')}`;
      const words = this.preprocessText(text);
      words.forEach(word => word2vec.vocabulary.add(word));
    });

    // Initialize random vectors for each word
    word2vec.vocabulary.forEach(word => {
      const vector = [];
      for (let i = 0; i < word2vec.dimensions; i++) {
        vector.push((Math.random() - 0.5) * 0.1);
      }
      word2vec.wordVectors.set(word, vector);
    });

    // Simplified training with reduced iterations
    for (let epoch = 0; epoch < word2vec.epochs; epoch++) {
      products.slice(0, Math.min(products.length, 100)).forEach(product => { // Limit products for training
        const text = `${product.name} ${product.description} ${(product.tags || []).join(' ')}`;
        const words = this.preprocessText(text);
        
        // Simplified skip-gram training
        for (let i = 0; i < Math.min(words.length, 20); i++) { // Limit words per product
          const targetWord = words[i];
          const contextWords = this.getContextWords(words, i, 2);
          
          contextWords.slice(0, 2).forEach(contextWord => { // Limit context words
            this.updateWord2Vec(word2vec, targetWord, contextWord);
          });
        }
      });
    }

    return word2vec;
  }

  // Create optimized TF-IDF Vectorizer
  createOptimizedTFIDFVectorizer(products) {
    const tfidf = {
      documents: [],
      vocabulary: new Set(),
      idf: new Map(),
      tfidfVectors: new Map()
    };

    // Create document corpus with limited products for performance
    const limitedProducts = products.slice(0, Math.min(products.length, 200));
    
    limitedProducts.forEach(product => {
      const doc = `${product.name} ${product.description} ${(product.tags || []).join(' ')}`;
      const words = this.preprocessText(doc);
      tfidf.documents.push(words);
      words.forEach(word => tfidf.vocabulary.add(word));
    });

    // Calculate IDF
    const totalDocs = tfidf.documents.length;
    tfidf.vocabulary.forEach(word => {
      let docCount = 0;
      tfidf.documents.forEach(doc => {
        if (doc.includes(word)) docCount++;
      });
      tfidf.idf.set(word, Math.log(totalDocs / (docCount + 1)));
    });

    // Calculate TF-IDF vectors
    tfidf.documents.forEach((doc, docIndex) => {
      const wordCount = {};
      doc.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });

      const tfidfVector = {};
      const maxTF = Math.max(...Object.values(wordCount));

      tfidf.vocabulary.forEach(word => {
        const tf = wordCount[word] || 0;
        const idf = tfidf.idf.get(word);
        tfidfVector[word] = (tf / maxTF) * idf;
      });

      tfidf.tfidfVectors.set(docIndex, tfidfVector);
    });

    return tfidf;
  }

  // Create optimized semantic model
  createOptimizedSemanticModel(products) {
    return {
      embeddings: new Map(),
      dimensions: 100, // Reduced dimensions
      
      createEmbeddings: (products) => {
        const embeddings = new Map();
        
        products.slice(0, Math.min(products.length, 200)).forEach(product => {
          const embedding = this.createProductEmbedding(product);
          embeddings.set(product._id.toString(), embedding);
        });
        
        return embeddings;
      },
      
      createProductEmbedding: (product) => {
        const embedding = new Array(100).fill(0);
        
        // Encode product features
        this.encodeProductFeatures(product, embedding);
        
        // Apply activation function
        return embedding.map(val => Math.max(0, val)); // ReLU activation
      },
      
      encodeProductFeatures: (product, embedding) => {
        const features = [
          ...this.extractTextFeatures(product),
          ...this.extractNumericFeatures(product),
          ...this.extractCategoricalFeatures(product)
        ];
        
        features.forEach((feature, index) => {
          if (index < embedding.length) {
            embedding[index] = feature;
          }
        });
      },
      
      extractTextFeatures: (product) => {
        const text = `${product.name} ${product.description} ${(product.tags || []).join(' ')}`;
        const words = this.preprocessText(text);
        const features = [];
        
        // Use hash-based encoding for text
        for (let i = 0; i < 30; i++) { // Reduced feature count
          if (i < words.length) {
            const hash = this.simpleHash(words[i]);
            features.push(hash / 1000000);
          } else {
            features.push(0);
          }
        }
        
        return features;
      },
      
      extractNumericFeatures: (product) => {
        return [
          (product.price || 0) / 10000, // Normalized price
          (product.rating || 0) / 5, // Normalized rating
          (product.popularity || 0) / 100, // Normalized popularity
          (product.numReviews || 0) / 100, // Normalized review count
          (product.stock || 0) / 100 // Normalized stock
        ];
      },
      
      extractCategoricalFeatures: (product) => {
        const categoryHash = this.simpleHash(product.category || '');
        const brandHash = this.simpleHash(product.brand || '');
        
        return [
          categoryHash / 1000000,
          brandHash / 1000000,
          (product.discountPercentage || 0) / 100,
          (product.highPrice || 0) / 10000,
          (product.initialPrice || 0) / 10000
        ];
      },
      
      simpleHash: (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
      },
      
      calculateSimilarity: (embedding1, embedding2) => {
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
    };
  }

  // Create optimized category model
  createOptimizedCategoryModel(products) {
    const categoryData = {};
    
    // Collect category data with limited products
    const limitedProducts = products.slice(0, Math.min(products.length, 200));
    
    limitedProducts.forEach(product => {
      const category = (product.category || '').toLowerCase();
      if (!categoryData[category]) {
        categoryData[category] = [];
      }
      
      const features = this.extractMLFeatures(product);
      categoryData[category].push(features);
    });
    
    return {
      categories: Object.keys(categoryData),
      categoryData,
      
      classify: (features) => {
        let bestCategory = null;
        let bestScore = -Infinity;
        
        Object.entries(categoryData).forEach(([category, trainingData]) => {
          const score = this.calculateCategoryScore(features, trainingData);
          if (score > bestScore) {
            bestScore = score;
            bestCategory = category;
          }
        });
        
        return { category: bestCategory, confidence: bestScore };
      },
      
      calculateCategoryScore: (features, trainingData) => {
        if (trainingData.length === 0) return 0;
        
        let totalScore = 0;
        trainingData.slice(0, 50).forEach(trainingFeatures => { // Limit training data
          const similarity = this.calculateFeatureSimilarity(features, trainingFeatures);
          totalScore += similarity;
        });
        
        return totalScore / Math.min(trainingData.length, 50);
      },
      
      calculateFeatureSimilarity: (features1, features2) => {
        if (!features1 || !features2) return 0;
        
        let similarity = 0;
        const minLength = Math.min(features1.length, features2.length);
        
        for (let i = 0; i < minLength; i++) {
          similarity += 1 - Math.abs(features1[i] - features2[i]) / Math.max(Math.abs(features1[i]), Math.abs(features2[i]), 1);
        }
        
        return similarity / minLength;
      }
    };
  }

  // Create optimized brand model
  createOptimizedBrandModel(products) {
    const brandData = {};
    
    // Collect brand data with limited products
    const limitedProducts = products.slice(0, Math.min(products.length, 200));
    
    limitedProducts.forEach(product => {
      const brand = (product.brand || '').toLowerCase();
      if (!brandData[brand]) {
        brandData[brand] = {
          categories: new Set(),
          priceRange: [],
          features: []
        };
      }
      
      brandData[brand].categories.add((product.category || '').toLowerCase());
      brandData[brand].priceRange.push(product.price || 0);
      brandData[brand].features.push(...this.extractMLFeatures(product));
    });
    
    return {
      brands: Object.keys(brandData),
      brandData,
      
      findRelatedBrands: (brand, limit = 5) => {
        const relationships = [];
        const targetData = brandData[brand.toLowerCase()];
        
        if (!targetData) return relationships;
        
        Object.entries(brandData).forEach(([otherBrand, otherData]) => {
          if (otherBrand === brand.toLowerCase()) return;
          
          let similarity = 0;
          
          // Category overlap
          const categoryOverlap = [...targetData.categories].filter(cat => otherData.categories.has(cat)).length;
          similarity += categoryOverlap * 0.4;
          
          // Price range similarity
          const avgPrice1 = targetData.priceRange.reduce((a, b) => a + b, 0) / targetData.priceRange.length;
          const avgPrice2 = otherData.priceRange.reduce((a, b) => a + b, 0) / otherData.priceRange.length;
          const priceDiff = Math.abs(avgPrice1 - avgPrice2) / Math.max(avgPrice1, avgPrice2, 1);
          similarity += (1 - priceDiff) * 0.3;
          
          // Feature similarity
          const avgSimilarity = this.calculateAverageFeatureSimilarity(targetData.features, otherData.features);
          similarity += avgSimilarity * 0.3;
          
          relationships.push({
            brand: otherBrand,
            similarity
          });
        });
        
        return relationships
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, limit);
      },
      
      calculateAverageFeatureSimilarity: (features1, features2) => {
        if (features1.length === 0 || features2.length === 0) return 0;
        
        let totalSimilarity = 0;
        let comparisons = 0;
        
        features1.slice(0, 50).forEach(f1 => {
          features2.slice(0, 50).forEach(f2 => {
            const similarity = this.calculateFeatureSimilarity(f1, f2);
            totalSimilarity += similarity;
            comparisons++;
          });
        });
        
        return comparisons > 0 ? totalSimilarity / comparisons : 0;
      }
    };
  }

  // Create Word2Vec-like model using co-occurrence analysis
  createWord2VecModel(products) {
    const word2vec = {
      vocabulary: new Set(),
      wordVectors: new Map(),
      dimensions: 100,
      learningRate: 0.01,
      epochs: 50
    };

    // Build vocabulary from product data
    products.forEach(product => {
      const text = `${product.name} ${product.description} ${(product.tags || []).join(' ')} ${(product.features || []).join(' ')}`;
      const words = this.preprocessText(text);
      words.forEach(word => word2vec.vocabulary.add(word));
    });

    // Initialize random vectors for each word
    word2vec.vocabulary.forEach(word => {
      const vector = [];
      for (let i = 0; i < word2vec.dimensions; i++) {
        vector.push((Math.random() - 0.5) * 0.1);
      }
      word2vec.wordVectors.set(word, vector);
    });

    // Train Word2Vec using skip-gram like approach
    for (let epoch = 0; epoch < word2vec.epochs; epoch++) {
      products.forEach(product => {
        const text = `${product.name} ${product.description} ${(product.tags || []).join(' ')} ${(product.features || []).join(' ')}`;
        const words = this.preprocessText(text);
        
        // Skip-gram training
        for (let i = 0; i < words.length; i++) {
          const targetWord = words[i];
          const contextWords = this.getContextWords(words, i, 2);
          
          contextWords.forEach(contextWord => {
            this.updateWord2Vec(word2vec, targetWord, contextWord);
          });
        }
      });
    }

    return word2vec;
  }

  // Update Word2Vec vectors
  updateWord2Vec(word2vec, targetWord, contextWord) {
    if (!word2vec.wordVectors.has(targetWord) || !word2vec.wordVectors.has(contextWord)) {
      return;
    }

    const targetVector = word2vec.wordVectors.get(targetWord);
    const contextVector = word2vec.wordVectors.get(contextWord);
    
    // Gradient descent update
    for (let i = 0; i < word2vec.dimensions; i++) {
      const error = contextVector[i] - targetVector[i];
      targetVector[i] += word2vec.learningRate * error;
    }
  }

  // Get context words for skip-gram
  getContextWords(words, index, windowSize) {
    const context = [];
    const start = Math.max(0, index - windowSize);
    const end = Math.min(words.length, index + windowSize + 1);
    
    for (let i = start; i < end; i++) {
      if (i !== index) {
        context.push(words[i]);
      }
    }
    
    return context;
  }

  // Create TF-IDF Vectorizer
  createTFIDFVectorizer(products) {
    const tfidf = {
      documents: [],
      vocabulary: new Set(),
      idf: new Map(),
      tfidfVectors: new Map()
    };

    // Create document corpus
    products.forEach(product => {
      const doc = `${product.name} ${product.description} ${(product.tags || []).join(' ')} ${(product.features || []).join(' ')}`;
      const words = this.preprocessText(doc);
      tfidf.documents.push(words);
      words.forEach(word => tfidf.vocabulary.add(word));
    });

    // Calculate IDF
    const totalDocs = tfidf.documents.length;
    tfidf.vocabulary.forEach(word => {
      let docCount = 0;
      tfidf.documents.forEach(doc => {
        if (doc.includes(word)) docCount++;
      });
      tfidf.idf.set(word, Math.log(totalDocs / (docCount + 1)));
    });

    // Calculate TF-IDF vectors
    tfidf.documents.forEach((doc, docIndex) => {
      const wordCount = {};
      doc.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });

      const tfidfVector = {};
      const maxTF = Math.max(...Object.values(wordCount));

      tfidf.vocabulary.forEach(word => {
        const tf = wordCount[word] || 0;
        const idf = tfidf.idf.get(word);
        tfidfVector[word] = (tf / maxTF) * idf;
      });

      tfidf.tfidfVectors.set(docIndex, tfidfVector);
    });

    return tfidf;
  }

  // Create semantic similarity model using neural network concepts
  createSemanticModel(products) {
    return {
      embeddings: new Map(),
      dimensions: 200,
      activation: 'relu',
      similarity: 'cosine',
      
      // Create embeddings for products
      createEmbeddings: (products) => {
        const embeddings = new Map();
        
        products.forEach(product => {
          const embedding = this.createProductEmbedding(product);
          embeddings.set(product._id.toString(), embedding);
        });
        
        return embeddings;
      },
      
      // Create single product embedding
      createProductEmbedding: (product) => {
        const embedding = new Array(this.dimensions).fill(0);
        
        // Encode product features
        this.encodeProductFeatures(product, embedding);
        
        // Apply activation function
        return embedding.map(val => Math.max(0, val)); // ReLU activation
      },
      
      // Encode product features into embedding
      encodeProductFeatures: (product, embedding) => {
        const features = [
          ...this.extractTextFeatures(product),
          ...this.extractNumericFeatures(product),
          ...this.extractCategoricalFeatures(product)
        ];
        
        features.forEach((feature, index) => {
          if (index < embedding.length) {
            embedding[index] = feature;
          }
        });
      },
      
      // Extract text features
      extractTextFeatures: (product) => {
        const text = `${product.name} ${product.description} ${(product.tags || []).join(' ')} ${(product.features || []).join(' ')}`;
        const words = this.preprocessText(text);
        const features = [];
        
        // Use hash-based encoding for text
        for (let i = 0; i < 50; i++) {
          if (i < words.length) {
            const hash = this.simpleHash(words[i]);
            features.push(hash / 1000000);
          } else {
            features.push(0);
          }
        }
        
        return features;
      },
      
      // Extract numeric features
      extractNumericFeatures: (product) => {
        return [
          product.price / 10000, // Normalized price
          (product.rating || 0) / 5, // Normalized rating
          (product.popularity || 0) / 100, // Normalized popularity
          (product.numReviews || 0) / 100, // Normalized review count
          product.stock / 100 // Normalized stock
        ];
      },
      
      // Extract categorical features
      extractCategoricalFeatures: (product) => {
        const categoryHash = this.simpleHash(product.category);
        const brandHash = this.simpleHash(product.brand);
        
        return [
          categoryHash / 1000000,
          brandHash / 1000000,
          product.discountPercentage / 100,
          product.highPrice / 10000,
          product.initialPrice / 10000
        ];
      },
      
      // Simple hash function
      simpleHash: (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
      },
      
      // Calculate similarity between embeddings
      calculateSimilarity: (embedding1, embedding2) => {
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
    };
  }

  // Create category classification model
  createCategoryModel(products) {
    const categoryData = {};
    
    // Collect category data
    products.forEach(product => {
      const category = product.category.toLowerCase();
      if (!categoryData[category]) {
        categoryData[category] = [];
      }
      
      const features = this.extractMLFeatures(product);
      categoryData[category].push(features);
    });
    
    return {
      categories: Object.keys(categoryData),
      categoryData,
      
      // Classify category
      classify: (features) => {
        let bestCategory = null;
        let bestScore = -Infinity;
        
        Object.entries(categoryData).forEach(([category, trainingData]) => {
          const score = this.calculateCategoryScore(features, trainingData);
          if (score > bestScore) {
            bestScore = score;
            bestCategory = category;
          }
        });
        
        return { category: bestCategory, confidence: bestScore };
      },
      
      // Calculate category score
      calculateCategoryScore: (features, trainingData) => {
        if (trainingData.length === 0) return 0;
        
        let totalScore = 0;
        trainingData.forEach(trainingFeatures => {
          const similarity = this.calculateFeatureSimilarity(features, trainingFeatures);
          totalScore += similarity;
        });
        
        return totalScore / trainingData.length;
      },
      
      // Calculate feature similarity
      calculateFeatureSimilarity: (features1, features2) => {
        if (!features1 || !features2) return 0;
        
        let similarity = 0;
        const minLength = Math.min(features1.length, features2.length);
        
        for (let i = 0; i < minLength; i++) {
          similarity += 1 - Math.abs(features1[i] - features2[i]) / Math.max(Math.abs(features1[i]), Math.abs(features2[i]), 1);
        }
        
        return similarity / minLength;
      }
    };
  }

  // Create brand relationship model
  createBrandModel(products) {
    const brandData = {};
    
    // Collect brand data
    products.forEach(product => {
      const brand = product.brand.toLowerCase();
      if (!brandData[brand]) {
        brandData[brand] = {
          categories: new Set(),
          priceRange: [],
          features: []
        };
      }
      
      brandData[brand].categories.add(product.category.toLowerCase());
      brandData[brand].priceRange.push(product.price);
      brandData[brand].features.push(...this.extractMLFeatures(product));
    });
    
    return {
      brands: Object.keys(brandData),
      brandData,
      
      // Find related brands
      findRelatedBrands: (brand, limit = 5) => {
        const relationships = [];
        const targetData = brandData[brand.toLowerCase()];
        
        if (!targetData) return relationships;
        
        Object.entries(brandData).forEach(([otherBrand, otherData]) => {
          if (otherBrand === brand.toLowerCase()) return;
          
          let similarity = 0;
          
          // Category overlap
          const categoryOverlap = [...targetData.categories].filter(cat => otherData.categories.has(cat)).length;
          similarity += categoryOverlap * 0.4;
          
          // Price range similarity
          const avgPrice1 = targetData.priceRange.reduce((a, b) => a + b, 0) / targetData.priceRange.length;
          const avgPrice2 = otherData.priceRange.reduce((a, b) => a + b, 0) / otherData.priceRange.length;
          const priceDiff = Math.abs(avgPrice1 - avgPrice2) / Math.max(avgPrice1, avgPrice2);
          similarity += (1 - priceDiff) * 0.3;
          
          // Feature similarity
          const avgSimilarity = this.calculateAverageFeatureSimilarity(targetData.features, otherData.features);
          similarity += avgSimilarity * 0.3;
          
          relationships.push({
            brand: otherBrand,
            similarity
          });
        });
        
        return relationships
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, limit);
      },
      
      // Calculate average feature similarity
      calculateAverageFeatureSimilarity: (features1, features2) => {
        if (features1.length === 0 || features2.length === 0) return 0;
        
        let totalSimilarity = 0;
        let comparisons = 0;
        
        features1.forEach(f1 => {
          features2.forEach(f2 => {
            const similarity = this.calculateFeatureSimilarity(f1, f2);
            totalSimilarity += similarity;
            comparisons++;
          });
        });
        
        return comparisons > 0 ? totalSimilarity / comparisons : 0;
      }
    };
  }

  // Extract ML features from product
  extractMLFeatures(product) {
    const text = `${product.name} ${product.description} ${(product.tags || []).join(' ')} ${(product.features || []).join(' ')}`;
    const words = this.preprocessText(text);
    
    // Convert words to numerical features
    const features = [];
    for (let i = 0; i < 20; i++) {
      if (i < words.length) {
        features.push(this.simpleHash(words[i]) / 1000000);
      } else {
        features.push(0);
      }
    }
    
    // Add numeric features
    features.push(
      product.price / 10000,
      (product.rating || 0) / 5,
      (product.popularity || 0) / 100,
      (product.numReviews || 0) / 100,
      product.stock / 100
    );
    
    return features;
  }

  // Build optimized vectors with performance improvements
  async buildOptimizedVectors(products) {
    console.log('Building optimized vectors...');
    
    // Limit products for better performance
    const limitedProducts = products.slice(0, Math.min(products.length, 500));
    
    limitedProducts.forEach(product => {
      const vector = this.createOptimizedMLVector(product);
      this.productVectors.set(product._id.toString(), vector);
      
      // Update category vectors
      const category = (product.category || '').toLowerCase();
      if (category && !this.categoryVectors.has(category)) {
        this.categoryVectors.set(category, new Map());
      }
      if (category) {
        this.categoryVectors.get(category).set(product._id.toString(), vector);
      }
      
      // Update brand vectors
      const brand = (product.brand || '').toLowerCase();
      if (brand && !this.brandVectors.has(brand)) {
        this.brandVectors.set(brand, new Map());
      }
      if (brand) {
        this.brandVectors.get(brand).set(product._id.toString(), vector);
      }
    });
    
    console.log(`Optimized vectors built for ${limitedProducts.length} products`);
  }

  // Create optimized ML vector
  createOptimizedMLVector(product) {
    return {
      // Simplified Word2Vec embedding
      word2vec: this.createOptimizedWord2VecVector(product),
      
      // Simplified TF-IDF vector
      tfidf: this.createOptimizedTFIDFVector(product),
      
      // Simplified neural network embedding
      embedding: this.mlModels.semantic.createProductEmbedding(product),
      
      // Metadata with null checks
      metadata: {
        name: product.name || '',
        category: product.category || '',
        brand: product.brand || '',
        price: product.price || 0,
        rating: product.rating || 0,
        popularity: product.popularity || 0,
        tags: (product.tags || []).map(tag => tag.toLowerCase()),
        features: (product.features || []).map(feature => feature.toLowerCase())
      }
    };
  }

  // Create optimized Word2Vec vector
  createOptimizedWord2VecVector(product) {
    const text = `${product.name || ''} ${product.description || ''} ${(product.tags || []).join(' ')} ${(product.features || []).join(' ')}`;
    const words = this.preprocessText(text);
    const vector = new Array(this.word2vecModel.dimensions).fill(0);
    
    // Average word vectors with null checks
    words.forEach(word => {
      if (this.word2vecModel.wordVectors.has(word)) {
        const wordVector = this.word2vecModel.wordVectors.get(word);
        wordVector.forEach((val, index) => {
          vector[index] += val;
        });
      }
    });
    
    // Normalize with zero division check
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return vector.map(val => val / magnitude);
    }
    
    return vector;
  }

  // Create optimized TF-IDF vector
  createOptimizedTFIDFVector(product) {
    const text = `${product.name || ''} ${product.description || ''} ${(product.tags || []).join(' ')} ${(product.features || []).join(' ')}`;
    const words = this.preprocessText(text);
    const vector = {};
    
    // Calculate TF-IDF with null checks
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    const maxTF = Math.max(...Object.values(wordCount), 1); // Ensure no division by zero
    
    this.tfidfVectorizer.vocabulary.forEach(word => {
      const tf = wordCount[word] || 0;
      const idf = this.tfidfVectorizer.idf.get(word) || 0;
      vector[word] = (tf / maxTF) * idf;
    });
    
    return vector;
  }

  // Create ML-powered vector
  createMLVector(product) {
    return {
      // Word2Vec embedding
      word2vec: this.createWord2VecVector(product),
      
      // TF-IDF vector
      tfidf: this.createTFIDFVector(product),
      
      // Neural network embedding
      embedding: this.mlModels.semantic.createEmbedding(product),
      
      // Metadata
      metadata: {
        name: product.name,
        category: product.category,
        brand: product.brand,
        price: product.price,
        rating: product.rating || 0,
        popularity: product.popularity || 0,
        tags: (product.tags || []).map(tag => tag.toLowerCase()),
        features: (product.features || []).map(feature => feature.toLowerCase())
      }
    };
  }

  // Create Word2Vec vector
  createWord2VecVector(product) {
    const text = `${product.name} ${product.description} ${(product.tags || []).join(' ')} ${(product.features || []).join(' ')}`;
    const words = this.preprocessText(text);
    const vector = new Array(this.word2vecModel.dimensions).fill(0);
    
    // Average word vectors
    words.forEach(word => {
      if (this.word2vecModel.wordVectors.has(word)) {
        const wordVector = this.word2vecModel.wordVectors.get(word);
        wordVector.forEach((val, index) => {
          vector[index] += val;
        });
      }
    });
    
    // Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return vector.map(val => val / magnitude);
    }
    
    return vector;
  }

  // Create TF-IDF vector
  createTFIDFVector(product) {
    const text = `${product.name} ${product.description} ${(product.tags || []).join(' ')} ${(product.features || []).join(' ')}`;
    const words = this.preprocessText(text);
    const vector = {};
    
    // Calculate TF-IDF
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    const maxTF = Math.max(...Object.values(wordCount));
    
    this.tfidfVectorizer.vocabulary.forEach(word => {
      const tf = wordCount[word] || 0;
      const idf = this.tfidfVectorizer.idf.get(word);
      vector[word] = (tf / maxTF) * idf;
    });
    
    return vector;
  }

  // Preprocess text
  preprocessText(text) {
    if (!text) return [];
    
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  // Calculate similarity between ML vectors
  calculateMLSimilarity(vector1, vector2) {
    let similarity = 0;
    
    // Word2Vec similarity
    if (vector1.word2vec && vector2.word2vec) {
      const word2vecSim = this.cosineSimilarity(vector1.word2vec, vector2.word2vec);
      similarity += word2vecSim * 0.4;
    }
    
    // TF-IDF similarity
    if (vector1.tfidf && vector2.tfidf) {
      const tfidfSim = this.cosineSimilarity(vector1.tfidf, vector2.tfidf);
      similarity += tfidfSim * 0.3;
    }
    
    // Neural embedding similarity
    if (vector1.embedding && vector2.embedding) {
      const embeddingSim = this.mlModels.semantic.calculateSimilarity(vector1.embedding, vector2.embedding);
      similarity += embeddingSim * 0.3;
    }
    
    return similarity;
  }

  // Cosine similarity
  cosineSimilarity(vector1, vector2) {
    if (!vector1 || !vector2) return 0;
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    const minLength = Math.min(vector1.length, vector2.length);
    for (let i = 0; i < minLength; i++) {
      dotProduct += vector1[i] * vector2[i];
      magnitude1 += vector1[i] * vector1[i];
      magnitude2 += vector2[i] * vector2[i];
    }
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    
    return dotProduct / (magnitude1 * magnitude2);
  }

  // Find similar products using ML
  findSimilarProducts(queryVector, limit = 10) {
    const similarities = [];
    
    this.productVectors.forEach((vector, productId) => {
      const similarity = this.calculateMLSimilarity(queryVector, vector);
      if (similarity > 0.1) { // Threshold for similarity
        similarities.push({
          productId,
          similarity,
          vector
        });
      }
    });
    
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // Create query vector from search query
  createQueryVector(searchQuery) {
    // Create a mock product from search query
    const mockProduct = {
      name: searchQuery,
      description: searchQuery,
      tags: [],
      features: [],
      category: '',
      brand: '',
      price: 0,
      rating: 0,
      popularity: 0
    };
    
    return this.createMLVector(mockProduct);
  }

  // Optimized AI-powered search with caching and indexing
  async search(query, options = {}) {
    try {
      const startTime = Date.now();
      const { limit = 20, category = '', brand = '' } = options;
      
      // Create cache key
      const cacheKey = `${query}_${category}_${brand}_${limit}`;
      
      // Check cache first
      if (this.searchCache.has(cacheKey)) {
        console.log('Cache hit for query:', query);
        return this.searchCache.get(cacheKey);
      }
      
      if (!this.isInitialized) {
        console.log('AI Search Engine not initialized, using optimized fallback...');
        const result = await this.optimizedFallbackSearch(query, options);
        this.searchCache.set(cacheKey, result);
        return result;
      }
      
      // Use indexed search for better performance
      let candidateProducts = [];
      
      // Fast path: use indexes if category or brand is specified
      if (category && this.categoryIndex.has(category)) {
        candidateProducts = this.categoryIndex.get(category).slice(0, limit * 2);
      } else if (brand && this.brandIndex.has(brand)) {
        candidateProducts = this.brandIndex.get(brand).slice(0, limit * 2);
      } else {
        // Use all products but limit for performance
        candidateProducts = Array.from(this.productIndex.keys()).slice(0, 1000);
      }
      
      // Create query vector once
      const queryVector = this.createQueryVector(query);
      
      // Batch similarity calculations for better performance
      const similarities = this.batchSimilarityCalculation(candidateProducts, queryVector);
      
      // Apply filters and sort
      let filteredResults = similarities.filter(item => {
        if (category && item.category !== category) return false;
        if (brand && item.brand !== brand) return false;
        return item.similarity > 0.1; // Threshold for relevance
      });
      
      // Sort by similarity and limit
      filteredResults = filteredResults
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
      
      // Batch fetch product documents
      const productIds = filteredResults.map(item => item.productId);
      const products = await this.batchFetchProducts(productIds);
      
      // Apply optimized scoring
      const scoredProducts = this.batchScoring(products, filteredResults, query);
      
      const searchTime = Date.now() - startTime;
      console.log(`AI search completed in ${searchTime}ms for ${scoredProducts.length} results`);
      
      // Cache the result
      this.searchCache.set(cacheKey, scoredProducts);
      
      return scoredProducts;
    } catch (error) {
      console.error('Error in optimized AI search, using fallback:', error);
      const result = await this.optimizedFallbackSearch(query, options);
      this.searchCache.set(`${query}_${category}_${brand}_${limit}`, result);
      return result;
    }
  }
  
  // Batch similarity calculation for better performance
  batchSimilarityCalculation(productIds, queryVector) {
    const similarities = [];
    
    productIds.forEach(productId => {
      const vector = this.productVectors.get(productId);
      if (vector) {
        const similarity = this.calculateMLSimilarity(queryVector, vector);
        if (similarity > 0.1) {
          const product = this.productIndex.get(productId);
          similarities.push({
            productId,
            similarity,
            category: product.category,
            brand: product.brand,
            vector
          });
        }
      }
    });
    
    return similarities;
  }
  
  // Batch fetch products with optimized query
  async batchFetchProducts(productIds) {
    if (productIds.length === 0) return [];
    
    const Product = require('../models/Product');
    const products = await Product.find({ _id: { $in: productIds } })
      .select('_id name description category brand price rating popularity tags features reviews')
      .populate('reviews.user', 'name')
      .lean()
      .maxTimeMS(2000);
    
    return products;
  }
  
  // Batch scoring for better performance with aggressive iPhone prioritization
  batchScoring(products, similarities, query) {
    const similarityMap = new Map();
    similarities.forEach(item => {
      similarityMap.set(item.productId, item);
    });
    
    const queryLower = query.toLowerCase();
    const isIPhoneSearch = queryLower.includes('iphone') || queryLower.includes('phone') || queryLower.includes('apple');
    const isTVSearch = queryLower.includes('tv') || queryLower.includes('television');
    
    return products.map(product => {
      const productId = product._id.toString();
      const similarityData = similarityMap.get(productId);
      
      let score = 1.0;
      
      // ML similarity score (primary factor)
      if (similarityData) {
        score += similarityData.similarity * 2.0;
      }
      
      // AGGRESSIVE exact name matching with massive boost
      if (product.name.toLowerCase().includes(queryLower)) {
        score += 4.0; // Huge boost for exact name matches
      }
      
      // AGGRESSIVE iPhone-specific prioritization
      if (isIPhoneSearch) {
        const productCategory = (product.category || '').toLowerCase();
        const productBrand = (product.brand || '').toLowerCase();
        const productName = (product.name || '').toLowerCase();
        
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
          score -= 10.0;
        }
      }
      
      // TV search prioritization
      if (isTVSearch) {
        const productCategory = (product.category || '').toLowerCase();
        const productName = (product.name || '').toLowerCase();
        
        if (productCategory.includes('tv') || productCategory.includes('television')) {
          score += 3.0;
        }
        
        // Penalty for phone products when searching TV
        if (productCategory.includes('phone') || productCategory.includes('smartphone')) {
          score -= 5.0;
        }
      }
      
      // Generic category bonus
      const categoryBonus = this.mlModels.category.classify ? 
        this.mlModels.category.classify(this.extractMLFeatures(product)).confidence : 0;
      score += categoryBonus * 0.3;
      
      // Quality indicators (minimal weight to prioritize relevance)
      score += (product.rating || 0) * 0.02;
      score += Math.min((product.popularity || 0) / 200, 0.1);
      
      return { 
        ...product, 
        aiScore: Math.min(score, 15.0), // Allow higher scores for better matches
        mlSimilarity: similarityData?.similarity || 0 
      };
    }).sort((a, b) => b.aiScore - a.aiScore);
  }
  
  // Optimized fallback search with aggressive iPhone prioritization
  async optimizedFallbackSearch(query, options = {}) {
    try {
      const startTime = Date.now();
      const { limit = 20, category = '', brand = '' } = options;
      
      const Product = require('../models/Product');
      let searchQuery = {};
      const queryLower = query.toLowerCase();
      const isIPhoneSearch = queryLower.includes('iphone') || queryLower.includes('phone') || queryLower.includes('apple');
      const isTVSearch = queryLower.includes('tv') || queryLower.includes('television');
      
      // Use indexed search when possible
      if (category && this.categoryIndex.has(category)) {
        const productIds = this.categoryIndex.get(category).slice(0, limit * 2);
        searchQuery._id = { $in: productIds };
      } else if (brand && this.brandIndex.has(brand)) {
        const productIds = this.brandIndex.get(brand).slice(0, limit * 2);
        searchQuery._id = { $in: productIds };
      } else if (query) {
        // Use optimized text search
        searchQuery.$or = [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [query.toLowerCase()] } },
          { features: { $in: [query.toLowerCase()] } },
          { brand: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ];
      }
      
      const products = await Product.find(searchQuery)
        .select('_id name description category brand price rating popularity tags features reviews')
        .limit(limit * 3) // Get more to filter better
        .populate('reviews.user', 'name')
        .lean()
        .maxTimeMS(1500);
      
      // AGGRESSIVE scoring with proper category prioritization
      const scoredProducts = products.map(product => {
        let score = 1.0;
        const productCategory = (product.category || '').toLowerCase();
        const productBrand = (product.brand || '').toLowerCase();
        const productName = (product.name || '').toLowerCase();
        
        // MASSIVE exact name match bonus
        if (query && productName.includes(queryLower)) {
          score += 6.0;
        }
        
        // AGGRESSIVE iPhone-specific prioritization
        if (isIPhoneSearch) {
          // MASSIVE boost for iPhone/Apple products
          if (productName.includes('iphone') || productName.includes('apple')) {
            score += 10.0; // Huge boost
          }
          
          if (productBrand === 'apple') {
            score += 6.0; // Big boost for Apple brand
          }
          
          if (productCategory.includes('phone') || productCategory.includes('smartphone') || productCategory.includes('mobile')) {
            score += 4.0; // Boost for phone category
          }
          
          // HEAVY penalty for TV products when searching iPhone
          if (productCategory.includes('tv') || productCategory.includes('television') || 
              productName.includes('tv') || productName.includes('television')) {
            score -= 20.0; // Massive penalty for TVs
          }
          
          // Penalty for LG/Samsung TV products
          if ((productBrand === 'lg' || productBrand === 'samsung') && 
              (productCategory.includes('tv') || productCategory.includes('electronics'))) {
            score -= 15.0;
          }
        }
        
        // TV search prioritization
        if (isTVSearch) {
          if (productCategory.includes('tv') || productCategory.includes('television')) {
            score += 4.0;
          }
          
          // Penalty for phone products when searching TV
          if (productCategory.includes('phone') || productCategory.includes('smartphone')) {
            score -= 8.0;
          }
        }
        
        // Generic category match
        if (category && product.category === category) score += 1.0;
        
        // Brand match
        if (brand && product.brand === brand) score += 0.8;
        
        // Quality indicators (minimal weight)
        score += (product.rating || 0) * 0.02;
        score += Math.min((product.popularity || 0) / 200, 0.1);
        
        return { ...product, aiScore: Math.min(score, 15.0) };
      });
      
      const searchTime = Date.now() - startTime;
      console.log(`Aggressive fallback search completed in ${searchTime}ms`);
      
      return scoredProducts.sort((a, b) => b.aiScore - a.aiScore);
    } catch (error) {
      console.error('Error in aggressive fallback search:', error);
      return [];
    }
  }

  // Fallback search method
  async fallbackSearch(query, options = {}) {
    try {
      const { limit = 20, category = '', brand = '' } = options;
      
      // Build simple search query
      let searchQuery = {};
      if (query) {
        searchQuery.$or = [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [query.toLowerCase()] } },
          { features: { $in: [query.toLowerCase()] } },
          { brand: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ];
      }
      
      if (category) searchQuery.category = category;
      if (brand) searchQuery.brand = brand;
      
      const products = await Product.find(searchQuery)
        .limit(limit)
        .populate('reviews.user', 'name');
      
      // Apply simple scoring
      const scoredProducts = products.map(product => {
        let score = 1.0;
        
        // Exact name match
        if (product.name.toLowerCase().includes(query.toLowerCase())) {
          score += 2.0;
        }
        
        // Category match
        if (category && product.category === category) score += 0.5;
        
        // Brand match
        if (brand && product.brand === brand) score += 0.3;
        
        // Quality indicators
        score += (product.rating / 5) * 0.2;
        score += (product.popularity / 100) * 0.1;
        
        return { ...product.toObject(), aiScore: Math.min(score, 3.0) };
      });
      
      return scoredProducts
        .sort((a, b) => b.aiScore - a.aiScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error in fallback search:', error);
      return [];
    }
  }
}

// Global AI search engine instance
const aiSearchEngine = new AISearchEngine();

module.exports = {
  aiSearchEngine,
  // Export for use in other modules
  getRelatedProducts: async (searchQuery, category = '', brand = '', limit = 8) => {
    return await aiSearchEngine.search(searchQuery, { category, brand, limit });
  }
};
