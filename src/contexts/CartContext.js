import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI } from '../utils/api';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items || [],
        total: action.payload.total || 0,
        loading: false
      };
    case 'ADD_TO_CART':
      const existingItem = state.items.find(
        item => item.product._id === action.payload.product._id
      );
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.product._id === action.payload.product._id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems)
        };
      } else {
        return {
          ...state,
          items: [...state.items, action.payload],
          total: calculateTotal([...state.items, action.payload])
        };
      }
    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item =>
        item.product._id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    case 'REMOVE_FROM_CART':
      const filteredItems = state.items.filter(
        item => item.product._id !== action.payload.productId
      );
      return {
        ...state,
        items: filteredItems,
        total: calculateTotal(filteredItems)
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

const calculateTotal = (items) => {
  return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};

const initialState = {
  items: [],
  total: 0,
  loading: true,
  error: null
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartAPI.getCart();
      
      // Transform the response to match our frontend structure
      const cartData = response.data;
      const transformedItems = cartData.items.map(item => ({
        product: {
          _id: item.product,
          name: item.name,
          price: item.price,
          images: [item.image],
          stock: item.stock
        },
        quantity: item.quantity
      }));
      
      dispatch({ type: 'SET_CART', payload: { items: transformedItems, total: cartData.total } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to fetch cart' });
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      const response = await axios.post('/api/cart/add', {
        productId: product._id,
        quantity
      });
      
      // Transform the response to match our frontend structure
      const cartData = response.data.cart;
      const transformedItems = cartData.items.map(item => ({
        product: {
          _id: item.product,
          name: item.name,
          price: item.price,
          images: [item.image],
          stock: item.stock
        },
        quantity: item.quantity
      }));
      
      dispatch({ type: 'SET_CART', payload: { items: transformedItems, total: cartData.total } });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to add to cart' });
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await axios.put('/api/cart/update', {
        productId,
        quantity
      });
      
      // Transform the response to match our frontend structure
      const cartData = response.data.cart;
      const transformedItems = cartData.items.map(item => ({
        product: {
          _id: item.product,
          name: item.name,
          price: item.price,
          images: [item.image],
          stock: item.stock
        },
        quantity: item.quantity
      }));
      
      dispatch({ type: 'SET_CART', payload: { items: transformedItems, total: cartData.total } });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to update cart' });
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await axios.delete(`/api/cart/remove/${productId}`);
      
      // Transform the response to match our frontend structure
      const cartData = response.data.cart;
      const transformedItems = cartData.items.map(item => ({
        product: {
          _id: item.product,
          name: item.name,
          price: item.price,
          images: [item.image],
          stock: item.stock
        },
        quantity: item.quantity
      }));
      
      dispatch({ type: 'SET_CART', payload: { items: transformedItems, total: cartData.total } });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to remove from cart' });
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const response = await axios.delete('/api/cart/clear');
      
      dispatch({ type: 'CLEAR_CART' });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to clear cart' });
      throw error;
    }
  };

  const getCartSummary = async () => {
    try {
      const response = await axios.get('/api/cart/summary');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getRecommendations = async () => {
    try {
      const response = await axios.post('/api/cart/recommendations');
      return response.data.recommendations;
    } catch (error) {
      throw error;
    }
  };

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartSummary,
        getRecommendations,
        getItemCount,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
