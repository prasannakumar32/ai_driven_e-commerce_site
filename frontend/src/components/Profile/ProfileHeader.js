import React from 'react';
import { Box, Typography } from '@mui/material';

const ProfileHeader = () => {
  return (
    <Box sx={{ 
      textAlign: 'center', 
      mb: 5,
      animation: 'fade-in 0.6s ease-in'
    }}>
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        fontWeight="bold"
        sx={{
          fontSize: { xs: '2rem', md: '3rem' },
          color: '#1a1a1a',
          mb: 1
        }}
      >
        My Account
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          color: '#666',
          fontWeight: 400,
          fontSize: { xs: '0.95rem', md: '1.1rem' }
        }}
      >
        Manage your profile, addresses, and orders in one place
      </Typography>
    </Box>
  );
};

export default ProfileHeader;
