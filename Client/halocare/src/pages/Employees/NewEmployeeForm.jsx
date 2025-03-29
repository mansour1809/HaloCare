import { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Container, 
  Grid, 
  Typography, 
  Paper, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl,
  Box,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ContentCopy, Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';

// יצירת תמה מותאמת עם תמיכה בעברית
const theme = createTheme({
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

// פונקציה לייצור סיסמה אקראית
const generateRandomPassword = (length = 8) => {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  
  // מצב לשליחת מייל
  const [sendEmail, setSendEmail] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  
  // מצב לרשימת כיתות
  const [classes, setClasses] = useState([]);

  // מצב טופס התחלתי עם שמות השדות המתאימים לטבלה
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: null,
    mobilePhone: '',
    email: '',
    password: '',
    licenseNum: '',
    startDate: null,
    isActive: true,
    classId: '',
    roleName: '',
    // שדות נוספים שלא נשלחים ישירות לטבלה
    address: '',
    notes: '',
  });

  // טעינת רשימת כיתות
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/Classes');
        setClasses(response.data);
        setLoading(false);
      } catch (err) {
        console.error('שגיאה בטעינת רשימת הכיתות:', err);
        setError('שגיאה בטעינת רשימת הכיתות. אנא נסה שוב מאוחר יותר.');
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // פונקציה לייצור סיסמה
  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword(10);
    setGeneratedPassword(newPassword);
    setFormData(prevData => ({
      ...prevData,
      password: newPassword
    }));
    setPasswordCopied(false);
  };

  // פונקציה להעתקת הסיסמה ללוח
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 3000);
  };

  // טיפול בשינויים בשדות הטופס
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // טיפול בשינויי מתג
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: checked,
    }));
  };

  // טיפול בשינוי תאריכים
  const handleDateChange = (name, date) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: date,
    }));
  };

  // פונקציה לשליחת מייל
  const sendWelcomeEmail = async (email, password) => {
    try {
      // קריאה לשרת לשליחת מייל
      const response = await axios.post('http://localhost:5000/api/Employees/sendWelcomeEmail', {
        email,
        password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        loginUrl: 'http://your-app-url.com/login' // יש להחליף לכתובת האמיתית של האפליקציה
      });
      
      if (response.data.success) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 5000);
        return true;
      }
      return false;
    } catch (err) {
      console.error('שגיאה בשליחת המייל:', err);
      return false;
    }
  };

  // שליחת הטופס
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // בדיקת שדות חובה
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.roleName) {
      setError('יש למלא את כל שדות החובה');
      return;
    }
    
    // וידוא שיש סיסמה אם לא יצרנו
    if (!formData.password) {
      const autoPassword = generateRandomPassword(10);
      setFormData(prevData => ({
        ...prevData,
        password: autoPassword
      }));
      setGeneratedPassword(autoPassword);
    }
    
    try {
      setLoading(true);
      
      // יצירת אובייקט הנתונים לשליחה בהתאם לשמות השדות בטבלה
      const employeeData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formData.birthDate,
        mobilePhone: formData.mobilePhone,
        email: formData.email,
        password: formData.password,
        licenseNum: formData.licenseNum,
        startDate: formData.startDate,
        isActive: formData.isActive,
        classId: formData.classId ? parseInt(formData.classId) : null,
        roleName: formData.roleName
      };
      
      // שליחת נתוני העובד לשרת
      const response = await axios.post('http://localhost:5000/api/Employees', employeeData);
      
      console.log('תגובת השרת:', response.data);
      
      // שליחת מייל אם האפשרות מסומנת
      if (sendEmail && formData.email) {
        await sendWelcomeEmail(formData.email, formData.password);
      }
      
      // הצגת הודעת הצלחה
      setError("");
      alert("העובד נוסף בהצלחה!");
      
      // איפוס הטופס לאחר שליחה מוצלחת
      setFormData({
        firstName: '',
        lastName: '',
        birthDate: null,
        mobilePhone: '',
        email: '',
        password: '',
        licenseNum: '',
        startDate: null,
        isActive: true,
        classId: '',
        roleName: '',
        address: '',
        notes: ''
      });
      setGeneratedPassword("");
      
    } catch (err) {
      console.error('שגיאה בשליחת הטופס:', err);
      setError(err.response?.data?.message || 'שגיאה בשליחת הטופס. אנא בדוק את הנתונים ונסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
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
            
            <form onSubmit={handleSubmit}>
              {/* חלק 1: פרטים אישיים */}
              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#4cb5c3', fontWeight: 'bold', marginBottom: 2 }}>
                  פרטים אישיים
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="שם פרטי *"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      sx={{ marginBottom: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="שם משפחה *"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      sx={{ marginBottom: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="תאריך לידה"
                      value={formData.birthDate}
                      onChange={(date) => handleDateChange('birthDate', date)}
                      slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="מספר רישיון"
                      name="licenseNum"
                      value={formData.licenseNum}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{ marginBottom: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="כתובת"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{ marginBottom: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="טלפון נייד"
                      name="mobilePhone"
                      value={formData.mobilePhone}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{ marginBottom: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="דוא״ל *"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      sx={{ marginBottom: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ marginBottom: 2 }}>
                      <TextField
                        fullWidth
                        label="סיסמה ראשונית"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        variant="outlined"
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
                                disabled={!generatedPassword}
                                edge="end"
                              >
                                <ContentCopy />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button 
                        onClick={handleGeneratePassword}
                        variant="outlined" 
                        sx={{ mt: 1 }}
                      >
                        ייצר סיסמה אקראית
                      </Button>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Switch checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />}
                      label="שלח אימייל לעובד עם פרטי הכניסה"
                    />
                    <Typography variant="caption" color="text.secondary">
                      אימייל יישלח לעובד עם הסיסמה הראשונית ולינק לכניסה למערכת
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              {/* חלק 2: פרטי העסקה */}
              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#4cb5c3', fontWeight: 'bold', marginBottom: 2 }}>
                  פרטי העסקה
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                      <InputLabel>תפקיד *</InputLabel>
                      <Select
                        name="roleName"
                        value={formData.roleName}
                        onChange={handleChange}
                        label="תפקיד *"
                        required
                      >
                        <MenuItem value="גננת">גננת</MenuItem>
                        <MenuItem value="סייעת">סייעת</MenuItem>
                        <MenuItem value="מטפל/ת">מטפל/ת</MenuItem>
                        <MenuItem value="מנהל/ת">מנהל/ת</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="תחילת עבודה"
                      value={formData.startDate}
                      onChange={(date) => handleDateChange('startDate', date)}
                      slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                      <InputLabel>שיוך לכיתה</InputLabel>
                      <Select
                        name="classId"
                        value={formData.classId}
                        onChange={handleChange}
                        label="שיוך לכיתה"
                      >
                        <MenuItem value="">ללא שיוך</MenuItem>
                        {classes.map((cls) => (
                          <MenuItem key={cls.classId} value={cls.classId}>
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
                          checked={formData.isActive}
                          onChange={handleSwitchChange}
                          color="primary"
                        />
                      }
                      label="עובד פעיל"
                    />
                  </Grid>
                </Grid>
              </Box>
              
              {/* הערות נוספות */}
              <Box sx={{ marginBottom: 4 }}>
                <Typography variant="subtitle1" sx={{ color: '#4cb5c3', fontWeight: 'bold', marginBottom: 2 }}>
                  הערות נוספות
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  variant="outlined"
                />
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
                  {loading ? 'שומר...' : 'שמירה'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Container>
      </LocalizationProvider>
      
      <Snackbar
        open={passwordCopied}
        autoHideDuration={3000}
        onClose={() => setPasswordCopied(false)}
        message="הסיסמה הועתקה ללוח"
      />
      
      <Snackbar
        open={emailSent}
        autoHideDuration={5000}
        onClose={() => setEmailSent(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          מייל נשלח בהצלחה לכתובת {formData.email}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default NewEmployeeForm;