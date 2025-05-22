// components/kids/KidRegistrationProcess.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Paper, Button, Typography, Container, 
  Slide, Fade, Stepper, Step, StepLabel, StepContent,
  Breadcrumbs, CircularProgress, Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  ChevronLeft as ArrowBackIcon,
  Check as CheckCircleIcon,
  Send as SendIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import GroupIcon from '@mui/icons-material/Group';
import { sendFormToParent } from '../../Redux/features/formsSlice';
import { fetchKidById } from '../../Redux/features/kidsSlice';
import PersonalInfoForm from './PersonalInfoForm';
import DynamicFormRenderer from './DynamicFormRenderer';
import ProgressLogo from './ProgressLogo';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
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

const StepButton = styled(Button)(({ theme, completed }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  backgroundColor: completed ? theme.palette.success.light : 'transparent',
  color: completed ? theme.palette.success.contrastText : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: completed ? theme.palette.success.main : theme.palette.action.hover,
  },
  transition: 'all 0.3s ease',
}));

const SuccessMessage = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.success.light,
  borderRadius: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  '& .MuiSvgIcon-root': {
    color: theme.palette.success.main,
    marginLeft: theme.spacing(1)
  }
}));

const KidRegistrationProcess = () => {
  const { kidId } = useParams(); // אם יש מזהה בנתיב, זה מצב עריכה
  const isEditMode = Boolean(kidId);
  
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});
  const [formData, setFormData] = useState({
    personalInfo: {},
    developmentalInfo: {},
    healthInfo: {},
    nutritionInfo: {},
    approvals: {},
    homeVisit: {}
  });
  const [isFormSaved, setIsFormSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { status: sendStatus } = useSelector(state => state.forms);
  const { selectedKid, status: kidStatus } = useSelector(state => state.kids);
  
  // טעינת נתוני ילד קיים במצב עריכה
  useEffect(() => {
    if (isEditMode && kidId) {
      setIsLoading(true);
      dispatch(fetchKidById(kidId))
        .unwrap()
        .then(kidData => {
          setFormData(prev => ({
            ...prev,
            personalInfo: kidData
          }));
          setIsFormSaved(true);
          setCompletedSteps(prev => ({...prev, 0: true}));
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            title: 'שגיאה בטעינת נתוני הילד',
            text: 'לא ניתן לטעון את נתוני הילד. אנא נסה שנית מאוחר יותר.'
          });
          console.error('Error loading kid data:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [dispatch, kidId, isEditMode]);
  
  // רשימת השלבים
  const steps = [
    {
      label: 'פרטים אישיים',
      description: 'הזנת פרטי הילד וההורים',
      formId: null, // אין צורך בformId עבור PersonalInfoForm
      component: <PersonalInfoForm 
                  data={formData.personalInfo} 
                  onUpdate={handlePersonalInfoUpdate} 
                  isEditMode={isEditMode}
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

  // פונקציה מיוחדת לטיפול בעדכון נתוני הילד בשלב הראשון
  function handlePersonalInfoUpdate(kidData) {
    // עדכון נתוני הילד בסטייט
    setFormData(prev => ({
      ...prev,
      personalInfo: kidData
    }));
    
    // סימון שהשלב הראשון הושלם
    setCompletedSteps(prev => ({...prev, 0: true}));
    setIsFormSaved(true);
    
    // הצג הודעת הצלחה
    Swal.fire({
      icon: 'success',
      title: 'פרטי הילד נשמרו בהצלחה',
      text: `פרטי הילד ${kidData.firstName} ${kidData.lastName} נשמרו במערכת`,
      timer: 2000,
      showConfirmButton: false
    });
    
    // מעבר לשלב הבא
    handleNext();
  }
  
  // עדכון נתוני הטפסים האחרים
  const handleFormUpdate = (formName, data) => {
    setFormData(prev => ({
      ...prev,
      [formName]: data
    }));
    
    // סימון השלב הנוכחי כהושלם
    setCompletedSteps(prev => ({...prev, activeStep: true}));
  };
  
  // מעבר לשלב הבא
  const handleNext = () => {
    setActiveStep((prevActiveStep) => {
      const nextStep = prevActiveStep + 1;
      // אם הגענו לסוף התהליך, נציג הודעת סיום
      if (nextStep === steps.length) {
        Swal.fire({
          icon: 'success',
          title: 'תהליך קליטת הילד הושלם בהצלחה!',
          text: 'כל השלבים הושלמו. כעת ניתן לצפות בפרופיל הילד המלא.',
          confirmButtonText: 'מעבר לפרופיל הילד',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate(`/kid-profile/${formData.personalInfo.id}`);
          }
        });
      }
      return nextStep;
    });
  };
  
  // חזרה לשלב הקודם
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // מעבר לשלב ספציפי
  const handleStepClick = (stepIndex) => {
    // בדיקה אם יש כבר ID לילד (אחרי השלב הראשון)
    if (stepIndex > 0 && !isFormSaved) {
      Swal.fire({
        icon: 'warning',
        title: 'לא ניתן להמשיך',
        text: 'יש למלא ולשמור קודם את פרטי הילד הבסיסיים',
      });
      return;
    }
    
    // אפשר לעבור רק לשלבים שכבר הושלמו או לשלב הנוכחי +1
    if (stepIndex <= activeStep + 1 || completedSteps[stepIndex - 1]) {
      setActiveStep(stepIndex);
    } else {
      toast.info('יש להשלים את השלבים בסדר הנכון');
    }
  };
  
  // שליחת טופס למילוי ע"י הורה
  const handleSendToParent = async (formId) => {
    if (!formData.personalInfo.id) {
      Swal.fire({
        icon: 'error',
        title: 'לא ניתן לשלוח טופס',
        text: 'יש לשמור תחילה את פרטי הילד',
      });
      return;
    }
    
    try {
      Swal.fire({
        title: 'שולח טופס...',
        text: 'אנא המתן בזמן שליחת הטופס להורה',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      await dispatch(sendFormToParent({ 
        kidId: formData.personalInfo.id, 
        formId 
      })).unwrap();
      
      Swal.fire({
        icon: 'success',
        title: 'הטופס נשלח בהצלחה',
        text: `הטופס נשלח בהצלחה להורה של ${formData.personalInfo.firstName}`,
        timer: 2000,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'שגיאה בשליחת הטופס',
        text: error.message || 'אירעה שגיאה בלתי צפויה, אנא נסה שנית',
      });
      console.error(error);
    }
  };
  
  // סיום התהליך ומעבר לפרופיל הילד
  const handleFinish = () => {
    Swal.fire({
      icon: 'success',
      title: 'תהליך קליטת הילד הושלם בהצלחה!',
      text: 'כל השלבים הושלמו. כעת ניתן לצפות בפרופיל הילד המלא.',
      confirmButtonText: 'מעבר לפרופיל הילד',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/kid-profile/${formData.personalInfo.id}`);
      }
    });
  };
  
  // שם הילד לתצוגה בלוגו (אם יש)
  const kidName = formData.personalInfo.firstName 
    ? `${formData.personalInfo.firstName} ${formData.personalInfo.lastName || ''}`
    : null;
  
  // אם הקומפוננטה במצב טעינה
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          טוען נתוני ילד...
        </Typography>
      </Container>
    );
  }
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4}}>
        <Box sx={{ display: 'flex', direction: 'rtl'}}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            color="inherit"
            onClick={() => navigate('/')}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 'small' }} />
            ראשי
          </Link>
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            color="inherit"
            onClick={() => navigate('/kids/list')}
          >
            <GroupIcon sx={{ mr: 0.5, fontSize: 'medium' }} />
            רשימת ילדים
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 'medium' }}>
            {isEditMode ? `עריכת פרטי ${kidName || 'ילד'}` : 'קליטת ילד חדש'}
          </Typography>
        </Breadcrumbs>
        </Box>
        {/* הודעת הצלחה אם הילד נשמר */}
        {isFormSaved && (
          <Fade in={true}>
            <SuccessMessage>
              <CheckCircleIcon />
              <Typography>
                {isEditMode 
                  ? 'פרטי הילד עודכנו במערכת. ניתן להמשיך בתהליך.'
                  : 'הילד נוצר בהצלחה! כעת ניתן להמשיך למילוי שאר הטפסים.'}
              </Typography>
            </SuccessMessage>
          </Fade>
        )}
        
        {/* לוגו התקדמות */}
        <ProgressLogo 
          activeStep={activeStep} 
          totalSteps={steps.length}
          kidName={kidName}
          onStepClick={handleStepClick}
          steps={steps.map(step => step.label)}
          completedSteps={completedSteps}
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
                startIcon={<ArrowForwardIcon />}
              >
                חזרה
              </Button>
              <Box>
                {/* כפתור שליחה להורה - מופיע רק בשלבים מסוימים */}
                {[1, 2, 3, 4].includes(activeStep) && isFormSaved && (
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
                    onClick={handleFinish}
                    startIcon={<CheckCircleIcon />}
                  >
                    סיים תהליך
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowBackIcon />}
                    disabled={activeStep === 0 && !isFormSaved}
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