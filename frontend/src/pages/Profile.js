import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Person, 
  ShoppingBag, 
  History, 
  Settings, 
  LocalShipping, 
  Payment, 
  CheckCircle, 
  Schedule,
  Edit,
  Add,
  Delete,
  LocationOn,
  Phone,
  Email,
  Home as HomeIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI, authAPI } from '../utils/api';

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return 'success';
    case 'shipped':
      return 'info';
    case 'processing':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const Profile = () => {
  const { user, updateUser, updatePreferences, loading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: ''
  });
  
  const [preferences, setPreferences] = useState({
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 1000 }
  });

  const [addresses, setAddresses] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  // Fetch user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        username: user.username || ''
      });
      setPreferences(user.preferences || {
        categories: [],
        brands: [],
        priceRange: { min: 0, max: 1000 }
      });
      setAddresses(user.addresses || []);
    }
  }, [user]);

  // Fetch orders when tab changes to orders
  useEffect(() => {
    if (activeTab === 3 && user) { // Orders tab index
      fetchOrders();
    }
  }, [activeTab, user]);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setError('');
      const response = await orderAPI.getOrders();
      
      // Sort orders by date (newest first)
      const sortedOrders = (response.data || [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .reverse();
      
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleOrderAction = async (orderId, action) => {
    try {
      switch (action) {
        case 'cancel':
          await orderAPI.cancelOrder(orderId);
          setMessage('Order cancelled successfully');
          fetchOrders(); // Refresh orders
          break;
        case 'reorder':
          // Handle reorder logic
          const order = orders.find(o => o._id === orderId);
          if (order) {
            // Add items back to cart (you'd need to implement this)
            const cartItems = order.orderItems.map(item => ({
              product: item.product,
              quantity: item.quantity
            }));
            // This would need cart context integration
            setMessage('Items added to cart for reorder');
            navigate('/checkout');
          }
          break;
        default:
          break;
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Order action failed:', error);
      setError('Failed to process order action');
    }
  };

  const filterOrders = (status) => {
    if (!status) return orders;
    return orders.filter(order => order.status === status);
  };

  const sortOrders = (sortBy) => {
    const sorted = [...orders];
    switch (sortBy) {
      case 'date':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'status':
        return sorted.sort((a, b) => a.status.localeCompare(b.status));
      case 'total':
        return sorted.sort((a, b) => b.totalPrice - a.totalPrice);
      default:
        return sorted;
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await authAPI.getAddresses();
      setAddresses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      setError('Failed to load addresses');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setError('');
      // Only send name and preferences, exclude username since it's not editable
      const updateData = {
        name: formData.name,
        preferences: user.preferences
      };
      console.log('Submitting profile data:', updateData);
      const response = await updateUser(updateData);
      console.log('Profile update response:', response);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Profile update error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      setError(error.response?.data?.message || error.message || 'Failed to update profile');
    }
  };

  const handlePreferencesUpdate = async () => {
    try {
      setError('');
      await updatePreferences(preferences);
      setMessage('Preferences updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Preferences update error:', error);
      setError(error.response?.data?.message || 'Failed to update preferences');
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      console.log('Submitting address data:', addressForm);
      
      if (editingAddress) {
        console.log('Updating address:', editingAddress._id, addressForm);
        const response = await authAPI.updateAddress(editingAddress._id, addressForm);
        console.log('Update response:', response);
        setMessage('Address updated successfully!');
      } else {
        console.log('Adding new address:', addressForm);
        const response = await authAPI.addAddress(addressForm);
        console.log('Add response:', response);
        setMessage('Address added successfully!');
      }
      
      setAddressDialogOpen(false);
      setEditingAddress(null);
      setAddressForm({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India'
      });
      fetchAddresses();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Address error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      setError(error.response?.data?.message || error.message || 'Failed to save address');
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setAddressDialogOpen(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await authAPI.deleteAddress(addressId);
        setMessage('Address deleted successfully!');
        fetchAddresses();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Delete address error:', error);
        setError('Failed to delete address');
      }
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await authAPI.setDefaultAddress(addressId);
      setMessage('Default address updated successfully!');
      fetchAddresses();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Set default address error:', error);
      setError('Failed to set default address');
    }
  };

  const categories = [
    'electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys'
  ];

  const brands = [
    'Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'Microsoft', 'Dell'
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6">Please log in to view your profile</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        My Account
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="profile tabs">
          <Tab label="Account Settings" icon={<Person />} />
          <Tab label="Addresses" icon={<LocationOn />} />
          <Tab label="Preferences" icon={<Settings />} />
          <Tab label="Order History" icon={<ShoppingBag />} />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '2rem' }}>
                {user.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6">{user.name}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              <Chip 
                label={user.role === 'seller' ? 'Seller' : 'Customer'} 
                color={user.role === 'seller' ? 'secondary' : 'primary'} 
                size="small"
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Personal Information
              </Typography>
              
              <Box component="form" onSubmit={handleProfileUpdate}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      helperText="Username cannot be changed after registration"
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      helperText="Enter 10-digit mobile number without leading 0 (e.g., 90033811176)"
                      inputProps={{ maxLength: 10 }}
                      error={formData.phone && (!/^[6-9]\d{9}$/.test(formData.phone))}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Your Addresses
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => {
                    setEditingAddress(null);
                    setAddressForm({
                      name: user?.name || '', // Pre-fill with user's name
                      phone: user?.phone || '',
                      address: '',
                      city: '',
                      state: '',
                      postalCode: '',
                      country: 'India'
                    });
                    setAddressDialogOpen(true);
                  }}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '8px 16px',
                    fontSize: '14px',
                    '&:hover': {
                      backgroundColor: 'rgba(255,107,0,0.1)'
                    }
                  }}
                >
                  Add Address
                </Button>
              </Box>

              {addresses.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <LocationOn sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No addresses added yet
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {addresses.map((address) => (
                    <Grid item xs={12} md={6} key={address._id}>
                      <Card sx={{ position: 'relative' }}>
                        {address.isDefault && (
                          <Chip
                            label="Default"
                            color="primary"
                            size="small"
                            sx={{ position: 'absolute', top: 10, right: 10 }}
                          />
                        )}
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {address.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {address.address}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {address.city}, {address.state} {address.postalCode}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {address.country}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Phone: {address.phone}
                          </Typography>
                          
                          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleEditAddress(address)}
                    sx={{ 
                      borderRadius: 1,
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.04)'
                      }
                    }}
                  >
                    Edit
                  </Button>
                    {!address.isDefault && (
                      <Button
                        size="small"
                        startIcon={<HomeIcon />}
                        onClick={() => handleSetDefaultAddress(address._id)}
                        sx={{ 
                          borderRadius: 1,
                          textTransform: 'none',
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.04)'
                          }
                        }}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDeleteAddress(address._id)}
                      sx={{ 
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: 'rgba(211,47,47,0.04)'
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Shopping Preferences
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Favorite Categories
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category.charAt(0).toUpperCase() + category.slice(1)}
                  clickable
                  color={preferences.categories.includes(category) ? 'primary' : 'default'}
                  onClick={() => {
                    const newCategories = preferences.categories.includes(category)
                      ? preferences.categories.filter(c => c !== category)
                      : [...preferences.categories, category];
                    setPreferences({ ...preferences, categories: newCategories });
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Favorite Brands
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {brands.map((brand) => (
                <Chip
                  key={brand}
                  label={brand}
                  clickable
                  color={preferences.brands.includes(brand) ? 'primary' : 'default'}
                  onClick={() => {
                    const newBrands = preferences.brands.includes(brand)
                      ? preferences.brands.filter(b => b !== brand)
                      : [...preferences.brands, brand];
                    setPreferences({ ...preferences, brands: newBrands });
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Price Range
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Minimum Price"
                  type="number"
                  value={preferences.priceRange.min}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    priceRange: { ...preferences.priceRange, min: parseInt(e.target.value) || 0 }
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Maximum Price"
                  type="number"
                  value={preferences.priceRange.max}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    priceRange: { ...preferences.priceRange, max: parseInt(e.target.value) || 1000 }
                  })}
                />
              </Grid>
            </Grid>
          </Box>

          <Button
            variant="contained"
            onClick={handlePreferencesUpdate}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </Paper>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Paper sx={{ p: 4 }}>
          {/* Orders Header with Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Order History
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip 
                label="All"
                size="small"
                onClick={() => setFilterStatus('')}
                color={!filterStatus ? 'primary' : 'default'}
                variant={filterStatus ? 'filled' : 'outlined'}
              />
              <Chip 
                label="Pending"
                size="small"
                onClick={() => setFilterStatus('PENDING')}
                color={filterStatus === 'PENDING' ? 'primary' : 'default'}
                variant={filterStatus === 'PENDING' ? 'filled' : 'outlined'}
              />
              <Chip 
                label="Processing"
                size="small"
                onClick={() => setFilterStatus('PROCESSING')}
                color={filterStatus === 'PROCESSING' ? 'primary' : 'default'}
                variant={filterStatus === 'PROCESSING' ? 'filled' : 'outlined'}
              />
              <Chip 
                label="Shipped"
                size="small"
                onClick={() => setFilterStatus('SHIPPED')}
                color={filterStatus === 'SHIPPED' ? 'primary' : 'default'}
                variant={filterStatus === 'SHIPPED' ? 'filled' : 'outlined'}
              />
              <Chip 
                label="Delivered"
                size="small"
                onClick={() => setFilterStatus('DELIVERED')}
                color={filterStatus === 'DELIVERED' ? 'primary' : 'default'}
                variant={filterStatus === 'DELIVERED' ? 'filled' : 'outlined'}
              />
              <Chip 
                label="Cancelled"
                size="small"
                onClick={() => setFilterStatus('CANCELLED')}
                color={filterStatus === 'CANCELLED' ? 'primary' : 'default'}
                variant={filterStatus === 'CANCELLED' ? 'filled' : 'outlined'}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Sort by:
              </Typography>
              <Button
                size="small"
                onClick={() => setSortBy('date')}
                color={sortBy === 'date' ? 'primary' : 'default'}
                variant={sortBy === 'date' ? 'contained' : 'outlined'}
              >
                Date
              </Button>
              <Button
                size="small"
                onClick={() => setSortBy('status')}
                color={sortBy === 'status' ? 'primary' : 'default'}
                variant={sortBy === 'status' ? 'contained' : 'outlined'}
              >
                Status
              </Button>
              <Button
                size="small"
                onClick={() => setSortBy('total')}
                color={sortBy === 'total' ? 'primary' : 'default'}
                variant={sortBy === 'total' ? 'contained' : 'outlined'}
              >
                Total
              </Button>
            </Box>
          </Box>

          {ordersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : orders && orders.length > 0 ? (
            <List>
              {orders.map((order) => (
                <Card key={order._id} sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Order #{order._id?.slice(-8).toUpperCase()}
                      </Typography>
                      <Chip
                        label={order.status?.toUpperCase() || 'PENDING'}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Payment fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {order.paymentMethod?.toUpperCase()}
                        </Typography>
                      </Box>
                      
                      {order.isPaid && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle fontSize="small" color="success" />
                          <Typography variant="body2" color="success.main">
                            Paid
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      Order Items
                    </Typography>
                    
                    {order.orderItems?.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                        {item.product?.images?.[0] && (
                          <CardMedia
                            component="img"
                            sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover' }}
                            image={item.product.images[0]}
                            alt={item.name}
                          />
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight="medium">
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Quantity: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="bold">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                    ))}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">
                        Total: ₹{order.totalPrice?.toLocaleString('en-IN')}
                      </Typography>
                      
                      {order.deliveryInfo?.trackingNumber && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<LocalShipping />}
                          onClick={() => window.open(`https://track.delhivery.com/${order.deliveryInfo.trackingNumber}`, '_blank')}
                        >
                          Track Order
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                No orders yet. Start shopping!
              </Typography>
            </Box>
          )}
        </Paper>
      </TabPanel>

      {/* Address Dialog */}
      <Dialog open={addressDialogOpen} onClose={() => setAddressDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAddress ? 'Edit Address' : 'Add New Address'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddressSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={addressForm.name}
                  onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  required
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="State"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={addressForm.postalCode}
                  onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  required
                  helperText="Enter 10-digit mobile number without leading 0 (e.g., 90033811176)"
                  inputProps={{ maxLength: 10 }}
                  error={addressForm.phone && (!/^[6-9]\d{9}$/.test(addressForm.phone))}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button 
            onClick={() => setAddressDialogOpen(false)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              padding: '10px 20px',
              border: '1px solid #ddd',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddressSubmit} 
            variant="contained"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              padding: '10px 20px',
              backgroundColor: '#ff6b35',
              '&:hover': {
                backgroundColor: '#e55a2b'
              }
            }}
          >
            {editingAddress ? 'Update' : 'Add'} Address
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// TabPanel component
function TabPanel(props) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default Profile;
