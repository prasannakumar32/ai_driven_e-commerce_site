import React, { useState, useEffect } from 'react';
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
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Person, ShoppingBag, History, Settings } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateUser, updatePreferences, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  
  const [preferences, setPreferences] = useState({
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 1000 }
  });
  
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
      setPreferences(user.preferences || {
        categories: [],
        brands: [],
        priceRange: { min: 0, max: 1000 }
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateUser(formData);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile');
    }
  };

  const handlePreferencesUpdate = async () => {
    try {
      await updatePreferences(preferences);
      setMessage('Preferences updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update preferences');
    }
  };

  const categories = [
    'electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys'
  ];

  const brands = [
    'Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'Microsoft', 'Dell'
  ];

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
        My Profile
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                {user.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6">{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <List component="nav">
              <ListItem 
                button 
                selected={activeTab === 'profile'}
                onClick={() => setActiveTab('profile')}
              >
                <Person sx={{ mr: 2 }} />
                <ListItemText primary="Profile Info" />
              </ListItem>
              <ListItem 
                button 
                selected={activeTab === 'preferences'}
                onClick={() => setActiveTab('preferences')}
              >
                <Settings sx={{ mr: 2 }} />
                <ListItemText primary="Preferences" />
              </ListItem>
              <ListItem 
                button 
                selected={activeTab === 'history'}
                onClick={() => setActiveTab('history')}
              >
                <History sx={{ mr: 2 }} />
                <ListItemText primary="Browsing History" />
              </ListItem>
              <ListItem 
                button 
                selected={activeTab === 'orders'}
                onClick={() => setActiveTab('orders')}
              >
                <ShoppingBag sx={{ mr: 2 }} />
                <ListItemText primary="Order History" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {activeTab === 'profile' && (
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Profile Information
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
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Update Profile'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}

          {activeTab === 'preferences' && (
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
              >
                {loading ? <CircularProgress size={20} /> : 'Save Preferences'}
              </Button>
            </Paper>
          )}

          {activeTab === 'history' && (
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Browsing History
              </Typography>
              
              {user.browsingHistory && user.browsingHistory.length > 0 ? (
                <List>
                  {user.browsingHistory.slice(0, 10).map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={item.product?.name || 'Product not found'}
                        secondary={`Viewed on ${new Date(item.timestamp).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No browsing history yet. Start exploring products!
                </Typography>
              )}
            </Paper>
          )}

          {activeTab === 'orders' && (
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Order History
              </Typography>
              
              {user.purchaseHistory && user.purchaseHistory.length > 0 ? (
                <List>
                  {user.purchaseHistory.map((order, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Order #{order._id?.slice(-8)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Date: {new Date(order.timestamp).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total: ${order.products?.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No orders yet. Start shopping!
                </Typography>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
