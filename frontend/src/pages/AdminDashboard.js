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
  InputLabel
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
  TrendingUp
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
  const [error, setError] = useState(null);
  const [statusDialog, setStatusDialog] = useState({ open: false, type: '', id: '', status: '' });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Failed to load admin data. Please try again.');
    } finally {
      setLoading(false);
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Admin Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchStats}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <People sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.users}
                    </Typography>
                    <Typography variant="body2">Users</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Store sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.sellers}
                    </Typography>
                    <Typography variant="body2">Sellers</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocalShipping sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.deliveryPartners}
                    </Typography>
                    <Typography variant="body2">Delivery Partners</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ShoppingCart sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.orders}
                    </Typography>
                    <Typography variant="body2">Orders</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Inventory sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.products}
                    </Typography>
                    <Typography variant="body2">Products</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#9C27B0', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AttachMoney sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      ₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="body2">Total Revenue</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Pending Approvals Alert */}
      {(stats?.pendingSellers > 0 || stats?.pendingDeliveryPartners > 0) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You have {stats.pendingSellers} pending seller applications and {stats.pendingDeliveryPartners} pending delivery partner applications.
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label={`Sellers (${sellers.length})`} />
          <Tab label={`Delivery Partners (${deliveryPartners.length})`} />
          <Tab label={`Orders (${orders.length})`} />
          <Tab label={`Products (${products.length})`} />
          <Tab label={`Users (${users.length})`} />
        </Tabs>
      </Paper>

      {/* Overview Tab */}
      {activeTab === 0 && stats && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Recent Orders
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentOrders?.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>#{order._id?.slice(-8).toUpperCase()}</TableCell>
                        <TableCell>{order.user?.name}</TableCell>
                        <TableCell>₹{order.totalPrice?.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <Chip label={order.status} size="small" color={order.status === 'delivered' ? 'success' : 'default'} />
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Sellers Tab */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Sellers Management
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Business</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sellers.map((seller) => (
                  <TableRow key={seller._id}>
                    <TableCell>{seller.name}</TableCell>
                    <TableCell>{seller.email}</TableCell>
                    <TableCell>{seller.businessName}</TableCell>
                    <TableCell>
                      <Chip
                        label={seller.sellerStatus || 'pending'}
                        size="small"
                        color={seller.sellerStatus === 'approved' ? 'success' : seller.sellerStatus === 'rejected' ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {seller.sellerStatus !== 'approved' && (
                        <>
                          <Button
                            size="small"
                            startIcon={<CheckCircle />}
                            onClick={() => setStatusDialog({ open: true, type: 'seller', id: seller._id, status: 'approved' })}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            startIcon={<Cancel />}
                            onClick={() => setStatusDialog({ open: true, type: 'seller', id: seller._id, status: 'rejected' })}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Delivery Partners Tab */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Delivery Partners Management
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Operating Area</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveryPartners.map((partner) => (
                  <TableRow key={partner._id}>
                    <TableCell>{partner.name}</TableCell>
                    <TableCell>{partner.email}</TableCell>
                    <TableCell>{partner.vehicleType}</TableCell>
                    <TableCell>{partner.operatingArea}</TableCell>
                    <TableCell>
                      <Chip
                        label={partner.deliveryPartnerStatus || 'pending'}
                        size="small"
                        color={partner.deliveryPartnerStatus === 'active' ? 'success' : partner.deliveryPartnerStatus === 'suspended' ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {partner.deliveryPartnerStatus !== 'active' && (
                        <>
                          <Button
                            size="small"
                            startIcon={<CheckCircle />}
                            onClick={() => setStatusDialog({ open: true, type: 'deliveryPartner', id: partner._id, status: 'approved' })}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            startIcon={<Cancel />}
                            onClick={() => setStatusDialog({ open: true, type: 'deliveryPartner', id: partner._id, status: 'rejected' })}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Orders Tab */}
      {activeTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Orders Management
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Delivery Partner</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>#{order._id?.slice(-8).toUpperCase()}</TableCell>
                    <TableCell>{order.user?.name}</TableCell>
                    <TableCell>₹{order.totalPrice?.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Chip label={order.status} size="small" />
                    </TableCell>
                    <TableCell>{order.deliveryPartner?.name || 'Unassigned'}</TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Products Tab */}
      {activeTab === 4 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Products Management
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Seller</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>₹{product.price?.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.seller?.businessName}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Users Tab */}
      {activeTab === 5 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Users Management
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((userItem) => (
                  <TableRow key={userItem._id}>
                    <TableCell>{userItem.name}</TableCell>
                    <TableCell>{userItem.email}</TableCell>
                    <TableCell>
                      <Chip label={userItem.role} size="small" />
                    </TableCell>
                    <TableCell>{new Date(userItem.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {userItem.role !== 'admin' && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteUser(userItem._id)}
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
        </Paper>
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
    </Container>
  );
};

export default AdminDashboard;
