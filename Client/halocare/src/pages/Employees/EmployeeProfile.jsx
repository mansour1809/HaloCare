import { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Button, Grid, Box, 
  TextField, FormControl, InputLabel, Select, MenuItem, 
  CircularProgress, InputAdornment, IconButton, Divider, Alert,
  Avatar, Chip, Card, CardContent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { format } from 'date-fns';
import { 
  Visibility, VisibilityOff, CloudUpload, Person, Email, Phone, 
  LocationOn, Edit, Check, Close, Cake, Lock, CameraAlt, Save
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useEmployees } from './EmployeesContext';
import { useAuth } from '../../components/login/AuthContext';
import { useDispatch } from 'react-redux';
import { deleteDocument, fetchDocumentsByEmployeeId, uploadDocument } from '../../Redux/features/documentsSlice';
import Swal from 'sweetalert2';
import { baseURL } from "../../components/common/axiosConfig";

// תמה מותאמת עם פונט שונה ועיצוב מודרני
const rtlTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: '"Heebo", "Segoe UI", "Roboto", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2.2rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.6rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.3rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1.1rem',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.95rem',
    }
  },
  palette: {
    primary: {
      main: '#4cb5c3',
      light: '#7ec8d3',
      dark: '#2a8a95',
    },
    secondary: {
      main: '#ff7043',
      light: '#ff9575',
      dark: '#c63f17',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#2d3748',
      secondary: '#718096',
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

const EmployeeProfile = ({ onUpdateSuccess }) => {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  
  const { 
    updateEmployee,
    generateRandomPassword,
    cities,
  } = useEmployees();
  
  // מצב טופס
  const [formData, setFormData] = useState(() => {
    // השתמש בקוד שלך שעובד
    const employeeId = currentUser?.employeeId ||
                      JSON.parse(localStorage.getItem('user'))?.id;
    
    return {
      employeeId: employeeId || '',
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      email: currentUser?.email || '',
      mobilePhone: currentUser?.mobilePhone || '',
      cityName: currentUser?.cityName || '',
      birthDate: currentUser?.birthDate ? new Date(currentUser.birthDate) : null,
      photo: currentUser?.photo || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      // הוספת השדות הנדרשים
      password: currentUser?.password || '',
      roleName: currentUser?.roleName || currentUser?.role || '',
      licenseNum: currentUser?.licenseNum || currentUser?.license || ''
    };
  });

  // מצבי עריכה
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // עדכון נתונים כשהמשתמש משתנה
  useEffect(() => {
    if (currentUser) {
      console.log('currentUser נתונים:', currentUser); // בדיקה מה יש במשתמש
      
      // נסה לקחת employeeId השתמש בקוד שלך שעובד
      const employeeId = currentUser.employeeId ||
                        JSON.parse(localStorage.getItem('user'))?.id;
      
      setFormData({
        employeeId: employeeId || '',
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        mobilePhone: currentUser.mobilePhone || '',
        cityName: currentUser.cityName || '',
        birthDate: currentUser.birthDate ? new Date(currentUser.birthDate) : null,
        photo: currentUser.photo || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        // הוספת השדות הנדרשים
        password: currentUser.password || '',
        roleName: currentUser.roleName || currentUser.role || '',
        licenseNum: currentUser.licenseNum || currentUser.license || ''
      });
    }
  }, [currentUser]);

  // פונקציות עריכה
  const startEditingField = (fieldName) => {
    setEditingField(fieldName);
    setTempValue(formData[fieldName] || '');
  };

  const cancelEditingField = () => {
    setEditingField(null);
    setTempValue('');
    setErrors({});
  };

  // שמירת שדה בודד - משתמש ב-CONTEXT הקיים
  const saveField = async (fieldName) => {
    if (!validateField(fieldName, tempValue)) {
      return;
    }

    try {
      setSubmitting(true);
      
      // וידוא שיש employeeId - השתמש בקוד שלך שעובד
      const employeeId = currentUser.employeeId ||
                        JSON.parse(localStorage.getItem('user'))?.id;
      
      if (!employeeId) {
        console.error('currentUser:', currentUser);
        console.error('formData:', formData);
        console.error('localStorage user:', JSON.parse(localStorage.getItem('user')));
        throw new Error('לא נמצא מזהה עובד - בדקי את נתוני המשתמש המחובר או localStorage');
      }
      
      console.log('employeeId שנמצא:', employeeId);
      
      // הכנת נתוני העדכון - כל הנתונים הנדרשים כולל השדה שהשתנה
      const updateData = {
        employeeId: parseInt(employeeId),
        firstName: fieldName === 'firstName' ? tempValue : formData.firstName,
        lastName: fieldName === 'lastName' ? tempValue : formData.lastName,
        email: fieldName === 'email' ? tempValue : formData.email,
        mobilePhone: fieldName === 'mobilePhone' ? tempValue : formData.mobilePhone,
        cityName: fieldName === 'cityName' ? tempValue : formData.cityName,
        birthDate: fieldName === 'birthDate' ? tempValue : formData.birthDate,
        photo: formData.photo,
        // הוספת השדות הנדרשים מהמשתמש הקיים
        password: currentUser.password || '', // אם יש
        roleName: currentUser.roleName || currentUser.role || '',
        licenseNum: currentUser.licenseNum || currentUser.license || ''
      };

      console.log('נתוני עדכון:', updateData); // להבנת הבעיה
      
      // שימוש בפונקציה מה-CONTEXT הקיים
      const result = await updateEmployee(updateData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // עדכון המצב המקומי
      setFormData(prev => ({ ...prev, [fieldName]: tempValue }));
      setEditingField(null);
      setTempValue('');

      // הודעת הצלחה נשלחת כבר מה-CONTEXT, אז לא צריך כאן
      
      if (onUpdateSuccess) {
        onUpdateSuccess(result.data);
      }

    } catch (err) {
      console.error('שגיאה בעדכון שדה:', err);
      // השגיאה כבר מטופלת ב-CONTEXT עם Swal
    } finally {
      setSubmitting(false);
    }
  };

  // טיפול בתמונת פרופיל
  const handleProfilePhotoChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'קובץ לא מתאים',
          text: 'יש לבחור קובץ תמונה בלבד (jpg, png, etc.)',
          confirmButtonText: 'אישור'
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'קובץ גדול מדי',
          text: 'גודל התמונה המקסימלי הוא 5MB',
          confirmButtonText: 'אישור'
        });
        return;
      }
      
      setProfilePhoto(file);
      await uploadProfilePhoto(formData.employeeId, file);
    }
  };

  // העלאת תמונת פרופיל
  const uploadProfilePhoto = async (employeeId, file) => {
    try {
      setUploadingFiles(true);
      
      const existingDocs = await dispatch(fetchDocumentsByEmployeeId(employeeId)).unwrap();
      const existingProfilePic = existingDocs.find(doc => doc.docType === 'profile');
      
      if (existingProfilePic) {
        await dispatch(deleteDocument(existingProfilePic.docId)).unwrap();
      }
      
      const profileData = {
        document: {
          EmployeeId: employeeId.toString(),
          DocType: "profile",
          DocName: file.name,
        },
        file: file,
      };

      const uploadResult = await dispatch(uploadDocument(profileData)).unwrap();

      if (uploadResult && uploadResult.docPath) {
        // קבלת employeeId השתמש בקוד שלך שעובד
        const employeeId = currentUser.employeeId ||
                          JSON.parse(localStorage.getItem('user'))?.id;
        
        // עדכון התמונה באמצעות הפונקציה מה-CONTEXT
        const updateData = {
          employeeId: parseInt(employeeId),
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          mobilePhone: formData.mobilePhone,
          cityName: formData.cityName,
          birthDate: formData.birthDate,
          photo: uploadResult.docPath,
          // הוספת השדות הנדרשים
          password: currentUser.password || formData.password || '',
          roleName: currentUser.roleName || currentUser.role || formData.roleName || '',
          licenseNum: currentUser.licenseNum || currentUser.license || formData.licenseNum || ''
        };

        console.log('נתוני עדכון תמונה:', updateData); // להבנת הבעיה
        
        await updateEmployee(updateData);
        setFormData(prev => ({ ...prev, photo: uploadResult.docPath }));
        
        Swal.fire({
          icon: 'success',
          title: 'התמונה עודכנה בהצלחה',
          timer: 1500,
          showConfirmButton: false
        });
      }
      
    } catch (error) {
      console.error('שגיאה בהעלאת תמונה:', error);
      Swal.fire({
        icon: 'error',
        title: 'שגיאה בהעלאת תמונה',
        text: 'אירעה שגיאה בהעלאת התמונה. אנא נסה שוב.',
        confirmButtonText: 'אישור'
      });
    } finally {
      setUploadingFiles(false);
    }
  };

  // ייצור סיסמה אקראית
  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setFormData(prev => ({ 
      ...prev, 
      newPassword: newPassword,
      confirmPassword: newPassword
    }));
  };

  // ולידציה
  const validateField = (name, value) => {
    let error = '';
    
    if (name === 'firstName' || name === 'lastName') {
      if (!value || value.trim() === '') {
        error = 'שדה חובה';
      } else if (value.length < 2) {
        error = 'שם חייב להכיל לפחות 2 תווים';
      }
    }
    
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        error = 'כתובת אימייל לא תקינה';
      }
    }
    
    if (name === 'mobilePhone') {
      const phoneRegex = /^05\d{8}$/;
      if (value && !phoneRegex.test(value)) {
        error = 'מספר טלפון לא תקין (05xxxxxxxx)';
      }
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  // שינוי סיסמה - משתמש ב-CONTEXT הקיים
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    let isValid = true;
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'יש להזין את הסיסמה הנוכחית';
      isValid = false;
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'יש להזין סיסמה חדשה';
      isValid = false;
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'סיסמה חייבת להכיל לפחות 6 תווים';
      isValid = false;
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'יש לאשר את הסיסמה החדשה';
      isValid = false;
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'הסיסמאות אינן תואמות';
      isValid = false;
    }
    
    setErrors(newErrors);
    
    if (!isValid) return;

    try {
      setSubmitting(true);
      
      // קבלת employeeId השתמש בקוד שלך שעובד
      const employeeId = currentUser.employeeId ||
                        JSON.parse(localStorage.getItem('user'))?.id;
      
      if (!employeeId) {
        throw new Error('לא נמצא מזהה עובד');
      }
      
      // שימוש בפונקציה מה-CONTEXT הקיים
      const updateData = {
        employeeId: parseInt(employeeId),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobilePhone: formData.mobilePhone,
        cityName: formData.cityName,
        birthDate: formData.birthDate,
        photo: formData.photo,
        currentPassword: formData.currentPassword,
        password: formData.newPassword,
        // הוספת השדות הנדרשים
        roleName: currentUser.roleName || currentUser.role || formData.roleName || '',
        licenseNum: currentUser.licenseNum || currentUser.license || formData.licenseNum || ''
      };

      console.log('נתוני עדכון סיסמה:', updateData); // להבנת הבעיה
      
      const result = await updateEmployee(updateData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // הודעת הצלחה נשלחת כבר מה-CONTEXT
      
      setChangePasswordMode(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (err) {
      console.error('שגיאה בשינוי סיסמה:', err);
      // השגיאה כבר מטופלת ב-CONTEXT עם Swal
    } finally {
      setSubmitting(false);
    }
  };

  // עיצוב תאריך
  const formatDate = (date) => {
    if (!date) return 'לא הוזן';
    try {
      return format(new Date(date), 'dd/MM/yyyy');
    } catch {
      return 'לא הוזן';
    }
  };

  // רכיב שדה עם עריכה
  const EditableField = ({ label, fieldName, value, icon, type = 'text' }) => {
    const isEditing = editingField === fieldName;
    
    return (
      <Card 
        sx={{ 
          mb: 2, 
          border: isEditing ? '2px solid #4cb5c3' : '1px solid #e2e8f0',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ 
              p: 1, 
              borderRadius: '50%', 
              backgroundColor: '#f0f9ff',
              color: '#4cb5c3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {icon}
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2d3748' }}>
              {label}
            </Typography>
          </Box>
          
          {isEditing ? (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              {fieldName === 'cityName' ? (
                <FormControl fullWidth size="small" error={!!errors[fieldName]}>
                  <Select
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    disabled={submitting}
                  >
                    {cities.map((city) => (
                      <MenuItem key={city.cityName} value={city.cityName}>
                        {city.cityName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : fieldName === 'birthDate' ? (
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
                  <DatePicker
                    value={tempValue}
                    onChange={(date) => setTempValue(date)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: !!errors[fieldName]
                      }
                    }}
                    disabled={submitting}
                  />
                </LocalizationProvider>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  type={type}
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  error={!!errors[fieldName]}
                  helperText={errors[fieldName]}
                  disabled={submitting}
                />
              )}
              
              <IconButton 
                color="primary" 
                onClick={() => saveField(fieldName)}
                disabled={submitting}
                size="small"
                sx={{ 
                  backgroundColor: '#4cb5c3',
                  color: 'white',
                  '&:hover': { backgroundColor: '#2a8a95' },
                  '&:disabled': { backgroundColor: '#e2e8f0' }
                }}
              >
                {submitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
              </IconButton>
              
              <IconButton 
                color="error" 
                onClick={cancelEditingField}
                disabled={submitting}
                size="small"
                sx={{ 
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  '&:hover': { backgroundColor: '#fecaca' }
                }}
              >
                <Close />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', color: '#4a5568' }}>
                {fieldName === 'birthDate' ? formatDate(value) : (value || 'לא הוזן')}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => startEditingField(fieldName)}
                sx={{ 
                  backgroundColor: '#f7fafc',
                  color: '#4cb5c3',
                  '&:hover': { 
                    backgroundColor: '#edf2f7',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!currentUser) {
    return (
      <Container maxWidth="lg" dir="rtl" sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress size={50} />
        <Typography sx={{ mt: 3, fontSize: '1.2rem' }}>טוען פרטי משתמש...</Typography>
      </Container>
    );
  }

  return (
    <ThemeProvider theme={rtlTheme}>
      <Container maxWidth="lg" dir="rtl" sx={{ py: 4, minHeight: '100vh' }}>
        {/* כרטיס פרופיל עליון */}
        <Paper
          elevation={8}
          sx={{ 
            padding: 4, 
            marginBottom: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            borderRadius: 3
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              sx={{ 
                width: 140, 
                height: 140, 
                margin: '0 auto 20px',
                border: '5px solid rgba(255,255,255,0.3)',
                fontSize: '3.5rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
              }}
              src={formData.photo ? `${baseURL}/api/Documents/content-by-path?path=${encodeURIComponent(formData.photo)}` : undefined}
            >
              {!formData.photo && (formData.firstName?.[0] || '') + (formData.lastName?.[0] || '')}
            </Avatar>
            
            <IconButton
              component="label"
              sx={{
                position: 'absolute',
                bottom: 20,
                right: -15,
                backgroundColor: 'rgba(255,255,255,0.9)',
                color: '#4cb5c3',
                '&:hover': { 
                  backgroundColor: 'white',
                  transform: 'scale(1.1)'
                },
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }}
              disabled={uploadingFiles}
            >
              {uploadingFiles ? <CircularProgress size={24} /> : <CameraAlt />}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleProfilePhotoChange}
              />
            </IconButton>
          </Box>
          
          <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
            {formData.firstName} {formData.lastName}
          </Typography>
          
          <Chip 
            label={`עובד/ת מספר: ${formData.employeeId}`}
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600
            }}
          />
        </Paper>

        <Grid container spacing={4}>
          {/* פרטים אישיים */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={4} sx={{ padding: 4, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Person sx={{ color: '#4cb5c3', fontSize: '2rem' }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d3748' }}>
                  פרטים אישיים
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <EditableField
                    label="שם פרטי"
                    fieldName="firstName"
                    value={formData.firstName}
                    icon={<Person fontSize="small" />}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <EditableField
                    label="שם משפחה"
                    fieldName="lastName"
                    value={formData.lastName}
                    icon={<Person fontSize="small" />}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <EditableField
                    label="דואר אלקטרוני"
                    fieldName="email"
                    value={formData.email}
                    icon={<Email fontSize="small" />}
                    type="email"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <EditableField
                    label="טלפון נייד"
                    fieldName="mobilePhone"
                    value={formData.mobilePhone}
                    icon={<Phone fontSize="small" />}
                    type="tel"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <EditableField
                    label="עיר מגורים"
                    fieldName="cityName"
                    value={formData.cityName}
                    icon={<LocationOn fontSize="small" />}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <EditableField
                    label="תאריך לידה"
                    fieldName="birthDate"
                    value={formData.birthDate}
                    icon={<Cake fontSize="small" />}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* שינוי סיסמה */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={4} sx={{ padding: 4, borderRadius: 3, height: 'fit-content' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Lock sx={{ color: '#4cb5c3', fontSize: '2rem' }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d3748' }}>
                  אבטחה
                </Typography>
              </Box>
              
              {!changePasswordMode ? (
                <Button
                  variant="contained"
                  onClick={() => setChangePasswordMode(true)}
                  fullWidth
                  sx={{ 
                    py: 2,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2a8a95 0%, #1a6b75 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(76, 181, 195, 0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  שינוי סיסמה
                </Button>
              ) : (
                <form onSubmit={handlePasswordChange}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="סיסמה נוכחית"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        variant="outlined"
                        required
                        error={!!errors.currentPassword}
                        helperText={errors.currentPassword}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                edge="end"
                              >
                                {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="סיסמה חדשה"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                        variant="outlined"
                        required
                        error={!!errors.newPassword}
                        helperText={errors.newPassword}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                edge="end"
                              >
                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="אישור סיסמה חדשה"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        variant="outlined"
                        required
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        onClick={handleGeneratePassword}
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                      >
                        ייצור סיסמה אקראית
                      </Button>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setChangePasswordMode(false);
                            setFormData(prev => ({
                              ...prev,
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            }));
                            setErrors({});
                          }}
                          fullWidth
                          sx={{
                            borderColor: '#e2e8f0',
                            color: '#718096',
                            '&:hover': {
                              borderColor: '#cbd5e0',
                              backgroundColor: '#f7fafc'
                            }
                          }}
                        >
                          ביטול
                        </Button>
                        
                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          disabled={submitting}
                          sx={{
                            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 6px 20px rgba(72, 187, 120, 0.3)'
                            },
                            '&:disabled': {
                              background: '#e2e8f0',
                              color: '#a0aec0'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {submitting ? <CircularProgress size={24} color="inherit" /> : 'שמור סיסמה'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
};

export default EmployeeProfile;