// components/kids/DynamicFormRenderer.jsx - עיצוב משופר
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Button, LinearProgress,
  CircularProgress, Alert, Snackbar, Container,
  Stack, useTheme
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

import { 
  fetchFormQuestions 
} from '../../Redux/features/formsSlice';
import { 
  fetchFormAnswers,
  setCurrentForm,
  clearCurrentFormAnswers, 
  selectCurrentFormAnswers,
  selectSaveStatus,
  selectSaveError,
} from '../../Redux/features/answersSlice';
import axios from '../../components/common/axiosConfig'; 
import QuestionRenderer from '../kids/QuestionRenderer';
import MultipleEntriesComponent from './MultipleEntriesComponent';
import { useAuth } from '../../components/login/AuthContext';

// מסך מלא מותאם RTL עם רקע מדהים
const FullScreenContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
  backgroundSize: '400% 400%',
  animation: 'gradientShift 20s ease infinite',
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
    background: 'radial-gradient(circle at 30% 40%, rgba(76, 181, 195, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255, 112, 67, 0.2) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  }
}));

// טופס מעוצב עם עיצוב זכוכית
const FormPaper = styled(Paper)(({ theme }) => ({
  maxWidth: '900px',
  margin: '0 auto',
  dir: 'rtl',
  padding: theme.spacing(6, 8),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: 25,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  position: 'relative',
  zIndex: 2,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    borderRadius: '25px 25px 0 0',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    left: theme.spacing(4),
    top: 0,
    bottom: 0,
    width: '3px',
    background: 'linear-gradient(180deg, #4cb5c3, transparent)',
    opacity: 0.4,
    borderRadius: '2px'
  }
}));

// כותרת הטופס עם אפקטים
const FormHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  position: 'relative',
  paddingBottom: theme.spacing(3),
  marginBottom: theme.spacing(4),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80px',
    height: '3px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043)',
    borderRadius: '2px',
  }
}));

// אזור השאלות עם אפקטים
const QuestionsSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  '& > *:not(:last-child)': {
    marginBottom: theme.spacing(3)
  },
  dir: 'rtl',
  position: 'relative',
}));

// כותרת קטגוריה מעוצבת
const CategoryHeader = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  textAlign: 'left',
  dir: 'rtl',
  position: 'relative',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 100%)`,
  padding: theme.spacing(2),
  borderRadius: '12px 12px 0 0',
  '&::before': {
    content: '""',
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '4px',
    height: '60%',
    background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    borderRadius: '2px',
  }
}));

// כפתור מונפש מדהים
const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: '14px 28px',
  fontWeight: 600,
  fontSize: '1.1rem',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  boxShadow: '0 8px 24px rgba(76, 181, 195, 0.4)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 16px 40px rgba(76, 181, 195, 0.5)',
    background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
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

// אלרט מעוצב
const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.2)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
  backdropFilter: 'blur(10px)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    background: theme.palette.warning.main,
    borderRadius: '16px 0 0 16px',
  }
}));

const DynamicFormRenderer = ({ 
  kidId, 
  formId, 
  formData,
  onComplete,
  onBack,
  readOnly = false 
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Redux state
  const currentFormAnswers = useSelector(selectCurrentFormAnswers);
  const saveStatus = useSelector(selectSaveStatus);
  const saveError = useSelector(selectSaveError);
  const { questions: currentFormQuestions, status: questionsStatus } = useSelector(state => state.forms);
  
  // Local State
  const [localAnswers, setLocalAnswers] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [multipleEntriesData, setMultipleEntriesData] = useState({});

  const {currentUser} = useAuth();

  useEffect(() => {
     if (kidId && formId) {
      dispatch(clearCurrentFormAnswers());
      setLocalAnswers({});
      setMultipleEntriesData({});
      setHasChanges(false);
      
    loadFormData();

    }
  }, [kidId, formId, dispatch]);

   useEffect(() => {
    return () => {
      console.log('Cleaning up form data'); 
      dispatch(clearCurrentFormAnswers());
    };
  }, [dispatch]);

  useEffect(() => {
    if (currentFormAnswers.length > 0) {
      const answersMap = {};
      currentFormAnswers.forEach(answer => {
        answersMap[answer.questionNo] = {
          answer: answer.answer || '',
          other: answer.other || '',
          answerId: answer.answerId
        };
      });
      setLocalAnswers(answersMap);

      const multipleEntriesMap = {};
    currentFormAnswers.forEach(answer => {
      if (answer.multipleEntries) {
        try {
          multipleEntriesMap[answer.questionNo] = JSON.parse(answer.multipleEntries);
        } catch (e) {
          console.error('Error parsing multiple entries:', e);
        }
      }
    });
    setMultipleEntriesData(multipleEntriesMap);
  
    }
  }, [currentFormAnswers]);

  const loadFormData = async () => {
    try {
      dispatch(setCurrentForm({ kidId, formId }));
      
      await Promise.all([
        dispatch(fetchFormQuestions(formId)),
        dispatch(fetchFormAnswers({ kidId, formId }))
      ]);
    } catch (error) {
      console.error('שגיאה בטעינת נתוני הטופס:', error);
      showNotification('שגיאה בטעינת הטופס', 'error');
    }
  };

  // New function to handle complex data
const handleMultipleEntriesChange = (questionNo, entriesData) => {
  setMultipleEntriesData(prev => ({
    ...prev,
    [questionNo]: entriesData
  }));
  setHasChanges(true);
};

  const handleQuestionChange = (questionNo, answer, otherValue = '') => {
    setLocalAnswers(prev => ({
      ...prev,
      [questionNo]: {
        ...prev[questionNo],
        answer,
        other: otherValue
      }
    }));
    
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    if (readOnly) return;

    try {
      const answersToSave = currentFormQuestions.map(question => {
        const localAnswer = localAnswers[question.questionNo];
        
          let answerData = {
        answerId: localAnswer?.answerId || null,
        questionNo: question.questionNo,
        answer: localAnswer?.answer || '',
        other: localAnswer?.other || '',
        byParent: false
      };

      if (question.requiresMultipleEntries && localAnswer?.answer === 'כן') {
        const entriesData = multipleEntriesData[question.questionNo];
        if (entriesData && entriesData.length > 0) {
          const validEntries = entriesData.filter(entry => 
            Object.values(entry).some(val => val && val.toString().trim())
          );
          if (validEntries.length > 0) {
            answerData.multipleEntries = validEntries;
          }
        }
      }

      return answerData;
      }).filter(answer => answer.answer && answer.answer.trim() !== '');

      if (answersToSave.length === 0) {
        showNotification('אין תשובות לשמירה', 'warning');
        return;
      }

      await saveAnswersWithUpsert(answersToSave);

      showNotification('הטופס נשמר בהצלחה!', 'success');
      setHasChanges(false);
      
      if (onComplete) {
        setTimeout(() => onComplete(formId), 1000);
      }

    } catch (error) {
      console.error('שגיאה בשמירת הטופס:', error);
      showNotification('שגיאה בשמירת הטופס', 'error');
    }
    finally {
      setLocalAnswers({});
    }
  };

  const saveAnswersWithUpsert = async (answersToSave) => {
    const userId = currentUser?.id;

    for (const answerData of answersToSave) {
      
      const fullAnswerData = {
        answerId: answerData.answerId || 0, 
        kidId,
        formId,
        questionNo: answerData.questionNo,
        answer: answerData.answer,
        other: answerData.other,
        ansDate: new Date().toISOString(),
        byParent: false,
        employeeId: userId,
 multipleEntries: answerData.multipleEntries ? 
          JSON.stringify(answerData.multipleEntries) : null
      };
      try {
        if (answerData.answerId) {
          await axios.put(`/Forms/answers/${answerData.answerId}`, fullAnswerData);
        } else {
          const response = await axios.post('/Forms/answers', fullAnswerData);
          const newAnswer = response.data;
          
          setLocalAnswers(prev => ({
            ...prev,
            [answerData.questionNo]: {
              ...prev[answerData.questionNo],
              answerId: newAnswer.answerId
            }
          }));
        }
      } catch (error) {
        console.error('שגיאה בשמירת תשובה:', error);
        throw error;
      }
    }

    await checkFormCompletion();
  };

  const checkFormCompletion = async () => {
    try {
      await axios.post('/KidOnboarding/check-completion', {
        kidId,
        formId
      });
    } catch (error) {
      console.warn('שגיאה בבדיקת השלמה:', error);
    }
  };

  // Progress Calculation
  const calculateProgress = () => {
    if (!currentFormQuestions.length) return 0;
    
    const mandatoryQuestions = currentFormQuestions.filter(q => q.isMandatory);
    const answeredMandatory = mandatoryQuestions.filter(q => {
      const localAnswer = localAnswers[q.questionNo];
      return localAnswer && localAnswer.answer && localAnswer.answer.trim() !== '';
    });
    
    return mandatoryQuestions.length > 0 
      ? Math.round((answeredMandatory.length / mandatoryQuestions.length) * 100) 
      : 0;
  };

  const getAnswerValue = (questionNo) => {
    const localAnswer = localAnswers[questionNo];
    return {
      answer: localAnswer?.answer || '',
      other: localAnswer?.other || ''
    };
  };

  // Grouping questions by category
  const groupQuestionsByCategory = () => {
    const grouped = {};
    currentFormQuestions.forEach(question => {
      const category = question.category || 'שאלות כלליות';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(question);
    });
    return grouped;
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const progress = calculateProgress();
  const groupedQuestions = groupQuestionsByCategory();
  const totalQuestions = currentFormQuestions.length;
  const answeredQuestions = Object.keys(localAnswers).filter(qNo => 
    localAnswers[qNo]?.answer && localAnswers[qNo].answer.trim() !== ''
  ).length;

  // Loading screen
  if (questionsStatus === 'loading') {
    return (
      <FullScreenContainer>
        <Container maxWidth="md" sx={{ py: 4, textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <CircularProgress size={80} sx={{ color: 'white', mb: 3 }} />
          <Typography variant="h6" sx={{ mt: 2, color: 'white', fontWeight: 600 }}>
            טוען את השאלות...
          </Typography>
        </Container>
      </FullScreenContainer>
    );
  }

  if (!currentFormQuestions.length) {
    return (
      <FullScreenContainer>
        <Container maxWidth="md" sx={{ py: 4, position: 'relative', zIndex: 2 }}>
          <Alert 
            severity="info" 
            sx={{ 
              textAlign: 'center',
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <Typography variant="h6">אין שאלות בטופס זה</Typography>
            <Typography>נראה שהטופס עדיין לא הוגדר או שאין בו שאלות פעילות.</Typography>
          </Alert>
        </Container>
      </FullScreenContainer>
    );
  }

  return (
    <FullScreenContainer>
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 2 }}>
        <FormPaper elevation={24}>
          {/* Form Title */}
          <FormHeader>
            <Typography variant="h4" fontWeight="700" sx={{ 
              mt: 0.5,
              background: 'linear-gradient(45deg, #4cb5c3, #ff7043)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3
            }}>
              {formData?.formName || 'טופס מילוי פרטים'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, mt: 2 }}>
              <Typography variant="body1" fontWeight="600" color="primary.main">
                התקדמות הטופס:
              </Typography>
              <Box sx={{ flexGrow: 1, mx: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ 
                    height: 12, 
                    borderRadius: 6,
                    background: alpha('#4cb5c3', 0.2),
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #4cb5c3, #ff7043)',
                      borderRadius: 6,
                    }
                  }}
                />
              </Box>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {progress}%
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {Object.keys(localAnswers).filter(qNo => localAnswers[qNo]?.answer).length} מתוך {currentFormQuestions.length} שאלות נענו
              </Typography>
            </Box>

            {hasChanges && !readOnly && (
              <StyledAlert 
                severity="warning" 
                sx={{ mt: 2, position: 'relative' }}
              >
                <Typography fontWeight="600">
                  יש שינויים שלא נשמרו - אל תשכח לשמור!
                </Typography>
              </StyledAlert>
            )}
          </FormHeader>

          {/* Form Questions */}
          <QuestionsSection>
            {Object.entries(groupedQuestions).map(([category, questions], categoryIndex) => (
              <Box key={category} dir="rtl">
                {/* Category title if there is more than one category */}
                {Object.keys(groupedQuestions).length > 1 && (
                  <CategoryHeader>
                    {category}
                  </CategoryHeader>
                )}
                
                {/* Category Questions */}
                {questions
                  .sort((a, b) => a.questionNo - b.questionNo)
                  .map((question, index) => {
                    const { answer, other } = getAnswerValue(question.questionNo);
                    const questionIndex = [...currentFormQuestions]
                      .sort((a, b) => a.questionNo - b.questionNo)
                      .findIndex(q => q.questionNo === question.questionNo) + 1;
                    
                    return (
                      <Box key={question.questionNo}>
                        <QuestionRenderer
                          key={question.questionNo}
                          question={question}
                          value={answer}
                          otherValue={other}
                          onChange={(value, otherValue) =>
                            handleQuestionChange(
                              question.questionNo,
                              value,
                              otherValue
                            )
                          }
                          readOnly={readOnly}
                          questionIndex={questionIndex}
                        />

                        {question.requiresMultipleEntries &&
                          localAnswers[question.questionNo]?.answer === "כן" && (
                            <Box sx={{ mt: 2, mr: 4 }}>
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
                      </Box>
                    );
                  })}
              </Box>
            ))}
          </QuestionsSection>

          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 5,
            pt: 4,
            borderTop: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -1.5,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '3px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              borderRadius: '2px',
            }
          }}>
            {onBack && (
              <Button
                variant="outlined"
                startIcon={<BackIcon />}
                onClick={onBack}
                size="large"
                sx={{
                  borderRadius: 3,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                חזרה
              </Button>
            )}
            
            <Stack direction="row" spacing={3}>
              {!readOnly && (
                <AnimatedButton
                  variant="contained"
                  startIcon={saveStatus === 'loading' ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                  onClick={handleSaveAll}
                  disabled={saveStatus === 'loading' || !hasChanges}
                  size="large"
                  sx={{ minWidth: 180, fontSize: '1.1rem' }}
                >
                  {saveStatus === 'loading' ? 'שומר...' : 'שמור הטופס'}
                </AnimatedButton>
              )}
            </Stack>
          </Box>

          {/* Save Errors */}
          {saveError && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              }}
            >
              {saveError}
            </Alert>
          )}
        </FormPaper>

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
            sx={{ borderRadius: 3 }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </FullScreenContainer>
  );
};

export default DynamicFormRenderer;