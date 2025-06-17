// components/kids/DynamicFormRenderer.jsx 
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, LinearProgress,
  CircularProgress, Alert, Snackbar, Chip, Fade, Divider,
  Card, CardContent, CardHeader, Stepper, Step, StepLabel,
  Collapse, Avatar, Container, Stack, Tooltip, IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Assignment as FormIcon,
  Timeline as ProgressIcon,
  AutoAwesome as MagicIcon,
  Lightbulb as TipIcon
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
  selectSaveError
} from '../../Redux/features/answersSlice';
import axios from '../../components/common/axiosConfig'; 
import QuestionRenderer from '../kids/QuestionRenderer';

// עיצוב מותאם לקונטיינר הראשי עם רקע מדהים
const MainContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: theme.spacing(4, 2),
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)',
    pointerEvents: 'none',
  }
}));

// כותרת טופס עם עיצוב מרשים
const FormHeader = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
  backdropFilter: 'blur(20px)',
  borderRadius: theme.spacing(3),
  border: '1px solid rgba(255,255,255,0.2)',
  marginBottom: theme.spacing(4),
  overflow: 'visible',
  position: 'relative',
  
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    background: 'linear-gradient(45deg, #667eea, #764ba2, #667eea)',
    borderRadius: theme.spacing(3),
    zIndex: -1,
    backgroundSize: '400% 400%',
    animation: 'gradientShift 8s ease infinite',
  },
  
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  }
}));

// כרטיס התקדמות מעוצב
const ProgressCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)',
  backdropFilter: 'blur(15px)',
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(255,255,255,0.3)',
  marginBottom: theme.spacing(3),
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  }
}));

// כרטיס קטגוריה עם עיצוב מתקדם
const CategoryCard = styled(Card)(({ theme, expanded }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2.5),
  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.2)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  
  '&:hover': {
    transform: expanded ? 'none' : 'translateY(-4px)',
    boxShadow: expanded ? 'none' : '0 12px 40px rgba(0,0,0,0.15)',
  },
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
  }
}));

// כותרת קטגוריה עם אפקטים
const CategoryHeader = styled(CardHeader)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
  borderBottom: '1px solid rgba(0,0,0,0.06)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%)',
  }
}));

// כפתורי פעולה מעוצבים
const ActionButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: variant === 'contained' ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: variant === 'contained' 
      ? '0 8px 25px rgba(102, 126, 234, 0.6)' 
      : '0 4px 15px rgba(0,0,0,0.1)',
  }
}));

// אינדיקטור סטטוס
const StatusIndicator = styled(Box)(({ theme, status }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.spacing(3),
  fontSize: '0.875rem',
  fontWeight: 600,
  background: getStatusBackground(status),
  color: getStatusColor(status),
  border: `1px solid ${getStatusBorder(status)}`,
}));

function getStatusBackground(status) {
  switch (status) {
    case 'completed': return 'rgba(34, 197, 94, 0.1)';
    case 'inProgress': return 'rgba(234, 179, 8, 0.1)';
    case 'pending': return 'rgba(156, 163, 175, 0.1)';
    default: return 'rgba(156, 163, 175, 0.1)';
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'completed': return '#16a34a';
    case 'inProgress': return '#ca8a04';
    case 'pending': return '#6b7280';
    default: return '#6b7280';
  }
}

function getStatusBorder(status) {
  switch (status) {
    case 'completed': return 'rgba(34, 197, 94, 0.2)';
    case 'inProgress': return 'rgba(234, 179, 8, 0.2)';
    case 'pending': return 'rgba(156, 163, 175, 0.2)';
    default: return 'rgba(156, 163, 175, 0.2)';
  }
}

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
  
  // State מקומי
  const [localAnswers, setLocalAnswers] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [expandedCategories, setExpandedCategories] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

  // טעינה ראשונית
  useEffect(() => {
    loadFormData();
  }, [kidId, formId]);

  // טעינת תשובות קיימות ל-state מקומי
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
    }
  }, [currentFormAnswers]);

  // הרחבת קטגוריות בטעינה ראשונית
  useEffect(() => {
    if (currentFormQuestions.length > 0) {
      const categories = [...new Set(currentFormQuestions.map(q => q.category || 'כללי'))];
      const initialExpanded = {};
      categories.forEach((category, index) => {
        initialExpanded[category] = index === 0; // רק הראשונה פתוחה
      });
      setExpandedCategories(initialExpanded);
    }
  }, [currentFormQuestions]);

  const loadFormData = async () => {
    try {
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

  // עדכון תשובה מקומית
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

  // שמירת כל התשובות
  const handleSaveAll = async () => {
    if (readOnly) return;

    try {
      const answersToSave = currentFormQuestions.map(question => {
        const localAnswer = localAnswers[question.questionNo];
        
        return {
          answerId: localAnswer?.answerId || null,
          questionNo: question.questionNo,
          answer: localAnswer?.answer || '',
          other: localAnswer?.other || '',
          byParent: false
        };
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
  };

  // שמירה חכמה
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

  // בדיקת השלמה
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

  // קבלת ערך תשובה
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
      const category = question.category || 'כללי';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(question);
    });
    return grouped;
  };

  // החלפת מצב קטגוריה
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const progress = calculateProgress();
  const answeredCount = Object.keys(localAnswers).filter(qNo => localAnswers[qNo]?.answer).length;
  const totalQuestions = currentFormQuestions.length;
  const categoriesData = groupQuestionsByCategory();

  if (questionsStatus === 'loading') {
    return (
      <MainContainer maxWidth="md">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={80} thickness={4} />
          <Typography variant="h5" sx={{ mt: 3, color: 'white', fontWeight: 600 }}>
            טוען שאלות הטופס...
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, color: 'rgba(255,255,255,0.8)' }}>
            אנא המתן בזמן שאנחנו מכינים עבורך את הטופס
          </Typography>
        </Box>
      </MainContainer>
    );
  }

  if (!currentFormQuestions.length) {
    return (
      <MainContainer maxWidth="md">
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: 3,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography variant="h6">אין שאלות בטופס זה</Typography>
          <Typography variant="body2">
            נראה שהטופס עדיין לא הוגדר או שאין בו שאלות.
          </Typography>
        </Alert>
      </MainContainer>
    );
  }

  return (
    <MainContainer maxWidth="lg">
      {/* כותרת הטופס */}
      <FormHeader>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                fontSize: '2rem'
              }}
            >
              <FormIcon />
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {formData?.formName || 'טופס דינמי'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {formData?.description || 'מלא את הטופס בקפידה לקידום התהליך'}
              </Typography>
              
              <Stack direction="row" spacing={2}>
                <StatusIndicator status={progress === 100 ? 'completed' : progress > 0 ? 'inProgress' : 'pending'}>
                  {progress === 100 ? (
                    <>
                      <CheckIcon fontSize="small" />
                      הושלם
                    </>
                  ) : progress > 0 ? (
                    <>
                      <ProgressIcon fontSize="small" />
                      בתהליך
                    </>
                  ) : (
                    <>
                      <FormIcon fontSize="small" />
                      טרם התחיל
                    </>
                  )}
                </StatusIndicator>
                
                <Chip 
                  label={`${answeredCount} מתוך ${totalQuestions} שאלות`}
                  variant="outlined"
                  size="small"
                />
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </FormHeader>

      {/* כרטיס התקדמות */}
      <ProgressCard>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <ProgressIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              התקדמות הטופס
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Typography variant="h5" fontWeight="bold" color="primary">
              {progress}%
            </Typography>
          </Stack>
          
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 12, 
              borderRadius: 6,
              background: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                borderRadius: 6,
              }
            }}
          />
          
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              שאלות שנענו: {answeredCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              סך השאלות: {totalQuestions}
            </Typography>
          </Stack>
          
          {!readOnly && hasChanges && (
            <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon fontSize="small" />
                יש שינויים שלא נשמרו - אל תשכח לשמור!
              </Box>
            </Alert>
          )}
        </CardContent>
      </ProgressCard>

      {/* שאלות הטופס לפי קטגוריות */}
      {Object.entries(categoriesData).map(([category, questions], categoryIndex) => (
        <Fade in={true} timeout={400 + (categoryIndex * 200)} key={category}>
          <CategoryCard expanded={expandedCategories[category]}>
            <CategoryHeader
              title={
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      background: `linear-gradient(45deg, hsl(${categoryIndex * 60}, 70%, 60%), hsl(${categoryIndex * 60 + 30}, 70%, 50%))`,
                      fontSize: '1.2rem'
                    }}
                  >
                    {category.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {questions.length} שאלות בקטגוריה זו
                    </Typography>
                  </Box>
                </Stack>
              }
              action={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Chip 
                    label={`${questions.filter(q => {
                      const answer = getAnswerValue(q.questionNo);
                      return answer.answer && answer.answer.trim() !== '';
                    }).length}/${questions.length}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <IconButton onClick={() => toggleCategory(category)}>
                    {expandedCategories[category] ? <CollapseIcon /> : <ExpandIcon />}
                  </IconButton>
                </Stack>
              }
              onClick={() => toggleCategory(category)}
            />
            
            <Collapse in={expandedCategories[category]} timeout={300}>
              <CardContent sx={{ p: 3, pt: 0 }}>
                <Grid container spacing={2}>
                  {questions
                    .sort((a, b) => a.questionNo - b.questionNo)
                    .map((question, index) => {
                      const { answer, other } = getAnswerValue(question.questionNo);
                      
                      return (
                        <Grid item xs={12} key={question.questionNo}>
                          <Fade in={expandedCategories[category]} timeout={300 + (index * 100)}>
                            <Box>
                              <QuestionRenderer
                                question={question}
                                value={answer}
                                otherValue={other}
                                onChange={(value, otherValue) => 
                                  handleQuestionChange(question.questionNo, value, otherValue)
                                }
                                readOnly={readOnly}
                              />
                            </Box>
                          </Fade>
                        </Grid>
                      );
                    })}
                </Grid>
              </CardContent>
            </Collapse>
          </CategoryCard>
        </Fade>
      ))}

      {/* כפתורי פעולה */}
      <Paper 
        sx={{ 
          p: 3, 
          mt: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          {onBack && (
            <ActionButton
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={onBack}
            >
              חזרה
            </ActionButton>
          )}
          
          <Stack direction="row" spacing={2}>
            {readOnly && (
              <ActionButton
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => window.location.reload()}
                color="primary"
              >
                עריכה
              </ActionButton>
            )}
            
            {!readOnly && (
              <ActionButton
                variant="contained"
                startIcon={saveStatus === 'loading' ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveAll}
                disabled={saveStatus === 'loading' || !hasChanges}
                size="large"
                sx={{ minWidth: 160 }}
              >
                {saveStatus === 'loading' ? 'שומר...' : 'שמור והמשך'}
              </ActionButton>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* שגיאות שמירה */}
      {saveError && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
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
          sx={{ borderRadius: 2 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </MainContainer>
  );
};

export default DynamicFormRenderer;