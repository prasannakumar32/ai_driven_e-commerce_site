import React from 'react';
import {
  Paper,
  Grid,
  Box,
  Button,
  Typography,
  Divider
} from '@mui/material';
import { MapPin, Add } from '@mui/icons-material';
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
          border: '1px solid rgba(0,0,0,0.06)'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
                <MapPin sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
                Your Addresses
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onAddClick}
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                padding: '8px 18px',
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
              Add Address
            </Button>
          </Box>

          <Divider sx={{ mb: 3, opacity: 0.5 }} />

          {addresses.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <MapPin sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                No addresses added yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Add your first address to get started
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2.5}>
              {addresses.map((address) => (
                <Grid item xs={12} md={6} key={address._id}>
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
