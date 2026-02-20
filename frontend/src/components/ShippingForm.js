import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Radio,
  FormControlLabel
} from '@mui/material';
import {
  LocationOn,
  Edit,
  Delete,
  Add,
  CheckCircle,
  Star,
  StarOutline,
  ArrowBack,
  Home,
  Place
} from '@mui/icons-material';
import api from '../utils/api';

const ShippingForm = ({ 
  onSubmit, 
  initialData = null, 
  isLoading = false,
  savedAddresses = [],
  onAddressesUpdate = null
}) => {
  // State for address list and selection
  const [userAddresses, setUserAddresses] = useState(savedAddresses || []);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'add', 'edit'
  const [editingAddressId, setEditingAddressId] = useState(null);

  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const [errors, setErrors] = useState({});
  const [savingAddress, setSavingAddress] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, addressId: null });

  // Initialize default selected address
  useEffect(() => {
    setUserAddresses(savedAddresses || []);
    if (savedAddresses && savedAddresses.length > 0) {
      // Set first address as default, or the marked default address
      const defaultAddr = savedAddresses.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
        // Auto-submit default address after a short delay
        setTimeout(() => {
          handleSubmitSelectedAddressWithId(defaultAddr._id);
        }, 100);
      } else {
        setSelectedAddressId(savedAddresses[0]._id);
      }
    }
  }, [savedAddresses]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'PIN code is required';
    } else if (!/^[0-9]{6}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'PIN code must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleEditAddress = (address) => {
    setFormData({
      name: address.name,
      phone: address.phone,
      email: address.email || '',
      address: address.address,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || 'India'
    });
    setEditingAddressId(address._id);
    setViewMode('edit');
  };

  const handleAddNewAddress = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    });
    setEditingAddressId(null);
    setErrors({});
    setViewMode('add');
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSavingAddress(true);
    try {
      let updatedAddresses = [...userAddresses];
      
      if (editingAddressId) {
        // Update existing address
        await api.put(`/auth/addresses/${editingAddressId}`, formData);
        updatedAddresses = updatedAddresses.map(addr => 
          addr._id === editingAddressId ? { ...addr, ...formData, _id: editingAddressId } : addr
        );
      } else {
        // Add new address
        const response = await api.post('/auth/addresses', formData);
        updatedAddresses = [...updatedAddresses, response.data];
        setSelectedAddressId(response.data._id); // Auto-select newly added address
      }

      setUserAddresses(updatedAddresses);
      setEditingAddressId(null);
      setViewMode('list');
      setErrors({});

      // Notify parent component of address changes
      if (onAddressesUpdate) {
        onAddressesUpdate(updatedAddresses);
      }
    } catch (err) {
      console.error('Error saving address:', err);
      alert('Failed to save address. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await api.delete(`/auth/addresses/${addressId}`);
      const updatedAddresses = userAddresses.filter(addr => addr._id !== addressId);
      setUserAddresses(updatedAddresses);
      
      // If deleted address was selected, select another one
      if (selectedAddressId === addressId) {
        if (updatedAddresses.length > 0) {
          setSelectedAddressId(updatedAddresses[0]._id);
        } else {
          setSelectedAddressId(null);
        }
      }

      if (onAddressesUpdate) {
        onAddressesUpdate(updatedAddresses);
      }
    } catch (err) {
      console.error('Error deleting address:', err);
      alert('Failed to delete address. Please try again.');
    } finally {
      setDeleteConfirmDialog({ open: false, addressId: null });
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await api.put(`/auth/addresses/${addressId}/set-default`);
      const updatedAddresses = userAddresses.map(addr => ({
        ...addr,
        isDefault: addr._id === addressId
      }));
      setUserAddresses(updatedAddresses);

      if (onAddressesUpdate) {
        onAddressesUpdate(updatedAddresses);
      }
    } catch (err) {
      console.error('Error setting default address:', err);
      alert('Failed to set default address. Please try again.');
    }
  };

  // Submit selected address with specific ID (for auto-submit of default)
  const handleSubmitSelectedAddressWithId = (addressId) => {
    if (!addressId) return;

    const selectedAddress = userAddresses.find(addr => addr._id === addressId);
    if (selectedAddress) {
      const submitData = {
        name: selectedAddress.name,
        phone: selectedAddress.phone,
        email: selectedAddress.email || '',
        address: selectedAddress.address,
        city: selectedAddress.city,
        state: selectedAddress.state,
        postalCode: selectedAddress.postalCode,
        country: selectedAddress.country || 'India',
      };
      onSubmit(submitData);
    }
  };

  // Submit selected address (Amazon style)
  const handleSubmitSelectedAddress = (e) => {
    e?.preventDefault?.();

    if (!selectedAddressId) {
      alert('Please select an address');
      return;
    }

    handleSubmitSelectedAddressWithId(selectedAddressId);
  };

  // Submit new address form
  const handleSubmitNewAddress = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Box>
      {/* LIST VIEW: Show saved addresses (Amazon Style) */}
      {viewMode === 'list' && userAddresses.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <LocationOn sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                Select Delivery Address
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Choose where you'd like your items delivered
              </Typography>
            </Box>
          </Box>

          {/* Saved Addresses Grid - Sort with default first */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {userAddresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)).map((address) => (
              <Grid item xs={12} key={address._id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedAddressId === address._id ? '2.5px solid' : '1.5px solid',
                    borderColor: selectedAddressId === address._id ? 'primary.main' : '#e0e0e0',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    backgroundColor: selectedAddressId === address._id ? '#fff' : '#fafafa',
                    boxShadow: selectedAddressId === address._id 
                      ? '0 4px 12px rgba(33, 150, 243, 0.15)' 
                      : '0 1px 3px rgba(0,0,0,0.08)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                      borderColor: selectedAddressId === address._id ? 'primary.main' : '#bdbdbd',
                      backgroundColor: selectedAddressId === address._id ? '#fff' : '#f5f5f5'
                    },
                    position: 'relative',
                    overflow: 'visible'
                  }}
                  onClick={() => setSelectedAddressId(address._id)}
                >
                  {/* Default Address Badge */}
                  {address.isDefault && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -12,
                        right: 20,
                        backgroundColor: '#FFB81C',
                        color: '#232F3E',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Star sx={{ fontSize: 14 }} />
                      DEFAULT
                    </Box>
                  )}

                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="flex-start">
                      {/* Radio Button */}
                      <Grid item xs="auto">
                        <Radio
                          checked={selectedAddressId === address._id}
                          onChange={() => setSelectedAddressId(address._id)}
                          sx={{
                            '&.Mui-checked': {
                              color: 'primary.main'
                            }
                          }}
                        />
                      </Grid>

                      {/* Address Details */}
                      <Grid item xs={12} sm="auto" sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          fontWeight="700" 
                          color="text.primary"
                          sx={{ mb: 1, fontSize: '1rem' }}
                        >
                          {address.name}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.75 }}>
                          <LocationOn sx={{ fontSize: 18, color: 'text.secondary', mt: 0.25, flexShrink: 0 }} />
                          <Box>
                            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                              {address.address}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {address.city}, {address.state} {address.postalCode}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Phone:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {address.phone}
                          </Typography>
                        </Box>

                        {address.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Email:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {address.email}
                            </Typography>
                          </Box>
                        )}
                      </Grid>

                      {/* Action Buttons */}
                      <Grid item xs={12} sm="auto" sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="Edit Address">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address);
                            }}
                            sx={{
                              bgcolor: 'transparent',
                              color: 'primary.main',
                              '&:hover': { bgcolor: 'primary.lighter' }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {!address.isDefault && (
                          <Tooltip title="Set as Default">
                            <IconButton
                              size="small"
                              color="default"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetDefault(address._id);
                              }}
                              sx={{
                                '&:hover': { bgcolor: 'warning.lighter', color: 'warning.main' }
                              }}
                            >
                              <StarOutline fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete Address">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmDialog({ open: true, addressId: address._id });
                            }}
                            sx={{
                              '&:hover': { bgcolor: 'error.lighter' }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Add New Address Button */}
          <Button
            startIcon={<Add />}
            onClick={handleAddNewAddress}
            variant="outlined"
            color="primary"
            fullWidth
            sx={{
              py: 1.5,
              mb: 2,
              fontSize: '1rem',
              fontWeight: 600,
              borderColor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.lighter',
                borderColor: 'primary.main'
              }
            }}
          >
            + Add New Address
          </Button>

          {/* Continue Button */}
          <Button
            onClick={handleSubmitSelectedAddress}
            disabled={!selectedAddressId || isLoading}
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              py: 1.75,
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: 0.5
            }}
          >
            {isLoading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
            {isLoading ? 'Processing...' : '→ Continue to Payment'}
          </Button>
        </Paper>
      )}

      {/* ADD/EDIT ADDRESS FORM VIEW */}
      {(viewMode === 'add' || viewMode === 'edit') && (
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          {/* Back Button */}
          {userAddresses.length > 0 && (
            <Button
              variant="text"
              startIcon={<ArrowBack />}
              onClick={() => setViewMode('list')}
              sx={{ mb: 2, pl: 0, color: 'primary.main' }}
            >
              Back to Addresses
            </Button>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Place sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              {viewMode === 'edit' ? '✏️ Edit Address' : '➕ Add New Address'}
            </Typography>
          </Box>

          <Box component="form" onSubmit={viewMode === 'edit' ? handleSaveAddress : handleSubmitNewAddress}>
            <Grid container spacing={2}>
              {/* Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  placeholder="John Doe"
                  variant="outlined"
                  size="medium"
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  placeholder="9876543210"
                  variant="outlined"
                  size="medium"
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  placeholder="john@example.com"
                  variant="outlined"
                  size="medium"
                />
              </Grid>

              {/* Country (read-only) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  disabled
                  variant="outlined"
                  size="medium"
                />
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  helperText={errors.address}
                  placeholder="123 Main Street, Apt 4B"
                  multiline
                  rows={2}
                  variant="outlined"
                  size="medium"
                />
              </Grid>

              {/* City */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={!!errors.city}
                  helperText={errors.city}
                  placeholder="Mumbai"
                  variant="outlined"
                  size="medium"
                />
              </Grid>

              {/* State */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State/Province"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  error={!!errors.state}
                  helperText={errors.state}
                  placeholder="Maharashtra"
                  variant="outlined"
                  size="medium"
                />
              </Grid>

              {/* PIN Code */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PIN Code"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  error={!!errors.postalCode}
                  helperText={errors.postalCode}
                  placeholder="400001"
                  variant="outlined"
                  size="medium"
                />
              </Grid>
            </Grid>

            {/* Form Action Buttons */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              {userAddresses.length > 0 && viewMode === 'add' && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setViewMode('list')}
                  sx={{ px: 3, py: 1.2 }}
                >
                  Cancel
                </Button>
              )}
              {viewMode === 'edit' && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    setViewMode('list');
                    setEditingAddressId(null);
                  }}
                  sx={{ px: 3, py: 1.2 }}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={savingAddress || (viewMode === 'add' && isLoading)}
                sx={{
                  px: 4,
                  py: 1.2,
                  fontWeight: 700,
                  minWidth: 180
                }}
              >
                {savingAddress ? (
                  <><CircularProgress size={20} sx={{ mr: 1 }} /> Saving...</>
                ) : viewMode === 'edit' ? (
                  '💾 Update Address'
                ) : (
                  '✓ Save & Continue'
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* NO ADDRESSES VIEW: Show form only */}
      {viewMode === 'list' && userAddresses.length === 0 && (
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <LocationOn sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              Add Your Delivery Address
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmitNewAddress}>
            <Grid container spacing={2}>
              {/* Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  placeholder="John Doe"
                  variant="outlined"
                  size="medium"
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  placeholder="9876543210"
                  variant="outlined"
                  size="medium"
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  placeholder="john@example.com"
                  variant="outlined"
                  size="medium"
                />
              </Grid>

              {/* Country (read-only) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  disabled
                  variant="outlined"
                  size="medium"
                />
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  helperText={errors.address}
                  placeholder="123 Main Street, Apt 4B"
                  multiline
                  rows={2}
                  variant="outlined"
                  size="medium"
                />
              </Grid>

              {/* City */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={!!errors.city}
                  helperText={errors.city}
                  placeholder="Mumbai"
                  variant="outlined"
                  size="medium"
                />
              </Grid>

              {/* State */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State/Province"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  error={!!errors.state}
                  helperText={errors.state}
                  placeholder="Maharashtra"
                  variant="outlined"
                  size="medium"
                />
              </Grid>

              {/* PIN Code */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PIN Code"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  error={!!errors.postalCode}
                  helperText={errors.postalCode}
                  placeholder="400001"
                  variant="outlined"
                  size="medium"
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              fullWidth
              sx={{ py: 1.75, mt: 3, fontWeight: 700 }}
            >
              {isLoading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
              {isLoading ? 'Processing...' : '✓ Continue with This Address'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog.open}
        onClose={() => setDeleteConfirmDialog({ open: false, addressId: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main', fontSize: '1.25rem' }}>
          🗑️ Delete Address?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Are you sure you want to delete this address? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteConfirmDialog({ open: false, addressId: null })}
            variant="outlined"
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteAddress(deleteConfirmDialog.addressId)}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShippingForm;
