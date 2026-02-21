const express = require('express');
const router = express.Router();

// Initialize Stripe only if key is configured
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? require('stripe')(stripeSecretKey) : null;

// Temporary in-memory store for mock sessions
const mockSessionStore = new Map();

// Cleanup old sessions periodically (every hour)
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, data] of mockSessionStore.entries()) {
    // Remove sessions older than 1 hour
    if (data.timestamp && (now - data.timestamp) > 3600000) {
      mockSessionStore.delete(sessionId);
    }
  }
}, 3600000); // Run every hour

// Helper function to get mock session data
const getMockSessionData = (sessionId) => {
  const storedData = mockSessionStore.get(sessionId);
  
  if (storedData) {
    return {
      id: sessionId,
      payment_status: 'paid',
      payment_intent: 'pi_mock_' + sessionId.slice(-8),
      amount_total: storedData.amount_total || 0,
      customer_details: storedData.customer_details || {
        name: 'Customer',
        email: 'customer@example.com',
        phone: '+1234567890'
      },
      shipping: storedData.shipping || {
        address: {
          line1: 'Address',
          city: 'City',
          state: 'State',
          postal_code: '12345'
        }
      },
      metadata: {
        items: JSON.stringify(storedData.items || []),
        shippingAddress: JSON.stringify(storedData.shippingAddress || {}),
        total: (storedData.amount_total || 0).toString(),
        itemCount: (storedData.items || []).length.toString()
      }
    };
  }
  
  // Fallback if no stored data
  return {
    id: sessionId,
    payment_status: 'paid',
    payment_intent: 'pi_mock_' + sessionId.slice(-8),
    amount_total: 0,
    customer_details: {
      name: 'Customer',
      email: 'customer@example.com',
      phone: '+1234567890'
    },
    shipping: {
      address: {
        line1: 'Address',
        city: 'City',
        state: 'State',
        postal_code: '12345'
      }
    },
    metadata: {
      items: JSON.stringify([]),
      shippingAddress: JSON.stringify({}),
      total: '0',
      itemCount: '0'
    }
  };
};

// Create Stripe checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    console.log('🔵 Stripe checkout request received');
    
    const { orderItems, shippingAddress, total, success_url, cancel_url } = req.body;

    if (!orderItems || orderItems.length === 0) {
      console.log('❌ No order items provided');
      return res.status(400).json({ message: 'No order items provided' });
    }

    if (!total || total <= 0) {
      console.log('❌ Invalid total amount:', total);
      return res.status(400).json({ message: 'Invalid total amount' });
    }

    if (!shippingAddress) {
      console.log('❌ Shipping address not provided');
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // If Stripe is not configured, use mock mode
    if (!stripe || !stripeSecretKey) {
      console.log('⚠️  Stripe API key not configured, using mock session');
      const mockSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store the session data for later retrieval
      mockSessionStore.set(mockSessionId, {
        timestamp: Date.now(), // Add timestamp for cleanup
        amount_total: Math.round(total * 100), // Store in cents
        customer_details: {
          name: shippingAddress.name || 'Customer',
          email: shippingAddress.email || 'customer@example.com',
          phone: shippingAddress.phone || '+1234567890'
        },
        shipping: {
          address: {
            line1: shippingAddress.address || '',
            city: shippingAddress.city || '',
            state: shippingAddress.state || '',
            postal_code: shippingAddress.postalCode || ''
          }
        },
        items: orderItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || '',
          productId: item.productId || item.product || 'unknown',
          seller: item.seller || 'unknown',
          sellerName: item.sellerName || 'Unknown'
        })),
        shippingAddress: shippingAddress
      });
      
      return res.json({
        sessionId: mockSessionId,
        url: `https://checkout.stripe.com/pay/${mockSessionId}`
      });
    }

    try {
      // Create line items from order items
      const lineItems = orderItems.map(item => {
        if (!item.name || !item.price || !item.quantity) {
          throw new Error(`Invalid item: ${JSON.stringify(item)}`);
        }
        
        return {
          price_data: {
            currency: 'inr',
            product_data: {
              name: item.name,
              description: `Seller: ${item.sellerName || 'Unknown'}`,
              images: item.image ? [item.image] : undefined,
              metadata: {
                productId: item.productId || 'unknown',
                sellerId: item.seller || 'unknown'
              }
            },
            unit_amount: Math.round(item.price * 100) // Convert to paisa
          },
          quantity: item.quantity
        };
      });

      // Validate line items
      if (!lineItems || lineItems.length === 0) {
        return res.status(400).json({ message: 'No valid items in order' });
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: success_url || `${process.env.REACT_APP_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancel_url || `${process.env.REACT_APP_URL || 'http://localhost:3000'}/checkout`,
        metadata: {
          shippingAddress: JSON.stringify(shippingAddress),
          total: total.toString(),
          itemCount: orderItems.length.toString(),
          items: JSON.stringify(orderItems.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || '',
            productId: item.productId || item.product || 'unknown',
            seller: item.seller || 'unknown',
            sellerName: item.sellerName || 'Unknown'
          })))
        }
      });

      console.log('✅ Stripe session created:', session.id);
      
      res.json({
        sessionId: session.id,
        url: session.url
      });
    } catch (stripeError) {
      console.error('❌ Stripe API error:', stripeError.message);
      // If it's an auth error, likely invalid key
      if (stripeError.type === 'StripeAuthenticationError') {
        return res.status(401).json({ 
          message: 'Stripe API key is invalid. Please contact support.' 
        });
      }
      throw stripeError;
    }
  } catch (error) {
    console.error('❌ Stripe checkout session error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Get Stripe public key
router.get('/public-key', (req, res) => {
  try {
    const publicKey = process.env.STRIPE_PUBLISHABLE_KEY;
    
    if (!publicKey) {
      console.warn('⚠️  Stripe is not configured - running in mock mode');
      return res.json({ 
        publicKey: null,
        mode: 'mock',
        message: 'Stripe not configured - running in mock mode'
      });
    }

    console.log('✅ Stripe public key retrieved');
    res.json({ 
      publicKey,
      mode: 'production'
    });
  } catch (error) {
    console.error('❌ Error fetching public key:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get Stripe session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!process.env.STRIPE_SECRET_KEY) {
      // Mock response if Stripe not configured - return dynamic data
      // Try to get stored mock data from a temporary store or use session-based data
      const mockData = getMockSessionData(sessionId);
      return res.json(mockData);
    }

    // Retrieve actual session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details', 'shipping']
    });
    
    // Calculate total from line items if not available
    let amount_total = session.amount_total || 0;
    if (!amount_total && session.line_items?.data) {
      amount_total = session.line_items.data.reduce((sum, item) => sum + (item.amount_total || 0), 0);
    }
    
    // Extract items from line items
    const items = session.line_items?.data?.map(item => ({
      name: item.description || item.price?.product_data?.name || 'Unknown Product',
      price: (item.amount_total || 0) / 100, // Convert from cents/paisa
      quantity: item.quantity || 1,
      image: item.price?.product_data?.images?.[0] || '',
      productId: item.price?.product_data?.metadata?.productId || 'unknown',
      seller: item.price?.product_data?.metadata?.sellerId || 'unknown',
      sellerName: item.price?.product_data?.description?.split('Seller: ')[1] || 'Unknown'
    })) || [];
    
    res.json({
      id: session.id,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent,
      amount_total: amount_total,
      customer_details: session.customer_details,
      shipping: session.shipping,
      metadata: {
        ...session.metadata,
        items: JSON.stringify(items)
      }
    });
  } catch (error) {
    console.error('Stripe session error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'inr', metadata = {} } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      // Mock response if Stripe not configured - use dynamic data
      const mockPaymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const mockSecret = `${mockPaymentIntentId}_secret_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store mock payment intent data if needed
      mockSessionStore.set(mockPaymentIntentId, {
        timestamp: Date.now(),
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        metadata: metadata,
        status: 'requires_payment_method'
      });
      
      return res.json({
        client_secret: mockSecret,
        payment_intent_id: mockPaymentIntentId
      });
    }

    // Create actual payment intent using Stripe SDK
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      payment_method_types: ['card'],
      metadata: metadata
    });
    
    res.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Confirm payment
router.post('/confirm-payment', async (req, res) => {
  try {
    const { payment_intent_id, payment_method_id } = req.body;

    if (!payment_intent_id) {
      return res.status(400).json({ message: 'Payment intent ID is required' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      // Mock response if Stripe not configured - update stored data
      const storedData = mockSessionStore.get(payment_intent_id);
      
      if (storedData) {
        // Update the stored payment intent status
        mockSessionStore.set(payment_intent_id, {
          ...storedData,
          status: 'succeeded',
          payment_method: payment_method_id
        });
        
        return res.json({
          id: payment_intent_id,
          status: 'succeeded',
          payment_method: payment_method_id,
          amount: storedData.amount
        });
      }
      
      // Fallback if no stored data
      return res.json({
        id: payment_intent_id,
        status: 'succeeded',
        payment_method: payment_method_id,
        amount: 0
      });
    }

    // Confirm payment with Stripe SDK
    const paymentIntent = await stripe.paymentIntents.confirm(payment_intent_id, {
      payment_method: payment_method_id
    });

    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      payment_method: paymentIntent.payment_method,
      amount: paymentIntent.amount
    });
  } catch (error) {
    console.error('Payment confirmation error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
