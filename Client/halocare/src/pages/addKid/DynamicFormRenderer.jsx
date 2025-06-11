// components/kids/DynamicFormRenderer.jsx 
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, LinearProgress,
  CircularProgress, Alert, Snackbar, Chip, Fade, Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon
} from '@mui/icons-material';

import { 
  fetchFormQuestions 
} from '../../Redux/features/formsSlice';
import { 
  fetchFormAnswers,
  setCurrentForm,
  clearCurrentFormAnswers, 
  selectCurrentFormAnswers,
  selectSaveStatus,
  selectSaveError
} from '../../Redux/features/answersSlice';
import axios from '../../components/common/axiosConfig'; 
import QuestionRenderer from '../kids/QuestionRenderer';

const DynamicFormRenderer = ({ 
  kidId, 
  formId, 
  formData,
  onComplete,
  onBack,
  readOnly = false 
}) => {
  const dispatch = useDispatch();
  
  // Redux state
  const currentFormAnswers = useSelector(selectCurrentFormAnswers);
  const saveStatus = useSelector(selectSaveStatus);
  const saveError = useSelector(selectSaveError);
  const { questions: currentFormQuestions, status: questionsStatus } = useSelector(state => state.forms);
  
  // 🔥 State מקומי לניהול תשובות (במקום שמירה אוטומטית)
  const [localAnswers, setLocalAnswers] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // טעינה ראשונית
  useEffect(() => {
    loadFormData();
  }, [kidId, formId]);

  // 🔥 טעינת תשובות קיימות ל-state מקומי
  useEffect(() => {
    if (currentFormAnswers.length > 0) {
      const answersMap = {};
      currentFormAnswers.forEach(answer => {
        answersMap[answer.questionNo] = {
          answer: answer.answer || '',
          other: answer.other || '',
          answerId: answer.answerId // 🔥 חשוב לעדכון במקום הוספה
        };
      });
      setLocalAnswers(answersMap);
    }
  }, [currentFormAnswers]);

  const loadFormData = async () => {
    try {
      // 🔥 ניקוי תשובות קודמות לפני טעינת טופס חדש
      dispatch(clearCurrentFormAnswers());
      
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

  // 🔥 עדכון תשובה מקומית ללא שמירה מיידית
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

  // 🔥 שמירת כל התשובות (רק כשלוחצים "שמור")
  const handleSaveAll = async () => {
    if (readOnly) return;

    try {
      // הכנת מערך תשובות לשמירה
      const answersToSave = currentFormQuestions.map(question => {
        const localAnswer = localAnswers[question.questionNo];
        
        return {
          // 🔥 אם יש answerId - זה עדכון, אם לא - זה הוספה חדשה
          answerId: localAnswer?.answerId || null,
          questionNo: question.questionNo,
          answer: localAnswer?.answer || '',
          other: localAnswer?.other || '',
          byParent: false
        };
      }).filter(answer => answer.answer && answer.answer.trim() !== ''); // רק תשובות שלא ריקות

      if (answersToSave.length === 0) {
        showNotification('אין תשובות לשמירה', 'warning');
        return;
      }

      // 🔥 שמירה עם לוגיקה חכמה של עדכון/הוספה
      await saveAnswersWithUpsert(answersToSave);

      showNotification('הטופס נשמר בהצלחה!', 'success');
      setHasChanges(false);
      
      // קריאה לפונקציה להשלמה
      if (onComplete) {
        setTimeout(() => onComplete(formId), 1000);
      }

    } catch (error) {
      console.error('שגיאה בשמירת הטופס:', error);
      showNotification('שגיאה בשמירת הטופס', 'error');
    }
  };

  // 🔥 פונקציה חדשה לשמירה חכמה (עדכון או הוספה)
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
        employeeId: userId
      };

      try {
        if (answerData.answerId) {
          // 🔥 עדכון תשובה קיימת
           await axios.put(`/Forms/answers/${answerData.answerId}`, fullAnswerData);

        } else {
          // 🔥 הוספת תשובה חדשה
          const response = await axios.post('/Forms/answers', fullAnswerData);

          const newAnswer =  response.data;
          // עדכון ה-answerId ב-state המקומי
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

    // 🔥 בדיקת השלמת טופס אחרי השמירה
    await checkFormCompletion();
  };

  // 🔥 בדיקת השלמה ידנית (במקום אוטומטית)
  const checkFormCompletion = async () => {
    try {
      await axios.post('/KidOnboarding/check-completion', {
        kidId,
        formId
      });

      // if (response.status) {
      //   // רענון נתוני הקליטה
      //   setTimeout(() => {
      //     // כאן תקרא לרענון נתוני הקליטה אם נדרש
      //   }, 500);
      // }
    } catch (error) {
      console.warn('שגיאה בבדיקת השלמה:', error);
    }
  };

  // חישוב התקדמות על בסיס התשובות המקומיות
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

  // קבלת ערך תשובה מ-state מקומי
  const getAnswerValue = (questionNo) => {
    const localAnswer = localAnswers[questionNo];
    return {
      answer: localAnswer?.answer || '',
      other: localAnswer?.other || ''
    };
  };

  // פונקציה לקיבוץ שאלות לפי קטגוריה
  const groupQuestionsByCategory = () => {
    const grouped = {};
    currentFormQuestions.forEach(question => {
      const category = question.category || 'כללי';
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

  if (questionsStatus === 'loading') {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          טוען שאלות הטופס...
        </Typography>
      </Box>
    );
  }

  if (!currentFormQuestions.length) {
    return (
      <Alert severity="info">
        <Typography variant="h6">אין שאלות בטופס זה</Typography>
        <Typography variant="body2">
          נראה שהטופס עדיין לא הוגדר או שאין בו שאלות.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      {/* 🔥 סרגל התקדמות */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: 'grey.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
          
          {/* 🔥 אינדיקטור שינויים */}
          {!readOnly && hasChanges && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon fontSize="small" color="warning" />
              <Typography variant="caption" color="warning.main">
                יש שינויים שלא נשמרו
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* שאלות הטופס */}
      {Object.entries(groupQuestionsByCategory()).map(([category, questions], categoryIndex) => (
        <Fade in={true} timeout={300 + (categoryIndex * 200)} key={category}>
          <Paper 
            sx={{ 
              mb: 4, 
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            {/* כותרת קטגוריה */}
            <Box 
              sx={{ 
                p: 2, 
                backgroundColor: 'primary.main', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                {category}
              </Typography>
              <Chip 
                label={`${questions.length} שאלות`}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
            
            {/* שאלות הקטגוריה */}
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {questions
                  .sort((a, b) => a.questionNo - b.questionNo)
                  .map((question, index) => {
                    const { answer, other } = getAnswerValue(question.questionNo);
                    
                    return (
                      <Grid item xs={12} key={question.questionNo}>
                        <QuestionRenderer
                          question={question}
                          value={answer}
                          otherValue={other}
                          onChange={(value, otherValue) => 
                            handleQuestionChange(question.questionNo, value, otherValue)
                          }
                          readOnly={readOnly}
                        />
                      </Grid>
                    );
                  })}
              </Grid>
            </Box>
          </Paper>
        </Fade>
      ))}

      {/* כפתורי פעולה */}
      <Divider sx={{ my: 4 }} />
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2
      }}>
        {onBack && (
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={onBack}
          >
            חזרה
          </Button>
        )}
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* 🔥 אפשרות עריכה גם אחרי השלמה */}
          {readOnly && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => window.location.reload()} // פתרון זמני - יעבור למצב עריכה
              color="primary"
            >
              עריכה
            </Button>
          )}
          
          {!readOnly && (
            <Button
              variant="contained"
              startIcon={saveStatus === 'loading' ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSaveAll}
              disabled={saveStatus === 'loading' || !hasChanges}
              size="large"
              sx={{ minWidth: 140 }}
            >
              {saveStatus === 'loading' ? 'שומר...' : 'שמור והמשך'}
            </Button>
          )}
        </Box>
      </Box>

      {/* שגיאות שמירה */}
      {saveError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {saveError}
        </Alert>
      )}

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
    </Box>
  );
};

export default DynamicFormRenderer;