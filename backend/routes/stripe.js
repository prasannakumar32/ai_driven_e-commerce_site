const express = require('express');
const router = express.Router();

// Initialize Stripe only if key is configured
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? require('stripe')(stripeSecretKey) : null;

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
          itemCount: orderItems.length.toString()
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
      // Mock response if Stripe not configured
      return res.json({
        id: sessionId,
        payment_status: 'paid',
        payment_intent: 'pi_mock_' + sessionId.slice(-8),
        metadata: { itemCount: '1' }
      });
    }

    // Retrieve actual session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({
      id: session.id,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent,
      customer_email: session.customer_email,
      metadata: session.metadata
    });
  } catch (error) {
    console.error('Stripe session error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'inr' } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      // Mock response if Stripe not configured
      return res.json({
        client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`
      });
    }

    // Create actual payment intent using Stripe SDK
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      payment_method_types: ['card']
    });
    
    res.json({
      client_secret: paymentIntent.client_secret
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
      // Mock response if Stripe not configured
      return res.json({
        id: payment_intent_id,
        status: 'succeeded',
        payment_method: payment_method_id
      });
    }

    // Confirm payment with Stripe SDK
    const paymentIntent = await stripe.paymentIntents.confirm(payment_intent_id, {
      payment_method: payment_method_id
    });

    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      payment_method: paymentIntent.payment_method
    });
  } catch (error) {
    console.error('Payment confirmation error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
