import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Tabs,
  Tab,
  Alert,
  Typography
} from '@mui/material';
import {
  Person,
  LocationOn,
  Inventory2
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { orderAPI, authAPI } from '../utils/api';
import { commonStyles } from '../utils/styleTheme';
import {
  ProfileHeader,
  ProfileCard,
  AccountSettingsTab,
  AddressesTab,
  OrderHistoryTab
} from '../components/Profile';

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
  const [resetKey, setResetKey] = useState(0);
  

  const [addresses, setAddresses] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('order-date-desc');
  
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

  // Fetch user data and orders when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        username: user.username || user.name || '' // Use name as fallback for username
      });
      setAddresses(user.addresses || []);
      fetchOrders(); // Fetch orders on component mount
    }
  }, [user]);

  // Fetch orders when tab changes to orders (additional fetch to ensure fresh data)
  useEffect(() => {
    if (activeTab === 2 && user) { // Orders tab index
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
      // Send name and phone, ensure username is always present for backend validation
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        username: formData.username && formData.username.trim() !== '' 
          ? formData.username 
          : formData.name.replace(/\s+/g, '').toLowerCase() // Use name (without spaces, lowercase) as fallback
      };
      
      console.log('Submitting profile data:', updateData);
      const response = await updateUser(updateData);
      console.log('Profile update response:', response);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      
      // Increment resetKey to trigger form reset in AccountSettingsTab
      setResetKey(prev => prev + 1);
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
    <Box sx={{...commonStyles.pageContainer}}>
      <Container maxWidth="lg">
        {/* Professional Header */}
        <ProfileHeader />

        {/* Alert Messages */}
        {message && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              animation: 'slide-in 0.3s ease-out'
            }}
            onClose={() => setMessage('')}
          >
            {message}
          </Alert>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              animation: 'slide-in 0.3s ease-out'
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* Main Content Card */}
        <Paper 
          sx={{
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            background: 'white'
          }}
        >
          {/* Professional Tabs */}
          <Box sx={{ 
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            background: 'linear-gradient(to right, #fafbfc, #ffffff)'
          }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="profile tabs"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 60,
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  color: '#666',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#2196f3',
                    backgroundColor: 'rgba(33, 150, 243, 0.04)'
                  },
                  '&.Mui-selected': {
                    color: '#2196f3',
                    fontWeight: 600
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  background: 'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)'
                }
              }}
            >
              <Tab 
                label="Account Settings" 
                icon={<Person sx={{ fontSize: 20 }} />} 
                iconPosition="start"
              />
              <Tab 
                label="Addresses" 
                icon={<LocationOn sx={{ fontSize: 20 }} />} 
                iconPosition="start"
              />
              <Tab 
                label="Order History" 
                icon={<Inventory2 sx={{ fontSize: 20 }} />} 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ p: { xs: 3, md: 5 } }}>
            {/* Account Settings Tab */}
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                <Box sx={{ flex: { xs: '1', md: '0.4' }, minWidth: { xs: '100%', md: '300px' } }}>
                  <ProfileCard user={user} orders={orders} addresses={addresses} />
                </Box>
                <Box sx={{ flex: { xs: '1', md: '0.6' }, minWidth: { xs: '100%', md: '400px' } }}>
                  <AccountSettingsTab 
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleProfileUpdate}
                    loading={loading}
                    resetKey={resetKey}
                  />
                </Box>
              </Box>
            </TabPanel>

            {/* Addresses Tab */}
            <TabPanel value={activeTab} index={1}>
              <AddressesTab
                addresses={addresses}
                user={user}
                onAddClick={() => {
                  setEditingAddress(null);
                  setAddressForm({
                    name: user?.name || '',
                    phone: user?.phone || '',
                    address: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: 'India'
                  });
                  setAddressDialogOpen(true);
                }}
                onEditAddress={handleEditAddress}
                onDeleteAddress={handleDeleteAddress}
                onSetDefaultAddress={handleSetDefaultAddress}
                addressDialogOpen={addressDialogOpen}
                setAddressDialogOpen={setAddressDialogOpen}
                addressForm={addressForm}
                setAddressForm={setAddressForm}
                onAddressSubmit={handleAddressSubmit}
                editingAddress={editingAddress}
              />
            </TabPanel>

            {/* Order History Tab */}
            <TabPanel value={activeTab} index={2}>
              <OrderHistoryTab
                orders={orders}
                ordersLoading={ordersLoading}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOptions={sortOptions}
                getFilteredAndSortedOrders={getFilteredAndSortedOrders}
                onCancelOrder={(orderId) => handleOrderAction(orderId, 'cancel')}
                onReorder={(orderId) => handleOrderAction(orderId, 'reorder')}
                onTrack={(trackingNumber) => window.open(`https://track.delhivery.com/${trackingNumber}`, '_blank')}
              />
            </TabPanel>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile;
