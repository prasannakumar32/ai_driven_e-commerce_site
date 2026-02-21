import React from 'react';
import {
  Paper,
  Avatar,
  Typography,
  Chip,
  Box,
  Divider
} from '@mui/material';

const ProfileCard = ({ user, orders, addresses }) => {
  return (
    <Box sx={{ width: '100%' }}>
      {/* User Profile Card */}
      <Paper 
        sx={{ 
          p: 3,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
          color: 'white',
          borderRadius: 2.5,
          boxShadow: '0 8px 24px rgba(33, 150, 243, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 32px rgba(33, 150, 243, 0.3)',
            transform: 'translateY(-2px)'
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Avatar 
          sx={{ 
            width: 100, 
            height: 100, 
            mx: 'auto', 
            mb: 2,
            bgcolor: 'rgba(255,255,255,0.25)', 
            fontSize: '2.5rem',
            border: '3px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            fontWeight: 'bold',
            position: 'relative',
            zIndex: 1
          }}
        >
          {user.name?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        
        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ position: 'relative', zIndex: 1 }}>
          {user.name || 'User Name'}
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 2, 
            opacity: 0.9,
            wordBreak: 'break-all',
            position: 'relative',
            zIndex: 1
          }}
        >
          {user.email || 'user@example.com'}
        </Typography>
        
        <Chip 
          label={user.role === 'seller' ? 'Seller Account' : 'Customer'} 
          color={user.role === 'seller' ? 'secondary' : 'primary'} 
          size="medium"
          sx={{ 
            fontWeight: 'bold',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            '& .MuiChip-label': {
              px: 1.5
            },
            position: 'relative',
            zIndex: 1
          }}
        />
      </Paper>
      
      {/* Quick Stats */}
      <Paper sx={{ 
        p: 3, 
        borderRadius: 2.5,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        mt: 3,
        border: '1px solid rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }
      }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ color: '#1a1a1a' }}>
          Account Overview
        </Typography>
        <Divider sx={{ my: 2, opacity: 0.5 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" fontWeight="500">Member Since</Typography>
            <Typography variant="body2" fontWeight="600" color="#1a1a1a">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'short',
                day: 'numeric'
              }) : new Date().toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'short',
                day: 'numeric'
              })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" fontWeight="500">Total Orders</Typography>
            <Chip 
              label={orders?.length || 0} 
              color="primary" 
              size="small"
              variant="outlined"
              sx={{ 
                fontWeight: 'bold',
                minWidth: '40px',
                justifyContent: 'center'
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" fontWeight="500">Saved Addresses</Typography>
            <Chip 
              label={addresses?.length || 0} 
              color="primary" 
              size="small"
              variant="outlined"
              sx={{ 
                fontWeight: 'bold',
                minWidth: '40px',
                justifyContent: 'center'
              }}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfileCard;
