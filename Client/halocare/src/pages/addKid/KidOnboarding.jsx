// components/kids/KidOnboarding.jsx - עדכון מלא
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Box, Typography, CircularProgress, Alert, AlertTitle,
  Breadcrumbs, Button, Fade, Paper
} from '@mui/material';
import {
  Home as HomeIcon,
  Group as GroupIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

import { 
  fetchOnboardingStatus, 
  startOnboardingProcess,
  clearOnboardingData,
  clearError
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
  
  const { currentProcess, status, error, formActions } = useSelector(state => state.onboarding);
  const { selectedKid, status: kidStatus } = useSelector(state => state.kids);
  
  const [viewMode, setViewMode] = useState('loading'); // 'loading' | 'personal_info' | 'dashboard' | 'form' | 'no_process'
  const [selectedForm, setSelectedForm] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isNewKid = kidId === undefined || kidId === 'new';

  // טעינה ראשונית
  useEffect(() => {
    initializeOnboarding();
    
    // ניקוי בעת יציאה
    return () => {
      dispatch(clearOnboardingData());
      dispatch(clearError());
    };
  }, [kidId, dispatch]);

  // האזנה לשינויים בסטטוס
  useEffect(() => {
    if (status === 'succeeded' && currentProcess) {
      setViewMode('dashboard');
    } else if (status === 'failed' && !isNewKid) {
      setViewMode('no_process');
    }
    setInitializing(false);
  }, [status, currentProcess, isNewKid]);

  const initializeOnboarding = async () => {
    try {
      setInitializing(true);
      dispatch(clearOnboardingData());
      dispatch(clearSelectedKid());
      
      if (!isNewKid) {
        // טעינת נתוני ילד קיים
        await dispatch(fetchKidById(kidId)).unwrap();
        
        // ניסיון לטעון תהליך קליטה
        try {
          await dispatch(fetchOnboardingStatus(kidId)).unwrap();
        } catch (error) {
          console.log('No onboarding process found:', error);
          // אין תהליך קליטה - יוצג מצב מתאים
        }
      } else {
        // ילד חדש - הצגת טופס פרטים אישיים
        setViewMode('personal_info');
        setInitializing(false);
      }
      
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      setInitializing(false);
    }
  };

  // רענון נתונים
  const handleRefresh = async () => {
    if (isNewKid) return;
    
    setRefreshing(true);
    try {
      await dispatch(fetchOnboardingStatus(kidId)).unwrap();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // יצירת ילד חדש הושלמה
  const handleKidCreated = async (newKid) => {
    try {
      // מעבר לתהליך קליטה של הילד החדש
      navigate(`/kids/onboarding/${newKid.id}`, { replace: true });
      
      // תהליך הקליטה כבר התחיל אוטומטית בשרת
      // נטען את הסטטוס
      await new Promise(resolve => setTimeout(resolve, 500)); // המתנה קטנה לשרת
      await dispatch(fetchOnboardingStatus(newKid.id)).unwrap();
      
      setViewMode('dashboard');
    } catch (error) {
      console.error('Error after kid creation:', error);
      // אם נכשל לטעון את התהליך, ננסה ליצור אותו ידנית
      try {
        await dispatch(startOnboardingProcess(newKid.id)).unwrap();
        await dispatch(fetchOnboardingStatus(newKid.id)).unwrap();
        setViewMode('dashboard');
      } catch (startError) {
        console.error('Failed to start onboarding process:', startError);
      }
    }
  };

  // בחירת טופס לעריכה
  const handleFormSelect = (form) => {
    setSelectedForm(form);
    setViewMode('form');
  };

  // השלמת טופס
  const handleFormComplete = async () => {
    setViewMode('dashboard');
    setSelectedForm(null);
    await handleRefresh();
  };

  // חזרה ל-Dashboard
  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedForm(null);
  };

  // התחלת תהליך קליטה ידני
  const handleStartOnboardingProcess = async () => {
    try {
      await dispatch(startOnboardingProcess(kidId)).unwrap();
      await dispatch(fetchOnboardingStatus(kidId)).unwrap();
      setViewMode('dashboard');
    } catch (error) {
      console.error('Error starting onboarding process:', error);
    }
  };

  // טעינה ראשונית
  if (initializing || viewMode === 'loading') {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {isNewKid ? 'מכין טופס קליטה...' : 'טוען תהליך קליטה...'}
        </Typography>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
            onClick={() => navigate('/kids')}
          >
            <GroupIcon sx={{ mr: 0.5 }} />
            ניהול ילדים
          </Box>
          <Typography color="text.primary">
            {isNewKid ? 'קליטת ילד חדש' : `קליטה - ${selectedKid?.firstName} ${selectedKid?.lastName}`}
          </Typography>
        </Breadcrumbs>

        {/* שגיאות כלליות */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
            <AlertTitle>שגיאה</AlertTitle>
            {typeof error === 'string' ? error : error.message || 'שגיאה לא ידועה'}
          </Alert>
        )}

        {/* הלוגו עם הפרוגרס - רק לילדים עם תהליך קליטה */}
        {!isNewKid && currentProcess && viewMode !== 'no_process' && (
          <ProgressLogo 
            onboardingData={currentProcess}
            kidName={selectedKid ? `${selectedKid.firstName} ${selectedKid.lastName}` : null}
            showFormsSummary={viewMode === 'dashboard'}
            compact={viewMode !== 'dashboard'}
          />
        )}

        {/* תוכן דינמי לפי מצב */}
        <Fade in={true} timeout={500}>
          <Box>
            {/* טופס פרטים אישיים לילד חדש */}
            {viewMode === 'personal_info' && (
              <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                <Box sx={{ p: 3, backgroundColor: 'primary.main', color: 'white' }}>
                  <Typography variant="h5" gutterBottom>
                    פרטים אישיים
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
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

            {/* Dashboard תהליך קליטה */}
            {viewMode === 'dashboard' && currentProcess && (
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
                  kidId={kidId}
                  onboardingData={currentProcess}
                  onFormSelect={handleFormSelect}
                  loading={status === 'loading'}
                />
              </>
            )}

            {/* מילוי טופס */}
            {viewMode === 'form' && selectedForm && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBackToDashboard}
                    sx={{ mr: 2 }}
                  >
                    חזרה לסקירה
                  </Button>
                  <Typography variant="h5">
                    {selectedForm.formName}
                  </Typography>
                </Box>

                <DynamicFormRenderer
                  kidId={kidId}
                  form={selectedForm}
                  onComplete={handleFormComplete}
                  onCancel={handleBackToDashboard}
                />
              </>
            )}

            {/* אין תהליך קליטה */}
            {viewMode === 'no_process' && !isNewKid && (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                <AssignmentIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  לא נמצא תהליך קליטה
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  לילד זה עדיין אין תהליך קליטה פעיל במערכת.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleStartOnboardingProcess}
                  disabled={status === 'loading'}
                  startIcon={status === 'loading' ? <CircularProgress size={20} /> : <AssignmentIcon />}
                >
                  {status === 'loading' ? 'יוצר תהליך...' : 'התחל תהליך קליטה'}
                </Button>
              </Paper>
            )}
          </Box>
        </Fade>
      </Container>
    </LocalizationProvider>
  );
};

export default KidOnboarding;