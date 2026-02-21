import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { Close, Home, LocationCity } from '@mui/icons-material';

const AddressDialog = ({
  open,
  onClose,
  addressForm,
  setAddressForm,
  onSubmit,
  isEditing
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
        }
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 'bold', 
        fontSize: '1.3rem',
        color: '#1a1a1a',
        pb: 2,
        pt: 3,
        px: 3,
        background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.02) 0%, rgba(247, 147, 30, 0.02) 100%)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2
          }}>
            {isEditing ? <LocationCity sx={{ fontSize: 20, color: 'white' }} /> : <Home sx={{ fontSize: 20, color: 'white' }} />}
          </Box>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
              {isEditing ? 'Edit Address' : 'Add New Address'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEditing ? 'Update your address details' : 'Enter your address information'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ py: 3, px: 3 }}>
        <Box component="form" onSubmit={onSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={addressForm.name}
                onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover fieldset': {
                      borderColor: '#ff6b35'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff6b35',
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
                label="Phone Number"
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover fieldset': {
                      borderColor: '#ff6b35'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff6b35',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.95rem'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={addressForm.street}
                onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover fieldset': {
                      borderColor: '#ff6b35'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff6b35',
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
                label="City"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover fieldset': {
                      borderColor: '#ff6b35'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff6b35',
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
                label="State/Province"
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover fieldset': {
                      borderColor: '#ff6b35'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff6b35',
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
                label="Postal Code"
                value={addressForm.postalCode}
                onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover fieldset': {
                      borderColor: '#ff6b35'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff6b35',
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
                label="Country"
                value={addressForm.country}
                onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover fieldset': {
                      borderColor: '#ff6b35'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff6b35',
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
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: '20px 24px', gap: 1 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 24px',
            border: '1px solid rgba(0,0,0,0.2)',
            color: '#1a1a1a',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.04)',
              borderColor: 'rgba(0,0,0,0.3)'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onSubmit} 
          variant="contained"
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 24px',
            background: 'linear-gradient(90deg, #ff6b35 0%, #f7931e 100%)',
            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(255, 107, 53, 0.3)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          {isEditing ? 'Update' : 'Add'} Address
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddressDialog;
