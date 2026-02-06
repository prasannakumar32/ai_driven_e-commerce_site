import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
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
  Drawer,
  Paper,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar
} from '@mui/material';
import {
  ShoppingCart,
  FavoriteBorder,
  FilterList,
  Search,
  Close,
  Sort,
  ViewList,
  ViewModule,
  LocalOffer,
  FlashOn,
  Verified,
  Add,
  Store
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productAPI, aiAPI } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Products = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { isAuthenticated, addToHistory, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    stock: '',
    images: [],
    tags: '',
    features: ''
  });
  
  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const categories = [
    'electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys'
  ];

  const brands = [
    'Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'Microsoft', 'Dell'
  ];

  const fetchProducts = useCallback(async () => {
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
  }, [searchParams]);

  const fetchRecommendations = async () => {
    try {
      const response = await aiAPI.getRecommendations('current');
      setRecommendations(response.data.slice(0, 4));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    if (isAuthenticated) {
      fetchRecommendations();
    }
  }, [searchParams, page, sortBy, sortOrder, isAuthenticated, fetchProducts]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);
    if (rating) params.set('rating', rating);
    if (priceRange[0] > 0 || priceRange[1] < 100000) {
      params.set('minPrice', priceRange[0]);
      params.set('maxPrice', priceRange[1]);
    }
    params.set('page', page);
    params.set('sort', sortBy);
    params.set('order', sortOrder);
    
    setSearchParams(params);
  }, [search, category, brand, rating, priceRange, page, sortBy, sortOrder, setSearchParams]);

  // Debounced search with loading state
  const debouncedSearch = useMemo(
    () => debounce((value) => {
      setSearchLoading(true);
      setSearch(value);
      setPage(1);
      setTimeout(() => setSearchLoading(false), 300);
    }, 500),
    []
  );

  const handleSearchChange = (value) => {
    debouncedSearch(value);
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

  // Seller functions
  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData({
      ...formData,
      images: files.map(file => URL.createObjectURL(file))
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        features: formData.features.split(',').map(feature => feature.trim()).filter(feature => feature),
        seller: user._id
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        const newProduct = await response.json();
        setProducts([newProduct, ...products]);
        setAddProductOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      brand: '',
      stock: '',
      images: [],
      tags: '',
      features: ''
    });
  };

  const renderAddProductForm = () => {
    const categories = ['electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys'];
    
    return (
      <Box component="form" onSubmit={handleAddProduct}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Product Name *"
              value={formData.name}
              onChange={handleInputChange('name')}
              required
              size="small"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description *"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange('description')}
              required
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Price (₹) *"
              type="number"
              value={formData.price}
              onChange={handleInputChange('price')}
              required
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Stock *"
              type="number"
              value={formData.stock}
              onChange={handleInputChange('stock')}
              required
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Brand *"
              value={formData.brand}
              onChange={handleInputChange('brand')}
              required
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Category *</InputLabel>
              <Select
                value={formData.category}
                label="Category *"
                onChange={handleInputChange('category')}
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Product Images *"
              type="file"
              inputProps={{ multiple: true, accept: 'image/*' }}
              onChange={handleImageUpload}
              helperText="Upload product images"
              size="small"
            />
          </Grid>
          
          {formData.images.length > 0 && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.images.map((image, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: 'cover',
                        borderRadius: 4
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        bgcolor: 'white',
                        '&:hover': { bgcolor: 'grey.100' }
                      }}
                      onClick={() => {
                        const newImages = formData.images.filter((_, i) => i !== index);
                        setFormData({ ...formData, images: newImages });
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
        
        <DialogActions sx={{ mt: 2 }}>
          <Button onClick={() => {
            setAddProductOpen(false);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Add Product
          </Button>
        </DialogActions>
      </Box>
    );
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
    setSearch('');
    setCategory('');
    setBrand('');
    setRating('');
    setPriceRange([0, 100000]);
    setPage(1);
  };

  const ProductCard = ({ product, showScore = false }) => (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        border: '1px solid #e0e0e0',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          borderColor: '#2874F0'
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={product.images?.[0] || 'https://via.placeholder.com/300x200/cccccc/666666?text=No+Image'}
          alt={product.name}
          sx={{ 
            cursor: 'pointer',
            objectFit: 'cover'
          }}
          onClick={() => handleProductClick(product)}
          onError={(e) => {
            // Try next image in array or fallback
            const currentSrc = e.target.src;
            const imageArray = product.images || [];
            const currentIndex = imageArray.findIndex(img => img === currentSrc);
            
            if (currentIndex < imageArray.length - 1) {
              e.target.src = imageArray[currentIndex + 1];
            } else {
              // Final fallback to placeholder
              e.target.src = 'https://via.placeholder.com/300x200/cccccc/666666?text=No+Image';
            }
          }}
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
              fontSize: '0.7rem',
              backgroundColor: '#2874F0',
              color: 'white'
            }}
          />
        )}
        {product.rating >= 4 && (
          <Chip
            icon={<Verified fontSize="small" />}
            label="Verified"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              fontSize: '0.7rem',
              backgroundColor: '#4CAF50',
              color: 'white'
            }}
          />
        )}
        {product.discount > 0 && (
          <Chip
            label={`${product.discount}% OFF`}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              fontSize: '0.7rem',
              backgroundColor: '#FF6B35',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        )}
      </Box>
      
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography 
          variant="h6" 
          component="h3" 
          gutterBottom
          sx={{ 
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.3,
            height: '2.6rem',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            '&:hover': { color: '#2874F0' }
          }}
          onClick={() => handleProductClick(product)}
        >
          {product.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.875rem' }}>
          {product.brand}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating 
            value={product.rating} 
            precision={0.1} 
            readOnly 
            size="small"
            sx={{ color: '#FFB400' }}
          />
          <Typography variant="caption" sx={{ ml: 1, color: '#757575' }}>
            ({product.numReviews || 0})
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" color="#2874F0" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
            ₹{product.price.toLocaleString('en-IN')}
          </Typography>
          {product.originalPrice && product.originalPrice > product.price && (
            <Typography 
              variant="body2" 
              color="#757575"
              sx={{ textDecoration: 'line-through' }}
            >
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </Typography>
          )}
        </Box>
      </CardContent>
      
      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button
          size="small"
          startIcon={<ShoppingCart />}
          onClick={() => handleAddToCart(product)}
          disabled={product.stock === 0}
          sx={{ 
            backgroundColor: '#FF6B35',
            color: 'white',
            fontWeight: 'bold',
            px: 2,
            '&:hover': { 
              backgroundColor: '#E55A2B',
              boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)'
            },
            '&:disabled': {
              backgroundColor: '#e0e0e0',
              color: '#757575'
            }
          }}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
        <IconButton 
          size="small" 
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

      {/* Active Filters */}
      {(search || category || brand || rating || priceRange[0] > 0 || priceRange[1] < 100000) && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Active Filters:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {search && (
              <Chip 
                label={`Search: ${search}`} 
                size="small" 
                onDelete={() => handleSearchChange('')}
                color="primary"
                variant="outlined"
              />
            )}
            {category && (
              <Chip 
                label={`Category: ${category}`} 
                size="small" 
                onDelete={() => handleFilterChange('category', '')}
                color="primary"
                variant="outlined"
              />
            )}
            {brand && (
              <Chip 
                label={`Brand: ${brand}`} 
                size="small" 
                onDelete={() => handleFilterChange('brand', '')}
                color="primary"
                variant="outlined"
              />
            )}
            {rating && (
              <Chip 
                label={`Rating: ${rating}+`} 
                size="small" 
                onDelete={() => handleFilterChange('rating', '')}
                color="primary"
                variant="outlined"
              />
            )}
            {(priceRange[0] > 0 || priceRange[1] < 100000) && (
              <Chip 
                label={`Price: ₹${priceRange[0]} - ₹${priceRange[1]}`} 
                size="small" 
                onDelete={() => handleFilterChange('priceRange', [0, 100000])}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      )}

      <TextField
        fullWidth
        label="Search"
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        InputProps={{
          endAdornment: searchLoading ? <CircularProgress size={20} /> : <Search />
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
          max={100000}
          marks={[
            { value: 0, label: '₹0' },
            { value: 25000, label: '₹25K' },
            { value: 50000, label: '₹50K' },
            { value: 75000, label: '₹75K' },
            { value: 100000, label: '₹1L' }
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
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="text.primary">
              PKS Store
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Discover amazing products at unbeatable prices
            </Typography>
          </Box>
          
          {/* Seller Add Product Button */}
          {isAuthenticated && user?.role === 'seller' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddProductOpen(true)}
              sx={{
                backgroundColor: '#FF6B35',
                '&:hover': { backgroundColor: '#E55A2B' },
                fontWeight: 'bold'
              }}
            >
              Add Product
            </Button>
          )}
        </Box>
      </Box>

      {/* AI Recommendations */}
      {isAuthenticated && recommendations.length > 0 && (
        <Paper 
          sx={{ 
            p: 3, 
            mb: 4, 
            background: 'linear-gradient(135deg, #2874F0 0%, #4B8BF5 100%)',
            borderRadius: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocalOffer sx={{ mr: 2, color: 'white' }} />
            <Typography variant="h6" fontWeight="bold" color="white">
              Recommended for You
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {recommendations.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product._id}>
                <ProductCard product={product} showScore />
              </Grid>
            ))}
          </Grid>
        </Paper>
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
          <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  {totalProducts} Products Found
                </Typography>
                {(search || category || brand) && (
                  <Typography variant="body2" color="text.secondary">
                    {search && `Search: "${search}"`}
                    {category && ` • Category: ${category}`}
                    {brand && ` • Brand: ${brand}`}
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<FlashOn />}
                  onClick={handleSearch}
                  disabled={!search.trim()}
                  sx={{ 
                    backgroundColor: '#FF6B35',
                    '&:hover': { backgroundColor: '#E55A2B' }
                  }}
                >
                  AI Search
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={viewMode === 'grid' ? <ViewList /> : <ViewModule />}
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  sx={{ ml: 1 }}
                >
                  {viewMode === 'grid' ? 'List' : 'Grid'}
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Products */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={viewMode === 'grid' ? 3 : 2}>
                {products.map((product) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={viewMode === 'grid' ? 6 : 12} 
                    md={viewMode === 'grid' ? 4 : 12} 
                    lg={viewMode === 'grid' ? 3 : 12} 
                    key={product._id}
                  >
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

      {/* Add Product Dialog for Sellers */}
      <Dialog
        open={addProductOpen}
        onClose={() => {
          setAddProductOpen(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#2874F0', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Store sx={{ mr: 2 }} />
            Add New Product
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {renderAddProductForm()}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Products;
