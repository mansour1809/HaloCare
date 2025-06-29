// src/pages/kids/KidOnboarding.jsx
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

  // Data Refresh
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

  // Create a new kid
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

  // Open form for filling/viewing 
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

  // Form completion
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

  // Switch from view mode to edit mode
  const switchToEditMode = () => {
    setFormReadOnly(false);
    setSelectedForm(prev => ({ ...prev, buttonText: 'עריכה' }));
    showNotification('עברת למצב עריכה', 'info');
  };

  // Send to parents
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
      <Container dir="rtl" maxWidth="lg" sx={{ py: 4 }}>
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

        {/* Errors */}
        {onboardingError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>שגיאה</AlertTitle>
            {onboardingError}
          </Alert>
        )}

        {/* LOgo with progress */}
        {!isNewKid && currentOnboarding && (
          <ProgressLogo 
            onboardingData={currentOnboarding}
            kidName={selectedKid ? `${selectedKid.firstName} ${selectedKid.lastName}` : null}
            showFormsSummary={viewMode === 'dashboard'}
            compact={viewMode !== 'dashboard'}
          />
        )}

        {/* Dynamic content based on state */}
        <Fade in={true} timeout={500}>
          <Box>
            {/* Personal information form for a new child */}
            {isNewKid && (
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
            {viewMode === 'personalInfo' && selectedForm && !isNewKid && (
              <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                <Box sx={{ p: 3, backgroundColor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {selectedForm.formName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedForm.formDescription}
                    </Typography>
                    
                    {/* Status Indicator */}
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
                      חזרה לדשבורד
                    </Button>
                  </Box>
                </Box>
                
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
              </Paper>
            )}

            {/* Onboarding Process Dashboard */}
            {viewMode === 'dashboard' && currentOnboarding && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" fontWeight="bold">
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

            {/* Filling/Viewing Dynamic Form */}
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
                    
                    {/* Status Indicator */}
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
                    {formReadOnly && !selectedForm.formName.includes('אישור') && (
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
                  <DynamicFormRenderer
                    kidId={parseInt(kidId)}
                    formId={selectedForm.formId}
                    formData={selectedForm}
                    onComplete={handleFormComplete}
                    onBack={handleBackToDashboard}
                    readOnly={formReadOnly}
                  />
                </Box>
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
    </LocalizationProvider>
  );
};

export default KidOnboarding;
