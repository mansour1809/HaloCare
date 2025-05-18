// components/kids/PersonalInfoForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid, Typography, TextField, MenuItem, FormControl,
  InputLabel, Select, Button, Divider, Box,
  Avatar, FormHelperText, Alert, AlertTitle,
  InputAdornment, Tooltip, CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled } from '@mui/material/styles';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  DeleteOutline as DeleteIcon,
  CloudUpload as UploadIcon,
  Info as InfoIcon,
  Call as CallIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { fetchCities } from '../../Redux/features/citiesSlice';
import { createKid, updateKid } from '../../Redux/features/kidsSlice';

// תצוגת האווטאר עם אפשרות להעלאת תמונה
const ProfileImageUpload = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

// סקשן מוגדר בטופס
const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2, 0),
  position: 'relative',
}));

// כותרת של סקשן עם קו מתחת
const SectionTitle = styled(Typography)(({ theme }) => ({
  display: 'flex', 
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  color: theme.palette.primary.main,
  fontWeight: 'bold',
}));

// סכימת ולידציה עם Yup
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
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(data?.photoPath || null);
  
  // שליפת נתוני רפרנס מהסטור
  const { cities, status: citiesStatus } = useSelector(state => state.cities);
  const { status: kidStatus, error: kidError } = useSelector(state => state.kids);
  
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
  
  // רשימת קופות חולים סטטית
  const healthInsurances = ['כללית', 'מכבי', 'מאוחדת', 'לאומית'];
  
  // מימוש ה-Formik - זהה למימוש הקודם...
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
          // לדוגמה:
          // const response = await axios.post('/api/upload-photo', formData);
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
  
  return (
    <form onSubmit={formik.handleSubmit}>
      {kidError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>שגיאה</AlertTitle>
          {kidError}
        </Alert>
      )}
      
      {/* תמונת פרופיל */}
      <ProfileImageUpload>
        <Avatar
          src={photoPreview}
          sx={{
            width: 120,
            height: 120,
            mb: 1,
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
          }}
        />
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="kid-photo-upload"
          type="file"
          onChange={handlePhotoChange}
        />
        <label htmlFor="kid-photo-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<UploadIcon />}
            size="small"
          >
            העלאת תמונה
          </Button>
        </label>
      </ProfileImageUpload>
      
      {/* חלק 1: פרטי הילד */}
      <FormSection>
        <SectionTitle variant="h6">
          פרטי הילד
        </SectionTitle>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="firstName"
              name="firstName"
              label="שם פרטי"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              helperText={formik.touched.firstName && formik.errors.firstName}
              required
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="lastName"
              name="lastName"
              label="שם משפחה"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
              required
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="תאריך לידה"
              value={formik.values.birthDate}
              onChange={(value) => formik.setFieldValue('birthDate', value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  id="birthDate"
                  name="birthDate"
                  error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
                  helperText={formik.touched.birthDate && formik.errors.birthDate}
                  required
                  size="small"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth
              error={formik.touched.gender && Boolean(formik.errors.gender)}
              required
              size="small"
            >
              <InputLabel id="gender-label">מין</InputLabel>
              <Select
                labelId="gender-label"
                id="gender"
                name="gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="מין"
              >
                <MenuItem value="זכר">זכר</MenuItem>
                <MenuItem value="נקבה">נקבה</MenuItem>
              </Select>
              {formik.touched.gender && formik.errors.gender && (
                <FormHelperText>{formik.errors.gender}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {/* שאר שדות פרטי הילד */}
          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth
              error={formik.touched.cityName && Boolean(formik.errors.cityName)}
              required
              size="small"
            >
              <InputLabel id="city-label">עיר</InputLabel>
              <Select
                labelId="city-label"
                id="cityName"
                name="cityName"
                value={formik.values.cityName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="עיר"
              >
                {cities.map((city) => (
                  <MenuItem key={city.cityName} value={city.cityName}>{city.cityName}</MenuItem>
                ))}
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
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.address && Boolean(formik.errors.address)}
              helperText={formik.touched.address && formik.errors.address}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              required
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth
              error={formik.touched.hName && Boolean(formik.errors.hName)}
              required
              size="small"
            >
              <InputLabel id="health-insurance-label">קופת חולים</InputLabel>
              <Select
                labelId="health-insurance-label"
                id="hName"
                name="hName"
                value={formik.values.hName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="קופת חולים"
              >
                {healthInsurances.map((hi) => (
                  <MenuItem key={hi} value={hi}>{hi}</MenuItem>
                ))}
              </Select>
              {formik.touched.hName && formik.errors.hName && (
                <FormHelperText>{formik.errors.hName}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="תאריך קליטה מתוכנן"
              value={formik.values.plannedEntryDate}
              onChange={(value) => formik.setFieldValue('plannedEntryDate', value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  id="plannedEntryDate"
                  name="plannedEntryDate"
                  size="small"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="socialWorker"
              name="socialWorker"
              label="עו״ס מפנה"
              value={formik.values.socialWorker}
              onChange={formik.handleChange}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="תאריך הפנייה"
              value={formik.values.referralDate}
              onChange={(value) => formik.setFieldValue('referralDate', value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  id="referralDate"
                  name="referralDate"
                  size="small"
                />
              )}
            />
          </Grid>
        </Grid>
      </FormSection>
      
      {/* חלק 2: פרטי הורה ראשי */}
      <FormSection>
        <SectionTitle variant="h6">
          פרטי הורה ראשי
        </SectionTitle>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="parent1FirstName"
              name="parent1FirstName"
              label="שם פרטי"
              value={formik.values.parent1FirstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.parent1FirstName && Boolean(formik.errors.parent1FirstName)}
              helperText={formik.touched.parent1FirstName && formik.errors.parent1FirstName}
              required
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="parent1LastName"
              name="parent1LastName"
              label="שם משפחה"
              value={formik.values.parent1LastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.parent1LastName && Boolean(formik.errors.parent1LastName)}
              helperText={formik.touched.parent1LastName && formik.errors.parent1LastName}
              required
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="parent1Mobile"
              name="parent1Mobile"
              label="טלפון נייד"
              value={formik.values.parent1Mobile}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.parent1Mobile && Boolean(formik.errors.parent1Mobile)}
              helperText={formik.touched.parent1Mobile && formik.errors.parent1Mobile}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CallIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              required
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="parent1Email"
              name="parent1Email"
              label="דוא״ל"
              type="email"
              value={formik.values.parent1Email}
              onChange={formik.handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="parent1Address"
              name="parent1Address"
              label="כתובת (אם שונה מכתובת הילד)"
              value={formik.values.parent1Address}
              onChange={formik.handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="parent1Occupation"
              name="parent1Occupation"
              label="תעסוקה"
              value={formik.values.parent1Occupation}
              onChange={formik.handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WorkIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
        </Grid>
      </FormSection>
      
      {/* חלק 3: פרטי הורה משני (אופציונלי) */}
      <FormSection>
        <SectionTitle variant="h6">
          פרטי הורה משני
          <Tooltip title="פרטי הורה משני אינם חובה אך מומלצים למילוי">
            <InfoIcon fontSize="small" sx={{ ml: 1, fontSize: '1rem' }} />
          </Tooltip>
        </SectionTitle>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="parent2FirstName"
              name="parent2FirstName"
              label="שם פרטי"
              value={formik.values.parent2FirstName}
              onChange={formik.handleChange}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="parent2LastName"
              name="parent2LastName"
              label="שם משפחה"
              value={formik.values.parent2LastName}
              onChange={formik.handleChange}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="parent2Mobile"
              name="parent2Mobile"
              label="טלפון נייד"
              value={formik.values.parent2Mobile}
              onChange={formik.handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CallIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="parent2Email"
              name="parent2Email"
              label="דוא״ל"
              type="email"
              value={formik.values.parent2Email}
              onChange={formik.handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
        </Grid>
      </FormSection>
      
      {/* חלק 4: פרטי קשר נוספים */}
      <FormSection>
        <SectionTitle variant="h6">
          פרטי קשר נוספים
        </SectionTitle>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="homePhone"
              name="homePhone"
              label="טלפון בבית"
              value={formik.values.homePhone}
              onChange={formik.handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CallIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="emergencyContactName"
              name="emergencyContactName"
              label="איש קשר בשעת חירום"
              value={formik.values.emergencyContactName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.emergencyContactName && Boolean(formik.errors.emergencyContactName)}
              helperText={formik.touched.emergencyContactName && formik.errors.emergencyContactName}
              required
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              label="טלפון איש קשר חירום"
              value={formik.values.emergencyContactPhone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.emergencyContactPhone && Boolean(formik.errors.emergencyContactPhone)}
              helperText={formik.touched.emergencyContactPhone && formik.errors.emergencyContactPhone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CallIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              required
              size="small"
            />
          </Grid>
        </Grid>
      </FormSection>
      
      {/* כפתורי פעולה בתחתית הטופס */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => formik.resetForm()}
          startIcon={<DeleteIcon />}
        >
          נקה טופס
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={kidStatus === 'loading' ? <CircularProgress size={20} color="inherit" /> : (isEditMode ? <EditIcon /> : <SaveIcon />)}
          disabled={kidStatus === 'loading'}
        >
          {isEditMode ? 'עדכן פרטים' : 'שמור פרטים'}
        </Button>
      </Box>
    </form>
  );
};

export default PersonalInfoForm;