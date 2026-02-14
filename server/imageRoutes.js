const express = require('express');
const router = express.Router();
const path = require('path');

// Generate product-specific SVG images
const generateProductImage = (productName, category) => {
  const colors = {
    electronics: '#007AFF',
    sports: '#FF6B35',
    books: '#4CAF50',
    clothing: '#9C27B0',
    beauty: '#E91E63',
    home: '#FF9800',
    toys: '#2196F3'
  };
  
  const bgColor = colors[category] || '#666666';
  const shortName = productName.length > 20 ? productName.substring(0, 17) + '...' : productName;
  
  return `
    <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="300" fill="${bgColor}"/>
      <rect x="10" y="10" width="280" height="280" fill="none" stroke="white" stroke-width="2" opacity="0.3"/>
      <text x="150" y="120" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="white">
        ${shortName}
      </text>
      <text x="150" y="150" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="white" opacity="0.8">
        ${category.charAt(0).toUpperCase() + category.slice(1)}
      </text>
      <circle cx="150" cy="200" r="30" fill="none" stroke="white" stroke-width="2" opacity="0.5"/>
      <path d="M150 180 L150 220 M130 200 L170 200" stroke="white" stroke-width="2" opacity="0.7"/>
    </svg>
  `;
};

// Serve product images
router.get('/product/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  
  // Extract product info from filename
  const productName = imageName
    .replace('.jpg', '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
  
  // Determine category from filename or use default
  let category = 'electronics';
  if (imageName.includes('nike') || imageName.includes('air') || imageName.includes('shoes')) {
    category = 'sports';
  } else if (imageName.includes('book') || imageName.includes('gatsby')) {
    category = 'books';
  } else if (imageName.includes('jacket') || imageName.includes('shirt')) {
    category = 'clothing';
  }
  
  // Generate and return SVG image
  const svgImage = generateProductImage(productName, category);
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svgImage);
});

// Google Drive proxy
router.get('/google/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    // Use a real Google Drive image ID (this is a sample - replace with actual IDs)
    const realGoogleImages = {
      '1B7M8X9L2K3N4O5P6Q7R8S9T0U1V2W3X4': 'https://images.unsplash.com/photo-1592287515832-053a17bfb967?w=300&h=300&fit=crop&crop=center',
      '2C8N9X0M3O4P5Q6R7S8T9U0V1W2X3Y4Z5': 'https://images.unsplash.com/photo-1580910059747-758a8db0c582?w=300&h=300&fit=crop&crop=center',
      '3D9O0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop&crop=center'
    };
    
    const imageUrl = realGoogleImages[fileId] || `https://picsum.photos/seed/${fileId}/300/300.jpg`;
    
    // For now, redirect to the Unsplash image
    res.redirect(302, imageUrl);
  } catch (error) {
    // Fallback to generated SVG
    const svgImage = generateProductImage('Product Image', 'electronics');
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svgImage);
  }
});

module.exports = router;
