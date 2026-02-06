import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Button,
  IconButton,
  TextField,
  Grid,
  Divider,
  Paper,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import {
  ShoppingCart,
  Add,
  Remove,
  Delete,
  ArrowBack,
  CreditCard,
  LocalOffer,
  FlashOn,
  Verified,
  Security,
  LocalShipping,
  Redeem
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    items, 
    total, 
    loading, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    getRecommendations,
    fetchCart 
  } = useCart();
  
  const [cartRecommendations, setCartRecommendations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    fetchCartSummary();
    if (items.length > 0) {
      fetchCartRecommendations();
    }
  }, [items]);

  const fetchCartSummary = async () => {
    try {
      // For now, calculate summary locally
      const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const tax = subtotal * 0.08; // 8% tax
      const shipping = subtotal > 5000 ? 0 : 100; // Free shipping over ₹5000
      
      setSummary({
        subtotal,
        tax,
        shipping,
        total: subtotal + tax + shipping
      });
    } catch (error) {
      console.error('Error fetching cart summary:', error);
    }
  };

  const fetchCartRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      const recommendations = await getRecommendations();
      setCartRecommendations(recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  const handleAddRecommendation = async (product) => {
    try {
      // This would use the cart context's addToCart function
      // For now, just navigate to product detail
      navigate(`/products/${product._id}`);
    } catch (error) {
      console.error('Error adding recommended product:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="text.primary">
          PKS Shopping Cart
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review your items and proceed to checkout
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          {items.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
              <ShoppingCart sx={{ fontSize: 80, color: '#2874F0', mb: 3 }} />
              <Typography variant="h5" gutterBottom fontWeight="bold" color="text.primary">
                Your cart is empty
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                Add some amazing products to get started!
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<FlashOn />}
                onClick={() => navigate('/products')}
                sx={{ 
                  backgroundColor: '#FF6B35',
                  '&:hover': { backgroundColor: '#E55A2B' },
                  px: 4,
                  py: 1.5
                }}
              >
                Start Shopping
              </Button>
            </Paper>
          ) : (
            <Box>
              {items.map((item) => (
                <Card key={item.product._id} sx={{ mb: 2, border: '1px solid #e0e0e0', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={2}>
                        <CardMedia
                          component="img"
                          height="80"
                          image={item.product.images?.[0] || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          sx={{ 
                            borderRadius: 2, 
                            cursor: 'pointer',
                            border: '1px solid #e0e0e0',
                            '&:hover': { borderColor: '#2874F0' }
                          }}
                          onClick={() => navigate(`/products/${item.product._id}`)}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <Typography
                          variant="h6"
                          sx={{ 
                            cursor: 'pointer', 
                            fontWeight: 500,
                            '&:hover': { color: '#2874F0' },
                            mb: 1
                          }}
                          onClick={() => navigate(`/products/${item.product._id}`)}
                        >
                          {item.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {item.product.brand}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {item.product.stock > 0 ? (
                            <>
                              <Verified fontSize="small" sx={{ color: '#4CAF50' }} />
                              <Typography variant="caption" color="#4CAF50">
                                In Stock ({item.product.stock} available)
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="caption" color="error">
                              Out of Stock
                            </Typography>
                          )}
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={2}>
                        <Typography variant="h6" color="#2874F0" fontWeight="bold">
                          ₹{item.product.price.toLocaleString('en-IN')}
                        </Typography>
                        {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                          <Typography 
                            variant="body2" 
                            color="#757575"
                            sx={{ textDecoration: 'line-through' }}
                          >
                            ₹{item.product.originalPrice.toLocaleString('en-IN')}
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            sx={{ 
                              border: '1px solid #e0e0e0',
                              '&:hover': { borderColor: '#2874F0' }
                            }}
                          >
                            <Remove />
                          </IconButton>
                          <TextField
                            value={item.quantity}
                            size="small"
                            sx={{ 
                              width: 60,
                              '& .MuiOutlinedInput-input': {
                                textAlign: 'center',
                                fontWeight: 'bold'
                              }
                            }}
                            inputProps={{ 
                              min: 1,
                              max: item.product.stock
                            }}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              if (value >= 1 && value <= item.product.stock) {
                                handleQuantityChange(item.product._id, value);
                              }
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            sx={{ 
                              border: '1px solid #e0e0e0',
                              '&:hover': { borderColor: '#2874F0' }
                            }}
                          >
                            <Add />
                          </IconButton>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={1}>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" color="#2874F0" fontWeight="bold">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(item.product._id)}
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: 'rgba(244, 67, 54, 0.1)'
                              }
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}

              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleClearCart}
                    startIcon={<Delete />}
                    sx={{ 
                      borderColor: '#F44336',
                      color: '#F44336',
                      '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 0.1)'
                      }
                    }}
                  >
                    Clear Cart
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/products')}
                    sx={{ 
                      borderColor: '#2874F0',
                      color: '#2874F0',
                      '&:hover': {
                        backgroundColor: 'rgba(40, 116, 240, 0.1)'
                      }
                    }}
                  >
                    Continue Shopping
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" color="text.primary">
              Order Summary
            </Typography>
            
            {summary && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Subtotal ({items.length} items)</Typography>
                  <Typography variant="body2" fontWeight="bold">₹{summary.subtotal.toLocaleString('en-IN')}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Tax (8%)</Typography>
                  <Typography variant="body2" fontWeight="bold">₹{summary.tax.toLocaleString('en-IN')}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocalShipping sx={{ mr: 1, fontSize: 16, color: '#2874F0' }} />
                    <Typography variant="body2" color="text.secondary">Shipping</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold" color={summary.shipping === 0 ? '#4CAF50' : 'text.primary'}>
                    {summary.shipping === 0 ? 'FREE' : `₹${summary.shipping.toLocaleString('en-IN')}`}
                  </Typography>
                </Box>
                
                {summary.shipping > 0 && (
                  <Box sx={{ 
                    mb: 2, 
                    p: 1.5, 
                    backgroundColor: '#e3f2fd',
                    borderRadius: 1,
                    border: '1px solid #bbdefb'
                  }}>
                    <Typography variant="caption" color="#1976d2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <FlashOn sx={{ mr: 1, fontSize: 16 }} />
                      Add ₹{(5000 - summary.subtotal).toLocaleString('en-IN')} more for FREE shipping
                    </Typography>
                  </Box>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">Total</Typography>
                  <Typography variant="h6" color="#2874F0" fontWeight="bold">
                    ₹{summary.total.toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Box>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<CreditCard />}
              onClick={handleCheckout}
              disabled={items.length === 0}
              sx={{ 
                mb: 2,
                backgroundColor: '#FF6B35',
                fontWeight: 'bold',
                py: 1.5,
                '&:hover': { 
                  backgroundColor: '#E55A2B',
                  boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
                }
              }}
            >
              Proceed to Checkout
            </Button>

            {!isAuthenticated && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Security sx={{ fontSize: 16, color: '#757575' }} />
                <Typography variant="caption" color="text.secondary">
                  Login required to checkout
                </Typography>
              </Box>
            )}

            {/* Security Badge */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 1,
              p: 1,
              backgroundColor: '#f8f9fa',
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}>
              <Security sx={{ fontSize: 16, color: '#4CAF50' }} />
              <Typography variant="caption" color="#4CAF50">
                Secure Checkout
              </Typography>
              <Verified sx={{ fontSize: 16, color: '#4CAF50' }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recommendations */}
      {cartRecommendations.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Frequently Bought Together
          </Typography>
          
          {loadingRecommendations ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {cartRecommendations.slice(0, 4).map((product) => (
                <Grid item xs={12} sm={6} md={3} key={product._id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="150"
                      image={product.images?.[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      onClick={() => navigate(`/products/${product._id}`)}
                    />
                    <CardContent>
                      <Typography variant="h6" noWrap>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.brand}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="h6" color="primary">
                          ₹{product.price.toLocaleString('en-IN')}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => handleAddRecommendation(product)}
                        >
                          Add
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Container>
  );
};

export default Cart;
