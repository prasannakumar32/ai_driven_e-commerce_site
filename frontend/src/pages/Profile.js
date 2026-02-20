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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import {
  Person,
  ShoppingBag,
  LocalShipping,
  Payment,
  CheckCircle,
  Schedule,
  Edit,
  Add,
  Delete,
  LocationOn,
  Home as HomeIcon,
  ArrowDropDown,
  Sort
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
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
  const { user, updateUser, loading } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: ''
  });
  

  const [addresses, setAddresses] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('order-date-desc');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Amazon-style sorting options
  const sortOptions = [
    { value: 'order-date-desc', label: 'Newest Orders', field: 'createdAt', direction: 'desc' },
    { value: 'order-date-asc', label: 'Oldest Orders', field: 'createdAt', direction: 'asc' },
    { value: 'total-desc', label: 'Highest Total', field: 'totalPrice', direction: 'desc' },
    { value: 'total-asc', label: 'Lowest Total', field: 'totalPrice', direction: 'asc' },
    { value: 'status-asc', label: 'Status (A-Z)', field: 'status', direction: 'asc' },
    { value: 'status-desc', label: 'Status (Z-A)', field: 'status', direction: 'desc' }
  ];
  
  // Computed state for filtered and sorted orders
  const getFilteredAndSortedOrders = () => {
    let filtered = filterOrders(filterStatus);
    return sortOrders(filtered, sortBy);
  };
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
      setAddresses(user.addresses || []);
    }
  }, [user]);

  // Fetch orders when tab changes to orders
  useEffect(() => {
    if (activeTab === 2 && user) { // Orders tab index (updated from 3 to 2)
      fetchOrders();
    }
  }, [activeTab, user]);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setError('');
      const response = await orderAPI.getOrders();
      
      // Set orders without sorting here - sorting will be handled by the sort function
      setOrders(response.data || []);
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
          // Show confirmation dialog before cancelling
          const confirmCancel = window.confirm('Are you sure you want to cancel this order? This action cannot be undone.');
          if (!confirmCancel) {
            return;
          }
          
          console.log(`Attempting to cancel order: ${orderId}`);
          const response = await orderAPI.cancelOrder(orderId);
          console.log('Cancel order response:', response.data);
          
          setMessage('Order cancelled successfully');
          fetchOrders(); // Refresh orders
          break;
          
        case 'reorder':
          // Handle reorder logic
          const orderToReorder = orders.find(o => o._id === orderId);
          if (orderToReorder && orderToReorder.orderItems) {
            // Add items back to cart
            let reorderCount = 0;
            for (const item of orderToReorder.orderItems) {
              try {
                await addToCart(
                  { _id: item.product, name: item.name, price: item.price },
                  item.quantity
                );
                reorderCount++;
              } catch (itemError) {
                console.error(`Failed to add item to cart:`, itemError);
              }
            }
            if (reorderCount > 0) {
              setMessage(`${reorderCount} item(s) added to cart for reorder`);
              setTimeout(() => navigate('/cart'), 1500);
            } else {
              setError('Failed to add items to cart. Please try again.');
            }
          }
          break;
          
        default:
          break;
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Order action failed:', error);
      
      // Provide more detailed error messages
      let errorMessage = 'Failed to process order action';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage = 'You are not authorized to perform this action';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid request';
        } else if (error.response.status === 404) {
          errorMessage = 'Order not found';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error occurred. Please try again later.';
          if (error.response.data?.debug) {
            console.log('Debug info:', error.response.data.debug);
          }
        } else {
          errorMessage = error.response.data?.message || `Error ${error.response.status}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network error. Please check your connection.';
      } else {
        // Something else happened
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      setError(errorMessage);
    }
  };

  const filterOrders = (status) => {
    if (!status) return orders;
    return orders.filter(order => {
      const orderStatus = order.status?.toUpperCase();
      const filterStatusUpper = status.toUpperCase();
      return orderStatus === filterStatusUpper;
    });
  };

  const sortOrders = (ordersToSort, sortByValue) => {
    const sorted = [...ordersToSort];
    const sortOption = sortOptions.find(option => option.value === sortByValue);
    
    if (!sortOption) {
      // Default to newest orders if no valid sort option
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    const { field, direction } = sortOption;
    
    return sorted.sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      // Handle different field types
      if (field === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (field === 'status') {
        aValue = (aValue || '').toUpperCase();
        bValue = (bValue || '').toUpperCase();
      } else if (field === 'totalPrice') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }
      
      // Compare based on direction
      if (direction === 'asc') {
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      } else {
        if (aValue > bValue) return -1;
        if (aValue < bValue) return 1;
        return 0;
      }
    });
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
      // Send name and phone only
      const updateData = {
        name: formData.name,
        phone: formData.phone
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
          {/* Amazon-style Header with Results Count and Sort */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2
          }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Order History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getFilteredAndSortedOrders().length} {getFilteredAndSortedOrders().length === 1 ? 'order' : 'orders'}
                {filterStatus && ` · ${filterStatus}`}
              </Typography>
            </Box>
            
            {/* Amazon-style Sort Dropdown */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Sort:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  displayEmpty
                  sx={{
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }
                  }}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Sort fontSize="small" />
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Filter Controls - Amazon-style Pills */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'medium' }}>
              Filter by status:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip 
                label="All Orders"
                size="small"
                onClick={() => setFilterStatus('')}
                color={!filterStatus ? 'primary' : 'default'}
                variant={!filterStatus ? 'filled' : 'outlined'}
                clickable
                sx={{ 
                  '&.MuiChip-filled': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText'
                  }
                }}
              />
              <Chip 
                label="Pending"
                size="small"
                onClick={() => setFilterStatus('PENDING')}
                color={filterStatus === 'PENDING' ? 'primary' : 'default'}
                variant={filterStatus === 'PENDING' ? 'filled' : 'outlined'}
                clickable
              />
              <Chip 
                label="Processing"
                size="small"
                onClick={() => setFilterStatus('PROCESSING')}
                color={filterStatus === 'PROCESSING' ? 'primary' : 'default'}
                variant={filterStatus === 'PROCESSING' ? 'filled' : 'outlined'}
                clickable
              />
              <Chip 
                label="Shipped"
                size="small"
                onClick={() => setFilterStatus('SHIPPED')}
                color={filterStatus === 'SHIPPED' ? 'primary' : 'default'}
                variant={filterStatus === 'SHIPPED' ? 'filled' : 'outlined'}
                clickable
              />
              <Chip 
                label="Delivered"
                size="small"
                onClick={() => setFilterStatus('DELIVERED')}
                color={filterStatus === 'DELIVERED' ? 'primary' : 'default'}
                variant={filterStatus === 'DELIVERED' ? 'filled' : 'outlined'}
                clickable
              />
              <Chip 
                label="Cancelled"
                size="small"
                onClick={() => setFilterStatus('CANCELLED')}
                color={filterStatus === 'CANCELLED' ? 'primary' : 'default'}
                variant={filterStatus === 'CANCELLED' ? 'filled' : 'outlined'}
                clickable
              />
            </Box>
          </Box>

          {ordersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : orders && orders.length > 0 ? (
            <List>
              {getFilteredAndSortedOrders().map((order) => (
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
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Total: ₹{order.totalPrice?.toLocaleString('en-IN')}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {order.status?.toUpperCase() !== 'DELIVERED' && order.status?.toUpperCase() !== 'CANCELLED' && (
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => handleOrderAction(order._id, 'cancel')}
                            sx={{ borderRadius: 1 }}
                          >
                            Cancel Order
                          </Button>
                        )}
                        
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOrderAction(order._id, 'reorder')}
                          sx={{ borderRadius: 1 }}
                        >
                          Reorder
                        </Button>
                        
                        {order.deliveryInfo?.trackingNumber && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<LocalShipping />}
                            onClick={() => window.open(`https://track.delhivery.com/${order.deliveryInfo.trackingNumber}`, '_blank')}
                            sx={{ borderRadius: 1 }}
                          >
                            Track
                          </Button>
                        )}
                      </Box>
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
