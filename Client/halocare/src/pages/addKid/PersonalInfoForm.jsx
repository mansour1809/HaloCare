// components/kids/PersonalInfoForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid, Typography, TextField, MenuItem, FormControl,
  InputLabel, Select, Button, Box, Avatar, FormHelperText, 
  Alert, AlertTitle, InputAdornment, Tooltip, CircularProgress,
  Paper, Divider, Chip, RadioGroup, FormControlLabel, Radio,
  FormLabel, Fade, Zoom, Card, CardContent, Badge, Tab, Tabs,
  IconButton, Stack, Switch, Collapse, useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled } from '@mui/material/styles';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  DeleteOutline as DeleteIcon,
  CloudUpload as UploadIcon,
  Info as InfoIcon,
  ContactPhone as CallIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Cake as CakeIcon,
  Wc as GenderIcon,
  MedicalServices as MedicalIcon,
  LocationCity as CityIcon,
  LocalHospital as HospitalIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Event as EventIcon,
  Face as FaceIcon,
  NavigateNext as NextIcon,
  LocalPhone as PhoneIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { fetchCities } from '../../Redux/features/citiesSlice';
import { createKid, updateKid } from '../../Redux/features/kidsSlice';

// עיצוב משופר לאווטאר עם אפקט הבלטה וזוהר
const EnhancedAvatar = styled(Avatar)(({ theme }) => ({
  width: 150,
  height: 150,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: `0 6px 20px rgba(0,0,0,0.2), 0 0 15px ${theme.palette.primary.light}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 8px 25px rgba(0,0,0,0.3), 0 0 20px ${theme.palette.primary.main}`,
  }
}));

// מיכל תמונת פרופיל עם אפקט מבריק
const ProfileImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '10%',
    left: '10%',
    right: '10%',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
    filter: 'blur(1px)',
    opacity: 0.7,
    animation: 'shimmer 2s infinite',
  },
  '@keyframes shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  }
}));

// כרטיסיה מוגדלת עם הנפשה לפתיחה
const AnimatedSection = styled(Card)(({ theme, expanded }) => ({
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: expanded
    ? `0 8px 32px rgba(0,0,0,0.15), 0 0 0 2px ${theme.palette.primary.main}38`
    : '0 4px 12px rgba(0,0,0,0.05)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: expanded ? 'translateY(0)' : 'translateY(0)',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: `0 8px 28px rgba(0,0,0,0.12), 0 0 0 2px ${theme.palette.primary.main}15`,
  },
}));

// כותרת סקשן מקצועית
const SectionHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  background: 'linear-gradient(90deg, rgba(33,150,243,0.05) 0%, rgba(33,150,243,0.1) 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${theme.palette.divider}`,
  cursor: 'pointer',
  '&:hover': {
    background: 'linear-gradient(90deg, rgba(33,150,243,0.1) 0%, rgba(33,150,243,0.15) 100%)',
  },
}));

// כותרת כרטיסיה
const SectionTitle = styled(Typography)(({ theme, expanded }) => ({
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  color: expanded ? theme.palette.primary.main : theme.palette.text.primary,
  transition: 'color 0.3s ease',
}));

// אייקון סקשן מונפש
const SectionIcon = styled(Box)(({ theme, expanded }) => ({
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
  color: expanded ? theme.palette.primary.main : theme.palette.primary.main,
  background: expanded ? 'rgba(33,150,243,0.1)' : 'transparent',
  borderRadius: '50%',
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
}));

// כפתור מונפש
const AnimatedButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
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
  },
}));

// כפתור העלאת תמונה מעוצב
const UploadButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: '20px',
  padding: theme.spacing(1, 3),
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  background: 'linear-gradient(90deg, #2196f3, #64b5f6)',
  transition: 'all 0.3s ease',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(90deg, #1976d2, #2196f3)',
    boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
  }
}));

// תווית שדות חובה
const RequiredFieldLabel = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  '&::before': {
    content: '"*"',
    color: theme.palette.error.main,
    marginRight: theme.spacing(0.5),
  },
}));

// תיבת כפתורי פעולה
const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing(4),
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.02))',
}));

// סכימת ולידציה משופרת
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
  parent1FirstName: yup.string().required('שם הורה ראשי הוא שדה חובה'),
  parent1LastName: yup.string().required('שם משפחה הורה ראשי הוא שדה חובה'),
  parent1Mobile: yup.string()
    .required('טלפון נייד הורה ראשי הוא שדה חובה')
    .matches(/^05\d{8}$/, 'מספר טלפון לא תקין'),
  emergencyContactName: yup.string().required('איש קשר לשעת חירום הוא שדה חובה'),
  emergencyContactPhone: yup.string()
    .required('טלפון איש קשר חירום הוא שדה חובה')
    .matches(/^0\d{8,9}$/, 'מספר טלפון לא תקין'),
});

const PersonalInfoForm = ({ data, onUpdate, isEditMode = false }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(data?.photoPath || null);
  
  // מצבי התרחבות הסקשנים
  const [expandedSections, setExpandedSections] = useState({
    childDetails: true,
    primaryParent: true,
    secondaryParent: false, 
    contactInfo: false
  });
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // שליפת נתוני רפרנס מהסטור
  const { cities, status: citiesStatus } = useSelector(state => state.cities);
  const { status: kidStatus, error: kidError } = useSelector(state => state.kids);
  const isLoading = kidStatus === 'loading';
  
  // טעינת נתוני רפרנס בעת טעינת הקומפוננטה
  useEffect(() => {
    dispatch(fetchCities());
  }, [dispatch]);
  
  // טיפול בהעלאת תמונה
  const handlePhotoChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPhotoFile(file);
      
      // יצירת URL לתצוגה מקדימה
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // רשימת קופות חולים
  const healthInsurances = ['כללית', 'מכבי', 'מאוחדת', 'לאומית'];
  
  // מימוש ה-Formik
  const formik = useFormik({
    initialValues: {
      id: data?.id || 0,
      firstName: data?.firstName || '',
      lastName: data?.lastName || '',
      birthDate: data?.birthDate ? new Date(data.birthDate) : null,
      gender: data?.gender || '',
      cityName: data?.cityName || '',
      address: data?.address || '',
      hName: data?.hName || '',
      photoPath: data?.photoPath || '',
      parent1FirstName: data?.parent1FirstName || '',
      parent1LastName: data?.parent1LastName || '',
      parent1Mobile: data?.parent1Mobile || '',
      parent1Email: data?.parent1Email || '',
      parent1Address: data?.parent1Address || '',
      parent1Occupation: data?.parent1Occupation || '',
      parent2FirstName: data?.parent2FirstName || '',
      parent2LastName: data?.parent2LastName || '',
      parent2Mobile: data?.parent2Mobile || '',
      parent2Email: data?.parent2Email || '',
      parent2Address: data?.parent2Address || '',
      parent2Occupation: data?.parent2Occupation || '',
      homePhone: data?.homePhone || '',
      emergencyContactName: data?.emergencyContactName || '',
      emergencyContactPhone: data?.emergencyContactPhone || '',
      plannedEntryDate: data?.plannedEntryDate || null,
      socialWorker: data?.socialWorker || '',
      referralDate: data?.referralDate || null,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        // העלאת תמונה אם יש
        let photoPath = values.photoPath;
        if (photoFile) {
          const formData = new FormData();
          formData.append('photo', photoFile);
          // כאן צריך להיות קוד להעלאת התמונה לשרת
          // photoPath = response.data.photoPath;
        }
        
        // יצירת אובייקט הנתונים לשמירה
        const kidData = {
          ...values,
          photoPath,
          isActive: true
        };
        
        // שמירת הנתונים בהתאם למצב עריכה/יצירה
        let result;
        if (isEditMode) {
          result = await dispatch(updateKid(kidData)).unwrap();
        } else {
          result = await dispatch(createKid(kidData)).unwrap();
        }
        
        // עדכון ה-parent component
        onUpdate(result);
      } catch (error) {
        console.error('שגיאה בשמירת נתוני הילד:', error);
      }
    },
  });
  
  const isFormFilled = formik.dirty && Object.values(formik.values).some(val => val !== '');
  
  return (
    <form onSubmit={formik.handleSubmit}>
      {/* הודעת שגיאה אם יש */}
      {kidError && (
        <Zoom in={true}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: '0 4px 15px rgba(211, 47, 47, 0.2)'
            }}
            variant="filled"
            icon={<ErrorIcon />}
          >
            <AlertTitle>שגיאה</AlertTitle>
            {kidError}
          </Alert>
        </Zoom>
      )}
      
      {/* תמונת פרופיל */}
      <ProfileImageContainer>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          badgeContent={
            <Tooltip title="העלה תמונת פרופיל">
              <label htmlFor="kid-photo-upload">
                <IconButton
                  aria-label="העלאת תמונה"
                  component="span"
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                  size="small"
                >
                  <UploadIcon fontSize="small" />
                </IconButton>
              </label>
            </Tooltip>
          }
        >
          <EnhancedAvatar src={photoPreview}>
            {!photoPreview && <FaceIcon sx={{ fontSize: 80, opacity: 0.7 }} />}
          </EnhancedAvatar>
        </Badge>
        
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="kid-photo-upload"
          type="file"
          onChange={handlePhotoChange}
        />
        
        <Fade in={true} timeout={800}>
          <UploadButton
            variant="contained"
            component="label"
            htmlFor="kid-photo-upload"
            startIcon={<UploadIcon />}
            size="small"
          >
            {photoPreview ? 'החלף תמונה' : 'העלאת תמונה'}
          </UploadButton>
        </Fade>
      </ProfileImageContainer>
      
      {/* קטע 1: פרטי הילד */}
      <AnimatedSection expanded={expandedSections.childDetails}>
        <SectionHeader onClick={() => toggleSection('childDetails')}>
          <SectionIcon expanded={expandedSections.childDetails}>
            <PersonIcon />
          </SectionIcon>
          <SectionTitle variant="h6" expanded={expandedSections.childDetails}>
            פרטי הילד
            <Chip 
              label="פרטים בסיסיים" 
              size="small" 
              color={expandedSections.childDetails ? "primary" : "default"}
              sx={{ ml: 1, fontSize: '0.75rem' }}
            />
          </SectionTitle>
          <Box sx={{ ml: 'auto' }}>
            <IconButton 
              size="small" 
              color={expandedSections.primaryParent ? "primary" : "default"}
              sx={{ transform: expandedSections.primaryParent ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
            >
              <NextIcon />
            </IconButton>
          </Box>
        </SectionHeader>
        
        <Collapse in={expandedSections.primaryParent}>
          <CardContent>
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
                  error={formik.touched.parent1FirstName && Boolean(formik.errors.parent1FirstName)}
                  helperText={formik.touched.parent1FirstName && formik.errors.parent1FirstName}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="secondary" fontSize="small" />
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
                  error={formik.touched.parent1LastName && Boolean(formik.errors.parent1LastName)}
                  helperText={formik.touched.parent1LastName && formik.errors.parent1LastName}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="secondary" fontSize="small" />
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
                  error={formik.touched.parent1Mobile && Boolean(formik.errors.parent1Mobile)}
                  helperText={formik.touched.parent1Mobile && formik.errors.parent1Mobile}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CallIcon color="secondary" fontSize="small" />
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="secondary" fontSize="small" />
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
                        <HomeIcon color="secondary" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="parent1Occupation"
                  name="parent1Occupation"
                  label="תעסוקה"
                  placeholder="מקצוע / עיסוק"
                  value={formik.values.parent1Occupation}
                  onChange={formik.handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon color="secondary" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Collapse>
      </AnimatedSection>
      
      {/* חלק 3: פרטי הורה משני (אופציונלי) */}
      <AnimatedSection expanded={expandedSections.secondaryParent}>
        <SectionHeader onClick={() => toggleSection('secondaryParent')}>
          <SectionIcon expanded={expandedSections.secondaryParent}>
            <PersonAddIcon />
          </SectionIcon>
          <SectionTitle variant="h6" expanded={expandedSections.secondaryParent}>
            פרטי הורה משני
            <Chip 
              label="אופציונלי" 
              size="small" 
              color={expandedSections.secondaryParent ? "info" : "default"}
              sx={{ ml: 1, fontSize: '0.75rem' }}
            />
          </SectionTitle>
          <Tooltip title="פרטי הורה משני אינם חובה אך מומלצים למילוי">
            <InfoIcon fontSize="small" sx={{ mx: 1, color: theme.palette.info.main }} />
          </Tooltip>
          <Box sx={{ ml: 'auto' }}>
            <IconButton 
              size="small" 
              color={expandedSections.secondaryParent ? "primary" : "default"}
              sx={{ transform: expandedSections.secondaryParent ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
            >
              <NextIcon />
            </IconButton>
          </Box>
        </SectionHeader>
        
        <Collapse in={expandedSections.secondaryParent}>
          <CardContent>
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="info" fontSize="small" />
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="info" fontSize="small" />
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CallIcon color="info" fontSize="small" />
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="info" fontSize="small" />
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
                        <HomeIcon color="info" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="parent2Occupation"
                  name="parent2Occupation"
                  label="תעסוקה"
                  placeholder="מקצוע / עיסוק"
                  value={formik.values.parent2Occupation}
                  onChange={formik.handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon color="info" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Collapse>
      </AnimatedSection>
      
      {/* חלק 4: פרטי קשר נוספים */}
      <AnimatedSection expanded={expandedSections.contactInfo}>
        <SectionHeader onClick={() => toggleSection('contactInfo')}>
          <SectionIcon expanded={expandedSections.contactInfo}>
            <PhoneIcon />
          </SectionIcon>
          <SectionTitle variant="h6" expanded={expandedSections.contactInfo}>
            פרטי קשר נוספים
            <Chip 
              label="חשוב למילוי" 
              size="small" 
              color={expandedSections.contactInfo ? "warning" : "default"}
              sx={{ ml: 1, fontSize: '0.75rem' }}
            />
          </SectionTitle>
          <Box sx={{ ml: 'auto' }}>
            <IconButton 
              size="small" 
              color={expandedSections.contactInfo ? "primary" : "default"}
              sx={{ transform: expandedSections.contactInfo ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
            >
              <NextIcon />
            </IconButton>
          </Box>
        </SectionHeader>
        
        <Collapse in={expandedSections.contactInfo}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="homePhone"
                  name="homePhone"
                  label="טלפון בבית"
                  placeholder="0X-XXXXXXX"
                  value={formik.values.homePhone}
                  onChange={formik.handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CallIcon color="warning" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="emergencyContactName"
                  name="emergencyContactName"
                  label="איש קשר בשעת חירום"
                  placeholder="שם מלא"
                  value={formik.values.emergencyContactName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.emergencyContactName && Boolean(formik.errors.emergencyContactName)}
                  helperText={formik.touched.emergencyContactName && formik.errors.emergencyContactName}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="error" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  label="טלפון איש קשר חירום"
                  placeholder="0X-XXXXXXX"
                  value={formik.values.emergencyContactPhone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.emergencyContactPhone && Boolean(formik.errors.emergencyContactPhone)}
                  helperText={formik.touched.emergencyContactPhone && formik.errors.emergencyContactPhone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CallIcon color="error" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>
            </Grid>
          </CardContent>
        </Collapse>
      </AnimatedSection>
      
      {/* סיכום והשלמה */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <Alert 
          severity={isFormFilled ? "info" : "warning"}
          variant="outlined"
          sx={{ borderRadius: 2 }}
          icon={isFormFilled ? <InfoIcon /> : <InfoIcon />}
        >
          <AlertTitle>{isFormFilled ? "הטופס מוכן לשמירה" : "יש להשלים את הטופס"}</AlertTitle>
          {isFormFilled 
            ? "השלמת את מילוי הטופס. לאחר שמירה תועבר לשלב הבא בתהליך קליטת הילד."
            : "יש למלא את כל שדות החובה (מסומנים ב-*) לפני המשך התהליך."}
        </Alert>
      </Box>
      
      {/* כפתורי פעולה בתחתית הטופס */}
      <Paper
        elevation={3}
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden', 
          mt: 4 
        }}
      >
        <ActionButtonsContainer>
          <AnimatedButton
            variant="outlined"
            color="error"
            onClick={() => formik.resetForm()}
            startIcon={<DeleteIcon />}
            disabled={isLoading}
            sx={{ borderRadius: '50px', px: 3 }}
          >
            נקה טופס
          </AnimatedButton>
          
          <Box>
            <AnimatedButton
              type="submit"
              variant="contained"
              color="primary"
              startIcon={
                isLoading ? 
                <CircularProgress size={20} color="inherit" /> : 
                (isEditMode ? <EditIcon /> : <SaveIcon />)
              }
              disabled={isLoading}
              sx={{ 
                borderRadius: '50px', 
                px: 4, 
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              }}
            >
              {isEditMode ? 'עדכן פרטים' : 'שמור פרטים והמשך'}
            </AnimatedButton>
          </Box>
        </ActionButtonsContainer>
      </Paper>
    </form>
  );
};

export default PersonalInfoForm;