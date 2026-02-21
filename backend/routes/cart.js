const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Cart storage (in production, use Redis or database)
const carts = new Map();

// Get user's cart
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id || req.session?.id || 'guest';
    const cart = carts.get(userId) || { items: [], total: 0 };
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user?.id || req.session?.id || 'guest';

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart = carts.get(userId) || { items: [], total: 0 };

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity,
        stock: product.stock
      });
    }

    // Calculate total
    cart.total = cart.items.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );

    carts.set(userId, cart);

    res.json({ message: 'Item added to cart', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update cart item quantity
router.put('/update', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user?.id || req.session?.id || 'guest';

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    let cart = carts.get(userId) || { items: [], total: 0 };

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Check stock
    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    cart.items[itemIndex].quantity = quantity;

    // Recalculate total
    cart.total = cart.items.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );

    carts.set(userId, cart);

    res.json({ message: 'Cart updated', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id || req.session?.id || 'guest';

    let cart = carts.get(userId) || { items: [], total: 0 };

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    // Recalculate total
    cart.total = cart.items.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );

    carts.set(userId, cart);

    res.json({ message: 'Item removed from cart', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear cart
router.delete('/clear', async (req, res) => {
  try {
    const userId = req.user?.id || req.session?.id || 'guest';
    carts.delete(userId);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get cart summary
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user?.id || req.session?.id || 'guest';
    const cart = carts.get(userId) || { items: [], total: 0 };

    const summary = {
      itemCount: cart.items.reduce((count, item) => count + item.quantity, 0),
      subtotal: cart.total,
      tax: cart.total * 0.08, // 8% tax
      shipping: cart.total > 100 ? 0 : 10, // Free shipping over $100
      total: cart.total + (cart.total * 0.08) + (cart.total > 100 ? 0 : 10)
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Apply AI recommendations to cart
router.post('/recommendations', async (req, res) => {
  try {
    const userId = req.user?.id || req.session?.id || 'guest';
    const cart = carts.get(userId) || { items: [], total: 0 };

    if (cart.items.length === 0) {
      return res.json({ recommendations: [] });
    }

    // Get product IDs from cart
    const cartProductIds = cart.items.map(item => item.product);
    
    // Find similar products
    const { getSimilarProducts } = require('../utils/aiRecommendations');
    const recommendations = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const similar = await getSimilarProducts(product, userId);
        recommendations.push(...similar);
      }
    }

    // Remove products already in cart and deduplicate
    const uniqueRecommendations = recommendations
      .filter(rec => !cartProductIds.includes(rec._id.toString()))
      .filter((rec, index, self) => 
        index === self.findIndex(r => r._id.toString() === rec._id.toString())
      )
      .slice(0, 5);

    res.json({ recommendations: uniqueRecommendations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
