import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import api from '../utils/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      localStorage.removeItem('token');
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        user: null,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        user: null,
        loading: false,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  token: localStorage.getItem('token'),
  user: null,
  loading: !!localStorage.getItem('token'), // Only load if token exists
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user data
      verifyToken();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/profile');
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token: localStorage.getItem('token'),
          user: response.data
        }
      });
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post('/auth/login', { email, password });
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data
      });
      
      return response.data;
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.message || 'Login failed'
      });
      throw error;
    }
  };

  const register = async (name, email, password, role = 'customer', additionalData = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post('/auth/register', { 
        name, 
        email, 
        password, 
        role,
        ...additionalData
      });
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data
      });
      
      return response.data;
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.message || 'Registration failed'
      });
      throw error;
    }
  };

  const logout = () => {
  delete api.defaults.headers.common['Authorization'];
  dispatch({ type: 'LOGOUT' });
};

  const updateUser = async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updatePreferences = async (preferences) => {
    try {
      const response = await api.put('/auth/preferences', { preferences });
      dispatch({
        type: 'UPDATE_USER',
        payload: { preferences: response.data }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const addToHistory = async (productId, duration = 0) => {
    try {
      await api.post('/auth/history', { productId, duration });
    } catch (error) {
      console.error('Failed to update browsing history:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
        updatePreferences,
        addToHistory
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
