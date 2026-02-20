import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../utils/api';
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
        error: null,
        isGuest: action.payload.isGuest || false,
        guestId: action.payload.guestId || null
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
      const response = await authAPI.getProfile();
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

  const login = async (loginIdentifier, password, isGuest = false, guestId = null) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (isGuest) {
        // For guest users, create a temporary guest session
        const guestUser = {
          id: null,
          isGuest: true,
          guestId: guestId,
          name: loginIdentifier,
          email: loginIdentifier.includes('@') ? loginIdentifier : ''
        };
        
        // Simulate guest login success
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            token: `guest_token_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            user: guestUser,
            isGuest: true,
            guestId: guestId
          }
        });
      } else {
        // Regular user login
        const response = await authAPI.login({ loginIdentifier, password });
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: response.data
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Login failed';
      console.error('[AUTH] Login failed:', {
        message: errorMsg,
        status: error.response?.status,
        data: error.response?.data,
        axiosError: error.isAxiosError,
        code: error.code
      });
      
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMsg
      });
      throw error;
    }
  };

  const register = async (username, name, email, password, role = 'customer', additionalData = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.register({ 
        username,
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
      const response = await authAPI.updateProfile(userData);
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
      const response = await authAPI.updatePreferences({ preferences });
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
      // Only add to history if user is authenticated
      if (state.isAuthenticated) {
        await authAPI.addToHistory({ productId, duration });
      }
    } catch (error) {
      // Don't throw errors for history tracking failures
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
