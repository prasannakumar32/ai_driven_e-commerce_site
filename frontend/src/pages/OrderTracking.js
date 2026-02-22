import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  IconButton,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineContent,
  TimelineDot
} from '@mui/material';
import {
  LocalShipping,
  LocalMall,
  CheckCircle,
  Truck,
  Package,
  Home,
  Phone,
  Email,
  AccessTime,
  Refresh,
  Edit
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import api, { orderAPI } from '../utils/api';
import DeliveryStatusUpdate from '../components/DeliveryStatusUpdate';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingDialog, setTrackingDialog] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [user, setUser] = useState(null);
  const [deliveryUpdate, setDeliveryUpdate] = useState({
    status: '',
    location: '',
    estimatedDelivery: '',
    notes: ''
  });

  useEffect(() => {
    fetchOrderDetails();
    // Get current user to check if admin
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data');
      }
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrder(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setLoading(false);
    }
  };

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
      icon: <Package />
    },
    {
      label: 'Shipped',
      description: 'Your order has been shipped and is on its way',
      icon: <Truck />
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
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <LinearProgress sx={{ width: '300px' }} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading order details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">
          Order not found. Please check your order ID and try again.
        </Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="contained" onClick={() => navigate('/profile')}>
            Back to Orders
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Order Tracking
      </Typography>

      {/* Order Summary */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Order ID:
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {order._id?.slice(-8).toUpperCase()}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Order Date:
            </Typography>
            <Typography variant="body1">
              {new Date(order.createdAt).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Total Amount:
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="primary">
              ₹{order.totalPrice?.toLocaleString('en-IN')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Payment Method:
            </Typography>
            <Typography variant="body1">
              {order.paymentMethod?.toUpperCase()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Order Status */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Order Status
        </Typography>
        
        <Stepper activeStep={getActiveStep()} sx={{ mb: 3 }}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                icon={step.icon}
                optional={
                  index === 2 && order.status !== 'shipped' ? 'Shipping information will be available once shipped' : false
                }
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Chip
            label={order.status?.toUpperCase()}
            color={getStatusColor(order.status)}
            size="large"
            sx={{ fontSize: '1rem' }}
          />
        </Box>
      </Paper>

      {/* Shipping Address */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Shipping Address
        </Typography>
        <Typography variant="body1">
          {formatAddress(order.shippingAddress)}
        </Typography>
      </Paper>

      {/* Order Items */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Order Items
        </Typography>
        <List>
          {order.orderItems?.map((item, index) => (
            <ListItem key={index} sx={{ pl: 0 }}>
              <ListItemIcon>
                <Package />
              </ListItemIcon>
              <ListItemText
                primary={item.name}
                secondary={`Quantity: ${item.quantity} | Price: ₹${item.price?.toLocaleString('en-IN')}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Delivery Tracking */}
      {order.status === 'shipped' && (
      {/* Status Timeline */}
      {order.statusTimeline && order.statusTimeline.length > 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              📦 Delivery Timeline
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={() => fetchOrderDetails()} color="primary" size="small">
                <Refresh />
              </IconButton>
              {user?.isAdmin && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setShowStatusUpdate(true)}
                  color="primary"
                >
                  Update Status
                </Button>
              )}
            </Box>
          </Box>

          <Timeline sx={{ m: 0 }}>
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
                'pending': <Package />,
                'processing': <Package />,
                'shipped': <LocalShipping />,
                'in-transit': <Truck />,
                'out-for-delivery': <Truck />,
                'delivered': <Home />,
                'cancelled': <CheckCircle />
              };

              return (
                <TimelineItem key={index}>
                  <TimelineSeparator>
                    <TimelineDot 
                      sx={{ 
                        bgcolor: isLast ? (statusColorMap[item.status] === 'warning' ? 'warning.main' : 
                                        statusColorMap[item.status] === 'info' ? 'info.main' :
                                        statusColorMap[item.status] === 'primary' ? 'primary.main' :
                                        statusColorMap[item.status] === 'success' ? 'success.main' : 'error.main')
                                      : 'grey.400'
                      }}
                    >
                      {statusIconMap[item.status]}
                    </TimelineDot>
                    {!isLast && <Box sx={{ height: '60px', bgcolor: 'grey.200' }} />}
                  </TimelineSeparator>
                  <TimelineContent sx={{ pb: 4 }}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: isLast ? '#e3f2fd' : '#f5f5f5',
                      borderRadius: 1,
                      border: isLast ? '2px solid #1976d2' : '1px solid #e0e0e0'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                          {item.status.replace('-', ' ')}
                        </Typography>
                        <Chip 
                          label={new Date(item.timestamp).toLocaleDateString()} 
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {new Date(item.timestamp).toLocaleString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>

                      {item.location && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Location:</strong> {item.location}
                        </Typography>
                      )}

                      {item.notes && (
                        <Typography variant="body2">
                          <strong>Notes:</strong> {item.notes}
                        </Typography>
                      )}
                    </Box>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>

          {/* Current Status Summary */}
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Current Status:</strong> {order.status.replace('-', ' ').toUpperCase()}
            </Typography>
            {order.trackingNumber && (
              <Typography variant="body2" color="text.secondary">
                <strong>Tracking Number:</strong> {order.trackingNumber}
              </Typography>
            )}
            {order.currentLocation && (
              <Typography variant="body2" color="text.secondary">
                <strong>Current Location:</strong> {order.currentLocation}
              </Typography>
            )}
            {order.estimatedDeliveryDate && (
              <Typography variant="body2" color="text.secondary">
                <strong>Estimated Delivery:</strong> {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN')}
              </Typography>
            )}
          </Box>
        </Paper>
      )}

      {/* Delivery Update Form - for admin */}
      {order && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Delivery Tracking
            </Typography>
            <IconButton onClick={() => setTrackingDialog(true)} color="primary">
              <Refresh />
            </IconButton>
          </Box>

          <Timeline>
            <TimelineItem>
              <TimelineDot color="primary" />
              <TimelineContent>
                <Typography variant="h6" component="span">
                  Order Shipped
                </Typography>
                <Typography>
                  Your package has been shipped and is on its way to you.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(order.shippedAt || order.updatedAt).toLocaleString()}
                </Typography>
              </TimelineContent>
            </TimelineItem>
            
            <TimelineItem>
              <TimelineDot color="grey" />
              <TimelineContent>
                <Typography variant="h6" component="span">
                  Out for Delivery
                </Typography>
                <Typography>
                  Package is with delivery partner
                </Typography>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </Paper>
      )}

      {/* Delivery Update Form */}
      {order.status === 'shipped' && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Update Delivery Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Delivery Status"
                value={deliveryUpdate.status}
                onChange={(e) => setDeliveryUpdate({ ...deliveryUpdate, status: e.target.value })}
                sx={{ mb: 2 }}
              >
                <MenuItem value="out-for-delivery">Out for Delivery</MenuItem>
                <MenuItem value="in-transit">In Transit</MenuItem>
                <MenuItem value="out-for-delivery-today">Out for Delivery Today</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Current Location"
                value={deliveryUpdate.location}
                onChange={(e) => setDeliveryUpdate({ ...deliveryUpdate, location: e.target.value })}
                placeholder="e.g., Local Hub, Delivery Center, etc."
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Estimated Delivery Time"
                value={deliveryUpdate.estimatedDelivery}
                onChange={(e) => setDeliveryUpdate({ ...deliveryUpdate, estimatedDelivery: e.target.value })}
                placeholder="e.g., Today 5-7 PM, Tomorrow 10-12 PM"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Delivery Notes"
                value={deliveryUpdate.notes}
                onChange={(e) => setDeliveryUpdate({ ...deliveryUpdate, notes: e.target.value })}
                placeholder="Additional delivery information..."
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setTrackingDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => updateOrderStatus({ 
                status: deliveryUpdate.status || 'in-transit',
                deliveryInfo: deliveryUpdate
              })}
              disabled={!deliveryUpdate.status}
            >
              Update Status
            </Button>
          </Box>
        </Paper>
      )}

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="outlined" onClick={() => navigate('/profile')}>
          Back to Orders
        </Button>
        <Button variant="contained" onClick={() => window.print()}>
          Print Receipt
        </Button>
      </Box>

      {/* Delivery Update Dialog */}
      <Dialog open={trackingDialog} onClose={() => setTrackingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Delivery Status</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Update the delivery status to keep customers informed about their order progress.
          </Alert>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status"
                value={deliveryUpdate.status}
                onChange={(e) => setDeliveryUpdate({ ...deliveryUpdate, status: e.target.value })}
              >
                <MenuItem value="out-for-delivery">Out for Delivery</MenuItem>
                <MenuItem value="in-transit">In Transit</MenuItem>
                <MenuItem value="out-for-delivery-today">Out for Delivery Today</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={deliveryUpdate.location}
                onChange={(e) => setDeliveryUpdate({ ...deliveryUpdate, location: e.target.value })}
                placeholder="Current delivery location"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Estimated Time"
                value={deliveryUpdate.estimatedDelivery}
                onChange={(e) => setDeliveryUpdate({ ...deliveryUpdate, estimatedDelivery: e.target.value })}
                placeholder="e.g., Today 5-7 PM"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Notes"
                value={deliveryUpdate.notes}
                onChange={(e) => setDeliveryUpdate({ ...deliveryUpdate, notes: e.target.value })}
                placeholder="Additional delivery information"
              />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Delivery Status Update Dialog (for admins) */}
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
