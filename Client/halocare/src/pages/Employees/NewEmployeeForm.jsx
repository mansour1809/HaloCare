// NewEmployeeForm.jsx
import  { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Button, Grid, Box, 
  TextField, FormControl, InputLabel, Select, MenuItem, 
  FormControlLabel, Switch, CircularProgress, Alert,
  InputAdornment, IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { Visibility, VisibilityOff, ContentCopy } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';

// יצירת תמה מותאמת לעברית
const rtlTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, Arial, sans-serif',
  },
  palette: {
    primary: {
      main: '#4cb5c3',
    },
  },
});

// קבוע לכתובת ה-API
const API_URL = 'https://localhost:7225/api';

// פונקציה ליצירת סיסמה אקראית
const generateRandomPassword = (length = 10) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }
  
  return password;
};

const NewEmployeeForm = () => {
  // מצבי טעינה והודעות
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // נתונים מהשרת
  const [questions, setQuestions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [roles, setRoles] = useState([]);
  
  // נתוני טופס
  const [formData, setFormData] = useState({});
  
  // הגדרות סיסמה
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  
  // טעינת נתונים בטעינת הדף
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // טעינת שאלות הטופס
        const questionsResponse = await axios.get(`${API_URL}/Forms/1/questions`);
        
        // טעינת כיתות
        const classesResponse = await axios.get(`${API_URL}/Classes`);
        
        // טעינת תפקידים
        const rolesResponse = await axios.get(`${API_URL}/ReferenceData/roles`);
        

        console.log(rolesResponse.data)
        // עדכון הסטייט
        setQuestions(questionsResponse.data || []);
        setClasses(classesResponse.data || []);
        setRoles(rolesResponse.data || []);
        
        // יצירת אובייקט התחלתי לפי השאלות
        const initialFormData = {};
        
        // אתחול ערכים ראשוניים
        questionsResponse.data.forEach(question => {
          if (question.questionText.includes('פעיל')) {
            initialFormData[question.questionText] = true;
          } else {
            initialFormData[question.questionText] = '';
          }
        });
        
        // הוספת שדות שלא בשאלות
        initialFormData.isActive = true;
        initialFormData.classId = '';
        initialFormData.roleName = '';
        
        setFormData(initialFormData);
        setLoading(false);
      } catch (err) {
        console.error('שגיאה בטעינת נתונים:', err);
        setError('שגיאה בטעינת נתוני הטופס. אנא נסה שוב מאוחר יותר.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // פונקציות טיפול בשינויים
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };
  
  // יצירת סיסמה אקראית
  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setFormData(prev => ({ ...prev, password: newPassword }));
  };
  
  // העתקת סיסמה ללוח
  const handleCopyPassword = () => {
    if (formData.password) {
      navigator.clipboard.writeText(formData.password);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 3000);
    }
  };
  
  // שליחת אימייל לעובד
  const sendWelcomeEmail = async (email, password, firstName, lastName) => {
    try {
      const response = await axios.post(`${API_URL}/Employees/sendWelcomeEmail`, {
        email,
        password,
        firstName,
        lastName,
        loginUrl: window.location.origin + '/login'
      });
      
      return response.data.success;
    } catch (err) {
      console.error('שגיאה בשליחת המייל:', err);
      return false;
    }
  };
  
  // שליחת הטופס
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // בדיקת שדות חובה
    const mandatoryQuestions = questions.filter(q => q.isMandatory);
    const missingFields = mandatoryQuestions.filter(q => !formData[q.questionText]);
    
    if (missingFields.length > 0) {
      setError(`יש למלא את כל שדות החובה: ${missingFields.map(q => q.questionText).join(', ')}`);
      return;
    }
    
    // וידוא שיש סיסמה
    if (!formData.password) {
      const autoPassword = generateRandomPassword();
      setFormData(prev => ({ ...prev, password: autoPassword }));
    }
    
    try {
      setLoading(true);
      
      // הכנת הנתונים לשליחה
      const employeeData = {
        ...formData
      };
      
      // שליחת הנתונים לשרת
      const response = await axios.post(`${API_URL}/Employees`, employeeData);
      
      // שליחת מייל אם האפשרות מסומנת
      if (sendEmail && formData.email) {
        await sendWelcomeEmail(
          formData.email, 
          formData.password,
          formData.firstName,
          formData.lastName
        );
      }
      
      // איפוס הטופס
      const resetForm = {};
      Object.keys(formData).forEach(key => {
        if (key === 'isActive') {
          resetForm[key] = true;
        } else if (key.includes('פעיל')) {
          resetForm[key] = true;
        } else {
          resetForm[key] = '';
        }
      });
      
      setFormData(resetForm);
      setSuccess(true);
      setError("");
      
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
      
    } catch (err) {
      console.error('שגיאה בשליחת הטופס:', err);
      setError(err.response?.data?.message || 'שגיאה בשליחת הטופס. אנא בדוק את הנתונים ונסה שוב.');
    } finally {
      setLoading(false);
    }
  };
  
  // פונקציה לרינדור שדה לפי סוג השאלה
  const renderField = (question) => {
    const { questionText, isMandatory, isOpen, possibleValues, hasOther } = question;
    
    // בדיקה האם השאלה מתייחסת לתאריך
    const isDateField = questionText.toLowerCase().includes('תאריך');
    
    // בדיקה האם השאלה מתייחסת לאימייל
    const isEmailField = questionText.toLowerCase().includes('מייל') || 
                          questionText.toLowerCase().includes('אימייל');
    
    // בדיקה האם השאלה מתייחסת לטלפון
    const isPhoneField = questionText.toLowerCase().includes('טלפון');
    
    // בדיקה האם השאלה מתייחסת לסטטוס פעיל/לא פעיל
    const isActiveField = questionText.toLowerCase().includes('פעיל');
    
    // בדיקה האם זו שאלה עם אפשרויות בחירה
    const isSelectField = !isOpen && possibleValues && possibleValues.length > 0;
    
    // פיצול אפשרויות בחירה אם יש
    let options = [];
    if (isSelectField) {
      options = possibleValues.split(',').map(option => option.trim());
    }
    
    // רינדור לפי סוג
    if (isDateField) {
      return (
        <DatePicker
          label={`${questionText}${isMandatory ? ' *' : ''}`}
          value={formData[questionText] || null}
          onChange={(date) => handleDateChange(questionText, date)}
          slotProps={{ 
            textField: { 
              fullWidth: true, 
              variant: "outlined",
              required: isMandatory
            } 
          }}
        />
      );
    } else if (isSelectField) {
      return (
        <FormControl fullWidth variant="outlined">
          <InputLabel>{`${questionText}${isMandatory ? ' *' : ''}`}</InputLabel>
          <Select
            name={questionText}
            value={formData[questionText] || ''}
            onChange={handleChange}
            label={`${questionText}${isMandatory ? ' *' : ''}`}
            required={isMandatory}
          >
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
            {hasOther && <MenuItem value="אחר">אחר</MenuItem>}
          </Select>
        </FormControl>
      );
    } else if (isActiveField) {
      return (
        <FormControlLabel
          control={
            <Switch
              name={questionText}
              checked={Boolean(formData[questionText])}
              onChange={handleSwitchChange}
              color="primary"
            />
          }
          label={questionText}
        />
      );
    } else {
      return (
        <TextField
          fullWidth
          label={`${questionText}${isMandatory ? ' *' : ''}`}
          name={questionText}
          type={isEmailField ? 'email' : isPhoneField ? 'tel' : 'text'}
          value={formData[questionText] || ''}
          onChange={handleChange}
          variant="outlined"
          required={isMandatory}
        />
      );
    }
  };
  
  // בזמן טעינה
  if (loading && !questions.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // מיון שאלות לפי קטגוריות
  const personalQuestions = questions.filter(q => q.category === 'personal');
  const employmentQuestions = questions.filter(q => q.category === 'employment');
  const otherQuestions = questions.filter(q => q.category !== 'personal' && q.category !== 'employment');
  
  return (
    <ThemeProvider theme={rtlTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
        <Container maxWidth="md" dir="rtl">
          <Paper elevation={3} sx={{ padding: 3, marginTop: 4, marginBottom: 4 }}>
            <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
              קליטת עובד חדש
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ marginBottom: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ marginBottom: 2 }}>
                העובד נוסף בהצלחה!
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* פרטים אישיים */}
              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#4cb5c3', fontWeight: 'bold', marginBottom: 2 }}>
                  פרטים אישיים
                </Typography>
                
                <Grid container spacing={2}>
                  {personalQuestions.map((question) => (
                    <Grid item xs={12} md={6} key={question.questionNo}>
                      {renderField(question)}
                    </Grid>
                  ))}
                </Grid>
              </Box>
              
              {/* פרטי העסקה */}
              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#4cb5c3', fontWeight: 'bold', marginBottom: 2 }}>
                  פרטי העסקה
                </Typography>
                
                <Grid container spacing={2}>
                  {employmentQuestions.map((question) => (
                    <Grid item xs={12} md={6} key={question.questionNo}>
                      {renderField(question)}
                    </Grid>
                  ))}
                  
                  {/* שדות קבועים נוספים */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>תפקיד *</InputLabel>
                      <Select
                        name="roleName"
                        value={formData.roleName || ''}
                        onChange={handleChange}
                        label="תפקיד *"
                        required
                      >
                        {roles.map((role) => (
                          <MenuItem key={role.id} value={role.roleName}>
                            {role.roleName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>שיוך לכיתה</InputLabel>
                      <Select
                        name="classId"
                        value={formData.classId || ''}
                        onChange={handleChange}
                        label="שיוך לכיתה"
                      >
                        <MenuItem value="">ללא שיוך</MenuItem>
                        {classes.map((cls) => (
                          <MenuItem key={cls.id} value={cls.id}>
                            {cls.className}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="isActive"
                          checked={Boolean(formData.isActive)}
                          onChange={handleSwitchChange}
                          color="primary"
                        />
                      }
                      label="עובד פעיל"
                    />
                  </Grid>
                </Grid>
              </Box>
              
              {/* שאלות אחרות אם יש */}
              {otherQuestions.length > 0 && (
                <Box sx={{ marginBottom: 3 }}>
                  <Typography variant="subtitle1" sx={{ color: '#4cb5c3', fontWeight: 'bold', marginBottom: 2 }}>
                    פרטים נוספים
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {otherQuestions.map((question) => (
                      <Grid item xs={12} md={6} key={question.questionNo}>
                        {renderField(question)}
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              
              {/* פרטי התחברות - תמיד מוצג */}
              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#4cb5c3', fontWeight: 'bold', marginBottom: 2 }}>
                  פרטי כניסה למערכת
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="סיסמה ראשונית *"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password || ''}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                            <IconButton
                              onClick={handleCopyPassword}
                              disabled={!formData.password}
                              edge="end"
                            >
                              <ContentCopy />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    {passwordCopied && (
                      <Typography variant="caption" color="success.main">
                        הסיסמה הועתקה ללוח
                      </Typography>
                    )}
                    
                    <Button 
                      onClick={handleGeneratePassword}
                      variant="outlined" 
                      sx={{ mt: 1 }}
                    >
                      ייצר סיסמה אקראית
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={sendEmail}
                          onChange={(e) => setSendEmail(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="שלח אימייל לעובד עם פרטי הכניסה"
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      אימייל יישלח לעובד עם הסיסמה הראשונית ולינק לכניסה למערכת
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  sx={{ 
                    paddingX: 4, 
                    paddingY: 1,
                    fontSize: '1rem',
                    borderRadius: 2
                  }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'שמירת עובד חדש'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default NewEmployeeForm;