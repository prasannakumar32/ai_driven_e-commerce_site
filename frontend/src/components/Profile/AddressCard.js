import React from 'react';
import {
  Card,
  CardContent,
  Button,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { Edit, Delete, Home as HomeIcon } from '@mui/icons-material';

const AddressCard = ({ 
  address, 
  onEdit, 
  onDelete, 
  onSetDefault 
}) => {
  return (
    <Card sx={{ 
      position: 'relative',
      borderRadius: 2,
      border: '1px solid rgba(0,0,0,0.08)',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
        transform: 'translateY(-2px)'
      }
    }}>
      {address.isDefault && (
        <Chip
          label="Default"
          color="primary"
          size="small"
          variant="filled"
          sx={{ 
            position: 'absolute', 
            top: 12, 
            right: 12,
            fontWeight: 600,
            background: 'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)'
          }}
        />
      )}
      <CardContent sx={{ pb: 2 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ color: '#1a1a1a', mt: address.isDefault ? 2 : 0 }}>
          {address.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {address.address}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {address.city}, {address.state} {address.postalCode}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {address.country}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, fontWeight: 500 }}>
          📞 {address.phone}
        </Typography>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Edit />}
            onClick={() => onEdit(address)}
            sx={{ 
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.85rem',
              borderColor: 'rgba(0,0,0,0.2)',
              color: '#1a1a1a',
              '&:hover': {
                backgroundColor: 'rgba(33, 150, 243, 0.05)',
                borderColor: '#2196f3'
              }
            }}
          >
            Edit
          </Button>
          {!address.isDefault && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => onSetDefault(address._id)}
              sx={{ 
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.85rem',
                borderColor: 'rgba(0,0,0,0.2)',
                color: '#1a1a1a',
                '&:hover': {
                  backgroundColor: 'rgba(76, 175, 80, 0.05)',
                  borderColor: '#4caf50'
                }
              }}
            >
              Set Default
            </Button>
          )}
          <Button
            size="small"
            color="error"
            variant="outlined"
            startIcon={<Delete />}
            onClick={() => onDelete(address._id)}
            sx={{ 
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.85rem',
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.05)'
              }
            }}
          >
            Delete
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AddressCard;
