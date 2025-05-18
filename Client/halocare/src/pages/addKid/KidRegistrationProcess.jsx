// components/kids/KidRegistrationProcess.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Paper, Button, Typography, Container, 
  Slide, Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  ChevronLeft as ArrowBackIcon,
  Check as CheckCircleIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { sendFormToParent } from '../../Redux/features/formsSlice';
import PersonalInfoForm from './PersonalInfoForm';
import DynamicFormRenderer from './DynamicFormRenderer';
import ProgressLogo from './ProgressLogo';
import { toast } from 'react-toastify';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// סטיילינג מותאם אישית
const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  paddingTop: theme.spacing(5), // תוספת מרווח למעלה לטובת הלוגו
  direction: 'rtl',
  marginTop: 0, // אין צורך במרווח למעלה כי הלוגו מתחבר לטופס
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  borderRadius: theme.spacing(2),
  maxWidth: '100%',
  margin: '0 auto',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  }
}));


const KidRegistrationProcess = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    personalInfo: {},
    developmentalInfo: {},
    healthInfo: {},
    nutritionInfo: {},
    approvals: {},
    homeVisit: {}
  });
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { status: sendStatus } = useSelector(state => state.forms);
  
  // רשימת השלבים
  const steps = [
    {
      label: 'פרטים אישיים',
      description: 'הזנת פרטי הילד וההורים',
      formId: null, // אין צורך בformId עבור PersonalInfoForm
      component: <PersonalInfoForm 
                  data={formData.personalInfo} 
                  onUpdate={(data) => handleFormUpdate('personalInfo', data)} 
                />
    },
    {
      label: 'רקע התפתחותי',
      description: 'מידע על התפתחות הילד',
      formId: 1003,
      component: props => <DynamicFormRenderer 
                  formId={1003}
                  kidId={formData.personalInfo.id}
                  onUpdate={(data) => handleFormUpdate('developmentalInfo', data)} 
                />
    },
    {
      label: 'מידע רפואי',
      description: 'פרטים על מצב בריאותי ותרופות',
      formId: 1004,
      component: props => <DynamicFormRenderer 
                  formId={1004}
                  kidId={formData.personalInfo.id}
                  onUpdate={(data) => handleFormUpdate('healthInfo', data)} 
                />
    },
    {
      label: 'שאלון תזונתי',
      description: 'מידע על הרגלי אכילה ותזונה',
      formId: 1005,
      component: props => <DynamicFormRenderer 
                  formId={1005}
                  kidId={formData.personalInfo.id}
                  onUpdate={(data) => handleFormUpdate('nutritionInfo', data)} 
                />
    },
    {
      label: 'אישורים',
      description: 'אישורים נדרשים מההורים',
      formId: 1006,
      component: props => <DynamicFormRenderer 
                  formId={1006}
                  kidId={formData.personalInfo.id}
                  onUpdate={(data) => handleFormUpdate('approvals', data)} 
                />
    },
    {
      label: 'ביקור בית',
      description: 'תיעוד ביקור בית',
      formId: 1007,
      component: props => <DynamicFormRenderer 
                  formId={1007}
                  kidId={formData.personalInfo.id}
                  onUpdate={(data) => handleFormUpdate('homeVisit', data)} 
                />
    }
  ];
  
  // עדכון נתוני הטפסים
  const handleFormUpdate = (formName, data) => {
    setFormData(prev => ({
      ...prev,
      [formName]: data
    }));
    
    // אם מדובר בפרטים אישיים (השלב הראשון) ויש ID - התקדם לשלב הבא
    if (formName === 'personalInfo' && data.id) {
      handleNext();
    }
  };
  
  // מעבר לשלב הבא
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  // חזרה לשלב הקודם
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // מעבר לשלב ספציפי
  const handleStepClick = (stepIndex) => {
    // בדיקה אם יש כבר ID לילד (אחרי השלב הראשון)
    if (stepIndex > 0 && !formData.personalInfo.id) {
      toast.warning('יש למלא קודם את פרטי הילד הבסיסיים');
      return;
    }
    
    // אפשר לעבור רק לשלבים שכבר הושלמו או לשלב הנוכחי +1
    if (stepIndex <= activeStep + 1) {
      setActiveStep(stepIndex);
    } else {
      toast.info('יש להשלים את השלבים בסדר הנכון');
    }
  };
  
  // הגשת התהליך המלא
  const handleSubmit = async () => {
    navigate(`/kid-profile/${formData.personalInfo.id}`);
    toast.success('הילד נקלט בהצלחה!');
  };
  
  // שליחת טופס למילוי ע"י הורה
  const handleSendToParent = async (formId) => {
    if (!formData.personalInfo.id) {
      toast.error('יש לשמור תחילה את פרטי הילד');
      return;
    }
    
    try {
      await dispatch(sendFormToParent({ 
        kidId: formData.personalInfo.id, 
        formId 
      })).unwrap();
      
      toast.success(`הטופס נשלח בהצלחה להורה`);
    } catch (error) {
      toast.error('אירעה שגיאה בשליחת הטופס');
      console.error(error);
    }
  };
  
  // שם הילד לתצוגה בלוגו (אם יש)
  const kidName = formData.personalInfo.firstName 
    ? `${formData.personalInfo.firstName} ${formData.personalInfo.lastName || ''}`
    : null;
  
  return (
     <LocalizationProvider dateAdapter={AdapterDateFns}>
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
      קליטת ילד חדש
    </Typography>
      
      {/* לוגו התקדמות */}
      <ProgressLogo 
      activeStep={activeStep} 
      totalSteps={steps.length}
      kidName={kidName}
      onStepClick={handleStepClick}
      steps={steps.map(step => step.label)}
    />
      
      {/* טופס נוכחי */}
     <Fade in={true} timeout={500}>
      <FormContainer>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.dark' }}>
          {steps[activeStep].label}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {steps[activeStep].description}
        </Typography>
        
        {steps[activeStep].component}
          {/* כפתורי פעולה */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              חזרה
            </Button>
            <Box>
              {/* כפתור שליחה להורה - מופיע רק בשלבים מסוימים */}
              {[1, 2, 3, 4].includes(activeStep) && formData.personalInfo.id && (
                <Button 
                  onClick={() => handleSendToParent(steps[activeStep].formId)}
                  variant="contained" 
                  color="info" 
                  sx={{ mr: 1 }}
                  startIcon={<SendIcon />}
                  disabled={sendStatus === 'loading'}
                >
                  שלח להורה
                </Button>
              )}
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSubmit}
                  startIcon={<CheckCircleIcon />}
                >
                  סיים תהליך
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowBackIcon />}
                  // disabled={activeStep === 0 && !formData.personalInfo.id}
                >
                  הבא
                </Button>
              )}
            </Box>
          </Box>
        </FormContainer>
      </Fade>
      
      {/* הודעת סיום */}
      {activeStep === steps.length && (
        <Slide direction="up" in={true} mountOnEnter unmountOnExit>
          <Paper sx={{ p: 3, borderRadius: 2, backgroundColor: 'success.light', maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              כל השלבים הושלמו בהצלחה!
            </Typography>
            <Typography paragraph>
              הילד נקלט במערכת. ניתן לצפות בפרטיו בדף תיק הילד.
            </Typography>
            <Button 
              onClick={() => navigate(`/kid-profile/${formData.personalInfo.id}`)} 
              variant="contained"
              startIcon={<CheckCircleIcon />}
            >
              מעבר לתיק הילד
            </Button>
          </Paper>
        </Slide>
      )}
    </Container>
    </LocalizationProvider>
  );
};

export default KidRegistrationProcess;