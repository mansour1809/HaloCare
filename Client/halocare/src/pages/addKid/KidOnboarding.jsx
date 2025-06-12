// src/pages/kids/KidOnboarding.jsx - גרסה מתוקנת עם אפשרות צפייה ועריכה
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
  Refresh as RefreshIcon,
  CheckCircle as SuccessIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

// Redux החדש
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
import { 
  clearCurrentFormAnswers 
} from '../../Redux/features/answersSlice'; // 🔥 הוספה

// קומפוננטים
import PersonalInfoForm from './PersonalInfoForm';
import DynamicFormRenderer from './DynamicFormRenderer';
import OnboardingDashboard from './OnboardingDashboard';
import ProgressLogo from './ProgressLogo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const KidOnboarding = () => {
  const { kidId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const currentOnboarding = useSelector(selectCurrentKidOnboarding);
  const onboardingStatus = useSelector(selectOnboardingStatus);
  const onboardingError = useSelector(selectOnboardingError);
  const { selectedKid } = useSelector(state => state.kids);
  
  // State מקומי
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'form' | 'personalInfo'
  const [selectedForm, setSelectedForm] = useState(null);
  const [formReadOnly, setFormReadOnly] = useState(false); // 🔥 מצב צפייה/עריכה
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const isNewKid = kidId === undefined;

  // טעינה ראשונית
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

  // 🔥 פתיחת טופס למילוי/צפייה - מתוקן
  const handleFormClick = (form, mode = 'auto') => {
    let readOnlyMode = false;
    let buttonText = '';

    // 🔥 קביעת מצב לפי סטטוס הטופס ובקשת המשתמש
    if (mode === 'view') {
      readOnlyMode = true;
      buttonText = 'צפייה';
    } else if (mode === 'edit') {
      readOnlyMode = false;
      buttonText = 'עריכה';
    } else {
      // מצב אוטומטי לפי סטטוס
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
    
    // 🔥 ניקוי תשובות כשמשלימים טופס
    dispatch(clearCurrentFormAnswers());
    
    // רענון אוטומטי
    setTimeout(() => {
      dispatch(fetchOnboardingStatus(kidId));
    }, 500);
  };

  // חזרה לדשבורד
  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedForm(null);
    setFormReadOnly(false);
    
    // 🔥 ניקוי תשובות כשחוזרים לדשבורד
    dispatch(clearCurrentFormAnswers());
  };

  // 🔥 מעבר ממצב צפייה לעריכה
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
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          טוען תהליך קליטה...
        </Typography>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container dir="rtl" maxWidth="lg" sx={{ py: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Box 
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <HomeIcon sx={{ mr: 0.5 }} />
            ראשי
          </Box>
          <Box 
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => navigate('/kids/list')}
          >
            <GroupIcon sx={{ mr: 0.5 }} />
            ניהול ילדים
          </Box>
          <Typography color="text.primary">
            {isNewKid ? 'קליטת ילד חדש' : `קליטה - ${selectedKid?.firstName} ${selectedKid?.lastName}`}
          </Typography>
        </Breadcrumbs>

        {/* שגיאות */}
        {onboardingError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>שגיאה</AlertTitle>
            {onboardingError}
          </Alert>
        )}

        {/* הלוגו עם הפרוגרס */}
        {!isNewKid && currentOnboarding && (
          <ProgressLogo 
            onboardingData={currentOnboarding}
            kidName={selectedKid ? `${selectedKid.firstName} ${selectedKid.lastName}` : null}
            showFormsSummary={viewMode === 'dashboard'}
            compact={viewMode !== 'dashboard'}
          />
        )}

        {/* תוכן דינמי לפי מצב */}
        <Fade in={true} timeout={500}>
          <Box>
            {/* טופס פרטים אישיים */}
            {viewMode === 'personalInfo' && (
              <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
                  <Typography variant="h5" gutterBottom>
                    פרטים אישיים
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    מילוי פרטי הילד וההורים
                  </Typography>
                </Box>
                
                <Box sx={{ p: 3 }}>
                  <PersonalInfoForm
                    data={null}
                    onUpdate={handleKidCreated}
                    isEditMode={false}
                  />
                </Box>
              </Paper>
            )}

            {/* דשבורד תהליך קליטה */}
            {viewMode === 'dashboard' && currentOnboarding && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" fontWeight="bold">
                    תהליך קליטה
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    {refreshing ? 'מרענן...' : 'רענן'}
                  </Button>
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

            {/* 🔥 מילוי/צפייה בטופס דינמי - מתוקן */}
            {viewMode === 'form' && selectedForm && (
              <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 3, backgroundColor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {selectedForm.formName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedForm.formDescription}
                    </Typography>
                    
                    {/* 🔥 אינדיקטור מצב */}
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
                    {/* 🔥 כפתור מעבר בין מצבים */}
                    {formReadOnly && (
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={switchToEditMode}
                        color="primary"
                      >
                        עבר לעריכה
                      </Button>
                    )}
                    
                    <Button
                      variant="outlined"
                      onClick={handleBackToDashboard}
                      sx={{ minWidth: 120 }}
                    >
                      חזרה לדשבורד
                    </Button>
                  </Box>
                </Box>
                
                <Box sx={{ p: 3 }}>
                  {selectedForm.formName === 'פרטים אישיים' ? (
                    <PersonalInfoForm
                      // data={null}
                      onUpdate={handleKidCreated}
                      // isEditMode={false}
                    />
                  ) : (
                    <DynamicFormRenderer
                      kidId={parseInt(kidId)}
                      formId={selectedForm.formId}
                      formData={selectedForm}
                      onComplete={handleFormComplete}
                      onBack={handleBackToDashboard}
                      readOnly={formReadOnly} // 🔥 העברת מצב הצפייה/עריכה
                    />
                  )}

                  
                </Box>
              </Paper>
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
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default KidOnboarding;