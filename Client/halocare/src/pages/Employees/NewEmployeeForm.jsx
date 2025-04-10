import { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Button, Grid, Box, 
  TextField, FormControl, InputLabel, Select, MenuItem, 
  FormControlLabel, Switch, CircularProgress,
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
import { useSelector, useDispatch } from 'react-redux';
import Validations from './validations';
import { fetchCities } from '../../Redux/features/citiesSlice';
import Swal from 'sweetalert2';

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

// ערכים ראשוניים לטופס
const initialFormData = {
  firstName: '',
  lastName: '',
  email: '',
  mobilePhone: '',
  cityName: '',
  photo: '',
  birthDate: null,
  licenseNum: '',
  startDate: new Date(),
  roleName: '',
  classId: '',
  password: '',
  isActive: true
};

const NewEmployeeForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // שימוש בקונטקסט ובנתונים מ-Redux
  const { 
    addEmployee, 
    sendWelcomeEmail, 
    generateRandomPassword, 
    roles, 
    classes, 
  } = useEmployees();
  
  // קבלת רשימת הערים מ-Redux
  const { cities, status } = useSelector((state) => state.cities);

  // מצבי טופס
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  
  // קבצים ותמונה
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [documents, setDocuments] = useState([]);
  
  // טעינת רשימת הערים כאשר הקומפוננטה נטענת
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCities());
    }
  }, [status, dispatch]);
  
  // פונקציות טיפול בטופס
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
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
  
  // ניהול סיסמה
  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setFormData(prev => ({ ...prev, password: newPassword }));
    validateField('password', newPassword);
  };
  
  // const handleCopyPassword = () => {
  //   if (formData.password) {
  //     navigator.clipboard.writeText(formData.password);
  //     setPasswordCopied(true);
      
  //     Swal.fire({
  //       title: 'הסיסמה הועתקה',
  //       text: 'הסיסמה הועתקה ללוח בהצלחה',
  //       icon: 'success',
  //       timer: 1500,
  //       showConfirmButton: false,
  //       position: 'top-end',
  //       toast: true
  //     });
      
  //     setTimeout(() => setPasswordCopied(false), 1500);
  //   }
  // };
  
  // פונקציות ולידציה
  const validateField = (name, value) => {
    const extraParams = {
      required: ['firstName', 'lastName', 'password', 'roleName'].includes(name)
    };
    
    const error = Validations(name, value, extraParams);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    return !error;
  };

  const validateForm = () => {
    // רשימת השדות שרוצים לבדוק
    const fieldsToValidate = ['firstName', 'lastName', 'email', 'mobilePhone', 'password', 'roleName'];
    let isValid = true;
    const newErrors = {};
    
    // בדיקת כל השדות
    for (const field of fieldsToValidate) {
      const extraParams = {
        required: ['firstName', 'lastName', 'password', 'roleName'].includes(field)
      };
      
      const error = Validations(field, formData[field], extraParams);
      
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }
    
    // בדיקת אימייל אם מסומן לשלוח אימייל
    if (sendEmail && !formData.email) {
      newErrors.email = 'יש להזין אימייל כדי לשלוח פרטי כניסה';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // שליחת הטופס
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // בדיקת ולידציה מלאה
    if (!validateForm()) {
      Swal.fire({
        title: 'שגיאה בטופס',
        text: 'יש לתקן את השגיאות המסומנות',
        icon: 'error',
        confirmButtonText: 'אישור'
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // הכנת הנתונים לשליחה
      const employeeData = {
        ...formData,
        photo: profilePhoto ? profilePhoto.name : null,
        employeeId: 0,
        classId: formData.classId || null
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
      
      // הצגת הודעת הצלחה
      Swal.fire({
        title: 'העובד נוסף בהצלחה!',
        text: 'מעביר לרשימת העובדים...',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      // מעבר לרשימת העובדים אחרי הוספה מוצלחת
      setTimeout(() => {
        navigate('/employees');
      }, 2000);
      
    } catch (err) {
      console.error('שגיאה בשליחת הטופס:', err);
      
      Swal.fire({
        title: 'שגיאה בשליחת הטופס',
        text: err.message || 'אנא בדוק את הנתונים ונסה שוב',
        icon: 'error',
        confirmButtonText: 'אישור'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // פונקציות עזר להצגת שגיאות
  const getFieldError = (fieldName) => errors[fieldName] || '';
  const hasFieldError = (fieldName) => Boolean(errors[fieldName]);
  
  return (
    <ThemeProvider theme={rtlTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
        <Container maxWidth="md" dir="rtl">
          <Paper
            elevation={3}
            sx={{ padding: 3, marginTop: 4, marginBottom: 4 }}
          >
            <Typography
              variant="h5"
              component="h1"
              gutterBottom
              align="center"
              sx={{ fontWeight: "bold", color: "#333" }}
            >
              קליטת עובד חדש
            </Typography>

            <form onSubmit={handleSubmit}>
              {/* פרטים אישיים */}
              <Box sx={{ marginBottom: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#4cb5c3", fontWeight: "bold", marginBottom: 2 }}
                >
                  פרטים אישיים
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="שם פרטי"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      error={hasFieldError("firstName")}
                      helperText={getFieldError("firstName")}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="שם משפחה"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      error={hasFieldError("lastName")}
                      helperText={getFieldError("lastName")}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="תאריך לידה"
                      value={formData.birthDate}
                      onChange={(date) => handleDateChange("birthDate", date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "outlined",
                        },
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
                      error={hasFieldError("mobilePhone")}
                      helperText={getFieldError("mobilePhone")}
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
                      error={hasFieldError("email")}
                      helperText={getFieldError("email")}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      error={hasFieldError("cityName")}
                    >
                      <InputLabel>עיר</InputLabel>
                      <Select
                        name="cityName"
                        value={formData.cityName}
                        onChange={handleChange}
                        label="עיר"
                      >
                        {status === "loading" && (
                          <MenuItem disabled>טוען ערים...</MenuItem>
                        )}

                        {status === "succeeded" &&
                          cities.map((city) => (
                            <MenuItem key={city.cityName} value={city.cityName}>
                              {city.cityName}
                            </MenuItem>
                          ))}

                        {status === "failed" && (
                          <MenuItem disabled>שגיאה בטעינת ערים</MenuItem>
                        )}
                      </Select>
                      {hasFieldError("cityName") && (
                        <Typography variant="caption" color="error">
                          {getFieldError("cityName")}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUpload />}
                      sx={{ height: "56px", width: "100%" }}
                    >
                      {profilePhoto ? "תמונה נבחרה" : "העלאת תמונת פרופיל"}
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
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#4cb5c3", fontWeight: "bold", marginBottom: 2 }}
                >
                  פרטי העסקה
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      required
                      error={hasFieldError("roleName")}
                    >
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
                      {hasFieldError("roleName") && (
                        <Typography variant="caption" color="error">
                          {getFieldError("roleName")}
                        </Typography>
                      )}
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
                      error={hasFieldError("licenseNum")}
                      helperText={getFieldError("licenseNum")}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="תאריך תחילת עבודה"
                      value={formData.startDate}
                      onChange={(date) => handleDateChange("startDate", date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "outlined",
                        },
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

                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUpload />}
                      sx={{ height: "56px", width: "100%" }}
                    >
                      {documents.length > 0
                        ? `${documents.length} מסמכים נבחרו`
                        : "העלאת מסמכים"}
                      <input
                        type="file"
                        hidden
                        multiple
                        onChange={handleDocumentsChange}
                      />
                    </Button>
                    {documents.length > 0 && (
                      <Typography variant="caption" display="block">
                        {documents.map((doc) => doc.name).join(", ")}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>

              {/* פרטי כניסה למערכת */}
              <Box sx={{ marginBottom: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#4cb5c3", fontWeight: "bold", marginBottom: 2 }}
                >
                  פרטי כניסה למערכת
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="סיסמה ראשונית *"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      error={hasFieldError("password")}
                      helperText={getFieldError("password")}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
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
                    {!formData.email && sendEmail && (
                      <Typography
                        variant="caption"
                        color="error"
                        display="block"
                      >
                        יש להזין כתובת אימייל כדי לשלוח פרטי כניסה
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/employees")}
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
                    fontSize: "1rem",
                    borderRadius: 2,
                  }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <CircularProgress size={24} />
                  ) : (
                    "שמירת עובד חדש"
                  )}
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