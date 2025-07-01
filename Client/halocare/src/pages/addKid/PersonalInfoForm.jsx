// src/pages/kids/PersonalInfoForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
   Typography, TextField, MenuItem, FormControl,
  InputLabel, Select, Button, Box, Avatar, FormHelperText,
  Alert, AlertTitle, InputAdornment, Tooltip, CircularProgress,
  Paper, Chip, RadioGroup, FormControlLabel, Radio,
  Zoom, Card, CardContent, Badge,
  IconButton, Switch, Collapse, useTheme, Container,
  Fade, Stack, alpha
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  DeleteOutline as DeleteIcon,
  CloudUpload as UploadIcon,
  Info as InfoIcon,
  ContactPhone as CallIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Cake as CakeIcon,
  LocationCity as CityIcon,
  LocalHospital as HospitalIcon,
  Error as ErrorIcon,
  Face as FaceIcon,
  NavigateNext as NextIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Celebration as CelebrationIcon,
  Celebration,
  AutoAwesome
} from '@mui/icons-material';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female'
import BadgeIcon from '@mui/icons-material/Badge';
import Swal from 'sweetalert2';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { fetchCities } from '../../Redux/features/citiesSlice';
import { fetchClasses } from '../../Redux/features/classesSlice';
import { fetchHealthInsurances } from '../../Redux/features/healthinsurancesSlice';
import { fetchParentById } from '../../Redux/features/parentSlice';
import { createKidWithParents, updateKidWithParents, fetchKids } from '../../Redux/features/kidsSlice';
import { uploadDocument, deleteDocument, fetchDocumentsByKidId } from '../../Redux/features/documentsSlice';
import { baseURL } from "../../components/common/axiosConfig";

const rtlTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '2.2rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.8rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.4rem'
    }
  },
  palette: {
    primary: {
      main: '#4cb5c3',
      light: '#7cd8e5',
      dark: '#2a8a95',
    },
    secondary: {
      main: '#ff7043',
      light: '#ffa270',
      dark: '#c63f17',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#047857',
    },
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4cb5c3',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4cb5c3',
              borderWidth: 2,
            }
          }
        }
      }
    }
  }
});

const FullScreenContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(76, 181, 195, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 112, 67, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  }
}));

// Styled Card
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 24,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    borderRadius: '24px 24px 0 0',
  }
}));

// Animated Section
const AnimatedSection = styled(Card)(({ theme, expanded }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: 20,
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: expanded
    ? `0 12px 40px rgba(0,0,0,0.15), 0 0 0 2px ${theme.palette.primary.main}38`
    : '0 6px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: expanded ? 'translateY(-2px)' : 'translateY(0)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: expanded ? '4px' : '2px',
    background: expanded 
      ? 'linear-gradient(90deg, #4cb5c3, #ff7043)' 
      : 'linear-gradient(90deg, rgba(76, 181, 195, 0.3), rgba(255, 112, 67, 0.3))',
    transition: 'all 0.3s ease',
  },
  '&:hover': {
    boxShadow: `0 10px 35px rgba(0,0,0,0.12), 0 0 0 2px ${theme.palette.primary.main}15`,
  },
}));

// SectionHeader
const SectionHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.04) 0%, rgba(255, 112, 67, 0.04) 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.08) 0%, rgba(255, 112, 67, 0.08) 100%)',
  },
}));

// SectionIcon
const SectionIcon = styled(Box)(({ theme, expanded }) => ({
  marginLeft: theme.spacing(2),
  color: expanded ? theme.palette.primary.main : theme.palette.primary.main,
  background: expanded 
    ? 'linear-gradient(135deg, rgba(76, 181, 195, 0.15), rgba(76, 181, 195, 0.25))' 
    : 'rgba(76, 181, 195, 0.1)',
  borderRadius: '50%',
  padding: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: expanded ? 'scale(1.1)' : 'scale(1)',
  boxShadow: expanded ? '0 4px 15px rgba(76, 181, 195, 0.3)' : 'none',
}));

// SectionTitle
const SectionTitle = styled(Typography)(({ theme, expanded }) => ({
  display: 'flex',
  alignItems: 'center',
  fontWeight: 700,
  fontSize: '1.3rem',
  color: expanded ? theme.palette.primary.main : theme.palette.text.primary,
  transition: 'all 0.3s ease',
}));

// AnimatedButton
const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: '14px 28px',
  fontWeight: 700,
  fontSize: '1.05rem',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  boxShadow: '0 8px 25px rgba(76, 181, 195, 0.4)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 15px 40px rgba(76, 181, 195, 0.5)',
    background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    transition: 'all 0.6s ease',
  },
  '&:hover::after': {
    left: '100%',
  }
}));

// UploadButton
const UploadButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: 20,
  padding: theme.spacing(1.5, 4),
  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
  background: 'linear-gradient(135deg, #4cb5c3, #64b5f6)',
  transition: 'all 0.3s ease',
  color: 'white',
  fontWeight: 600,
  '&:hover': {
    background: 'linear-gradient(135deg, #2a8a95, #4cb5c3)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.25)',
    transform: 'translateY(-2px)',
  }
}));

// ActionButtonsContainer
const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(4),
  padding: theme.spacing(3),
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.02) 0%, rgba(255, 112, 67, 0.02) 100%)',
  borderRadius: '0 0 24px 24px',
}));

// Styled Avatar
const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 180,
  height: 180,
  border: '6px solid white',
  borderRadius: '50%',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  background: 'linear-gradient(135deg, #4cb5c3, #ff7043)',
  fontSize: '4rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
  }
}));

// ProfilePhotoContainer
const ProfilePhotoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.05), rgba(255, 112, 67, 0.05))',
  borderRadius: 20,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, rgba(76, 181, 195, 0.1) 0%, transparent 70%)',
    borderRadius: 20,
    pointerEvents: 'none',
  }
}));

// validation schema
const validationSchema = yup.object({
  firstName: yup.string().required('שם פרטי הוא שדה חובה'),
  lastName: yup.string().required('שם משפחה הוא שדה חובה'),
  birthDate: yup.date().required('תאריך לידה הוא שדה חובה')
    .max(new Date(), 'תאריך לידה לא יכול להיות בעתיד')
    .test('age', 'הגיל חייב להיות בין 0-3 שנים',
      (value) => {
        if (!value) return true;
        const today = new Date();
        const threeYearsAgo = new Date();
        threeYearsAgo.setFullYear(today.getFullYear() - 3);
        return value >= threeYearsAgo;
      }),
  gender: yup.string().required('מין הוא שדה חובה'),
  cityName: yup.string().required('עיר היא שדה חובה'),
  address: yup.string().required('כתובת היא שדה חובה'),
  hName: yup.string().required('קופת חולים היא שדה חובה'),
  idNumber: yup.string()
    .required('תעודת זהות היא שדה חובה')
    .matches(/^\d{9}$/, 'תעודת זהות צריכה להכיל 9 ספרות'),

  parent1FirstName: yup.string().required('שם הורה ראשי הוא שדה חובה'),
  parent1LastName: yup.string().required('שם משפחה הורה ראשי הוא שדה חובה'),
  parent1Mobile: yup.string()
    .required('טלפון נייד הורה ראשי הוא שדה חובה')
    .matches(/^05\d{8}$/, 'מספר טלפון לא תקין'),
  parent1Email: yup.string().email('כתובת דוא״ל לא תקינה').required('דוא״ל הורה ראשי חובה'),

  parent2Mobile: yup.string()
    .nullable()
    .test('valid-phone', 'מספר טלפון לא תקין', (value) => {
      return !value || /^05\d{8}$/.test(value);
    }),
  parent2Email: yup.string().nullable().email('כתובת דוא״ל לא תקינה'),
});

const PersonalInfoForm = ({ data, onUpdate, isEditMode = false }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(data?.photoPath || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // expandedSections
  const [expandedSections, setExpandedSections] = useState({
    childDetails: true,
    primaryParent: false,
    secondaryParent: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const { cities, status: citiesStatus } = useSelector(state => state.cities);
  const { kids, status: kidStatus, error: kidError } = useSelector(state => state.kids);
  const { classes, status: classesStatus } = useSelector(state => state.classes || { classes: [], status: 'idle' });
  const { healthInsurances, status: healthInsurancesStatus } = useSelector(state => state.healthInsurances);
  const isLoading = kidStatus === 'loading';

  // Function to set initial values
  const getInitialValues = () => {
    if (data && isEditMode) {
      return {
        // kid info
        id: data.id || 0,
        idNumber: data.id || 0,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        gender: data.gender || '',
        cityName: data.cityName || '',
        address: data.address || '',
        hName: data.hName || '',
        photo: data.photo || '',
        classId: data.classId || '',
        pathToFolder: data.pathToFolder || '',
        isActive: data.isActive !== undefined ? data.isActive : true,

        // Primary parent details 
        parent1Id: data.parentId1 || 0,
        parent1FirstName: data.parent1FirstName || '',
        parent1LastName: data.parent1LastName || '',
        parent1Mobile: data.parent1Mobile || '',
        parent1Email: data.parent1Email || '',
        parent1Address: data.parent1Address || data.address || '',
        parent1CityName: data.parent1CityName || data.cityName || '',

        //  Secondary parent details
        parent2Id: data.parentId2 || 0,
        parent2FirstName: data.parent2FirstName || '',
        parent2LastName: data.parent2LastName || '',
        parent2Mobile: data.parent2Mobile || '',
        parent2Email: data.parent2Email || '',
        parent2Address: data.parent2Address || '',
        parent2CityName: data.parent2CityName || '',

        homePhone: data.homePhone || '',
      };
    }

    // Empty values for a new child
    return {
      id: 0,
      idNumber: '',
      firstName: '',
      lastName: '',
      birthDate: null,
      gender: '',
      cityName: '',
      address: '',
      hName: '',
      photo: '',
      classId: '',
      pathToFolder: '',
      isActive: true,
      parent1Id: 0,
      parent1FirstName: '',
      parent1LastName: '',
      parent1Mobile: '',
      parent1Email: '',
      parent1Address: '',
      parent1CityName: '',
      parent2Id: 0,
      parent2FirstName: '',
      parent2LastName: '',
      parent2Mobile: '',
      parent2Email: '',
      parent2Address: '',
      parent2CityName: '',
      homePhone: '',
    };
  };

  // Loading reference data + parent data in edit mode
  useEffect(() => {
    dispatch(fetchCities());
    dispatch(fetchClasses());
    dispatch(fetchHealthInsurances());
    dispatch(fetchKids());

    // Loading parent data in edit mode
    if (isEditMode && data) {
      loadParentsData();
    }
  }, [dispatch, data, isEditMode]);

  // Loading parent data
  const loadParentsData = async () => {
    try {
      if (data.parentId1) {
        const parent1Result = await dispatch(fetchParentById(data.parentId1)).unwrap();
        formik.setValues(prev => ({
          ...prev,
          parent1FirstName: parent1Result.firstName || '',
          parent1LastName: parent1Result.lastName || '',
          parent1Mobile: parent1Result.mobilePhone || '',
          parent1Email: parent1Result.email || '',
          parent1Address: parent1Result.address || '',
          parent1CityName: parent1Result.cityName || '',
        }));
      }

      if (data.parentId2) {
        const parent2Result = await dispatch(fetchParentById(data.parentId2)).unwrap();
        formik.setValues(prev => ({
          ...prev,
          parent2FirstName: parent2Result.firstName || '',
          parent2LastName: parent2Result.lastName || '',
          parent2Mobile: parent2Result.mobilePhone || '',
          parent2Email: parent2Result.email || '',
          parent2Address: parent2Result.address || '',
          parent2CityName: parent2Result.cityName || '',
        }));
      }
    } catch (error) {
      console.error('Error loading parents data:', error);
    }
  };

  useEffect(() => {
    if (data && isEditMode) {
      formik.resetForm({ values: getInitialValues() });
    }
  }, [data, isEditMode]);

  // Change picture
  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    
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

    setPhotoFile(file);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Function to upload profile picture
  const uploadProfilePhoto = async (kidId) => {
    if (!photoFile) return null;

    try {
      setUploadingPhoto(true);

      // Delete existing profile picture if it exists
      if (isEditMode) {
        const existingDocs = await dispatch(fetchDocumentsByKidId(kidId)).unwrap();
        const existingProfilePic = existingDocs.find(doc => doc.docType === 'profile');

        if (existingProfilePic) {
          await dispatch(deleteDocument(existingProfilePic.docId)).unwrap();
        }
      }

      // profile Data
      const profileData = {
        document: {
          KidId: kidId.toString(),
          DocType: "profile",
          DocName: photoFile.name,
        },
        file: photoFile
      };

      // upload picture
      const uploadResult = await dispatch(uploadDocument(profileData)).unwrap();

    } catch (error) {
      console.error('שגיאה בהעלאת תמונת פרופיל:', error);
      Swal.fire({
        icon: 'error',
        title: 'שגיאה בהעלאת התמונה',
        text: 'אירעה שגיאה בהעלאת תמונת הפרופיל. אנא נסה שוב.',
        confirmButtonText: 'אישור'
      });
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Formik
  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);

        const formDataForSlice = { ...values };

        let result;

        if (isEditMode) {
          result = await dispatch(updateKidWithParents(formDataForSlice)).unwrap();

          let updatedKid = result.kid;
          if (photoFile) {
            const photoPath = await uploadProfilePhoto(result.kid.id);
            if (photoPath) {
              updatedKid = {
                ...result.kid,
                photoPath: photoPath
              };
            }
          }

          Swal.fire({
            icon: 'success',
            title: '🎉 עודכן בהצלחה!',
            text: `פרטי הילד ${formDataForSlice.firstName} ${formDataForSlice.lastName} עודכנו בהצלחה`,
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          result = await dispatch(createKidWithParents(formDataForSlice)).unwrap();

          let updatedKid = result.kid;
          if (photoFile) {
            const photoPath = await uploadProfilePhoto(result.kid.id);
            if (photoPath) {
              updatedKid = {
                ...result.kid,
                photoPath: photoPath
              };
            }
          }

          Swal.fire({
            icon: 'success',
            title: '🎉 נשמר בהצלחה!',
            text: `פרטי הילד ${result.kid.firstName} ${result.kid.lastName} נשמרו בהצלחה`,
            timer: 2000,
            showConfirmButton: false
          });
        }

        // Update parent component
        onUpdate(result.kid);

      } catch (error) {
        console.error('שגיאה בשמירת נתוני הילד וההורים:', error);
        Swal.fire({
          icon: 'error',
          title: 'שגיאה בשמירת הנתונים',
          text: error.message || 'אירעה שגיאה בלתי צפויה, אנא נסה שנית',
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const isFormFilled = formik.dirty && Object.values(formik.values).some(val => val !== '');

  return (
    <ThemeProvider theme={rtlTheme}>
      <FullScreenContainer>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <form dir="rtl" onSubmit={formik.handleSubmit}>
            
            <StyledCard>
             { /* Form title with effects */}
              <Box sx={{
                p: 4,
                background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1) 0%, rgba(255, 112, 67, 0.1) 100%)',
                borderRadius: '24px 24px 0 0',
                textAlign: 'center',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #4cb5c3, #ff7043)',
                  borderRadius: '0 0 10px 10px',
                }
              }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
                  {/* <AutoAwesome sx={{ fontSize: 40, color: '#4cb5c3' }} /> */}
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #4cb5c3, #ff7043)',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}>
                    {isEditMode ? '✏️ עריכת פרטי ילד' : ' קליטת ילד חדש'}
                  </Typography>
                  {/* <Celebration sx={{ fontSize: 40, color: '#ff7043' }} /> */}
                </Stack>
                <Typography variant="h6" color="text.secondary">
                  {isEditMode 
                    ? 'עדכון פרטי הילד וההורים במערכת' 
                    : 'מילוי פרטי הילד וההורים לקליטה במערכת'
                  }
                </Typography>
              </Box>

             {/* Error message if exists */}
              {kidError && (
                <Zoom in={true}>
                  <Alert
                    severity="error"
                    sx={{
                      mx: 3,
                      mt: 3,
                      borderRadius: 3,
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      boxShadow: "0 6px 20px rgba(239, 68, 68, 0.2)",
                    }}
                    variant="filled"
                    icon={<ErrorIcon />}
                  >
                    <AlertTitle sx={{ fontWeight: 700 }}>⚠️ שגיאה</AlertTitle>
                    {kidError}
                  </Alert>
                </Zoom>
              )}

              <Box sx={{ p: 4 }}>
               { /* Profile picture */}
                <ProfilePhotoContainer>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    badgeContent={
                      <Tooltip title="העלאת תמונה">
                        <label htmlFor="kid-photo-upload">
                          <IconButton
                            aria-label="העלאת תמונה"
                            component="span"
                            sx={{
                              bgcolor: "primary.main",
                              color: "white",
                              width: 50,
                              height: 50,
                              boxShadow: '0 4px 15px rgba(76, 181, 195, 0.4)',
                              "&:hover": { 
                                bgcolor: "primary.dark",
                                transform: 'scale(1.1)',
                                boxShadow: '0 6px 20px rgba(76, 181, 195, 0.5)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                            disabled={uploadingPhoto}
                          >
                            {uploadingPhoto ? <CircularProgress size={24} color="inherit" /> : <UploadIcon />}
                          </IconButton>
                        </label>
                      </Tooltip>
                    }
                  >
                    <StyledAvatar
                      src={
                        photoPreview 
                          ? (isEditMode 
                              ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(photoPreview)}`
                              : photoPreview
                            )
                          : undefined
                      }
                    >
                      {!photoPreview && <FaceIcon sx={{ fontSize: 100, opacity: 0.7 }} />}
                    </StyledAvatar>
                  </Badge>

                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="kid-photo-upload"
                    type="file"
                    onChange={handlePhotoChange}
                    disabled={uploadingPhoto}
                  />

                  <UploadButton
                    variant="contained"
                    component="label"
                    htmlFor="kid-photo-upload"
                    disabled={uploadingPhoto}
                  >
                    {photoPreview ? "🔄 החלף תמונה" : "📸 העלאת תמונה"}
                  </UploadButton>

                  {/* Show file name if selected */}
                  {photoFile && (
                    <Fade in>
                      <Typography variant="caption" display="block" sx={{ 
                        mt: 2, 
                        textAlign: 'center',
                        color: 'text.secondary',
                        background: 'rgba(76, 181, 195, 0.1)',
                        padding: '8px 16px',
                        borderRadius: 20,
                        border: '1px solid rgba(76, 181, 195, 0.2)'
                      }}>
                        📁 {photoFile.name} ({Math.round(photoFile.size / 1024)} KB)
                      </Typography>
                    </Fade>
                  )}
                </ProfilePhotoContainer>

                {/* Section 1: Child Details */}
                <AnimatedSection expanded={expandedSections.childDetails}>
                  <SectionHeader onClick={() => toggleSection("childDetails")}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SectionTitle variant="h6" expanded={expandedSections.childDetails}>
                        👶 פרטי הילד
                        <Chip
                          label="פרטים בסיסיים"
                          size="small"
                          color={expandedSections.childDetails ? "primary" : "default"}
                          sx={{ ml: 2, fontWeight: 600 }}
                          icon={<StarIcon />}
                        />
                      </SectionTitle>
                    </Box>
                    <IconButton
                      size="small"
                      color={expandedSections.childDetails ? "primary" : "default"}
                      sx={{
                        transform: expandedSections.childDetails
                          ? "rotate(-90deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        background: expandedSections.childDetails 
                          ? 'rgba(76, 181, 195, 0.1)' 
                          : 'transparent',
                        '&:hover': {
                          background: 'rgba(76, 181, 195, 0.2)',
                        }
                      }}
                    >
                      <NextIcon />
                    </IconButton>
                  </SectionHeader>

                  <Collapse in={expandedSections.childDetails}>
                    <CardContent sx={{ p: 4 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="firstName"
                            name="firstName"
                            label="שם פרטי"
                            placeholder="שם פרטי של הילד"
                            value={formik.values.firstName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                              formik.touched.firstName && Boolean(formik.errors.firstName)
                            }
                            helperText={
                              formik.touched.firstName && formik.errors.firstName
                            }
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonIcon color="primary" />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#4cb5c3',
                                  borderWidth: 2,
                                },
                              }
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="lastName"
                            name="lastName"
                            label="שם משפחה"
                            placeholder="שם משפחה של הילד"
                            value={formik.values.lastName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                              formik.touched.lastName && Boolean(formik.errors.lastName)
                            }
                            helperText={formik.touched.lastName && formik.errors.lastName}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonIcon color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="idNumber"
                            name="idNumber"
                            label="תעודת זהות"
                            placeholder="מספר תעודת זהות של הילד"
                            value={formik.values.idNumber}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.idNumber && Boolean(formik.errors.idNumber)}
                            helperText={formik.touched.idNumber && formik.errors.idNumber}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <BadgeIcon color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <DatePicker
                            label="תאריך לידה"
                            value={formik.values.birthDate}
                            onChange={(date) => formik.setFieldValue("birthDate", date)}
                            slots={{
                              textField: TextField
                            }}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                required: true,
                                error: formik.touched.birthDate && Boolean(formik.errors.birthDate),
                                helperText: formik.touched.birthDate && formik.errors.birthDate,
                                InputProps: {
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <CakeIcon color="primary" />
                                    </InputAdornment>
                                  ),
                                }
                              }
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl
                            fullWidth
                            required
                            error={formik.touched.gender && Boolean(formik.errors.gender)}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1, fontWeight: 600 }}
                            >
                              מין
                            </Typography>
                            <RadioGroup
                              row
                              aria-labelledby="gender-radio-group-label"
                              name="gender"
                              value={formik.values.gender}
                              onChange={formik.handleChange}
                              sx={{
                                '& .MuiFormControlLabel-root': {
                                  border: '2px solid transparent',
                                  borderRadius: 2,
                                  padding: '8px 16px',
                                  margin: '0 8px 0 0',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    background: 'rgba(76, 181, 195, 0.1)',
                                    borderColor: '#4cb5c3',
                                  }
                                }
                              }}
                            >
                              <FormControlLabel
                                value="זכר"
                                control={
                                  <Radio
                                    icon={<MaleIcon color="action" />}
                                    checkedIcon={<MaleIcon color="primary" />}
                                  />
                                }
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography fontWeight={600}>👦 זכר</Typography>
                                  </Box>
                                }
                              />
                              <FormControlLabel
                                value="נקבה"
                                control={
                                  <Radio
                                    icon={<FemaleIcon color="action" />}
                                    checkedIcon={<FemaleIcon color="secondary" />}
                                  />
                                }
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography fontWeight={600}>👧 נקבה</Typography>
                                  </Box>
                                }
                              />
                            </RadioGroup>
                            {formik.touched.gender && formik.errors.gender && (
                              <FormHelperText>{formik.errors.gender}</FormHelperText>
                            )}
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl
                            fullWidth
                            error={
                              formik.touched.cityName && Boolean(formik.errors.cityName)
                            }
                            required
                          >
                            <InputLabel id="cityName-label"> עיר</InputLabel>
                            <Select
                              labelId="cityName-label"
                              id="cityName"
                              name="cityName"
                              value={formik.values.cityName}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              label="🏙️ עיר"
                              startAdornment={
                                <InputAdornment position="start">
                                  <CityIcon color="primary" />
                                </InputAdornment>
                              }
                            >
                              {citiesStatus === "loading" ? (
                                <MenuItem value="">
                                  <CircularProgress size={20} />
                                  טוען ערים...
                                </MenuItem>
                              ) : (
                                cities.map((city) => (
                                  <MenuItem key={city.id || city.name} value={city.cityName}>
                                    {city.cityName}
                                  </MenuItem>
                                ))
                              )}
                            </Select>
                            {formik.touched.cityName && formik.errors.cityName && (
                              <FormHelperText>{formik.errors.cityName}</FormHelperText>
                            )}
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="address"
                            name="address"
                            label="כתובת"
                            placeholder="רחוב, מספר בית, שכונה"
                            value={formik.values.address}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                              formik.touched.address && Boolean(formik.errors.address)
                            }
                            helperText={formik.touched.address && formik.errors.address}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <HomeIcon color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl
                            fullWidth
                            error={formik.touched.hName && Boolean(formik.errors.hName)}
                            required
                          >
                            <InputLabel id="hName-label"> קופת חולים</InputLabel>
                            <Select
                              labelId="hName-label"
                              id="hName"
                              name="hName"
                              value={formik.values.hName}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              label="🏥 קופת חולים"
                              startAdornment={
                                <InputAdornment position="start">
                                  <HospitalIcon color="primary" />
                                </InputAdornment>
                              }
                            >
                              {healthInsurances.map((insurance) => (
                                <MenuItem key={insurance.hName} value={insurance.hName}>
                                  {insurance.hName}
                                </MenuItem>
                              ))}
                            </Select>
                            {formik.touched.hName && formik.errors.hName && (
                              <FormHelperText>{formik.errors.hName}</FormHelperText>
                            )}
                          </FormControl>
                        </Grid>

                      {  /* Class selection field if class data exists */}
                        {classes && classes.length > 0 && (
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                              <InputLabel id="classId-label"> כיתה</InputLabel>
                              <Select
                                labelId="classId-label"
                                id="classId"
                                name="classId"
                                value={formik.values.classId}
                                onChange={formik.handleChange}
                                label="📚 כיתה"
                                startAdornment={
                                  <InputAdornment position="start">
                                    <SchoolIcon color="primary" />
                                  </InputAdornment>
                                }
                              >
                                {classes.map((classItem) => (
                                  <MenuItem key={classItem.classId} value={classItem.classId}>
                                     {classItem.className}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        )}

                       { /* Active status toggle */}
                        <Grid item xs={12}>
                          <Box sx={{ 
                            p: 2, 
                            background: 'rgba(76, 181, 195, 0.05)', 
                            borderRadius: 2,
                            border: '1px solid rgba(76, 181, 195, 0.2)'
                          }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  id="isActive"
                                  name="isActive"
                                  checked={formik.values.isActive}
                                  onChange={formik.handleChange}
                                  color="success"
                                  size="large"
                                />
                              }
                              label={
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontWeight: 600,
                                    color: formik.values.isActive
                                      ? "success.main"
                                      : "text.secondary"
                                  }}
                                >
                                  {formik.values.isActive
                                    ? "✅ פעיל במערכת"
                                    : "❌ לא פעיל במערכת"}
                                </Typography>
                              }
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </AnimatedSection>

                {/* Section 2: Primary Parent Details */}
                <AnimatedSection expanded={expandedSections.primaryParent}>
                  <SectionHeader onClick={() => toggleSection("primaryParent")}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SectionTitle variant="h6" expanded={expandedSections.primaryParent}>
                        👨‍👩‍👧‍👦 פרטי הורה ראשי
                        <Chip
                          label="חובה"
                          size="small"
                          color={expandedSections.primaryParent ? "secondary" : "default"}
                          sx={{ ml: 2, fontWeight: 600 }}
                          icon={<StarIcon />}
                        />
                      </SectionTitle>
                    </Box>
                    <IconButton
                      size="small"
                      color={expandedSections.primaryParent ? "primary" : "default"}
                      sx={{
                        transform: expandedSections.primaryParent
                          ? "rotate(-90deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        background: expandedSections.primaryParent 
                          ? 'rgba(255, 112, 67, 0.1)' 
                          : 'transparent',
                        '&:hover': {
                          background: 'rgba(255, 112, 67, 0.2)',
                        }
                      }}
                    >
                      <NextIcon />
                    </IconButton>
                  </SectionHeader>

                  <Collapse in={expandedSections.primaryParent}>
                    <CardContent sx={{ p: 4 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="parent1FirstName"
                            name="parent1FirstName"
                            label="שם פרטי"
                            placeholder="שם פרטי ההורה"
                            value={formik.values.parent1FirstName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                              formik.touched.parent1FirstName &&
                              Boolean(formik.errors.parent1FirstName)
                            }
                            helperText={
                              formik.touched.parent1FirstName &&
                              formik.errors.parent1FirstName
                            }
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonIcon color="secondary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="parent1LastName"
                            name="parent1LastName"
                            label="שם משפחה"
                            placeholder="שם משפחה ההורה"
                            value={formik.values.parent1LastName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                              formik.touched.parent1LastName &&
                              Boolean(formik.errors.parent1LastName)
                            }
                            helperText={
                              formik.touched.parent1LastName &&
                              formik.errors.parent1LastName
                            }
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonIcon color="secondary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="parent1Mobile"
                            name="parent1Mobile"
                            label="טלפון נייד"
                            placeholder="05X-XXXXXXX"
                            value={formik.values.parent1Mobile}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                              formik.touched.parent1Mobile &&
                              Boolean(formik.errors.parent1Mobile)
                            }
                            helperText={
                              formik.touched.parent1Mobile && formik.errors.parent1Mobile
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CallIcon color="secondary" />
                                </InputAdornment>
                              ),
                            }}
                            required
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="parent1Email"
                            name="parent1Email"
                            label="דוא״ל"
                            type="email"
                            placeholder="example@mail.com"
                            value={formik.values.parent1Email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                              formik.touched.parent1Email &&
                              Boolean(formik.errors.parent1Email)
                            }
                            helperText={
                              formik.touched.parent1Email && formik.errors.parent1Email
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EmailIcon color="secondary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="parent1Address"
                            name="parent1Address"
                            label="כתובת (אם שונה מכתובת הילד)"
                            placeholder="רחוב, מספר בית, שכונה"
                            value={formik.values.parent1Address}
                            onChange={formik.handleChange}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <HomeIcon color="secondary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel id="parent1CityName-label">עיר</InputLabel>
                            <Select
                              labelId="parent1CityName-label"
                              id="parent1CityName"
                              name="parent1CityName"
                              value={formik.values.parent1CityName}
                              onChange={formik.handleChange}
                              label="🏙️ עיר הורה"
                              startAdornment={
                                <InputAdornment position="start">
                                  <CityIcon color="secondary" />
                                </InputAdornment>
                              }
                            >
                              <MenuItem value="">
                                <em>🏠 זהה לעיר הילד</em>
                              </MenuItem>
                              {citiesStatus === "loading" ? (
                                <MenuItem value="" disabled>
                                  <CircularProgress size={20} />
                                  טוען ערים...
                                </MenuItem>
                              ) : (
                                cities.map((city) => (
                                  <MenuItem key={city.id || city.name} value={city.name}>
                                   {city.name}
                                  </MenuItem>
                                ))
                              )}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </AnimatedSection>

                {/* Section 3: Secondary Parent Details (Optional) */}
                <AnimatedSection expanded={expandedSections.secondaryParent}>
                  <SectionHeader onClick={() => toggleSection("secondaryParent")}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SectionTitle
                        variant="h6"
                        expanded={expandedSections.secondaryParent}
                      >
                        👨‍👩‍👧‍👦 פרטי הורה משני
                        <Chip
                          label="אופציונלי"
                          size="small"
                          color={expandedSections.secondaryParent ? "info" : "default"}
                          sx={{ ml: 2, fontWeight: 600 }}
                          icon={<InfoIcon />}
                        />
                      </SectionTitle>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title="פרטי הורה משני אינם חובה אך מומלצים למילוי">
                        <InfoIcon
                          fontSize="small"
                          sx={{ color: theme.palette.info.main }}
                        />
                      </Tooltip>
                      <IconButton
                        size="small"
                        color={expandedSections.secondaryParent ? "primary" : "default"}
                        sx={{
                          transform: expandedSections.secondaryParent
                            ? "rotate(-90deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                          background: expandedSections.secondaryParent 
                            ? 'rgba(33, 150, 243, 0.1)' 
                            : 'transparent',
                          '&:hover': {
                            background: 'rgba(33, 150, 243, 0.2)',
                          }
                        }}
                      >
                        <NextIcon />
                      </IconButton>
                    </Stack>
                  </SectionHeader>

                  <Collapse in={expandedSections.secondaryParent}>
                    <CardContent sx={{ p: 4 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="parent2FirstName"
                            name="parent2FirstName"
                            label="שם פרטי"
                            placeholder="שם פרטי ההורה"
                            value={formik.values.parent2FirstName}
                            onChange={formik.handleChange}
                            error={
                              formik.touched.parent2FirstName &&
                              Boolean(formik.errors.parent2FirstName)
                            }
                            helperText={
                              formik.touched.parent2FirstName &&
                              formik.errors.parent2FirstName
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonIcon color="info" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="parent2LastName"
                            name="parent2LastName"
                            label="שם משפחה"
                            placeholder="שם משפחה ההורה"
                            value={formik.values.parent2LastName}
                            onChange={formik.handleChange}
                            error={
                              formik.touched.parent2LastName &&
                              Boolean(formik.errors.parent2LastName)
                            }
                            helperText={
                              formik.touched.parent2LastName &&
                              formik.errors.parent2LastName
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonIcon color="info" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="parent2Mobile"
                            name="parent2Mobile"
                            label="טלפון נייד"
                            placeholder="05X-XXXXXXX"
                            value={formik.values.parent2Mobile}
                            onChange={formik.handleChange}
                            error={
                              formik.touched.parent2Mobile &&
                              Boolean(formik.errors.parent2Mobile)
                            }
                            helperText={
                              formik.touched.parent2Mobile && formik.errors.parent2Mobile
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CallIcon color="info" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="parent2Email"
                            name="parent2Email"
                            label="דוא״ל"
                            type="email"
                            placeholder="example@mail.com"
                            value={formik.values.parent2Email}
                            onChange={formik.handleChange}
                            error={
                              formik.touched.parent2Email &&
                              Boolean(formik.errors.parent2Email)
                            }
                            helperText={
                              formik.touched.parent2Email && formik.errors.parent2Email
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EmailIcon color="info" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="parent2Address"
                            name="parent2Address"
                            label="כתובת (אם שונה מכתובת הילד)"
                            placeholder="רחוב, מספר בית, שכונה"
                            value={formik.values.parent2Address}
                            onChange={formik.handleChange}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <HomeIcon color="info" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel id="parent2CityName-label"> עיר </InputLabel>
                            <Select
                              labelId="parent2CityName-label"
                              id="parent2CityName"
                              name="parent2CityName"
                              value={formik.values.parent2CityName}
                              onChange={formik.handleChange}
                              label="🏙️ עיר הורה"
                              startAdornment={
                                <InputAdornment position="start">
                                  <CityIcon color="info" />
                                </InputAdornment>
                              }
                            >
                              <MenuItem value="">
                                <em>🏠 זהה לעיר הילד</em>
                              </MenuItem>
                              {citiesStatus === "loading" ? (
                                <MenuItem value="" disabled>
                                  <CircularProgress size={20} />
                                  טוען ערים...
                                </MenuItem>
                              ) : (
                                cities.map((city) => (
                                  <MenuItem key={city.id || city.name} value={city.name}>
                                   {city.name}
                                  </MenuItem>
                                ))
                              )}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </AnimatedSection>

                {/* Summary and Completion */}
                <Fade in timeout={1000}>
                  <Box sx={{ mt: 4, mb: 3 }}>
                    <Alert
                      severity={isFormFilled ? "success" : "info"}
                      variant="outlined"
                      sx={{ 
                        borderRadius: 3,
                        background: isFormFilled 
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(16, 185, 129, 0.1))'
                          : 'linear-gradient(135deg, rgba(76, 181, 195, 0.05), rgba(76, 181, 195, 0.1))',
                        border: `2px solid ${isFormFilled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(76, 181, 195, 0.3)'}`,
                        boxShadow: `0 4px 15px ${isFormFilled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(76, 181, 195, 0.2)'}`,
                      }}
                      
                    >
                      <AlertTitle sx={{ 
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        {isFormFilled ? "🎉 הטופס מוכן לשמירה!" : "📝 יש להשלים את הטופס"}
                      </AlertTitle>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {isFormFilled
                          ? "מעולה! השלמת את מילוי הטופס. לאחר שמירה תועבר לשלב הבא בתהליך קליטת הילד."
                          : "יש למלא את כל שדות החובה (מסומנים ב-*) לפני המשך התהליך."}
                      </Typography>
                    </Alert>
                  </Box>
                </Fade>

                {/* Action buttons at the bottom of the form */}
                <Paper
                  elevation={8}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    mt: 4,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <ActionButtonsContainer>
                    {!isEditMode && (
                      <AnimatedButton
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          Swal.fire({
                            title: "⚠️ האם אתה בטוח?",
                            text: "הפעולה תנקה את כל השדות!",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "✅ כן, נקה טופס",
                            cancelButtonText: "❌ ביטול",
                            reverseButtons: true,
                            background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                            confirmButtonColor: '#ef4444',
                            cancelButtonColor: '#6b7280',
                          }).then((result) => {
                            if (result.isConfirmed) {
                              formik.resetForm();
                              Swal.fire({
                                title: "🧹 נוקה!",
                                text: "הטופס נוקה בהצלחה.",
                                icon: "success",
                                timer: 1500,
                                showConfirmButton: false,
                                background: 'linear-gradient(135deg, #fff 0%, #f0fdf4 100%)',
                              });
                            }
                          });
                        }}
                        
                        disabled={isLoading}
                        sx={{ 
                          borderRadius: 3, 
                          px: 4,
                          py: 1.5,
                          fontWeight: 600,
                          background: 'linear-gradient(45deg, #ef4444 30%, #dc2626 90%)',
                          color: 'white',
                          border: 'none',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #dc2626 30%, #b91c1c 90%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)',
                          }
                        }}
                      >
                        🗑️ נקה טופס
                      </AnimatedButton>
                    )}
                    
                    <Box>
                      <AnimatedButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isLoading}
                        sx={{
                          borderRadius: 3,
                          px: 5,
                          py: 2,
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          background: isEditMode 
                            ? 'linear-gradient(45deg, #ff7043 30%, #f4511e 90%)'
                            : 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                          boxShadow: isEditMode 
                            ? '0 8px 30px rgba(255, 112, 67, 0.4)'
                            : '0 8px 30px rgba(76, 181, 195, 0.4)',
                          '&:hover': {
                            background: isEditMode 
                              ? 'linear-gradient(45deg, #f4511e 30%, #e64a19 90%)'
                              : 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
                            transform: 'translateY(-3px)',
                            boxShadow: isEditMode 
                              ? '0 12px 40px rgba(255, 112, 67, 0.5)'
                              : '0 12px 40px rgba(76, 181, 195, 0.5)',
                          },
                          '&:disabled': {
                            background: 'rgba(0, 0, 0, 0.12)',
                            color: 'rgba(0, 0, 0, 0.26)',
                          }
                        }}
                      >
                        {isLoading 
                          ? "⏳ שומר..." 
                          : isEditMode 
                            ? "✏️ עדכן פרטים" 
                            : "💾 שמור פרטים והמשך"
                        }
                      </AnimatedButton>
                    </Box>
                  </ActionButtonsContainer>
                </Paper>
              </Box>
            </StyledCard>
          </form>
        </Container>
      </FullScreenContainer>
    </ThemeProvider>
  );
};

export default PersonalInfoForm;