// src/pages/kids/OnboardingProcess.jsx - הקומפוננטה המרכזית
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Box, Paper, Typography, CircularProgress, Breadcrumbs,
  Alert, AlertTitle, Fade, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Stack, IconButton, Tooltip
} from '@mui/material';
import {
  Home as HomeIcon,
  Group as GroupIcon,
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import { 
  fetchOnboardingStatus, 
  startOnboardingProcess,
  clearOnboardingData,
  setCurrentKid
} from '../../Redux/features/onboardingSlice';
import { 
  fetchKidById, 
  clearSelectedKid
} from '../../Redux/features/kidsSlice';

// קומפוננטות משנה
import PersonalInfoForm from './PersonalInfoForm';
import OnboardingDashboard from './OnboardingDashboard';
import DynamicFormRenderer from './DynamicFormRenderer';

const ProcessContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
}));

const OnboardingProcess = () => {
  const { kidId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { 
    processInfo, 
    forms, 
    stats, 
    status, 
    error 
  } = useSelector(state => state.onboarding);
  const { selectedKid } = useSelector(state => state.kids);
  
  // Local state
  const [currentView, setCurrentView] = useState('loading'); // loading, personal-info, dashboard, form
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [showStartDialog, setShowStartDialog] = useState(false);

  const isNewKid = kidId === 'new';

  // טעינה ראשונית
  useEffect(() => {
    initializeProcess();
    
    return () => {
      // ניקוי בעזיבת העמוד
      dispatch(clearOnboardingData());
      dispatch(clearSelectedKid());
    };
  }, [kidId]);

  const initializeProcess = async () => {
    try {
      dispatch(clearOnboardingData());
      dispatch(clearSelectedKid());

      if (isNewKid) {
        // ילד חדש - הצגת טופס פרטים אישיים
        setCurrentView('personal-info');
        return;
      }

      // ילד קיים - טעינת נתונים
      dispatch(setCurrentKid(parseInt(kidId)));
      
      // טעינת פרטי הילד
      await dispatch(fetchKidById(kidId)).unwrap();
      
      // ניסיון טעינת תהליך קליטה
      try {
        await dispatch(fetchOnboardingStatus(kidId)).unwrap();
        setCurrentView('dashboard');
      } catch (error) {
        // אין תהליך קליטה - הצגת אפשרות התחלה
        setShowStartDialog(true);
        setCurrentView('no-process');
      }
      
    } catch (error) {
      console.error('Error initializing process:', error);
      setCurrentView('error');
    }
  };

  // יצירת ילד חדש הושלמה
  const handleKidCreated = async (newKid) => {
    try {
      // ניווט לעמוד של הילד החדש
      navigate(`/kids/onboarding/${newKid.id}`, { replace: true });
      
      // הילד נוצר עם תהליך קליטה אוטומטי
      // נטען את הסטטוס
      await dispatch(fetchOnboardingStatus(newKid.id)).unwrap();
      setCurrentView('dashboard');
      
    } catch (error) {
      console.error('Error after kid creation:', error);
    }
  };

  // התחלת תהליך קליטה ידנית
  const handleStartProcess = async () => {
    try {
      await dispatch(startOnboardingProcess(parseInt(kidId))).unwrap();
      await dispatch(fetchOnboardingStatus(kidId)).unwrap();
      setShowStartDialog(false);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error starting process:', error);
    }
  };

  // מעבר לטופס ספציפי
  const handleFormSelect = (formId) => {
    setSelectedFormId(formId);
    setCurrentView('form');
  };

  // חזרה לדשבורד
  const handleBackToDashboard = () => {
    setSelectedFormId(null);
    setCurrentView('dashboard');
    // רענון נתונים
    dispatch(fetchOnboardingStatus(kidId));
  };

  // רענון נתונים
  const handleRefresh = () => {
    if (kidId && kidId !== 'new') {
      dispatch(fetchOnboardingStatus(kidId));
    }
  };

  // רנדור לפי מצב נוכחי
  const renderCurrentView = () => {
    switch (currentView) {
      case 'loading':
        return (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Stack alignItems="center" spacing={2}>
              <CircularProgress size={60} />
              <Typography variant="h6" color="text.secondary">
                טוען נתונים...
              </Typography>
            </Stack>
          </Box>
        );

      case 'personal-info':
        return (
          <PersonalInfoForm 
            onKidCreated={handleKidCreated}
            onCancel={() => navigate('/kids')}
          />
        );

      case 'dashboard':
        return (
          <OnboardingDashboard
            processInfo={processInfo}
            forms={forms}
            stats={stats}
            kidInfo={selectedKid}
            onFormSelect={handleFormSelect}
            onRefresh={handleRefresh}
          />
        );

      case 'form':
        return (
          <DynamicFormRenderer
            kidId={parseInt(kidId)}
            formId={selectedFormId}
            onBack={handleBackToDashboard}
            onComplete={handleBackToDashboard}
          />
        );

      case 'no-process':
        return (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
              <Typography variant="h5" gutterBottom>
                תהליך קליטה לא נמצא
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                עבור ילד זה לא נמצא תהליך קליטה פעיל.
                האם ברצונך להתחיל תהליך קליטה חדש?
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/kids')}
                >
                  חזור לרשימה
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setShowStartDialog(true)}
                >
                  התחל תהליך קליטה
                </Button>
              </Stack>
            </Paper>
          </Box>
        );

      case 'error':
        return (
          <Alert severity="error" sx={{ mt: 3 }}>
            <AlertTitle>שגיאה בטעינת הנתונים</AlertTitle>
            {error || 'אירעה שגיאה לא צפויה. אנא נסה שוב.'}
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" onClick={initializeProcess}>
                נסה שוב
              </Button>
            </Box>
          </Alert>
        );

      default:
        return null;
    }
  };

  return (
    <ProcessContainer maxWidth="lg">
      {/* כותרת ונתיב ניווט */}
      {currentView !== 'loading' && (
        <Fade in timeout={500}>
          <Box sx={{ mb: 3 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 2 }}>
              <Typography 
                color="inherit" 
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => navigate('/')}
              >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                בית
              </Typography>
              <Typography 
                color="inherit" 
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => navigate('/kids')}
              >
                <GroupIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                ילדים
              </Typography>
              <Typography color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                {isNewKid ? 'ילד חדש' : 'תהליך קליטה'}
              </Typography>
            </Breadcrumbs>

            {/* כותרת עם פעולות */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {isNewKid ? 'הוספת ילד חדש' : 
                   selectedKid ? `קליטת ${selectedKid.firstName} ${selectedKid.lastName}` : 
                   'תהליך קליטה'}
                </Typography>
                {selectedKid && (
                  <Typography variant="subtitle1" color="text.secondary">
                    {selectedKid.hName || 'לא צוין שם עברי'}
                  </Typography>
                )}
              </Box>

              <Stack direction="row" spacing={2}>
                {!isNewKid && currentView !== 'personal-info' && (
                  <Tooltip title="רענן נתונים">
                    <IconButton
                      onClick={handleRefresh}
                      disabled={status === 'loading'}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                )}
                
                <Tooltip title="חזור לרשימת ילדים">
                  <IconButton onClick={() => navigate('/kids')}>
                    <BackIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        </Fade>
      )}

      {/* תוכן מרכזי */}
      <Fade in timeout={800}>
        <Box>
          {renderCurrentView()}
        </Box>
      </Fade>

      {/* דיאלוג התחלת תהליך */}
      <Dialog open={showStartDialog} onClose={() => setShowStartDialog(false)}>
        <DialogTitle>התחלת תהליך קליטה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך להתחיל תהליך קליטה חדש עבור {selectedKid?.firstName} {selectedKid?.lastName}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            פעולה זו תיצור תהליך קליטה חדש עם כל הטפסים הנדרשים.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStartDialog(false)}>
            ביטול
          </Button>
          <Button 
            onClick={handleStartProcess} 
            variant="contained"
            disabled={status === 'loading'}
          >
            התחל תהליך
          </Button>
        </DialogActions>
      </Dialog>

      {/* הודעת שגיאה כללית */}
      {error && currentView !== 'error' && (
        <Alert 
          severity="error" 
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24, 
            maxWidth: 400,
            zIndex: 1000
          }}
          onClose={() => dispatch(clearError())}
        >
          {error}
        </Alert>
      )}
    </ProcessContainer>
  );
};

export default OnboardingProcess;