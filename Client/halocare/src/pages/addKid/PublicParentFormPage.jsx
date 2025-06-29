import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, Paper, Typography, TextField, Button, 
  CircularProgress, Alert, Stepper, Step, StepLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Card
} from '@mui/material';
import {
  Security as SecurityIcon,
  Assignment as FormIcon,
  CheckCircle as SuccessIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { styled, alpha, createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import QuestionRenderer from '../kids/QuestionRenderer';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import MultipleEntriesComponent from './MultipleEntriesComponent';

// תמה מעוצבת RTL עם פלטת צבעים מדהימה
const rtlTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    h3: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    }
  },
  palette: {
    primary: {
      main: '#4cb5c3',
      light: '#6dd5ed',
      dark: '#2a8a95',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff7043',
      light: '#ff8a65',
      dark: '#f4511e',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    background: {
      default: 'linear-gradient(135deg, #4cb5c3 0%, #ff7043 50%, #10b981 100%)',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    }
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 8px 25px rgba(76, 181, 195, 0.2)',
              transform: 'translateY(-2px)',
            },
            '&.Mui-focused': {
              boxShadow: '0 12px 35px rgba(76, 181, 195, 0.3)',
              transform: 'translateY(-3px)',
            }
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 600,
          padding: '14px 28px',
          fontSize: '1.1rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
          }
        },
        contained: {
          background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
          boxShadow: '0 8px 25px rgba(76, 181, 195, 0.4)',
          '&:hover': {
            background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
            boxShadow: '0 15px 40px rgba(76, 181, 195, 0.5)',
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          boxShadow: '0 15px 50px rgba(0,0,0,0.15)',
          overflow: 'visible',
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '5px',
            background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981)',
            borderRadius: '25px 25px 0 0',
          }
        }
      }
    }
  }
});

// מסך מלא מותאם RTL עם רקע מדהים
const FullScreenContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
  backgroundSize: '400% 400%',
  animation: 'gradientShift 25s ease infinite',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 30%, rgba(76, 181, 195, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255, 112, 67, 0.3) 0%, transparent 50%), radial-gradient(circle at 50% 90%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  }
}));

// כרטיס ראשי מעוצב עם זכוכית
const MainCard = styled(Card)(({ theme }) => ({
  maxWidth: '800px',
  margin: '0 auto',
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(4),
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '10px',
    left: '10px',
    right: '10px',
    bottom: '10px',
    background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1), rgba(255, 112, 67, 0.1))',
    borderRadius: '20px',
    zIndex: -1,
  }
}));

// כותרת מעוצבת עם אפקטים
const StyledHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -theme.spacing(2),
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100px',
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043)',
    borderRadius: '2px',
  }
}));

// כפתור מונפש מדהים
const AnimatedButton = styled(Button)(({ theme, variant = 'contained', color = 'primary' }) => ({
  borderRadius: 16,
  padding: '14px 32px',
  fontWeight: 700,
  fontSize: '1.1rem',
  position: 'relative',
  overflow: 'hidden',
  minWidth: 180,
  ...(variant === 'contained' && {
    background: color === 'success' 
      ? 'linear-gradient(45deg, #10b981 30%, #059669 90%)'
      : 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
    boxShadow: `0 8px 25px ${alpha(theme.palette[color]?.main || '#4cb5c3', 0.4)}`,
  }),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 15px 40px ${alpha(theme.palette[color]?.main || '#4cb5c3', 0.5)}`,
    ...(variant === 'contained' && {
      background: color === 'success'
        ? 'linear-gradient(45deg, #059669 30%, #047857 90%)'
        : 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
    })
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    transition: 'all 0.6s ease',
  },
  '&:hover::after': {
    left: '100%',
  }
}));

// סטפר מעוצב
const StyledStepper = styled(Stepper)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiStepLabel-root': {
    flexDirection: 'column',
  },
  '& .MuiStepConnector-root': {
    top: 20,
    left: 'calc(-50% + 20px)',
    right: 'calc(50% + 20px)',
    '& .MuiStepConnector-line': {
      borderColor: alpha('#4cb5c3', 0.3),
      borderTopWidth: 3,
    }
  },
  '& .MuiStepConnector-active .MuiStepConnector-line': {
    borderColor: '#4cb5c3',
  },
  '& .MuiStepConnector-completed .MuiStepConnector-line': {
    borderColor: '#10b981',
  }
}));

// אייקון סטפ מעוצב
const StepIcon = styled(Box)(({ active, completed, theme }) => ({
  width: 50,
  height: 50,
  borderRadius: '50%',
  backgroundColor: completed ? '#10b981' : active ? '#4cb5c3' : '#e5e7eb',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '1.2rem',
  boxShadow: completed 
    ? '0 8px 20px rgba(16, 185, 129, 0.4)'
    : active 
    ? '0 8px 20px rgba(76, 181, 195, 0.4)'
    : '0 4px 10px rgba(0,0,0,0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `3px solid ${completed ? '#10b981' : active ? '#4cb5c3' : '#d1d5db'}`,
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: completed 
      ? '0 12px 30px rgba(16, 185, 129, 0.5)'
      : active 
      ? '0 12px 30px rgba(76, 181, 195, 0.5)'
      : '0 8px 20px rgba(0,0,0,0.15)',
  }
}));

// אלרט מעוצב
const StyledAlert = styled(Alert)(({ theme, severity }) => ({
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette[severity]?.main || '#4cb5c3', 0.3)}`,
  background: `linear-gradient(135deg, ${alpha(theme.palette[severity]?.light || '#4cb5c3', 0.1)} 0%, ${alpha(theme.palette[severity]?.main || '#4cb5c3', 0.05)} 100%)`,
  backdropFilter: 'blur(10px)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    background: theme.palette[severity]?.main || '#4cb5c3',
    borderRadius: '16px 0 0 16px',
  }
}));

// בר התקדמות מעוצב
const ProgressBar = styled(Box)(({ progress, theme }) => ({
  width: '100%',
  height: 12,
  backgroundColor: alpha('#4cb5c3', 0.2),
  borderRadius: 6,
  overflow: 'hidden',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: `${progress}%`,
    height: '100%',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043)',
    borderRadius: 6,
    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  }
}));

// כרטיס שאלה מעוצב
const QuestionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: 20,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  position: 'relative',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043)',
    borderRadius: '20px 20px 0 0',
  }
}));

const PublicParentFormPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  // States
  const [currentStep, setCurrentStep] = useState(0);
  const [kidIdNumber, setKidIdNumber] = useState('');
  const [formData, setFormData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitDialog, setSubmitDialog] = useState(false);
  const [multipleEntriesData, setMultipleEntriesData] = useState({});

  const steps = ['אימות זהות', 'מילוי הטופס', 'סיום'];

  // Function to handle complex data
  const handleMultipleEntriesChange = (questionNo, entriesData) => {
    setMultipleEntriesData(prev => ({
      ...prev,
      [questionNo]: entriesData
    }));
  };

  // Access Validation
  const handleValidation = async () => {
    if (!kidIdNumber.trim()) {
      setError('נא להזין תעודת זהות');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Token and ID validation
      const validateResponse = await axios.post('/ParentForm/validate', {
        token,
        kidIdNumber: kidIdNumber.trim()
      });

      if (validateResponse.data.success) {
        // Loading form data
        const formResponse = await axios.get(`/ParentForm/form/${token}`);
        
        if (formResponse.data) {
          setFormData(formResponse.data);
          
          // Loading existing answers
          const existingAnswers = {};
          formResponse.data.existingAnswers?.forEach(answer => {
            existingAnswers[answer.questionNo] = {
              answer: answer.answer || '',
              other: answer.other || ''
            };
          });
          setAnswers(existingAnswers);
          
          setCurrentStep(1);
        } else {
          setError('שגיאה בטעינת נתוני הטופס');
        }
      } else {
        setError('תעודת זהות שגויה או קישור לא תקין');
      }
    } catch (error) {
      console.error('שגיאה באימות:', error);
      setError('שגיאה באימות. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  // Answer update
  const handleAnswerChange = (questionNo, answer, other = '') => {
    setAnswers(prev => ({
      ...prev,
      [questionNo]: { answer, other }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Convert answers to the required format
      const formattedAnswers = Object.entries(answers).map(([questionNo, answerData]) => {
        const question = formData.questions.find(q => q.questionNo === parseInt(questionNo));
        
        let answerObject = {
          questionNo: parseInt(questionNo),
          answer: answerData.answer || '',
          other: answerData.other || ''
        };

        // Adding complex data if available
        if (question?.requiresMultipleEntries && answerData.answer === 'כן') {
          const entriesData = multipleEntriesData[questionNo];
          if (entriesData && entriesData.length > 0) {
            const validEntries = entriesData.filter(entry => 
              Object.values(entry).some(val => val && val.toString().trim())
            );
            if (validEntries.length > 0) {
              answerObject.multipleEntries = validEntries;
            }
          }
        }

        return answerObject;
      });

      const payload = {
        token: token,
        answers: formattedAnswers
      };

      const response = await axios.post('/ParentForm/submit', payload);
      
      if (response.data.success) {
        setCurrentStep(2);
      } else {
        setError(response.data.message || 'שגיאה בשמירת הטופס');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('שגיאה בשליחת הטופס. אנא נסה שוב.');
    } finally {
      setLoading(false);
      setSubmitDialog(false);
    }
  };
       
  const calculateProgress = () => {
    if (!formData?.questions?.length) return 0;
    
    const mandatoryQuestions = formData.questions.filter(q => q.isMandatory);
    const answeredMandatory = mandatoryQuestions.filter(q => {
      const answer = answers[q.questionNo];
      return answer && answer.answer && answer.answer.trim() !== '';
    });
    
    return mandatoryQuestions.length > 0 
      ? Math.round((answeredMandatory.length / mandatoryQuestions.length) * 100) 
      : 0;
  };

  const getAnswerValue = (questionNo) => {
    const answer = answers[questionNo];
    return {
      answer: answer?.answer || '',
      other: answer?.other || ''
    };
  };

  return (
    <ThemeProvider theme={rtlTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <FullScreenContainer>
          <Container dir="rtl" maxWidth="md" sx={{ py: 4, position: 'relative', zIndex: 2 }}>
            {/* כותרת */}
            <StyledHeader>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom 
                sx={{
                  background: 'linear-gradient(45deg, #4cb5c3, #ff7043)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                  mb: 2
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: '3rem', mr: 2, color: '#4cb5c3' }} />
                גן הילד
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'white',
                  fontWeight: 600,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                מילוי טופס הורים
              </Typography>
            </StyledHeader>

            {/* Stepper */}
            <MainCard>
              <StyledStepper activeStep={currentStep}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconComponent={({ active, completed }) => (
                        <StepIcon active={active} completed={completed}>
                          {completed ? <SuccessIcon /> : 
                           active && index === 0 ? <SecurityIcon /> :
                           active && index === 1 ? <FormIcon /> :
                           index + 1}
                        </StepIcon>
                      )}
                    >
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mt: 1, 
                          fontWeight: 600,
                          color: currentStep >= index ? 'primary.main' : 'text.secondary'
                        }}
                      >
                        {label}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </StyledStepper>

              {/* Errors */}
              {error && (
                <StyledAlert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                  {error}
                </StyledAlert>
              )}

              {/* Content by step */}
              <Box sx={{ mt: 4 }}>
                {currentStep === 0 && (
                  <Box sx={{ textAlign: 'center' }}>
                    <SecurityIcon sx={{ 
                      fontSize: 80, 
                      color: '#4cb5c3', 
                      mb: 3,
                      filter: 'drop-shadow(0 4px 8px rgba(76, 181, 195, 0.3))'
                    }} />
                    <Typography variant="h5" gutterBottom fontWeight="600">
                      אימות זהות
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                      לצורכי אבטחה, נא להזין את תעודת הזהות של הילד/ה
                    </Typography>
                    
                    <Box sx={{ maxWidth: 350, mx: 'auto' }}>
                      <TextField
                        fullWidth
                        label="תעודת זהות של הילד/ה"
                        value={kidIdNumber}
                        onChange={(e) => setKidIdNumber(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleValidation()}
                        disabled={loading}
                        sx={{ mb: 4 }}
                        inputProps={{ maxLength: 9 }}
                      />
                      
                      <AnimatedButton
                        fullWidth
                        variant="contained"
                        onClick={handleValidation}
                        disabled={loading || !kidIdNumber.trim()}
                        size="large"
                        startIcon={loading ? <CircularProgress size={24} color="inherit" /> : null}
                      >
                        {loading ? 'מאמת...' : 'המשך'}
                      </AnimatedButton>
                    </Box>
                  </Box>
                )}

                {currentStep === 1 && formData && (
                  <Box>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <Typography variant="h5" gutterBottom fontWeight="600">
                        {formData.form.formName}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        עבור: <strong>{formData.kid.firstName} {formData.kid.lastName}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                        {formData.form.formDescription}
                      </Typography>
                      
                      {/* Progress */}
                      <Box sx={{ mx: 'auto', maxWidth: 500 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <TrendingUpIcon sx={{ color: '#4cb5c3' }} />
                          <Typography variant="body1" fontWeight="600" color="primary.main" sx={{ flex: 1 }}>
                            התקדמות: {calculateProgress()}%
                          </Typography>
                          <AutoAwesomeIcon sx={{ color: '#ff7043' }} />
                        </Box>
                        <ProgressBar progress={calculateProgress()} />
                      </Box>
                    </Box>

                    {/* Form questions */}
                    <Box sx={{ mb: 4 }}>
                      {formData.questions.map((question) => {
                        const { answer, other } = getAnswerValue(question.questionNo);
                        
                        return (
                          <QuestionCard key={question.questionNo} elevation={0}>
                            <QuestionRenderer
                              question={question}
                              value={answer}
                              otherValue={other}
                              onChange={(value, otherValue) =>
                                handleAnswerChange(
                                  question.questionNo,
                                  value,
                                  otherValue
                                )
                              }
                              readOnly={false}
                            />

                            {/* Adding complex data component */}
                            {question.requiresMultipleEntries &&
                              answer === "כן" && (
                                <Box sx={{ 
                                  mt: 3, 
                                  p: 3,
                                  borderRadius: 3,
                                  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1), rgba(255, 112, 67, 0.1))',
                                  border: '1px solid rgba(76, 181, 195, 0.2)'
                                }}>
                                  <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: 'primary.main' }}>
                                    פרטי תשובות נוספות:
                                  </Typography>
                                  <MultipleEntriesComponent
                                    question={question}
                                    existingAnswer={{
                                      multipleEntries: JSON.stringify(
                                        multipleEntriesData[question.questionNo] || []
                                      ),
                                    }}
                                    onDataChange={(data) =>
                                      handleMultipleEntriesChange(
                                        question.questionNo,
                                        data
                                      )
                                    }
                                  />
                                </Box>
                              )}
                          </QuestionCard>
                        );
                      })}
                    </Box>

                    {/* Save button */}
                    <Box sx={{ textAlign: 'center' }}>
                      <AnimatedButton
                        variant="contained"
                        size="large"
                        onClick={() => setSubmitDialog(true)}
                        disabled={loading || calculateProgress() < 100}
                        color="success"
                        startIcon={<SendIcon />}
                      >
                        שלח טופס
                      </AnimatedButton>
                      
                      {calculateProgress() < 100 && (
                        <StyledAlert severity="warning" sx={{ mt: 3, textAlign: 'center' }}>
                          <Typography variant="body2" fontWeight="600">
                            יש למלא את כל השאלות החובה לפני השליחה
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            התקדמות נוכחית: {calculateProgress()}%
                          </Typography>
                        </StyledAlert>
                      )}
                    </Box>
                  </Box>
                )}

                {currentStep === 2 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10b981, #34d399)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px',
                      boxShadow: '0 20px 60px rgba(16, 185, 129, 0.4)',
                      animation: 'successPulse 2s ease-in-out infinite',
                      '@keyframes successPulse': {
                        '0%': { 
                          transform: 'scale(1)', 
                          boxShadow: '0 20px 60px rgba(16, 185, 129, 0.4)' 
                        },
                        '50%': { 
                          transform: 'scale(1.1)', 
                          boxShadow: '0 25px 80px rgba(16, 185, 129, 0.6)' 
                        },
                        '100%': { 
                          transform: 'scale(1)', 
                          boxShadow: '0 20px 60px rgba(16, 185, 129, 0.4)' 
                        },
                      }
                    }}>
                      <SuccessIcon sx={{ 
                        fontSize: 60, 
                        color: 'white',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                      }} />
                    </Box>
                    
                    <Typography variant="h4" gutterBottom sx={{
                      background: 'linear-gradient(45deg, #10b981, #34d399)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700,
                      mb: 3
                    }}>
                      הטופס נשלח בהצלחה!
                    </Typography>
                    
                    <Box sx={{
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.1))',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      mb: 3
                    }}>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                        תודה רבה על מילוי הטופס. הנתונים נשמרו בהצלחה במערכת המעון.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        צוות המעון יבדוק את המידע ויצור איתך קשר במידת הצורך.
                      </Typography>
                    </Box>
                    
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <AutoAwesomeIcon sx={{ color: '#10b981' }} />
                      <Typography variant="body2" color="text.secondary" fontWeight="600">
                        ניתן לסגור את הדף בבטחה
                      </Typography>
                      <AutoAwesomeIcon sx={{ color: '#10b981' }} />
                    </Box>
                  </Box>
                )}
              </Box>
            </MainCard>

            {/* Submission Confirmation Dialog */}
            <Dialog 
              open={submitDialog} 
              onClose={() => setSubmitDialog(false)}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  overflow: 'hidden'
                }
              }}
            >
              <DialogTitle sx={{ 
                background: 'linear-gradient(135deg, #4cb5c3, #ff7043)',
                color: 'white',
                fontWeight: 600,
                borderRadius: '0',
                textAlign: 'center',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60px',
                  height: '3px',
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '2px',
                }
              }}>
                <SendIcon sx={{ mr: 1 }} />
                אישור שליחת טופס
              </DialogTitle>
              
              <DialogContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    האם אתה בטוח שברצונך לשלוח את הטופס?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    לאחר השליחה לא ניתן יהיה לערוך את התשובות.
                    הטופס יועבר ישירות לצוות המעון לעיון ועיבוד.
                  </Typography>
                </Box>
                
                <StyledAlert severity="info" sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">
                    <strong>שים לב:</strong> וודא שכל הפרטים נכונים לפני השליחה
                  </Typography>
                </StyledAlert>
              </DialogContent>
              
              <DialogActions sx={{ 
                p: 3, 
                background: 'rgba(0,0,0,0.02)', 
                gap: 2,
                justifyContent: 'center'
              }}>
                <Button 
                  onClick={() => setSubmitDialog(false)}
                  variant="outlined"
                  sx={{ 
                    borderRadius: 3,
                    borderWidth: 2,
                    minWidth: 120,
                    '&:hover': {
                      borderWidth: 2,
                    }
                  }}
                >
                  ביטול
                </Button>
                <AnimatedButton 
                  onClick={handleSubmit} 
                  variant="contained"
                  color="success"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  sx={{ minWidth: 140 }}
                >
                  {loading ? 'שולח...' : 'שלח טופס'}
                </AnimatedButton>
              </DialogActions>
            </Dialog>
          </Container>
        </FullScreenContainer>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default PublicParentFormPage;