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
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by the auth context
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

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: '#2874F0' }} />
              }}
            />

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
            />

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
                py: 1.5,
                '&:hover': { 
                  backgroundColor: '#E55A2B',
                  boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
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
