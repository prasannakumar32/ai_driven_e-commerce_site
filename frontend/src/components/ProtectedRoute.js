import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LinearProgress, Container, Alert, Box, Button } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading indicator while authentication is being verified
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role (for seller dashboard, etc.)
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // Check additional seller requirements
  if (requiredRole === 'seller') {
    if (!user.businessName || !user.businessType || !user.phone) {
      return <Navigate to="/profile" replace />;
    }
  }

  // Check delivery partner requirements
  if (requiredRole === 'delivery_partner') {
    // Allow access if user has delivery_partner role, regardless of status
    // The dashboard itself can show appropriate messaging based on status
    if (!user.vehicleType || !user.vehicleNumber || !user.licenseNumber || !user.operatingArea) {
      return (
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Alert severity="warning">
            Please complete your delivery partner registration by filling in your vehicle and operating area details in your profile.
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => window.location.href = '/profile'}>
              Complete Registration
            </Button>
          </Box>
        </Container>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
