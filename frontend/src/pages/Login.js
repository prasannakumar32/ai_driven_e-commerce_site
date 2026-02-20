import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link as MuiLink,
  Divider,
  Grid,
  useTheme,
  IconButton
} from '@mui/material';
import { 
  Store, 
  Email, 
  Lock, 
  Person, 
  ArrowBack,
  Security,
  Verified
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error } = useAuth();
  const theme = useTheme();
  
  // Get the redirect path from location state, or default to home
  const from = location.state?.from?.pathname || '/';
  
  const [formData, setFormData] = useState({
    loginIdentifier: '',
    password: ''
  });
  const [isGuestLogin, setIsGuestLogin] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('[Login] Form submitted:', { loginIdentifier: formData.loginIdentifier });
      
      // Check if it's a guest login (email or phone)
      const isGuestLogin = !formData.loginIdentifier.includes('@') && (formData.loginIdentifier.includes('phone') || formData.loginIdentifier.includes('email'));
      
      if (isGuestLogin) {
        // Generate a guest ID and proceed as guest
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        
        // Store guest ID in localStorage for checkout
        localStorage.setItem('guestId', guestId);
        localStorage.setItem('guestName', formData.loginIdentifier);
        
        // Create a temporary guest user session
        const guestUser = {
          id: null,
          isGuest: true,
          guestId: guestId,
          name: formData.loginIdentifier,
          email: formData.loginIdentifier.includes('@') ? formData.loginIdentifier : ''
        };
        
        // Set guest user in context
        login(formData.loginIdentifier, '', true, guestId);
        
        // Redirect to checkout with guest access
        navigate('/checkout', { 
          state: { 
            from: '/login',
            message: 'Logged in as guest. You can now proceed to checkout.'
          }
        });
      } else {
        // Regular user login
        console.log('[Login] Regular user login attempt');
        await login(formData.loginIdentifier, formData.password);
        console.log('[Login] Success, redirecting to:', from);
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('[Login] Submit failed:', error.message);
      // Error is handled by the auth context and displayed via the error state
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2874F0 0%, #4B8BF5 100%)',
      display: 'flex',
      alignItems: 'center',
      py: 4
    }}>
      <Container maxWidth="sm">
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <IconButton 
            onClick={() => navigate('/')}
            sx={{ 
              position: 'absolute',
              left: 20,
              top: 20,
              color: 'white'
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Store sx={{ fontSize: 48, color: '#FF6B35', mr: 2 }} />
            <Typography variant="h3" fontWeight="bold" color="white">
              PKS
            </Typography>
            <Typography variant="caption" color="#FFE500" sx={{ ml: 1, fontWeight: 'bold' }}>
              STORE
            </Typography>
          </Box>
          <Typography variant="h6" color="white" sx={{ opacity: 0.9 }}>
            Welcome back! Sign in to continue shopping
          </Typography>
        </Box>

        <Paper 
          elevation={8} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            boxShadow: '0 12px 32px rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center" color="text.primary">
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
            Access your personalized shopping experience
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Button
              variant={isGuestLogin ? "outlined" : "contained"}
              size="small"
              onClick={() => {
                setIsGuestLogin(false);
                setFormData({ loginIdentifier: '', password: '' });
              }}
              sx={{ 
                mr: 1,
                backgroundColor: isGuestLogin ? 'transparent' : '#2874F0',
                color: isGuestLogin ? '#2874F0' : 'white',
                border: isGuestLogin ? '1px solid #2874F0' : 'none'
              }}
            >
              Sign In
            </Button>
            <Button
              variant={isGuestLogin ? "contained" : "outlined"}
              size="small"
              onClick={() => {
                setIsGuestLogin(true);
                setFormData({ loginIdentifier: '', password: '' });
              }}
              sx={{ 
                backgroundColor: isGuestLogin ? '#FF6B35' : 'transparent',
                color: isGuestLogin ? 'white' : '#FF6B35',
                border: isGuestLogin ? 'none' : '1px solid #FF6B35'
              }}
            >
              Guest Checkout
            </Button>
          </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={isGuestLogin ? "Email or Phone Number" : "Username or Email"}
              name="loginIdentifier"
              type="text"
              value={formData.loginIdentifier}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: isGuestLogin ? <Email sx={{ mr: 1, color: '#2874F0' }} /> : <Person sx={{ mr: 1, color: '#2874F0' }} />
              }}
              placeholder={isGuestLogin ? "Enter your email or phone number" : "Enter username or email"}
            />

            {!isGuestLogin && (
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: '#2874F0' }} />
                }}
                placeholder="Enter your password"
              />
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                mb: 3,
                backgroundColor: '#FF6B35',
                fontWeight: 'bold',
                color: 'white'
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : (isGuestLogin ? 'Continue as Guest' : 'Sign In')}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <MuiLink component={Link} to="/register" sx={{ color: '#2874F0', fontWeight: 500 }}>
                New to PKS? Create an account
              </MuiLink>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Don't have an account?{' '}
              <MuiLink component={Link} to="/register" sx={{ color: '#2874F0', fontWeight: 500 }}>
                Sign up now
              </MuiLink>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Security sx={{ fontSize: 16, color: '#4CAF50' }} />
            <Typography variant="caption" color="#4CAF50">
              Secure login powered by PKS
            </Typography>
            <Verified sx={{ fontSize: 16, color: '#4CAF50' }} />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
