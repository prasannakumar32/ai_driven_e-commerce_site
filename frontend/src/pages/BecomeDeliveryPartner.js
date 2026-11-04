import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  LocalShipping,
  CheckCircle,
  Person,
  Phone,
  Email,
  LocationOn,
  TwoWheeler,
  DirectionsCar,
  AirportShuttle,
  LocalTaxi
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const BecomeDeliveryPartner = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    vehicleType: '',
    vehicleNumber: '',
    licenseNumber: '',
    operatingArea: ''
  });

  const steps = [
    {
      label: 'Personal Information',
      icon: <Person />
    },
    {
      label: 'Vehicle Details',
      icon: <LocalShipping />
    },
    {
      label: 'Operating Area',
      icon: <LocationOn />
    }
  ];

  const vehicleTypes = [
    { value: 'bike', label: 'Bike', icon: <TwoWheeler /> },
    { value: 'scooter', label: 'Scooter', icon: <TwoWheeler /> },
    { value: 'car', label: 'Car', icon: <DirectionsCar /> },
    { value: 'van', label: 'Van', icon: <AirportShuttle /> },
    { value: 'truck', label: 'Truck', icon: <LocalTaxi /> }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.put('/auth/profile', {
        ...formData,
        role: 'delivery_partner',
        deliveryPartnerStatus: 'pending'
      });

      if (response.data) {
        setStep(3); // Success step
      }
    } catch (err) {
      console.error('Error submitting delivery partner application:', err);
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 0) {
      if (!formData.name || !formData.email || !formData.phone) {
        setError('Please fill in all required fields');
        return;
      }
    }
    if (step === 1) {
      if (!formData.vehicleType || !formData.vehicleNumber || !formData.licenseNumber) {
        setError('Please fill in all vehicle details');
        return;
      }
    }
    if (step === 2) {
      if (!formData.operatingArea) {
        setError('Please provide your operating area');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  if (step === 3) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold" color="success.main">
            Application Submitted Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Your delivery partner application has been submitted. Our team will review your application and get back to you within 24-48 hours.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="contained" onClick={() => navigate('/')}>
              Back to Home
            </Button>
            <Button variant="outlined" onClick={() => navigate('/profile')}>
              View Profile
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
        Become a Delivery Partner
      </Typography>

      {/* Benefits Card */}
      <Card sx={{ mb: 4, bgcolor: 'primary.light', color: 'white' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Why Join Our Delivery Network?
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckCircle sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Flexible working hours - work when you want" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Competitive earnings per delivery" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Easy-to-use mobile dashboard" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Instant payment after delivery completion" />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Stepper activeStep={step} sx={{ mb: 4 }}>
          {steps.map((stepObj, index) => (
            <Step key={index}>
              <StepLabel icon={stepObj.icon}>{stepObj.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {step === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {step === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Vehicle Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Vehicle Type"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                >
                  {vehicleTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Vehicle Number"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  placeholder="e.g., MH 12 AB 1234"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="License Number"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="e.g., DL-123456789"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {step === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Operating Area
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Operating Area / City"
                  name="operatingArea"
                  value={formData.operatingArea}
                  onChange={handleChange}
                  placeholder="e.g., Mumbai, Pune, Delhi NCR"
                  InputProps={{
                    startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={step === 0}
          >
            Back
          </Button>
          {step === 2 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={<LocalShipping />}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default BecomeDeliveryPartner;
