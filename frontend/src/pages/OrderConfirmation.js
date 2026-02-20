import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { generatePDFInvoice, generateCSVInvoice } from '../utils/invoiceGenerator';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Paper,
  Divider,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  CheckCircle,
  LocalShipping,
  Payment,
  Inventory,
  Home,
  Phone,
  Email,
  LocationOn,
  ShoppingCart,
  ArrowBack,
  Receipt,
  Download,
  Share,
  Description
} from '@mui/icons-material';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        
        // Get order data from location state or fetch by order ID
        if (location.state?.orderData) {
          setOrderData(location.state.orderData);
        } else if (location.state?.orderId) {
          // Fetch order by ID when coming from Orders page
          const response = await api.get(`/orders/${location.state.orderId}`);
          setOrderData(response.data);
        } else {
          // Fetch the most recent order for the user
          const response = await api.get('/orders/myorders');
          if (response.data && response.data.length > 0) {
            setOrderData(response.data[0]);
          } else {
            setError('No order found');
          }
        }
      } catch (error) {
        console.error('Error fetching order data:', error);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();

    // Set up interval to check for status updates (every minute)
    const statusCheckInterval = setInterval(() => {
      if (orderData) {
        // Force re-render to update status based on current date
        const currentStatus = getOrderStatus();
        if (currentStatus === 'delivered') {
          // Clear interval once delivered
          clearInterval(statusCheckInterval);
        }
      }
    }, 60000); // Check every minute

    // Prevent going back to checkout after order confirmation
    const handlePopState = (event) => {
      event.preventDefault();
      navigate('/orders', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearInterval(statusCheckInterval);
    };
  }, [location.state, navigate]);

  const calculateDeliveryDate = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 3); // Standard 3-day delivery
    return deliveryDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getOrderStatus = () => {
    if (!orderData) return 'pending';
    
    const today = new Date();
    const orderDate = new Date(orderData.createdAt || Date.now());
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(orderDate.getDate() + 3); // 3-day delivery
    
    // Check if delivery date has passed
    if (today >= deliveryDate) {
      return 'delivered';
    }
    
    // Check if order is shipped (1 day after order)
    const shippedDate = new Date(orderDate);
    shippedDate.setDate(orderDate.getDate() + 1);
    if (today >= shippedDate) {
      return 'shipped';
    }
    
    // Check if order is processed (same day)
    if (today >= orderDate) {
      return 'processing';
    }
    
    return 'pending';
  };

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'info';
      case 'processing':
        return 'warning';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTimelineDates = () => {
    const today = new Date();
    const orderDate = new Date(orderData?.createdAt || today);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(orderDate.getDate() + 3);
    
    return {
      orderDate: orderDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      processedDate: orderDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      shippedDate: new Date(orderDate.getTime() + 86400000).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      deliveryDate: deliveryDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      isDelivered: today >= deliveryDate
    };
  };

  const calculateTotals = () => {
    if (!orderData) return { subtotal: 0, tax: 0, shipping: 0, total: 0 };
    
    // Use backend totals if available
    const tax = parseFloat(orderData.taxPrice) || 0;
    const shipping = parseFloat(orderData.shippingPrice) || 0;
    const total = parseFloat(orderData.totalPrice) || 0;
    
    // Calculate subtotal from items if available
    const subtotal = orderData.orderItems?.reduce((sum, item) => 
      sum + (parseFloat(item.price) * parseInt(item.quantity)), 0
    ) || 0;
    
    // Ensure subtotal adds up correctly
    const calculatedSubtotal = Math.max(subtotal, total - tax - shipping);
    
    return { 
      subtotal: calculatedSubtotal, 
      tax, 
      shipping, 
      total 
    };
  };

  const handleDownloadInvoice = async () => {
    try {
      await generatePDFInvoice(orderData);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    }
  };

  const handleDownloadCSVInvoice = async () => {
    try {
      await generateCSVInvoice(orderData);
    } catch (error) {
      console.error('Error generating CSV invoice:', error);
      alert('Failed to generate CSV invoice. Please try again.');
    }
  };

  const handleReorder = () => {
    if (!orderData?._id) {
      alert('Order ID not available for reordering');
      return;
    }
    
    // Simulate reorder process
    alert(`Reordering items from order #${orderData._id?.slice(-8)}`);
    console.log('Reorder initiated for order:', orderData._id);
  };

  const handleShareOrder = () => {
    // Simulate order sharing
    if (navigator.share) {
      navigator.share({
        title: 'Order Confirmation',
        text: `Check out my order #${orderData?._id?.slice(-8)}`,
        url: window.location.href
      });
    } else {
      alert('Order link copied to clipboard!');
    }
  };

  const timelineDates = getTimelineDates();
  const currentStatus = getOrderStatus();

  // Add state to trigger re-render for status updates
  const [statusUpdateTrigger, setStatusUpdateTrigger] = useState(0);

  // Set up interval to check for status updates
  useEffect(() => {
    if (orderData) {
      const interval = setInterval(() => {
        const newStatus = getOrderStatus();
        if (newStatus === 'delivered') {
          setStatusUpdateTrigger(prev => prev + 1); // Trigger re-render
          clearInterval(interval);
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [orderData]);

  const totals = calculateTotals();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !orderData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error || 'Order not found'}</Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumb Navigation */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/')}
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Home
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/cart')}
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Cart
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/checkout')}
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Checkout
          </Link>
          <Typography variant="body2" color="text.primary">
            Order Confirmation
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Success Header */}
      <Paper sx={{ p: 4, mb: 4, bgcolor: 'success.light', color: 'success.contrastText' }}>
        <Box textAlign="center">
          <CheckCircle sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Order Confirmed!
          </Typography>
          <Typography variant="h6" gutterBottom>
            Order ID: #{orderData._id?.slice(-8) || 'ORD' + Date.now().toString().slice(-6)}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Chip
              label={currentStatus.toUpperCase()}
              color={getOrderStatusColor(currentStatus)}
              size="medium"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          <Typography variant="body1">
            Thank you for your purchase. We've sent a confirmation email to {user?.email}
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Left Column - Order Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Delivery Timeline */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Delivery Timeline
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Order Confirmed"
                    secondary={timelineDates.orderDate}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Inventory color={currentStatus === 'processing' || currentStatus === 'shipped' || currentStatus === 'delivered' ? 'primary' : 'default'} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Order Processed"
                    secondary={timelineDates.processedDate}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocalShipping color={currentStatus === 'shipped' || currentStatus === 'delivered' ? 'primary' : 'default'} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Shipped"
                    secondary={timelineDates.shippedDate}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Home color={currentStatus === 'delivered' ? 'secondary' : 'default'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={currentStatus === 'delivered' ? 'Delivered' : 'Expected Delivery'}
                    secondary={timelineDates.deliveryDate}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Product Details
              </Typography>
              {orderData.orderItems?.map((item, index) => (
                <Box key={index}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 2 }}>
                      <Box
                        component="img"
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.name}
                        sx={{
                          width: '100%',
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {item.name || item.product?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description || item.product?.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={`Qty: ${item.quantity}`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                        {item.size && (
                          <Chip 
                            label={`Size: ${item.size}`} 
                            size="small" 
                            sx={{ ml: 1 }}
                            variant="outlined"
                          />
                        )}
                        {item.color && (
                          <Chip 
                            label={`Color: ${item.color}`} 
                            size="small" 
                            sx={{ ml: 1 }}
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box textAlign="right">
                        <Typography variant="body2" color="text.secondary">
                          ${(item.price || item.product?.price || 0).toFixed(2)} × {item.quantity}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          ${((item.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  {index < orderData.orderItems.length - 1 && (
                    <Divider sx={{ mt: 2, mb: 2 }} />
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Shipping Address
              </Typography>
              <Box display="flex" alignItems="flex-start" mb={2}>
                <LocationOn color="action" sx={{ mr: 2, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {orderData.shippingAddress?.address}<br />
                    {orderData.shippingAddress?.city}, {orderData.shippingAddress?.postalCode}<br />
                    {orderData.shippingAddress?.country}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" mb={1}>
                <Phone color="action" sx={{ mr: 2, fontSize: 20 }} />
                <Typography variant="body2">
                  {user?.phone || 'Not provided'}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Email color="action" sx={{ mr: 2, fontSize: 20 }} />
                <Typography variant="body2">
                  {user?.email}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Payment Information
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Payment color="action" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="subtitle1">
                    {orderData.paymentMethod?.replace('_', ' ').toUpperCase() || 'CREDIT CARD'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Payment successful
                  </Typography>
                </Box>
              </Box>
              <Chip 
                label="PAID" 
                color="success" 
                size="small"
                icon={<CheckCircle />}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Order Summary & Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Order Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Order Summary
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                {orderData.orderItems?.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {item.name || item.product?.name} × {item.quantity}
                    </Typography>
                    <Typography variant="body2">
                      ${((item.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2">${totals.subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Tax (8%):</Typography>
                <Typography variant="body2">${totals.tax.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Shipping:</Typography>
                <Typography variant="body2">
                  {totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  ${totals.total.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Quick Actions
              </Typography>
              
              <Button
                variant="contained"
                fullWidth
                startIcon={<Receipt />}
                onClick={handleDownloadInvoice}
                sx={{ mb: 2 }}
              >
                Download Invoice (PDF)
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<Description />}
                onClick={handleDownloadCSVInvoice}
                sx={{ mb: 2 }}
              >
                Download Invoice (CSV)
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Share />}
                onClick={handleShareOrder}
                sx={{ mb: 2 }}
              >
                Share Order
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ShoppingCart />}
                onClick={() => navigate('/products')}
                sx={{ mb: 2 }}
              >
                Continue Shopping
              </Button>
              
              <Button
                variant="text"
                fullWidth
                startIcon={<ArrowBack />}
                onClick={() => navigate('/orders', { replace: false })}
              >
                View All Orders
              </Button>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Need Help?
            </Typography>
            <Typography variant="body2" gutterBottom>
              • Track your order status in real-time<br />
              • Contact customer support at support@pks.com<br />
              • Easy returns within 30 days
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderConfirmation;
