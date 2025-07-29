// KidOnboarding.jsx - Main component with updated styling
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Paper, Typography, Box, Alert, Snackbar,
  Fade, CircularProgress, useTheme
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

import PersonalInfoForm from './PersonalInfoForm';
import OnboardingDashboard from './OnboardingDashboard';
import ProgressLogo from './ProgressLogo';

// Updated RTL Theme matching Employee styling
const rtlTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '2.2rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.8rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.4rem'
    }
  },
  palette: {
    primary: {
      main: '#4cb5c3',
      light: '#7ec8d3',
      dark: '#2a8a95',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff7043',
      light: '#ff9575',
      dark: '#c63f17',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'visible',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          }
        },
        contained: {
          background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(76, 181, 195, 0.15)',
            },
            '&.Mui-focused': {
              boxShadow: '0 4px 20px rgba(76, 181, 195, 0.25)',
              transform: 'translateY(-2px)',
            }
          }
        }
      }
    }
  }
});

// Full Screen Container matching Employee design
const FullScreenContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
  backgroundSize: '400% 400%',
  animation: 'gradientShift 20s ease infinite',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 40%, rgba(76, 181, 195, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255, 112, 67, 0.2) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  }
}));

// Modern Header matching Employee design
const ModernHeader = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  position: 'relative',
  zIndex: 2,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    borderRadius: '20px 20px 0 0',
  }
}));

const KidOnboarding = ({ kidId, onboardingData, selectedKid, onKidUpdate }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  
  // Local state
  const [currentStep, setCurrentStep] = useState('info');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formReadOnly, setFormReadOnly] = useState(false);

  // Show notification
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Close notification
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    try {
      // API call logic here
      showNotification('פרטי הילד נשמרו בהצלחה!', 'success');
      if (onKidUpdate) {
        onKidUpdate(formData);
      }
    } catch (error) {
      showNotification('שגיאה בשמירת הנתונים', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={rtlTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
        <FullScreenContainer>
          <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 2 }}>
            
            {/* Header */}
            <ModernHeader>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  fontWeight: 800,
                  textAlign: 'center'
                }}
              >
                🎓 מערכת קליטת ילדים
              </Typography>
            </ModernHeader>

            {/* Progress Logo */}
            {onboardingData && (
              <Box sx={{ mb: 4 }}>
                <ProgressLogo 
                  onboardingData={onboardingData}
                  kidName={selectedKid ? `${selectedKid.firstName} ${selectedKid.lastName}` : null}
                  showFormsSummary={true}
                  compact={false}
                />
              </Box>
            )}

            {/* Content based on current step */}
            <Fade in timeout={600}>
              <Box>
                {currentStep === 'info' && (
                  <Paper 
                    sx={{ 
                      p: 4, 
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981)',
                        borderRadius: '20px 20px 0 0',
                      }
                    }}
                  >
                    <PersonalInfoForm
                      data={selectedKid}
                      onSubmit={handleFormSubmit}
                      isLoading={isLoading}
                      readOnly={formReadOnly}
                    />
                  </Paper>
                )}

                {currentStep === 'dashboard' && onboardingData && (
                  <Paper 
                    sx={{ 
                      p: 4, 
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981)',
                        borderRadius: '20px 20px 0 0',
                      }
                    }}
                  >
                    <OnboardingDashboard
                      onboardingData={onboardingData}
                      selectedKid={selectedKid}
                      onKidUpdate={onKidUpdate}
                      readOnly={formReadOnly}
                    />
                  </Paper>
                )}
              </Box>
            </Fade>

            {/* Notifications */}
            <Snackbar
              open={notification.open}
              autoHideDuration={4000}
              onClose={closeNotification}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert 
                onClose={closeNotification} 
                severity={notification.severity}
                variant="filled"
                sx={{ width: '100%' }}
              >
                {notification.message}
              </Alert>
            </Snackbar>
          </Container>
        </FullScreenContainer>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default KidOnboarding;