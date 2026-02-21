import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import api, { orderAPI } from '../utils/api';
import { useCart } from '../contexts/CartContext';

const CheckoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState(null);

  const query = new URLSearchParams(location.search);
  const sessionId = query.get('session_id');
  const incomingShippingAddress = location.state?.orderData?.shippingAddress;

  useEffect(() => {
    const verifyAndCreate = async () => {
      try {
        setStatus('verifying');
        
        // If no sessionId, treat as failure
        if (!sessionId) throw new Error('Missing session id');

        const resp = await api.get(`/stripe/session/${sessionId}`);
        const session = resp.data;

        // Accept mock or paid sessions
        const paid = session.payment_status === 'paid' || session.mock === true || session.payment_status === 'complete';
        if (!paid) throw new Error('Payment not completed');

        // Create order on server using cart items
        const orderItems = items.map(i => ({ product: i.product._id, quantity: i.quantity }));
        if (orderItems.length === 0) {
          setStatus('empty');
          return;
        }

        const shippingAddress = incomingShippingAddress || { 
          address: 'N/A', 
          city: 'N/A', 
          postalCode: '00000', 
          country: 'N/A',
          name: 'N/A',
          phone: 'N/A',
          email: 'N/A'
        };

        const response = await orderAPI.createOrder({
          orderItems,
          shippingAddress: shippingAddress,
          paymentMethod: 'stripe'
        });

        // clear cart locally  
        await clearCart();
        
        // Redirect to order confirmation page
        navigate('/order-confirmation', {
          state: {
            orderData: response.data,
            paymentMethod: 'stripe'
          }
        });
      } catch (err) {
        console.error('Checkout success handling failed', err);
        setError(err.message || 'Verification failed');
        setStatus('error');
      }
    };

    verifyAndCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (status === 'verifying') {
    return (
      <Container sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h5" color="error" gutterBottom>Payment verification failed</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>{error}</Typography>
      <Button variant="contained" onClick={() => navigate('/cart')}>Back to Cart</Button>
    </Container>
  );
};

export default CheckoutSuccess;
