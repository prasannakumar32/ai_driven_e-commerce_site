import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Alert,
  Grid,
  Chip,
  Divider,
  Avatar,
  Snackbar,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import {
  CheckCircle,
  Receipt,
  Info,
  LocalShipping,
  Payment,
  PictureAsPdf,
  Description,
  ArrowDropDown,
  Store
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import api from '../utils/api';
import { generatePDFInvoice, generateCSVInvoice } from '../utils/invoiceGenerator';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);
  const [processed, setProcessed] = useState(false); // Add processing flag
  const [showInvoiceSuccess, setShowInvoiceSuccess] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // Menu state

  useEffect(() => {
    console.log('PaymentSuccess: useEffect triggered');
    console.log('PaymentSuccess: Current URL:', window.location.href);
    console.log('PaymentSuccess: Search params:', searchParams.toString());
    console.log('PaymentSuccess: Hash:', window.location.hash);
    
    // Prevent multiple executions
    if (processed) {
      console.log('PaymentSuccess: Already processed, skipping');
      return;
    }
    
    const handlePaymentSuccess = async () => {
      try {
        setLoading(true);
        setProcessed(true); // Mark as processed immediately
        
        // Try to get session_id from multiple sources
        let sessionId = searchParams.get('session_id');
        
        // If not found in search params, check URL hash
        if (!sessionId && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          sessionId = hashParams.get('session_id');
        }
        
        // If still not found, try parsing from full URL
        if (!sessionId) {
          const urlParams = new URLSearchParams(window.location.search);
          sessionId = urlParams.get('session_id');
        }

        console.log('PaymentSuccess: Final session_id extracted:', sessionId);

        if (!sessionId) {
          console.error('PaymentSuccess: No session_id found in URL');
          setError('No payment session found. Please try again.');
          setLoading(false);
          return;
        }

        console.log('PaymentSuccess: Fetching session details for:', sessionId);

        // Get session details from backend
        const response = await api.get(`/stripe/session/${sessionId}`);
        const sessionData = response.data;

        console.log('PaymentSuccess: Session data received:', {
          id: sessionData.id,
          payment_status: sessionData.payment_status,
          amount_total: sessionData.amount_total
        });

        if (sessionData.payment_status === 'paid') {
          // Parse items from session metadata or line items
          let items = [];
          try {
            // First try to get items from metadata (stored during checkout)
            if (sessionData.metadata?.items) {
              items = JSON.parse(sessionData.metadata.items);
            } else if (sessionData.line_items?.data) {
              // Fallback to line items if available
              items = sessionData.line_items.data.map(item => ({
                name: item.description || item.price?.product_data?.name || 'Unknown Product',
                price: (item.amount_total || 0) / 100,
                quantity: item.quantity || 1,
                image: item.price?.product_data?.images?.[0] || ''
              }));
            }
          } catch (err) {
            console.error('Error parsing items:', err);
            items = [];
          }

          // Parse shipping address
          let shippingAddress = {};
          try {
            if (sessionData.metadata?.shippingAddress) {
              shippingAddress = JSON.parse(sessionData.metadata.shippingAddress);
            } else {
              // Build from Stripe customer/shipping details
              shippingAddress = {
                name: sessionData.customer_details?.name || 'Unknown',
                address: sessionData.shipping?.address?.line1 || '',
                city: sessionData.shipping?.address?.city || '',
                state: sessionData.shipping?.address?.state || '',
                postalCode: sessionData.shipping?.address?.postal_code || '',
                phone: sessionData.customer_details?.phone || '',
                email: sessionData.customer_details?.email || ''
              };
            }
          } catch (err) {
            console.error('Error parsing shipping address:', err);
            shippingAddress = {
              name: 'Unknown',
              address: '',
              city: '',
              state: '',
              postalCode: '',
              phone: '',
              email: ''
            };
          }

          // Calculate total - use amount_total from session or calculate from items
          let total = 0;
          if (sessionData.amount_total) {
            total = sessionData.amount_total / 100; // Convert from cents
          } else if (sessionData.metadata?.total) {
            total = parseFloat(sessionData.metadata.total) || 0;
          } else {
            // Calculate from items as last resort
            total = items.reduce((sum, item) => {
              const price = parseFloat(item.price) || 0;
              const quantity = parseInt(item.quantity) || 1;
              return sum + (price * quantity);
            }, 0);
          }

          console.log('PaymentSuccess: Processing successful payment with items:', items);
          console.log('PaymentSuccess: Calculated total:', total);

          setOrderData({
            _id: sessionData.metadata?.orderId || `stripe_${sessionId.slice(-8)}`,
            sessionId: sessionId,
            paymentIntentId: sessionData.payment_intent,
            totalPrice: total,
            paymentMethod: 'Card Payment (Stripe)',
            paymentStatus: 'Completed',
            orderStatus: 'Confirmed',
            isPaid: true,
            paidAt: new Date().toLocaleString('en-IN'),
            orderItems: items.map(item => ({
              name: item.name || 'Unknown Product',
              quantity: parseInt(item.quantity) || 1,
              price: parseFloat(item.price) || 0,
              image: item.image || '',
              sellerName: item.sellerName || 'Unknown',
              sellerBusinessName: item.sellerName || 'Unknown'
            })),
            shippingAddress: shippingAddress,
            taxPrice: 0, // Will be calculated in invoice generator
            shippingPrice: 0 // Will be calculated in invoice generator
          });

          calculateDeliveryDate();
          
          // Clear cart
          await clearCart();
          
          console.log('PaymentSuccess: Payment processed successfully');
        } else {
          console.error('PaymentSuccess: Payment not completed. Status:', sessionData.payment_status);
          setError('Payment was not completed successfully. Please try again.');
        }

        setLoading(false);
      } catch (err) {
        console.error('PaymentSuccess: Error processing payment success:', err);
        console.error('PaymentSuccess: Error response:', err.response?.data);
        setError(err.response?.data?.message || 'Failed to process payment. Please contact support.');
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [searchParams, processed, clearCart]); // Include processed flag and clearCart dependency

  const calculateDeliveryDate = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    
    // Standard delivery: 3-5 business days
    const minDays = 3;
    const maxDays = 5;
    
    // Add minimum delivery days
    deliveryDate.setDate(today.getDate() + minDays);
    
    // Skip weekends
    while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
    }
    
    const maxDeliveryDate = new Date(deliveryDate);
    maxDeliveryDate.setDate(deliveryDate.getDate() + (maxDays - minDays));
    
    // Skip weekends for max date
    while (maxDeliveryDate.getDay() === 0 || maxDeliveryDate.getDay() === 6) {
      maxDeliveryDate.setDate(maxDeliveryDate.getDate() + 1);
    }
    
    const formattedMinDate = deliveryDate.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    const formattedMaxDate = maxDeliveryDate.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    setEstimatedDelivery({
      minDate: deliveryDate,
      maxDate: maxDeliveryDate,
      minFormatted: formattedMinDate,
      maxFormatted: formattedMaxDate,
      dayRange: `${minDays}-${maxDays} Business Days`
    });
  };

  // Menu handlers
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Invoice generation function
  const handleGeneratePDFInvoice = () => {
    try {
      generatePDFInvoice(orderData);
      setShowInvoiceSuccess(true);
      setTimeout(() => setShowInvoiceSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating PDF invoice:', err);
      alert('Failed to generate PDF invoice. Please try again.');
    }
  };

  const handleGenerateCSVInvoice = () => {
    try {
      generateCSVInvoice(orderData);
      setShowInvoiceSuccess(true);
      setTimeout(() => setShowInvoiceSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating CSV invoice:', err);
      alert('Failed to generate CSV invoice. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" color="text.secondary">
            Processing your payment...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please don't refresh the page
          </Typography>
        </Box>
      </Container>
    );
  }

  // Error state
  if (error || !orderData) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <Avatar sx={{ bgcolor: 'error.main', width: 80, height: 80, mb: 2 }}>
            ❌
          </Avatar>
          <Typography variant="h4" color="error.main" gutterBottom fontWeight="bold">
            Payment Processing Failed
          </Typography>
          <Alert severity="error" sx={{ my: 3, maxWidth: 400 }}>
            {error || 'Unable to process your payment. Please try again or contact support.'}
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/checkout')}
            >
              Try Again
            </Button>
            <Button 
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
            {/* Test button for debugging */}
            <Button 
              variant="text"
              size="small"
              onClick={() => {
                const testUrl = `${window.location.origin}/payment-success?session_id=cs_test_123456789`;
                console.log('Testing with URL:', testUrl);
                window.location.href = testUrl;
              }}
            >
              🧪 Test Mock Payment
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh' }}>
        {/* Success Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Avatar 
          sx={{ 
            bgcolor: 'success.main', 
            width: 80, 
            height: 80, 
            mx: 'auto', 
            mb: 3,
            boxShadow: '0 8px 24px rgba(76, 175, 80, 0.3)'
          }}
        >
          <CheckCircle sx={{ fontSize: 48 }} />
        </Avatar>
        <Typography variant="h3" color="success.main" gutterBottom fontWeight="bold">
          Payment Successful! ✓
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Your order has been confirmed and will be delivered soon
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`Order ID: ${orderData._id?.slice(-8).toUpperCase()}`}
            color="primary"
            variant="outlined"
            icon={<Receipt />}
          />
          <Chip 
            label="Payment Verified ✓"
            color="success"
            variant="filled"
            icon={<Payment />}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Estimated Delivery */}
          {estimatedDelivery && (
            <Paper sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                    📦 Estimated Delivery
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {estimatedDelivery.minFormatted} - {estimatedDelivery.maxFormatted}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {estimatedDelivery.dayRange}
                  </Typography>
                </Box>
                <LocalShipping sx={{ fontSize: 60, opacity: 0.3 }} />
              </Box>
            </Paper>
          )}

          {/* Order Items */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" gutterBottom>
              📦 Order Items ({orderData.orderItems?.length || 0})
            </Typography>
            <Divider sx={{ my: 2 }} />
            {orderData.orderItems?.map((item, index) => (
              <Box 
                key={index}
                sx={{ 
                  p: 2,
                  bgcolor: index % 2 === 0 ? '#f5f5f5' : 'transparent',
                  borderRadius: 1,
                  mb: 2
                }}
              >
                {/* Item Details */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight="600" color="text.primary" sx={{ mb: 0.5 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Quantity: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    ₹{(item.price * item.quantity)?.toLocaleString('en-IN')}
                  </Typography>
                </Box>

                {/* Seller Information */}
                {(item.sellerName || item.sellerBusinessName) && (
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: 'primary.lighter', 
                    borderRadius: 1, 
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Store sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Box sx={{ flex:1 }}>
                      <Typography variant="caption" fontWeight="600" color="primary.main">
                        Sold by {item.sellerBusinessName || item.sellerName}
                      </Typography>
                      {item.sellerLocation?.city && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          📍 {item.sellerLocation.city}, {item.sellerLocation.state}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Delivery Estimate */}
                {item.deliveryDaysEstimate && (
                  <Alert severity="success" sx={{ py: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShipping sx={{ fontSize: 16 }} />
                    <Box>
                      <Typography variant="caption" fontWeight="600">
                        Delivery in {item.deliveryDaysEstimate.min}-{item.deliveryDaysEstimate.max} business days
                      </Typography>
                    </Box>
                  </Alert>
                )}
              </Box>
            ))}
          </Paper>

          {/* Next Steps */}
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', bgcolor: '#f0f7ff' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Info color="info" />
              What Happens Next?
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <Chip label="1" size="small" variant="filled" />
                <Box>
                  <Typography variant="body2" fontWeight="600">Order Confirmation Email</Typography>
                  <Typography variant="caption" color="text.secondary">Sent to {orderData.shippingAddress?.email}</Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <Chip label="2" size="small" variant="filled" />
                <Box>
                  <Typography variant="body2" fontWeight="600">Order Processing</Typography>
                  <Typography variant="caption" color="text.secondary">We'll prepare your order within 24 hours</Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <Chip label="3" size="small" variant="filled" />
                <Box>
                  <Typography variant="body2" fontWeight="600">Shipping Updates</Typography>
                  <Typography variant="caption" color="text.secondary">Track your package in real-time</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip label="4" size="small" variant="filled" />
                <Box>
                  <Typography variant="body2" fontWeight="600">Delivery</Typography>
                  <Typography variant="caption" color="text.secondary">We'll deliver to your address between {estimatedDelivery?.minFormatted} - {estimatedDelivery?.maxFormatted}</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Payment Summary */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Payment color="success" />
              Payment Confirmed
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f7f0', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Payment Method:</Typography>
                <Typography variant="body2" fontWeight="600">{orderData.paymentMethod}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Amount:</Typography>
                <Typography variant="body2" fontWeight="600">₹{orderData.totalPrice?.toLocaleString('en-IN')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Time:</Typography>
                <Typography variant="body2" fontWeight="600">{orderData.paidAt}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Reference ID:</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  {orderData.paymentIntentId?.slice(-8)}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Order Total */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              💰 Order Total
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2" fontWeight="600">₹{orderData.totalPrice?.toLocaleString('en-IN')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Shipping</Typography>
                <Typography variant="body2" fontWeight="600" color="success.main">FREE</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold">Total Paid</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  ₹{orderData.totalPrice?.toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Action Buttons */}
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button 
                variant="contained"
                color="primary"
                fullWidth 
                onClick={() => navigate('/profile')}
              >
                Track Order
              </Button>
              <Button 
                variant="outlined"
                color="primary"
                fullWidth 
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </Button>
              <Button 
                variant="text"
                fullWidth 
                size="small"
                onClick={() => window.print()}
              >
                📄 Print Receipt
              </Button>
              
              {/* Download Invoice Dropdown */}
              <Button
                variant="contained"
                color="success"
                fullWidth
                size="small"
                onClick={handleMenuClick}
                endIcon={<ArrowDropDown />}
              >
                📥 Download Invoice
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={() => { handleMenuClose(); handleGeneratePDFInvoice(); }}>
                  <ListItemIcon>
                    <PictureAsPdf />
                  </ListItemIcon>
                  Download as PDF
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); handleGenerateCSVInvoice(); }}>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  Download as CSV
                </MenuItem>
              </Menu>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
    
    {/* Invoice Download Success Notification */}
    <Snackbar
      open={showInvoiceSuccess}
      autoHideDuration={3000}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity="success" sx={{ width: '100%' }}>
        📥 Invoice downloaded successfully!
      </Alert>
    </Snackbar>
    </>  );
};

export default PaymentSuccess;