import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
  Fab,
  useTheme,
  Badge,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Store,
  TrendingUp,
  AttachMoney,
  ShoppingCart,
  Star,
  Image,
  Close,
  Upload,
  BusinessCenter,
  Analytics,
  Inventory,
  LocalShipping,
  CheckCircle,
  Pending,
  Cancel,
  Refresh,
  FilterList,
  Search,
  Category,
  LocalOffer,
  CloudUpload
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const theme = useTheme();
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
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

  const categories = [
    'electronics',
    'clothing', 
    'books',
    'home',
    'sports',
    'beauty',
    'toys'
  ];

  useEffect(() => {
    // Authentication is handled by ProtectedRoute, so we can safely fetch data
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setError(null);
      const response = await api.get('/products/seller');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response?.status === 403) {
        setError('Access denied. Only sellers can view products.');
      } else if (error.response?.status === 401) {
        setError('Please login to continue.');
      } else {
        setError('Failed to fetch products. Please try again.');
      }
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setError(null);
      const response = await api.get('/orders/seller');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 403) {
        setError('Access denied. Only sellers can view orders.');
      } else if (error.response?.status === 401) {
        setError('Please login to continue.');
      } else {
        setError('Failed to fetch orders. Please try again.');
        // Add mock data for demonstration
        setOrders([
          {
            _id: 'order1',
            customer: { name: 'John Doe', email: 'john@example.com' },
            items: [
              { quantity: 2, product: { name: 'iPhone 15 Pro' } },
              { quantity: 1, product: { name: 'AirPods Pro' } }
            ],
            total: 159999,
            status: 'pending',
            createdAt: new Date().toISOString()
          },
          {
            _id: 'order2',
            customer: { name: 'Jane Smith', email: 'jane@example.com' },
            items: [
              { quantity: 1, product: { name: 'Samsung Galaxy S24' } }
            ],
            total: 95999,
            status: 'processing',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            _id: 'order3',
            customer: { name: 'Mike Johnson', email: 'mike@example.com' },
            items: [
              { quantity: 3, product: { name: 'Nike Air Max 270' } }
            ],
            total: 29997,
            status: 'delivered',
            createdAt: new Date(Date.now() - 172800000).toISOString()
          }
        ]);
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    
    // Clear any existing errors when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
    
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData({
      ...formData,
      images: files.map(file => URL.createObjectURL(file))
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields before sending
      if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.brand || !formData.stock) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate numeric fields
      const price = parseFloat(formData.price);
      const stock = parseInt(formData.stock);
      
      if (isNaN(price) || price <= 0) {
        setError('Please enter a valid price greater than 0');
        return;
      }
      
      if (isNaN(stock) || stock < 0) {
        setError('Please enter a valid stock quantity (0 or greater)');
        return;
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: price,
        category: formData.category,
        brand: formData.brand.trim(),
        stock: stock,
        images: formData.images && formData.images.length > 0 ? formData.images : [],
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        features: formData.features ? formData.features.split(',').map(feature => feature.trim()).filter(feature => feature) : []
      };

      console.log('Submitting product data:', productData);

      let response;
      if (editingProduct) {
        response = await api.put(`/products/${editingProduct._id}`, productData);
        console.log('Product updated successfully:', response.data);
      } else {
        response = await api.post('/products', productData);
        console.log('Product created successfully:', response.data);
      }

      setOpenDialog(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
      
      // Show success message
      setSuccess(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
      setError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error('Error saving product:', error);
      let errorMessage = 'Failed to save product';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection.';
      } else {
        // Other error
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      setError(errorMessage);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand,
      stock: product.stock,
      images: product.images || [],
      tags: product.tags?.join(', ') || '',
      features: product.features?.join(', ') || ''
    });
    setOpenDialog(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        fetchProducts();
      } catch (error) {
        setError('Failed to delete product');
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      setError('Failed to update order status');
      console.error('Error updating order status:', error);
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

  const renderProductForm = () => (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3, color: '#2874F0', fontWeight: 600 }}>
        {editingProduct ? 'Edit Product' : 'Add New Product'}
      </Typography>
      
      {/* Product Information Section */}
      <Paper sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
          📦 Product Information
        </Typography>
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Product Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              required
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#2874F0' } } }}
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleInputChange('description')}
              required
              variant="outlined"
              placeholder="Describe your product in detail..."
              sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#2874F0' } } }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Pricing & Inventory Section */}
      <Paper sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
          💰 Pricing & Inventory
        </Typography>
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Price (₹)"
              type="number"
              value={formData.price}
              onChange={handleInputChange('price')}
              required
              variant="outlined"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                inputProps: { min: 0 }
              }}
              sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#2874F0' } } }}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Stock Quantity"
              type="number"
              value={formData.stock}
              onChange={handleInputChange('stock')}
              required
              variant="outlined"
              InputProps={{
                startAdornment: <Inventory sx={{ mr: 1, fontSize: 20, color: '#666' }} />,
                inputProps: { min: 0 }
              }}
              sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#2874F0' } } }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Category & Brand Section */}
      <Paper sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
          🏷️ Category & Brand
        </Typography>
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Brand"
              value={formData.brand}
              onChange={handleInputChange('brand')}
              required
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#2874F0' } } }}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth variant="outlined" required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={handleInputChange('category')}
                label="Category"
                sx={{ '&:hover .MuiOutlinedInput-root': { borderColor: '#2874F0' } }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Category sx={{ mr: 1, fontSize: 18, color: '#666' }} />
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tags & Features Section */}
      <Paper sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
          🏷️ Tags & Features
        </Typography>
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Tags"
              value={formData.tags}
              onChange={handleInputChange('tags')}
              variant="outlined"
              placeholder="e.g., electronics, smartphone, premium"
              helperText="Separate multiple tags with commas"
              InputProps={{
                startAdornment: <LocalOffer sx={{ mr: 1, fontSize: 20, color: '#666' }} />
              }}
              sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#2874F0' } } }}
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Features"
              value={formData.features}
              onChange={handleInputChange('features')}
              variant="outlined"
              placeholder="e.g., 5G enabled, Water resistant, Premium materials"
              helperText="Separate multiple features with commas"
              InputProps={{
                startAdornment: <Star sx={{ mr: 1, fontSize: 20, color: '#666' }} />
              }}
              sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#2874F0' } } }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Product Images Section */}
      <Paper sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
          📸 Product Images
        </Typography>
        
        <Button
          variant="outlined"
          component="label"
          sx={{ 
            border: '2px dashed #2874F0', 
            p: 3, 
            width: '100%', 
            color: '#2874F0',
            '&:hover': { 
              border: '2px solid #1976D2', 
              color: '#1976D2',
              bgcolor: 'rgba(25, 118, 210, 0.04)'
            }
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CloudUpload sx={{ fontSize: 40, color: '#2874F0', mb: 1 }} />
            <Typography variant="body2" sx={{ color: '#2874F0', fontWeight: 500 }}>
              Click to upload product images
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supported formats: JPG, PNG, GIF (Max 5MB)
            </Typography>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </Box>
        </Button>
        
        {formData.images.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>
              Uploaded Images ({formData.images.length}/5)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {formData.images.map((image, index) => (
                <Box key={index} sx={{ position: 'relative' }}>
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    style={{
                      width: 120,
                      height: 120,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '2px solid #e0e0e0'
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: '#ff4757',
                      color: 'white',
                      '&:hover': { bgcolor: '#ff3838' },
                      boxShadow: 2
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
          </Box>
        )}
      </Paper>
      
      <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
        <Button 
          onClick={() => {
            setOpenDialog(false);
            setEditingProduct(null);
            resetForm();
          }}
          sx={{ 
            color: '#666',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
          }}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          sx={{ 
            bgcolor: '#2874F0',
            color: 'white',
            px: 4,
            py: 1,
            '&:hover': { bgcolor: '#1976D2' }
          }}
        >
          {editingProduct ? 'Update Product' : 'Add Product'}
        </Button>
      </DialogActions>
    </Box>
  );

  const renderStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;

    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#2874F0', mr: 2 }}>
                  <Inventory />
                </Avatar>
                <Typography variant="h6">Total Products</Typography>
              </Box>
              <Typography variant="h4" color="#2874F0" fontWeight="bold">
                {products.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#4CAF50', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="h6">Total Value</Typography>
              </Box>
              <Typography variant="h4" color="#4CAF50" fontWeight="bold">
                ₹{products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#FF6B35', mr: 2 }}>
                  <ShoppingCart />
                </Avatar>
                <Typography variant="h6">Total Orders</Typography>
              </Box>
              <Typography variant="h4" color="#FF6B35" fontWeight="bold">
                {totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#9C27B0', mr: 2 }}>
                  <AttachMoney />
                </Avatar>
                <Typography variant="h6">Revenue</Typography>
              </Box>
              <Typography variant="h4" color="#9C27B0" fontWeight="bold">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#FF9800', mr: 2 }}>
                  <Pending />
                </Avatar>
                <Typography variant="h6">Pending Orders</Typography>
              </Box>
              <Typography variant="h4" color="#FF9800" fontWeight="bold">
                {pendingOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#4CAF50', mr: 2 }}>
                  <CheckCircle />
                </Avatar>
                <Typography variant="h6">Completed</Typography>
              </Box>
              <Typography variant="h4" color="#4CAF50" fontWeight="bold">
                {completedOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderProducts = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product._id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      style={{
                        width: 50,
                        height: 50,
                        objectFit: 'cover',
                        borderRadius: 4,
                        marginRight: 12
                      }}
                    />
                  ) : (
                    <Avatar sx={{ mr: 2, bgcolor: '#f0f0f0' }}>
                      <Store />
                    </Avatar>
                  )}
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.brand}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="bold" color="#2874F0">
                  ₹{product.price.toLocaleString('en-IN')}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={product.stock}
                  color={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={product.category}
                  variant="outlined"
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label="Active"
                  color="success"
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton
                  color="primary"
                  onClick={() => handleEdit(product)}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDelete(product._id)}
                >
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderOrders = () => {
    const filteredOrders = orderStatusFilter === 'all' 
      ? orders 
      : orders.filter(order => order.status === orderStatusFilter);

    const getStatusColor = (status) => {
      switch (status) {
        case 'pending': return 'warning';
        case 'processing': return 'info';
        case 'shipped': return 'primary';
        case 'delivered': return 'success';
        case 'cancelled': return 'error';
        default: return 'default';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'pending': return <Pending />;
        case 'processing': return <Refresh />;
        case 'shipped': return <LocalShipping />;
        case 'delivered': return <CheckCircle />;
        case 'cancelled': return <Cancel />;
        default: return null;
      }
    };

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Orders Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={orderStatusFilter}
                label="Status Filter"
                onChange={(e) => setOrderStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Orders</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={fetchOrders} color="primary">
              <Refresh />
            </IconButton>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Products</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      #{order._id.slice(-8)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {order.customer?.name || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.customer?.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ maxWidth: 200 }}>
                      {order.items?.map((item, index) => (
                        <Typography key={index} variant="caption" display="block">
                          {item.quantity}x {item.product?.name}
                        </Typography>
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color="#2874F0">
                      ₹{order.total?.toLocaleString('en-IN') || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status || 'pending'}
                      color={getStatusColor(order.status)}
                      size="small"
                      icon={getStatusIcon(order.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredOrders.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No orders found
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  if (productsLoading || ordersLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            error.includes('complete your business profile') && (
              <Button 
                color="inherit" 
                size="small"
                onClick={() => navigate('/profile')}
              >
                Complete Profile
              </Button>
            )
          }
        >
          {error}
        </Alert>
        {error.includes('complete your business profile') && (
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Business Profile Requirements
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              <ul>
                <li>Business Name</li>
                <li>Business Type</li>
                <li>Phone Number</li>
              </ul>
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Please complete your business registration to access seller features.
            </Typography>
          </Paper>
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Success Message */}
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}
      
      {/* Error Message */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="text.primary">
          Seller Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your products and track your sales performance
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" icon={<Analytics />} />
          <Tab label="Products" icon={<Inventory />} />
          <Tab label="Orders" icon={<ShoppingCart />} />
        </Tabs>
      </Box>

      {activeTab === 0 && renderStats()}
      {activeTab === 1 && renderProducts()}
      {activeTab === 2 && renderOrders()}

      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: theme.spacing(2),
          right: theme.spacing(2),
          backgroundColor: '#FF6B35',
          '&:hover': { backgroundColor: '#E55A2B' }
        }}
        onClick={() => {
          setEditingProduct(null);
          resetForm();
          setOpenDialog(true);
        }}
      >
        <Add />
      </Fab>

      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingProduct(null);
          resetForm();
        }}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'linear-gradient(135deg, #2874F0 0%, #4B8BF5 100%)',
          color: 'white',
          py: 3,
          px: 4,
          borderRadius: '16px 16px 0 0',
          '& .MuiDialogTitle-root': {
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              {editingProduct ? <Edit /> : <Add />}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Fill in the details below to {editingProduct ? 'update' : 'create'} your product
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => {
              setOpenDialog(false);
              setEditingProduct(null);
              resetForm();
            }}
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#fafafa' }}>
          <Box sx={{ p: 4 }}>
            {renderProductForm()}
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default SellerDashboard;
