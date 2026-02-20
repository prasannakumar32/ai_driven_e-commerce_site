import React from 'react';
import {
  Paper,
  Grid,
  TextField,
  Box,
  Button,
  Typography,
  Divider,
  CircularProgress
} from '@mui/material';
import { Person, CheckCircle } from '@mui/icons-material';

const AccountSettingsTab = ({ formData, setFormData, onSubmit, loading }) => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Paper sx={{ 
          p: 4,
          borderRadius: 2.5,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)'
            }}>
              <Person sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
              Personal Information
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3, opacity: 0.5 }} />
          
          <Box component="form" onSubmit={onSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      '&:hover fieldset': {
                        borderColor: '#2196f3'
                      }
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.95rem'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  helperText="Username cannot be changed after registration"
                  disabled
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.95rem'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.95rem'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  helperText="Enter 10-digit mobile number (e.g., 9003381176)"
                  inputProps={{ maxLength: 10 }}
                  error={formData.phone && (!/^[6-9]\d{9}$/.test(formData.phone))}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      '&:hover fieldset': {
                        borderColor: '#2196f3'
                      }
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.95rem'
                    }
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                sx={{
                  px: 4,
                  py: 1.25,
                  borderRadius: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  background: 'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(33, 150, 243, 0.3)',
                    transform: 'translateY(-2px)'
                  },
                  '&:disabled': {
                    opacity: 0.7
                  }
                }}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AccountSettingsTab;
