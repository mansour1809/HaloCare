// components/kids/DynamicFormRenderer.jsx - עדכון מלא
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, Grid, TextField, FormControl,
  FormLabel, RadioGroup, FormControlLabel, Radio, Checkbox,
  FormGroup, Button, Alert, AlertTitle, LinearProgress,
  Divider, Chip, Tooltip, IconButton, Snackbar
} from '@mui/material';
import {
  Save as SaveIcon,
  CheckCircle as CompleteIcon,
  ArrowBack as BackIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircleOutline
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import {
  fetchQuestionsByFormId,
  clearQuestions
} from '../../Redux/features/questionsSlice';
import {
  fetchFormAnswers,
  saveAnswer,
  updateAnswer,
  setCurrentForm,
  updateLocalAnswer
} from '../../Redux/features/answersSlice';
import {
  updateFormProgress,
  completeForm
} from '../../Redux/features/onboardingSlice';

// Styled Components
const FormContainer = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  marginBottom: theme.spacing(3)
}));

const FormHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  padding: theme.spacing(3),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255,255,255,0.1)',
    transform: 'skewY(-2deg)',
    transformOrigin: 'top left',
  }
}));

const QuestionCard = styled(Paper)(({ theme, isMandatory, isAnswered }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  border: `2px solid ${
    isAnswered ? theme.palette.success.light : 
    isMandatory ? theme.palette.warning.light : 
    theme.palette.grey[200]
  }`,
  backgroundColor: isAnswered ? theme.palette.success.light + '08' : 'white',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  }
}));

const ProgressSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(3)
}));

const DynamicFormRenderer = ({ kidId, form, onComplete, onCancel }) => {
  const dispatch = useDispatch();
  const { currentFormQuestions, status: questionsStatus } = useSelector(state => state.questions);
  const { currentFormAnswers, savingAnswer } = useSelector(state => state.answers);
  const { formActions } = useSelector(state => state.onboarding);

  const [localAnswers, setLocalAnswers] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // טעינה ראשונית
  useEffect(() => {
    if (form?.formId && kidId) {
      loadFormData();
    }
    
    return () => {
      dispatch(clearQuestions());
    };
  }, [form?.formId, kidId]);

  // עדכון תשובות מקומיות כשנטענות תשובות מהשרת
  useEffect(() => {
    const answersMap = {};
    currentFormAnswers.forEach(answer => {
      answersMap[answer.questionNo] = {
        answer: answer.answer || '',
        other: answer.other || '',
        answerId: answer.answerId
      };
    });
    setLocalAnswers(answersMap);
  }, [currentFormAnswers]);

  const loadFormData = async () => {
    try {
      // טעינת שאלות הטופס
      await dispatch(fetchQuestionsByFormId(form.formId)).unwrap();
      
      // הגדרת הטופס הנוכחי
      dispatch(setCurrentForm({ kidId, formId: form.formId }));
      
      // טעינת תשובות קיימות
      await dispatch(fetchFormAnswers({ kidId, formId: form.formId })).unwrap();
      
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  // טיפול בשינוי תשובה
  const handleAnswerChange = (questionNo, value, otherValue = '') => {
    const newAnswers = {
      ...localAnswers,
      [questionNo]: {
        ...localAnswers[questionNo],
        answer: value,
        other: otherValue
      }
    };
    setLocalAnswers(newAnswers);

    // עדכון Redux מקומי
    dispatch(updateLocalAnswer({
      questionNo,
      answer: value,
      other: otherValue
    }));

    // ניקוי שגיאות תקינות
    if (validationErrors[questionNo]) {
      const newErrors = { ...validationErrors };
      delete newErrors[questionNo];
      setValidationErrors(newErrors);
    }

    // שמירה אוטומטית (דיליי קצר)
    clearTimeout(window.autoSaveTimeout);
    window.autoSaveTimeout = setTimeout(() => {
      handleAutoSave(questionNo, value, otherValue);
    }, 1000);
  };

  // שמירה אוטומטית
  const handleAutoSave = async (questionNo, answer, other = '') => {
    if (!answer.trim()) return; // לא שומרים תשובות ריקות

    try {
      setAutoSaveStatus('saving');
      
      const existingAnswer = localAnswers[questionNo];
      const answerData = {
        kidId: parseInt(kidId),
        formId: form.formId,
        questionNo: parseInt(questionNo),
        answer: answer.trim(),
        other: other.trim(),
        ansDate: new Date().toISOString(),
        byParent: false
      };

      if (existingAnswer?.answerId) {
        // עדכון תשובה קיימת
        await dispatch(updateAnswer({
          answerId: existingAnswer.answerId,
          answerData
        })).unwrap();
      } else {
        // יצירת תשובה חדשה
        const savedAnswer = await dispatch(saveAnswer(answerData)).unwrap();
        
        // עדכון התשובה המקומית עם ה-ID החדש
        setLocalAnswers(prev => ({
          ...prev,
          [questionNo]: {
            ...prev[questionNo],
            answerId: savedAnswer.answerId
          }
        }));
      }

      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);

    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    }
  };

  // תקינות טופס
  const validateForm = () => {
    const errors = {};
    const mandatoryQuestions = currentFormQuestions.filter(q => q.isMandatory);

    mandatoryQuestions.forEach(question => {
      const answer = localAnswers[question.questionNo];
      if (!answer?.answer?.trim()) {
        errors[question.questionNo] = 'שאלה חובה - נדרשת תשובה';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // השלמת טופס
  const handleCompleteForm = async () => {
    if (!validateForm()) {
      setSnackbarMessage('יש להשלים את כל השאלות החובה');
      setShowSnackbar(true);
      return;
    }

    try {
      // שמירת כל התשובות שטרם נשמרו
      const unsavedAnswers = currentFormQuestions.filter(q => {
        const answer = localAnswers[q.questionNo];
        return answer?.answer?.trim() && !answer.answerId;
      });

      for (const question of unsavedAnswers) {
        const answer = localAnswers[question.questionNo];
        await handleAutoSave(question.questionNo, answer.answer, answer.other);
      }

      // השלמת הטופס
      await dispatch(completeForm({ kidId, formId: form.formId })).unwrap();

      setSnackbarMessage('הטופס הושלם בהצלחה!');
      setShowSnackbar(true);

      // חזרה לדשבורד אחרי זמן קצר
      setTimeout(() => {
        onComplete();
      }, 1500);

    } catch (error) {
      console.error('Error completing form:', error);
      setSnackbarMessage('שגיאה בהשלמת הטופס');
      setShowSnackbar(true);
    }
  };

  // רינדור שאלה לפי סוג
  const renderQuestion = (question) => {
    const answer = localAnswers[question.questionNo] || { answer: '', other: '' };
    const isAnswered = !!answer.answer?.trim();
    const hasError = validationErrors[question.questionNo];

    return (
      <QuestionCard 
        key={question.questionNo}
        isMandatory={question.isMandatory}
        isAnswered={isAnswered}
      >
        {/* כותרת השאלה */}
        <Box display="flex" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              שאלה {question.questionNo}
              {question.isMandatory && (
                <Chip 
                  label="חובה" 
                  size="small" 
                  color="warning" 
                  sx={{ ml: 1, fontSize: '0.7rem' }} 
                />
              )}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {question.questionText}
            </Typography>
          </Box>
          
          {isAnswered && (
            <Tooltip title="נענתה">
              <CheckCircleOutline color="success" />
            </Tooltip>
          )}
        </Box>

        {/* תוכן השאלה */}
        {question.isOpen ? (
          // שאלה פתוחה
          <TextField
            fullWidth
            multiline
            rows={3}
            value={answer.answer}
            onChange={(e) => handleAnswerChange(question.questionNo, e.target.value)}
            placeholder="הכנס את תשובתך כאן..."
            error={!!hasError}
            helperText={hasError}
            variant="outlined"
          />
        ) : (
          // שאלה סגורה
          <FormControl component="fieldset" error={!!hasError}>
            <FormLabel component="legend">בחר תשובה:</FormLabel>
            
            {question.howManyValues === 1 ? (
              // רדיו (בחירה יחידה)
              <RadioGroup
                value={answer.answer}
                onChange={(e) => handleAnswerChange(question.questionNo, e.target.value)}
              >
                {question.possibleValues?.split(',').map((value, index) => (
                  <FormControlLabel
                    key={index}
                    value={value.trim()}
                    control={<Radio />}
                    label={value.trim()}
                  />
                ))}
                
                {question.hasOther && (
                  <FormControlLabel
                    value="אחר"
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        אחר:
                        <TextField
                          size="small"
                          value={answer.other}
                          onChange={(e) => {
                            handleAnswerChange(question.questionNo, 'אחר', e.target.value);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (answer.answer !== 'אחר') {
                              handleAnswerChange(question.questionNo, 'אחר', '');
                            }
                          }}
                          disabled={answer.answer !== 'אחר'}
                          placeholder="פרט..."
                        />
                      </Box>
                    }
                  />
                )}
              </RadioGroup>
            ) : (
              // צ'קבוקס (בחירה מרובה)
              <FormGroup>
                {question.possibleValues?.split(',').map((value, index) => (
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox
                        checked={answer.answer.includes(value.trim())}
                        onChange={(e) => {
                          const currentAnswers = answer.answer ? answer.answer.split(',') : [];
                          let newAnswers;
                          
                          if (e.target.checked) {
                            newAnswers = [...currentAnswers, value.trim()];
                          } else {
                            newAnswers = currentAnswers.filter(a => a !== value.trim());
                          }
                          
                          handleAnswerChange(question.questionNo, newAnswers.join(','));
                        }}
                      />
                    }
                    label={value.trim()}
                  />
                ))}
              </FormGroup>
            )}
            
            {hasError && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {hasError}
              </Typography>
            )}
          </FormControl>
        )}
      </QuestionCard>
    );
  };

  // חישוב התקדמות
  const calculateProgress = () => {
    const totalQuestions = currentFormQuestions.length;
    const answeredQuestions = currentFormQuestions.filter(q => 
      localAnswers[q.questionNo]?.answer?.trim()
    ).length;
    
    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  };

  const progress = calculateProgress();
  const mandatoryQuestions = currentFormQuestions.filter(q => q.isMandatory);
  const answeredMandatory = mandatoryQuestions.filter(q => 
    localAnswers[q.questionNo]?.answer?.trim()
  ).length;

  if (questionsStatus === 'loading') {
    return (
      <Box textAlign="center" py={4}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>טוען שאלות הטופס...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* כותרת הטופס */}
      <FormContainer>
        <FormHeader>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {form.formName}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {form.formDescription}
            </Typography>
          </Box>
        </FormHeader>

        {/* סקירת התקדמות */}
        <ProgressSection>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                התקדמות: {progress}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                color={progress >= 75 ? 'success' : progress >= 50 ? 'primary' : 'warning'}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                נענו {currentFormQuestions.filter(q => localAnswers[q.questionNo]?.answer?.trim()).length} מתוך {currentFormQuestions.length} שאלות
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip 
                  icon={<InfoIcon />}
                  label={`${answeredMandatory}/${mandatoryQuestions.length} שאלות חובה`}
                  color={answeredMandatory === mandatoryQuestions.length ? 'success' : 'warning'}
                  variant="filled"
                />
                
                {autoSaveStatus === 'saving' && (
                  <Chip label="שומר..." color="primary" size="small" />
                )}
                {autoSaveStatus === 'saved' && (
                  <Chip label="נשמר" color="success" size="small" />
                )}
                {autoSaveStatus === 'error' && (
                  <Chip label="שגיאה בשמירה" color="error" size="small" />
                )}
              </Box>
            </Grid>
          </Grid>
        </ProgressSection>
      </FormContainer>

      {/* השאלות */}
      <Box>
        {currentFormQuestions.map(renderQuestion)}
      </Box>

      {/* כפתורי פעולה */}
      <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
        <Box display="flex" gap={2} justifyContent="space-between">
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={onCancel}
          >
            חזרה
          </Button>

          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<CompleteIcon />}
              onClick={handleCompleteForm}
              disabled={formActions.completing || progress < 100}
            >
              {formActions.completing ? 'משלים...' : 'השלם טופס'}
            </Button>
          </Box>
        </Box>

        {progress < 100 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <AlertTitle>להשלמת הטופס</AlertTitle>
            יש להשלים את כל השאלות החובה. התקדמות נוכחית: {progress}%
          </Alert>
        )}
      </Paper>

      {/* הודעות */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default DynamicFormRenderer;