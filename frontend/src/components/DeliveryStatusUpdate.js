import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Alert,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material';
import { getNextPossibleStatuses, statusDescriptions, deliveryStatuses } from '../utils/deliveryManager';
import { orderAPI } from '../utils/api';

const DeliveryStatusUpdate = ({ open, onClose, order, onSuccess }) => {
  const [formData, setFormData] = useState({
    status: order?.status || 'pending',
    location: order?.currentLocation || '',
    notes: '',
    trackingNumber: order?.trackingNumber || '',
    estimatedDeliveryDate: order?.estimatedDeliveryDate ? 
      new Date(order.estimatedDeliveryDate).toISOString().split('T')[0] : '',
    carrier: order?.carrier || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const possibleStatuses = order ? getNextPossibleStatuses(order.status) : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate required fields
      if (!formData.status) {
        setError('Please select a status');
        setLoading(false);
        return;
      }

      const updateData = {
        status: formData.status,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
        trackingNumber: formData.trackingNumber || undefined,
        estimatedDeliveryDate: formData.estimatedDeliveryDate || undefined,
        carrier: formData.carrier || undefined
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

      await orderAPI.updateOrderStatus(order._id, updateData);
      
      setSuccess(`Order status updated to "${formData.status}" successfully!`);
      setTimeout(() => {
        onSuccess?.(updateData);
        onClose();
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update delivery status');
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Update Delivery Status - {order.orderId}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Current Status Display */}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Current Status
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip 
                label={order.status.toUpperCase()} 
                color="primary"
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Status Selection */}
          <TextField
            label="Update Status To"
            name="status"
            select
            value={formData.status}
            onChange={handleChange}
            fullWidth
            disabled={possibleStatuses.length === 0 || loading}
            helperText={
              possibleStatuses.length === 0 
                ? 'No status transitions available' 
                : statusDescriptions[formData.status]
            }
          >
            {possibleStatuses.map(status => (
              <MenuItem key={status} value={status}>
                {status.replace('-', ' ').toUpperCase()}
              </MenuItem>
            ))}
          </TextField>

          {/* Tracking Number */}
          <TextField
            label="Tracking Number"
            name="trackingNumber"
            value={formData.trackingNumber}
            onChange={handleChange}
            fullWidth
            placeholder="e.g., TRK_PKS_2026_1708876543_ABC123"
            disabled={loading}
          />

          {/* Current Location */}
          <TextField
            label="Current Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            fullWidth
            placeholder="e.g., Mumbai Distribution Center"
            helperText="Where is the package currently?"
            disabled={loading}
          />

          {/* Carrier */}
          <TextField
            label="Carrier"
            name="carrier"
            value={formData.carrier}
            onChange={handleChange}
            fullWidth
            placeholder="e.g., DTDC, Fedex, BlueDart"
            disabled={loading}
          />

          {/* Estimated Delivery Date */}
          <TextField
            label="Estimated Delivery Date"
            name="estimatedDeliveryDate"
            type="date"
            value={formData.estimatedDeliveryDate}
            onChange={handleChange}
            fullWidth
            disabled={loading}
            InputLabelProps={{
              shrink: true,
            }}
          />

          {/* Notes */}
          <TextField
            label="Notes/Additional Information"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            placeholder="Add any additional notes or updates..."
            disabled={loading}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || possibleStatuses.length === 0}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          {loading && <CircularProgress size={20} />}
          Update Status
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeliveryStatusUpdate;
