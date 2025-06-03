// src/pages/kids/KidOnboarding.jsx - עם טפסים דינמיים
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Box, Paper, Typography, CircularProgress, Breadcrumbs,
  Button
} from '@mui/material';
import {
  Home as HomeIcon,
  Group as GroupIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon
} from '@mui/icons-material';

import { 
  fetchOnboardingStatus, 
  fetchAvailableForms, 
  clearOnboardingData,
  completeFormStep
} from '../../Redux/features/onboardingSlice';
import { 
  fetchKidById, 
  clearSelectedKid
} from '../../Redux/features/kidsSlice';
import PersonalInfoForm from './PersonalInfoForm';
import DynamicFormRenderer from './DynamicFormRenderer';
import ProgressLogo from './ProgressLogo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const KidOnboarding = () => {
  const { kidId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { availableForms } = useSelector(state => state.onboarding);
  const { selectedKid } = useSelector(state => state.kids);
  
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentKidId, setCurrentKidId] = useState(kidId);

  const isNewKid = kidId === undefined;

  // איפוס כשמשנים kidId
  useEffect(() => {
    if (currentKidId !== kidId) {
      resetOnboarding();
      setCurrentKidId(kidId);
    }
  }, [kidId, currentKidId]);

  // טעינה ראשונית
  useEffect(() => {
    initializeOnboarding();
  }, [kidId]);

  const resetOnboarding = () => {
    setActiveStep(0);
    setSteps([]);
    setLoading(true);
    dispatch(clearOnboardingData());
    dispatch(clearSelectedKid());
  };

  const initializeOnboarding = async () => {
    try {
      setLoading(true);
      
      // טעינת רשימת הטפסים
      const formsResult = await dispatch(fetchAvailableForms()).unwrap();
      const sortedForms = [...formsResult].sort((a, b) => a.formOrder - b.formOrder);
      setSteps(sortedForms);
      
      if (!isNewKid) {
        // טעינת נתוני ילד קיים
        await dispatch(fetchKidById(kidId));
        
        // טעינת סטטוס התהליך
        try {
          const statusResult = await dispatch(fetchOnboardingStatus(kidId)).unwrap();
          
          // קביעת השלב הנוכחי
          const completedSteps = statusResult.forms.filter(f => f.status === 'completed').length;
          setActiveStep(completedSteps);
        } catch (error) {
          console.log('No onboarding process found, starting from step 0');
          setActiveStep(0);
        }
      } else {
        setActiveStep(0);
      }
      
    } catch (error) {
      console.error('Error initializing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  // קליטת ילד חדש הושלמה
  const handleKidCreated = (newKid) => {
    navigate(`/kids/onboarding/${newKid.id}`, { replace: true });
    setCurrentKidId(newKid.id.toString());
    setActiveStep(1);
  };

  // השלמת טופס דינמי
  const handleFormComplete = async (formId) => {
    try {
      // עדכון השרת שהטופס הושלם
      await dispatch(completeFormStep({ 
        kidId: currentKidId, 
        formId 
      })).unwrap();
      
      // מעבר לשלב הבא
      handleNext();
    } catch (error) {
      console.error('Error completing form step:', error);
    }
  };

  // מעבר לשלב הבא
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      // סיום התהליך
      navigate(`/kids/${currentKidId}`);
    }
  };

  // חזרה לשלב קודם
  const handleBack = () => {
    setActiveStep(prev => Math.max(0, prev - 1));
  };

  // רנדור תוכן השלב הנוכחי
  const renderStepContent = () => {
    if (steps.length === 0) return null;
    
    const currentStep = steps[activeStep];
    
    // השלב הראשון - פרטים אישיים (קבוע)
    if (currentStep?.isFirstStep || activeStep === 0) {
      return (
        <PersonalInfoForm
          data={isNewKid ? null : selectedKid}
          onUpdate={handleKidCreated}
          isEditMode={!isNewKid}
          key={kidId}
        />
      );
    }
    
    // שאר השלבים - טפסים דינמיים
    return (
      <DynamicFormRenderer
        form={currentStep}
        kidId={currentKidId}
        onFormComplete={handleFormComplete}
        showSendToParentOption={true}
        readOnly={false}
        key={`${currentKidId}_${currentStep.formId}`}
      />
    );
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
            {isNewKid ? 'קליטת ילד חדש' : `המשך קליטה - ${selectedKid?.firstName} ${selectedKid?.lastName}`}
          </Typography>
        </Breadcrumbs>

        {/* הלוגו עם הפרוגרס */}
        <ProgressLogo 
          activeStep={activeStep} 
          totalSteps={steps.length}
          kidName={!isNewKid ? `${selectedKid?.firstName} ${selectedKid?.lastName}` : null}
          steps={steps.map(step => step.formName)}
          key={`${kidId}-${activeStep}`}
        />

        {/* תוכן השלב הנוכחי */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
          {steps.length > 0 ? (
            <>
              <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
                <Typography variant="h5" gutterBottom>
                  {steps[activeStep]?.formName || 'פרטים אישיים'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {steps[activeStep]?.formDescription || 'מילוי פרטי הילד וההורים'}
                </Typography>
              </Box>
              
              <Box sx={{ p: 3 }}>
                {renderStepContent()}
              </Box>
            </>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography>לא נמצאו טפסים זמינים</Typography>
            </Box>
          )}
        </Paper>

        {/* כפתורי ניווט */}
        {activeStep > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={handleBack}
            >
              חזרה
            </Button>
            
            <Button
              variant="contained"
              endIcon={<NextIcon />}
              onClick={handleNext}
            >
              {activeStep === steps.length - 1 ? 'סיום' : 'הבא'}
            </Button>
          </Box>
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default KidOnboarding;