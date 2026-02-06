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
  Divider
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
  LocalOffer
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import AIChatbot from './AIChatbot';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
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

  if (isAuthenticated) {
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<Star />}
              sx={{ 
                color: 'white',
                fontSize: '0.8rem',
                textTransform: 'none',
                minWidth: 'auto'
              }}
            >
              Become a Seller
            </Button>
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
          </Box>

          {isAuthenticated ? (
            <>
              <IconButton
                color="inherit"
                onClick={handleMenuClick}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                  Profile
                </MenuItem>
                <MenuItem onClick={() => { navigate('/orders'); handleMenuClose(); }}>
                  Orders
                </MenuItem>
                <MenuItem onClick={() => { setChatbotOpen(true); handleMenuClose(); }}>
                  AI Assistant
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
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
          )}
        </Toolbar>

        {/* Mobile Search Bar */}
        <Box sx={{ px: 2, pb: 2, display: { xs: 'block', md: 'none' } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          </List>
        </Box>
      </Drawer>

      {/* AI Chatbot */}
      <AIChatbot open={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </>
  );
};

export default Header;
