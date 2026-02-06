import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  Store,
  TrendingUp,
  AttachMoney,
  Security,
  Speed,
  Support,
  Analytics,
  CheckCircle,
  Star,
  LocalOffer,
  ArrowForward,
  HowToReg,
  BusinessCenter,
  ShoppingCart,
  AccountBalance,
  Verified
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const BecomeSeller = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    gstNumber: '',
    panNumber: '',
    bankAccount: '',
    ifscCode: '',
    agreeToTerms: false
  });

  const steps = [
    {
      label: 'Overview',
      icon: <TrendingUp />,
    },
    {
      label: 'Commission Structure',
      icon: <AttachMoney />,
    },
    {
      label: 'Benefits',
      icon: <Star />,
    },
    {
      label: 'Registration',
      icon: <HowToReg />,
    },
  ];

  const commissionData = [
    { orderValue: 1000, commission: 100, youEarn: 900 },
    { orderValue: 5000, commission: 500, youEarn: 4500 },
    { orderValue: 10000, commission: 1000, youEarn: 9000 },
    { orderValue: 25000, commission: 2500, youEarn: 22500 },
    { orderValue: 50000, commission: 5000, youEarn: 45000 },
    { orderValue: 100000, commission: 10000, youEarn: 90000 },
  ];

  const benefits = [
    'Zero setup cost',
    'Instant payment settlement',
    '24/7 seller support',
    'PKS Store branding',
    'Access to millions of customers',
    'Advanced analytics dashboard',
    'Marketing and promotion tools',
    'Easy inventory management',
    'Secure payment processing',
    'Order tracking system'
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = () => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    // Handle seller registration submission
    console.log('Seller registration:', formData);
    navigate('/seller-dashboard');
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const renderOverview = () => (
    <Box>
      <Typography variant="h6" gutterBottom color="primary">
        Join PKS Marketplace as a Seller
      </Typography>
      <Typography variant="body1" paragraph>
        Start selling your products to millions of customers across India with our trusted marketplace platform.
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#2874F0', mr: 2 }}>
                  <Store />
                </Avatar>
                <Typography variant="h6">Quick Setup</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Get your store live in minutes with our simple onboarding process
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#FF6B35', mr: 2 }}>
                  <AttachMoney />
                </Avatar>
                <Typography variant="h6">Low Commission</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Only 10% commission on successful sales - no hidden fees
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#4CAF50', mr: 2 }}>
                  <Security />
                </Avatar>
                <Typography variant="h6">Secure Payments</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Safe and secure payment processing with instant settlements
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#9C27B0', mr: 2 }}>
                  <Support />
                </Avatar>
                <Typography variant="h6">24/7 Support</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Dedicated seller support team to help you grow your business
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderCommission = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Simple & Transparent:</strong> Pay only 10% commission on successful orders. No setup fees, no monthly charges.
        </Typography>
      </Alert>

      <Typography variant="h6" gutterBottom color="primary">
        Commission Structure (10% on All Orders)
      </Typography>
      
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Value</TableCell>
              <TableCell>Commission (10%)</TableCell>
              <TableCell>You Earn</TableCell>
              <TableCell>Settlement Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {commissionData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>₹{row.orderValue.toLocaleString('en-IN')}</TableCell>
                <TableCell sx={{ color: '#FF6B35', fontWeight: 'bold' }}>
                  ₹{row.commission.toLocaleString('en-IN')}
                </TableCell>
                <TableCell sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  ₹{row.youEarn.toLocaleString('en-IN')}
                </TableCell>
                <TableCell>Instant</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ bgcolor: '#f8f9fa', p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Why Choose PKS Marketplace?
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
            <ListItemText primary="No listing fees" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
            <ListItemText primary="No monthly subscription" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
            <ListItemText primary="No hidden charges" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
            <ListItemText primary="Instant payment settlement" />
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  const renderBenefits = () => (
    <Box>
      <Typography variant="h6" gutterBottom color="primary">
        Seller Benefits & Features
      </Typography>
      
      <Grid container spacing={2}>
        {benefits.map((benefit, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card variant="outlined">
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Star color="#FFD700" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">{benefit}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'linear-gradient(135deg, #2874F0 0%, #4B8BF5 100%)', borderRadius: 2 }}>
        <Typography variant="h6" color="white" gutterBottom>
          Start Selling Today!
        </Typography>
        <Typography variant="body2" color="white" sx={{ mb: 2 }}>
          Join thousands of successful sellers on PKS Marketplace and grow your business.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip label="1000+ Sellers" color="secondary" />
          <Chip label="1M+ Products" color="secondary" />
          <Chip label="24/7 Support" color="secondary" />
        </Box>
      </Box>
    </Box>
  );

  const renderRegistration = () => (
    <Box>
      <Typography variant="h6" gutterBottom color="primary">
        Register as a Seller
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          To become a seller, please register with seller details. You'll be automatically redirected to your seller dashboard after registration.
        </Typography>
      </Alert>

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/register')}
          sx={{ 
            backgroundColor: '#FF6B35',
            '&:hover': { backgroundColor: '#E55A2B' },
            px: 4,
            py: 1.5
          }}
        >
          Register as Seller
        </Button>
      </Box>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="caption">
          All seller information is kept secure and used only for payment processing and verification purposes.
        </Typography>
      </Alert>
    </Box>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderOverview();
      case 1:
        return renderCommission();
      case 2:
        return renderBenefits();
      case 3:
        return renderRegistration();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="text.primary">
          Become a PKS Seller
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Start your e-commerce journey with India's trusted marketplace
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {step.icon}
                <Typography sx={{ ml: 1 }}>{step.label}</Typography>
              </Box>
            </StepLabel>
            <StepContent>
              <Paper sx={{ p: 3, mb: 2 }}>
                {renderStepContent(index)}
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {index === steps.length - 1 ? 'Register as Seller' : 'Next'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1 }}
                  >
                    Back
                  </Button>
                </Box>
              </Paper>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {activeStep === 3 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Ready to start selling? Click below to register as a seller.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default BecomeSeller;
