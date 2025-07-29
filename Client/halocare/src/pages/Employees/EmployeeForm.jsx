import { useState  } from 'react';
import { 
  Container,  Typography, Button, Grid, Box, 
  TextField, FormControl, InputLabel, Select, MenuItem, 
  FormControlLabel, Switch, CircularProgress,
  InputAdornment, IconButton,  Alert,
  Breadcrumbs, Card, CardContent, Chip, Fade, Zoom,
  Avatar, Stack, useTheme, alpha, Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { 
  Visibility, VisibilityOff, ContentCopy, CloudUpload,
  Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon,
  LocationCity as CityIcon, Work as WorkIcon, Badge as BadgeIcon,
  Security as SecurityIcon, PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon, ArrowBack as ArrowBackIcon,
  Password as PasswordIcon, AutoAwesome as AutoAwesomeIcon,
  Edit as EditIcon, Close as CloseIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { useEmployees } from './EmployeesContext';
import { useDispatch } from 'react-redux';
import { deleteDocument, fetchDocumentsByEmployeeId, uploadDocument } from '../../Redux/features/documentsSlice';
import Validations from '../../utils/employeeValidations';
import Swal from 'sweetalert2';
import { baseURL } from '../../components/common/axiosConfig';
import { useAuth } from '../../components/login/AuthContext';
// Enhanced theme design
const rtlTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2.2rem',
    },
    h6: {
      fontWeight: 600,
    }
  },
  palette: {
    primary: {
      main: '#667eea',
      light: '#818cf8',
      dark: '#4338ca',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f093fb',
      light: '#fbbf24',
      dark: '#c2410c',
    },
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    }
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
            },
            '&.Mui-focused': {
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
              transform: 'translateY(-2px)',
            }
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          }
        },
        contained: {
          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          overflow: 'visible',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
            borderRadius: '20px 20px 0 0',
          }
        }
      }
    }
  }
});

// Styled component for avatar with effects
const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: `0 8px 24px rgba(102, 126, 234, 0.3)`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.05) rotate(5deg)',
    boxShadow: `0 12px 32px rgba(102, 126, 234, 0.4)`,
  }
}));

// Styled component for section header
const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

// Styled component for the form container
const FormContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

// Styled component for the main card
const MainCard = styled(Card)(({ theme }) => ({
  backdropFilter: 'blur(20px)',
  background: 'rgba(255, 255, 255, 0.95)',
  border: `1px solid ${alpha('#ffffff', 0.2)}`,
  '&::before': {
    background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb, #667eea)',
    height: '6px',
  }
}));

// Styled loading effect
const LoadingOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(4px)',
  borderRadius: 20,
  zIndex: 1000,
});

// Initial values for the form
const initialFormData = {
  firstName: '',
  lastName: '',
  email: '',
  mobilePhone: '',
  cityName: '',
  birthDate: null,
  licenseNum: '',
  startDate: new Date(),
  roleName: '',
  classId: '',
  photo:'',
  password: '',
  isActive: true
};

const EmployeeForm = ({ existingEmployee = null, onSubmitSuccess , onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const {currentUser} = useAuth();
  const {employees} =useEmployees();
  const isEditMode = Boolean(existingEmployee);
  const pageTitle = isEditMode ? "עריכת פרטי עובד" : "קליטת עובד חדש";
  const submitButtonText = isEditMode ? "✏️ שמור שינויים" : "💾 הוספת עובד חדש";
  //use employees context
  const { 
    addEmployee, 
    updateEmployee,
    sendWelcomeEmail, 
    generateRandomPassword,
    roles, 
    classes, 
    cities,
  } = useEmployees();
  
  // check if in edit mode
  const [formData, setFormData] = useState(
    isEditMode ? {
      employeeId: existingEmployee.employeeId,
      firstName: existingEmployee.firstName || '',
      lastName: existingEmployee.lastName || '',
      email: existingEmployee.email || '',
      mobilePhone: existingEmployee.mobilePhone || '',
      cityName: existingEmployee.cityName || '',
      birthDate: existingEmployee.birthDate ? new Date(existingEmployee.birthDate) : null,
      licenseNum: existingEmployee.licenseNum || '',
      startDate: existingEmployee.startDate ? new Date(existingEmployee.startDate) : new Date(),
      roleName: existingEmployee.roleName || '',
      classId: existingEmployee.classId || '',
      password: '', 
      isActive: existingEmployee.isActive,
      photo: existingEmployee.photo || '',  
    } : initialFormData
  );

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  
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
    validateField(name, date);
  };
  
  //handle changing profile pic
  const handleProfilePhotoChange = (e) => {
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
      
      // checking file size - max 5MB
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
      
      // Creating a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDocumentsChange = (e) => {
    if (e.target.files) {
      
      //5 documents only
      const newFiles = Array.from(e.target.files).slice(0, 5);
      
      // checking file size - max 5MB
      const validFiles = newFiles.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          Swal.fire({
            icon: 'warning',
            title: 'קובץ גדול מדי',
            text: `הקובץ ${file.name} גדול מדי ולא ייכלל בהעלאה`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500
          });
          return false;
        }
        return true;
      });
      
      setDocuments(prev => [...prev, ...validFiles]);
    }
  };
  
  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // generate password
  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setFormData(prev => ({ ...prev, password: newPassword }));
    validateField('password', newPassword);
  };
  
  // upload files after adding the employee
  const uploadFiles = async (employeeId) => {
    if (!profilePhoto && !documents.length) return true;
    
    try {
      setUploadingFiles(true);
      
      // Handling profile picture
      if (profilePhoto) {
        try {
          const existingDocs = await dispatch(fetchDocumentsByEmployeeId(employeeId)).unwrap();
          const existingProfilePic = existingDocs.find(doc => 
            doc.docType === 'profile' || doc.docType === 'picture'
          );
          
          if (existingProfilePic) {
            try {
              await dispatch(deleteDocument(existingProfilePic.docId)).unwrap();
              console.log('תמונת פרופיל קודמת נמחקה');
            } catch (deleteError) {
              console.warn('שגיאה במחיקת תמונה קודמת:', deleteError);
            }
          }
          
          const profileData = {
            document: {
              EmployeeId: employeeId,
              DocType: "profile",
              DocName: profilePhoto.name,
            },
            file: profilePhoto,
          };

          console.log('מעלה תמונת פרופיל:', profileData);
          
          const uploadResult = await dispatch(uploadDocument(profileData)).unwrap();
          
          console.log('תמונת פרופיל הועלתה:', uploadResult);

            // Update the image path in the employee profile
          if (uploadResult && uploadResult.docPath) {
            const updateData = {
              employeeId: employeeId,
              ...formData,
              photo: uploadResult.docPath
            };
            
            console.log('מעדכן נתיב תמונה בפרופיל העובד:', updateData);
            
            try {
              await updateEmployee(updateData);
              console.log('נתיב התמונה עודכן בפרופיל העובד');
            } catch (updateError) {
              console.error('שגיאה בעדכון נתיב התמונה:', updateError);
            }
          }
        } catch (profileError) {
          console.error('שגיאה בהעלאת תמונת פרופיל:', profileError);
          throw new Error(`שגיאה בהעלאת תמונת פרופיל: ${profileError.message || profileError}`);
        }
      }
      
      // Handling additional documents
      if (documents.length > 0) {
        console.log(`מעלה ${documents.length} מסמכים נוספים`);
        
        for (let i = 0; i < documents.length; i++) {
          const file = documents[i];
          try {
            const documentData = {
              document: {
                EmployeeId: employeeId,
                DocType: 'document',
                DocName: file.name
              },
              file: file
            };
            
            console.log(`מעלה מסמך ${i + 1}/${documents.length}:`, documentData);
            
            const result = await dispatch(uploadDocument(documentData)).unwrap();
            console.log(`מסמך ${i + 1} הועלה בהצלחה:`, result);
          } catch (docError) {
            console.error(`שגיאה בהעלאת מסמך ${i + 1}:`, docError);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('שגיאה כללית בהעלאת קבצים:', error);
      throw error;
    } finally {
      setUploadingFiles(false);
    }
  };
  
  // Validation functions
  const validateField = (name, value) => {
    const extraParams = {
      required: ['firstName', 'lastName', 'password', 'roleName',"classId","cityName"].includes(name)
    };
    
    const error = Validations(name, value, extraParams);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    return !error;
  };

  const validateForm = () => {
    const fieldsToValidate = 
    isEditMode ?
    ['firstName', 
      'lastName', 
      'mobilePhone', 
      'roleName']
    :
    ['firstName', 
      'lastName', 
      'email', 
      'mobilePhone', 
      'password', 
      'roleName'];
    let isValid = true;
    const newErrors = {};
    

    for (const field of fieldsToValidate) {
      const extraParams =isEditMode?
       {
        required: ['firstName', 'lastName', 'roleName'].includes(field)
      }
      :
      {
        required: ['firstName', 'lastName', 'password', 'roleName'].includes(field)
      };
      

      const error = Validations(field, formData[field], extraParams);
      
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }
    
    if (sendEmail && !formData.email) {
      newErrors.email = 'יש להזין אימייל כדי לשלוח פרטי כניסה';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      
      let result;
      
      if (isEditMode) {
        console.log('עדכון עובד קיים:', formData);
        result = await updateEmployee(formData);
      } else {
        console.log('הוספת עובד חדש:', formData);
        result = await addEmployee(formData);
      }
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      console.log('עובד נשמר בהצלחה:', result);
      
      const employeeId = isEditMode ? formData.employeeId : result.data.employeeId;
      
      // Sending email (only in new addition mode)
      if (!isEditMode && sendEmail && formData.email) {
        try {
          console.log('שולח אימייל ברוכים הבאים');
          await sendWelcomeEmail(
            formData.email, 
            formData.password,
            formData.firstName,
            formData.lastName
          );
          console.log('אימייל נשלח בהצלחה');
        } catch (emailError) {
          console.warn('שגיאה בשליחת אימייל:', emailError);
        }
      }
      
      try {
        console.log('מתחיל העלאת קבצים לעובד:', employeeId);
        await uploadFiles(employeeId);
        console.log('קבצים הועלו בהצלחה');
      } catch (uploadError) {
        console.error('שגיאה בהעלאת קבצים:', uploadError);
        
        Swal.fire({
          icon: 'warning',
          title: 'העובד נשמר בהצלחה',
          text: 'אולם אירעה שגיאה בהעלאת הקבצים. אנא נסה להעלות אותם שוב מעמוד עריכת העובד.',
          confirmButtonText: 'אישור'
        });
      }
      
      Swal.fire({
        title: isEditMode ? 'העובד עודכן בהצלחה!' : 'העובד נוסף בהצלחה!',
        text: isEditMode ? 'פרטי העובד עודכנו במערכת' : 'העובד נוסף למערכת בהצלחה',
        icon: 'success',
        confirmButtonText: 'אישור'
      }).then(() => {
        if (onSubmitSuccess) {
          onSubmitSuccess(result.data);
        } else if (onClose) {
          onClose();
        } else {
          navigate("/employees/list");
        }
      });
      
    } catch (error) {
      console.error('שגיאה בשמירת העובד:', error);
      
      Swal.fire({
        title: 'שגיאה!',
        text: error.message || 'אירעה שגיאה בשמירת העובד. אנא נסה שוב.',
        icon: 'error',
        confirmButtonText: 'אישור'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Helper functions for displaying errors
  const getFieldError = (fieldName) => errors[fieldName] || '';
  const hasFieldError = (fieldName) => Boolean(errors[fieldName]);

  return (
    <ThemeProvider theme={rtlTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
        <FormContainer maxWidth="lg" dir="rtl">
          {!isEditMode && (
            <Fade in timeout={800}>
              <Breadcrumbs 
                aria-label="breadcrumb" 
                sx={{ 
                  mb: 3,
                  '& .MuiBreadcrumbs-ol': {
                    justifyContent: 'center'
                  },
                  '& a, & .MuiTypography-root': {
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    fontWeight: 600,
                  }
                }}
              >
                <Link
                  underline="hover"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/employees/list');
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  רשימת עובדים
                </Link>
                <Typography>
                  עריכת עובד
                </Typography>
              </Breadcrumbs>
            </Fade>
          )}

          <Zoom in timeout={1000}>
            <MainCard>
              {(submitting || uploadingFiles) && (
                <LoadingOverlay>
                  <Box textAlign="center">
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
                      {uploadingFiles ? 'מעלה קבצים...' : 'שומר נתונים...'}
                    </Typography>
                  </Box>
                </LoadingOverlay>
              )}

              <CardContent sx={{ p: 4 }}>
                {/* Styled Main Header */}
                <Box textAlign="center" mb={4}>
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    {pageTitle}
                  </Typography>
                  <Box
                    sx={{
                      width: 80,
                      height: 4,
                      background: 'linear-gradient(90deg, #667eea, #764ba2)',
                      margin: '0 auto',
                      borderRadius: 2,
                    }}
                  />
                </Box>

                {successMessage && (
                  <Fade in>
                    <Alert
                      severity="success"
                      sx={{ 
                        mb: 3,
                        borderRadius: 3,
                        '& .MuiAlert-icon': {
                          fontSize: '2rem'
                        }
                      }}
                      onClose={() => setSuccessMessage("")}
                    >
                      {successMessage}
                    </Alert>
                  </Fade>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Main profil picture*/}
                  <Box textAlign="center" mb={4}>
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      id="profile-upload"
                      onChange={handleProfilePhotoChange}
                    />
                    <label htmlFor="profile-upload">
                      <StyledAvatar
                        src={profilePreview || (isEditMode && formData.photo ? 
                          `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(formData.photo)}` : 
                          undefined)}
                        sx={{ 
                          margin: '0 auto',
                          background: profilePreview || formData.photo ? 'transparent' : 
                            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}
                      >
                        {!profilePreview && !formData.photo && <PhotoCameraIcon sx={{ fontSize: 40 }} />}
                      </StyledAvatar>
                    </label>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      לחץ להעלאת תמונת פרופיל
                    </Typography>
                    {profilePhoto && (
                      <Chip 
                        label={`${profilePhoto.name} (${Math.round(profilePhoto.size / 1024)} KB)`}
                        color="primary"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>

                  {/* Personal info*/}
                  <Fade in timeout={1200}>
                    <Card sx={{ mb: 4, borderRadius: 4, overflow: 'visible' }}>
                      <CardContent sx={{ p: 3 }}>
                        <SectionHeader>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          👥 פרטים אישיים
                          </Typography>
                        </SectionHeader>

                        <Grid container spacing={3}>
                          <Grid item size={{xs:12 , md:6}}>
                            <TextField
                              fullWidth
                              label="👨‍💼 שם פרטי"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              variant="outlined"
                              required
                              error={hasFieldError("firstName")}
                              helperText={getFieldError("firstName")}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                  </InputAdornment>
                                )
                              }}
                            />
                          </Grid>

                          <Grid item size={{xs:12 , md:6}}>
                            <TextField
                              fullWidth
                              label="👨‍💼 שם משפחה"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              variant="outlined"
                              required
                              error={hasFieldError("lastName")}
                              helperText={getFieldError("lastName")}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                  </InputAdornment>
                                )
                              }}
                            />
                          </Grid>

                          <Grid item size={{xs:12 , md:6}}>
                            <DatePicker
                              label="📅 תאריך לידה"
                              value={formData.birthDate}
                              onChange={(date) => handleDateChange("birthDate", date)}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  variant: "outlined",
                                  error: hasFieldError("birthDate"),
                                  helperText: getFieldError("birthDate"),
                                  InputProps: {
                                    startAdornment: (
                                      <InputAdornment position="start">
                                      </InputAdornment>
                                    )
                                  }
                                },
                              }}
                            />
                          </Grid>

                          <Grid item size={{xs:12 , md:6}}>
                            <TextField
                              fullWidth
                              label="📱 טלפון נייד"
                              name="mobilePhone"
                              type="tel"
                              value={formData.mobilePhone}
                              onChange={handleChange}
                              variant="outlined"
                              error={hasFieldError("mobilePhone")}
                              helperText={getFieldError("mobilePhone")}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                  </InputAdornment>
                                )
                              }}
                            />
                          </Grid>

                          <Grid item size={{xs:12 , md:6}}>
                            <FormControl
                              fullWidth
                              required
                              variant="outlined"
                              error={hasFieldError("cityName")}
                            >
                              <InputLabel> 🏙️ עיר</InputLabel>
                              <Select
                                name="cityName"
                                value={formData.cityName}
                                onChange={handleChange}
                                label="עיר"
                                startAdornment={
                                  <InputAdornment position="start">
                                  </InputAdornment>
                                }
                              >
                                {!cities.length ? (
                                  <MenuItem disabled>טוען ערים...</MenuItem>
                                ) : (
                                  cities.map((city) => (
                                    <MenuItem key={city.cityName} value={city.cityName}>
                                      {city.cityName}
                                    </MenuItem>
                                  ))
                                )}
                              </Select>
                              {hasFieldError("cityName") && (
                                <Typography variant="caption" color="error">
                                  {getFieldError("cityName")}
                                </Typography>
                              )}
                            </FormControl>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Fade>

                  {/* Work info*/}
                  <Fade in timeout={1400}>
                    <Card sx={{ mb: 4, borderRadius: 4, overflow: 'visible' }}>
                      <CardContent sx={{ p: 3 }}>
                        <SectionHeader>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                          💼 פרטי העסקה
                          </Typography>
                        </SectionHeader>

                        <Grid container spacing={3}>
                          <Grid item size={{xs:12 , md:6}}>
                            <FormControl
                              fullWidth
                              variant="outlined"
                              required
                              error={hasFieldError("roleName")}
                            >
                              <InputLabel>🎯 תפקיד</InputLabel>
                              <Select
                                name="roleName"
                                value={formData.roleName}
                                onChange={handleChange}
                                label="תפקיד"
                                startAdornment={
                                  <InputAdornment position="start">
                                  </InputAdornment>
                                }
                              >
                                {!roles.length ? (
                                  <MenuItem disabled>טוען תפקידים...</MenuItem>
                                ) : (
                                  roles.map((role) => (
                                    <MenuItem key={role.roleName} value={role.roleName}>
                                      {role.roleName}
                                    </MenuItem>
                                  ))
                                )}
                              </Select>
                              {hasFieldError("roleName") && (
                                <Typography variant="caption" color="error">
                                  {getFieldError("roleName")}
                                </Typography>
                              )}
                            </FormControl>
                          </Grid>

                          <Grid item size={{xs:12 , md:6}}>
                            <TextField
                              fullWidth
                              label="📄 מספר רישיון"
                              name="licenseNum"
                              value={formData.licenseNum}
                              onChange={handleChange}
                              variant="outlined"
                              error={hasFieldError("licenseNum")}
                              helperText={getFieldError("licenseNum")}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                  </InputAdornment>
                                )
                              }}
                            />
                          </Grid>

                          <Grid item size={{xs:12 , md:6}}>
                            <DatePicker
                              label="📅 תאריך תחילת עבודה"
                              value={formData.startDate}
                              onChange={(date) => handleDateChange("startDate", date)}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  variant: "outlined",
                                  InputProps: {
                                    startAdornment: (
                                      <InputAdornment position="start">
                                      </InputAdornment>
                                    )
                                  }
                                },
                              }}
                            />
                          </Grid>

                          <Grid item size={{xs:12 , md:6}}>
                            <FormControl required fullWidth variant="outlined">
                              <InputLabel>🏫 שיוך לכיתה</InputLabel>
                              <Select
                                name="classId"
                                value={formData.classId}
                                onChange={handleChange}
                                label="שיוך לכיתה"
                                startAdornment={
                                  <InputAdornment position="start">
                                  </InputAdornment>
                                }
                              >
                                {!classes.length ? (
                                  <MenuItem disabled>טוען כיתות...</MenuItem>
                                ) : (
                                  classes.map((cls) => (
                                    <MenuItem key={cls.classId} value={cls.classId}>
                                      {cls.className}
                                    </MenuItem>
                                  ))
                                )}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item size={{xs:12 , md:6}}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              p: 2,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                            }}>
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
                                sx={{ fontWeight: 600 }}
                              />
                            </Box>
                          </Grid>

                          <Grid item size={{xs:12}}>
                            <Button
                              variant="outlined"
                              component="label"
                              disabled={isEditMode}
                              startIcon={<CloudUpload />}
                              fullWidth
                              sx={{ 
                                height: 64,
                                borderStyle: 'dashed',
                                borderWidth: 2,
                                borderRadius: 3,
                                fontSize: '1.1rem',
                                '&:hover': {
                                  borderStyle: 'dashed',
                                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                }
                              }}
                            >
                              {documents.length > 0
                                ? `${documents.length} מסמכים נבחרו`
                                : " העלאת מסמכים נוספים"}
                              <input
                                type="file"
                                hidden
                                multiple
                                onChange={handleDocumentsChange}
                              />
                            </Button>
                            {documents.length > 0 && (
                              <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                                {documents.map((doc, index) => (
                                  <Chip
                                    key={index}
                                    label={`${doc.name} (${Math.round(doc.size / 1024)} KB)`}
                                    onDelete={() => removeDocument(index)}
                                    color="primary"
                                    variant="outlined"
                                  />
                                ))}
                              </Stack>
                            )}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Fade>
                  {/* Login info*/}
                                    {!isEditMode && (

                    <Fade in timeout={1600}>
                      <Card sx={{ mb: 4, borderRadius: 4, overflow: 'visible' }}>
                        <CardContent sx={{ p: 3 }}>
                          <SectionHeader>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                            🛡️ פרטי כניסה למערכת
                            </Typography>
                          </SectionHeader>

                          <Grid container spacing={3}>
                            <Grid item size={{xs:12}}>
                              <TextField
                                fullWidth
                                label="📧 דוא״ל"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                variant="outlined"
                                error={hasFieldError("email")}
                                helperText={getFieldError("email")}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                    </InputAdornment>
                                  )
                                }}
                              />
                            </Grid>

                            <Grid item size={{xs:12}}>
                              <TextField
                                fullWidth
                                label="🔐 סיסמה ראשונית"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                variant="outlined"
                                required
                                error={hasFieldError("password")}
                                helperText={getFieldError("password")}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                    </InputAdornment>
                                  ),
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Tooltip PopperProps={{ disablePortal: true }} title={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}>
                                        <IconButton
                                          onClick={() => setShowPassword(!showPassword)}
                                          edge="end"
                                        >
                                          {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip PopperProps={{ disablePortal: true }}title="העתק סיסמה">
                                        <IconButton
                                          disabled={!formData.password}
                                          edge="end"
                                          onClick={() => navigator.clipboard.writeText(formData.password)}
                                        >
                                          <ContentCopy />
                                        </IconButton>
                                      </Tooltip>
                                    </InputAdornment>
                                  ),
                                }}
                              />

                              <Button
                                onClick={handleGeneratePassword}
                                variant="outlined"
                                sx={{ mt: 2, borderRadius: 3 }}
                              >
                               ✨ ייצר סיסמה אקראית
                              </Button>
                            </Grid>

                            <Grid item size={{xs:12}}>
                              <Box sx={{ 
                                p: 2,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                              }}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={sendEmail}
                                      onChange={(e) => setSendEmail(e.target.checked)}
                                      color="success"
                                      disabled={!formData.email}
                                    />
                                  }
                                  label="שלח אימייל לעובד עם פרטי הכניסה"
                                  sx={{ fontWeight: 600 }}
                                />
                                {!formData.email && sendEmail && (
                                  <Typography
                                    variant="caption"
                                    color="error"
                                    display="block"
                                    sx={{ mt: 1 }}
                                  >
                                    יש להזין כתובת אימייל כדי לשלוח פרטי כניסה
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Fade>
                    )}
                     
                  {/* Action buttons */}
                  <Fade in timeout={1800}>
                    <Box sx={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      mt: 4,
                      gap: 2
                    }}>
                      <Button
                        variant="outlined"
                        onClick={() => isEditMode ? onClose() : navigate("/employees/list")}
                        disabled={submitting || uploadingFiles}
                        sx={{ 
                          borderRadius: 3,
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem',
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                          }
                        }}
                      >
                        {isEditMode ? 'סגור' : '→ חזרה לרשימה'}
                      </Button>
                      
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={submitting || uploadingFiles}
                        sx={{
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem',
                          borderRadius: 3,
                          minWidth: 200,
                          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
                          '&:hover': {
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                          }
                        }}
                      >
                        {submitting || uploadingFiles ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          submitButtonText
                        )}
                      </Button>
                    </Box>
                  </Fade>
                </form>
              </CardContent>
            </MainCard>
          </Zoom>
        </FormContainer>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default EmployeeForm;