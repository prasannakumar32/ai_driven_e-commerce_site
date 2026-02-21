import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Chip,
  List
} from '@mui/material';
import { Inventory2, ShoppingBag } from '@mui/icons-material';
import OrderCard from './OrderCard';

const OrderHistoryTab = ({
  orders,
  ordersLoading,
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  sortOptions,
  getFilteredAndSortedOrders,
  onCancelOrder,
  onReorder,
  onTrack
}) => {
  return (
    <Paper sx={{ 
      p: 4,
      borderRadius: 2.5,
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.06)'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
            }}>
              <Inventory2 sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
              Order History
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 7 }}>
            {getFilteredAndSortedOrders?.()?.length || 0} orders
            {filterStatus && ` · Filtered: ${filterStatus}`}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3, opacity: 0.5 }} />

      {/* Filter Controls */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
          Filter by Status:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip 
            label="All Orders"
            size="small"
            onClick={() => setFilterStatus?.('')}
            color={!filterStatus ? 'primary' : 'default'}
            variant={!filterStatus ? 'filled' : 'outlined'}
            clickable
            sx={{ 
              fontWeight: 600,
              '&.MuiChip-filled': {
                background: 'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)',
                color: 'white'
              }
            }}
          />
          {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
            <Chip 
              key={status}
              label={status}
              size="small"
              onClick={() => setFilterStatus?.(status)}
              color={filterStatus === status ? 'primary' : 'default'}
              variant={filterStatus === status ? 'filled' : 'outlined'}
              clickable
              sx={{ 
                fontWeight: 500,
                '&.MuiChip-filled': {
                  background: 'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)',
                  color: 'white'
                }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Orders List */}
      {ordersLoading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading your orders...
          </Typography>
        </Box>
      ) : getFilteredAndSortedOrders?.()?.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            {filterStatus ? 'No orders found with this filter' : 'No orders yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {filterStatus ? 'Try changing the filter criteria' : 'Start shopping to see your order history here'}
          </Typography>
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {getFilteredAndSortedOrders?.()?.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onCancel={onCancelOrder}
              onReorder={onReorder}
              onTrack={onTrack}
            />
          ))}
        </List>
      )}
    </Paper>
  );
};

export default OrderHistoryTab;
