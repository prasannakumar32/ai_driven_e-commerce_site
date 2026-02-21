import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Divider
} from '@mui/material';
import {
  Store,
  LocationOn,
  Phone,
  Verified,
  LocalShipping
} from '@mui/icons-material';
import { getDeliveryBadge } from '../utils/deliveryCalculator';

const SellerDetailsCard = ({ 
  seller, 
  deliveryInfo,
  showCompact = false 
}) => {
  if (!seller) return null;

  const sellerName = seller.businessName || seller.name || 'Unknown Seller';
  const deliveryBadge = deliveryInfo && getDeliveryBadge(deliveryInfo.minDays, deliveryInfo.maxDays);

  if (showCompact) {
    return (
      <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Store sx={{ color: 'primary.main', fontSize: 28 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="600">
                  {sellerName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {seller.sellerLocation?.city && `📍 ${seller.sellerLocation.city}`}
                </Typography>
              </Box>
            </Box>
            {deliveryBadge && (
              <Chip 
                label={deliveryBadge.label}
                size="small"
                sx={{
                  bgcolor: deliveryBadge.color,
                  color: '#fff',
                  fontWeight: '600'
                }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Store sx={{ fontSize: 32, color: 'primary.main' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="h6" fontWeight="bold">
                {sellerName}
              </Typography>
              <Verified sx={{ color: 'success.main', fontSize: 18 }} />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {seller.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Seller Info Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
          {/* Location */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <LocationOn sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="caption" fontWeight="600" color="text.secondary">
                Location
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight="500">
              {seller.sellerLocation?.city || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {seller.sellerLocation?.state}
            </Typography>
          </Box>

          {/* Contact */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Phone sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="caption" fontWeight="600" color="text.secondary">
                Contact
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight="500">
              {seller.phone || 'N/A'}
            </Typography>
          </Box>
        </Box>

        {/* Delivery Info */}
        {deliveryInfo && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocalShipping sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="subtitle2" fontWeight="bold">
                  Delivery Estimate
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ mb: 1 }}>
                {deliveryInfo.minFormatted} - {deliveryInfo.maxFormatted}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({deliveryInfo.minDays}-{deliveryInfo.maxDays} business days)
                {deliveryInfo.distance && ` • ${deliveryInfo.distance}km away`}
              </Typography>
              {deliveryBadge && (
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={deliveryBadge.label}
                    size="small"
                    sx={{
                      bgcolor: deliveryBadge.color,
                      color: '#fff',
                      fontWeight: '600'
                    }}
                  />
                </Box>
              )}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SellerDetailsCard;
