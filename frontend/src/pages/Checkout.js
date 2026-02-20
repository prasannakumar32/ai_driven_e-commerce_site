import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Chip,
  Alert,
  ListItem
} from '@mui/material';
import {
  Payment,
  LocalShipping,
  CheckCircle,
  Security,
  ArrowBack,
  LocationOn
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import api, { orderAPI, stripeAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import ShippingForm from '../components/ShippingForm';
import SellerDetailsCard from '../components/SellerDetailsCard';
import { calculateDeliveryWindow } from '../utils/deliveryCalculator';

// Load Stripe script
const loadStripeScript = () => {
  return new Promise((resolve) => {
    if (window.Stripe) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    
    script.onload = () => {
      resolve();
    };
    
    script.onerror = () => {
      console.error('Failed to load Stripe script');
      resolve();
    };
    
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: Address, 1: Payment
  const [shippingAddress, setShippingAddress] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [productsWithSellers, setProductsWithSellers] = useState([]);
  const [deliveryEstimates, setDeliveryEstimates] = useState({});

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    else fetchSavedAddresses();
  }, [isAuthenticated, navigate]);

  const fetchProductsWithSellers = async () => {
    try {
      const productsWithSellerData = await Promise.all(
        items.map(async (cartItem) => {
          try {
            const response = await api.get(`/products/${cartItem.product._id}`);
            return response.data;
          } catch (error) {
            console.error('Error fetching product:', error);
            return cartItem.product;
          }
        })
      );
      setProductsWithSellers(productsWithSellerData);
    } catch (error) {
      console.error('Error fetching products with sellers:', error);
    }
  };

  useEffect(() => {
    // Fetch full product details with seller info when items change
    if (items.length > 0) {
      fetchProductsWithSellers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const calculateDeliveryEstimates = (address) => {
    const estimates = {};
    items.forEach((item, index) => {
      const product = productsWithSellers[index];
      if (product?.seller?.sellerLocation?.city && address?.city) {
        const deliveryWindow = calculateDeliveryWindow(
          product.seller.sellerLocation.city,
          address.city
        );
        estimates[product._id] = deliveryWindow;
      }
    });
    setDeliveryEstimates(estimates);
  };

  const fetchSavedAddresses = async () => {
    try {
      const response = await api.get('/auth/addresses');
      setSavedAddresses(response.data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddressesUpdate = (updatedAddresses) => {
    setSavedAddresses(updatedAddresses);
  };

  const handleAddressSubmit = (addressData) => {
    setShippingAddress(addressData);
    calculateDeliveryEstimates(addressData);
    setCurrentStep(1); // Move to payment step
  };

  const handleBackToAddress = () => {
    setCurrentStep(0);
  };

  const handleCashOnDelivery = async () => {
    if (items.length === 0 || !shippingAddress) return;
    setLoading(true);

    try {
      // Prepare order items with seller information
      const orderItems = items.map((i, index) => {
        const product = productsWithSellers[index];
        const deliveryEst = deliveryEstimates[i.product._id];
        
        return {
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          product: i.product._id,
          image: i.product.image,
          seller: product?.seller?._id,
          sellerName: product?.seller?.name,
          sellerBusinessName: product?.seller?.businessName,
          sellerEmail: product?.seller?.email,
          sellerPhone: product?.seller?.phone,
          sellerLocation: product?.seller?.sellerLocation,
          deliveryDaysEstimate: deliveryEst ? {
            min: deliveryEst.minDays,
            max: deliveryEst.maxDays
          } : null
        };
      });

      // Add email to shippingAddress
      const shippingAddressWithEmail = {
        ...shippingAddress,
        email: shippingAddress.email || user?.email || 'N/A'
      };

      const orderPayload = {
        orderItems: orderItems,
        total: total,
        paymentMethod: 'COD',
        shippingAddress: shippingAddressWithEmail
      };

      console.log('🛒 Placing COD order with seller details:', orderPayload);
      const response = await orderAPI.createOrder(orderPayload);
      console.log('✅ COD order response:', response.data);

      await clearCart();

      navigate('/order-confirmation', {
        state: {
          orderData: response.data,
          paymentMethod: 'COD'
        }
      });

      setLoading(false);
    } catch (err) {
      console.error('COD checkout failed', err);
      const errorMessage = err.response?.data?.message || err.message;
      alert(`Order placement failed: ${errorMessage}. Please try again.`);
      setLoading(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (items.length === 0 || !shippingAddress) return;
    setLoading(true);

    try {
      // Step 1: Load Stripe script
      await loadStripeScript();

      // Step 2: Get Stripe public key from backend
      let stripePublicKey = null;
      let stripeMode = 'production';
      
      try {
        const keyResponse = await stripeAPI.getPublicKey();
        stripePublicKey = keyResponse.data?.publicKey;
        stripeMode = keyResponse.data?.mode || 'production';
        
        if (!stripePublicKey && stripeMode !== 'mock') {
          console.warn('⚠️  Stripe public key not configured');
        } else if (!stripePublicKey && stripeMode === 'mock') {
          console.log('ℹ️  Running in Stripe mock mode');
        } else {
          console.log('✅ Stripe public key loaded');
        }
      } catch (keyError) {
        console.warn('⚠️  Could not fetch Stripe public key:', keyError.message);
        stripeMode = 'mock';
      }

      // Step 3: Initialize Stripe if public key available
      let stripe = null;
      if (stripePublicKey && window.Stripe) {
        stripe = window.Stripe(stripePublicKey);
      }

      if (!stripe && stripeMode !== 'mock') {
        throw new Error('Stripe failed to initialize. Please use Cash on Delivery or try again later.');
      }

      // Prepare order items with seller information
      const orderItems = items.map((i, index) => {
        const product = productsWithSellers[index];
        const deliveryEst = deliveryEstimates[i.product._id];
        
        return {
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          productId: i.product._id,
          image: i.product.image,
          seller: product?.seller?._id,
          sellerName: product?.seller?.name,
          sellerBusinessName: product?.seller?.businessName,
          sellerEmail: product?.seller?.email,
          sellerPhone: product?.seller?.phone,
          sellerLocation: product?.seller?.sellerLocation,
          deliveryDaysEstimate: deliveryEst ? {
            min: deliveryEst.minDays,
            max: deliveryEst.maxDays
          } : null
        };
      });

      const checkoutPayload = {
        orderItems: orderItems,
        shippingAddress: shippingAddress,
        total: total,
        success_url: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/checkout`
      };

      console.log('📡 Creating Stripe checkout session...');
      const response = await stripeAPI.createCheckoutSession(checkoutPayload);

      if (response.data && response.data.url) {
        console.log('✅ Redirecting to Stripe checkout...');
        window.location.href = response.data.url;
      } else if (response.data && response.data.sessionId) {
        // Mock mode response
        console.log('ℹ️  Mock Stripe session created:', response.data.sessionId);
        window.location.href = response.data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
      setLoading(false);
    } catch (err) {
      console.error('❌ Stripe checkout failed', err);
      const errorMessage = err.response?.data?.message || err.message;
      alert(`Payment setup failed: ${errorMessage}. Please try Cash on Delivery instead.`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Security sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h3" component="h1" fontWeight="bold" color="primary.main">
            Secure Checkout
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary">
          Complete your purchase safely and securely
        </Typography>
      </Box>

      {/* Progress Steps */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Stepper activeStep={currentStep} alternativeLabel>
          <Step completed={currentStep > 0}>
            <StepLabel>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalShipping sx={{ mr: 1 }} />
                Shipping
              </Box>
            </StepLabel>
          </Step>
          <Step completed={false}>
            <StepLabel>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Payment sx={{ mr: 1 }} />
                Payment
              </Box>
            </StepLabel>
          </Step>
          <Step completed={false}>
            <StepLabel>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ mr: 1 }} />
                Confirmation
              </Box>
            </StepLabel>
          </Step>
        </Stepper>
      </Paper>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Step 0: Shipping Address */}
          {currentStep === 0 && (
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 2 }} />
                Shipping Address
              </Typography>
              
              <ShippingForm
                onSubmit={handleAddressSubmit}
                onAddressesUpdate={handleAddressesUpdate}
                initialData={shippingAddress}
                savedAddresses={savedAddresses}
                isLoading={loading}
              />
            </Paper>
          )}

          {/* Step 1: Payment - Show selected address and order summary */}
          {currentStep === 1 && (
            <React.Fragment>
              {/* Selected Address Summary */}
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', bgcolor: '#f0f7ff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ mb: 1 }}>
                      ✓ Delivery Address Confirmed
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {shippingAddress.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {shippingAddress.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📞 {shippingAddress.phone}
                    </Typography>
                  </Box>
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleBackToAddress}
                  >
                    Change
                  </Button>
                </Box>
              </Paper>

              {/* Order Summary with Sellers */}
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    Order Summary
                  </Typography>
                  <Chip 
                    label={`${items.length} items`} 
                    size="small" 
                    sx={{ ml: 2, bgcolor: 'primary.light', color: 'white' }}
                  />
                </Box>

                {/* Items by Seller */}
                {items.map((item, index) => {
                  const product = productsWithSellers[index];
                  const deliveryEst = deliveryEstimates[item.product._id];
                  
                  return (
                    <Box key={item.product._id} sx={{ mb: 3 }}>
                      {/* Seller Info */}
                      {product?.seller && (
                        <SellerDetailsCard 
                          seller={product.seller}
                          deliveryInfo={deliveryEst}
                          showCompact={true}
                        />
                      )}
                      
                      {/* Item Details */}
                      <ListItem 
                        sx={{ 
                          px: 2,
                          py: 2,
                          bgcolor: 'grey.50',
                          borderRadius: 1,
                          mb: 2
                        }}
                      >
                        <Box sx={{ width: '100%' }}>
                          <Typography variant="h6" fontWeight="600" color="text.primary">
                            {item.product.name}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: {item.quantity} × ₹{item.product.price?.toLocaleString('en-IN')}
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary.main">
                              ₹{(item.product.price * item.quantity)?.toLocaleString('en-IN')}
                            </Typography>
                          </Box>
                        </Box>
                      </ListItem>
                      
                      {/* Delivery Estimate */}
                      {deliveryEst && (
                        <Alert severity="info" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalShipping sx={{ fontSize: 18 }} />
                          <Box>
                            <Typography variant="body2" fontWeight="600">
                              📦 Delivery: {deliveryEst.minFormatted} - {deliveryEst.maxFormatted}
                            </Typography>
                            <Typography variant="caption" color="inherit">
                              (~{deliveryEst.minDays}-{deliveryEst.maxDays} days • {deliveryEst.distance}km away)
                            </Typography>
                          </Box>
                        </Alert>
                      )}
                      <Divider sx={{ my: 2 }} />
                    </Box>
                  );
                })}
                
                
                <Divider sx={{ my: 3 }} />
                
                {/* Price Breakdown */}
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Subtotal
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="500">
                        ₹{total.toLocaleString('en-IN')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Shipping
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="500" color="success.main">
                        FREE
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6" fontWeight="bold">
                        Total
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="h5" fontWeight="bold" color="primary.main">
                        ₹{total.toLocaleString('en-IN')}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </React.Fragment>
          )}
      </Grid>

      {/* Sidebar */}
      <Grid item xs={12} md={4}>
        {currentStep === 1 && (
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Typography variant="h5" fontWeight="bold" color="primary.main" mb={3}>
              Payment Method
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Cash on Delivery */}
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: 'grey.200',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 12px rgba(255, 107, 53, 0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        Cash on Delivery
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pay when you receive
                      </Typography>
                      <Alert severity="info" sx={{ mt: 1 }}>
                        <Typography variant="caption">
                          Pay with cash when delivery arrives
                        </Typography>
                      </Alert>
                    </Box>
                    <Button 
                      variant="contained" 
                      color="primary"
                      disabled={loading || items.length === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCashOnDelivery();
                      }}
                      sx={{ minWidth: 120 }}
                    >
                      {loading ? 'Placing...' : 'Place Order'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Stripe Payment */}
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: 'grey.200',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'secondary.main',
                    boxShadow: '0 4px 12px rgba(40, 116, 240, 0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" fontWeight="600" color="secondary.main">
                        Card Payment
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Secure payment via Stripe
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" color="success.main" sx={{ mr: 1 }}>
                          Secured
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Visa, Mastercard, Rupay
                        </Typography>
                      </Box>
                    </Box>
                    <Button 
                      variant="contained" 
                      color="secondary"
                      disabled={loading || items.length === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStripeCheckout();
                      }}
                      sx={{ minWidth: 120 }}
                    >
                      {loading ? 'Processing...' : 'Pay Now'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Back Button */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                startIcon={<ArrowBack />}
                onClick={() => navigate('/cart')}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1
                }}
              >
                Back to Cart
              </Button>
            </Box>
          </Paper>
        )}
      </Grid>
    </Grid>
  </Container>
  );
};

export default Checkout;
