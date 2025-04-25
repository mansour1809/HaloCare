import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Divider,
  Rating,
  Alert,
  CircularProgress,
  FormHelperText,
  Tooltip,
  Paper,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  ErrorOutline as ErrorIcon,
  AutoFixHigh as AutoFixIcon,
  FormatColorText as FormatTextIcon
} from '@mui/icons-material';
import { useTreatmentContext } from './TreatmentContext';
import { fetchTreatmentTypes } from '../../../Redux/features/treatmentTypesSlice';
import { useAuth } from '../../../components/login/AuthContext';
import Swal from 'sweetalert2';
import TreatmentValidations from '../../../utils/treatmentsValidation';
import axios from 'axios';

const AddTreatmentDialog = ({ kidId, treatmentType = null }) => {
  const { isAddDialogOpen, closeAddDialog, addTreatment, loading, error } = useTreatmentContext();
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  
  // שליפת סוגי טיפולים מהסטור
  const { treatmentTypes, status: treatmentTypesStatus } = useSelector(state => state.treatmentTypes);
  
  // מצב עבור ולידציות
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // מצב עבור העוזר החכם לכתיבה
  const [suggestion, setSuggestion] = useState('');
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [isImprovingText, setIsImprovingText] = useState(false);
  const [selectedTreatmentTypeId, setSelectedTreatmentTypeId] = useState(null);
  const typingTimeoutRef = useRef(null);
  const descriptionInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    kidId: kidId,
    employeeId: currentUser?.id || '',
    treatmentDate: new Date().toISOString().split('T')[0],
    treatmentType: treatmentType || '',
    description: '',
    cooperationLevel: 3,
    status: 'active',
    highlight: ''
  });
  
  // חישוב תאריך מינימלי (חצי שנה אחורה)
  const getSixMonthsAgo = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date.toISOString().split('T')[0];
  };
  
  // איפוס הטופס כאשר הדיאלוג נפתח
  useEffect(() => {
    if (isAddDialogOpen) {
      setFormData({
        kidId: kidId,
        employeeId: currentUser?.id || '',
        treatmentDate: new Date().toISOString().split('T')[0],
        treatmentType: treatmentType || '',
        description: '',
        cooperationLevel: 3,
        status: 'active',
        highlight: ''
      });
      setFormErrors({});
      setTouched({});
      setSuggestion('');
    }
  }, [isAddDialogOpen, kidId, treatmentType, currentUser]);
  
  // טעינת סוגי טיפולים
  useEffect(() => {
    if (isAddDialogOpen && treatmentTypesStatus === 'idle') {
      dispatch(fetchTreatmentTypes());
    }
  }, [isAddDialogOpen, dispatch, treatmentTypesStatus]);
  
  // טיפול בעדכון מזהה סוג הטיפול כאשר משתנה סוג הטיפול בפורם
  useEffect(() => {
    if (formData.treatmentType && treatmentTypes?.length > 0) {
      const selectedType = treatmentTypes.find(type => 
        type.treatmentTypeName === formData.treatmentType
      );
      
      if (selectedType) {
        setSelectedTreatmentTypeId(selectedType.id);
      }
    }
  }, [formData.treatmentType, treatmentTypes]);
  
  // בדיקת ולידציה לשדה בודד
  const validateField = (name, value) => {
    // הגדרת פרמטרים נוספים לולידציות
    const extraParams = {
      required: ['treatmentType', 'treatmentDate', 'description'].includes(name),
      minDate: name === 'treatmentDate' ? getSixMonthsAgo() : null,
      hebrewOnly: name === 'description' ? true : false
    };
    
    // הפעלת הולידציה המתאימה
    return TreatmentValidations(name, value, extraParams);
  };
  
  // בדיקת כל השדות בטופס
  const validateAllFields = () => {
    const newErrors = {};
    let isValid = true;
    
    // עבור על כל השדות בטופס ובדוק תקינות
    Object.keys(formData).forEach(field => {
      // בדיקת שדות רלוונטיים בלבד
      if (['treatmentType', 'treatmentDate', 'description', 'highlight', 'cooperationLevel'].includes(field)) {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });
    
    setFormErrors(newErrors);
    return isValid;
  };

  // קבלת הצעות להשלמת טקסט בזמן אמת
  const getSuggestions = async (text) => {
    if (!selectedTreatmentTypeId || !text.trim() || text.length < 5) {
      setSuggestion('');
      return;
    }
    
    try {
      setIsLoadingSuggestion(true);
      
      const response = await axios.post('/api/WritingAssistant/suggest', {
        currentText: text,
        treatmentTypeId: selectedTreatmentTypeId
      });
      
      if (response.data && response.data.suggestion) {
        setSuggestion(response.data.suggestion);
      } else {
        setSuggestion('');
      }
    } catch (error) {
      console.error('שגיאה בקבלת הצעות:', error);
      setSuggestion('');
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  // שיפור ניסוח מקצועי
  const improveText = async () => {
    if (!selectedTreatmentTypeId || !formData.description.trim()) {
      Swal.fire({
        title: 'שגיאה',
        text: 'יש להזין תיאור טיפול לפני שיפור הניסוח',
        icon: 'error',
        confirmButtonText: 'הבנתי',
        confirmButtonColor: '#3085d6',
        customClass: {
          container: 'swal-rtl'
        }
      });
      return;
    }
    
    try {
      setIsImprovingText(true);
      
      // הצגת טעינה
      Swal.fire({
        title: 'משפר ניסוח',
        text: 'מעבד את הטקסט לניסוח מקצועי יותר...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });
      
      const response = await axios.post('/api/WritingAssistant/improve', {
        text: formData.description,
        treatmentTypeId: selectedTreatmentTypeId
      });
      
      if (response.data && response.data.improvedText) {
        setFormData(prev => ({
          ...prev,
          description: response.data.improvedText
        }));
        
        // עדכון היילייט אם יש צורך
        if (!formData.highlight.trim()) {
          // חילוץ המשפט הראשון או פסקה ראשונה כהיילייט
          const firstSentence = response.data.improvedText.split('.')[0] + '.';
          setFormData(prev => ({
            ...prev,
            highlight: firstSentence
          }));
        }
        
        // הצגת הצלחה
        Swal.fire({
          title: 'הניסוח שופר',
          text: 'הטקסט עודכן לניסוח מקצועי יותר',
          icon: 'success',
          confirmButtonText: 'אישור',
          confirmButtonColor: '#3085d6',
          customClass: {
            container: 'swal-rtl'
          }
        });
      }
    } catch (error) {
      console.error('שגיאה בשיפור הניסוח:', error);
      
      // סגירת טעינה והצגת שגיאה
      Swal.fire({
        title: 'שגיאה',
        text: 'אירעה שגיאה בשיפור הניסוח המקצועי',
        icon: 'error',
        confirmButtonText: 'הבנתי',
        confirmButtonColor: '#3085d6',
        customClass: {
          container: 'swal-rtl'
        }
      });
    } finally {
      setIsImprovingText(false);
    }
  };

  // אישור והוספת ההשלמה המוצעת
  const acceptSuggestion = () => {
    if (!suggestion) return;
    
    // עדכון תיאור הטיפול עם ההשלמה
    setFormData(prev => ({
      ...prev,
      description: prev.description + suggestion
    }));
    
    // איפוס ההצעה
    setSuggestion('');
    
    // מיקוד בשדה התיאור
    if (descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // עדכון ערך בטופס
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // סימון השדה כנגוע (כלומר, המשתמש ניסה להזין ערך)
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // בדיקת ולידציה לשדה זה
    const error = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    // אם השדה הוא תיאור הטיפול, הגדר טיימר לקבלת הצעות
    if (name === 'description') {
      // ביטול טיימר קודם אם קיים
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // הגדרת טיימר חדש להצעות
      typingTimeoutRef.current = setTimeout(() => {
        // בדיקה שהטקסט מסתיים בנקודה או רווח כדי לא להציע בזמן הקלדה באמצע מילה
        if (value.trim() && (value.endsWith(' ') || value.endsWith('.') || value.endsWith(','))) {
          getSuggestions(value);
        } else {
          setSuggestion('');
        }
      }, 500); // המתן חצי שנייה לאחר הקלדה לפני בקשת הצעות
    }
  };
  
  const handleCooperationLevelChange = (event, newValue) => {
    // עדכון ערך בטופס
    setFormData(prev => ({
      ...prev,
      cooperationLevel: newValue
    }));
    
    // סימון השדה כנגוע
    setTouched(prev => ({
      ...prev,
      cooperationLevel: true
    }));
    
    // בדיקת ולידציה לשדה זה
    const error = validateField('cooperationLevel', newValue);
    setFormErrors(prev => ({
      ...prev,
      cooperationLevel: error
    }));
  };
  
  const handleBlur = (e) => {
    const { name } = e.target;
    
    // סימון השדה כנגוע
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // בדיקת ולידציה לשדה זה
    const error = validateField(name, formData[name]);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // סימון כל השדות כנגועים
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // בדיקת ולידציה לכל השדות
    if (!validateAllFields()) {
      // הצגת התראה SweetAlert
      Swal.fire({
        title: 'שגיאה בטופס',
        text: 'יש לתקן את השגיאות בטופס לפני שליחה',
        icon: 'error',
        confirmButtonText: 'הבנתי',
        confirmButtonColor: '#3085d6',
        customClass: {
          container: 'swal-rtl'
        }
      });
      return;
    }
    
    try {
      // הצגת טעינה
      Swal.fire({
        title: 'שומר נתונים',
        text: 'מוסיף את סיכום הטיפול...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });
      
      // שליחת הטופס
      await addTreatment(kidId, formData);
      
      // הצגת הצלחה
      Swal.fire({
        title: 'נשמר בהצלחה',
        text: 'סיכום הטיפול נשמר בהצלחה במערכת',
        icon: 'success',
        confirmButtonText: 'אישור',
        confirmButtonColor: '#3085d6',
        customClass: {
          container: 'swal-rtl'
        }
      });
      
      // סגירת הדיאלוג
      closeAddDialog();
    } catch (err) {
      // הצגת שגיאה
      Swal.fire({
        title: 'שגיאה',
        text: err.message || 'אירעה שגיאה בשמירת סיכום הטיפול',
        icon: 'error',
        confirmButtonText: 'הבנתי',
        confirmButtonColor: '#3085d6',
        customClass: {
          container: 'swal-rtl'
        }
      });
    }
  };
  
  return (
    <Dialog
      open={isAddDialogOpen}
      onClose={closeAddDialog}
      maxWidth="md"
      fullWidth
      dir="rtl"
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">הוספת סיכום טיפול</Typography>
        <Box>
          <IconButton edge="end" color="inherit" onClick={closeAddDialog} aria-label="סגור">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            {/* סוג טיפול */}
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                required 
                error={touched.treatmentType && Boolean(formErrors.treatmentType)}
              >
                <InputLabel>סוג טיפול</InputLabel>
                <Select
                  name="treatmentType"
                  value={formData.treatmentType}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  label="סוג טיפול"
                  disabled={loading || treatmentTypesStatus === 'loading'}
                >
                  <MenuItem value="">בחר סוג טיפול</MenuItem>
                  {treatmentTypesStatus === 'succeeded' && treatmentTypes.map((type) => (
                    <MenuItem key={type.treatmentTypeName} value={type.treatmentTypeName}>
                      {type.treatmentTypeName}
                    </MenuItem>
                  ))}
                </Select>
                {touched.treatmentType && formErrors.treatmentType && (
                  <FormHelperText error>{formErrors.treatmentType}</FormHelperText>
                )}
              </FormControl>
              {treatmentTypesStatus === 'loading' && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="caption">טוען סוגי טיפולים...</Typography>
                </Box>
              )}
            </Grid>
            
            {/* תאריך טיפול */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="תאריך טיפול"
                type="date"
                name="treatmentDate"
                value={formData.treatmentDate}
                onChange={handleInputChange}
                onBlur={handleBlur}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                disabled={loading}
                error={touched.treatmentDate && Boolean(formErrors.treatmentDate)}
                helperText={touched.treatmentDate && formErrors.treatmentDate}
                inputProps={{ max: new Date().toISOString().split('T')[0] }}
              />
            </Grid>
            
            {/* מידע על המטפל (מוצג כשדה קריאה בלבד) */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="מטפל"
                value={`${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`}
                fullWidth
                disabled
                helperText="הטיפול יירשם בשם המשתמש המחובר למערכת"
              />
            </Grid>
            
            {/* רמת שיתוף פעולה */}
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  רמת שיתוף פעולה
                </Typography>
                <Rating
                  name="cooperationLevel"
                  value={parseInt(formData.cooperationLevel) || 0}
                  onChange={handleCooperationLevelChange}
                  max={5}
                  disabled={loading}
                />
                {touched.cooperationLevel && formErrors.cooperationLevel && (
                  <FormHelperText error>{formErrors.cooperationLevel}</FormHelperText>
                )}
              </Box>
            </Grid>
            
            {/* תיאור הטיפול */}
            <Grid item xs={12}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  label="תיאור מהלך הטיפול"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  inputRef={descriptionInputRef}
                  fullWidth
                  multiline
                  rows={6}
                  required
                  disabled={loading || isImprovingText}
                  placeholder="תאר את מהלך הטיפול, תגובות הילד, והתקדמות ביחס לטיפולים קודמים..."
                  error={touched.description && Boolean(formErrors.description)}
                  helperText={touched.description && formErrors.description}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      marginBottom: suggestion ? 1 : 0
                    }
                  }}
                />
                
                {/* כפתור שיפור ניסוח */}
                <Tooltip title="שיפור ניסוח מקצועי - שדרג את הטקסט לניסוח מקצועי יותר">
                  <span>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<FormatTextIcon />}
                      onClick={improveText}
                      disabled={loading || isImprovingText || !formData.description.trim() || !selectedTreatmentTypeId}
                      sx={{ mt: 1, ml: 1 }}
                    >
                      {isImprovingText ? 'משפר ניסוח...' : 'שפר ניסוח מקצועי'}
                    </Button>
                  </span>
                </Tooltip>
                
                {/* הצגת הצעה להשלמה */}
                {suggestion && (
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      mt: 1, 
                      p: 2, 
                      bgcolor: 'rgba(25, 118, 210, 0.05)',
                      border: '1px solid rgba(25, 118, 210, 0.2)',
                      borderRadius: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AutoFixIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="primary" fontWeight="medium">
                          הצעה להשלמה:
                        </Typography>
                      </Box>
                      
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="primary" 
                        onClick={acceptSuggestion}
                      >
                        הוסף
                      </Button>
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 1, 
                        fontStyle: 'italic',
                        color: 'text.secondary'
                      }}
                    >
                      {suggestion}
                    </Typography>
                  </Paper>
                )}
                
                {isLoadingSuggestion && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, justifyContent: 'flex-end' }}>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      טוען הצעות...
                    </Typography>
                  </Box>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                  <AutoFixIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                  המערכת תציע השלמות חכמות בזמן הקלדה. לחיצה על "שפר ניסוח" תעדכן את הטקסט לניסוח מקצועי יותר.
                </Box>
              </Typography>
            </Grid>
            
            {/* נקודות חשובות */}
            <Grid item xs={12}>
              <TextField
                label="נקודות חשובות / היילייט"
                name="highlight"
                value={formData.highlight}
                onChange={handleInputChange}
                onBlur={handleBlur}
                fullWidth
                multiline
                rows={2}
                disabled={loading}
                placeholder="הוסף נקודות חשובות שיש לשים לב אליהן בטיפול הבא..."
                error={touched.highlight && Boolean(formErrors.highlight)}
                helperText={touched.highlight && formErrors.highlight}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <Divider />
        
        <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || isImprovingText}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {loading ? 'שומר...' : 'שמור'}
            </Button>
          </Box>
          
          <Box>
            <Button
              variant="outlined"
              onClick={closeAddDialog}
              disabled={loading}
            >
              ביטול
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddTreatmentDialog;