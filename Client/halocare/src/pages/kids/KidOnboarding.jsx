// src/pages/kids/KidOnboarding.jsx - גרסה חדשה עם דשבורד
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Box, Paper, Typography, CircularProgress, Breadcrumbs,
  Button, Alert, AlertTitle, Fade, Dialog, DialogTitle, DialogContent,
  DialogActions
} from '@mui/material';
import {
  Home as HomeIcon,
  Group as GroupIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';

import { 
  fetchOnboardingStatus, 
  clearOnboardingData,
  completeForm,
  sendFormToParent,
  setSelectedForm
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
  
  const { 
    currentProcess, 
    selectedFormId, 
    status, 
    error 
  } = useSelector(state => state.onboarding);
  
  const { selectedKid } = useSelector(state => state.kids);
  
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [currentForm, setCurrentForm] = useState(null);
  const [loading, setLoading] = useState(true);

  const isNewKid = kidId === 'new';

  // טעינה ראשונית
  useEffect(() => {
    initializeOnboarding();
    
    // ניקוי בעת יציאה מהקומפוננטה
    return () => {
      dispatch(clearOnboardingData());
      dispatch(clearSelectedKid());
    };
  }, [kidId]);

  const initializeOnboarding = async () => {
    try {
      setLoading(true);
      
      if (!isNewKid) {
        // טעינת נתוני ילד קיים
        await dispatch(fetchKidById(kidId));
        
        // טעינת סטטוס התהליך
        try {
          await dispatch(fetchOnboardingStatus(kidId)).unwrap();
        } catch (error) {
          console.log('No onboarding process found, will be created when needed');
        }
      }
      
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      Swal.fire({
        icon: 'error',
        title: 'שגיאה',
        text: 'אירעה שגיאה בטעינת נתוני הקליטה',
      });
    } finally {
      setLoading(false);
    }
  };

  // קליטת ילד חדש הושלמה
  const handleKidCreated = async (newKid) => {
    navigate(`/kids/onboarding/${newKid.id}`, { replace: true });
    // רענון נתוני התהליך
    await dispatch(fetchOnboardingStatus(newKid.id));
  };

  // טיפול בפעולות טפסים
  const handleFormAction = async (action, formId) => {
    const form = currentProcess?.forms?.find(f => f.formId === formId);
    
    switch (action) {
      case 'start':
      case 'continue':
      case 'edit':
        setCurrentForm(form);
        dispatch(setSelectedForm(formId));
        setShowFormDialog(true);
        break;
        
      case 'view':
        setCurrentForm({ ...form, readOnly: true });
        dispatch(setSelectedForm(formId));
        setShowFormDialog(true);
        break;
        
      case 'sendToParent':
        await handleSendToParent(formId);
        break;
        
      default:
        console.log(`Action ${action} not implemented`);
    }
  };

  // שליחת טופס להורים
  const handleSendToParent = async (formId) => {
    const form = currentProcess?.forms?.find(f => f.formId === formId);
    
    const result = await Swal.fire({
      title: 'שליחת טופס להורים',
      text: `האם ברצונך לשלוח את הטופס "${form?.formName}" להורים למילוי?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'כן, שלח',
      cancelButtonText: 'ביטול',
      confirmButtonColor: '#2196f3'
    });

    if (result.isConfirmed) {
      try {
        await dispatch(sendFormToParent({ 
          kidId: kidId, 
          formId 
        })).unwrap();
        
        Swal.fire({
          icon: 'success',
          title: 'נשלח בהצלחה!',
          text: 'הטופס נשלח להורים למילוי',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'שגיאה',
          text: error.message || 'אירעה שגיאה בשליחת הטופס',
        });
      }
    }
  };

  // השלמת טופס
  const handleFormComplete = async (formId) => {
    try {
      await dispatch(completeForm({ 
        kidId: kidId, 
        formId 
      })).unwrap();
      
      setShowFormDialog(false);
      setCurrentForm(null);
      dispatch(setSelectedForm(null));
      
      // רענון נתוני התהליך
      await dispatch(fetchOnboardingStatus(kidId));
      
      Swal.fire({
        icon: 'success',
        title: 'מעולה!',
        text: 'הטופס הושלם בהצלחה',
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'שגיאה',
        text: error.message || 'אירעה שגיאה בשמירת הטופס',
      });
    }
  };

  // סגירת דיאלוג הטופס
  const handleCloseFormDialog = () => {
    setShowFormDialog(false);
    setCurrentForm(null);
    dispatch(setSelectedForm(null));
  };

  // לחיצה על טופס בלוגו
  const handleLogoFormClick = (formId) => {
    handleFormAction('continue', formId);
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
            {isNewKid ? 'קליטת ילד חדש' : `תהליך קליטה - ${selectedKid?.firstName} ${selectedKid?.lastName}`}
          </Typography>
        </Breadcrumbs>

        {/* שגיאות */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>שגיאה</AlertTitle>
            {error}
          </Alert>
        )}

        {/* תוכן ראשי */}
        {isNewKid ? (
          // טופס ליצירת ילד חדש
          <Fade in={true}>
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
              <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
                <Typography variant="h5" gutterBottom>
                  קליטת ילד חדש
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  מילוי פרטי הילד וההורים - השלב הראשון בתהליך הקליטה
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
          </Fade>
        ) : (
          // דשבורד תהליך קליטה קיים
          <>
            {/* הלוגו עם הפרוגרס */}
            {currentProcess && (
              <ProgressLogo 
                completionPercentage={currentProcess.completionPercentage || 0}
                kidName={`${selectedKid?.firstName} ${selectedKid?.lastName}`}
                forms={currentProcess.forms || []}
                onFormClick={handleLogoFormClick}
              />
            )}

            {/* דשבורד הטפסים */}
            {currentProcess ? (
              <Fade in={true}>
                <Box>
                  <OnboardingDashboard
                    onboardingProcess={currentProcess}
                    onFormAction={handleFormAction}
                    loading={status === 'loading'}
                  />
                </Box>
              </Fade>
            ) : (
              <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>אין תהליך קליטה פעיל</AlertTitle>
                לא נמצא תהליך קליטה עבור ילד זה. 
                <Button 
                  variant="outlined" 
                  size="small" 
                  sx={{ ml: 2 }}
                  onClick={() => navigate('/kids')}
                >
                  חזור לרשימת הילדים
                </Button>
              </Alert>
            )}
          </>
        )}

        {/* כפתור חזרה */}
        {!isNewKid && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate('/kids')}
            >
              חזור לרשימת הילדים
            </Button>
          </Box>
        )}

        {/* דיאלוג טופס דינמי */}
        <Dialog
          open={showFormDialog}
          onClose={handleCloseFormDialog}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, maxHeight: '90vh' }
          }}
        >
          {currentForm && (
            <>
              <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h5" fontWeight="bold">
                  {currentForm.formName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentForm.formDescription}
                </Typography>
              </DialogTitle>
              
              <DialogContent sx={{ px: 3, pb: 2 }}>
                <DynamicFormRenderer
                  form={currentForm}
                  kidId={kidId}
                  onFormComplete={handleFormComplete}
                  showSendToParentOption={true}
                  readOnly={currentForm.readOnly || false}
                />
              </DialogContent>
              
              <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={handleCloseFormDialog}>
                  סגור
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default KidOnboarding;