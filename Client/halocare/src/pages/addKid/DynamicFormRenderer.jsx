// components/kids/DynamicFormRenderer.jsx 
import  { useState, useEffect } from 'react';
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
import { styled } from '@mui/material/styles';

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


// 🎨 עיצוב כמו טופס נייר אמיתי
const FormPaper = styled(Paper)(({ theme }) => ({
  maxWidth: '900px',
  margin: '0 auto',
  dir: 'rtl',
  padding: theme.spacing(6, 8),
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid #e0e0e0',
  borderRadius: 0, // בלי פינות עגולות כמו נייר אמיתי
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: theme.spacing(4),
    top: 0,
    bottom: 0,
    width: '2px',
    backgroundColor: '#ff4444',
    opacity: 0.3
  }
}));

// 🎨 כותרת טופס רשמית
const FormHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
}));


// 🎨 אזור שאלות
const QuestionsSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  '& > *:not(:last-child)': {
    marginBottom: theme.spacing(2)
  },
  dir: 'rtl'
}));

// 🎨 כותרת קטגוריה
const CategoryHeader = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.primary.main}`,
  textAlign: 'left',
  dir: 'rtl'
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
  
  // State מקומי
  const [localAnswers, setLocalAnswers] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [multipleEntriesData, setMultipleEntriesData] = useState({});


  // טעינה ראשונית
  useEffect(() => {
     if (kidId && formId) {
      // ניקוי מלא של הנתונים הקיימים
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

  // 🆕 3. פונקציה חדשה לטיפול במידע מורכב
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

      // 🆕 רק הוסף את זה:
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
      // איפוס סטטוס השמירה
      // dispatch(saveAnswerWithMultipleEntries({}));
      setLocalAnswers({});
    }
  };

  const saveAnswersWithUpsert = async (answersToSave) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.id;

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
console.log('Saving answer:', fullAnswerData);
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

  // חישוב התקדמות
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

  // קיבוץ שאלות לפי קטגוריה
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

  // מסך טעינה
  if (questionsStatus === 'loading') {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          טוען את השאלות...
        </Typography>
      </Container>
    );
  }

  // אין שאלות
  if (!currentFormQuestions.length) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ textAlign: 'center' }}>
          <Typography variant="h6">אין שאלות בטופס זה</Typography>
          <Typography>נראה שהטופס עדיין לא הוגדר או שאין בו שאלות פעילות.</Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <FormPaper elevation={3}>
        {/* כותרת הטופס */}
        <FormHeader>
         
          
          <Typography variant="h5" fontWeight="600" sx={{ mt: 0.5 }}>
            {formData?.formName || 'טופס מילוי פרטים'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 ,mt:2}}>
          <Typography variant="body2" fontWeight="medium">
            התקדמות הטופס:
          </Typography>
          <Box sx={{ flexGrow: 1, mx: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <Typography variant="body2" color="primary" fontWeight="bold">
            {progress}%
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {Object.keys(localAnswers).filter(qNo => localAnswers[qNo]?.answer).length} מתוך {currentFormQuestions.length} שאלות נענו
          </Typography>
          
         
        </Box>

        
       {hasChanges && !readOnly && (
          <Alert 
            severity="warning" 
            sx={{mt:1, mb: 3, bgcolor: 'warning.light', color: 'warning.dark' }}
          >
            <Typography fontWeight="600">
              יש שינויים שלא נשמרו - אל תשכח לשמור!
            </Typography>
          </Alert>
        )}
        </FormHeader>

      
       

        {/* שאלות הטופס */}
        <QuestionsSection>
          {Object.entries(groupedQuestions).map(([category, questions], categoryIndex) => (
            <Box key={category} dir="rtl" >
              {/* כותרת קטגוריה אם יש יותר מקטגוריה אחת */}
              {Object.keys(groupedQuestions).length > 1 && (
                <CategoryHeader >
                  {category}
                </CategoryHeader>
              )}
              
              {/* שאלות הקטגוריה */}
              {questions
                .sort((a, b) => a.questionNo - b.questionNo)
                .map((question, index) => {
                  const { answer, other } = getAnswerValue(question.questionNo);
                  // מספור רצוף בכל הטופס
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

      
        {/* כפתורי פעולה */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 4,
          pt: 3,
          borderTop: `2px solid ${theme.palette.divider}`
        }}>
          {onBack && (
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={onBack}
              size="large"
            >
              חזרה
            </Button>
          )}
          
          <Stack direction="row" spacing={2}>
      
            {!readOnly && (
              <Button
                variant="contained"
                startIcon={saveStatus === 'loading' ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveAll}
                disabled={saveStatus === 'loading' || !hasChanges}
                size="large"
                sx={{ minWidth: 160 }}
              >
                {saveStatus === 'loading' ? 'שומר...' : 'שמור הטופס'}
              </Button>
            )}
          </Stack>
        </Box>

        {/* שגיאות שמירה */}
        {saveError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {saveError}
          </Alert>
        )}
      </FormPaper>

      {/* התראות */}
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
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DynamicFormRenderer;