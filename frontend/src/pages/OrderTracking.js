import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Divider
} from '@mui/material';
import {
  LocalShipping,
  CheckCircle,
  Inventory,
  Home,
  Refresh,
  Edit
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../utils/api';
import DeliveryStatusUpdate from '../components/DeliveryStatusUpdate';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingDialog, setTrackingDialog] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [user, setUser] = useState(null);
  const [deliveryUpdate, setDeliveryUpdate] = useState({
    status: '',
    location: '',
    estimatedDelivery: '',
    notes: ''
  });

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderAPI.getOrder(orderId);
      setOrder(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details. Please check the order ID and try again.');
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data');
      }
    }
  }, [orderId, fetchOrderDetails]);

  const updateOrderStatus = async (statusData) => {
    try {
      await orderAPI.updateOrderStatus(orderId, statusData);
      setOrder(prev => ({ ...prev, ...statusData }));
      setTrackingDialog(false);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getActiveStep = () => {
    if (!order) return 0;
    switch (order.status) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      default: return 'default';
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.address}, ${address.city}, ${address.postalCode}, ${address.country}`;
  };

  const steps = [
    {
      label: 'Order Confirmed',
      description: 'Your order has been received and is being processed',
      icon: <CheckCircle />
    },
    {
      label: 'Processing',
      description: 'Your order is being prepared for shipment',
      icon: <Inventory />
    },
    {
      label: 'Shipped',
      description: 'Your order has been shipped and is on its way',
      icon: <LocalShipping />
    },
    {
      label: 'Delivered',
      description: 'Your order has been delivered successfully',
      icon: <Home />
    }
  ];

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
          <LinearProgress sx={{ width: '300px', mb: 3 }} />
          <Typography variant="h6" color="text.secondary">
            Loading order details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h5" color="error.main" gutterBottom fontWeight="bold">
            Order Not Found
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Order not found. Please check your order ID and try again.'}
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={() => navigate('/orders')}>
              View My Orders
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Order Tracking
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Order ID:</Typography>
            <Typography variant="body1" fontWeight="bold">{order._id?.slice(-8).toUpperCase()}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Order Date:</Typography>
            <Typography variant="body1">{new Date(order.createdAt).toLocaleDateString()}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Total Amount:</Typography>
            <Typography variant="body1" fontWeight="bold" color="primary">₹{order.totalPrice?.toLocaleString('en-IN')}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
            <Typography variant="body1">{order.paymentMethod?.toUpperCase()}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Order Status</Typography>
        <Stepper activeStep={getActiveStep()} sx={{ mb: 3 }}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel icon={step.icon}>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Chip label={order.status?.toUpperCase()} color={getStatusColor(order.status)} size="large" sx={{ fontSize: '1rem' }} />
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Shipping Address</Typography>
        <Typography variant="body1">{formatAddress(order.shippingAddress)}</Typography>
      </Paper>

      {order.deliveryPartner && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: '#e3f2fd', border: '2px solid #1976d2' }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
            🚚 Delivery Partner Assigned
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body1" fontWeight="600">
              Name: {order.deliveryPartnerName || 'N/A'}
            </Typography>
            {order.deliveryPartnerPhone && (
              <Button variant="contained" size="small" href={`tel:${order.deliveryPartnerPhone}`} startIcon={<LocalShipping />}>
                Call Delivery Partner
              </Button>
            )}
          </Box>
          {order.deliveryPartnerAssignedAt && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Assigned on: {new Date(order.deliveryPartnerAssignedAt).toLocaleString()}
            </Typography>
          )}
        </Paper>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Order Items</Typography>
        <List>
          {order.orderItems?.map((item, index) => (
            <ListItem key={index} sx={{ pl: 0 }}>
              <ListItemIcon><Inventory /></ListItemIcon>
              <ListItemText primary={item.name} secondary={`Quantity: ${item.quantity} | Price: ₹${item.price?.toLocaleString('en-IN')}`} />
            </ListItem>
          ))}
        </List>
      </Paper>

      {order.statusTimeline && order.statusTimeline.length > 0 && order.status === 'shipped' && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">📦 Delivery Timeline</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={() => fetchOrderDetails()} color="primary" size="small">
                <Refresh />
              </IconButton>
            </Box>
          </Box>
          <List>
            {order.statusTimeline.map((item, index) => {
              const isLast = index === order.statusTimeline.length - 1;
              const statusColorMap = {
                'pending': 'warning',
                'processing': 'info',
                'shipped': 'primary',
                'in-transit': 'primary',
                'out-for-delivery': 'info',
                'delivered': 'success',
                'cancelled': 'error'
              };
              const statusIconMap = {
                'pending': <Inventory />,
                'processing': <Inventory />,
                'shipped': <LocalShipping />,
                'in-transit': <LocalShipping />,
                'out-for-delivery': <LocalShipping />,
                'delivered': <Home />,
                'cancelled': <CheckCircle />
              };
              return (
                <React.Fragment key={index}>
                  <ListItem sx={{ p: 2, bgcolor: isLast ? '#e3f2fd' : '#f5f5f5', borderRadius: 1, border: isLast ? '2px solid #1976d2' : '1px solid #e0e0e0', mb: 2, flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1 }}>
                      <Chip icon={statusIconMap[item.status]} label={item.status.replace('-', ' ').toUpperCase()} color={statusColorMap[item.status]} size="small" />
                      <Chip label={new Date(item.timestamp).toLocaleDateString()} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {new Date(item.timestamp).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    {item.location && <Typography variant="body2" sx={{ mb: 1 }}><strong>Location:</strong> {item.location}</Typography>}
                    {item.notes && <Typography variant="body2"><strong>Notes:</strong> {item.notes}</Typography>}
                  </ListItem>
                  {!isLast && <Divider sx={{ my: 1 }} />}
                </React.Fragment>
              );
            })}
          </List>
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="text.secondary"><strong>Current Status:</strong> {order.status.replace('-', ' ').toUpperCase()}</Typography>
            {order.trackingNumber && <Typography variant="body2" color="text.secondary"><strong>Tracking Number:</strong> {order.trackingNumber}</Typography>}
            {order.currentLocation && <Typography variant="body2" color="text.secondary"><strong>Current Location:</strong> {order.currentLocation}</Typography>}
            {order.estimatedDeliveryDate && <Typography variant="body2" color="text.secondary"><strong>Estimated Delivery:</strong> {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN')}</Typography>}
          </Box>
        </Paper>
      )}

      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="outlined" onClick={() => navigate('/orders')}>Back to Orders</Button>
        <Button variant="contained" onClick={() => window.print()}>Print Receipt</Button>
      </Box>

      <Dialog open={trackingDialog} onClose={() => setTrackingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Delivery Status</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>Update the delivery status to keep customers informed about their order progress.</Alert>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth select label="Status" value={deliveryUpdate.status} onChange={(e) => setDeliveryUpdate({ ...deliveryUpdate, status: e.target.value })}>
                <MenuItem value="out-for-delivery">Out for Delivery</MenuItem>
                <MenuItem value="in-transit">In Transit</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Location" value={deliveryUpdate.location} onChange={(e) => setDeliveryUpdate({ ...deliveryUpdate, location: e.target.value })} placeholder="Current delivery location" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Notes" value={deliveryUpdate.notes} onChange={(e) => setDeliveryUpdate({ ...deliveryUpdate, notes: e.target.value })} placeholder="Additional delivery information" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrackingDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => updateOrderStatus({ status: deliveryUpdate.status || 'in-transit', deliveryInfo: deliveryUpdate })} disabled={!deliveryUpdate.status}>Update Status</Button>
        </DialogActions>
      </Dialog>

      {order && (
        <DeliveryStatusUpdate
          open={showStatusUpdate}
          onClose={() => setShowStatusUpdate(false)}
          order={order}
          onSuccess={() => {
            setShowStatusUpdate(false);
            fetchOrderDetails();
          }}
        />
      )}
    </Container>
  );
};

export default OrderTracking;
