import { useState, useEffect, useRef } from 'react';
import { 
  Container, Typography, Button, Grid, Box, 
  TextField, FormControl, InputLabel, Select, MenuItem, 
  FormControlLabel, Switch, CircularProgress,
  InputAdornment, IconButton, Alert,
  Breadcrumbs, Card, CardContent, Chip, Fade, Zoom,
  Avatar, Stack, useTheme, alpha, Tooltip,
  styled, Link,keyframes
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { 
  Visibility, VisibilityOff, ContentCopy, CloudUpload,
  LocationCity as CityIcon,
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {  useNavigate, useParams } from 'react-router-dom';
import { useEmployees } from './EmployeesContext';
import { useDispatch } from 'react-redux';
import { deleteDocument, fetchDocumentsByEmployeeId, uploadDocument } from '../../Redux/features/documentsSlice';
import Validations from '../../utils/employeeValidations';
import Swal from 'sweetalert2';
import { baseURL } from '../../components/common/axiosConfig';
import HebrewReactDatePicker from '../../components/common/HebrewReactDatePicker';

// Professional animations matching the style
const gradientShift = keyframes`
  0% { backgroundPosition: 0% 50%; }
  50% { backgroundPosition: 100% 50%; }
  100% { backgroundPosition: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

// Professional theme
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
      main: '#4cb5c3',
      light: '#7ec8d3',
      dark: '#2a8a95',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff7043',
      light: '#ff9575',
      dark: '#c63f17',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
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
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              boxShadow: '0 4px 15px rgba(76, 181, 195, 0.15)',
              transform: 'translateY(-2px)',
            },
            '&.Mui-focused': {
              boxShadow: '0 6px 20px rgba(76, 181, 195, 0.2)',
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
          background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
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
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
            borderRadius: '20px 20px 0 0',
          }
        }
      }
    }
  }
});

// Professional styled components
const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: `0 8px 24px rgba(76, 181, 195, 0.3)`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  animation: `${float} 3s ease-in-out infinite`,
  '&:hover': {
    transform: 'scale(1.05) rotate(5deg)',
    boxShadow: `0 12px 32px rgba(76, 181, 195, 0.4)`,
  }
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha('#4cb5c3', 0.05)} 0%, ${alpha('#ff7043', 0.05)} 100%)`,
  borderRadius: 16,
  border: `1px solid ${alpha('#4cb5c3', 0.2)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha('#4cb5c3', 0.1)}, transparent)`,
    animation: `${shimmer} 3s infinite`,
  }
}));

const FormContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 20s ease infinite`,
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
  }
}));

const MainCard = styled(Card)(() => ({
  position: 'relative',
  zIndex: 1,
}));

const LoadingOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  zIndex: 1000,
});

// const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
//   marginBottom: theme.spacing(3),
//   padding: theme.spacing(2),
//   background: 'rgba(255, 255, 255, 0.95)',
//   backdropFilter: 'blur(20px)',
//   borderRadius: 16,
//   border: '1px solid rgba(255, 255, 255, 0.2)',
//   boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
//   '& .MuiBreadcrumbs-ol': {
//     justifyContent: 'center'
//   },
//   '& a, & .MuiTypography-root': {
//     color: theme.palette.primary.main,
//     textShadow: '0 1px 2px rgba(0,0,0,0.1)',
//     fontWeight: 600,
//     transition: 'all 0.3s ease',
//     '&:hover': {
//       color: theme.palette.primary.dark,
//       transform: 'translateY(-2px)',
//     }
//   }
// }));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: 8,
  fontWeight: 600,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  animation: `${pulse} 2s infinite`,
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  }
}));

const GlowingButton = styled(Button)(({ theme, glowColor = '#4cb5c3' }) => ({
  borderRadius: 16,
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'all 0.5s ease',
  },
  '&:hover::after': {
    left: '100%',
  }
}));
const EnhancedBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  '& .MuiBreadcrumbs-separator': {
    color: theme.palette.primary.main,
  },
  '& .MuiBreadcrumbs-li': {
    '& a': {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      padding: '4px 8px',
      borderRadius: 8,
      '&:hover': {
        background: 'rgba(76, 181, 195, 0.1)',
        transform: 'translateY(-2px)',
      }
    }
  }
}));

const StyledLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    '& svg': {
      transform: 'scale(1.2) rotate(10deg)',
    }
  },
  '& svg': {
    marginRight: theme.spacing(0.5),
    fontSize: 'small',
    transition: 'transform 0.3s ease',
  }
}));

const CurrentPage = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontWeight: 700,
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  '& svg': {
    marginRight: theme.spacing(0.5),
    fontSize: 'small',
    color: theme.palette.primary.main,
  }
}));

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

const EmployeeForm = ({ onSubmitSuccess, isEditMode = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { employeeId } = useParams();



  // const isEditMode = Boolean(existingEmployee);
  const pageTitle = isEditMode ? "עריכת פרטי עובד" : "קליטת עובד חדש";
  const submitButtonText = isEditMode ? "✏️ שמור שינויים" : "💾 הוספת עובד חדש";
  
  const cityInputRef = useRef(null);
  const autocompleteCity = useRef(null);
  
  const { 
    addEmployee, 
    updateEmployee,
    sendWelcomeEmail, 
    generateRandomPassword,
    roles, 
    classes, 
    employees,
  } = useEmployees();
  
  const existingEmployee = employees.find(emp => emp.employeeId === parseInt(employeeId));
  // Form state 
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


//   useEffect(() => {
//   if (employeeId && employees.length > 0) {
//     const employee = employees.find(emp => emp.employeeId === parseInt(employeeId));
//     if (employee) {
//       setFormData({...employee});
//     }
//   }
// }, [employeeId, employees]);
  // Google Places Autocomplete functionality 
  const initializeGooglePlaces = () => {
    if (typeof window === 'undefined' || !window.google || !window.google.maps || !window.google.maps.places) {
      console.warn('Google Maps API לא נטען עדיין או Places API חסר');
      return false;
    }

    try {
      if (cityInputRef.current && !autocompleteCity.current) {
        autocompleteCity.current = new window.google.maps.places.Autocomplete(
          cityInputRef.current,
          {
            types: ['(cities)'],
            componentRestrictions: { country: 'IL' },
            fields: ['name', 'geometry', 'formatted_address']
          }
        );

        autocompleteCity.current.addListener('place_changed', handleCitySelect);
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing Google Places:', error);
      return false;
    }
  };

  const handleCitySelect = () => {
    try {
      if (!autocompleteCity.current) return;
      
      const place = autocompleteCity.current.getPlace();
      
      if (place && place.name) {
        setFormData(prev => ({ 
          ...prev, 
          cityName: place.name 
        }));
        setErrors(prev => ({ ...prev, cityName: '' }));
      }
    } catch (error) {
      console.error('Error handling city selection:', error);
    }
  };

  // Initialize Google Places 
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;
    
    const tryInitialize = () => {
      const success = initializeGooglePlaces();
      
      if (!success && retryCount < maxRetries) {
        retryCount++;
        setTimeout(tryInitialize, 500);
      } else if (success) {
        console.log('Google Places initialized successfully');
      } else {
        console.error('Failed to initialize Google Places after maximum retries');
      }
    };

    const timer = setTimeout(tryInitialize, 100);

    return () => {
      clearTimeout(timer);
      try {
        if (autocompleteCity.current && window.google?.maps?.event) {
          window.google.maps.event.clearInstanceListeners(autocompleteCity.current);
        }
      } catch (error) {
        console.warn('Error cleaning up listeners:', error);
      }
    };
  }, []);
  
  // All handler functions 
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
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDocumentsChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5);
      
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

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setFormData(prev => ({ ...prev, password: newPassword }));
    validateField('password', newPassword);
  };
  
  // Upload files function 
  const uploadFiles = async (employeeId) => {
    if (!profilePhoto && !documents.length) return true;
    
    try {
      setUploadingFiles(true);
      
      if (profilePhoto) {
        try {
          const existingDocs = await dispatch(fetchDocumentsByEmployeeId(employeeId)).unwrap();
          const existingProfilePic = existingDocs.find(doc => 
            doc.docType === 'profile' || doc.docType === 'picture'
          );
          
          if (existingProfilePic) {
            try {
              await dispatch(deleteDocument(existingProfilePic.docId)).unwrap();
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

          
          const uploadResult = await dispatch(uploadDocument(profileData)).unwrap();

          if (uploadResult && uploadResult.docPath) {
            const updateData = {
              employeeId: employeeId,
              ...formData,
              photo: uploadResult.docPath
            };
            
            
            try {
              await updateEmployee(updateData);
            } catch (updateError) {
              console.error('שגיאה בעדכון נתיב התמונה:', updateError);
            }
          }
        } catch (profileError) {
          console.error('שגיאה בהעלאת תמונת פרופיל:', profileError);
          throw new Error(`שגיאה בהעלאת תמונת פרופיל: ${profileError.message || profileError}`);
        }
      }
      
      if (documents.length > 0) {
        
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
    ['firstName', 'lastName', 'mobilePhone', 'roleName']
    :
    ['firstName', 'lastName', 'email', 'mobilePhone', 'password', 'roleName'];
    
    let isValid = true;
    const newErrors = {};

    for (const field of fieldsToValidate) {
      const extraParams = isEditMode ?
        { required: ['firstName', 'lastName', 'roleName'].includes(field) }
        : { required: ['firstName', 'lastName', 'password', 'roleName'].includes(field) };

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
  
  // Submit function 
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
        result = await updateEmployee(formData);
      } else {
        result = await addEmployee(formData);
      }
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      
      const employeeId = isEditMode ? formData.employeeId : result.data.employeeId;
      
      if (!isEditMode && sendEmail && formData.email) {
        try {
          await sendWelcomeEmail(
            formData.email, 
            formData.password,
            formData.firstName,
            formData.lastName
          );
        } catch (emailError) {
          console.warn('שגיאה בשליחת אימייל:', emailError);
        }
      }
      
      try {
        await uploadFiles(employeeId);
      } catch (uploadError) {
        console.error('שגיאה בהעלאת קבצים:', uploadError);
        
        Swal.fire({
          icon: 'warning',
          title: 'העובד נשמר בהצלחה',
          text: 'אולם אירעה שגיאה בהעלאת הקבצים. אנא נסה להעלות אותם שוב מעמוד עריכת העובד.',
          confirmButtonText: 'אישור'
        });
      }
        
        if (onSubmitSuccess) {
          onSubmitSuccess(result.data);
        } else {
          navigate("/employees/list");
        }
      
      
    } catch (error) {
      console.error('שגיאה בשמירת העובד:', error);
     
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldError = (fieldName) => errors[fieldName] || '';
  const hasFieldError = (fieldName) => Boolean(errors[fieldName]);

  return (
    <ThemeProvider theme={rtlTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
        <FormContainer maxWidth="lg" dir="rtl">
          <EnhancedBreadcrumbs dir="rtl">
            <StyledLink underline="hover" onClick={() => navigate("/")}>
              <HomeIcon />
              ראשי
            </StyledLink>

            <StyledLink
              underline="hover"
              onClick={() => navigate("/employees/list")}
            >
              <GroupIcon />
              ניהול עובדים
            </StyledLink>
            {isEditMode && (
              <StyledLink
                underline="hover"
                onClick={() => navigate(`/employees/profile/${existingEmployee.employeeId}`)}
              >
                <PersonIcon />
                פרופיל עובד
            </StyledLink>
            )}
            <CurrentPage>
              <PersonIcon />
              {isEditMode ? "עריכת עובד" : "קליטת עובד חדש"}
            </CurrentPage>
          </EnhancedBreadcrumbs>

          {/* {!isEditMode && (
            <Fade in timeout={800}>
              <StyledBreadcrumbs aria-label="breadcrumb">
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
                  פרטי עובד
                </Typography>
              </StyledBreadcrumbs>
            </Fade>
          )} */}

          <Zoom in timeout={1000}>
            <MainCard>
              {(submitting || uploadingFiles) && (
                <LoadingOverlay>
                  <Box textAlign="center">
                    <CircularProgress
                      size={60}
                      thickness={4}
                      sx={{
                        color: "#4cb5c3",
                        animation: `${pulse} 1.5s ease-in-out infinite`,
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{ mt: 2, color: "primary.main" }}
                    >
                      {uploadingFiles ? "מעלה קבצים..." : "שומר נתונים..."}
                    </Typography>
                  </Box>
                </LoadingOverlay>
              )}

              <CardContent sx={{ p: 4 }}>
                {/* Professional Main Header */}
                <Box textAlign="center" mb={4}>
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      background:
                        "linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 1,
                      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      fontWeight: 800,
                    }}
                  >
                    {pageTitle}
                  </Typography>
                  <Box
                    sx={{
                      width: 80,
                      height: 4,
                      background:
                        "linear-gradient(90deg, #4cb5c3, #ff7043, #10b981)",
                      margin: "0 auto",
                      borderRadius: 2,
                      animation: `${shimmer} 3s infinite`,
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
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        "& .MuiAlert-icon": {
                          fontSize: "2rem",
                        },
                      }}
                      onClose={() => setSuccessMessage("")}
                    >
                      {successMessage}
                    </Alert>
                  </Fade>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Profile Picture */}
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
                        src={
                          profilePreview ||
                          (isEditMode && formData.photo
                            ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(
                                formData.photo
                              )}`
                            : undefined)
                        }
                        sx={{
                          margin: "0 auto",
                          background:
                            profilePreview || formData.photo
                              ? "transparent"
                              : "linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)",
                        }}
                      >
                        {!profilePreview && !formData.photo && (
                          <PhotoCameraIcon sx={{ fontSize: 40 }} />
                        )}
                      </StyledAvatar>
                    </label>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      לחץ להעלאת תמונת פרופיל
                    </Typography>
                    {profilePhoto && (
                      <StyledChip
                        label={`${profilePhoto.name} (${Math.round(
                          profilePhoto.size / 1024
                        )} KB)`}
                        color="primary"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>

                  {/* Personal Info Section */}
                  <Fade in timeout={1200}>
                    <Card sx={{ mb: 4, borderRadius: 4, overflow: "visible" }}>
                      <CardContent sx={{ p: 3 }}>
                        <SectionHeader>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: "primary.main" }}
                          >
                            👥 פרטים אישיים
                          </Typography>
                        </SectionHeader>

                        <Grid container spacing={3}>
                          <Grid item size={{ xs: 12, md: 6 }}>
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
                            />
                          </Grid>

                          <Grid item size={{ xs: 12, md: 6 }}>
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
                            />
                          </Grid>

                          <Grid item size={{ xs: 12, md: 6 }}>
                            <HebrewReactDatePicker
                              label="📅 תאריך לידה"
                              value={formData.birthDate}
                              onChange={(date) =>
                                handleDateChange("birthDate", date)
                              }
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  variant: "outlined",
                                  error: hasFieldError("birthDate"),
                                  helperText: getFieldError("birthDate"),
                                },
                              }}
                            />
                          </Grid>

                          <Grid item size={{ xs: 12, md: 6 }}>
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
                            />
                          </Grid>

                          <Grid item size={{ xs: 12, md: 6 }}>
                            <TextField
                              fullWidth
                              label="🏙️ עיר"
                              name="cityName"
                              value={formData.cityName}
                              onChange={handleChange}
                              variant="outlined"
                              required
                              error={hasFieldError("cityName")}
                              helperText={
                                getFieldError("cityName") ||
                                "התחל להקליד והמערכת תציע ערים"
                              }
                              inputRef={cityInputRef}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CityIcon />
                                  </InputAdornment>
                                ),
                              }}
                              onFocus={() => {
                                if (
                                  !autocompleteCity.current &&
                                  window.google?.maps?.places
                                ) {
                                  setTimeout(
                                    () => initializeGooglePlaces(),
                                    100
                                  );
                                }
                              }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Fade>

                  {/* Work Info Section */}
                  <Fade in timeout={1400}>
                    <Card sx={{ mb: 4, borderRadius: 4, overflow: "visible" }}>
                      <CardContent sx={{ p: 3 }}>
                        <SectionHeader>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: "secondary.main" }}
                          >
                            💼 פרטי העסקה
                          </Typography>
                        </SectionHeader>

                        <Grid container spacing={3}>
                          <Grid item size={{ xs: 12, md: 6 }}>
                            <FormControl
                              fullWidth
                              variant="outlined"
                              required
                              error={hasFieldError("roleName")}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 3,
                                  background: "rgba(255, 255, 255, 0.9)",
                                  backdropFilter: "blur(10px)",
                                },
                              }}
                            >
                              <InputLabel>🎯 תפקיד</InputLabel>
                              <Select
                                dir="rtl"
                                name="roleName"
                                value={formData.roleName}
                                onChange={handleChange}
                                label="תפקיד"
                                MenuProps={{
                                  anchorOrigin: {
                                    vertical: "bottom",
                                    horizontal: "left",
                                  },
                                  transformOrigin: {
                                    vertical: "top",
                                    horizontal: "left",
                                  },
                                  getContentAnchorEl: null,
                                }}
                              >
                                {!roles.length ? (
                                  <MenuItem disabled>טוען תפקידים...</MenuItem>
                                ) : (
                                  roles.map((role) => (
                                    <MenuItem
                                      dir="rtl"
                                      key={role.roleName}
                                      value={role.roleName}
                                    >
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

                          <Grid item size={{ xs: 12, md: 6 }}>
                            <TextField
                              fullWidth
                              label="📄 מספר רישיון"
                              name="licenseNum"
                              value={formData.licenseNum}
                              onChange={handleChange}
                              variant="outlined"
                              error={hasFieldError("licenseNum")}
                              helperText={getFieldError("licenseNum")}
                            />
                          </Grid>

                          <Grid item size={{ xs: 12, md: 6 }}>
                            <HebrewReactDatePicker
                              label="📅 תאריך תחילת עבודה"
                              value={formData.startDate}
                              onChange={(date) =>
                                handleDateChange("startDate", date)
                              }
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  variant: "outlined",
                                },
                              }}
                            />
                          </Grid>

                          <Grid item size={{ xs: 12, md: 6 }}>
                            <FormControl
                              required
                              fullWidth
                              variant="outlined"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 3,
                                  background: "rgba(255, 255, 255, 0.9)",
                                  backdropFilter: "blur(10px)",
                                },
                              }}
                            >
                              <InputLabel>🏫 שיוך לכיתה</InputLabel>
                              <Select
                                name="classId"
                                value={formData.classId}
                                onChange={handleChange}
                                label="שיוך לכיתה"
                                MenuProps={{
                                  anchorOrigin: {
                                    vertical: "bottom",
                                    horizontal: "left",
                                  },
                                  transformOrigin: {
                                    vertical: "top",
                                    horizontal: "left",
                                  },
                                  getContentAnchorEl: null,
                                  style: { marginTop: 0 },
                                }}
                              >
                                {!classes.length ? (
                                  <MenuItem disabled>טוען כיתות...</MenuItem>
                                ) : (
                                  classes.map((cls) => (
                                    <MenuItem
                                      dir="rtl"
                                      key={cls.classId}
                                      value={cls.classId}
                                    >
                                      {cls.className}
                                    </MenuItem>
                                  ))
                                )}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item size={{ xs: 12, md: 6 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                p: 2,
                                borderRadius: 2,
                                bgcolor: alpha("#10b981", 0.05),
                                border: `1px solid ${alpha("#10b981", 0.2)}`,
                              }}
                            >
                              <FormControlLabel
                                control={
                                  <Switch
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleSwitchChange}
                                    color="success"
                                  />
                                }
                                label="עובד פעיל"
                                sx={{ fontWeight: 600 }}
                              />
                            </Box>
                          </Grid>

                          <Grid item size={{ xs: 12 }}>
                            <Button
                              variant="outlined"
                              component="label"
                              disabled={isEditMode}
                              startIcon={<CloudUpload />}
                              fullWidth
                              sx={{
                                height: 64,
                                borderStyle: "dashed",
                                borderWidth: 2,
                                borderRadius: 3,
                                fontSize: "1.1rem",
                                borderColor: alpha("#4cb5c3", 0.3),
                                color: "#4cb5c3",
                                "&:hover": {
                                  borderStyle: "dashed",
                                  backgroundColor: alpha("#4cb5c3", 0.08),
                                  borderColor: "#4cb5c3",
                                },
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
                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}
                              >
                                {documents.map((doc, index) => (
                                  <StyledChip
                                    key={index}
                                    label={`${doc.name} (${Math.round(
                                      doc.size / 1024
                                    )} KB)`}
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

                  {/* Login Info Section */}
                  {!isEditMode && (
                    <Fade in timeout={1600}>
                      <Card
                        sx={{ mb: 4, borderRadius: 4, overflow: "visible" }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <SectionHeader>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 600, color: "#ef4444" }}
                            >
                              🛡️ פרטי כניסה למערכת
                            </Typography>
                          </SectionHeader>

                          <Grid container spacing={3}>
                            <Grid item size={{ xs: 12 }}>
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
                              />
                            </Grid>

                            <Grid item size={{ xs: 12 }}>
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
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Tooltip
                                        placement="top"
                                        PopperProps={{
                                          disablePortal: true,
                                          modifiers: [
                                            {
                                              name: "flip",
                                              enabled: false,
                                            },
                                            {
                                              name: "preventOverflow",
                                              options: {
                                                boundary: "window",
                                              },
                                            },
                                          ],
                                        }}
                                        title={
                                          showPassword
                                            ? "הסתר סיסמה"
                                            : "הצג סיסמה"
                                        }
                                      >
                                        <IconButton
                                          onClick={() =>
                                            setShowPassword(!showPassword)
                                          }
                                          edge="end"
                                        >
                                          {showPassword ? (
                                            <VisibilityOff />
                                          ) : (
                                            <Visibility />
                                          )}
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip
                                        placement="top"
                                        PopperProps={{
                                          disablePortal: true,
                                          modifiers: [
                                            {
                                              name: "flip",
                                              enabled: false,
                                            },
                                            {
                                              name: "preventOverflow",
                                              options: {
                                                boundary: "window",
                                              },
                                            },
                                          ],
                                        }}
                                        title="העתק סיסמה"
                                      >
                                        <IconButton
                                          disabled={!formData.password}
                                          edge="end"
                                          onClick={() =>
                                            navigator.clipboard.writeText(
                                              formData.password
                                            )
                                          }
                                        >
                                          <ContentCopy />
                                        </IconButton>
                                      </Tooltip>
                                    </InputAdornment>
                                  ),
                                }}
                              />

                              <GlowingButton
                                onClick={handleGeneratePassword}
                                variant="outlined"
                                sx={{
                                  mt: 2,
                                  borderRadius: 3,
                                  borderColor: "#4cb5c3",
                                  color: "#4cb5c3",
                                  "&:hover": {
                                    borderColor: "#2a8a95",
                                    background: alpha("#4cb5c3", 0.08),
                                  },
                                }}
                              >
                                ✨ ייצר סיסמה אקראית
                              </GlowingButton>
                            </Grid>

                            <Grid item size={{ xs: 12 }}>
                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: alpha("#10b981", 0.05),
                                  border: `1px solid ${alpha("#10b981", 0.2)}`,
                                }}
                              >
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={sendEmail}
                                      onChange={(e) =>
                                        setSendEmail(e.target.checked)
                                      }
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

                  {/* Action Buttons */}
                  <Fade in timeout={1800}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 4,
                        gap: 2,
                      }}
                    >
                      <GlowingButton
                        variant="outlined"
                        onClick={() =>
                          isEditMode ? onClose() : navigate("/employees/list")
                        }
                        disabled={submitting || uploadingFiles}
                        sx={{
                          borderRadius: 3,
                          px: 4,
                          py: 1.5,
                          fontSize: "1.1rem",
                          borderWidth: 2,
                          borderColor: "#6b7280",
                          color: "#6b7280",
                          "&:hover": {
                            borderWidth: 2,
                            borderColor: "#4b5563",
                            background: alpha("#6b7280", 0.08),
                          },
                        }}
                      >
                        {isEditMode ? "סגור" : "→ חזרה לרשימה"}
                      </GlowingButton>

                      <GlowingButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={submitting || uploadingFiles}
                        sx={{
                          px: 4,
                          py: 1.5,
                          fontSize: "1.1rem",
                          borderRadius: 3,
                          minWidth: 200,
                          background:
                            "linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)",
                          boxShadow: "0 6px 20px rgba(76, 181, 195, 0.3)",
                          "&:hover": {
                            background:
                              "linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)",
                            boxShadow: "0 8px 25px rgba(76, 181, 195, 0.4)",
                          },
                        }}
                      >
                        {submitting || uploadingFiles ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          submitButtonText
                        )}
                      </GlowingButton>
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