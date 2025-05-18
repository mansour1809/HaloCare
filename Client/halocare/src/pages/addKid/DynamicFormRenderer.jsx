// components/forms/DynamicFormRenderer.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Paper, Typography, Grid, TextField, MenuItem, FormControl,
  InputLabel, Select, FormGroup, FormControlLabel, Checkbox, 
  RadioGroup, Radio, Button, FormHelperText, Alert, Chip,
  Switch, Divider, Stack, InputAdornment, CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled } from '@mui/material/styles';
import { fetchFormQuestions } from '../../Redux/features/formsSlice';
import { fetchAnswers, saveAnswers } from '../../Redux/features/answersSlice';

// סטיילינג מותאם אישית
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

const CategoryHeading = styled(Typography)(({ theme }) => ({
  display: 'flex', 
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(1),
  '&::after': {
    content: '""',
    flex: 1,
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
    marginLeft: theme.spacing(2)
  }
}));

const DynamicFormRenderer = ({ formId, kidId, onUpdate, isParentView = false }) => {
  const dispatch = useDispatch();
  const [formState, setFormState] = useState({});
  const [errors, setErrors] = useState({});
  const [groups, setGroups] = useState([]);
  
  const { questions, status: questionsStatus } = useSelector(state => state.forms);
  const { answers, status: answersStatus, saveStatus } = useSelector(state => state.answers);
  
  // טעינת שאלות הטופס
  useEffect(() => {
    if (formId) {
      dispatch(fetchFormQuestions(formId));
    }
  }, [dispatch, formId]);
  
  // טעינת תשובות קיימות (אם יש)
  useEffect(() => {
    if (kidId && formId) {
      dispatch(fetchAnswers({ kidId, formId }));
    }
  }, [dispatch, kidId, formId]);
  
  // ארגון שאלות לפי קטגוריות
  useEffect(() => {
    if (questions && questions.length > 0) {
      const groupedQuestions = {};
      questions.forEach(question => {
        if (!groupedQuestions[question.category]) {
          groupedQuestions[question.category] = [];
        }
        groupedQuestions[question.category].push(question);
      });
      
      const groupArray = Object.keys(groupedQuestions).map(category => ({
        name: category,
        questions: groupedQuestions[category]
      }));
      
      setGroups(groupArray);
      
      // אתחול מצב הטופס עם תשובות קיימות
      if (answers && answers.length > 0) {
        const initialState = {};
        questions.forEach(question => {
          const existingAnswer = answers.find(a => 
            a.formId === formId && a.questionNo === question.questionNo
          );
          
          if (existingAnswer) {
            initialState[question.questionNo] = existingAnswer.answer;
            if (existingAnswer.other) {
              initialState[`${question.questionNo}_other`] = existingAnswer.other;
            }
          } else {
            initialState[question.questionNo] = '';
          }
        });
        
        setFormState(initialState);
      } else {
        // אם אין תשובות קיימות, נאתחל עם ערכים ריקים
        const initialState = {};
        questions.forEach(question => {
          initialState[question.questionNo] = '';
        });
        setFormState(initialState);
      }
    }
  }, [questions, answers, formId]);
  
  // טיפול בשינוי ערך
  const handleChange = (questionNo, value) => {
    setFormState(prev => ({
      ...prev,
      [questionNo]: value
    }));
    
    // ניקוי שגיאה אם קיימת
    if (errors[questionNo]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionNo];
        return newErrors;
      });
    }
  };
  
  // טיפול ב-other value
  const handleOtherChange = (questionNo, value) => {
    setFormState(prev => ({
      ...prev,
      [`${questionNo}_other`]: value
    }));
  };
  
  // ולידציה
  const validateForm = () => {
    const newErrors = {};
    
    questions.forEach(question => {
      if (question.isMandatory && !formState[question.questionNo]) {
        newErrors[question.questionNo] = 'שדה חובה';
      }
      
      // ולידציה נוספת לפי סוג השאלה
      if (formState[question.questionNo]) {
        switch (question.questionType) {
          case 'email':
            if (!/\S+@\S+\.\S+/.test(formState[question.questionNo])) {
              newErrors[question.questionNo] = 'כתובת אימייל לא תקינה';
            }
            break;
          case 'number':
            if (isNaN(formState[question.questionNo])) {
              newErrors[question.questionNo] = 'ערך לא תקין';
            }
            break;
          // הוסף כאן בדיקות נוספות לפי הצורך
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // שליחת הטופס
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      // מבנה הנתונים לשליחה לשרת
      const answersToSave = questions.map(question => ({
        kidId,
        formId: formId,
        questionNo: question.questionNo,
        answer: formState[question.questionNo] || '',
        other: formState[`${question.questionNo}_other`] || null,
        ansDate: new Date().toISOString(),
        employeeId: isParentView ? null : undefined, // אם הטופס ממולא ע"י הורה, employeeId יהיה null
        byParent: isParentView
      }));
      
      await dispatch(saveAnswers(answersToSave)).unwrap();
      
      // עדכון ה-parent component
      if (onUpdate) {
        onUpdate(formState);
      }
      
    } catch (error) {
      console.error('שגיאה בשמירת הטופס:', error);
    }
  };
  
  // רינדור שאלה לפי סוג - אותו קוד כמו קודם
  const renderQuestion = (question) => {
    // הקוד לרינדור שאלות לפי סוג - כמו שהיה בדוגמה המקורית 
  };
  
  // מצבי טעינה
  if (questionsStatus === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (questionsStatus === 'failed') {
    return (
      <Alert severity="error">אירעה שגיאה בטעינת שאלות הטופס</Alert>
    );
  }
  
  if (!questions || questions.length === 0) {
    return (
      <Alert severity="warning">לא נמצאו שאלות עבור טופס זה.</Alert>
    );
  }
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.dark' }}>
        {isParentView ? "טופס למילוי ע״י הורה" : "טופס למילוי"}
      </Typography>
      
      {groups.map((group) => (
        <StyledPaper key={group.name}>
          <CategoryHeading variant="h6" gutterBottom>
            {group.name}
          </CategoryHeading>
          
          <Grid container spacing={2}>
            {group.questions.map((question) => (
              <Grid item xs={12} sm={question.questionType === 'textarea' ? 12 : 6} key={question.questionNo}>
                {renderQuestion(question)}
              </Grid>
            ))}
          </Grid>
        </StyledPaper>
      ))}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={saveStatus === 'loading'}
          size="large"
        >
         {saveStatus === 'loading' ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            isParentView ? "שלח טופס" : "שמור תשובות"
          )}
        </Button>
      </Box>
    </Box>
  );
};

// משלים את החלק החסר של renderQuestion
const renderQuestion = (question) => {
  const { questionNo, questionText, questionType, isMandatory, isOpen, possibleValues, hasOther } = question;
  const value = formState[questionNo] || '';
  const otherValue = formState[`${questionNo}_other`] || '';
  const error = errors[questionNo];
  
  // פיצול אפשרויות אם יש
  const options = possibleValues ? possibleValues.split(',') : [];
  
  switch (questionType) {
    case 'text':
      return (
        <TextField
          fullWidth
          id={`question-${questionNo}`}
          label={questionText}
          value={value}
          onChange={(e) => handleChange(questionNo, e.target.value)}
          error={Boolean(error)}
          helperText={error}
          required={isMandatory}
          margin="normal"
        />
      );
      
    case 'textarea':
      return (
        <TextField
          fullWidth
          id={`question-${questionNo}`}
          label={questionText}
          value={value}
          onChange={(e) => handleChange(questionNo, e.target.value)}
          multiline
          rows={4}
          error={Boolean(error)}
          helperText={error}
          required={isMandatory}
          margin="normal"
        />
      );
      
    case 'number':
      return (
        <TextField
          fullWidth
          id={`question-${questionNo}`}
          label={questionText}
          value={value}
          onChange={(e) => handleChange(questionNo, e.target.value)}
          type="number"
          error={Boolean(error)}
          helperText={error}
          required={isMandatory}
          margin="normal"
        />
      );
      
    case 'date':
      return (
        <DatePicker
          label={questionText}
          value={value ? new Date(value) : null}
          onChange={(date) => handleChange(questionNo, date ? date.toISOString() : null)}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              error={Boolean(error)}
              helperText={error}
              required={isMandatory}
              margin="normal"
            />
          )}
        />
      );
      
    case 'select':
      return (
        <FormControl 
          fullWidth 
          error={Boolean(error)}
          required={isMandatory}
          margin="normal"
        >
          <InputLabel id={`select-label-${questionNo}`}>{questionText}</InputLabel>
          <Select
            labelId={`select-label-${questionNo}`}
            id={`select-${questionNo}`}
            value={value}
            onChange={(e) => handleChange(questionNo, e.target.value)}
            label={questionText}
          >
            {options.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
            {hasOther && (
              <MenuItem value="אחר">אחר</MenuItem>
            )}
          </Select>
          {error && <FormHelperText>{error}</FormHelperText>}
          
          {/* שדה "אחר" אם רלוונטי ונבחר */}
          {hasOther && value === 'אחר' && (
            <TextField
              fullWidth
              label="פירוט אחר"
              value={otherValue}
              onChange={(e) => handleOtherChange(questionNo, e.target.value)}
              margin="normal"
              size="small"
            />
          )}
        </FormControl>
      );
      
    case 'multiselect':
      return (
        <FormControl 
          fullWidth 
          component="fieldset" 
          error={Boolean(error)}
          required={isMandatory}
          margin="normal"
        >
          <Typography variant="body1" gutterBottom>{questionText}</Typography>
          <FormGroup>
            {options.map((option) => {
              const isChecked = value.includes(option);
              return (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox 
                      checked={isChecked}
                      onChange={(e) => {
                        let newValue = [...(value.split(',').filter(v => v))];
                        if (e.target.checked) {
                          newValue.push(option);
                        } else {
                          newValue = newValue.filter(v => v !== option);
                        }
                        handleChange(questionNo, newValue.join(','));
                      }}
                    />
                  }
                  label={option}
                />
              );
            })}
            {hasOther && (
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={value.includes('אחר')}
                    onChange={(e) => {
                      let newValue = [...(value.split(',').filter(v => v))];
                      if (e.target.checked) {
                        newValue.push('אחר');
                      } else {
                        newValue = newValue.filter(v => v !== 'אחר');
                      }
                      handleChange(questionNo, newValue.join(','));
                    }}
                  />
                }
                label="אחר"
              />
            )}
          </FormGroup>
          {error && <FormHelperText>{error}</FormHelperText>}
          
          {/* שדה "אחר" אם רלוונטי ונבחר */}
          {hasOther && value.includes('אחר') && (
            <TextField
              fullWidth
              label="פירוט אחר"
              value={otherValue}
              onChange={(e) => handleOtherChange(questionNo, e.target.value)}
              margin="normal"
              size="small"
            />
          )}
        </FormControl>
      );
      
    default:
      return (
        <Typography variant="body2" color="error">
          סוג שאלה לא מוכר: {questionType}
        </Typography>
      );
  }
};

export default DynamicFormRenderer;