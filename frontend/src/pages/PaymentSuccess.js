import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Alert,
  Grid,
  Chip,
  Divider,
  Avatar,
  Snackbar,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import {
  CheckCircle,
  Receipt,
  Info,
  LocalShipping,
  Payment,
  PictureAsPdf,
  Description,
  ArrowDropDown,
  Store
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import api from '../utils/api';
import jsPDF from 'jspdf';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);
  const [processed, setProcessed] = useState(false); // Add processing flag
  const [showInvoiceSuccess, setShowInvoiceSuccess] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // Menu state

  useEffect(() => {
    console.log('PaymentSuccess: useEffect triggered');
    console.log('PaymentSuccess: Current URL:', window.location.href);
    console.log('PaymentSuccess: Search params:', searchParams.toString());
    console.log('PaymentSuccess: Hash:', window.location.hash);
    
    // Prevent multiple executions
    if (processed) {
      console.log('PaymentSuccess: Already processed, skipping');
      return;
    }
    
    const handlePaymentSuccess = async () => {
      try {
        setLoading(true);
        setProcessed(true); // Mark as processed immediately
        
        // Try to get session_id from multiple sources
        let sessionId = searchParams.get('session_id');
        
        // If not found in search params, check URL hash
        if (!sessionId && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          sessionId = hashParams.get('session_id');
        }
        
        // If still not found, try parsing from full URL
        if (!sessionId) {
          const urlParams = new URLSearchParams(window.location.search);
          sessionId = urlParams.get('session_id');
        }

        console.log('PaymentSuccess: Final session_id extracted:', sessionId);

        if (!sessionId) {
          console.error('PaymentSuccess: No session_id found in URL');
          setError('No payment session found. Please try again.');
          setLoading(false);
          return;
        }

        console.log('PaymentSuccess: Fetching session details for:', sessionId);

        // Get session details from backend
        const response = await api.get(`/stripe/session/${sessionId}`);
        const sessionData = response.data;

        console.log('PaymentSuccess: Session data received:', {
          id: sessionData.id,
          payment_status: sessionData.payment_status,
          amount_total: sessionData.amount_total
        });

        if (sessionData.payment_status === 'paid') {
          // Parse metadata
          const items = sessionData.metadata?.items ? JSON.parse(sessionData.metadata.items) : [];
          const shippingAddress = sessionData.metadata?.shippingAddress ? 
            JSON.parse(sessionData.metadata.shippingAddress) : {
              name: sessionData.customer_details?.name || 'Unknown',
              address: sessionData.shipping?.address?.line1 || '',
              city: sessionData.shipping?.address?.city || '',
              state: sessionData.shipping?.address?.state || '',
              postalCode: sessionData.shipping?.address?.postal_code || '',
              phone: sessionData.customer_details?.phone || '',
              email: sessionData.customer_details?.email || ''
            };

          // Calculate total from session amount
          const total = sessionData.amount_total / 100; // Convert from cents

          console.log('PaymentSuccess: Processing successful payment with items:', items);

          setOrderData({
            _id: sessionData.metadata?.orderId || `stripe_${sessionId.slice(-8)}`,
            sessionId: sessionId,
            paymentIntentId: sessionData.payment_intent,
            totalPrice: total,
            paymentMethod: 'Card Payment (Stripe)',
            paymentStatus: 'Completed',
            orderStatus: 'Confirmed',
            isPaid: true,
            paidAt: new Date().toLocaleString('en-IN'),
            orderItems: items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price
            })),
            shippingAddress: shippingAddress
          });

          calculateDeliveryDate();
          
          // Clear cart
          await clearCart();
          
          console.log('PaymentSuccess: Payment processed successfully');
        } else {
          console.error('PaymentSuccess: Payment not completed. Status:', sessionData.payment_status);
          setError('Payment was not completed successfully. Please try again.');
        }

        setLoading(false);
      } catch (err) {
        console.error('PaymentSuccess: Error processing payment success:', err);
        console.error('PaymentSuccess: Error response:', err.response?.data);
        setError(err.response?.data?.message || 'Failed to process payment. Please contact support.');
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [searchParams, processed, clearCart]); // Include processed flag and clearCart dependency

  const calculateDeliveryDate = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    
    // Standard delivery: 3-5 business days
    const minDays = 3;
    const maxDays = 5;
    
    // Add minimum delivery days
    deliveryDate.setDate(today.getDate() + minDays);
    
    // Skip weekends
    while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
    }
    
    const maxDeliveryDate = new Date(deliveryDate);
    maxDeliveryDate.setDate(deliveryDate.getDate() + (maxDays - minDays));
    
    // Skip weekends for max date
    while (maxDeliveryDate.getDay() === 0 || maxDeliveryDate.getDay() === 6) {
      maxDeliveryDate.setDate(maxDeliveryDate.getDate() + 1);
    }
    
    const formattedMinDate = deliveryDate.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    const formattedMaxDate = maxDeliveryDate.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    setEstimatedDelivery({
      minDate: deliveryDate,
      maxDate: maxDeliveryDate,
      minFormatted: formattedMinDate,
      maxFormatted: formattedMaxDate,
      dayRange: `${minDays}-${maxDays} Business Days`
    });
  };

  // Menu handlers
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Invoice generation functions
  const generatePDFInvoice = () => {
    if (!orderData) return;
    
    try {
      // Create PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 15;

      // Header Background
      doc.setFillColor(102, 126, 234);
      doc.rect(0, 0, pageWidth, 30, 'F');

      // Company Logo/Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('INVOICE', 15, 18);

      // Order ID and Date
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Order #${orderData._id?.slice(-8).toUpperCase()}`, pageWidth - 15, 15, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 15, 22, { align: 'right' });

      yPosition = 45;

      // Billing Information Section
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Bill To:', 15, yPosition);

      yPosition += 8;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      const customerName = orderData.shippingAddress?.name || 'N/A';
      const address = orderData.shippingAddress?.address || 'N/A';
      const city = orderData.shippingAddress?.city || '';
      const state = orderData.shippingAddress?.state || '';
      const postalCode = orderData.shippingAddress?.postalCode || '';
      const phone = orderData.shippingAddress?.phone || 'N/A';
      const email = orderData.shippingAddress?.email || 'N/A';

      doc.text(customerName, 15, yPosition);
      yPosition += 7;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      
      // Address with wrapping
      const addressLines = doc.splitTextToSize(address, 60);
      doc.text(addressLines, 15, yPosition);
      yPosition += (addressLines.length * 5);
      
      doc.text(`${city}, ${state} ${postalCode}`, 15, yPosition);
      yPosition += 7;
      doc.text(`Phone: ${phone}`, 15, yPosition);
      yPosition += 7;
      doc.text(`Email: ${email}`, 15, yPosition);

      yPosition += 15;

      // Items Table Header
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
      
      doc.text('Product', 15, yPosition);
      doc.text('Qty', 100, yPosition);
      doc.text('Price', 125, yPosition);
      doc.text('Total', 155, yPosition);

      yPosition += 10;

      // Items Table Body with Seller Info
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      let itemStartY = yPosition;

      orderData.orderItems?.forEach((item, index) => {
        if (yPosition > pageHeight - 60) {
          // Add new page if needed
          doc.addPage();
          yPosition = 15;
          itemStartY = yPosition;
        }

        // Item name (with wrapping if needed)
        const itemName = doc.splitTextToSize(item.name, 70);
        doc.text(itemName, 15, yPosition);
        yPosition += (itemName.length * 4);

        // Seller info if available
        if (item.sellerName || item.sellerLocation?.city) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          const sellerInfo = `by ${item.sellerName || item.sellerBusinessName || 'Seller'} (${item.sellerLocation?.city || 'N/A'})`;
          doc.text(sellerInfo, 15, yPosition);
          yPosition += 4;
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(9);
        }

        // Quantity, Price, Total
        doc.text(item.quantity.toString(), 100, itemStartY);
        doc.text(`₹${item.price?.toLocaleString('en-IN')}`, 125, itemStartY);
        doc.text(`₹${(item.price * item.quantity)?.toLocaleString('en-IN')}`, 155, itemStartY);

        // Delivery estimate if available
        if (item.deliveryDaysEstimate) {
          doc.setFontSize(7);
          doc.setTextColor(76, 175, 80);
          doc.text(`📦 Delivery: ${item.deliveryDaysEstimate.min}-${item.deliveryDaysEstimate.max} days`, 15, yPosition);
          yPosition += 3;
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(9);
        }

        itemStartY = yPosition + 3;
        yPosition += 6;
      });

      yPosition += 5;

      // Totals Section
      doc.setDrawColor(200, 200, 200);
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 8;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);

      // Subtotal
      doc.text('Subtotal:', 130, yPosition);
      doc.text(`₹${orderData.totalPrice?.toLocaleString('en-IN')}`, 155, yPosition);
      yPosition += 7;

      // Shipping
      doc.text('Shipping:', 130, yPosition);
      doc.setTextColor(22, 163, 74);
      doc.setFont(undefined, 'bold');
      doc.text('FREE', 155, yPosition);
      yPosition += 7;

      // Discount if any
      if (orderData.discount) {
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        doc.text('Discount:', 130, yPosition);
        doc.text(`-₹${orderData.discount?.toLocaleString('en-IN')}`, 155, yPosition);
        yPosition += 7;
      }

      // Total Line
      doc.setDrawColor(200, 200, 200);
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 8;

      doc.setTextColor(102, 126, 234);
      doc.setFont(undefined, 'bold');
      doc.setFontSize(12);
      doc.text('TOTAL:', 130, yPosition);
      doc.text(`₹${orderData.totalPrice?.toLocaleString('en-IN')}`, 155, yPosition);

      yPosition += 12;

      // Payment Details
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Payment Details:', 15, yPosition);

      yPosition += 7;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(`Payment Method: ${orderData.paymentMethod || 'Not specified'}`, 15, yPosition);
      yPosition += 5;
      doc.text(`Payment Status: ${orderData.paymentStatus || 'Pending'}`, 15, yPosition);
      yPosition += 5;
      doc.text(`Transaction ID: ${orderData.paymentIntentId?.slice(-16) || 'N/A'}`, 15, yPosition);

      yPosition += 10;

      // Thank You Note
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(102, 126, 234);
      doc.text('Thank you for your purchase!', 15, yPosition);

      yPosition += 7;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const thankYouText = doc.splitTextToSize(
        'Your order will be processed within 24 hours. You will receive an email confirmation with tracking details.',
        pageWidth - 30
      );
      doc.text(thankYouText, 15, yPosition);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('This is an automatically generated invoice. Please retain for your records.', 15, pageHeight - 10);
      doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, pageWidth - 15, pageHeight - 10, { align: 'right' });

      // Save PDF
      doc.save(`Invoice_${orderData._id?.slice(-8).toUpperCase()}.pdf`);
      
      setShowInvoiceSuccess(true);
      setTimeout(() => setShowInvoiceSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating PDF invoice:', err);
      alert('Failed to generate PDF invoice. Please try again.');
    }
  };

  const generateCSVInvoice = () => {
    if (!orderData) return;
    
    try {
      // Generate CSV invoice content
      let csvContent = 'Invoice Report\n';
      csvContent += `Generated on,${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}\n\n`;
      
      csvContent += 'ORDER INFORMATION\n';
      csvContent += `Order ID,${orderData._id}\n`;
      csvContent += `Payment Method,${orderData.paymentMethod || 'N/A'}\n`;
      csvContent += `Payment Status,${orderData.paymentStatus || 'N/A'}\n`;
      csvContent += `Order Date,${orderData.paidAt || 'N/A'}\n\n`;

      csvContent += 'CUSTOMER DETAILS\n';
      csvContent += `Name,${orderData.shippingAddress?.name || 'N/A'}\n`;
      csvContent += `Email,${orderData.shippingAddress?.email || 'N/A'}\n`;
      csvContent += `Phone,${orderData.shippingAddress?.phone || 'N/A'}\n`;
      csvContent += `Address,${orderData.shippingAddress?.address || 'N/A'}\n`;
      csvContent += `City,${orderData.shippingAddress?.city || 'N/A'}\n`;
      csvContent += `State,${orderData.shippingAddress?.state || 'N/A'}\n`;
      csvContent += `PIN Code,${orderData.shippingAddress?.postalCode || 'N/A'}\n\n`;

      csvContent += 'ORDER ITEMS\n';
      csvContent += 'Product Name,Quantity,Unit Price,Total Price\n';
      
      orderData.orderItems?.forEach(item => {
        const productName = `"${item.name.replace(/"/g, '""')}"`;
        const quantity = item.quantity;
        const price = item.price;
        const total = item.price * item.quantity;
        csvContent += `${productName},${quantity},${price},${total}\n`;
      });

      csvContent += '\nORDER SUMMARY\n';
      csvContent += `Subtotal,₹${orderData.totalPrice?.toLocaleString('en-IN')}\n`;
      csvContent += 'Shipping,FREE\n';
      csvContent += `Total Amount,₹${orderData.totalPrice?.toLocaleString('en-IN')}\n`;
      
      // Create a blob and trigger download
      const element = document.createElement('a');
      const file = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      element.href = URL.createObjectURL(file);
      element.download = `Invoice_${orderData._id?.slice(-8).toUpperCase()}.csv`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      setShowInvoiceSuccess(true);
      setTimeout(() => setShowInvoiceSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating CSV invoice:', err);
      alert('Failed to generate CSV invoice. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" color="text.secondary">
            Processing your payment...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please don't refresh the page
          </Typography>
        </Box>
      </Container>
    );
  }

  // Error state
  if (error || !orderData) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <Avatar sx={{ bgcolor: 'error.main', width: 80, height: 80, mb: 2 }}>
            ❌
          </Avatar>
          <Typography variant="h4" color="error.main" gutterBottom fontWeight="bold">
            Payment Processing Failed
          </Typography>
          <Alert severity="error" sx={{ my: 3, maxWidth: 400 }}>
            {error || 'Unable to process your payment. Please try again or contact support.'}
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/checkout')}
            >
              Try Again
            </Button>
            <Button 
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
            {/* Test button for debugging */}
            <Button 
              variant="text"
              size="small"
              onClick={() => {
                const testUrl = `${window.location.origin}/payment-success?session_id=cs_test_123456789`;
                console.log('Testing with URL:', testUrl);
                window.location.href = testUrl;
              }}
            >
              🧪 Test Mock Payment
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh' }}>
        {/* Success Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Avatar 
          sx={{ 
            bgcolor: 'success.main', 
            width: 80, 
            height: 80, 
            mx: 'auto', 
            mb: 3,
            boxShadow: '0 8px 24px rgba(76, 175, 80, 0.3)'
          }}
        >
          <CheckCircle sx={{ fontSize: 48 }} />
        </Avatar>
        <Typography variant="h3" color="success.main" gutterBottom fontWeight="bold">
          Payment Successful! ✓
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Your order has been confirmed and will be delivered soon
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`Order ID: ${orderData._id?.slice(-8).toUpperCase()}`}
            color="primary"
            variant="outlined"
            icon={<Receipt />}
          />
          <Chip 
            label="Payment Verified ✓"
            color="success"
            variant="filled"
            icon={<Payment />}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Estimated Delivery */}
          {estimatedDelivery && (
            <Paper sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                    📦 Estimated Delivery
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {estimatedDelivery.minFormatted} - {estimatedDelivery.maxFormatted}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {estimatedDelivery.dayRange}
                  </Typography>
                </Box>
                <LocalShipping sx={{ fontSize: 60, opacity: 0.3 }} />
              </Box>
            </Paper>
          )}

          {/* Order Items */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" gutterBottom>
              📦 Order Items ({orderData.orderItems?.length || 0})
            </Typography>
            <Divider sx={{ my: 2 }} />
            {orderData.orderItems?.map((item, index) => (
              <Box 
                key={index}
                sx={{ 
                  p: 2,
                  bgcolor: index % 2 === 0 ? '#f5f5f5' : 'transparent',
                  borderRadius: 1,
                  mb: 2
                }}
              >
                {/* Item Details */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight="600" color="text.primary" sx={{ mb: 0.5 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Quantity: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    ₹{(item.price * item.quantity)?.toLocaleString('en-IN')}
                  </Typography>
                </Box>

                {/* Seller Information */}
                {(item.sellerName || item.sellerBusinessName) && (
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: 'primary.lighter', 
                    borderRadius: 1, 
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Store sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Box sx={{ flex:1 }}>
                      <Typography variant="caption" fontWeight="600" color="primary.main">
                        Sold by {item.sellerBusinessName || item.sellerName}
                      </Typography>
                      {item.sellerLocation?.city && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          📍 {item.sellerLocation.city}, {item.sellerLocation.state}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Delivery Estimate */}
                {item.deliveryDaysEstimate && (
                  <Alert severity="success" sx={{ py: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShipping sx={{ fontSize: 16 }} />
                    <Box>
                      <Typography variant="caption" fontWeight="600">
                        Delivery in {item.deliveryDaysEstimate.min}-{item.deliveryDaysEstimate.max} business days
                      </Typography>
                    </Box>
                  </Alert>
                )}
              </Box>
            ))}
          </Paper>

          {/* Next Steps */}
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', bgcolor: '#f0f7ff' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Info color="info" />
              What Happens Next?
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <Chip label="1" size="small" variant="filled" />
                <Box>
                  <Typography variant="body2" fontWeight="600">Order Confirmation Email</Typography>
                  <Typography variant="caption" color="text.secondary">Sent to {orderData.shippingAddress?.email}</Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <Chip label="2" size="small" variant="filled" />
                <Box>
                  <Typography variant="body2" fontWeight="600">Order Processing</Typography>
                  <Typography variant="caption" color="text.secondary">We'll prepare your order within 24 hours</Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <Chip label="3" size="small" variant="filled" />
                <Box>
                  <Typography variant="body2" fontWeight="600">Shipping Updates</Typography>
                  <Typography variant="caption" color="text.secondary">Track your package in real-time</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip label="4" size="small" variant="filled" />
                <Box>
                  <Typography variant="body2" fontWeight="600">Delivery</Typography>
                  <Typography variant="caption" color="text.secondary">We'll deliver to your address between {estimatedDelivery?.minFormatted} - {estimatedDelivery?.maxFormatted}</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Payment Summary */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Payment color="success" />
              Payment Confirmed
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f7f0', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Payment Method:</Typography>
                <Typography variant="body2" fontWeight="600">{orderData.paymentMethod}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Amount:</Typography>
                <Typography variant="body2" fontWeight="600">₹{orderData.totalPrice?.toLocaleString('en-IN')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Time:</Typography>
                <Typography variant="body2" fontWeight="600">{orderData.paidAt}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Reference ID:</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  {orderData.paymentIntentId?.slice(-8)}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Order Total */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              💰 Order Total
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2" fontWeight="600">₹{orderData.totalPrice?.toLocaleString('en-IN')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Shipping</Typography>
                <Typography variant="body2" fontWeight="600" color="success.main">FREE</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold">Total Paid</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  ₹{orderData.totalPrice?.toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Action Buttons */}
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button 
                variant="contained"
                color="primary"
                fullWidth 
                onClick={() => navigate('/profile')}
              >
                Track Order
              </Button>
              <Button 
                variant="outlined"
                color="primary"
                fullWidth 
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </Button>
              <Button 
                variant="text"
                fullWidth 
                size="small"
                onClick={() => window.print()}
              >
                📄 Print Receipt
              </Button>
              
              {/* Download Invoice Dropdown */}
              <Button
                variant="contained"
                color="success"
                fullWidth
                size="small"
                onClick={handleMenuClick}
                endIcon={<ArrowDropDown />}
              >
                📥 Download Invoice
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={() => { handleMenuClose(); generatePDFInvoice(); }}>
                  <ListItemIcon>
                    <PictureAsPdf />
                  </ListItemIcon>
                  Download as PDF
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); generateCSVInvoice(); }}>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  Download as CSV
                </MenuItem>
              </Menu>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
    
    {/* Invoice Download Success Notification */}
    <Snackbar
      open={showInvoiceSuccess}
      autoHideDuration={3000}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity="success" sx={{ width: '100%' }}>
        📥 Invoice downloaded successfully!
      </Alert>
    </Snackbar>
    </>  );
};

export default PaymentSuccess;