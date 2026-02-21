import React, { useState, useRef, useEffect } from 'react';
import {
  Paper,
  Grid,
  TextField,
  Box,
  Button,
  Typography,
  Divider,
  CircularProgress,
  Fade,
  Chip
} from '@mui/material';
import { Person, Save, Edit } from '@mui/icons-material';

const AccountSettingsTab = ({ formData, setFormData, onSubmit, loading, resetKey }) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const initialDataRef = useRef(formData);

  // Reset initial data when resetKey changes (after successful submission)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    initialDataRef.current = formData;
    setHasChanges(false);
    setUsernameError('');
  }, [resetKey]);

  // Validate username
  const validateUsername = (username) => {
    if (!username) {
      setUsernameError('Username is required');
      return false;
    }
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return false;
    }
    if (username.length > 20) {
      setUsernameError('Username must be less than 20 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    setUsernameError('');
    return true;
  };

  // Check if form has changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const initialData = initialDataRef.current;
    const changed = formData.name !== initialData.name || 
                   formData.phone !== initialData.phone || 
                   formData.username !== initialData.username;
    setHasChanges(changed);
  }, [formData]);

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });
    
    // Validate username when it changes
    if (field === 'username') {
      validateUsername(value);
    }
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Paper sx={{ 
          p: 4,
          borderRadius: 2.5,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
                  Personal Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Update your personal details and contact information
                </Typography>
              </Box>
            </Box>
            {hasChanges && (
              <Fade in={hasChanges}>
                <Chip 
                  icon={<Edit />}
                  label="Unsaved changes"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ 
                    fontWeight: 500,
                    '& .MuiChip-icon': {
                      fontSize: 16
                    }
                  }}
                />
              </Fade>
            )}
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
                  onChange={handleInputChange('name')}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      transition: 'all 0.2s ease',
                      '&:hover fieldset': {
                        borderColor: '#2196f3'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2196f3',
                        borderWidth: 2
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
                  onChange={handleInputChange('username')}
                  helperText={usernameError || "Choose a unique username (letters, numbers, underscores)"}
                  error={!!usernameError}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      transition: 'all 0.2s ease',
                      '&:hover fieldset': {
                        borderColor: usernameError ? '#f44336' : '#2196f3'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: usernameError ? '#f44336' : '#2196f3',
                        borderWidth: 2
                      },
                      '&.Mui-error fieldset': {
                        borderColor: '#f44336'
                      }
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.95rem'
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: '0.8rem',
                      color: usernameError ? '#f44336' : 'text.secondary'
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
                  onChange={handleInputChange('email')}
                  disabled
                  helperText="Contact support to change email"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      backgroundColor: 'rgba(0,0,0,0.04)'
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.95rem',
                      color: 'text.secondary'
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
                  onChange={handleInputChange('phone')}
                  placeholder="+1 (555) 123-4567"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      transition: 'all 0.2s ease',
                      '&:hover fieldset': {
                        borderColor: '#2196f3'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2196f3',
                        borderWidth: 2
                      }
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.95rem'
                    }
                  }}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ 
              mt: 4, 
              display: 'flex', 
              justifyContent: 'flex-end',
              gap: 2
            }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => setFormData(initialDataRef.current)}
                disabled={!hasChanges || loading}
                sx={{
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  borderColor: 'rgba(0,0,0,0.2)',
                  color: '#666',
                  '&:hover': {
                    borderColor: 'rgba(0,0,0,0.3)',
                    backgroundColor: 'rgba(0,0,0,0.04)'
                  },
                  '&:disabled': {
                    color: 'rgba(0,0,0,0.3)',
                    borderColor: 'rgba(0,0,0,0.1)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!hasChanges || loading || !!usernameError}
                startIcon={loading ? <CircularProgress size={16} /> : <Save />}
                sx={{
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  background: 'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
                    boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  '&:disabled': {
                    background: 'rgba(0,0,0,0.12)',
                    color: 'rgba(0,0,0,0.3)',
                    boxShadow: 'none'
                  }
                }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AccountSettingsTab;
