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
  Chip
} from '@mui/material';
import {
  ShoppingCart,
  Add,
  Remove,
  Delete,
  ArrowBack,
  CreditCard,
  FlashOn,
  Verified,
  Security,
  LocalShipping
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    items, 
    loading, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    getRecommendations
  } = useCart();
  
  const [cartRecommendations, setCartRecommendations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const fetchCartSummary = React.useCallback(async () => {
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
  }, [items]);

  const fetchCartRecommendations = React.useCallback(async () => {
    try {
      setLoadingRecommendations(true);
      const recommendations = await getRecommendations();
      setCartRecommendations(recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [getRecommendations]);

  useEffect(() => {
    fetchCartSummary();
    if (items.length > 0) {
      fetchCartRecommendations();
    }
  }, [items, fetchCartRecommendations, fetchCartSummary]);

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
        <Typography variant="h4" gutterBottom fontWeight="bold" color="#333">
          Shopping Cart
        </Typography>
        <Typography variant="body1" color="#666">
          Review your items and proceed to checkout
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid size={{ xs: 12, md: 8 }}>
          {items.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
              <ShoppingCart sx={{ fontSize: 80, color: '#1a73e8', mb: 3 }} />
              <Typography variant="h5" gutterBottom fontWeight="bold" color="#333">
                Your cart is empty
              </Typography>
              <Typography variant="body1" color="#666" gutterBottom sx={{ mb: 3 }}>
                Add some amazing products to get started!
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<FlashOn />}
                onClick={() => navigate('/products')}
                sx={{
                  backgroundColor: '#1a73e8',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#1557b0',
                    boxShadow: '0 4px 12px rgba(26, 115, 232, 0.3)'
                  }
                }}
              >
                Start Shopping
              </Button>
            </Paper>
          ) : (
            <Box>
              {items.map((item) => (
                <Card key={item.product._id} sx={{ mb: 2, border: '1px solid #e8e8e8', borderRadius: 2, '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <CardMedia
                          component="img"
                          height="100"
                          image={item.product.images?.[0] || 'https://via.placeholder.com/100x100/f5f5f5/999999?text=No+Image'}
                          alt={item.product.name}
                          sx={{
                            borderRadius: 2,
                            cursor: 'pointer',
                            border: '1px solid #e8e8e8',
                            objectFit: 'cover',
                            '&:hover': { borderColor: '#1a73e8' }
                          }}
                          onClick={() => navigate(`/products/${item.product._id}`)}
                        />
                      </Grid>
                      
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            cursor: 'pointer',
                            fontWeight: 600,
                            '&:hover': { color: '#1a73e8' },
                            mb: 1,
                            fontSize: '1rem'
                          }}
                          onClick={() => navigate(`/products/${item.product._id}`)}
                        >
                          {item.product.name}
                        </Typography>
                        <Typography variant="body2" color="#666" sx={{ mb: 0.5, fontSize: '0.85rem', fontWeight: 500 }}>
                          {item.product.brand}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {item.product.stock > 0 ? (
                            <>
                              <Verified fontSize="small" sx={{ color: '#4CAF50' }} />
                              <Typography variant="caption" color="#4CAF50" sx={{ fontSize: '0.8rem' }}>
                                In Stock ({item.product.stock} available)
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="caption" color="#ff4757" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                              Out of Stock
                            </Typography>
                          )}
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="h6" color="#1a73e8" fontWeight="bold" sx={{ fontSize: '1.25rem' }}>
                            ₹{item.product.price.toLocaleString('en-IN')}
                          </Typography>
                          {(item.product.originalPrice || item.product.initialPrice) && (item.product.originalPrice || item.product.initialPrice) > item.product.price && (
                            <>
                              <Typography
                                variant="body2"
                                color="#9e9e9e"
                                sx={{
                                  textDecoration: 'line-through',
                                  fontSize: '0.9rem',
                                  fontWeight: 500
                                }}
                              >
                                ₹{(item.product.originalPrice || item.product.initialPrice).toLocaleString('en-IN')}
                              </Typography>
                              <Chip
                                label={`${Math.round(((item.product.originalPrice || item.product.initialPrice) - item.product.price) / (item.product.originalPrice || item.product.initialPrice) * 100)}% OFF`}
                                size="small"
                                sx={{
                                  backgroundColor: '#ff4757',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '0.7rem',
                                  height: 20
                                }}
                              />
                            </>
                          )}
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.product._id, Math.max(1, (item.quantity || 1) - 1))}
                            disabled={(item.quantity || 1) <= 1}
                            sx={{
                              border: '1px solid #e0e0e0',
                              '&:hover': { borderColor: '#1a73e8', backgroundColor: '#f5f5f5' },
                              borderRadius: 1,
                              transition: 'all 0.2s'
                            }}
                          >
                            <Remove />
                          </IconButton>
                          <TextField
                            value={item.quantity || 1}
                            size="small"
                            sx={{
                              width: 50,
                              '& .MuiOutlinedInput-input': {
                                textAlign: 'center',
                                fontWeight: 'bold',
                                padding: '6px 2px',
                                fontSize: '0.95rem'
                              },
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                                '&:hover': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#1a73e8'
                                  }
                                }
                              }
                            }}
                            inputProps={{
                              min: 1,
                              max: item.product.stock,
                              readOnly: true
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.product._id, (item.quantity || 1) + 1)}
                            disabled={(item.quantity || 1) >= item.product.stock}
                            sx={{
                              border: '1px solid #e0e0e0',
                              '&:hover': { borderColor: '#1a73e8', backgroundColor: '#f5f5f5' },
                              borderRadius: 1,
                              transition: 'all 0.2s'
                            }}
                          >
                            <Add />
                          </IconButton>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 2 }}>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" color="#1a73e8" fontWeight="bold" sx={{ whiteSpace: 'nowrap', fontSize: '1.25rem' }}>
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </Typography>
                          <IconButton
                            size="small"
                            color="#ff4757"
                            onClick={() => handleRemoveItem(item.product._id)}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'rgba(255, 71, 87, 0.04)'
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
                    onClick={handleClearCart}
                    startIcon={<Delete />}
                    sx={{
                      borderColor: '#ff4757',
                      color: '#ff4757',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 71, 87, 0.04)',
                        borderColor: '#ff4757'
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
                      borderColor: '#1a73e8',
                      color: '#1a73e8',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(26, 115, 232, 0.04)',
                        borderColor: '#1a73e8'
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
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20, border: '1px solid #e8e8e8', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" color="#333" sx={{ mb: 3 }}>
              Order Summary
            </Typography>

            {summary && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="#666">Subtotal ({items.length} items)</Typography>
                  <Typography variant="body2" fontWeight="600" color="#333">₹{summary.subtotal.toLocaleString('en-IN')}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="#666">Tax (8%)</Typography>
                  <Typography variant="body2" fontWeight="600" color="#333">₹{summary.tax.toLocaleString('en-IN')}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocalShipping sx={{ mr: 1, fontSize: 16, color: '#1a73e8' }} />
                    <Typography variant="body2" color="#666">Shipping</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="600" color={summary.shipping === 0 ? '#4CAF50' : '#333'}>
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
                    <Typography variant="caption" color="#1976d2" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
                      <FlashOn sx={{ mr: 1, fontSize: 16 }} />
                      Add ₹{(5000 - summary.subtotal).toLocaleString('en-IN')} more for FREE shipping
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h5" fontWeight="bold" color="#333">Total</Typography>
                  <Typography variant="h5" color="#1a73e8" fontWeight="bold" sx={{ fontSize: '1.5rem' }}>
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
                backgroundColor: '#1a73e8',
                fontWeight: 600,
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: '#1557b0',
                  boxShadow: '0 4px 12px rgba(26, 115, 232, 0.3)'
                },
                '&:disabled': {
                  backgroundColor: '#e0e0e0',
                  color: '#757575'
                }
              }}
            >
              Proceed to Checkout
            </Button>

            {!isAuthenticated && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Security sx={{ fontSize: 16, color: '#757575' }} />
                <Typography variant="caption" color="#757575">
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
              border: '1px solid #e8e8e8'
            }}>
              <Security sx={{ fontSize: 18, color: '#4CAF50' }} />
              <Typography variant="caption" color="#4CAF50" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Secure Checkout
              </Typography>
              <Verified sx={{ fontSize: 18, color: '#4CAF50' }} />
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
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product._id}>
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
