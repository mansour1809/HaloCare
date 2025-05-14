// src/components/forms/FormSteps/PersonalInfoForm.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Typography,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Box,
  Divider,
  Paper,
  Alert,
  Button
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import heLocale from 'date-fns/locale/he';
import { fetchKidById } from '../../../redux/features/kidsSlice';
import {
  fetchFormQuestions,
  selectFormQuestions,
  selectCurrentFormData,
  updateAnswer,
  addValidationError,
  clearValidationErrors
} from '../../../redux/features/formsSlice';

// רכיב טופס פרטים אישיים (טופס 1)
const PersonalInfoForm = ({ kidId, onChange }) => {
  const dispatch = useDispatch();
  const questions = useSelector(state => selectFormQuestions(state, 1)); // formId = 1 לטופס פרטים אישיים
  const { answers, validationErrors } = useSelector(selectCurrentFormData);
  const { selectedKid, status: kidStatus } = useSelector(state => state.kids);
  
  // טעינת פרטי הילד ושאלות הטופס
  useEffect(() => {
    if (kidId && !selectedKid) {
      dispatch(fetchKidById(kidId));
    }
    
    if (questions.length === 0) {
      dispatch(fetchFormQuestions(1));
    }
  }, [dispatch, kidId, selectedKid, questions.length]);
  
  // טיפול בשינוי תשובה
  const handleAnswerChange = (questionNo, value, other = null) => {
    dispatch(updateAnswer({ questionNo, answer: value, other }));
    if (onChange) {
      onChange(questionNo, value);
    }
  };
  
  // מציאת שאלה לפי מספר
  const findQuestion = (questionNo) => {
    return questions.find(q => q.questionNo === questionNo) || {};
  };
  
  // בדיקה האם השדה הוא חובה
  const isRequired = (questionNo) => {
    const question = findQuestion(questionNo);
    return question.isMandatory;
  };
  
  // בדיקה האם יש שגיאה בשדה
  const hasError = (questionNo) => {
    return !!validationErrors[questionNo];
  };
  
  // החזרת הודעת שגיאה לשדה
  const getErrorMessage = (questionNo) => {
    return validationErrors[questionNo] || '';
  };
  
  // טעינת ערכי ברירת מחדל אם יש פרטי ילד קיימים
  useEffect(() => {
    if (selectedKid && Object.keys(answers).length === 0) {
      // העברת פרטי הילד לתשובות
      if (selectedKid.firstName) {
        handleAnswerChange(1, selectedKid.firstName);
      }
      if (selectedKid.lastName) {
        handleAnswerChange(2, selectedKid.lastName);
      }
      if (selectedKid.birthDate) {
        handleAnswerChange(3, selectedKid.birthDate.substring(0, 10)); // פורמט תאריך YYYY-MM-DD
      }
      if (selectedKid.gender) {
        handleAnswerChange(4, selectedKid.gender);
      }
      if (selectedKid.identityNumber) {
        handleAnswerChange(5, selectedKid.identityNumber);
      }
      if (selectedKid.address) {
        handleAnswerChange(6, selectedKid.address);
      }
      if (selectedKid.cityName) {
        handleAnswerChange(7, selectedKid.cityName);
      }
      if (selectedKid.hName) {
        handleAnswerChange(8, selectedKid.hName);
      }
    }
  }, [selectedKid, answers]);
  
  if (kidStatus === 'loading' || questions.length === 0) {
    return <Typography>טוען נתונים...</Typography>;
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
          פרטי הילד
        </Typography>
        
        <Grid container spacing={3}>
          {/* שם פרטי ושם משפחה */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(1).questionText || "שם פרטי"}
              value={answers[1]?.answer || ''}
              onChange={(e) => handleAnswerChange(1, e.target.value)}
              required={isRequired(1)}
              error={hasError(1)}
              helperText={getErrorMessage(1)}
              dir="rtl"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(2).questionText || "שם משפחה"}
              value={answers[2]?.answer || ''}
              onChange={(e) => handleAnswerChange(2, e.target.value)}
              required={isRequired(2)}
              error={hasError(2)}
              helperText={getErrorMessage(2)}
              dir="rtl"
            />
          </Grid>
          
          {/* תאריך לידה ומגדר */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={heLocale}>
              <DatePicker
                label={findQuestion(3).questionText || "תאריך לידה"}
                value={answers[3]?.answer ? new Date(answers[3].answer) : null}
                onChange={(date) => {
                  if (date) {
                    const formattedDate = date.toISOString().substring(0, 10);
                    handleAnswerChange(3, formattedDate);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required={isRequired(3)}
                    error={hasError(3)}
                    helperText={getErrorMessage(3)}
                    dir="rtl"
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth 
              required={isRequired(4)} 
              error={hasError(4)}
            >
              <InputLabel id="gender-label">מין</InputLabel>
              <Select
                labelId="gender-label"
                value={answers[4]?.answer || ''}
                onChange={(e) => handleAnswerChange(4, e.target.value)}
                label="מין"
              >
                <MenuItem value="זכר">זכר</MenuItem>
                <MenuItem value="נקבה">נקבה</MenuItem>
              </Select>
              {hasError(4) && <FormHelperText>{getErrorMessage(4)}</FormHelperText>}
            </FormControl>
          </Grid>
          
          {/* ת"ז וכתובת */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(5).questionText || "מספר תעודת זהות"}
              value={answers[5]?.answer || ''}
              onChange={(e) => handleAnswerChange(5, e.target.value)}
              required={isRequired(5)}
              error={hasError(5)}
              helperText={getErrorMessage(5)}
              dir="rtl"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(6).questionText || "כתובת"}
              value={answers[6]?.answer || ''}
              onChange={(e) => handleAnswerChange(6, e.target.value)}
              required={isRequired(6)}
              error={hasError(6)}
              helperText={getErrorMessage(6)}
              dir="rtl"
            />
          </Grid>
          
          {/* עיר וקופת חולים */}
          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth 
              required={isRequired(7)} 
              error={hasError(7)}
            >
              <InputLabel id="city-label">עיר</InputLabel>
              <Select
                labelId="city-label"
                value={answers[7]?.answer || ''}
                onChange={(e) => handleAnswerChange(7, e.target.value)}
                label="עיר"
              >
                <MenuItem value="חיפה">חיפה</MenuItem>
                <MenuItem value="תל אביב">תל אביב</MenuItem>
                <MenuItem value="ירושלים">ירושלים</MenuItem>
                <MenuItem value="באר שבע">באר שבע</MenuItem>
                <MenuItem value="כפר קרע">כפר קרע</MenuItem>
                <MenuItem value="אחר">אחר</MenuItem>
              </Select>
              {hasError(7) && <FormHelperText>{getErrorMessage(7)}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth 
              required={isRequired(8)} 
              error={hasError(8)}
            >
              <InputLabel id="health-insurance-label">קופת חולים</InputLabel>
              <Select
                labelId="health-insurance-label"
                value={answers[8]?.answer || ''}
                onChange={(e) => handleAnswerChange(8, e.target.value)}
                label="קופת חולים"
              >
                <MenuItem value="כללית">כללית</MenuItem>
                <MenuItem value="מכבי">מכבי</MenuItem>
                <MenuItem value="מאוחדת">מאוחדת</MenuItem>
                <MenuItem value="לאומית">לאומית</MenuItem>
                <MenuItem value="אחר">אחר</MenuItem>
              </Select>
              {hasError(8) && <FormHelperText>{getErrorMessage(8)}</FormHelperText>}
            </FormControl>
          </Grid>
          
          {/* תאריך קליטה ועו"ס מפנה */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={heLocale}>
              <DatePicker
                label={findQuestion(9).questionText || "תאריך קליטה מתוכנן"}
                value={answers[9]?.answer ? new Date(answers[9].answer) : null}
                onChange={(date) => {
                  if (date) {
                    const formattedDate = date.toISOString().substring(0, 10);
                    handleAnswerChange(9, formattedDate);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required={isRequired(9)}
                    error={hasError(9)}
                    helperText={getErrorMessage(9)}
                    dir="rtl"
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(10).questionText || "עו\"ס מפנה"}
              value={answers[10]?.answer || ''}
              onChange={(e) => handleAnswerChange(10, e.target.value)}
              required={isRequired(10)}
              error={hasError(10)}
              helperText={getErrorMessage(10)}
              dir="rtl"
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
          פרטי הורה 1
        </Typography>
        
        <Grid container spacing={3}>
          {/* שם ות"ז הורה 1 */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(12).questionText || "שם הורה 1"}
              value={answers[12]?.answer || ''}
              onChange={(e) => handleAnswerChange(12, e.target.value)}
              required={isRequired(12)}
              error={hasError(12)}
              helperText={getErrorMessage(12)}
              dir="rtl"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(13).questionText || "מספר תעודת זהות הורה 1"}
              value={answers[13]?.answer || ''}
              onChange={(e) => handleAnswerChange(13, e.target.value)}
              required={isRequired(13)}
              error={hasError(13)}
              helperText={getErrorMessage(13)}
              dir="rtl"
            />
          </Grid>
          
          {/* טלפון וכתובת הורה 1 */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(14).questionText || "טלפון נייד הורה 1"}
              value={answers[14]?.answer || ''}
              onChange={(e) => handleAnswerChange(14, e.target.value)}
              required={isRequired(14)}
              error={hasError(14)}
              helperText={getErrorMessage(14)}
              dir="rtl"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(15).questionText || "כתובת הורה 1 (אם שונה מהילד)"}
              value={answers[15]?.answer || ''}
              onChange={(e) => handleAnswerChange(15, e.target.value)}
              required={isRequired(15)}
              error={hasError(15)}
              helperText={getErrorMessage(15)}
              dir="rtl"
            />
          </Grid>
          
          {/* דוא"ל ותעסוקה הורה 1 */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(16).questionText || "דוא\"ל הורה 1"}
              type="email"
              value={answers[16]?.answer || ''}
              onChange={(e) => handleAnswerChange(16, e.target.value)}
              required={isRequired(16)}
              error={hasError(16)}
              helperText={getErrorMessage(16)}
              dir="rtl"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(17).questionText || "תעסוקה הורה 1"}
              value={answers[17]?.answer || ''}
              onChange={(e) => handleAnswerChange(17, e.target.value)}
              required={isRequired(17)}
              error={hasError(17)}
              helperText={getErrorMessage(17)}
              dir="rtl"
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
          פרטי הורה 2 (אופציונלי)
        </Typography>
        
        <Grid container spacing={3}>
          {/* שם ות"ז הורה 2 */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(18).questionText || "שם הורה 2"}
              value={answers[18]?.answer || ''}
              onChange={(e) => handleAnswerChange(18, e.target.value)}
              required={isRequired(18)}
              error={hasError(18)}
              helperText={getErrorMessage(18)}
              dir="rtl"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(19).questionText || "מספר תעודת זהות הורה 2"}
              value={answers[19]?.answer || ''}
              onChange={(e) => handleAnswerChange(19, e.target.value)}
              required={isRequired(19)}
              error={hasError(19)}
              helperText={getErrorMessage(19)}
              dir="rtl"
            />
          </Grid>
          
          {/* טלפון וכתובת הורה 2 */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(20).questionText || "טלפון נייד הורה 2"}
              value={answers[20]?.answer || ''}
              onChange={(e) => handleAnswerChange(20, e.target.value)}
              required={isRequired(20)}
              error={hasError(20)}
              helperText={getErrorMessage(20)}
              dir="rtl"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(21).questionText || "כתובת הורה 2 (אם שונה מהילד)"}
              value={answers[21]?.answer || ''}
              onChange={(e) => handleAnswerChange(21, e.target.value)}
              required={isRequired(21)}
              error={hasError(21)}
              helperText={getErrorMessage(21)}
              dir="rtl"
            />
          </Grid>
          
          {/* דוא"ל ותעסוקה הורה 2 */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(22).questionText || "דוא\"ל הורה 2"}
              type="email"
              value={answers[22]?.answer || ''}
              onChange={(e) => handleAnswerChange(22, e.target.value)}
              required={isRequired(22)}
              error={hasError(22)}
              helperText={getErrorMessage(22)}
              dir="rtl"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(23).questionText || "תעסוקה הורה 2"}
              value={answers[23]?.answer || ''}
              onChange={(e) => handleAnswerChange(23, e.target.value)}
              required={isRequired(23)}
              error={hasError(23)}
              helperText={getErrorMessage(23)}
              dir="rtl"
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
          פרטי קשר נוספים
        </Typography>
        
        <Grid container spacing={3}>
          {/* טלפון בבית ואיש קשר לחירום */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(24).questionText || "טלפון בבית"}
              value={answers[24]?.answer || ''}
              onChange={(e) => handleAnswerChange(24, e.target.value)}
              required={isRequired(24)}
              error={hasError(24)}
              helperText={getErrorMessage(24)}
              dir="rtl"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(25).questionText || "איש קשר במקרה חירום"}
              value={answers[25]?.answer || ''}
              onChange={(e) => handleAnswerChange(25, e.target.value)}
              required={isRequired(25)}
              error={hasError(25)}
              helperText={getErrorMessage(25)}
              dir="rtl"
            />
          </Grid>
          
          {/* טלפון איש קשר חירום */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={findQuestion(26).questionText || "טלפון איש קשר חירום"}
              value={answers[26]?.answer || ''}
              onChange={(e) => handleAnswerChange(26, e.target.value)}
              required={isRequired(26)}
              error={hasError(26)}
              helperText={getErrorMessage(26)}
              dir="rtl"
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default PersonalInfoForm;