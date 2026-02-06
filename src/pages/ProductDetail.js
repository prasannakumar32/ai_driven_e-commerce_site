import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
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
  Star,
  LocalOffer,
  TrendingUp
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, aiAPI } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user, addToHistory } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
    if (isAuthenticated) {
      addToHistory(id);
    }
  }, [id]);

  const fetchProduct = async () => {
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
  };

  const handleAddToCart = async () => {
    try {
      for (let i = 0; i < quantity; i++) {
        await addToCart(product);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
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
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Box>
            <CardMedia
              component="img"
              height="400"
              image={product.images?.[selectedImage] || '/placeholder-product.jpg'}
              alt={product.name}
              sx={{ borderRadius: 2, mb: 2 }}
            />
            
            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
                {product.images.map((image, index) => (
                  <CardMedia
                    key={index}
                    component="img"
                    height="80"
                    width="80"
                    image={image}
                    alt={`${product.name} ${index + 1}`}
                    sx={{
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: selectedImage === index ? '2px solid primary.main' : 'none',
                      flexShrink: 0
                    }}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {product.name}
            </Typography>
            
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {product.brand}
            </Typography>

            {/* Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={product.rating} precision={0.1} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                ({product.numReviews || 0} reviews)
              </Typography>
            </Box>

            {/* Price */}
            <Typography variant="h4" color="primary" gutterBottom fontWeight="bold">
              ${product.price.toFixed(2)}
            </Typography>

            {/* AI Score */}
            {product.aiScore && (
              <Chip
                icon={<TrendingUp />}
                label={`${Math.round(product.aiScore * 100)}% Match for You`}
                color="primary"
                sx={{ mb: 2 }}
              />
            )}

            {/* Stock Status */}
            <Typography variant="body2" color={product.stock > 0 ? 'success.main' : 'error.main'} gutterBottom>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </Typography>

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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <TextField
                    value={quantity}
                    size="small"
                    sx={{ width: 60, mx: 1 }}
                    inputProps={{ style: { textAlign: 'center' } }}
                    readOnly
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </Button>
                </Box>
                
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={handleAddToCart}
                  sx={{ flexGrow: 1 }}
                >
                  Add to Cart
                </Button>
                
                <IconButton>
                  <FavoriteBorder />
                </IconButton>
                
                <IconButton>
                  <Share />
                </IconButton>
              </Box>
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
              <Grid item xs={12} sm={6} md={3} key={product._id}>
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
                      ${product.price.toFixed(2)}
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
              <Grid item xs={12} sm={6} md={3} key={product._id}>
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
                      ${product.price.toFixed(2)}
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
