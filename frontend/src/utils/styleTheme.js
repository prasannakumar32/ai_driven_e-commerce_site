// Shared styling theme and constants for uniform look & feel
export const commonStyles = {
  // Page containers
  pageContainer: {
    py: 4,
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
  },
  
  // Card/Paper styling
  paperCard: {
    p: 3,
    borderRadius: 2,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
      transform: 'translateY(-2px)'
    }
  },

  successPaperCard: {
    p: 3,
    borderRadius: 2,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    borderLeft: '4px solid #4caf50',
    background: 'linear-gradient(135deg, #f0f7f0 0%, #ffffff 100%)'
  },

  infoPaperCard: {
    p: 3,
    borderRadius: 2,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    borderLeft: '4px solid #2196f3',
    background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)'
  },

  // Header styling
  sectionHeader: {
    fontWeight: 700,
    color: '#1a1a1a',
    mb: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    fontSize: '1.3rem'
  },

  // Button styling
  primaryButton: {
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    borderRadius: 1.5,
    py: 1.5,
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(33, 150, 243, 0.2)',
    '&:hover': {
      boxShadow: '0 4px 16px rgba(33, 150, 243, 0.3)',
      transform: 'translateY(-1px)'
    }
  },

  outlinedButton: {
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    borderRadius: 1.5,
    py: 1.5,
    border: '2px solid',
    transition: 'all 0.3s ease'
  },

  // Success message styling
  successBadge: {
    bgcolor: 'success.main',
    width: 100,
    height: 100,
    boxShadow: '0 8px 24px rgba(76, 175, 80, 0.3)',
    animation: 'scale-in 0.5s ease-out'
  },

  // Delivery info box
  deliveryBox: {
    p: 3,
    mb: 3,
    borderRadius: 2,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  // Text styling
  subheading: {
    fontWeight: 600,
    color: '#333',
    fontSize: '1.1rem'
  },

  secondaryText: {
    color: '#666',
    fontSize: '0.95rem'
  },

  // List item styling
  listItemBox: {
    px: 2,
    py: 2.5,
    borderRadius: 1.5,
    mb: 1.5,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    '&:hover': {
      bgcolor: '#f9f9f9'
    },
    backgroundColor: 'transparent'
  },

  // Chip styling
  statusChip: {
    borderRadius: '20px',
    fontWeight: 600,
    fontSize: '0.9rem'
  },

  // Step indicator
  stepBox: {
    mb: 2,
    display: 'flex',
    gap: 2
  }
};

// Animation keyframes
export const animations = `
  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// Color palette
export const colors = {
  primary: '#2196f3',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: {
    primary: '#1a1a1a',
    secondary: '#666666',
    light: '#999999'
  }
};
