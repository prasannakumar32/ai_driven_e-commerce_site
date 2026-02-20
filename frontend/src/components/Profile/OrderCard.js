import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Box,
  Typography,
  Button,
  Chip
} from '@mui/material';
import { 
  Payment, 
  CheckCircle, 
  ShoppingBag,
  LocalShipping
} from '@mui/icons-material';

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return 'success';
    case 'shipped':
      return 'info';
    case 'processing':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const OrderCard = ({ 
  order, 
  onCancel, 
  onReorder, 
  onTrack 
}) => {
  return (
    <Card sx={{ 
      mb: 2,
      borderRadius: 2,
      border: '1px solid rgba(0,0,0,0.08)',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
        transform: 'translateY(-2px)'
      }
    }}>
      <CardContent sx={{ '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
              Order #{order._id?.slice(-8).toUpperCase()}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </Typography>
          </Box>
          <Chip
            label={order.status?.toUpperCase() || 'PENDING'}
            color={getStatusColor(order.status)}
            variant="filled"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 3, mb: 2.5, flexWrap: 'wrap', pb: 2.5, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Payment fontSize="small" sx={{ color: 'primary.main' }} />
            <Typography variant="body2" color="text.secondary" fontWeight="500">
              {order.paymentMethod?.toUpperCase() || 'N/A'}
            </Typography>
          </Box>
          
          {order.isPaid && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle fontSize="small" sx={{ color: 'success.main' }} />
              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                Paid
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingBag fontSize="small" sx={{ color: '#666' }} />
            <Typography variant="body2" color="text.secondary" fontWeight="500">
              {order.orderItems?.length || 0} item(s)
            </Typography>
          </Box>
        </Box>

        {/* Order Items */}
        <Box sx={{ mb: 2.5 }}>
          {order.orderItems?.slice(0, 2).map((item, itemIndex) => (
            <Box key={itemIndex} sx={{ display: 'flex', gap: 2, mb: itemIndex < order.orderItems.length - 1 ? 2 : 0, alignItems: 'flex-start' }}>
              {item.product?.images?.[0] && (
                <CardMedia
                  component="img"
                  sx={{ width: 50, height: 50, borderRadius: 1, objectFit: 'cover' }}
                  image={item.product.images[0]}
                  alt={item.name}
                />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight="600" sx={{ color: '#1a1a1a' }}>
                  {item.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.quantity}x @ ₹{item.price?.toLocaleString('en-IN')}
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight="700" sx={{ color: '#1a1a1a' }}>
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </Typography>
            </Box>
          ))}
          {order.orderItems && order.orderItems.length > 2 && (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              +{order.orderItems.length - 2} more item(s)
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, pb: 2.5, borderTop: '1px solid rgba(0,0,0,0.08)', pt: 2.5 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
            Total: ₹{order.totalPrice?.toLocaleString('en-IN')}
          </Typography>
        </Box>
          
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {order.status?.toUpperCase() !== 'DELIVERED' && order.status?.toUpperCase() !== 'CANCELLED' && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={() => onCancel(order._id)}
              sx={{ 
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              Cancel Order
            </Button>
          )}
          
          <Button
            variant="outlined"
            size="small"
            onClick={() => onReorder(order._id)}
            sx={{ 
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderColor: 'rgba(0,0,0,0.2)',
              color: '#1a1a1a',
              '&:hover': {
                backgroundColor: 'rgba(255, 107, 53, 0.05)',
                borderColor: '#ff6b35'
              }
            }}
          >
            Reorder
          </Button>
          
          {order.deliveryInfo?.trackingNumber && (
            <Button
              variant="contained"
              size="small"
              startIcon={<LocalShipping />}
              onClick={() => onTrack(order.deliveryInfo.trackingNumber)}
              sx={{ 
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                background: 'linear-gradient(90deg, #4caf50 0%, #388e3c 100%)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                }
              }}
            >
              Track
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
