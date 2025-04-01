// src/components/NewEmployeeForm.jsx
import { useState } from 'react';
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
import { Visibility, VisibilityOff, ContentCopy, CloudUpload } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from './EmployeesContext';

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

const NewEmployeeForm = () => {
  const navigate = useNavigate();
  
  // שימוש בקונטקסט
  const { 
    addEmployee, 
    sendWelcomeEmail, 
    generateRandomPassword, 
    roles, 
    classes, 
    loading 
  } = useEmployees();
  
  // מצבי טעינה והודעות
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // נתוני טופס
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobilePhone: '',
    birthDate: null,
    licenseNum: '',
    startDate: new Date(),
    roleName: '',
    classId: '',
    password: '',
    isActive: true
  });
  
  // קבצים ותמונה
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [documents, setDocuments] = useState([]);
  
  // הגדרות סיסמה וממשק
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  
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
  
  // טיפול בקבצים
  const handleProfilePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
    }
  };
  
  const handleDocumentsChange = (e) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
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
  
  // וולידציה של הטופס
  const validateForm = () => {
    // בדיקת שדות חובה
    const requiredFields = ['firstName', 'lastName', 'roleName', 'password'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`יש למלא את כל שדות החובה: ${missingFields.join(', ')}`);
      return false;
    }
    
    // וולידציה נוספת כאן, למשל אימייל תקין, פורמט טלפון וכו'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('כתובת האימייל אינה תקינה');
      return false;
    }
    
    return true;
  };
  
  // שליחת הטופס
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError("");
      
      // לעת עתה, מתעלמים מהעלאת קבצים כיוון שטרם מומש בשרת
      // בעתיד נוסיף קוד להעלאת התמונה והמסמכים
      
      // הכנת הנתונים לשליחה
      const employeeData = {
        ...formData,
        // בינתיים מתעלמים משדות הקבצים
        photoPath: profilePhoto ? profilePhoto.name : null,
      };
      
      // שליחה דרך הקונטקסט
      const result = await addEmployee(employeeData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
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
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        mobilePhone: '',
        birthDate: null,
        licenseNum: '',
        startDate: new Date(),
        roleName: '',
        classId: '',
        password: '',
        isActive: true
      });
      setProfilePhoto(null);
      setDocuments([]);
      
      setSuccess(true);
      
      // מעבר לרשימת העובדים אחרי הוספה מוצלחת
      setTimeout(() => {
        navigate('/employees');
      }, 2000);
      
    } catch (err) {
      console.error('שגיאה בשליחת הטופס:', err);
      setError(err.message || 'שגיאה בשליחת הטופס. אנא בדוק את הנתונים ונסה שוב.');
    } finally {
      setSubmitting(false);
    }
  };
  
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
                העובד נוסף בהצלחה! מעביר לרשימת העובדים...
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* פרטים אישיים */}
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
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="תאריך לידה"
                      value={formData.birthDate}
                      onChange={(date) => handleDateChange('birthDate', date)}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true, 
                          variant: "outlined"
                        } 
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="טלפון נייד"
                      name="mobilePhone"
                      type="tel"
                      value={formData.mobilePhone}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="דוא״ל"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUpload />}
                      sx={{ height: '56px', width: '100%' }}
                    >
                      {profilePhoto ? 'תמונה נבחרה' : 'העלאת תמונת פרופיל'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleProfilePhotoChange}
                      />
                    </Button>
                    {profilePhoto && (
                      <Typography variant="caption" display="block">
                        {profilePhoto.name}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>
              
              {/* פרטי העסקה */}
              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#4cb5c3', fontWeight: 'bold', marginBottom: 2 }}>
                  פרטי העסקה
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined" required>
                      <InputLabel>תפקיד *</InputLabel>
                      <Select
                        name="roleName"
                        value={formData.roleName}
                        onChange={handleChange}
                        label="תפקיד *"
                      >
                        {roles.map((role) => (
                          <MenuItem key={role.roleName} value={role.roleName}>
                            {role.roleName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="מספר רישיון"
                      name="licenseNum"
                      value={formData.licenseNum}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="תאריך תחילת עבודה"
                      value={formData.startDate}
                      onChange={(date) => handleDateChange('startDate', date)}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true, 
                          variant: "outlined"
                        } 
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>שיוך לכיתה</InputLabel>
                      <Select
                        name="classId"
                        value={formData.classId}
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
                          checked={formData.isActive}
                          onChange={handleSwitchChange}
                          color="primary"
                        />
                      }
                      label="עובד פעיל"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUpload />}
                      sx={{ height: '56px', width: '100%' }}
                    >
                      {documents.length > 0 ? `${documents.length} מסמכים נבחרו` : 'העלאת מסמכים'}
                      <input
                        type="file"
                        hidden
                        multiple
                        onChange={handleDocumentsChange}
                      />
                    </Button>
                    {documents.length > 0 && (
                      <Typography variant="caption" display="block">
                        {documents.map(doc => doc.name).join(', ')}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>
              
              {/* פרטי כניסה למערכת */}
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
                      value={formData.password}
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
                      sx={{ mt: 1, mb: 2 }}
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
                          disabled={!formData.email}
                        />
                      }
                      label="שלח אימייל לעובד עם פרטי הכניסה"
                    />
                    {!formData.email && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        יש להזין כתובת אימייל כדי לשלוח פרטי כניסה
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/employees')}
                  disabled={submitting}
                >
                  חזרה לרשימה
                </Button>
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
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : 'שמירת עובד חדש'}
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