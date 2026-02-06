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
  LocalOffer
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
      const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
      
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/products')}
          sx={{ mr: 2 }}
        >
          Continue Shopping
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Shopping Cart
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          {items.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Your cart is empty
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Add some products to get started!
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/products')}
                sx={{ mt: 2 }}
              >
                Start Shopping
              </Button>
            </Paper>
          ) : (
            <Box>
              {items.map((item) => (
                <Card key={item.product._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={2}>
                        <CardMedia
                          component="img"
                          height="80"
                          image={item.product.images?.[0] || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          sx={{ borderRadius: 1, cursor: 'pointer' }}
                          onClick={() => navigate(`/products/${item.product._id}`)}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <Typography
                          variant="h6"
                          sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                          onClick={() => navigate(`/products/${item.product._id}`)}
                        >
                          {item.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.product.brand}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Stock: {item.product.stock}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={2}>
                        <Typography variant="h6" color="primary">
                          ${item.product.price.toFixed(2)}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Remove />
                          </IconButton>
                          <TextField
                            value={item.quantity}
                            size="small"
                            sx={{ width: 60 }}
                            inputProps={{ 
                              style: { textAlign: 'center' },
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
                          >
                            <Add />
                          </IconButton>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={1}>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" color="primary">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(item.product._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate('/products')}
                >
                  Continue Shopping
                </Button>
              </Box>
            </Box>
          )}
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Order Summary
            </Typography>
            
            {summary && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">${summary.subtotal.toFixed(2)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Tax (8%)</Typography>
                  <Typography variant="body2">${summary.tax.toFixed(2)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Shipping</Typography>
                  <Typography variant="body2">
                    {summary.shipping === 0 ? 'FREE' : `$${summary.shipping.toFixed(2)}`}
                  </Typography>
                </Box>
                
                {summary.shipping > 0 && (
                  <Typography variant="caption" color="success.main" sx={{ mb: 2, display: 'block' }}>
                    Add ${(100 - summary.subtotal).toFixed(2)} more for FREE shipping
                  </Typography>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">Total</Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    ${summary.total.toFixed(2)}
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
              sx={{ mb: 2 }}
            >
              Proceed to Checkout
            </Button>

            {!isAuthenticated && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                Login required to checkout
              </Typography>
            )}
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
                          ${product.price.toFixed(2)}
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
