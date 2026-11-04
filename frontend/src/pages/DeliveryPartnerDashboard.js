import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  LocalShipping,
  CheckCircle,
  Inventory,
  Person,
  LocationOn,
  Phone,
  Email,
  Map,
  TrendingUp,
  Assignment,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { deliveryPartnerAPI } from '../utils/api';

const DeliveryPartnerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [statusDialog, setStatusDialog] = useState({ open: false, order: null });
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    if (user?.role === 'delivery_partner') {
      fetchData();
      setIsAvailable(user.isAvailable !== false);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [availableRes, myOrdersRes, statsRes] = await Promise.all([
        deliveryPartnerAPI.getAvailableOrders(),
        deliveryPartnerAPI.getMyOrders(),
        deliveryPartnerAPI.getStats()
      ]);

      setAvailableOrders(availableRes.data || []);
      setMyOrders(myOrdersRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error('Error fetching delivery partner data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await deliveryPartnerAPI.acceptOrder(orderId);
      await fetchData();
    } catch (err) {
      console.error('Error accepting order:', err);
      alert('Failed to accept order. Please try again.');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await deliveryPartnerAPI.updateOrderStatus(statusDialog.order._id, statusUpdate);
      setStatusDialog({ open: false, order: null });
      setStatusUpdate({ status: '', location: '', notes: '' });
      await fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleAvailabilityToggle = async () => {
    try {
      await deliveryPartnerAPI.updateAvailability(!isAvailable);
      setIsAvailable(!isAvailable);
    } catch (err) {
      console.error('Error updating availability:', err);
      alert('Failed to update availability. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'shipped': return 'info';
      case 'in-transit': return 'primary';
      case 'out-for-delivery': return 'warning';
      case 'delivered': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'shipped': return <LocalShipping />;
      case 'in-transit': return <LocalShipping />;
      case 'out-for-delivery': return <LocalShipping />;
      case 'delivered': return <CheckCircle />;
      default: return <Inventory />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (user?.role !== 'delivery_partner') {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">
          Access denied. This page is only for delivery partners.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            Delivery Partner Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isAvailable}
                  onChange={handleAvailabilityToggle}
                  color="success"
                />
              }
              label={isAvailable ? 'Available' : 'Unavailable'}
            />
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchData}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Assignment sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h3" fontWeight="bold">
                        {stats.totalDeliveries || 0}
                      </Typography>
                      <Typography variant="body2">Total Deliveries</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircle sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h3" fontWeight="bold">
                        {stats.completedDeliveries || 0}
                      </Typography>
                      <Typography variant="body2">Completed</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocalShipping sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h3" fontWeight="bold">
                        {stats.inProgressDeliveries || 0}
                      </Typography>
                      <Typography variant="body2">In Progress</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TrendingUp sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h3" fontWeight="bold">
                        ₹{stats.totalEarnings?.toLocaleString('en-IN') || 0}
                      </Typography>
                      <Typography variant="body2">Total Earnings</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={`Available Orders (${availableOrders.length})`} />
          <Tab label={`My Orders (${myOrders.length})`} />
        </Tabs>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Available Orders Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {availableOrders.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <LocalShipping sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary">
                  No available orders at the moment
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Orders will appear here when they are ready for delivery
                </Typography>
              </Paper>
            </Grid>
          ) : (
            availableOrders.map((order) => (
              <Grid item xs={12} md={6} key={order._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Order #{order._id?.slice(-8).toUpperCase()}
                      </Typography>
                      <Chip
                        label={order.status?.toUpperCase()}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </Box>

                    <List dense>
                      <ListItem>
                        <ListItemIcon><Person /></ListItemIcon>
                        <ListItemText primary={order.user?.name} secondary="Customer" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Phone /></ListItemIcon>
                        <ListItemText primary={order.shippingAddress?.phone} secondary="Phone" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><LocationOn /></ListItemIcon>
                        <ListItemText
                          primary={`${order.shippingAddress?.address}, ${order.shippingAddress?.city}`}
                          secondary="Delivery Address"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Inventory /></ListItemIcon>
                        <ListItemText
                          primary={`${order.orderItems?.length} items`}
                          secondary="Order Items"
                        />
                      </ListItem>
                    </List>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Order Items:
                    </Typography>
                    {order.orderItems?.slice(0, 2).map((item, idx) => (
                      <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                        • {item.name} x {item.quantity}
                      </Typography>
                    ))}
                    {order.orderItems?.length > 2 && (
                      <Typography variant="caption" color="text.secondary">
                        +{order.orderItems.length - 2} more items
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<LocalShipping />}
                      onClick={() => handleAcceptOrder(order._id)}
                    >
                      Accept Order
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* My Orders Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {myOrders.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary">
                  No assigned orders
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Orders you accept will appear here
                </Typography>
              </Paper>
            </Grid>
          ) : (
            myOrders.map((order) => (
              <Grid item xs={12} md={6} key={order._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Order #{order._id?.slice(-8).toUpperCase()}
                      </Typography>
                      <Chip
                        label={order.status?.toUpperCase()}
                        color={getStatusColor(order.status)}
                        size="small"
                        icon={getStatusIcon(order.status)}
                      />
                    </Box>

                    <List dense>
                      <ListItem>
                        <ListItemIcon><Person /></ListItemIcon>
                        <ListItemText primary={order.user?.name} secondary="Customer" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Phone /></ListItemIcon>
                        <ListItemText primary={order.shippingAddress?.phone} secondary="Phone" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><LocationOn /></ListItemIcon>
                        <ListItemText
                          primary={`${order.shippingAddress?.address}, ${order.shippingAddress?.city}`}
                          secondary="Delivery Address"
                        />
                      </ListItem>
                      {order.currentLocation && (
                        <ListItem>
                          <ListItemIcon><Map /></ListItemIcon>
                          <ListItemText primary={order.currentLocation} secondary="Current Location" />
                        </ListItem>
                      )}
                    </List>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Order Items:
                    </Typography>
                    {order.orderItems?.slice(0, 2).map((item, idx) => (
                      <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                        • {item.name} x {item.quantity}
                      </Typography>
                    ))}
                  </CardContent>
                  <CardActions sx={{ flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<LocalShipping />}
                      onClick={() => setStatusDialog({ open: true, order })}
                    >
                      Update Status
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Phone />}
                      href={`tel:${order.shippingAddress?.phone}`}
                    >
                      Call Customer
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, order: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Update Delivery Status</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Status"
              value={statusUpdate.status}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
            >
              <MenuItem value="in-transit">In Transit</MenuItem>
              <MenuItem value="out-for-delivery">Out for Delivery</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Current Location"
              value={statusUpdate.location}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, location: e.target.value })}
              placeholder="e.g., Near destination, At customer location"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              value={statusUpdate.notes}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
              placeholder="Additional delivery information"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, order: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateStatus}
            disabled={!statusUpdate.status}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DeliveryPartnerDashboard;
