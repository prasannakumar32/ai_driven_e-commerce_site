import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Rating,
  IconButton,
  Skeleton
} from '@mui/material';
import {
  ShoppingCart,
  FavoriteBorder,
  TrendingUp,
  Star,
  LocalOffer
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productAPI, aiAPI } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, addToHistory } = useAuth();
  
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [categories] = useState([
    { name: 'Electronics', icon: '💻', color: '#2196F3' },
    { name: 'Clothing', icon: '👕', color: '#FF9800' },
    { name: 'Books', icon: '📚', color: '#4CAF50' },
    { name: 'Home', icon: '🏠', color: '#9C27B0' },
    { name: 'Sports', icon: '⚽', color: '#F44336' },
    { name: 'Beauty', icon: '💄', color: '#E91E63' }
  ]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch trending products
      const trendingResponse = await aiAPI.getTrending({ limit: 8 });
      setTrendingProducts(trendingResponse.data);

      // Fetch personalized recommendations if authenticated
      if (isAuthenticated) {
        const recommendationsResponse = await aiAPI.getRecommendations('current');
        setRecommendations(recommendationsResponse.data.slice(0, 6));
      }
    } catch (error) {
      setError('Failed to load data');
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleProductClick = (product) => {
    if (isAuthenticated) {
      addToHistory(product._id);
    }
    navigate(`/products/${product._id}`);
  };

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${category.toLowerCase()}`);
  };

  const ProductCard = ({ product, showRecommendationScore = false }) => (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={product.images?.[0] || '/placeholder-product.jpg'}
          alt={product.name}
          sx={{ cursor: 'pointer' }}
          onClick={() => handleProductClick(product)}
        />
        {showRecommendationScore && product.aiScore && (
          <Chip
            label={`${Math.round(product.aiScore * 100)}% Match`}
            size="small"
            color="primary"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              fontSize: '0.7rem'
            }}
          />
        )}
        {product.rating > 4 && (
          <Chip
            icon={<Star fontSize="small" />}
            label="Popular"
            size="small"
            color="secondary"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              fontSize: '0.7rem'
            }}
          />
        )}
      </Box>
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography 
          variant="h6" 
          component="h3" 
          gutterBottom
          sx={{ 
            cursor: 'pointer',
            '&:hover': { color: 'primary.main' }
          }}
          onClick={() => handleProductClick(product)}
        >
          {product.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {product.brand}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating 
            value={product.rating} 
            precision={0.1} 
            readOnly 
            size="small"
          />
          <Typography variant="caption" sx={{ ml: 1 }}>
            ({product.numReviews || 0})
          </Typography>
        </Box>
        
        <Typography variant="h6" color="primary" fontWeight="bold">
          ${product.price.toFixed(2)}
        </Typography>
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          startIcon={<ShoppingCart />}
          onClick={() => handleAddToCart(product)}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
        <IconButton size="small">
          <FavoriteBorder />
        </IconButton>
      </CardActions>
    </Card>
  );

  const SkeletonCard = () => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Skeleton variant="rectangular" height={200} />
      <CardContent sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" height={32} />
        <Skeleton variant="text" height={24} width="60%" />
        <Skeleton variant="text" height={24} width="40%" />
        <Skeleton variant="text" height={32} width="30%" />
      </CardContent>
      <CardActions>
        <Skeleton variant="rectangular" width={100} height={36} />
      </CardActions>
    </Card>
  );

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" onClick={fetchData}>
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          py: 8, 
          mb: 6,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
          color: 'white'
        }}
      >
        <Typography variant="h3" gutterBottom fontWeight="bold">
          Welcome to AI Shop
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
          Discover products personalized just for you with our AI-powered shopping experience
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          onClick={() => navigate('/products')}
          sx={{ 
            backgroundColor: 'white', 
            color: 'primary.main',
            '&:hover': { backgroundColor: 'grey.100' }
          }}
        >
          Start Shopping
        </Button>
      </Box>

      {/* Categories */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Shop by Category
        </Typography>
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={6} sm={4} md={2} key={category.name}>
              <Card
                sx={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
                onClick={() => handleCategoryClick(category.name)}
              >
                <CardContent>
                  <Typography variant="h3" sx={{ mb: 1 }}>
                    {category.icon}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {category.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Personalized Recommendations */}
      {isAuthenticated && recommendations.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <TrendingUp color="primary" sx={{ mr: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              Recommended for You
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <SkeletonCard />
                  </Grid>
                ))
              : recommendations.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product._id}>
                    <ProductCard product={product} showRecommendationScore />
                  </Grid>
                ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/products')}
            >
              View All Recommendations
            </Button>
          </Box>
        </Box>
      )}

      {/* Trending Products */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocalOffer color="primary" sx={{ mr: 1 }} />
          <Typography variant="h4" fontWeight="bold">
            Trending Now
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <SkeletonCard />
                </Grid>
              ))
            : trendingProducts.map((product) => (
                <Grid item xs={12} sm={6} md={3} key={product._id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/products')}
          >
            Shop All Products
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
