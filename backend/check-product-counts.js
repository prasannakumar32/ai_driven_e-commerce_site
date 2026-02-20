const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-ecommerce')
  .then(async () => {
    const Product = require('./models/Product');
    
    // Get counts by category
    const counts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('Current product counts by category:');
    counts.forEach(cat => {
      console.log(`${cat._id}: ${cat.count}`);
    });
    
    const total = await Product.countDocuments();
    console.log(`\nTotal products: ${total}`);
    
    // Check minimum requirements
    const requirements = {
      'clothing': 100,
      'electronics': 100,
      'sports': 50,
      'home': 50,
      'beauty': 50,
      'books': 50,
      'toys': 50
    };
    
    console.log('\nMinimum requirements analysis:');
    let needsMore = false;
    
    counts.forEach(cat => {
      const required = requirements[cat._id] || 50;
      const current = cat.count;
      const needed = Math.max(0, required - current);
      
      if (needed > 0) {
        console.log(`${cat._id}: ${current}/${required} (need ${needed} more)`);
        needsMore = true;
      } else {
        console.log(`${cat._id}: ${current}/${required} ✓`);
      }
    });
    
    // Check for missing categories
    Object.keys(requirements).forEach(category => {
      const found = counts.find(c => c._id === category);
      if (!found) {
        console.log(`${category}: 0/${requirements[category]} (need ${requirements[category]} more)`);
        needsMore = true;
      }
    });
    
    if (!needsMore) {
      console.log('\n🎉 All minimum requirements met!');
    } else {
      console.log('\n⚠️  Need to add more products to meet minimum requirements.');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
