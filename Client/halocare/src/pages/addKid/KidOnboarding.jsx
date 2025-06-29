// src/pages/kids/KidOnboarding.jsx - עיצוב מתקדם מבוסס על Employee components
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Box, Paper, Typography, CircularProgress, Breadcrumbs,
  Button, Alert, AlertTitle, Fade, Snackbar, Chip, Stack
} from '@mui/material';
import {
  Home as HomeIcon,
  Group as GroupIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  AutoAwesome as AutoAwesomeIcon,
  Celebration as CelebrationIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled, alpha } from '@mui/material/styles';

// New Redux
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

// יצירת theme מתקדם עם תמיכה ב-RTL כמו ב-Employee components
const rtlTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
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
      light: '#7cd8e5',
      dark: '#2a8a95',
    },
    secondary: {
      main: '#ff7043',
      light: '#ffa270',
      dark: '#c63f17',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#047857',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8',
    }
  },
});

// קונטיינר מסך מלא עם רקע מתקדם
const FullScreenContainer = styled(Box)(({ theme }) => ({
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
    background: `
      radial-gradient(circle at 20% 80%, rgba(76, 181, 195, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 112, 67, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
    zIndex: 1,
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  }
}));

// כרטיס עיקרי מעוצב
const MainCard = styled(Paper)(({ theme }) => ({
  borderRadius: 24,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
  overflow: 'visible',
  position: 'relative',
  zIndex: 2,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    borderRadius: '24px 24px 0 0',
  }
}));

// כותרת סקציה מעוצבת
const SectionHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1) 0%, rgba(255, 112, 67, 0.1) 100%)',
  borderBottom: '1px solid rgba(76, 181, 195, 0.2)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: '2px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043)',
  }
}));

// כפתור מונפש מתקדם
const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: '12px 24px',
  fontWeight: 600,
  fontSize: '1rem',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  boxShadow: '0 6px 20px rgba(76, 181, 195, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 35px rgba(76, 181, 195, 0.4)',
    background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'all 0.5s ease',
  },
  '&:hover::after': {
    left: '100%',
  }
}));

// ברדקרמבס מעוצב
const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  '& .MuiBreadcrumbs-separator': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiBreadcrumbs-li': {
    color: 'rgba(255, 255, 255, 0.8)',
    cursor: 'pointer',
    padding: theme.spacing(1, 2),
    borderRadius: 12,
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      transform: 'translateY(-2px)',
    }
  }
}));

// התראה מעוצבת
const StyledAlert = styled(Alert)(({ theme, severity }) => ({
  borderRadius: 16,
  border: `2px solid ${alpha(theme.palette[severity]?.main, 0.3)}`,
  background: `linear-gradient(135deg, ${alpha(theme.palette[severity]?.main, 0.1)}, ${alpha(theme.palette[severity]?.light, 0.05)})`,
  boxShadow: `0 4px 15px ${alpha(theme.palette[severity]?.main, 0.2)}`,
  '& .MuiAlert-icon': {
    fontSize: '1.5rem',
  }
}));

// מסך טעינה מעוצב
const LoadingScreen = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  textAlign: 'center',
  color: 'white',
  position: 'relative',
  zIndex: 2,
}));

// Chip סטטוס מעוצב
const StatusChip = styled(Chip)(({ theme, variant = 'primary' }) => ({
  fontWeight: 600,
  borderRadius: 20,
  background: `linear-gradient(135deg, ${alpha(theme.palette[variant]?.main, 0.1)}, ${alpha(theme.palette[variant]?.light, 0.05)})`,
  border: `1px solid ${alpha(theme.palette[variant]?.main, 0.3)}`,
  color: theme.palette[variant]?.main,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 4px 15px ${alpha(theme.palette[variant]?.main, 0.3)}`,
  }
}));

const KidOnboarding = () => {
  const { kidId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const currentOnboarding = useSelector(selectCurrentKidOnboarding);
  const onboardingStatus = useSelector(selectOnboardingStatus);
  const onboardingError = useSelector(selectOnboardingError);
  const { selectedKid } = useSelector(state => state.kids);
  
  // Local State 
  const [viewMode, setViewMode] = useState('dashboard'); 
  const [selectedForm, setSelectedForm] = useState(null);
  const [formReadOnly, setFormReadOnly] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const isNewKid = kidId === undefined;

  useEffect(() => {
    initializeOnboarding();
    
    return () => {
      dispatch(clearOnboardingData());
      dispatch(clearSelectedKid());
    };
  }, [kidId]);

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

  // רענון נתונים
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

  // יצירת ילד חדש
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

  // פתיחת טופס למילוי/צפייה 
  const handleFormClick = (form, mode = 'auto') => {
    if (form.formId === 1002) {
      setSelectedForm({ ...form, buttonText: mode === 'view' ? 'צפייה' : 'עריכה' });
      setFormReadOnly(mode === 'view');
      setViewMode('personalInfo');
      return;
    }

    let readOnlyMode = false;
    let buttonText = '';

    // הגדרת מצב על פי סטטוס הטופס ובקשת המשתמש
    if (mode === 'view') {
      readOnlyMode = true;
      buttonText = 'צפייה';
    } else if (mode === 'edit') {
      readOnlyMode = false;
      buttonText = 'עריכה';
    } else {
      // מצב אוטומטי על פי סטטוס
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

  // השלמת טופס
  const handleFormComplete = async (formId) => {
    showNotification('הטופס נשמר בהצלחה!', 'success');
    setViewMode('dashboard');
    setSelectedForm(null);
    setFormReadOnly(false);
    
    setTimeout(() => {
      dispatch(fetchOnboardingStatus(kidId));
    }, 500);
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedForm(null);
    setFormReadOnly(false);
  };

  // מעבר ממצב צפייה למצב עריכה
  const switchToEditMode = () => {
    setFormReadOnly(false);
    setSelectedForm(prev => ({ ...prev, buttonText: 'עריכה' }));
    showNotification('עברת למצב עריכה', 'info');
  };

  // שליחה להורים
  const handleSendToParent = (form) => {
    console.log('שליחה להורים:', form);
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <ThemeProvider theme={rtlTheme}>
        <FullScreenContainer>
          <LoadingScreen>
            <Fade in timeout={1000}>
              <Box>
                <CircularProgress size={80} sx={{ color: 'white', mb: 3 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  ⏳ טוען תהליך קליטה...
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  אנא המתן בזמן טעינת הנתונים
                </Typography>
              </Box>
            </Fade>
          </LoadingScreen>
        </FullScreenContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={rtlTheme}>
      <FullScreenContainer>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Container dir="rtl" maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 2 }}>
            {/* Breadcrumbs */}
            <StyledBreadcrumbs sx={{ mb: 4 }}>
              <Box 
                sx={{ display: 'flex', alignItems: 'center' }}
                onClick={() => navigate('/')}
              >
                <HomeIcon sx={{ mr: 0.5 }} />
                🏠 ראשי
              </Box>
              <Box 
                sx={{ display: 'flex', alignItems: 'center' }}
                onClick={() => navigate('/kids/list')}
              >
                <GroupIcon sx={{ mr: 0.5 }} />
                👥 ניהול ילדים
              </Box>
              <Typography color="white" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                {isNewKid ? '🌟 קליטת ילד חדש' : `📋 קליטה - ${selectedKid?.firstName} ${selectedKid?.lastName}`}
              </Typography>
            </StyledBreadcrumbs>

            {/* שגיאות */}
            {onboardingError && (
              <Fade in timeout={500}>
                <StyledAlert severity="error" sx={{ mb: 4 }}>
                  <AlertTitle sx={{ fontWeight: 700 }}>❌ שגיאה</AlertTitle>
                  {onboardingError}
                </StyledAlert>
              </Fade>
            )}

            {/* לוגו עם התקדמות */}
            {!isNewKid && currentOnboarding && (
              <Fade in timeout={800}>
                <ProgressLogo 
                  onboardingData={currentOnboarding}
                  kidName={selectedKid ? `${selectedKid.firstName} ${selectedKid.lastName}` : null}
                  showFormsSummary={viewMode === 'dashboard'}
                  compact={viewMode !== 'dashboard'}
                />
              </Fade>
            )}

            {/* תוכן דינמי על פי מצב */}
            <Fade in={true} timeout={1000}>
              <Box>
                {/* טופס פרטים אישיים לילד חדש */}
                {isNewKid && (
                  <MainCard sx={{ mb: 4 }}>
                    <SectionHeader>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AutoAwesomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                            🌟 פרטים אישיים
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            מילוי פרטי הילד וההורים
                          </Typography>
                        </Box>
                      </Box>
                    </SectionHeader>
                    
                    <Box sx={{ p: 4 }}>
                      <PersonalInfoForm
                        data={null}
                        onUpdate={handleKidCreated}
                        isEditMode={false}
                      />
                    </Box>
                  </MainCard>
                )}

                {viewMode === 'personalInfo' && selectedForm && !isNewKid && (
                  <MainCard sx={{ mb: 4 }}>
                    <SectionHeader>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CelebrationIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                        <Box>
                          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                            {selectedForm.formName}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            {selectedForm.formDescription}
                          </Typography>
                          
                          {/* אינדיקטור סטטוס */}
                          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                            <StatusChip
                              icon={formReadOnly ? <ViewIcon /> : <EditIcon />}
                              label={formReadOnly ? '👁️ מצב צפייה' : '✏️ מצב עריכה'}
                              variant={formReadOnly ? 'info' : 'primary'}
                              size="small"
                            />
                            {selectedForm.status && (
                              <StatusChip
                                label={`📊 סטטוס: ${selectedForm.status}`}
                                size="small"
                                variant="secondary"
                              />
                            )}
                          </Stack>
                        </Box>
                      </Box>
                      
                      <AnimatedButton
                        variant="outlined"
                        onClick={handleBackToDashboard}
                        sx={{
                          minWidth: 140,
                          color: '#6b7280',
                          borderColor: '#d1d5db',
                          background: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            borderColor: '#9ca3af',
                            background: 'rgba(0, 0, 0, 0.04)',
                          }
                        }}
                      >
                        🔙 חזרה לדשבורד
                      </AnimatedButton>
                    </SectionHeader>
                    
                    <Box sx={{ p: 4 }}>
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
                  </MainCard>
                )}

                {/* דשבורד תהליך הקליטה */}
                {viewMode === 'dashboard' && currentOnboarding && (
                  <Fade in timeout={1200}>
                    <Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 4,
                        color: 'white'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <TrendingUpIcon sx={{ fontSize: 40 }} />
                          <Typography variant="h4" fontWeight="bold">
                            📊 תהליך קליטה
                          </Typography>
                        </Box>
                      </Box>

                      <OnboardingDashboard
                        onboardingData={currentOnboarding}
                        selectedKid={selectedKid}
                        onFormClick={handleFormClick}
                        onSendToParent={handleSendToParent}
                        onRefresh={handleRefresh}
                      />
                    </Box>
                  </Fade>
                )}

                {/* מילוי/צפייה בטופס דינמי */}
                {viewMode === 'form' && selectedForm && (
                  <MainCard>
                    <SectionHeader>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AutoAwesomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                            {selectedForm.formName}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            {selectedForm.formDescription}
                          </Typography>
                          
                          {/* אינדיקטור סטטוס */}
                          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                            <StatusChip
                              icon={formReadOnly ? <ViewIcon /> : <EditIcon />}
                              label={formReadOnly ? '👁️ מצב צפייה' : '✏️ מצב עריכה'}
                              variant={formReadOnly ? 'info' : 'primary'}
                              size="small"
                            />
                            {selectedForm.status && (
                              <StatusChip
                                label={`📊 סטטוס: ${selectedForm.status}`}
                                size="small"
                                variant="secondary"
                              />
                            )}
                          </Stack>
                        </Box>
                      </Box>
                      
                      <Stack direction="row" spacing={2}>
                        {formReadOnly && !selectedForm.formName.includes('אישור') && (
                          <AnimatedButton
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={switchToEditMode}
                            sx={{
                              background: 'linear-gradient(45deg, #ff7043 30%, #c63f17 90%)',
                              color: 'white',
                              border: 'none',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #c63f17 30%, #b91c1c 90%)',
                              }
                            }}
                          >
                            ✏️ עבר לעריכה
                          </AnimatedButton>
                        )}
                        
                        <AnimatedButton
                          variant="outlined"
                          onClick={handleBackToDashboard}
                          sx={{
                            minWidth: 140,
                            color: '#6b7280',
                            borderColor: '#d1d5db',
                            background: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': {
                              borderColor: '#9ca3af',
                              background: 'rgba(0, 0, 0, 0.04)',
                            }
                          }}
                        >
                          🔙 חזרה לדשבורד
                        </AnimatedButton>
                      </Stack>
                    </SectionHeader>
                    
                    <Box sx={{ p: 4 }}>
                      <DynamicFormRenderer
                        kidId={parseInt(kidId)}
                        formId={selectedForm.formId}
                        formData={selectedForm}
                        onComplete={handleFormComplete}
                        onBack={handleBackToDashboard}
                        readOnly={formReadOnly}
                      />
                    </Box>
                  </MainCard>
                )}
              </Box>
            </Fade>

            {/* התראות */}
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
                sx={{ 
                  width: '100%',
                  borderRadius: 3,
                  fontWeight: 600,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                }}
              >
                {notification.message}
              </Alert>
            </Snackbar>
          </Container>
        </LocalizationProvider>
      </FullScreenContainer>
    </ThemeProvider>
  );
};

export default KidOnboarding;