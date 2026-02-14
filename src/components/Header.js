import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Button,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Search,
  ShoppingCart,
  AccountCircle,
  Menu as MenuIcon,
  Home,
  Category,
  Person,
  Chat,
  Close,
  Store,
  Star,
  LocalOffer,
  BusinessCenter,
  Receipt,
  Logout,
  SmartToy
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import AIChatbot from './AIChatbot';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, loading } = useAuth();
  const { getItemCount } = useCart();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleMenuClose();
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Products', icon: <Category />, path: '/products' },
  ];

  // Only add authenticated menu items when not loading and authenticated
  if (!loading && isAuthenticated) {
    menuItems.push(
      { text: 'Profile', icon: <Person />, path: '/profile' },
      { text: 'AI Assistant', icon: <Chat />, action: () => setChatbotOpen(true) }
    );
  }

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: '#2874F0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            sx={{ mr: 2, display: { sm: 'none' } }}
            onClick={() => setMobileMenuOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Store sx={{ mr: 1, fontSize: 28, color: '#FF6B35' }} />
            <Typography
              variant="h5"
              component="div"
              sx={{ 
                fontWeight: 'bold',
                color: 'white',
                letterSpacing: 0.5
              }}
            >
              PKS
            </Typography>
            <Typography
              variant="caption"
              component="div"
              sx={{ 
                ml: 1,
                color: '#FFE500',
                fontWeight: 'bold',
                fontSize: '0.7rem'
              }}
            >
              STORE
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              maxWidth: 500, 
              mx: 2,
              flexGrow: 1
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(e);
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover fieldset': {
                    border: 'none',
                  },
                  '&.Mui-focused fieldset': {
                    border: '1px solid #2874F0',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#212121',
                  padding: '8px 12px',
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1, justifyContent: 'flex-end' }}>
            {/* Show Become Seller button only for non-authenticated users or customers, but not during loading */}
            {!loading && (!isAuthenticated || user?.role !== 'seller') && (
              <Button
                color="inherit"
                startIcon={<Star />}
                sx={{ 
                  color: 'white',
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  minWidth: 'auto'
                }}
                onClick={() => navigate('/become-seller')}
              >
                Become a Seller
              </Button>
            )}
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)', mx: 1 }} />
            <Button
              color="inherit"
              startIcon={<LocalOffer />}
              sx={{ 
                color: 'white',
                fontSize: '0.8rem',
                textTransform: 'none',
                minWidth: 'auto'
              }}
            >
              Offers
            </Button>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)', mx: 1 }} />
            <IconButton
              color="inherit"
              onClick={() => navigate('/cart')}
              sx={{ mx: 1 }}
            >
              <Badge badgeContent={getItemCount()} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {/* Show loading spinner during authentication verification */}
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                <CircularProgress size={24} sx={{ color: 'white' }} />
              </Box>
            ) : isAuthenticated ? (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleMenuClick}
                  sx={{ 
                    ml: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: 'secondary.main',
                      border: '2px solid rgba(255,255,255,0.3)',
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <MenuItem sx={{ pb: 1, borderBottom: '1px solid #f0f0f0' }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {user?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user?.email}
                      </Typography>
                      {user?.role === 'seller' && (
                        <Typography variant="caption" color="primary" display="block">
                          Seller
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                  {user?.role === 'seller' && (
                    <MenuItem onClick={() => { navigate('/seller-dashboard'); handleMenuClose(); }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessCenter fontSize="small" />
                        Seller Dashboard
                      </Box>
                    </MenuItem>
                  )}
                  <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" />
                      Profile
                    </Box>
                  </MenuItem>
                  <MenuItem onClick={() => { navigate('/orders'); handleMenuClose(); }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Receipt fontSize="small" />
                      Orders
                    </Box>
                  </MenuItem>
                  <MenuItem onClick={() => { setChatbotOpen(true); handleMenuClose(); }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SmartToy fontSize="small" />
                      AI Assistant
                    </Box>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Logout fontSize="small" />
                      Logout
                    </Box>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              !loading && (
                <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    color="inherit"
                    variant="outlined"
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </Button>
                </Box>
              )
            )}
          </Box>
        </Toolbar>

        {/* Mobile Search Bar */}
        <Box sx={{ px: 2, pb: 2, display: { xs: 'block', md: 'none' } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e);
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              backgroundColor: 'white',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: '1px solid #2874F0',
                },
              },
              '& .MuiInputBase-input': {
                color: '#212121',
                padding: '8px 12px',
              },
            }}
          />
        </Box>
      </AppBar>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Menu</Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <Divider />
          <List>
            {menuItems.map((item, index) => (
              <ListItem
                button
                key={index}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    navigate(item.path);
                  }
                  setMobileMenuOpen(false);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
            
            {/* Add user avatar and menu items in mobile drawer only when not loading */}
            {!loading && isAuthenticated && (
              <>
                <Divider />
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                    <Avatar 
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        bgcolor: 'secondary.main',
                        fontWeight: 'bold'
                      }}
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {user?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user?.email}
                      </Typography>
                      {user?.role === 'seller' && (
                        <Typography variant="caption" color="primary" display="block">
                          Seller
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </ListItem>
                <Divider />
                {user?.role === 'seller' && (
                  <ListItem button onClick={() => { navigate('/seller-dashboard'); setMobileMenuOpen(false); }}>
                    <ListItemIcon><BusinessCenter /></ListItemIcon>
                    <ListItemText primary="Seller Dashboard" />
                  </ListItem>
                )}
                <ListItem button onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>
                  <ListItemIcon><Person /></ListItemIcon>
                  <ListItemText primary="Profile" />
                </ListItem>
                <ListItem button onClick={() => { navigate('/orders'); setMobileMenuOpen(false); }}>
                  <ListItemIcon><Receipt /></ListItemIcon>
                  <ListItemText primary="Orders" />
                </ListItem>
                <ListItem button onClick={() => { setChatbotOpen(true); setMobileMenuOpen(false); }}>
                  <ListItemIcon><SmartToy /></ListItemIcon>
                  <ListItemText primary="AI Assistant" />
                </ListItem>
                <ListItem button onClick={handleLogout}>
                  <ListItemIcon><Logout /></ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      {/* AI Chatbot */}
      <AIChatbot open={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </>
  );
};

export default Header;
