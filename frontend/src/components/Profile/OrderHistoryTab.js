import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Divider,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  Chip,
  List
} from '@mui/material';
import { Package, ShoppingBag, Sort } from '@mui/icons-material';
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
      {/* Header with Results Count and Sort */}
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
              <Package sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
              Order History
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 7 }}>
            {getFilteredAndSortedOrders().length} {getFilteredAndSortedOrders().length === 1 ? 'order' : 'orders'}
            {filterStatus && ` · Filtered: ${filterStatus}`}
          </Typography>
        </Box>
        
        {/* Sort Dropdown */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" color="text.secondary" fontWeight="500">
            Sort:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              displayEmpty
              sx={{
                borderRadius: 1.5,
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 1
                },
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#2196f3'
                  }
                }
              }}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Sort fontSize="small" />
                    {option.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
            onClick={() => setFilterStatus('')}
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
              onClick={() => setFilterStatus(status)}
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

      {ordersLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={40} />
        </Box>
      ) : orders && orders.length > 0 ? (
        <List sx={{ p: 0 }}>
          {getFilteredAndSortedOrders().map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onCancel={onCancelOrder}
              onReorder={onReorder}
              onTrack={onTrack}
            />
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            No orders yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Start shopping to see your orders here
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default OrderHistoryTab;
