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
  Skeleton,
  Paper,
  Slide
} from '@mui/material';
import {
  ShoppingCart,
  FavoriteBorder,
  TrendingUp,
  Star,
  LocalOffer,
  FlashOn,
  NewReleases,
  Verified,
  ArrowForward,
  Devices,
  Checkroom,
  Kitchen,
  SportsSoccer,
  Face,
  MenuBook
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productAPI, aiAPI } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user, addToHistory } = useAuth();
  
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [categories] = useState([
    { name: 'Electronics', dbName: 'electronics', icon: <Devices />, color: '#2874F0', discount: 'Up to 50% off' },
    { name: 'Fashion', dbName: 'clothing', icon: <Checkroom />, color: '#FF6B35', discount: 'Min 40% off' },
    { name: 'Home & Kitchen', dbName: 'home', icon: <Kitchen />, color: '#4CAF50', discount: 'Under ₹999' },
    { name: 'Sports', dbName: 'sports', icon: <SportsSoccer />, color: '#9C27B0', discount: 'Buy 1 Get 1' },
    { name: 'Beauty', dbName: 'beauty', icon: <Face />, color: '#E91E63', discount: 'Extra 20% off' },
    { name: 'Books', dbName: 'books', icon: <MenuBook />, color: '#00BCD4', discount: 'Best Deals' }
  ]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Small helper to retry transient network failures (exponential backoff)
  const fetchWithRetry = async (fn, attempts = 3, baseDelay = 500) => {
    let lastError = null;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (e) {
        lastError = e;
        // If server returned a status (4xx/5xx), don't retry — it's not a network fault
        if (e?.response?.status) break;
        const delay = baseDelay * Math.pow(2, i);
        // small delay before retrying
        await new Promise((res) => setTimeout(res, delay));
      }
    }
    throw lastError;
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch trending products (retry on transient network failures)
      const trendingResponse = await fetchWithRetry(() => aiAPI.getTrending({ limit: 8 }), 3);
      setTrendingProducts(trendingResponse.data);

      // Fetch personalized recommendations if authenticated
      if (isAuthenticated) {
        const recommendationsResponse = await fetchWithRetry(
          () => aiAPI.getRecommendations('current'), // backend now resolves 'current' via token
          2
        );
        setRecommendations(recommendationsResponse.data.slice(0, 6));
      }
    } catch (err) {
      const friendly = err?.response?.data?.message || err?.message || 'Network Error — backend unreachable';
      setError(friendly);

      console.error('Error fetching home data:', {
        message: err.message,
        isAxiosError: err.isAxiosError || false,
        code: err.code || null,
        configUrl: err?.config?.url || null,
        status: err?.response?.status || null,
        responseData: err?.response?.data || null,
      });
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
    navigate(`/products?category=${category.dbName}`);
  };

  const ProductCard = ({ product, showRecommendationScore = false }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid #e8e8e8',
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#fff',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
          borderColor: '#1a73e8'
        }
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height="220"
          image={product.images?.[0] || 'https://via.placeholder.com/300x220/f5f5f5/999999?text=No+Image'}
          alt={product.name}
          sx={{
            cursor: 'pointer',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
          onClick={() => handleProductClick(product)}
        />
        {showRecommendationScore && product.aiScore && (
          <Chip
            label={`${Math.round(product.aiScore * 100)}% Match`}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontSize: '0.75rem',
              backgroundColor: '#1a73e8',
              color: 'white',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          />
        )}
        {product.rating >= 4.5 && (
          <Chip
            icon={<Star fontSize="small" />}
            label="Best Seller"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              fontSize: '0.75rem',
              backgroundColor: '#ff4757',
              color: 'white',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          />
        )}
        {product.discountPercentage > 15 && (
          <Chip
            label={`${product.discountPercentage}% OFF`}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              fontSize: '0.75rem',
              backgroundColor: '#ff4757',
              color: 'white',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1, px: 2, pt: 2 }}>
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.4,
            height: '2.8rem',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            color: '#333',
            '&:hover': { color: '#1a73e8' }
          }}
          onClick={() => handleProductClick(product)}
        >
          {product.name}
        </Typography>
        
        <Typography variant="body2" color="#666" sx={{ mb: 1, fontSize: '0.85rem', fontWeight: 500 }}>
          {product.brand}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Rating
            value={product.rating}
            precision={0.1}
            readOnly
            size="small"
            sx={{ color: '#ff9800' }}
          />
          <Typography variant="caption" sx={{ ml: 1, color: '#757575', fontSize: '0.8rem' }}>
            ({product.numReviews || 0})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="h6" color="#1a73e8" fontWeight="bold" sx={{ fontSize: '1.25rem' }}>
            ₹{product.price.toLocaleString('en-IN')}
          </Typography>
          {product.initialPrice && product.initialPrice > product.price && (
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
                ₹{product.initialPrice.toLocaleString('en-IN')}
              </Typography>
              <Chip
                label={`${Math.round(((product.initialPrice - product.price) / product.initialPrice) * 100)}% OFF`}
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
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<ShoppingCart />}
          onClick={() => handleAddToCart(product)}
          disabled={product.stock === 0}
          sx={{
            backgroundColor: '#1a73e8',
            color: 'white',
            fontWeight: 600,
            px: 2,
            textTransform: 'none',
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
          {product.stock === 0 ? 'Out of Stock' : 'Add'}
        </Button>
        <IconButton
          size="small"
          sx={{
            border: '1px solid #e0e0e0',
            '&:hover': {
              borderColor: '#ff4757',
              color: '#ff4757',
              backgroundColor: 'rgba(255, 71, 87, 0.04)'
            }
          }}
        >
          <FavoriteBorder />
        </IconButton>
      </CardActions>
    </Card>
  );
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
      {/* Hero Banner */}
      <Paper 
        sx={{ 
          position: 'relative',
          mb: 4,
          overflow: 'hidden',
          borderRadius: 2,
          height: { xs: 250, md: 350 },
          background: 'linear-gradient(135deg, #2874F0 0%, #FF6B35 100%)'
        }}
      >
        <Container maxWidth="lg" sx={{ height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', py: 4 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <Slide in={true} direction="right" timeout={800}>
                  <Box>
                    <Typography 
                      variant="h3" 
                      color="white" 
                      fontWeight="bold" 
                      gutterBottom
                      sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
                    >
                      PKS Grand Sale
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color="white" 
                      sx={{ mb: 3, opacity: 0.95 }}
                    >
                      Mega Discounts | Top Brands | Fast Delivery
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Button 
                        variant="contained" 
                        size="large"
                        endIcon={<FlashOn />}
                        sx={{ 
                          backgroundColor: 'white', 
                          color: '#2874F0',
                          fontWeight: 'bold',
                          px: 4,
                          py: 1.5,
                          '&:hover': { 
                            backgroundColor: '#f5f5f5',
                            transform: 'scale(1.05)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => navigate('/products')}
                      >
                        Shop Now
                      </Button>
                      {(!isAuthenticated || user?.role === 'customer') && (
                        <Button 
                          variant="outlined" 
                          size="large"
                          sx={{ 
                            borderColor: 'white',
                            color: 'white',
                            fontWeight: 'bold',
                            px: 4,
                            py: 1.5,
                            '&:hover': { 
                              backgroundColor: 'rgba(255,255,255,0.1)',
                              borderColor: 'white'
                            },
                            transition: 'all 0.3s ease'
                          }}
                          onClick={() => navigate('/become-delivery-partner')}
                        >
                          Become Delivery Partner
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Slide>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="h2" 
                    color="white" 
                    fontWeight="bold"
                    sx={{ fontSize: { xs: '3rem', md: '4rem' } }}
                  >
                    80% OFF
                  </Typography>
                  <Typography variant="h6" color="white" sx={{ opacity: 0.9 }}>
                    Selected Items
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Paper>

      {/* Categories */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Top Categories
          </Typography>
          <Chip 
            label="Deals of the Day" 
            color="secondary" 
            size="small" 
            sx={{ ml: 2, backgroundColor: '#FFE500', color: '#212121' }}
          />
        </Box>
        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={category.name}>
              <Card
                sx={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid #e0e0e0',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    borderColor: category.color
                  }
                }}
                onClick={() => handleCategoryClick(category)}
              >
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ 
                    mb: 1, 
                    fontSize: '2rem', 
                    color: category.color,
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    {category.icon}
                  </Box>
                  <Typography variant="body2" fontWeight="medium" color="text.primary">
                    {category.name}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      mt: 0.5,
                      display: 'block',
                      color: category.color,
                      fontWeight: 'bold'
                    }}
                  >
                    {category.discount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Flash Deals Section */}
      <Box sx={{ mb: 6 }}>
        <Paper 
          sx={{ 
            p: 3,
            background: 'linear-gradient(135deg, #FF6B35 0%, #FFE500 100%)',
            borderRadius: 2,
            mb: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FlashOn sx={{ mr: 2, fontSize: 32, color: 'white' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" color="white">
                  Flash Deals
                </Typography>
                <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                  Limited time offers • Lightning fast delivery
                </Typography>
              </Box>
            </Box>
            <Button 
              variant="contained" 
              endIcon={<ArrowForward />}
              sx={{ 
                backgroundColor: 'white', 
                color: '#FF6B35',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#f5f5f5' }
              }}
              onClick={() => navigate('/products?flash=true')}
            >
              View All
            </Button>
          </Box>
        </Paper>
        <Grid container spacing={3}>
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                  <SkeletonCard />
                </Grid>
              ))
            : trendingProducts.slice(0, 4).map((product) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product._id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
        </Grid>
      </Box>

      {/* Trending Products */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalOffer color="primary" sx={{ mr: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              Trending Now
            </Typography>
            <Chip 
              icon={<NewReleases />}
              label="New Arrivals" 
              color="secondary" 
              size="small" 
              sx={{ ml: 2 }}
            />
          </Box>
          <Button 
            variant="outlined" 
            endIcon={<ArrowForward />}
            onClick={() => navigate('/products')}
          >
            View All
          </Button>
        </Box>
        <Grid container spacing={3}>
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                  <SkeletonCard />
                </Grid>
              ))
            : trendingProducts.map((product) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product._id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
