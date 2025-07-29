// KidOnboarding.jsx - ONLY visual styling changes, ALL original functionality preserved

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Box, Paper, Typography, CircularProgress, Breadcrumbs,
  Button, Alert, AlertTitle, Fade, Snackbar, Chip
} from '@mui/material';
import {
  Home as HomeIcon,
  Group as GroupIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

import PersonalInfoForm from './PersonalInfoForm';
import DynamicFormRenderer from './DynamicFormRenderer';
import OnboardingDashboard from './OnboardingDashboard';
import ProgressLogo from './ProgressLogo';
import { fetchOnboardingStatus, setCurrentKid, clearOnboardingData, selectCurrentKidOnboarding, selectOnboardingStatus, selectOnboardingError } from '../../Redux/features/onboardingSlice';
import { 
  fetchKidById, 
  clearSelectedKid
} from '../../Redux/features/kidsSlice';

// Updated RTL Theme matching Employee styling - VISUAL ONLY
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

// Full Screen Container - VISUAL STYLING ONLY
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

// Modern Header - VISUAL STYLING ONLY
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

// ORIGINAL FUNCTIONALITY PRESERVED - only visual wrapper added
const KidOnboarding = () => {
  const { kidId } = useParams(); // PRESERVED
  const navigate = useNavigate(); // PRESERVED
  const dispatch = useDispatch(); // PRESERVED
  
  // Redux state - ALL PRESERVED
  const currentOnboarding = useSelector(selectCurrentKidOnboarding);
  const onboardingStatus = useSelector(selectOnboardingStatus);
  const onboardingError = useSelector(selectOnboardingError);
  const { selectedKid } = useSelector(state => state.kids);
  
  // Local State - ALL PRESERVED
  const [viewMode, setViewMode] = useState('dashboard'); 
  const [selectedForm, setSelectedForm] = useState(null);
  const [formReadOnly, setFormReadOnly] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // PRESERVED - original logic
  const isNewKid = kidId === undefined;

  // PRESERVED - original useEffect with cleanup
  useEffect(() => {
    initializeOnboarding();
    
    return () => {
      dispatch(clearOnboardingData());
      dispatch(clearSelectedKid());
    };
  }, [kidId]);

  // PRESERVED - original function
  const initializeOnboarding = async () => {
    try {
      setLoading(true);
      
      if (isNewKid) {
        setViewMode('personalInfo');
      } else {
        await Promise.all([
          dispatch(fetchKidById(kidId)),
          dispatch(setCurrentKid(kidId)),
          dispatch(fetchOnboardingStatus(kidId))
        ]);
        setViewMode('dashboard');
      }
    } catch (error) {
      console.error('שגיאה בטעינת נתוני קליטה:', error);
      showNotification('שגיאה בטעינת נתוני קליטה', 'error');
    } finally {
      setLoading(false);
    }
  };

  // PRESERVED - original function
  const handleRefresh = async () => {
    if (!kidId || isNewKid) return;
    
    try {
      setRefreshing(true);
      await dispatch(fetchOnboardingStatus(kidId));
      showNotification('הנתונים עודכנו בהצלחה', 'success');
    } catch (error) {
      showNotification('שגיאה ברענון הנתונים', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  // PRESERVED - original function
  const handleKidCreated = async (newKidData) => {
    try {
      showNotification('ילד נוצר בהצלחה! מעביר לתהליך קליטה...', 'success');
      
      setTimeout(() => {
        navigate(`/kids/onboarding/${newKidData.id}`);
      }, 1500);
    } catch (error) {
      console.error('שגיאה ביצירת ילד:', error);
      showNotification('שגיאה ביצירת הילד', 'error');
    }
  };

  // PRESERVED - original function
  const handleFormClick = (form, mode = 'auto') => {
    if (form.formId === 1002) {
      setSelectedForm({ ...form, buttonText: mode === 'view' ? 'צפייה' : 'עריכה' });
      setFormReadOnly(mode === 'view');
      setViewMode('personalInfo');
      return;
    }

    let readOnlyMode = false;
    let buttonText = '';

    // Setting mode based on form status and user request
    if (mode === 'view') {
      readOnlyMode = true;
      buttonText = 'צפייה';
    } else if (mode === 'edit') {
      readOnlyMode = false;
      buttonText = 'עריכה';
    } else {
      // Automatic mode based on status
      if (['Completed', 'CompletedByParent'].includes(form.status)) {
        readOnlyMode = true;
        buttonText = 'צפייה';
      } else {
        readOnlyMode = false;
        buttonText = ['NotStarted'].includes(form.status) ? 'התחלה' : 'המשך';
      }
    }

    setSelectedForm({ ...form, buttonText });
    setFormReadOnly(readOnlyMode);
    setViewMode('form');
  };

  // PRESERVED - original function
  const handleFormComplete = async (formId) => {
    showNotification('הטופס נשמר בהצלחה!', 'success');
    setViewMode('dashboard');
    setSelectedForm(null);
    setFormReadOnly(false);
    
    setTimeout(() => {
      dispatch(fetchOnboardingStatus(kidId));
    }, 500);
  };

  // PRESERVED - original function
  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedForm(null);
    setFormReadOnly(false);
  };

  // PRESERVED - original function
  const switchToEditMode = () => {
    setFormReadOnly(false);
    setSelectedForm(prev => ({ ...prev, buttonText: 'עריכה' }));
    showNotification('עברת למצב עריכה', 'info');
  };

  // PRESERVED - original function
  const handleSendToParent = (form) => {
    console.log('שליחה להורים:', form);
  };

  // PRESERVED - original function
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // PRESERVED - original function
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // PRESERVED - original function
  const handleKidUpdate = (updatedKid) => {
    setViewMode('dashboard');
    initializeOnboarding();
    showNotification('פרטי הילד עודכנו בהצלחה!', 'success');
  };

  // PRESERVED - original function but renamed to match usage
  const handleFormSelect = (form) => {
    handleFormClick(form);
  };

  // // PRESERVED - original function
  // const handleBackToDashboard = () => {
  //   setViewMode('dashboard');
  //   setSelectedForm(null);
  // };

  // PRESERVED - original loading logic
  if (loading) {
    return (
      <ThemeProvider theme={rtlTheme}>
        <FullScreenContainer>
          <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '60vh',
            }}>
              <CircularProgress size={60} sx={{ color: 'white', mb: 3 }} />
              <Typography variant="h6" sx={{ 
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                fontWeight: 600
              }}>
                טוען נתוני קליטה...
              </Typography>
            </Box>
          </Container>
        </FullScreenContainer>
      </ThemeProvider>
    );
  }

  // PRESERVED - original error logic
  if (onboardingError) {
    return (
      <ThemeProvider theme={rtlTheme}>
        <FullScreenContainer>
          <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 2 }}>
            <Alert 
              severity="error" 
              sx={{ 
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                שגיאה בטעינת נתוני הקליטה
              </Typography>
              <Typography variant="body2">
                {onboardingError}
              </Typography>
            </Alert>
          </Container>
        </FullScreenContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={rtlTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <FullScreenContainer dir="rtl">
          <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 2 }}>
            
            {/* PRESERVED - Original Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 3, color: 'white' }}>
              <Box 
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'white' }}
                onClick={() => navigate('/')}
              >
                <HomeIcon sx={{ mr: 0.5 }} />
                ראשי
              </Box>
              <Box 
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'white' }}
                onClick={() => navigate('/kids/list')}
              >
                <GroupIcon sx={{ mr: 0.5 }} />
                ניהול ילדים
              </Box>
              <Typography color="white" sx={{ fontWeight: 600 }}>
                {isNewKid ? 'קליטת ילד חדש' : `קליטה - ${selectedKid?.firstName} ${selectedKid?.lastName}`}
              </Typography>
            </Breadcrumbs>

            {/* PRESERVED - Original Error handling */}
            {onboardingError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <AlertTitle>שגיאה</AlertTitle>
                {onboardingError}
              </Alert>
            )}

            {/* Progress Logo - PRESERVED CONDITION */}
            {!isNewKid && currentOnboarding && (
              <Box sx={{ mb: 4 }}>
                <ProgressLogo 
                  onboardingData={currentOnboarding}
                  kidName={selectedKid ? `${selectedKid.firstName} ${selectedKid.lastName}` : null}
                  showFormsSummary={true}
                  compact={false}
                />
              </Box>
            )}

            {/* Content based on view mode - PRESERVED LOGIC */}
            <Fade in timeout={600}>
              <Box>
                {/* Personal Info Form - PRESERVED CONDITION */}
                {viewMode === 'personalInfo' && (
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
                      onSubmit={handleKidCreated}
                      isLoading={onboardingStatus === 'loading'}
                      readOnly={formReadOnly}
                    />
                  </Paper>
                )}

                {/* Dashboard - PRESERVED CONDITION */}
                {viewMode === 'dashboard' && currentOnboarding && (
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
                      onboardingData={currentOnboarding}
                      selectedKid={selectedKid}
                      onKidUpdate={handleKidUpdate}
                      onFormClick={handleFormClick}
                      onSendToParent={handleSendToParent}
                      readOnly={formReadOnly}
                    />
                  </Paper>
                )}

                {/* PRESERVED - Dynamic Form */}
                {viewMode === 'form' && selectedForm && (
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
                    <DynamicFormRenderer
                      form={selectedForm}
                      kidId={kidId}
                      readOnly={formReadOnly}
                      onComplete={handleFormComplete}
                      onBack={handleBackToDashboard}
                      onSwitchToEdit={switchToEditMode}
                    />
                  </Paper>
                )}
              </Box>
            </Fade>

            {/* Notifications - PRESERVED */}
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