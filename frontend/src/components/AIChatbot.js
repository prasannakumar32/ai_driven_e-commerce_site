import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  Close,
  Send,
  SmartToy,
  Person,
  ShoppingBag,
  TrendingUp,
  Help
} from '@mui/icons-material';
import { aiAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const AIChatbot = ({ open, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    'Search for products',
    'Get recommendations',
    'Check order status',
    'Browse categories'
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          type: 'bot',
          text: 'Hello! I\'m your AI shopping assistant. I can help you find products, get personalized recommendations, and answer your questions. How can I assist you today?',
          timestamp: new Date()
        }
      ]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      text: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiAPI.chatbot({
        message: inputMessage.trim(),
        userId: user?.id,
        context: { recentMessages: messages.slice(-3) }
      });

      const botMessage = {
        type: 'bot',
        text: response.data.message,
        products: response.data.products || [],
        suggestions: response.data.suggestions || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      if (response.data.suggestions && response.data.suggestions.length > 0) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      const errorMessage = {
        type: 'bot',
        text: 'I apologize, but I encountered an error. Please try again or contact support.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message, index) => {
    const isBot = message.type === 'bot';
    
    return (
      <Box
        key={index}
        sx={{
          display: 'flex',
          justifyContent: isBot ? 'flex-start' : 'flex-end',
          mb: 2
        }}
      >
        <Box sx={{ display: 'flex', maxWidth: '70%' }}>
          {isBot && (
            <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 32, height: 32 }}>
              <SmartToy fontSize="small" />
            </Avatar>
          )}
          <Paper
            sx={{
              p: 2,
              backgroundColor: isBot ? 'grey.100' : 'primary.main',
              color: isBot ? 'text.primary' : 'white',
              borderRadius: 2
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              {message.text}
            </Typography>
            
            {message.products && message.products.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Recommended Products:
                </Typography>
                <List dense>
                  {message.products.slice(0, 3).map((product, idx) => (
                    <ListItem key={idx} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={product.name}
                        secondary={`$${product.price}`}
                        primaryTypographyProps={{ variant: 'caption' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {message.suggestions && message.suggestions.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Suggestions:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {message.suggestions.slice(0, 3).map((suggestion, idx) => (
                    <Chip
                      key={idx}
                      label={suggestion}
                      size="small"
                      variant="outlined"
                      clickable
                      onClick={() => handleSuggestionClick(suggestion)}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
          {!isBot && (
            <Avatar sx={{ bgcolor: 'secondary.main', ml: 1, width: 32, height: 32 }}>
              <Person fontSize="small" />
            </Avatar>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', maxHeight: 600 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToy color="primary" />
          <Typography variant="h6">AI Shopping Assistant</Typography>
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
        <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
          {messages.map((message, index) => renderMessage(message, index))}
          
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 32, height: 32 }}>
                <SmartToy fontSize="small" />
              </Avatar>
              <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">Thinking...</Typography>
                </Box>
              </Paper>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>

        {suggestions.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Quick Actions:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {suggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  variant="outlined"
                  size="small"
                  clickable
                  onClick={() => handleSuggestionClick(suggestion)}
                  icon={
                    suggestion.includes('Search') ? <ShoppingBag fontSize="small" /> :
                    suggestion.includes('recommend') ? <TrendingUp fontSize="small" /> :
                    <Help fontSize="small" />
                  }
                />
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >
            <Send />
          </IconButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatbot;
