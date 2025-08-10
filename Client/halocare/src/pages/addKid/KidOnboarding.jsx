// KidOnboarding.jsx - ONLY visual styling changes, ALL original functionality preserved EXACTLY

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
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

// New Redux - PRESERVED EXACTLY
import { 
  fetchOnboardingStatus, 
  setCurrentKid,
  clearOnboardingData,
  selectCurrentKidOnboarding,
  selectOnboardingStatus,
  selectOnboardingError
} from '../../Redux/features/onboardingSlice';
import { 
  fetchKidById, 
  clearSelectedKid
} from '../../Redux/features/kidsSlice';

import PersonalInfoForm from './PersonalInfoForm';
import DynamicFormRenderer from './DynamicFormRenderer';
import OnboardingDashboard from './OnboardingDashboard';
import ProgressLogo from './ProgressLogo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Updated RTL Theme matching Employee styling exactly - VISUAL ONLY
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

// Full Screen Container  
const FullScreenContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
  backgroundSize: '400% 400%',
  animation: 'gradientShift 20s ease infinite',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // background: 'radial-gradient(circle at 30% 40%, rgba(76, 181, 195, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255, 112, 67, 0.2) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
 
}));

// Enhanced Paper styling - VISUAL ONLY
const EnhancedPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 20,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
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
}));

// Enhanced Box styling for headers - VISUAL ONLY
const EnhancedHeaderBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.05) 0%, rgba(255, 112, 67, 0.05) 100%)',
  borderBottom: '1px solid rgba(76, 181, 195, 0.1)'
}));

// ORIGINAL FUNCTIONALITY PRESERVED EXACTLY - only visual wrapper added
const KidOnboarding = () => {
  const { kidId } = useParams(); // PRESERVED EXACTLY
  const navigate = useNavigate(); // PRESERVED EXACTLY
  const dispatch = useDispatch(); // PRESERVED EXACTLY
  
  // Redux state - ALL PRESERVED EXACTLY
  const currentOnboarding = useSelector(selectCurrentKidOnboarding);
  const onboardingStatus = useSelector(selectOnboardingStatus);
  const onboardingError = useSelector(selectOnboardingError);
  const { selectedKid } = useSelector(state => state.kids);
  
  // Local State - ALL PRESERVED EXACTLY
  const [viewMode, setViewMode] = useState('dashboard'); 
  const [selectedForm, setSelectedForm] = useState(null);
  const [formReadOnly, setFormReadOnly] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // PRESERVED EXACTLY - original logic
  const isNewKid = kidId === undefined;

  // PRESERVED EXACTLY - original useEffect with cleanup
  useEffect(() => {
    initializeOnboarding();
    
    return () => {
      dispatch(clearOnboardingData());
      dispatch(clearSelectedKid());
    };
  }, [kidId]);

  // PRESERVED EXACTLY - original function
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

  // PRESERVED EXACTLY - original function
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

  // PRESERVED EXACTLY - original function
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

  // PRESERVED EXACTLY - original function
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

  // PRESERVED EXACTLY - original function
  const handleFormComplete = async (formId) => {
    showNotification('הטופס נשמר בהצלחה!', 'success');
    setViewMode('dashboard');
    setSelectedForm(null);
    setFormReadOnly(false);
    
    setTimeout(() => {
      dispatch(fetchOnboardingStatus(kidId));
    }, 500);
  };

  // PRESERVED EXACTLY - original function
  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedForm(null);
    setFormReadOnly(false);
  };

  // PRESERVED EXACTLY - original function
  const switchToEditMode = () => {
    setFormReadOnly(false);
    setSelectedForm(prev => ({ ...prev, buttonText: 'עריכה' }));
    showNotification('עברת למצב עריכה', 'info');
  };

  // PRESERVED EXACTLY - original function
  const handleSendToParent = (form) => {
    console.log('שליחה להורים:', form);
  };

  // PRESERVED EXACTLY - original function
  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  // PRESERVED EXACTLY - original function
  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // PRESERVED EXACTLY - original loading logic with enhanced container
  if (loading) {
    return (
      <ThemeProvider theme={rtlTheme}>
        <FullScreenContainer maxWidth="md" sx={{ py: 4, textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <CircularProgress size={60} sx={{ color: 'white' }} />
          <Typography variant="h6" sx={{ mt: 2, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            טוען תהליך קליטה...
          </Typography>
        </FullScreenContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={rtlTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <FullScreenContainer dir="rtl" maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 2 }}>
          {/* Breadcrumbs - PRESERVED EXACTLY with enhanced styling */}
          <Breadcrumbs sx={{ 
            mb: 3,
            '& .MuiBreadcrumbs-separator': { color: 'rgba(255, 255, 255, 0.7)' }
          }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                color: 'white',
                '&:hover': { color: 'rgba(255, 255, 255, 0.8)' }
              }}
              onClick={() => navigate('/')}
            >
              <HomeIcon sx={{ mr: 0.5 }} />
              ראשי
            </Box>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                color: 'white',
                '&:hover': { color: 'rgba(255, 255, 255, 0.8)' }
              }}
              onClick={() => navigate('/kids/list')}
            >
              <GroupIcon sx={{ mr: 0.5 }} />
              ניהול ילדים
            </Box>
            <Typography color="white" sx={{ fontWeight: 600 }}>
              {isNewKid ? 'קליטת ילד חדש' : `קליטה - ${selectedKid?.firstName} ${selectedKid?.lastName}`}
            </Typography>
          </Breadcrumbs>

          {/* Errors - PRESERVED EXACTLY */}
          {onboardingError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
              <AlertTitle>שגיאה</AlertTitle>
              {onboardingError}
            </Alert>
          )}

          {/* Logo with progress - PRESERVED EXACTLY */}
          {!isNewKid && currentOnboarding && (
            <ProgressLogo 
              onboardingData={currentOnboarding}
              kidName={selectedKid ? `${selectedKid.firstName} ${selectedKid.lastName}` : null}
              showFormsSummary={viewMode === 'dashboard'}
              compact={viewMode !== 'dashboard'}
            />
          )}

          {/* Dynamic content based on state - PRESERVED EXACTLY */}
          <Fade in={true} timeout={500}>
            <Box>
              {/* Personal information form for a new child - PRESERVED EXACTLY */}
              {isNewKid && (
                <EnhancedPaper sx={{ mb: 3 }}>
                  <EnhancedHeaderBox>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#2a8a95' }}>
                      פרטים אישיים
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      מילוי פרטי הילד וההורים
                    </Typography>
                  </EnhancedHeaderBox>
                  
                  <Box sx={{ p: 3 }}>
                    <PersonalInfoForm
                      data={null}
                      onUpdate={handleKidCreated}
                      isEditMode={false}
                    />
                  </Box>
                </EnhancedPaper>
              )}

              {/* PRESERVED EXACTLY - personalInfo mode */}
              {viewMode === 'personalInfo' && selectedForm && !isNewKid && (
                <EnhancedPaper sx={{ mb: 3 }}>
                  <EnhancedHeaderBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#2a8a95' }}>
                        {selectedForm.formName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedForm.formDescription}
                      </Typography>
                      
                      {/* Status Indicator - PRESERVED EXACTLY */}
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          icon={formReadOnly ? <ViewIcon /> : <EditIcon />}
                          label={formReadOnly ? 'מצב צפייה' : 'מצב עריכה'}
                          color={formReadOnly ? 'info' : 'primary'}
                          size="small"
                        />
                        {selectedForm.status && (
                          <Chip
                            label={`סטטוס: ${selectedForm.status}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={handleBackToDashboard}
                        sx={{ minWidth: 120 }}
                      >
                        חזרה לתהליך הקליטה
                      </Button>
                    </Box>
                  </EnhancedHeaderBox>
                  
                  <Box sx={{ p: 3 }}>
                    <PersonalInfoForm
                      data={isNewKid ? null : selectedKid}
                      onUpdate={(updatedData) => {
                        showNotification('פרטי הילד עודכנו בהצלחה', 'success');
                        handleBackToDashboard();
                      }}
                      isEditMode={!isNewKid} 
                      readOnly={formReadOnly} 
                    />
                  </Box>
                </EnhancedPaper>
              )}

              {/* Onboarding Process Dashboard - PRESERVED EXACTLY */}
              {viewMode === 'dashboard' && currentOnboarding && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold" sx={{ 
                      color: 'white',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      תהליך קליטה
                    </Typography>
                  </Box>

                  <OnboardingDashboard
                    onboardingData={currentOnboarding}
                    selectedKid={selectedKid}
                    onFormClick={handleFormClick}
                    onSendToParent={handleSendToParent}
                    onRefresh={handleRefresh}
                  />
                </>
              )}

              {/* Filling/Viewing Dynamic Form - PRESERVED EXACTLY */}
              {viewMode === 'form' && selectedForm && (
                <EnhancedPaper>
                  <EnhancedHeaderBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#2a8a95' }}>
                        {selectedForm.formName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedForm.formDescription}
                      </Typography>
                      
                      {/* Status Indicator - PRESERVED EXACTLY */}
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          icon={formReadOnly ? <ViewIcon /> : <EditIcon />}
                          label={formReadOnly ? 'מצב צפייה' : 'מצב עריכה'}
                          color={formReadOnly ? 'info' : 'primary'}
                          size="small"
                        />
                        {selectedForm.status && (
                          <Chip
                            label={`סטטוס: ${selectedForm.status}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {/* PRESERVED EXACTLY - Switch to edit mode */}
                      {formReadOnly && !selectedForm.formName.includes('אישור') && (
                        <Button
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={switchToEditMode}
                          color="primary"
                        >
                          עבור לעריכה
                        </Button>
                      )}
                      
                      <Button
                        variant="outlined"
                        onClick={handleBackToDashboard}
                        sx={{ minWidth: 120 }}
                      >
                        חזרה
                      </Button>
                    </Box>
                  </EnhancedHeaderBox>
                  
                  <Box sx={{ p: 3 }}>
                    <DynamicFormRenderer
                      kidId={parseInt(kidId)}
                      formId={selectedForm.formId}
                      formData={selectedForm}
                      onComplete={handleFormComplete}
                      onBack={handleBackToDashboard}
                      readOnly={formReadOnly}
                    />
                  </Box>
                </EnhancedPaper>
              )}
            </Box>
          </Fade>

          {/* Notifications - PRESERVED EXACTLY */}
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
        </FullScreenContainer>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default KidOnboarding;