// תהליך קליטת ילד חדש - ProgressStepper
import { useState,useNavigate } from 'react';
import {PersonIcon  , DevelopmentIcon, HealthIcon, FoodIcon, ApprovalIcon, HomeVisitIcon} from '@mui/icons-material';
import { ArrowBack as ArrowBackIcon, CheckCircle as CheckCircleIcon, Send as SendIcon } from '@mui/icons-material';
import { Stepper, Step, StepLabel, StepContent, Box, Button, Typography, Paper, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonalInfoForm from './forms/PersonalInfoForm';
import DevelopmentalForm from './forms/DevelopmentalForm';
import HealthInfoForm from './forms/HealthInfoForm';
import NutritionForm from './forms/NutritionForm';
import ApprovalsForm from './forms/ApprovalsForm';
import HomeVisitForm from './forms/HomeVisitForm';
import Swal from 'sweetalert2';

// עיצוב מותאם אישית לסטפר
const CustomStepper = styled(Stepper)(({ theme }) => ({
  '& .MuiStepLabel-root .Mui-completed': {
    color: theme.palette.primary.main, // צבע לשלבים שהושלמו
  },
  '& .MuiStepLabel-root .Mui-active': {
    color: theme.palette.secondary.main, // צבע לשלב הפעיל
  },
  '& .MuiStepConnector-line': {
    borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

// אייקונים מותאמים לכל שלב
const stepIcons = {
  1: <PersonIcon />,
  2: <DevelopmentIcon />,
  3: <HealthIcon />,
  4: <FoodIcon />,
  5: <ApprovalIcon />,
  6: <HomeVisitIcon />,
};

// המרכיב הראשי
const KidRegistrationProcess = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    personalInfo: {},
    developmentalInfo: {},
    healthInfo: {},
    nutritionInfo: {},
    approvals: {},
    homeVisit: {}
  });
  
  // רשימת השלבים
  const steps = [
    {
      label: 'פרטים אישיים',
      description: 'הזנת פרטי הילד וההורים',
      component: <PersonalInfoForm 
                  data={formData.personalInfo} 
                  onUpdate={(data) => handleFormUpdate('personalInfo', data)} 
                />
    },
    {
      label: 'רקע התפתחותי',
      description: 'מידע על התפתחות הילד',
      component: <DevelopmentalForm 
                  data={formData.developmentalInfo} 
                  onUpdate={(data) => handleFormUpdate('developmentalInfo', data)} 
                />
    },
    {
      label: 'מידע רפואי',
      description: 'פרטים על מצב בריאותי ותרופות',
      component: <HealthInfoForm 
                  data={formData.healthInfo} 
                  onUpdate={(data) => handleFormUpdate('healthInfo', data)} 
                />
    },
    {
      label: 'שאלון תזונתי',
      description: 'מידע על הרגלי אכילה ותזונה',
      component: <NutritionForm 
                  data={formData.nutritionInfo} 
                  onUpdate={(data) => handleFormUpdate('nutritionInfo', data)} 
                />
    },
    {
      label: 'אישורים',
      description: 'אישורים נדרשים מההורים',
      component: <ApprovalsForm 
                  data={formData.approvals} 
                  onUpdate={(data) => handleFormUpdate('approvals', data)} 
                />
    },
    {
      label: 'ביקור בית',
      description: 'תיעוד ביקור בית',
      component: <HomeVisitForm 
                  data={formData.homeVisit} 
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
  };
  
  // מעבר לשלב הבא
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  // חזרה לשלב הקודם
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // הגשת התהליך המלא
  const handleSubmit = async () => {
    try {
      // שמירת כל הנתונים באמצעות API call
      // await api.submitKidRegistration(formData);
      // הצגת הודעת הצלחה
      Swal.fire({
        icon: 'success',
        title: 'הילד נקלט בהצלחה!',
        confirmButtonText: 'אישור'
      });
      // מעבר לדף סיכום
      navigate('/kid-summary');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'אירעה שגיאה בתהליך הקליטה',
        timer: 3000,
        
      });
      console.error(error);
    }
  };
  
  // שליחת טופס למילוי ע"י הורה
  const handleSendToParent = async (formType) => {
    try {
      // await api.sendFormToParent(formData.personalInfo.id, formType);
      Swal.fire({
        icon: 'success',
        title: `הטופס נשלח בהצלחה להורה`,
        confirmButtonText: 'אישור'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'אירעה שגיאה בשליחת הטופס',
        timer: 3000,
      });
      console.error(error);
    }
  };
  
  return (
    <Box sx={{ maxWidth: 900, margin: '0 auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          תהליך קליטת ילד חדש
        </Typography>
        
        <CustomStepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel StepIconComponent={() => stepIcons[index+1]}>
                <Typography variant="h6">{step.label}</Typography>
                <Typography variant="body2" color="text.secondary">{step.description}</Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  {step.component}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      variant="outlined"
                    >
                      חזרה
                    </Button>
                    <Box>
                      {/* כפתור שליחה להורה - מופיע רק בשלבים מסוימים */}
                      {[1, 2, 3, 4].includes(index) && (
                        <Button 
                          onClick={() => handleSendToParent(index + 1002)}
                          variant="contained" 
                          color="info" 
                          sx={{ mr: 1 }}
                          startIcon={<SendIcon />}
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
                        >
                          הבא
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              </StepContent>
            </Step>
          ))}
        </CustomStepper>
        
        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3, borderRadius: 2, backgroundColor: 'success.light' }}>
            <Typography variant="h6" gutterBottom>
              כל השלבים הושלמו בהצלחה!
            </Typography>
            <Typography paragraph>
              הילד נקלט במערכת. ניתן לצפות בפרטיו בדף תיק הילד.
            </Typography>
            <Button 
              onClick={() => navigate(`/kid-profile/${formData.personalInfo.id}`)} 
              variant="contained"
              startIcon={<PersonIcon />}
            >
              מעבר לתיק הילד
            </Button>
          </Paper>
        )}
      </Paper>
      
      {/* חלק עם סיכום התהליך הנוכחי */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          סטטוס התהליך
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
          {steps.map((step, index) => (
            <Chip
              key={index}
              label={step.label}
              color={
                index < activeStep ? 'success' :
                index === activeStep ? 'primary' : 'default'
              }
              icon={index < activeStep ? <CheckCircleIcon /> : null}
              variant={index === activeStep ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default KidRegistrationProcess;