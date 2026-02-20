import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box
} from '@mui/material';

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
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2.5
        }
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 'bold', 
        fontSize: '1.2rem',
        color: '#1a1a1a',
        pb: 2
      }}>
        {isEditing ? '✏️ Edit Address' : '➕ Add New Address'}
      </DialogTitle>
      <DialogContent sx={{ py: 2 }}>
        <Box component="form" onSubmit={onSubmit}>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={addressForm.name}
                onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    '&:hover fieldset': {
                      borderColor: '#2196f3'
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={addressForm.address}
                onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                required
                multiline
                rows={3}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    '&:hover fieldset': {
                      borderColor: '#2196f3'
                    }
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
                    borderRadius: 1.5,
                    '&:hover fieldset': {
                      borderColor: '#2196f3'
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="State"
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    '&:hover fieldset': {
                      borderColor: '#2196f3'
                    }
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
                    borderRadius: 1.5,
                    '&:hover fieldset': {
                      borderColor: '#2196f3'
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                required
                helperText="10-digit mobile number"
                inputProps={{ maxLength: 10 }}
                error={addressForm.phone && (!/^[6-9]\d{9}$/.test(addressForm.phone))}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    '&:hover fieldset': {
                      borderColor: '#2196f3'
                    }
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
