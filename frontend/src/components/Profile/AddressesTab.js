import React from 'react';
import {
  Paper,
  Grid,
  Box,
  Button,
  Typography,
  Divider,
  Fade,
  Chip
} from '@mui/material';
import { LocationOn, Add, Home } from '@mui/icons-material';
import AddressCard from './AddressCard';
import AddressDialog from './AddressDialog';

const AddressesTab = ({
  addresses,
  user,
  onAddClick,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  addressDialogOpen,
  setAddressDialogOpen,
  addressForm,
  setAddressForm,
  onAddressSubmit,
  editingAddress
}) => {
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.2)'
              }}>
                <LocationOn sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
                  Your Addresses
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage your shipping and billing addresses
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {addresses.length > 0 && (
                <Fade in={addresses.length > 0}>
                  <Chip 
                    icon={<Home />}
                    label={`${addresses.length} ${addresses.length === 1 ? 'Address' : 'Addresses'}`}
                    size="small"
                    color="info"
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
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onAddClick}
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  padding: '10px 20px',
                  fontSize: '0.95rem',
                  background: 'linear-gradient(90deg, #ff6b35 0%, #f7931e 100%)',
                  boxShadow: '0 4px 12px rgba(255, 107, 53, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(255, 107, 53, 0.3)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Add New Address
              </Button>
            </Box>
          </Box>

          <Divider sx={{ mb: 3, opacity: 0.5 }} />

          {addresses.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(247, 147, 30, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}>
                <LocationOn sx={{ fontSize: 40, color: '#ff6b35', opacity: 0.7 }} />
              </Box>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                No addresses added yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 300, mx: 'auto' }}>
                Add your first address to make checkout faster and easier
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={onAddClick}
                sx={{
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#ff6b35',
                  color: '#ff6b35',
                  '&:hover': {
                    borderColor: '#f7931e',
                    backgroundColor: 'rgba(255, 107, 53, 0.04)'
                  }
                }}
              >
                Add Your First Address
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {addresses.map((address) => (
                <Grid item xs={12} md={6} lg={4} key={address._id}>
                  <AddressCard 
                    address={address}
                    onEdit={onEditAddress}
                    onDelete={onDeleteAddress}
                    onSetDefault={onSetDefaultAddress}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Grid>

      {/* Address Dialog */}
      <AddressDialog 
        open={addressDialogOpen}
        onClose={() => setAddressDialogOpen(false)}
        addressForm={addressForm}
        setAddressForm={setAddressForm}
        onSubmit={onAddressSubmit}
        isEditing={!!editingAddress}
      />
    </Grid>
  );
};

export default AddressesTab;
