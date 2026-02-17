// Script to generate vector embeddings for all products
const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const { generateEmbedding } = require('./utils/vectorSearch');

async function generateVectorEmbeddings() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Get all products that don't have vector embeddings
    const products = await Product.find({
      $or: [
        { vectorEmbedding: { $exists: false } },
        { vectorEmbedding: { $size: 0 } },
        { vectorEmbedding: null }
      ]
    });

    console.log(`Found ${products.length} products without vector embeddings`);

    // Generate embeddings for each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      try {
        // Create text for embedding
        const text = `${product.name} ${product.description} ${product.brand} ${product.category} ${(product.tags || []).join(' ')} ${(product.features || []).join(' ')}`;
        
        // Generate embedding
        const embedding = generateEmbedding(text);
        
        // Update product with embedding using save method
        product.vectorEmbedding = embedding;
        await product.save();
        
        console.log(`Generated embedding for product ${i + 1}/${products.length}: ${product.name}`);
      } catch (error) {
        console.error(`Error generating embedding for ${product.name}:`, error.message);
      }
    }

    // Verify embeddings were created
    const updatedProducts = await Product.find({ vectorEmbedding: { $exists: true, $ne: null } });
    console.log(`Total products with embeddings: ${updatedProducts.length}`);

    await mongoose.disconnect();
    console.log('Vector embedding generation completed');
  } catch (error) {
    console.error('Error:', error);
  }
}

generateVectorEmbeddings();
