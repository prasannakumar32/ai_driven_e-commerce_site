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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Rating,
  IconButton,
  Pagination,
  CircularProgress,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Drawer,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ShoppingCart,
  FavoriteBorder,
  FilterList,
  ExpandMore,
  Search,
  Sort,
  Close
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productAPI, aiAPI } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Products = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { isAuthenticated, addToHistory } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const categories = [
    'electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys'
  ];

  const brands = [
    'Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'Microsoft', 'Dell'
  ];

  useEffect(() => {
    fetchProducts();
    if (isAuthenticated) {
      fetchRecommendations();
    }
  }, [searchParams, page, sortBy, sortOrder]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);
    if (rating) params.set('rating', rating);
    if (priceRange[0] > 0 || priceRange[1] < 1000) {
      params.set('minPrice', priceRange[0]);
      params.set('maxPrice', priceRange[1]);
    }
    params.set('page', page);
    params.set('sort', sortBy);
    params.set('order', sortOrder);
    
    setSearchParams(params);
  }, [search, category, brand, rating, priceRange, page, sortBy, sortOrder]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchParams.get('search'),
        category: searchParams.get('category'),
        brand: searchParams.get('brand'),
        minPrice: searchParams.get('minPrice'),
        maxPrice: searchParams.get('maxPrice'),
        rating: searchParams.get('rating'),
        page: searchParams.get('page') || 1,
        sort: searchParams.get('sort') || 'createdAt',
        order: searchParams.get('order') || 'desc'
      };

      const response = await productAPI.getProducts(params);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setTotalProducts(response.data.totalProducts);
      setPage(response.data.currentPage);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await aiAPI.getRecommendations('current');
      setRecommendations(response.data.slice(0, 4));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await aiAPI.smartSearch({
        query: search,
        userId: isAuthenticated ? 'current' : null,
        filters: {
          category,
          brand,
          priceRange: { min: priceRange[0], max: priceRange[1] }
        }
      });
      
      setProducts(response.data.products);
      setTotalProducts(response.data.products.length);
      setTotalPages(1);
    } catch (error) {
      console.error('Error in smart search:', error);
      fetchProducts(); // Fallback to regular search
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

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'category':
        setCategory(value);
        break;
      case 'brand':
        setBrand(value);
        break;
      case 'rating':
        setRating(value);
        break;
      case 'priceRange':
        setPriceRange(value);
        break;
      default:
        break;
    }
    setPage(1);
  };

  const clearFilters = () => {
    setCategory('');
    setBrand('');
    setRating('');
    setPriceRange([0, 1000]);
    setPage(1);
  };

  const ProductCard = ({ product, showScore = false }) => (
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
        {showScore && product.aiScore && (
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

  const FiltersPanel = () => (
    <Box sx={{ width: 250, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filters</Typography>
        <IconButton onClick={clearFilters} size="small">
          <Close />
        </IconButton>
      </Box>

      <TextField
        fullWidth
        label="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        InputProps={{
          endAdornment: <Search />
        }}
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          label="Category"
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Brand</InputLabel>
        <Select
          value={brand}
          label="Brand"
          onChange={(e) => handleFilterChange('brand', e.target.value)}
        >
          <MenuItem value="">All Brands</MenuItem>
          {brands.map((br) => (
            <MenuItem key={br} value={br}>
              {br}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>Price Range</Typography>
        <Slider
          value={priceRange}
          onChange={(e, value) => handleFilterChange('priceRange', value)}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
          marks={[
            { value: 0, label: '$0' },
            { value: 250, label: '$250' },
            { value: 500, label: '$500' },
            { value: 750, label: '$750' },
            { value: 1000, label: '$1000' }
          ]}
        />
      </Box>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Minimum Rating</InputLabel>
        <Select
          value={rating}
          label="Minimum Rating"
          onChange={(e) => handleFilterChange('rating', e.target.value)}
        >
          <MenuItem value="">All Ratings</MenuItem>
          <MenuItem value="4">4+ Stars</MenuItem>
          <MenuItem value="3">3+ Stars</MenuItem>
          <MenuItem value="2">2+ Stars</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={`${sortBy}-${sortOrder}`}
          label="Sort By"
          onChange={(e) => {
            const [sort, order] = e.target.value.split('-');
            setSortBy(sort);
            setSortOrder(order);
          }}
        >
          <MenuItem value="createdAt-desc">Newest First</MenuItem>
          <MenuItem value="createdAt-asc">Oldest First</MenuItem>
          <MenuItem value="price-asc">Price: Low to High</MenuItem>
          <MenuItem value="price-desc">Price: High to Low</MenuItem>
          <MenuItem value="rating-desc">Highest Rated</MenuItem>
          <MenuItem value="popularity-desc">Most Popular</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Products
      </Typography>

      {/* AI Recommendations */}
      {isAuthenticated && recommendations.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Recommended for You
          </Typography>
          <Grid container spacing={2}>
            {recommendations.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product._id}>
                <ProductCard product={product} showScore />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Filters - Desktop */}
        {!isMobile && (
          <Box sx={{ width: 250, flexShrink: 0 }}>
            <Paper elevation={1}>
              <FiltersPanel />
            </Paper>
          </Box>
        )}

        {/* Products Grid */}
        <Box sx={{ flexGrow: 1 }}>
          {/* Mobile Filter Button */}
          {isMobile && (
            <Box sx={{ mb: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setFiltersOpen(true)}
              >
                Filters
              </Button>
            </Box>
          )}

          {/* Results Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1">
              {totalProducts} products found
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Search />}
              onClick={handleSearch}
              disabled={!search.trim()}
            >
              AI Search
            </Button>
          </Box>

          {/* Products */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {products.map((product) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="left"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
      >
        <FiltersPanel />
      </Drawer>
    </Container>
  );
};

export default Products;
