// src/pages/kids/PersonalInfoForm.jsx - עיצוב מטורף + תיקונים טכניים
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid, Typography, TextField, MenuItem, FormControl,
  InputLabel, Select, Button, Box, Avatar, FormHelperText, 
  Alert, AlertTitle, InputAdornment, Tooltip, CircularProgress,
  Paper, Divider, Chip, RadioGroup, FormControlLabel, Radio,
  FormLabel, Fade, Zoom, Card, CardContent, Badge, 
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
  School as SchoolIcon,
  AddToPhotos as FileIcon,
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
  // פרטי הילד
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
  
  // פרטי הורה ראשי
  parent1FirstName: yup.string().required('שם הורה ראשי הוא שדה חובה'),
  parent1LastName: yup.string().required('שם משפחה הורה ראשי הוא שדה חובה'),
  parent1Mobile: yup.string()
    .required('טלפון נייד הורה ראשי הוא שדה חובה')
    .matches(/^05\d{8}$/, 'מספר טלפון לא תקין'),
  parent1Email: yup.string().email('כתובת דוא״ל לא תקינה').required('דוא״ל הורה ראשי חובה'),

  // פרטי הורה משני (לא חובה)
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
  
  // מצבי התרחבות הסקשנים
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
  
  // שליפת נתוני רפרנס מהסטור
  const { cities, status: citiesStatus } = useSelector(state => state.cities);
  const { kids, status: kidStatus, error: kidError } = useSelector(state => state.kids);
  const { classes, status: classesStatus } = useSelector(state => state.classes || { classes: [], status: 'idle' });
  const { healthInsurances, status: healthInsurancesStatus } = useSelector(state => state.healthInsurances);
  const isLoading = kidStatus === 'loading';
  
  // הגדרת initialValues מתקנת להורים
  const getInitialValues = () => {
    if (data && isEditMode) {
      return {
        // פרטי הילד
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
        
        // פרטי הורה ראשי - עכשיו עם הנתונים הנכונים
        parent1Id: data.parentId1 || 0,
        parent1FirstName: data.parent1FirstName || '',
        parent1LastName: data.parent1LastName || '',
        parent1Mobile: data.parent1Mobile || '',
        parent1Email: data.parent1Email || '',
        parent1Address: data.parent1Address || data.address || '',
        parent1CityName: data.parent1CityName || data.cityName || '',
        
        // פרטי הורה משני
        parent2Id: data.parentId2 || 0,
        parent2FirstName: data.parent2FirstName || '',
        parent2LastName: data.parent2LastName || '',
        parent2Mobile: data.parent2Mobile || '',
        parent2Email: data.parent2Email || '',
        parent2Address: data.parent2Address || '',
        parent2CityName: data.parent2CityName || '',
        
        // פרטי קשר נוספים
        homePhone: data.homePhone || '',
      };
    }
    
    // ערכים ריקים עבור ילד חדש
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

  // טעינת נתוני רפרנס + נתוני הורים במצב עריכה
  useEffect(() => {
    dispatch(fetchCities());
    dispatch(fetchClasses());
    dispatch(fetchHealthInsurances());
    dispatch(fetchKids());
    
    // טעינת נתוני הורים במצב עריכה
    if (isEditMode && data) {
      loadParentsData();
    }
  }, [dispatch, data, isEditMode]);

  // טעינת נתוני הורים
  const loadParentsData = async () => {
    try {
      if (data.parentId1) {
        const parent1Result = await dispatch(fetchParentById(data.parentId1)).unwrap();
        // עדכון הטופס עם נתוני הורה ראשי
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
        // עדכון הטופס עם נתוני הורה משני
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

  // useEffect(() => {
  //   if (!isEditMode) {
  //     formik.resetForm();
  //   }
  // }, [isEditMode]);

  // טיפול בהעלאת תמונה
 const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // בדיקת סוג קובץ
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'קובץ לא מתאים',
        text: 'יש לבחור קובץ תמונה בלבד (jpg, png, etc.)',
        confirmButtonText: 'אישור'
      });
      return;
    }

    // בדיקת גודל קובץ (מקס 5MB)
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

    // יצירת תצוגה מקדימה
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // פונקציה להעלאת תמונת פרופיל
const uploadProfilePhoto = async (kidId) => {
  if (!photoFile) return null;

  try {
    setUploadingPhoto(true);

    // מחיקת תמונת פרופיל קיימת אם יש
    if (isEditMode) {
      const existingDocs = await dispatch(fetchDocumentsByKidId(kidId)).unwrap();
      const existingProfilePic = existingDocs.find(doc => doc.docType === 'profile');
      
      if (existingProfilePic) {
        await dispatch(deleteDocument(existingProfilePic.docId)).unwrap();
      }
    }

    // הכנת נתוני ההעלאה
    const profileData = {
      document: {
        KidId: kidId.toString(),
        DocType: "profile",
        DocName: photoFile.name,
      },
      file: photoFile
    };

    // העלאת התמונה
    const uploadResult = await dispatch(uploadDocument(profileData)).unwrap();
    
    return uploadResult.docPath; // החזרת הנתיב להטמעה בילד
    
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
  // מימוש ה-Formik
 const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        
        // הכנת נתונים לשליחה
        const formDataForSlice = { ...values };
        
        let result;
        
        if (isEditMode) {
          // עדכון ילד קיים
          result = await dispatch(updateKidWithParents(formDataForSlice)).unwrap();
          
          // העלאת תמונת פרופיל אם נבחרה
         let updatedKid = result.kid;
if (photoFile) {
  const photoPath = await uploadProfilePhoto(result.kid.id);
  if (photoPath) {
    // ✅ יצירת אובייקט חדש במקום שינוי הקיים
    updatedKid = {
      ...result.kid,
      photoPath: photoPath
    };
  }
}
          
          Swal.fire({
            icon: 'success',
            title: 'עודכן בהצלחה!',
            text: `פרטי הילד ${formDataForSlice.firstName} ${formDataForSlice.lastName} עודכנו בהצלחה`,
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          // יצירת ילד חדש
          result = await dispatch(createKidWithParents(formDataForSlice)).unwrap();
          
          // העלאת תמונת פרופיל אם נבחרה
          let updatedKid = result.kid;
         if (photoFile) {
  const photoPath = await uploadProfilePhoto(result.kid.id);
  if (photoPath) {
    // ✅ יצירת אובייקט חדש במקום שינוי הקיים
    updatedKid = {
      ...result.kid,
      photoPath: photoPath
    };
  }
}
          
          Swal.fire({
            icon: 'success',
            title: 'נשמר בהצלחה!',
            text: `פרטי הילד ${result.kid.firstName} ${result.kid.lastName} נשמרו בהצלחה`,
            timer: 2000,
            showConfirmButton: false
          });
        }
        
        // עדכון ה-parent component
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
    <form dir="rtl" onSubmit={formik.handleSubmit}>
      {/* הודעת שגיאה אם יש */}
      {kidError && (
        <Zoom in={true}>
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              boxShadow: "0 4px 15px rgba(211, 47, 47, 0.2)",
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
<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
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
              "&:hover": { bgcolor: "primary.dark" },
            }}
            size="small"
            disabled={uploadingPhoto}
          >
            {uploadingPhoto ? <CircularProgress size={16} color="inherit" /> : <UploadIcon fontSize="small" />}
          </IconButton>
        </label>
      </Tooltip>
    }
  >
    <Avatar 
      src={
        isEditMode ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(photoPreview)}` : undefined
      }
      sx={{ 
        width: 150, 
        height: 150,
        border: '4px solid',
        borderColor: 'background.paper',
        boxShadow: 3
      }}
    >
      {!photoPreview && <FaceIcon sx={{ fontSize: 80, opacity: 0.7 }} />}
    </Avatar>
  </Badge>

  <input
    accept="image/*"
    style={{ display: "none" }}
    id="kid-photo-upload"
    type="file"
    onChange={handlePhotoChange}
    disabled={uploadingPhoto}
  />

  <Button
    variant="contained"
    component="label"
    htmlFor="kid-photo-upload"
    startIcon={uploadingPhoto ? <CircularProgress size={16} color="inherit" /> : <UploadIcon />}
    size="small"
    disabled={uploadingPhoto}
    sx={{ mt: 1 }}
  >
    {photoPreview ? "החלף תמונה" : "העלאת תמונה"}
  </Button>

  {/* הצגת שם הקובץ אם נבחר */}
  {photoFile && (
    <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
      {photoFile.name} ({Math.round(photoFile.size / 1024)} KB)
    </Typography>
  )}
</Box>

      {/* קטע 1: פרטי הילד */}
      <AnimatedSection expanded={expandedSections.childDetails}>
        <SectionHeader onClick={() => toggleSection("childDetails")}>
          <SectionIcon expanded={expandedSections.childDetails}>
            <PersonIcon />
          </SectionIcon>
          <SectionTitle variant="h6" expanded={expandedSections.childDetails}>
            פרטי הילד
            <Chip
              label="פרטים בסיסיים"
              size="small"
              color={expandedSections.childDetails ? "primary" : "default"}
              sx={{ ml: 1, fontSize: "0.75rem" }}
            />
          </SectionTitle>
          <Box sx={{ ml: "auto" }}>
            <IconButton
              size="small"
              color={expandedSections.childDetails ? "primary" : "default"}
              sx={{
                transform: expandedSections.childDetails
                  ? "rotate(-90deg)"
                  : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
            >
              <NextIcon />
            </IconButton>
          </Box>
        </SectionHeader>

        <Collapse in={expandedSections.childDetails}>
          <CardContent>
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
                        <PersonIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
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
                        <PersonIcon color="primary" fontSize="small" />
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
                        <BadgeIcon color="primary" fontSize="small" />
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
                            <CakeIcon color="primary" fontSize="small" />
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
                    sx={{ mb: 1 }}
                  >
                    מין
                  </Typography>
                  <RadioGroup
                    row
                    aria-labelledby="gender-radio-group-label"
                    name="gender"
                    value={formik.values.gender}
                    onChange={formik.handleChange}
                  >
                    <FormControlLabel
                      value="זכר"
                      control={
                        <Radio
                          icon={<MaleIcon color="action" />}
                          checkedIcon={<MaleIcon color="primary" />}
                        />
                      }
                      label="זכר"
                    />
                    <FormControlLabel
                      value="נקבה"
                      control={
                        <Radio
                          icon={<FemaleIcon color="action" />}
                          checkedIcon={<FemaleIcon color="primary" />}
                        />
                      }
                      label="נקבה"
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
                  <InputLabel id="cityName-label">עיר</InputLabel>
                  <Select
                    labelId="cityName-label"
                    id="cityName"
                    name="cityName"
                    value={formik.values.cityName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="עיר"
                    startAdornment={
                      <InputAdornment position="start">
                        <CityIcon color="primary" fontSize="small" />
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
                        <HomeIcon color="primary" fontSize="small" />
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
                  <InputLabel id="hName-label">קופת חולים</InputLabel>
                  <Select
                    labelId="hName-label"
                    id="hName"
                    name="hName"
                    value={formik.values.hName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="קופת חולים"
                    startAdornment={
                      <InputAdornment position="start">
                        <HospitalIcon color="primary" fontSize="small" />
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



              {/* שדה לבחירת כיתה אם קיים מידע הכיתות */}
              {classes && classes.length > 0 && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="classId-label">כיתה</InputLabel>
                    <Select
                      labelId="classId-label"
                      id="classId"
                      name="classId"
                      value={formik.values.classId}
                      onChange={formik.handleChange}
                      label="כיתה"
                      startAdornment={
                        <InputAdornment position="start">
                          <SchoolIcon color="primary" fontSize="small" />
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

              {/* מתג סטטוס פעיל */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      id="isActive"
                      name="isActive"
                      checked={formik.values.isActive}
                      onChange={formik.handleChange}
                      color="success"
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      color={
                        formik.values.isActive
                          ? "success.main"
                          : "text.secondary"
                      }
                    >
                      {formik.values.isActive
                        ? "פעיל במערכת"
                        : "לא פעיל במערכת"}
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </CardContent>
        </Collapse>
      </AnimatedSection>

      {/* קטע 2: פרטי הורה ראשי */}
      <AnimatedSection expanded={expandedSections.primaryParent}>
        <SectionHeader onClick={() => toggleSection("primaryParent")}>
          <SectionIcon expanded={expandedSections.primaryParent}>
            <PersonIcon />
          </SectionIcon>
          <SectionTitle variant="h6" expanded={expandedSections.primaryParent}>
            פרטי הורה ראשי
            <Chip
              label="פרטים בסיסיים"
              size="small"
              color={expandedSections.primaryParent ? "primary" : "default"}
              sx={{ ml: 1, fontSize: "0.75rem" }}
            />
          </SectionTitle>
          <Box sx={{ ml: "auto" }}>
            <IconButton
              size="small"
              color={expandedSections.primaryParent ? "primary" : "default"}
              sx={{
                transform: expandedSections.primaryParent
                  ? "rotate(-90deg)"
                  : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
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
                <FormControl fullWidth>
                  <InputLabel id="parent1CityName-label">עיר הורה</InputLabel>
                  <Select
                    labelId="parent1CityName-label"
                    id="parent1CityName"
                    name="parent1CityName"
                    value={formik.values.parent1CityName}
                    onChange={formik.handleChange}
                    label="עיר הורה"
                    startAdornment={
                      <InputAdornment position="start">
                        <CityIcon color="secondary" fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <em>זהה לעיר הילד</em>
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

      {/* חלק 3: פרטי הורה משני (אופציונלי) */}
      <AnimatedSection expanded={expandedSections.secondaryParent}>
        <SectionHeader onClick={() => toggleSection("secondaryParent")}>
          <SectionIcon expanded={expandedSections.secondaryParent}>
            <PersonAddIcon />
          </SectionIcon>
          <SectionTitle
            variant="h6"
            expanded={expandedSections.secondaryParent}
          >
            פרטי הורה משני
            <Chip
              label="אופציונלי"
              size="small"
              color={expandedSections.secondaryParent ? "info" : "default"}
              sx={{ ml: 1, fontSize: "0.75rem" }}
            />
          </SectionTitle>
          <Tooltip title="פרטי הורה משני אינם חובה אך מומלצים למילוי">
            <InfoIcon
              fontSize="small"
              sx={{ mx: 1, color: theme.palette.info.main }}
            />
          </Tooltip>
          <Box sx={{ ml: "auto" }}>
            <IconButton
              size="small"
              color={expandedSections.secondaryParent ? "primary" : "default"}
              sx={{
                transform: expandedSections.secondaryParent
                  ? "rotate(-90deg)"
                  : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
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
                <FormControl fullWidth>
                  <InputLabel id="parent2CityName-label">עיר הורה</InputLabel>
                  <Select
                    labelId="parent2CityName-label"
                    id="parent2CityName"
                    name="parent2CityName"
                    value={formik.values.parent2CityName}
                    onChange={formik.handleChange}
                    label="עיר הורה"
                    startAdornment={
                      <InputAdornment position="start">
                        <CityIcon color="info" fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <em>זהה לעיר הילד</em>
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

      {/* חלק 4: פרטי קשר נוספים
      <AnimatedSection expanded={expandedSections.contactInfo}>
        <SectionHeader onClick={() => toggleSection("contactInfo")}>
          <SectionIcon expanded={expandedSections.contactInfo}>
            <PhoneIcon />
          </SectionIcon>
          <SectionTitle variant="h6" expanded={expandedSections.contactInfo}>
            פרטי קשר נוספים
            <Chip
              label="חשוב למילוי"
              size="small"
              color={expandedSections.contactInfo ? "warning" : "default"}
              sx={{ ml: 1, fontSize: "0.75rem" }}
            />
          </SectionTitle>
          <Box sx={{ ml: "auto" }}>
            <IconButton
              size="small"
              color={expandedSections.contactInfo ? "primary" : "default"}
              sx={{
                transform: expandedSections.contactInfo
                  ? "rotate(-90deg)"
                  : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
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
                  error={
                    formik.touched.emergencyContactName &&
                    Boolean(formik.errors.emergencyContactName)
                  }
                  helperText={
                    formik.touched.emergencyContactName &&
                    formik.errors.emergencyContactName
                  }
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
                  error={
                    formik.touched.emergencyContactPhone &&
                    Boolean(formik.errors.emergencyContactPhone)
                  }
                  helperText={
                    formik.touched.emergencyContactPhone &&
                    formik.errors.emergencyContactPhone
                  }
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

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="socialWorker"
                  name="socialWorker"
                  label="עובד סוציאלי"
                  placeholder="שם העובד הסוציאלי"
                  value={formik.values.socialWorker}
                  onChange={formik.handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MedicalIcon color="warning" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="תאריך הפניה"
                  value={formik.values.referralDate}
                  onChange={(date) =>
                    formik.setFieldValue("referralDate", date)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      id="referralDate"
                      name="referralDate"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventIcon color="warning" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="תאריך כניסה מתוכנן"
                  value={formik.values.plannedEntryDate}
                  onChange={(date) =>
                    formik.setFieldValue("plannedEntryDate", date)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      id="plannedEntryDate"
                      name="plannedEntryDate"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventIcon color="warning" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Collapse>
      </AnimatedSection> */}

      {/* סיכום והשלמה */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <Alert
          severity={isFormFilled ? "info" : "warning"}
          variant="outlined"
          sx={{ borderRadius: 2 }}
          icon={isFormFilled ? <InfoIcon /> : <InfoIcon />}
        >
          <AlertTitle>
            {isFormFilled ? "הטופס מוכן לשמירה" : "יש להשלים את הטופס"}
          </AlertTitle>
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
          overflow: "hidden",
          mt: 4,
        }}
      >
        <ActionButtonsContainer>
          {!isEditMode && ( <AnimatedButton
            variant="outlined"
            color="error"
            onClick={() => {
              Swal.fire({
                title: "האם אתה בטוח?",
                text: "הפעולה תנקה את כל השדות!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "כן, נקה טופס",
                cancelButtonText: "ביטול",
                reverseButtons: true,
              }).then((result) => {
                if (result.isConfirmed) {
                  formik.resetForm();
                  Swal.fire({
                    title: "נוקה!",
                    text: "הטופס נוקה בהצלחה.",
                    icon: "success",
                    timer: 1000,
                    showConfirmButton: false,
                  });
                }
              });
            }}
            startIcon={<DeleteIcon />}
            disabled={isLoading}
            sx={{ borderRadius: "50px", px: 3 }}
          >
            נקה טופס
          </AnimatedButton>
          )}
          <Box>
            <AnimatedButton
              type="submit"
              variant="contained"
              color="primary"
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : isEditMode ? (
                  <EditIcon />
                ) : (
                  <SaveIcon />
                )
              }
              // disabled={isLoading}
              sx={{
                borderRadius: "50px",
                px: 4,
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
              }}
            >
              {isEditMode ? "עדכן פרטים" : "שמור פרטים והמשך"}
            </AnimatedButton>
          </Box>
        </ActionButtonsContainer>
      </Paper>
    </form>
  );
};

export default PersonalInfoForm;