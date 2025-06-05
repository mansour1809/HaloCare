// src/pages/kids/DynamicFormRenderer.jsx - גרסה משופרת
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, Alert, AlertTitle, CircularProgress,
  Button, Grid, Divider, Chip, Fade, LinearProgress, Snackbar
} from '@mui/material';
import {
  Save as SaveIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon,
  // AutoSave as AutoSaveIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import AutoSaveIcon from '@mui/icons-material/AutoSave';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Swal from 'sweetalert2';

import { fetchQuestionsByFormId } from '../../Redux/features/questionsSlice';
import { 
  fetchFormAnswers, 
  saveFormAnswers, 
  updateLocalAnswer,
  setCurrentForm 
} from '../../Redux/features/answersSlice';
import QuestionRenderer from './QuestionRenderer';

const DynamicFormRenderer = ({ 
  form, 
  kidId, 
  onFormComplete, 
  showSendToParentOption = true,
  readOnly = false 
}) => {
  const dispatch = useDispatch();
  const [validationSchema, setValidationSchema] = useState(yup.object({}));
  const [progress, setProgress] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // idle, saving, saved, error
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const { 
    currentFormQuestions, 
    status: questionsStatus, 
    error: questionsError 
  } = useSelector(state => state.questions);
  
  const { 
    currentFormAnswers, 
    saveStatus, 
    error: answersError 
  } = useSelector(state => state.answers);

  // טעינת שאלות ותשובות בעת טעינת הקומפוננטה
  useEffect(() => {
    if (form?.formId && kidId) {
      loadFormData();
    }
  }, [form?.formId, kidId]);

  // עדכון progress כאשר התשובות משתנות
  useEffect(() => {
    if (currentFormQuestions.length > 0) {
      calculateProgress();
    }
  }, [currentFormAnswers, currentFormQuestions]);

  // שמירה אוטומטית כל 30 שניות אם יש שינויים
  useEffect(() => {
    if (!readOnly && hasUnsavedChanges) {
      const autoSaveInterval = setInterval(() => {
        handleAutoSave();
      }, 30000); // 30 שניות

      return () => clearInterval(autoSaveInterval);
    }
  }, [hasUnsavedChanges, readOnly]);

  const loadFormData = async () => {
    try {
      // טעינת שאלות הטופס
      await dispatch(fetchQuestionsByFormId(form.formId));
      
      // הגדרת הטופס הנוכחי
      dispatch(setCurrentForm({ kidId, formId: form.formId }));
      
      // טעינת תשובות קיימות
      await dispatch(fetchFormAnswers({ kidId, formId: form.formId }));
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  // יצירת סכימת validation דינמית
  useEffect(() => {
    if (currentFormQuestions.length > 0) {
      const schema = {};
      
      currentFormQuestions.forEach(question => {
        let fieldSchema = yup.string();
        
        if (question.isMandatory) {
          fieldSchema = fieldSchema.required(`${question.questionText} הוא שדה חובה`);
        }
        
        // תקינות נוספת לפי סוג השאלה
        if (question.questionType === 'email') {
          fieldSchema = fieldSchema.email('כתובת דוא״ל לא תקינה');
        } else if (question.questionType === 'number') {
          fieldSchema = yup.number().typeError('יש להזין מספר תקין');
          if (question.isMandatory) {
            fieldSchema = fieldSchema.required(`${question.questionText} הוא שדה חובה`);
          }
        } else if (question.questionType === 'date') {
          fieldSchema = yup.date().typeError('תאריך לא תקין');
          if (question.isMandatory) {
            fieldSchema = fieldSchema.required(`${question.questionText} הוא שדה חובה`);
          }
        }
        
        schema[`question_${question.questionNo}`] = fieldSchema;
        
        // תמיכה בשדה "אחר"
        if (question.hasOther) {
          schema[`question_${question.questionNo}_other`] = yup.string();
        }
      });
      
      setValidationSchema(yup.object(schema));
    }
  }, [currentFormQuestions]);

  // חישוב אחוז ההתקדמות
  const calculateProgress = () => {
    if (currentFormQuestions.length === 0) return;
    
    const mandatoryQuestions = currentFormQuestions.filter(q => q.isMandatory);
    const answeredMandatory = mandatoryQuestions.filter(q => 
      currentFormAnswers.some(a => a.questionNo === q.questionNo && a.answer)
    );
    
    const totalAnswered = currentFormAnswers.filter(a => a.answer).length;
    const progressPercent = Math.round((totalAnswered / currentFormQuestions.length) * 100);
    const mandatoryProgress = mandatoryQuestions.length > 0 ? 
      Math.round((answeredMandatory.length / mandatoryQuestions.length) * 100) : 100;
    
    setProgress(progressPercent);
    
    // בדיקה אם כל השאלות החובה נענו
    return mandatoryProgress === 100;
  };

  // הכנת ערכים ראשוניים לטופס
  const getInitialValues = () => {
    const values = {};
    
    currentFormQuestions.forEach(question => {
      const existingAnswer = currentFormAnswers.find(a => a.questionNo === question.questionNo);
      values[`question_${question.questionNo}`] = existingAnswer?.answer || '';
      
      if (question.hasOther) {
        values[`question_${question.questionNo}_other`] = existingAnswer?.other || '';
      }
    });
    
    return values;
  };

  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await handleFormSubmit(values, false);
    },
  });

  // עדכון ערכי הטופס כאשר התשובות משתנות
  useEffect(() => {
    if (currentFormAnswers.length > 0) {
      const newValues = getInitialValues();
      formik.setValues(newValues);
    }
  }, [currentFormAnswers]);

  // שמירה אוטומטית
  const handleAutoSave = async () => {
    if (!hasUnsavedChanges || readOnly) return;
    
    setAutoSaveStatus('saving');
    try {
      const answers = prepareAnswersForSaving(formik.values);
      if (answers.length > 0) {
        await dispatch(saveFormAnswers({
          kidId,
          formId: form.formId,
          answers
        })).unwrap();
        
        setAutoSaveStatus('saved');
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }
    } catch (error) {
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    }
  };

  // הכנת התשובות לשמירה
  const prepareAnswersForSaving = (values) => {
    const answers = [];
    
    currentFormQuestions.forEach(question => {
      const answer = values[`question_${question.questionNo}`];
      const other = values[`question_${question.questionNo}_other`];
      
      if (answer) {
        answers.push({
          questionNo: question.questionNo,
          answer: answer,
          other: other || null,
          byParent: false
        });
      }
    });
    
    return answers;
  };

  const handleFormSubmit = async (values, sendToParent = false) => {
    try {
      const answers = prepareAnswersForSaving(values);

      if (answers.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'לא נמצאו תשובות',
          text: 'יש למלא לפחות שאלה אחת לפני השמירה',
        });
        return;
      }

      // שמירת התשובות
      await dispatch(saveFormAnswers({
        kidId,
        formId: form.formId,
        answers: answers.map(a => ({ ...a, byParent: sendToParent }))
      })).unwrap();

      setHasUnsavedChanges(false);

      if (sendToParent) {
        Swal.fire({
          icon: 'success',
          title: 'נשלח בהצלחה!',
          text: 'הטופס נשלח להורים למילוי',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // בדיקה אם כל השאלות החובה נענו
        const allMandatoryAnswered = calculateProgress();
        
        if (allMandatoryAnswered) {
          const result = await Swal.fire({
            icon: 'success',
            title: 'נשמר בהצלחה!',
            text: 'כל השאלות החובה נענו. האם תרצה לסמן את הטופס כמושלם?',
            showCancelButton: true,
            confirmButtonText: 'כן, סמן כמושלם',
            cancelButtonText: 'לא, המשך עריכה'
          });
          
          if (result.isConfirmed && onFormComplete) {
            onFormComplete(form.formId);
          }
        } else {
          Swal.fire({
            icon: 'info',
            title: 'נשמר בהצלחה!',
            text: 'התשובות נשמרו. עדיין יש שאלות חובה שלא נענו.',
            timer: 2000,
            showConfirmButton: false
          });
        }
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'שגיאה בשמירה',
        text: error.message || 'אירעה שגיאה בשמירת הטופס',
      });
    }
  };

  const handleSendToParent = () => {
    Swal.fire({
      title: 'שליחת טופס להורים',
      text: 'האם ברצונך לשלוח את הטופס להורים למילוי?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'כן, שלח',
      cancelButtonText: 'ביטול',
      confirmButtonColor: '#2196f3'
    }).then((result) => {
      if (result.isConfirmed) {
        handleFormSubmit(formik.values, true);
      }
    });
  };

  // עדכון תשובה מקומית בזמן הקלדה
  const handleQuestionChange = (questionNo, value, otherValue = null) => {
    // עדכון הRedux
    dispatch(updateLocalAnswer({
      questionNo,
      answer: value,
      other: otherValue
    }));
    
    // עדכון הFormik
    formik.setFieldValue(`question_${questionNo}`, value);
    if (otherValue !== null) {
      formik.setFieldValue(`question_${questionNo}_other`, otherValue);
    }
    
    // סימון שיש שינויים לא שמורים
    setHasUnsavedChanges(true);
  };

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

  if (questionsError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        <AlertTitle>שגיאה בטעינת הטופס</AlertTitle>
        {questionsError}
      </Alert>
    );
  }

  if (currentFormQuestions.length === 0) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        <AlertTitle>אין שאלות</AlertTitle>
        לא נמצאו שאלות עבור טופס זה
      </Alert>
    );
  }

  return (
    <Box dir="rtl">
      {/* סרגל התקדמות מעודכן */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
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
            {currentFormAnswers.length} מתוך {currentFormQuestions.length} שאלות נענו
          </Typography>
          
          {/* סטטוס שמירה אוטומטית */}
          {!readOnly && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {autoSaveStatus === 'saving' && (
                <>
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="text.secondary">
                    שומר...
                  </Typography>
                </>
              )}
              {autoSaveStatus === 'saved' && (
                <>
                  <CheckIcon fontSize="small" color="success" />
                  <Typography variant="caption" color="success.main">
                    נשמר אוטומטית
                  </Typography>
                </>
              )}
              {autoSaveStatus === 'error' && (
                <>
                  <WarningIcon fontSize="small" color="error" />
                  <Typography variant="caption" color="error.main">
                    שגיאה בשמירה
                  </Typography>
                </>
              )}
              {hasUnsavedChanges && autoSaveStatus === 'idle' && (
                <Typography variant="caption" color="warning.main">
                  יש שינויים לא שמורים
                </Typography>
              )}
              {lastSaved && (
                <Typography variant="caption" color="text.secondary">
                  נשמר לאחרונה: {lastSaved.toLocaleTimeString('he-IL')}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* שגיאות */}
      {answersError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>שגיאה</AlertTitle>
          {answersError}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        {/* רנדור שאלות לפי קטגוריות */}
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
                    .map((question, index) => (
                      <Grid item xs={12} key={question.questionNo}>
                        <QuestionRenderer
                          question={question}
                          value={formik.values[`question_${question.questionNo}`] || ''}
                          otherValue={formik.values[`question_${question.questionNo}_other`] || ''}
                          error={formik.touched[`question_${question.questionNo}`] && 
                                 formik.errors[`question_${question.questionNo}`]}
                          onChange={(value, otherValue) => 
                            handleQuestionChange(question.questionNo, value, otherValue)
                          }
                          onBlur={() => formik.setFieldTouched(`question_${question.questionNo}`, true)}
                          readOnly={readOnly}
                        />
                      </Grid>
                    ))}
                </Grid>
              </Box>
            </Paper>
          </Fade>
        ))}

        {!readOnly && (
          <>
            <Divider sx={{ my: 4 }} />
            
            {/* כפתורי פעולה מעודכנים */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  icon={<CheckIcon />}
                  label={`${currentFormAnswers.length} תשובות נשמרו`}
                  color="success"
                  variant="outlined"
                  size="small"
                />
                
                {hasUnsavedChanges && (
                  <Chip 
                    icon={<AutoSaveIcon />}
                    label="יש שינויים לא שמורים"
                    color="warning"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                {/* כפתור שמירה אוטומטית ידנית */}
                <Button
                  variant="outlined"
                  startIcon={<AutoSaveIcon />}
                  onClick={handleAutoSave}
                  disabled={!hasUnsavedChanges || autoSaveStatus === 'saving'}
                >
                  שמור עכשיו
                </Button>
                
                {showSendToParentOption && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<SendIcon />}
                    onClick={handleSendToParent}
                    disabled={saveStatus === 'loading'}
                  >
                    שלח להורים
                  </Button>
                )}
                
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={saveStatus === 'loading' ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={saveStatus === 'loading'}
                  sx={{ minWidth: 140 }}
                >
                  {saveStatus === 'loading' ? 'שומר...' : 'שמור והמשך'}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </form>

      {/* הודעת שמירה אוטומטית */}
      <Snackbar
        open={autoSaveStatus === 'saved'}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        message="נשמר אוטומטית"
      />
    </Box>
  );
  
  // פונקציה לקיבוץ שאלות לפי קטגוריה
  function groupQuestionsByCategory() {
    const grouped = {};
    currentFormQuestions.forEach(question => {
      const category = question.category || 'כללי';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(question);
    });
    return grouped;
  }
};

export default DynamicFormRenderer;