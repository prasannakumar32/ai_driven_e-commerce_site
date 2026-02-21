import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import {
  Container,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  CircularProgress,
  Drawer,
  useMediaQuery,
  Breadcrumbs,
  Link,
  Rating,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CardActions,
  Pagination
} from '@mui/material';
import {
  ShoppingCart,
  FavoriteBorder,
  FilterList,
  Search,
  Close,
  ViewList,
  ViewModule,
  LocalOffer,
  FlashOn,
  Verified,
  Add,
  Store
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
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
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [aiSearchResults, setAiSearchResults] = useState([]);
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  
  // Dynamic filter options based on current products
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availablePriceRange, setAvailablePriceRange] = useState([0, 100000]);
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

  // Initialize state from URL params
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  // Local input state so users can type continuously without URL / state jumps
  const [inputSearch, setInputSearch] = useState(search);

  // Keep inputSearch in sync when URL or external search changes
  useEffect(() => {
    setInputSearch(search);
  }, [search]);

  // Debounce input -> canonical `search` state to avoid focus loss while typing
  useEffect(() => {
    const id = setTimeout(() => {
      if (inputSearch !== search) setSearch(inputSearch);
    }, 300);
    return () => clearTimeout(id);
  }, [inputSearch]);
  const [category, setCategory] = useState(() => searchParams.get('category') || '');
  const [brand, setBrand] = useState(() => searchParams.get('brand') || '');
  const [priceRange, setPriceRange] = useState(() => [
    searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')) : 0,
    searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')) : 100000
  ]);
  const [rating, setRating] = useState(() => searchParams.get('rating') || '');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(() => searchParams.get('page') ? parseInt(searchParams.get('page')) : 1);

  // Update URL params when search state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0]);
    if (priceRange[1] < 100000) params.set('maxPrice', priceRange[1]);
    if (rating) params.set('rating', rating);
    if (page > 1) params.set('page', page);
    if (sortBy !== 'createdAt') params.set('sort', sortBy);
    if (sortOrder !== 'desc') params.set('order', sortOrder);
    
    const newParams = params.toString();
    setSearchParams(newParams ? `?${newParams}` : '');
  }, [search, category, brand, priceRange, rating, page, sortBy, sortOrder]);

  // Keep `search` state in sync when URL search param changes (Header navigation or direct links)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== search) {
      setSearch(urlSearch);
      setPage(1);
    }
  }, [searchParams]);

  // Update dynamic filter options when products change
  useEffect(() => {
    if (products && products.length > 0) {
      const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
      const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
      const prices = products.map(p => p.price).filter(p => p > 0);
      
      setAvailableCategories(categories.sort());
      setAvailableBrands(brands.sort());
      
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        setAvailablePriceRange([minPrice, maxPrice]);
      }
    } else {
      // Reset to default options when no products
      setAvailableCategories(['electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys']);
      setAvailableBrands(['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'Microsoft', 'Dell']);
      setAvailablePriceRange([0, 100000]);
    }
  }, [products]);

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
        search,
        category,
        brand,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 100000 ? priceRange[1] : undefined,
        rating,
        page,
        sort: sortBy,
        order: sortOrder
      };

      const response = await productAPI.getProducts(params);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setTotalProducts(response.data.totalProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [search, category, brand, priceRange, rating, page, sortBy, sortOrder]);

  const fetchRecommendations = async () => {
    try {
      const response = await aiAPI.getRecommendations('current');
      setRecommendations(response.data.slice(0, 4));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const fetchRelatedProducts = async (searchQuery, productCategory = '', productBrand = '') => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setRelatedProducts([]);
      return [];
    }

    try {
      setRelatedLoading(true);

      const cacheKey = `related_${searchQuery}_${productCategory}_${productBrand}`;

      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        if (age < 300000) {
          const relatedProducts = data.slice(0, 6);
          setRelatedProducts(relatedProducts);
          return relatedProducts;
        }
      }

      const response = await fetch('/api/products/related', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchQuery,
          category: productCategory,
          brand: productBrand,
          limit: 8
        })
      });

      if (response.ok) {
        const data = await response.json();
        const relatedProducts = data.products.slice(0, 6);
        setRelatedProducts(relatedProducts);

        localStorage.setItem(cacheKey, JSON.stringify({
          data: relatedProducts,
          timestamp: Date.now()
        }));

        return relatedProducts;
      }
      return [];
    } catch (error) {
      console.error('Error fetching related products:', error);
      return [];
    } finally {
      setRelatedLoading(false);
    }
  };

  // Rank and dedupe combined search results so exact / high-score items show first
  const rankAndDedupe = (items = [], query = '') => {
    const q = (query || '').trim().toLowerCase();
    const map = new Map();

    items.forEach((p) => {
      const id = p._id || p.id || `${p.name}-${p.price}`;
      const base = p.aiScore || p.hybridScore || p.vectorScore || 0;
      let score = typeof base === 'number' ? base : 0;
      const name = (p.name || '').toLowerCase();

      if (q) {
        if (name === q) score += 1000;
        else if (name.startsWith(q)) score += 500;
        else if (name.includes(q)) score += 300;
        if (p.brand && p.brand.toLowerCase().includes(q)) score += 100;
        if (p.category && p.category.toLowerCase().includes(q)) score += 50;
      }

      if (p.isRelated) score += 10; // small boost for related items

      // keep item with highest computed relevance
      if (!map.has(id) || (map.get(id).relevanceScore || 0) < score) {
        map.set(id, { ...p, relevanceScore: score });
      }
    });

    return Array.from(map.values()).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  };

  // Debounced effect for search API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search && search.trim().length >= 2) {
        setSearchLoading(true);
        fetchProducts()
          .then(() => {
            return fetchRelatedProducts(search, category, brand);
          })
          .finally(() => {
            setSearchLoading(false);
          });
      } else if (search.trim().length === 0) {
        fetchProducts();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, category, brand, fetchProducts]);

  useEffect(() => {
    // Only fetch on initial load or when page/sort changes
    if (!search || search.length === 0) {
      fetchProducts();
    }
    if (isAuthenticated) {
      fetchRecommendations();
    }
  }, [page, sortBy, sortOrder, isAuthenticated, fetchProducts]);

  // Track search state changes for debugging
  useEffect(() => {
    console.log('Search state changed to:', search);
  }, [search]);

  const handleSearch = async () => {
    try {
      // Clear previous AI search state and related products
      setIsAiSearch(true);
      setAiSearchResults([]);
      setRelatedProducts([]);
      
      const startTime = Date.now();
      
      // Early return for empty queries
      if (!search || search.trim().length < 2) {
        setIsAiSearch(false);
        setAiSearchResults([]);
        setRelatedProducts([]);
        await fetchProducts();
        return;
      }
      
      // Fetch related products and AI search results in parallel with timeout
      const searchPromise = Promise.all([
        fetchRelatedProducts(search, category, brand),
        aiAPI.smartSearch({
          query: search,
          userId: isAuthenticated ? 'current' : null,
          filters: {
            category,
            brand,
            priceRange: { min: priceRange[0], max: priceRange[1] }
          }
        })
      ]);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Search timeout')), 5000)
      );
      
      const [relatedProductsData, aiResponse] = await Promise.race([searchPromise, timeoutPromise]);
      
      // Handle the new standardized response format
      const aiProducts = aiResponse.data?.data?.products || aiResponse.data?.products || [];
      
      // Log the search type for debugging
      console.log('AI Search Response:', {
        searchType: aiResponse.data?.searchType,
        totalResults: aiProducts.length,
        hasVectorScores: aiProducts.some(p => p.vectorScore || p.hybridScore)
      });
      
      // Merge, dedupe and rank results so the most relevant (exact/higher AI score) appear first
      const merged = [
        ...relatedProductsData.map(product => ({ ...product, isRelated: true })),
        ...aiProducts.map(product => ({ 
          ...product, 
          isRelated: false,
          aiScore: product.aiScore || product.hybridScore || product.vectorScore || 0
        }))
      ];
      
      const ranked = rankAndDedupe(merged, search);
      
      setAiSearchResults(ranked);
      setProducts(ranked);
      setTotalProducts(ranked.length);
      setTotalPages(1);
      
      const searchTime = Date.now() - startTime;
      console.log(`AI search completed in ${searchTime}ms`);
      
    } catch (error) {
      console.error('Error in smart search:', error);
      setIsAiSearch(false);
      setAiSearchResults([]);
      setRelatedProducts([]);
      
      // Fallback to regular search
      try {
        await fetchProducts();
        if (search && search.trim().length >= 2) {
          await fetchRelatedProducts(search, category, brand);
        }
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
      }
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleBuyNow = async (product) => {
    try {
      await addToCart(product, 1);
      navigate('/cart');
    } catch (error) {
      console.error('Buy now failed:', error);
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
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Product Name *"
              value={formData.name}
              onChange={handleInputChange('name')}
              required
              size="small"
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
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
          
          <Grid size={{ xs: 12, sm: 6 }}>
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
          
          <Grid size={{ xs: 12, sm: 6 }}>
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
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Brand *"
              value={formData.brand}
              onChange={handleInputChange('brand')}
              required
              size="small"
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
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
          
          <Grid size={{ xs: 12 }}>
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
            <Grid size={{ xs: 12 }}>
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
    
    // Clear AI search state when filters change
    if (isAiSearch) {
      setIsAiSearch(false);
      setAiSearchResults([]);
      setRelatedProducts([]);
    }
    
    // Clear search cache when filters change
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('related_')) {
        localStorage.removeItem(key);
      }
    });
  };

  const clearFilters = () => {
    // Clear all search and filter states immediately
    setSearch('');
    setCategory('');
    setBrand('');
    setRating('');
    setPriceRange([0, 100000]);
    setPage(1);
    
    // Clear all product and search results
    setProducts([]);
    setAiSearchResults([]);
    setRelatedProducts([]);
    setRecommendations([]);
    
    // Clear AI search state
    setIsAiSearch(false);
    
    // Clear all search cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('related_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear URL params
    setSearchParams('');
    
    // Fetch fresh products after clearing
    setTimeout(() => {
      fetchProducts();
    }, 100);
  };

  const ProductCard = ({ product, showScore = false, isRelated = false }) => (
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
        {isRelated && (
          <Chip
            icon={<LocalOffer fontSize="small" />}
            label="Related"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              fontSize: '0.7rem',
              backgroundColor: '#FF6B35',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        )}
        {!isRelated && showScore && product.aiScore && (
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
        {!isRelated && showScore && product.vectorScore && !product.aiScore && (
          <Chip
            label={`${Math.round(product.vectorScore * 100)}% Vector`}
            size="small"
            color="secondary"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              fontSize: '0.7rem',
              backgroundColor: '#FF6B35',
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
        {product.discountPercentage > 0 && (
          <Chip
            label={`${product.discountPercentage}% OFF`}
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
          {product.initialPrice && product.initialPrice > product.price && (
            <Typography 
              variant="body2" 
              color="#757575"
              sx={{ textDecoration: 'line-through' }}
            >
              ₹{product.initialPrice.toLocaleString('en-IN')}
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

        <Button
          size="small"
          variant="outlined"
          onClick={() => handleBuyNow(product)}
          disabled={product.stock === 0}
          sx={{
            ml: 1,
            textTransform: 'none'
          }}
        >
          Buy Now
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        pb: 2,
        borderBottom: '2px solid #f0f0f0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterList sx={{ mr: 1, color: '#2874F0', fontSize: '1.2rem' }} />
          <Typography variant="h6" fontWeight="bold" color="#2874F0">
            Filters
          </Typography>
        </Box>
        <Button 
          onClick={clearFilters} 
          size="small"
          sx={{ 
            textTransform: 'none',
            color: '#FF6B35',
            borderColor: '#FF6B35',
            '&:hover': {
              backgroundColor: 'rgba(255, 107, 53, 0.08)',
              borderColor: '#FF6B35'
            }
          }}
          variant="outlined"
        >
          Clear All
        </Button>
      </Box>

      {/* Active Filters */}
      {(search || category || brand || rating || priceRange[0] > 0 || priceRange[1] < 100000) && (
        <Box sx={{ 
          mb: 3, 
          p: 2, 
          backgroundColor: 'rgba(40, 116, 240, 0.05)',
          borderRadius: 1.5,
          border: '1px solid rgba(40, 116, 240, 0.1)'
        }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="#2874F0">
            Active Filters
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {search && (
              <Chip 
                label={`Search: ${search}`} 
                size="small" 
                onDelete={() => setSearch('')}
                sx={{
                  backgroundColor: '#2874F0',
                  color: 'white',
                  '& .MuiChip-deleteIcon': {
                    color: 'white'
                  }
                }}
              />
            )}
            {category && (
              <Chip 
                label={`Category: ${category}`} 
                size="small" 
                onDelete={() => handleFilterChange('category', '')}
                sx={{
                  backgroundColor: '#2874F0',
                  color: 'white',
                  '& .MuiChip-deleteIcon': {
                    color: 'white'
                  }
                }}
              />
            )}
            {brand && (
              <Chip 
                label={`Brand: ${brand}`} 
                size="small" 
                onDelete={() => handleFilterChange('brand', '')}
                sx={{
                  backgroundColor: '#2874F0',
                  color: 'white',
                  '& .MuiChip-deleteIcon': {
                    color: 'white'
                  }
                }}
              />
            )}
            {rating && (
              <Chip 
                label={`Rating: ${rating}+`} 
                size="small" 
                onDelete={() => handleFilterChange('rating', '')}
                sx={{
                  backgroundColor: '#2874F0',
                  color: 'white',
                  '& .MuiChip-deleteIcon': {
                    color: 'white'
                  }
                }}
              />
            )}
            {(priceRange[0] > 0 || priceRange[1] < 100000) && (
              <Chip 
                label={`Price: ₹${priceRange[0]} - ₹${priceRange[1]}`} 
                size="small" 
                onDelete={() => handleFilterChange('priceRange', [0, 100000])}
                sx={{
                  backgroundColor: '#2874F0',
                  color: 'white',
                  '& .MuiChip-deleteIcon': {
                    color: 'white'
                  }
                }}
              />
            )}
          </Box>
        </Box>
      )}

      <TextField
        fullWidth
        label="Search Products"
        value={inputSearch}
        onChange={(e) => {
          const value = e.target.value;
          // Update local input immediately for continuous typing
          setInputSearch(value);
          setPage(1);

          // Clear AI search state if active (user is performing a new query)
          if (isAiSearch) {
            setIsAiSearch(false);
            setAiSearchResults([]);
            setRelatedProducts([]);
          }

          // Clear related search cache for brand-new search
          if (value.length === 0) {
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('related_')) {
                localStorage.removeItem(key);
              }
            });
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // push current input into canonical search and run immediate search
            setSearch(inputSearch);
            handleSearch();
          }
        }}
        InputProps={{
          startAdornment: <Search sx={{ mr: 1, color: '#2874F0' }} />,
          endAdornment: searchLoading ? <CircularProgress size={20} /> : null
        }}
        sx={{ 
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: 'white',
            '&:hover fieldset': {
              borderColor: '#2874F0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2874F0',
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root': {
            color: '#666',
            '&.Mui-focused': {
              color: '#2874F0'
            }
          }
        }}
      />

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel sx={{ color: '#666', '&.Mui-focused': { color: '#2874F0' } }}>Category</InputLabel>
        <Select
          value={category}
          label="Category"
          onChange={(e) => handleFilterChange('category', e.target.value)}
          sx={{
            borderRadius: 2,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e0e0e0'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2874F0'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2874F0',
              borderWidth: 2
            }
          }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {availableCategories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel sx={{ color: '#666', '&.Mui-focused': { color: '#2874F0' } }}>Brand</InputLabel>
        <Select
          value={brand}
          label="Brand"
          onChange={(e) => handleFilterChange('brand', e.target.value)}
          sx={{
            borderRadius: 2,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e0e0e0'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2874F0'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2874F0',
              borderWidth: 2
            }
          }}
        >
          <MenuItem value="">All Brands</MenuItem>
          {availableBrands.map((br) => (
            <MenuItem key={br} value={br}>
              {br}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="#333">
          Price Range
        </Typography>
        <Typography variant="caption" color="#666" gutterBottom>
          ₹{availablePriceRange[0].toLocaleString('en-IN')} - ₹{availablePriceRange[1].toLocaleString('en-IN')}
        </Typography>
        <Slider
          value={priceRange}
          onChange={(e, newValue) => handleFilterChange('priceRange', newValue)}
          valueLabelDisplay="auto"
          min={availablePriceRange[0]}
          max={availablePriceRange[1]}
          sx={{
            color: '#2874F0',
            '& .MuiSlider-thumb': {
              backgroundColor: '#2874F0',
            },
            '& .MuiSlider-track': {
              backgroundColor: '#2874F0',
            },
            '& .MuiSlider-rail': {
              backgroundColor: '#e0e0e0',
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="#666">
            ₹{priceRange[0].toLocaleString('en-IN')}
          </Typography>
          <Typography variant="caption" color="#666">
            ₹{priceRange[1].toLocaleString('en-IN')}
          </Typography>
        </Box>
      </Box>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel sx={{ color: '#666', '&.Mui-focused': { color: '#2874F0' } }}>Minimum Rating</InputLabel>
        <Select
          value={rating}
          label="Minimum Rating"
          onChange={(e) => handleFilterChange('rating', e.target.value)}
          sx={{
            borderRadius: 2,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e0e0e0'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2874F0'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2874F0',
              borderWidth: 2
            }
          }}
        >
          <MenuItem value="">All Ratings</MenuItem>
          <MenuItem value="4">4+ Stars</MenuItem>
          <MenuItem value="3">3+ Stars</MenuItem>
          <MenuItem value="2">2+ Stars</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel sx={{ color: '#666', '&.Mui-focused': { color: '#2874F0' } }}>Sort By</InputLabel>
        <Select
          value={`${sortBy}-${sortOrder}`}
          label="Sort By"
          onChange={(e) => {
            const [sort, order] = e.target.value.split('-');
            setSortBy(sort);
            setSortOrder(order);
          }}
          sx={{
            borderRadius: 2,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e0e0e0'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2874F0'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2874F0',
              borderWidth: 2
            }
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
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product._id}>
                <ProductCard product={product} showScore />
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* AI Search Results - Combined Related + Search Results */}
      {isAiSearch && aiSearchResults.length > 0 && (
        <Paper 
          sx={{ 
            p: 3, 
            mb: 4, 
            background: 'linear-gradient(135deg, #2874F0 0%, #4B8BF5 100%)',
            borderRadius: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <FlashOn sx={{ mr: 2, color: 'white' }} />
            <Typography variant="h6" fontWeight="bold" color="white">
              AI Search Results
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ ml: 2 }}>
              For "{search}" - {aiSearchResults.some(p => p.vectorScore) ? 'Vector Search' : 'Smart Search'} - Showing related items first
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {aiSearchResults.map((product) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product._id}>
                <ProductCard product={product} isRelated={product.isRelated} showScore={!product.isRelated} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <Box sx={{ display: 'flex', gap: 3 }}>
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
                  {isAiSearch ? `${aiSearchResults.length} AI Results` : `${totalProducts} Products Found`}
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
                {!isAiSearch && (
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
                )}
                {isAiSearch && (
                  <Button
                    variant="outlined"
                    startIcon={<Close />}
                    onClick={() => {
                      setIsAiSearch(false);
                      setAiSearchResults([]);
                      fetchProducts();
                    }}
                    sx={{ 
                      borderColor: '#FF6B35',
                      color: '#FF6B35',
                      '&:hover': { 
                        backgroundColor: 'rgba(255, 107, 53, 0.08)',
                        borderColor: '#FF6B35'
                      }
                    }}
                  >
                    Clear AI Search
                  </Button>
                )}
                
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

          {/* Products - Hide when AI search is active since results are shown above */}
          {!isAiSearch && (
            <>
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

            {/* Pagination - Hide when AI search is active */}
            {!isAiSearch && totalPages > 1 && (
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
          </>
          )}
        </Box>

        {/* Filters - Desktop */}
        {!isMobile && (
          <Box sx={{ width: 280, flexShrink: 0 }}>
            <Paper 
              elevation={2}
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid #e0e0e0',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }
              }}
            >
              <FiltersPanel />
            </Paper>
          </Box>
        )}
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
