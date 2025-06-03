// src/pages/kids/DynamicFormRenderer.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, Alert, AlertTitle, CircularProgress,
  Button, Grid, Divider, Chip, Fade, LinearProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
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

  // טעינת שאלות וtשובות בעת טעינת הקומפוננטה
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
    
    setProgress(progressPercent);
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

  const handleFormSubmit = async (values, sendToParent = false) => {
    try {
      // הכנת התשובות לשמירה
      const answers = [];
      
      currentFormQuestions.forEach(question => {
        const answer = values[`question_${question.questionNo}`];
        const other = values[`question_${question.questionNo}_other`];
        
        if (answer || (question.isMandatory && answer)) {
          answers.push({
            questionNo: question.questionNo,
            answer: answer,
            other: other || null,
            byParent: sendToParent
          });
        }
      });

      // שמירת התשובות
      await dispatch(saveFormAnswers({
        kidId,
        formId: form.formId,
        answers
      })).unwrap();

      if (sendToParent) {
        Swal.fire({
          icon: 'success',
          title: 'נשלח בהצלחה!',
          text: 'הטופס נשלח להורים למילוי',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'נשמר בהצלחה!',
          text: 'תשובות הטופס נשמרו במערכת',
          timer: 2000,
          showConfirmButton: false
        });
        
        // עדכון ההורה שהטופס הושלם
        if (onFormComplete) {
          onFormComplete(form.formId);
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
    <Box>
      {/* סרגל התקדמות */}
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
        <Typography variant="caption" color="text.secondary">
          {currentFormAnswers.length} מתוך {currentFormQuestions.length} שאלות נענו
        </Typography>
      </Paper>

      {/* שגיאות */}
      {answersError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>שגיאה</AlertTitle>
          {answersError}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {[...currentFormQuestions]
            .sort((a, b) => a.questionNo - b.questionNo)
            .map((question, index) => (
              <Grid item xs={12} key={question.questionNo}>
                <Fade in={true} timeout={300 + (index * 100)}>
                  <div>
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
                  </div>
                </Fade>
              </Grid>
            ))}
        </Grid>

        {!readOnly && (
          <>
            <Divider sx={{ my: 4 }} />
            
            {/* כפתורי פעולה */}
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
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
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
                  sx={{ minWidth: 120 }}
                >
                  {saveStatus === 'loading' ? 'שומר...' : 'שמור והמשך'}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </form>
    </Box>
  );
};

export default DynamicFormRenderer;