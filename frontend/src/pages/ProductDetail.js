import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Rating,
  Chip,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Paper,
  Avatar
} from '@mui/material';
import {
  ShoppingCart,
  FavoriteBorder,
  Share,
  LocalOffer,
  TrendingUp,
  Verified,
  FlashOn,
  Star,
  ArrowBack,
  Add,
  Remove
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, aiAPI } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, addToHistory } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProduct(id);
      setProduct(response.data);

      // Fetch recommendations
      const recommendationsResponse = await productAPI.getRecommendations(id);
      setRecommendations(recommendationsResponse.data);

      // Fetch similar products
      const similarResponse = await aiAPI.getSimilar(id, { limit: 4 });
      setSimilarProducts(similarResponse.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProduct();
    if (isAuthenticated) {
      addToHistory(id);
    }
  }, [id, isAuthenticated, addToHistory, fetchProduct]);

  const handleAddToCart = async () => {
    try {
      for (let i = 0; i < quantity; i++) {
        await addToCart(product);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleBuyNow = async () => {
    try {
      // Add selected quantity and navigate to cart for checkout
      await addToCart(product, quantity);
      navigate('/cart');
    } catch (error) {
      console.error('Buy now failed:', error);
    }
  };

  const handleReviewSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setSubmittingReview(true);
      await productAPI.addReview(id, review);
      setReview({ rating: 5, comment: '' });
      fetchProduct(); // Refresh product to show new review
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
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

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          Product not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <IconButton 
          onClick={() => navigate('/products')} 
          sx={{ mr: 1 }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          Products / {product.category.charAt(0).toUpperCase() + product.category.slice(1)} / {product.name}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
              <CardMedia
                component="img"
                height="400"
                image={product.images?.[selectedImage] || 'https://via.placeholder.com/400x400/cccccc/666666?text=No+Image'}
                alt={product.name}
                sx={{ borderRadius: 1 }}
                onError={(e) => {
                  // Try next image in array or fallback
                  const imageArray = product.images || [];
                  const currentIndex = selectedImage;
                  
                  if (currentIndex < imageArray.length - 1) {
                    setSelectedImage(currentIndex + 1);
                  } else {
                    // Final fallback to placeholder
                    e.target.src = 'https://via.placeholder.com/400x400/cccccc/666666?text=No+Image';
                  }
                }}
              />
            </Paper>
            
            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', px: 1 }}>
                {product.images.map((image, index) => (
                  <Paper
                    key={index}
                    sx={{
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: selectedImage === index ? '2px solid #2874F0' : '1px solid #e0e0e0',
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}
                    onClick={() => setSelectedImage(index)}
                  >
                    <CardMedia
                      component="img"
                      height="80"
                      width="80"
                      image={image}
                      alt={`${product.name} ${index + 1}`}
                    />
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </Grid>

        {/* Product Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            {/* Product Title and Brand */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" gutterBottom fontWeight="bold" color="text.primary">
                {product.name}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {product.brand}
              </Typography>
            </Box>

            {/* Rating and Reviews */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating 
                value={product.rating} 
                precision={0.1} 
                readOnly 
                sx={{ color: '#FFB400' }}
              />
              <Typography variant="body2" sx={{ ml: 1, color: '#757575' }}>
                ({product.numReviews || 0} reviews)
              </Typography>
              {product.rating >= 4 && (
                <Chip
                  icon={<Verified fontSize="small" />}
                  label="Verified"
                  size="small"
                  sx={{ ml: 2, backgroundColor: '#4CAF50', color: 'white' }}
                />
              )}
            </Box>

            {/* Price Section */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4" color="#2874F0" fontWeight="bold">
                  ₹{product.price.toLocaleString('en-IN')}
                </Typography>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <Typography 
                      variant="h6" 
                      color="#757575"
                      sx={{ textDecoration: 'line-through' }}
                    >
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </Typography>
                    <Chip
                      label={`${Math.round((1 - product.price / product.originalPrice) * 100)}% OFF`}
                      size="small"
                      sx={{ backgroundColor: '#FF6B35', color: 'white', fontWeight: 'bold' }}
                    />
                  </>
                )}
              </Box>
              {product.discount > 0 && (
                <Chip
                  icon={<FlashOn />}
                  label={`Limited Time: ${product.discount}% OFF`}
                  sx={{ 
                    backgroundColor: '#FFE500', 
                    color: '#212121',
                    fontWeight: 'bold',
                    mb: 1
                  }}
                />
              )}
            </Box>

            {/* AI Score */}
            {product.aiScore && (
              <Chip
                icon={<TrendingUp />}
                label={`${Math.round(product.aiScore * 100)}% Match for You`}
                sx={{ 
                  mb: 2,
                  backgroundColor: '#2874F0',
                  color: 'white'
                }}
              />
            )}

            {/* Stock Status */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 'bold',
                  color: product.stock > 0 ? '#4CAF50' : '#F44336',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                {product.stock > 0 ? (
                  <>
                    <Verified fontSize="small" />
                    {product.stock} in stock - Ready to ship
                  </>
                ) : (
                  'Out of stock'
                )}
              </Typography>
            </Box>

            {/* Description */}
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              {product.description}
            </Typography>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Features
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {product.features.map((feature, index) => (
                    <Chip
                      key={index}
                      label={feature}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {product.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      color="secondary"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Quantity and Add to Cart */}
            {product.stock > 0 && (
              <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="body1" fontWeight="bold">
                    Quantity:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      sx={{ 
                        border: '1px solid #e0e0e0',
                        '&:hover': { borderColor: '#2874F0' }
                      }}
                    >
                      <Remove />
                    </IconButton>
                    <TextField
                      value={quantity}
                      size="small"
                      sx={{ 
                        width: 60, 
                        mx: 1,
                        '& .MuiOutlinedInput-input': {
                          textAlign: 'center',
                          fontWeight: 'bold'
                        }
                      }}
                      inputProps={{ readOnly: true }}
                    />
                    <IconButton
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      sx={{ 
                        border: '1px solid #e0e0e0',
                        '&:hover': { borderColor: '#2874F0' }
                      }}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingCart />}
                    onClick={handleAddToCart}
                    sx={{ 
                      flexGrow: 1,
                      backgroundColor: '#FF6B35',
                      fontWeight: 'bold',
                      py: 1.5,
                      '&:hover': { 
                        backgroundColor: '#E55A2B',
                        boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
                      }
                    }}
                  >
                    Add to Cart
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleBuyNow}
                    sx={{
                      ml: 1,
                      textTransform: 'none'
                    }}
                    disabled={product.stock === 0}
                  >
                    Buy Now
                  </Button>
                  
                  <IconButton 
                    sx={{ 
                      border: '1px solid #e0e0e0',
                      '&:hover': { 
                        borderColor: '#FF6B35',
                        color: '#FF6B35'
                      }
                    }}
                  >
                    <FavoriteBorder />
                  </IconButton>
                  
                  <IconButton 
                    sx={{ 
                      border: '1px solid #e0e0e0',
                      '&:hover': { 
                        borderColor: '#2874F0',
                        color: '#2874F0'
                      }
                    }}
                  >
                    <Share />
                  </IconButton>
                </Box>
              </Paper>
            )}

            {/* Category */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalOffer color="action" />
              <Typography variant="body2">
                Category: {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Reviews Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Customer Reviews
        </Typography>

        {/* Add Review Form */}
        {isAuthenticated && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Write a Review
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating
                value={review.rating}
                onChange={(e, newValue) => setReview({ ...review, rating: newValue })}
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Your rating
              </Typography>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Your review"
              value={review.comment}
              onChange={(e) => setReview({ ...review, comment: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleReviewSubmit}
              disabled={!review.comment.trim() || submittingReview}
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </Paper>
        )}

        {/* Reviews List */}
        {product.reviews && product.reviews.length > 0 ? (
          <List>
            {product.reviews.map((review, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <Avatar sx={{ mr: 2 }}>
                    {review.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          {review.name}
                        </Typography>
                        <Rating value={review.rating} size="small" readOnly />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {review.comment}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < product.reviews.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No reviews yet. Be the first to review this product!
          </Typography>
        )}
      </Box>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Recommended for You
          </Typography>
          <Grid container spacing={3}>
            {recommendations.slice(0, 4).map((product) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product._id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  <CardMedia
                    component="img"
                    height="150"
                    image={product.images?.[0] || '/placeholder-product.jpg'}
                    alt={product.name}
                  />
                  <CardContent>
                    <Typography variant="h6" noWrap>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.brand}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ₹{product.price.toLocaleString('en-IN')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Similar Products
          </Typography>
          <Grid container spacing={3}>
            {similarProducts.map((product) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product._id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  <CardMedia
                    component="img"
                    height="150"
                    image={product.images?.[0] || '/placeholder-product.jpg'}
                    alt={product.name}
                  />
                  <CardContent>
                    <Typography variant="h6" noWrap>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.brand}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ₹{product.price.toLocaleString('en-IN')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default ProductDetail;
