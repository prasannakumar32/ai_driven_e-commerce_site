import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Paper,
  CircularProgress,
  Chip,
  Alert,
  Breadcrumbs,
  Link,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Receipt,
  LocalShipping,
  CheckCircle,
  ArrowBack,
  Refresh,
  Visibility,
  Download,
  Phone,
  Email,
  LocationOn,
  Home
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { generatePDFInvoice } from '../utils/invoiceGenerator';

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/myorders');
      setOrders(response.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      
      // Handle different error types
      if (err.response?.status === 404) {
        setError('Orders endpoint not found. This feature is currently under development.');
      } else if (err.response?.status === 401) {
        setError('Please log in to view your orders.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view orders.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('Failed to load orders. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
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

  const getOrderStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'Delivered';
      case 'shipped':
        return 'Shipped';
      case 'processing':
        return 'Processing';
      case 'pending':
        return 'Pending';
      default:
        return status || 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleViewOrder = (orderId) => {
    navigate(`/order-confirmation`, { 
      state: { 
        orderId: orderId,
        fromOrders: true 
      } 
    });
  };

  const handleDownloadInvoice = async (order) => {
    try {
      await generatePDFInvoice(order);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Box textAlign="center" mt={4}>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={fetchOrders}
            sx={{ minWidth: 150 }}
          >
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/')}
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Home
          </Link>
          <Typography variant="body2" color="text.primary">
            Orders
          </Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary.main">
            My Orders
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchOrders}
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {orders.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <Receipt sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No orders yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You haven't placed any orders yet. Start shopping to see your orders here.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            If you believe this is an error, please make sure you're logged in and try refreshing the page.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/products')}
              sx={{ mr: 2 }}
            >
              Start Shopping
            </Button>
            <Button
              variant="outlined"
              onClick={fetchOrders}
              startIcon={<Refresh />}
            >
              Try Again
            </Button>
          </Box>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} md={6} lg={4} key={order._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    transform: 'translateY(-4px)'
                  }
                }}
                onClick={() => handleViewOrder(order._id)}
              >
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Order Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        Order #{order._id?.slice(-8) || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(order.createdAt)}
                      </Typography>
                    </Box>
                    <Chip
                      label={getOrderStatusText(order.status)}
                      color={getOrderStatusColor(order.status)}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>

                  {/* Order Items Preview */}
                  <Box sx={{ mb: 2 }}>
                    {order.orderItems?.slice(0, 2).map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box
                          component="img"
                          src={item.image || '/placeholder-product.jpg'}
                          alt={item.name}
                          sx={{
                            width: 40,
                            height: 40,
                            objectFit: 'cover',
                            borderRadius: 1,
                            mr: 2
                          }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" noWrap>
                            {item.name || item.product?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Qty: {item.quantity} × ₹{item.price || item.product?.price}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                    {order.orderItems?.length > 2 && (
                      <Typography variant="caption" color="text.secondary">
                        +{order.orderItems.length - 2} more items
                      </Typography>
                    )}
                  </Box>

                  {/* Order Total */}
                  <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #eee' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">
                        Total: ₹{order.totalPrice || order.total || 0}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Download Invoice">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadInvoice(order);
                            }}
                            sx={{ color: 'primary.main' }}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewOrder(order._id);
                            }}
                            sx={{ color: 'primary.main' }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Back to Shopping */}
      {orders.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/products')}
            size="large"
          >
            Continue Shopping
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Orders;
