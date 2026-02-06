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
  useTheme,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { 
  Store, 
  Email, 
  Lock, 
  Person, 
  ArrowBack,
  Security,
  Verified,
  HowToReg,
  BusinessCenter
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const theme = useTheme();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer', // customer or seller
    businessName: '', // for sellers
    businessType: '', // for sellers
    gstNumber: '', // for sellers
    phone: ''
  });

  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setValidationError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.role === 'seller') {
      if (!formData.businessName || !formData.businessType) {
        setValidationError('Business name and type are required for sellers');
        return false;
      }
      if (!formData.phone || formData.phone.length < 10) {
        setValidationError('Valid phone number is required');
        return false;
      }
    }
    if (!formData.email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password, formData.role, formData);
      if (formData.role === 'seller') {
        navigate('/seller-dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FF6B35 0%, #FFE500 100%)',
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
            <Store sx={{ fontSize: 48, color: '#2874F0', mr: 2 }} />
            <Typography variant="h3" fontWeight="bold" color="white">
              PKS
            </Typography>
            <Typography variant="caption" color="#2874F0" sx={{ ml: 1, fontWeight: 'bold' }}>
              STORE
            </Typography>
          </Box>
          <Typography variant="h6" color="white" sx={{ opacity: 0.9 }}>
            Join PKS for an amazing shopping experience!
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
            Join PKS {formData.role === 'seller' ? 'as a Seller' : 'as a Customer'}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
            {formData.role === 'seller' 
              ? 'Start selling to millions of customers across India' 
              : 'Get personalized recommendations and exclusive deals'
            }
          </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {validationError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {validationError}
          </Alert>
        )}

          <Box component="form" onSubmit={handleSubmit}>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <Typography variant="body1" fontWeight="medium" gutterBottom>
                Account Type
              </Typography>
              <RadioGroup
                row
                name="role"
                value={formData.role}
                onChange={handleChange}
                sx={{ justifyContent: 'center' }}
              >
                <FormControlLabel 
                  value="customer" 
                  control={<Radio />} 
                  label="Customer" 
                />
                <FormControlLabel 
                  value="seller" 
                  control={<Radio />} 
                  label="Seller" 
                />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <Person sx={{ mr: 1, color: '#FF6B35' }} />
              }}
            />

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
                startAdornment: <Email sx={{ mr: 1, color: '#FF6B35' }} />
              }}
            />

            {formData.role === 'seller' && (
              <>
                <TextField
                  fullWidth
                  label="Business Name"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: <BusinessCenter sx={{ mr: 1, color: '#FF6B35' }} />
                  }}
                />

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Business Type</InputLabel>
                  <Select
                    value={formData.businessType}
                    label="Business Type"
                    name="businessType"
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="individual">Individual</MenuItem>
                    <MenuItem value="partnership">Partnership</MenuItem>
                    <MenuItem value="company">Company</MenuItem>
                    <MenuItem value="llp">LLP</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: '#FF6B35' }} />
                  }}
                />

                <TextField
                  fullWidth
                  label="GST Number (Optional)"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  sx={{ mb: 3 }}
                />
              </>
            )}

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              helperText="Minimum 6 characters"
              InputProps={{
                startAdornment: <Lock sx={{ mr: 1, color: '#FF6B35' }} />
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <Lock sx={{ mr: 1, color: '#FF6B35' }} />
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
                backgroundColor: '#2874F0',
                fontWeight: 'bold',
                py: 1.5,
                '&:hover': { 
                  backgroundColor: '#1A5BC4',
                  boxShadow: '0 4px 12px rgba(40, 116, 240, 0.3)'
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <MuiLink component={Link} to="/login" sx={{ color: '#FF6B35', fontWeight: 500 }}>
                Already have an account? Sign in
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
              Already have an account?{' '}
              <MuiLink component={Link} to="/login" sx={{ color: '#FF6B35', fontWeight: 500 }}>
                Sign in here
              </MuiLink>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Security sx={{ fontSize: 16, color: '#4CAF50' }} />
            <Typography variant="caption" color="#4CAF50">
              Secure registration powered by PKS
            </Typography>
            <Verified sx={{ fontSize: 16, color: '#4CAF50' }} />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
