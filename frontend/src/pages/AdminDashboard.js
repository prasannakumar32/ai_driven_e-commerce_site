import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  IconButton,
  LinearProgress,
  TextField,
  Stack,
  Skeleton
} from '@mui/material';
import {
  People,
  Store,
  LocalShipping,
  ShoppingCart,
  Inventory,
  AttachMoney,
  CheckCircle,
  Cancel,
  Refresh,
  TrendingUp,
  Visibility,
  Delete,
  Verified,
  Pending,
  Business,
  MoreVert,
  PersonAdd,
  Email,
  Phone,
  Key
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusDialog, setStatusDialog] = useState({ open: false, type: '', id: '', status: '' });
  const [createUserDialog, setCreateUserDialog] = useState({ open: false });
  const [assignDialog, setAssignDialog] = useState({ open: false, orderId: '' });
  const [selectedDeliveryPartner, setSelectedDeliveryPartner] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    phone: ''
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'admin') {
      if (activeTab === 1) fetchSellers();
      if (activeTab === 2) fetchDeliveryPartners();
      if (activeTab === 3) fetchOrders();
      if (activeTab === 4) fetchProducts();
      if (activeTab === 5) fetchUsers();
    }
  }, [activeTab, user]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      setError(null);
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Failed to load admin data. Please try again.');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchSellers = async () => {
    try {
      const response = await api.get('/admin/sellers');
      setSellers(response.data);
    } catch (err) {
      console.error('Error fetching sellers:', err);
    }
  };

  const fetchDeliveryPartners = async () => {
    try {
      const response = await api.get('/admin/delivery-partners');
      setDeliveryPartners(response.data);
    } catch (err) {
      console.error('Error fetching delivery partners:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products');
      setProducts(response.data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    switch (newValue) {
      case 1: fetchSellers(); break;
      case 2: fetchDeliveryPartners(); break;
      case 3: fetchOrders(); break;
      case 4: fetchProducts(); break;
      case 5: fetchUsers(); break;
      default: break;
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const { type, id, status } = statusDialog;
      let endpoint = '';

      if (type === 'seller') {
        endpoint = status === 'approved' ? `/admin/sellers/${id}/approve` : `/admin/sellers/${id}/reject`;
      } else if (type === 'deliveryPartner') {
        endpoint = status === 'approved' ? `/admin/delivery-partners/${id}/approve` : `/admin/delivery-partners/${id}/reject`;
      }

      await api.put(endpoint);
      setStatusDialog({ open: false, type: '', id: '', status: '' });

      // Refresh data
      if (type === 'seller') fetchSellers();
      if (type === 'deliveryPartner') fetchDeliveryPartners();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/admin/products/${productId}`);
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleCreateUser = async () => {
    try {
      await api.post('/admin/users', newUser);
      setCreateUserDialog({ open: false });
      setNewUser({ name: '', email: '', password: '', role: 'customer', phone: '' });
      fetchUsers();
      fetchStats();
      alert('User created successfully!');
    } catch (err) {
      console.error('Error creating user:', err);
      alert('Failed to create user. Please try again.');
    }
  };

  const handleAssignDeliveryPartner = async () => {
    try {
      await api.put(`/admin/orders/${assignDialog.orderId}/assign-delivery-partner`, { 
        deliveryPartnerId: selectedDeliveryPartner 
      });
      setAssignDialog({ open: false, orderId: '' });
      setSelectedDeliveryPartner('');
      fetchOrders();
      alert('Delivery partner assigned successfully!');
    } catch (err) {
      console.error('Error assigning delivery partner:', err);
      alert('Failed to assign delivery partner. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">
          Access denied. This page is only for administrators.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: '#f5f7fa',
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          px: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: '#1976d2',
              width: 56,
              height: 56
            }}>
              <Store sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
                Admin Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your e-commerce platform
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={fetchStats}
            sx={{
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' },
              px: 3,
              py: 1.5,
              borderRadius: 2
            }}
          >
            Refresh Data
          </Button>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        {statsLoading ? (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} sm={6} md={2.4} key={i}>
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ 
                bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(102, 126, 234, 0.5)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" fontWeight="bold" sx={{ fontSize: '2.5rem' }}>
                        {stats.users || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                        Total Users
                      </Typography>
                    </Box>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      width: 56,
                      height: 56
                    }}>
                      <People sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ 
                bgcolor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(240, 147, 251, 0.4)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(240, 147, 251, 0.5)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" fontWeight="bold" sx={{ fontSize: '2.5rem' }}>
                        {stats.sellers || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                        Sellers
                      </Typography>
                    </Box>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      width: 56,
                      height: 56
                    }}>
                      <Store sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ 
                bgcolor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(79, 172, 254, 0.4)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(79, 172, 254, 0.5)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" fontWeight="bold" sx={{ fontSize: '2.5rem' }}>
                        {stats.deliveryPartners || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                        Delivery Partners
                      </Typography>
                    </Box>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      width: 56,
                      height: 56
                    }}>
                      <LocalShipping sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ 
                bgcolor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(67, 233, 123, 0.4)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(67, 233, 123, 0.5)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" fontWeight="bold" sx={{ fontSize: '2.5rem' }}>
                        {stats.orders || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                        Orders
                      </Typography>
                    </Box>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      width: 56,
                      height: 56
                    }}>
                      <ShoppingCart sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ 
                bgcolor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(250, 112, 154, 0.4)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(250, 112, 154, 0.5)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" fontWeight="bold" sx={{ fontSize: '2.5rem' }}>
                        {stats.products || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                        Products
                      </Typography>
                    </Box>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      width: 56,
                      height: 56
                    }}>
                      <Inventory sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ 
                bgcolor: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(48, 207, 208, 0.4)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(48, 207, 208, 0.5)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" fontWeight="bold" sx={{ fontSize: '2rem' }}>
                        ₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                        Total Revenue
                      </Typography>
                    </Box>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      width: 56,
                      height: 56
                    }}>
                      <AttachMoney sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : null}

        {/* Pending Approvals Alert */}
        {(stats?.pendingSellers > 0 || stats?.pendingDeliveryPartners > 0) && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            action={
              <Button 
                color="inherit" 
                size="small"
                onClick={() => setActiveTab(1)}
              >
                Review Now
              </Button>
            }
          >
            You have {stats.pendingSellers} pending seller applications and {stats.pendingDeliveryPartners} pending delivery partner applications.
          </Alert>
        )}

        {/* Tabs */}
        <Paper sx={{ 
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              bgcolor: '#fafbfc',
              '& .MuiTab-root': {
                minHeight: 64,
                fontSize: '0.95rem',
                fontWeight: 500,
                textTransform: 'none',
                color: '#666',
                '&:hover': {
                  color: '#1976d2',
                  bgcolor: 'rgba(25, 118, 210, 0.04)'
                },
                '&.Mui-selected': {
                  color: '#1976d2',
                  fontWeight: 600,
                  bgcolor: 'rgba(25, 118, 210, 0.08)'
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)'
              }
            }}
          >
            <Tab label="Overview" icon={<TrendingUp />} iconPosition="start" />
            <Tab label={`Sellers (${sellers.length})`} icon={<Store />} iconPosition="start" />
            <Tab label={`Delivery Partners (${deliveryPartners.length})`} icon={<LocalShipping />} iconPosition="start" />
            <Tab label={`Orders (${orders.length})`} icon={<ShoppingCart />} iconPosition="start" />
            <Tab label={`Products (${products.length})`} icon={<Inventory />} iconPosition="start" />
            <Tab label={`Users (${users.length})`} icon={<People />} iconPosition="start" />
          </Tabs>
        </Paper>

      {/* Overview Tab */}
      {activeTab === 0 && stats && (
        <Box sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
            Recent Orders
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#fafbfc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.recentOrders?.map((order) => (
                  <TableRow key={order._id} hover sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>#{order._id?.slice(-8).toUpperCase()}</TableCell>
                    <TableCell>{order.user?.name}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>₹{order.totalPrice?.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        size="small" 
                        color={order.status === 'delivered' ? 'success' : order.status === 'pending' ? 'warning' : 'default'}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Sellers Tab */}
      {activeTab === 1 && (
        <Box sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
            Sellers Management
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#fafbfc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Business</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sellers.map((seller) => (
                  <TableRow key={seller._id} hover sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{seller.name}</TableCell>
                    <TableCell>{seller.email}</TableCell>
                    <TableCell>{seller.businessName}</TableCell>
                    <TableCell>
                      <Chip
                        label={seller.sellerStatus || 'pending'}
                        size="small"
                        color={seller.sellerStatus === 'approved' ? 'success' : seller.sellerStatus === 'rejected' ? 'error' : 'warning'}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      {seller.sellerStatus !== 'approved' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<CheckCircle />}
                            onClick={() => setStatusDialog({ open: true, type: 'seller', id: seller._id, status: 'approved' })}
                            sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#45a049' } }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<Cancel />}
                            onClick={() => setStatusDialog({ open: true, type: 'seller', id: seller._id, status: 'rejected' })}
                            sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' } }}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Delivery Partners Tab */}
      {activeTab === 2 && (
        <Box sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
            Delivery Partners Management
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#fafbfc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Operating Area</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveryPartners.map((partner) => (
                  <TableRow key={partner._id} hover sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{partner.name}</TableCell>
                    <TableCell>{partner.email}</TableCell>
                    <TableCell>{partner.vehicleType}</TableCell>
                    <TableCell>{partner.operatingArea}</TableCell>
                    <TableCell>
                      <Chip
                        label={partner.deliveryPartnerStatus || 'pending'}
                        size="small"
                        color={partner.deliveryPartnerStatus === 'active' ? 'success' : partner.deliveryPartnerStatus === 'suspended' ? 'error' : 'warning'}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      {partner.deliveryPartnerStatus !== 'active' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<CheckCircle />}
                            onClick={() => setStatusDialog({ open: true, type: 'deliveryPartner', id: partner._id, status: 'approved' })}
                            sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#45a049' } }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<Cancel />}
                            onClick={() => setStatusDialog({ open: true, type: 'deliveryPartner', id: partner._id, status: 'rejected' })}
                            sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' } }}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Orders Tab */}
      {activeTab === 3 && (
        <Box sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
            Orders Management
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#fafbfc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Delivery Partner</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id} hover sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>#{order._id?.slice(-8).toUpperCase()}</TableCell>
                    <TableCell>{order.user?.name}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>₹{order.totalPrice?.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        size="small"
                        color={order.status === 'delivered' ? 'success' : order.status === 'pending' ? 'warning' : 'default'}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>{order.deliveryPartner?.name || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={order.status}
                            onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                          >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="processing">Processing</MenuItem>
                            <MenuItem value="shipped">Shipped</MenuItem>
                            <MenuItem value="delivered">Delivered</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                          </Select>
                        </FormControl>
                        {order.status === 'shipped' && !order.deliveryPartner && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<LocalShipping />}
                            onClick={() => setAssignDialog({ open: true, orderId: order._id })}
                            sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                          >
                            Assign
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Products Tab */}
      {activeTab === 4 && (
        <Box sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
            Products Management
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#fafbfc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Stock</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Seller</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id} hover sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>₹{product.price?.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.seller?.businessName}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteProduct(product._id)}
                        sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' } }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Users Tab */}
      {activeTab === 5 && (
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Users Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => setCreateUserDialog({ open: true })}
              sx={{
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' },
                px: 3,
                py: 1.5,
                borderRadius: 2
              }}
            >
              Create User
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#fafbfc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((userItem) => (
                  <TableRow key={userItem._id} hover sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{userItem.name}</TableCell>
                    <TableCell>{userItem.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={userItem.role} 
                        size="small"
                        color={userItem.role === 'admin' ? 'error' : userItem.role === 'seller' ? 'warning' : 'default'}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>{new Date(userItem.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {userItem.role !== 'admin' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteUser(userItem._id)}
                          sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' } }}
                        >
                          Delete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, type: '', id: '', status: '' })}>
        <DialogTitle>
          {statusDialog.status === 'approved' ? 'Approve' : 'Reject'} {statusDialog.type === 'seller' ? 'Seller' : 'Delivery Partner'}
        </DialogTitle>
        <DialogContent>
          Are you sure you want to {statusDialog.status === 'approved' ? 'approve' : 'reject'} this {statusDialog.type === 'seller' ? 'seller' : 'delivery partner'}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, type: '', id: '', status: '' })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleStatusUpdate}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog 
        open={createUserDialog.open} 
        onClose={() => setCreateUserDialog({ open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAdd sx={{ color: '#1976d2' }} />
            Create New User
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              InputProps={{
                startAdornment: <People sx={{ mr: 1, color: '#666' }} />
              }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: '#666' }} />
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              InputProps={{
                startAdornment: <Key sx={{ mr: 1, color: '#666' }} />
              }}
            />
            <TextField
              fullWidth
              label="Phone (Optional)"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              InputProps={{
                startAdornment: <Phone sx={{ mr: 1, color: '#666' }} />
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={newUser.role}
                label="Role"
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="seller">Seller</MenuItem>
                <MenuItem value="delivery_partner">Delivery Partner</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setCreateUserDialog({ open: false })}
            sx={{ px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateUser}
            disabled={!newUser.name || !newUser.email || !newUser.password}
            sx={{ 
              px: 3,
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' },
              '&:disabled': { bgcolor: '#ccc' }
            }}
          >
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Delivery Partner Dialog */}
      <Dialog 
        open={assignDialog.open} 
        onClose={() => setAssignDialog({ open: false, orderId: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShipping sx={{ color: '#1976d2' }} />
            Assign Delivery Partner
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Delivery Partner</InputLabel>
              <Select
                value={selectedDeliveryPartner}
                label="Select Delivery Partner"
                onChange={(e) => setSelectedDeliveryPartner(e.target.value)}
              >
                {deliveryPartners
                  .filter(dp => dp.deliveryPartnerStatus === 'active' || dp.deliveryPartnerStatus === 'approved')
                  .map((dp) => (
                    <MenuItem key={dp._id} value={dp._id}>
                      {dp.name} - {dp.vehicleType} ({dp.operatingArea})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setAssignDialog({ open: false, orderId: '' })}
            sx={{ px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAssignDeliveryPartner}
            disabled={!selectedDeliveryPartner}
            sx={{ 
              px: 3,
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' },
              '&:disabled': { bgcolor: '#ccc' }
            }}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
