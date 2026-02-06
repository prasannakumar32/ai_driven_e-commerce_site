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
  Search
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'seller') {
      navigate('/');
      return;
    }
    
    fetchProducts();
    fetchOrders();
  }, [isAuthenticated, user, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products/seller');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/seller');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
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
  };

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

  const handleSubmit = async (e) => {
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

      if (editingProduct) {
        await fetch(`/api/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
      }

      setOpenDialog(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      setError('Failed to save product');
      console.error('Error saving product:', error);
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
        await fetch(`/api/products/${productId}`, {
          method: 'DELETE'
        });
        fetchProducts();
      } catch (error) {
        setError('Failed to delete product');
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
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
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Product Name"
            value={formData.name}
            onChange={handleInputChange('name')}
            required
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={formData.description}
            onChange={handleInputChange('description')}
            required
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Price (₹)"
            type="number"
            value={formData.price}
            onChange={handleInputChange('price')}
            required
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Stock Quantity"
            type="number"
            value={formData.stock}
            onChange={handleInputChange('stock')}
            required
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Brand"
            value={formData.brand}
            onChange={handleInputChange('brand')}
            required
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Category"
            value={formData.category}
            onChange={handleInputChange('category')}
            required
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Tags (comma separated)"
            value={formData.tags}
            onChange={handleInputChange('tags')}
            helperText="e.g., electronics, smartphone, premium"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Features (comma separated)"
            value={formData.features}
            onChange={handleInputChange('features')}
            helperText="e.g., 5G enabled, Water resistant, Premium materials"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Button
            variant="outlined"
            component="label"
            sx={{ border: '2px dashed #ccc', p: 3, width: '100%' }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Upload sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Click to upload product images
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
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {formData.images.map((image, index) => (
                <Box key={index} sx={{ position: 'relative' }}>
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    style={{
                      width: 100,
                      height: 100,
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
          )}
        </Grid>
      </Grid>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={() => {
          setOpenDialog(false);
          setEditingProduct(null);
          resetForm();
        }}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="primary">
          {editingProduct ? 'Update' : 'Add'} Product
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
        <Grid item xs={12} sm={6} md={3}>
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
        
        <Grid item xs={12} sm={6} md={3}>
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
        
        <Grid item xs={12} sm={6} md={3}>
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
        
        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          {renderProductForm()}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default SellerDashboard;
