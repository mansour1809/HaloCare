import { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Button, Grid, Box, 
  TextField, FormControl, InputLabel, Select, MenuItem, 
  FormControlLabel, Switch, CircularProgress,
  InputAdornment, IconButton, Divider, Alert,
  Breadcrumbs
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { Visibility, VisibilityOff, ContentCopy, CloudUpload } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { useEmployees } from './EmployeesContext';
import { useDispatch } from 'react-redux';
import { deleteDocument, fetchDocumentsByEmployeeId, uploadDocument } from '../../Redux/features/documentsSlice';
import Validations from '../../utils/employeeValidations';
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
  
  const isEditMode = Boolean(existingEmployee);
  const pageTitle = isEditMode ? "עריכת פרטי עובד" : "קליטת עובד חדש";
  const submitButtonText = isEditMode ? "שמור שינויים" : "שמירת עובד חדש";
  
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


  // מצבי טופס
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  
  // קבצים ותמונות
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  
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
    validateField(name, date);

  };
  
  //handle cahngeing profile pic
  const handleProfilePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // בדיקה שאכן מדובר בתמונה
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
      const reader = new FileReader();
    reader.onload = (e) => {
      // for preview the image only
      const previewElement = document.getElementById('profile-preview');
      if (previewElement) {
        previewElement.src = e.target.result;
        previewElement.style.display = 'block';
      }
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
    
    // טיפול בתמונת פרופיל
    if (profilePhoto) {
      try {
        // בדיקה אם יש תמונת פרופיל קיימת
        const existingDocs = await dispatch(fetchDocumentsByEmployeeId(employeeId)).unwrap();
        const existingProfilePic = existingDocs.find(doc => 
          doc.docType === 'profile' || doc.docType === 'picture'
        );
        
        // מחיקת התמונה הקודמת אם קיימת
        if (existingProfilePic) {
          try {
            await dispatch(deleteDocument(existingProfilePic.docId)).unwrap();
            console.log('תמונת פרופיל קודמת נמחקה');
          } catch (deleteError) {
            console.warn('שגיאה במחיקת תמונה קודמת:', deleteError);
            // לא נעצור את התהליך בגלל זה
          }
        }
        
        const profileData = {
          document: {
            EmployeeId: employeeId, // לא צריך toString() - Redux יטפל בזה
            DocType: "profile",
            DocName: profilePhoto.name,
          },
          file: profilePhoto,
        };

        console.log('מעלה תמונת פרופיל:', profileData);
        
        const uploadResult = await dispatch(uploadDocument(profileData)).unwrap();
        
        console.log('תמונת פרופיל הועלתה:', uploadResult);

        // עדכון נתיב התמונה בפרופיל העובד
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
            // לא נכשיל את כל התהליך בגלל זה
          }
        }
      } catch (profileError) {
        console.error('שגיאה בהעלאת תמונת פרופיל:', profileError);
        throw new Error(`שגיאה בהעלאת תמונת פרופיל: ${profileError.message || profileError}`);
      }
    }
    
    // טיפול במסמכים נוספים
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
          // נמשיך עם שאר המסמכים
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('שגיאה כללית בהעלאת קבצים:', error);
    throw error; // נזרוק את השגיאה כדי שהטופס יטפל בה
  } finally {
    setUploadingFiles(false);
  }
};
  
  // פונקציות ולידציה
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
    // רשימת השדות שרוצים לבדוק
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
    

    // בדיקת כל השדות
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
    
    // בדיקת אימייל אם מסומן לשלוח אימייל
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
      // מצב עריכה - עדכון עובד קיים
      console.log('עדכון עובד קיים:', formData);
      result = await updateEmployee(formData);
    } else {
      // מצב הוספה - הוספת עובד חדש
      console.log('הוספת עובד חדש:', formData);
      result = await addEmployee(formData);
    }
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    console.log('עובד נשמר בהצלחה:', result);
    
    // קבלת מזהה העובד
    const employeeId = isEditMode ? formData.employeeId : result.data.employeeId;
    
    // שליחת אימייל (רק במצב הוספה חדשה)
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
        // לא נכשיל את כל התהליך בגלל זה
      }
    }
    
    // העלאת קבצים
    try {
      console.log('מתחיל העלאת קבצים לעובד:', employeeId);
      await uploadFiles(employeeId);
      console.log('קבצים הועלו בהצלחה');
    } catch (uploadError) {
      console.error('שגיאה בהעלאת קבצים:', uploadError);
      
      // נציג אזהרה אבל לא נכשיל את כל התהליך
      Swal.fire({
        icon: 'warning',
        title: 'העובד נשמר בהצלחה',
        text: 'אולם אירעה שגיאה בהעלאת הקבצים. אנא נסה להעלות אותם שוב מעמוד עריכת העובד.',
        confirmButtonText: 'אישור'
      });
    }
    
    // הודעת הצלחה  
    Swal.fire({
      title: isEditMode ? 'העובד עודכן בהצלחה!' : 'העובד נוסף בהצלחה!',
      text: isEditMode ? 'פרטי העובד עודכנו במערכת' : 'העובד נוסף למערכת בהצלחה',
      icon: 'success',
      confirmButtonText: 'אישור'
    }).then(() => {
      // מעבר לעמוד הרשימה או סגירת הטופס
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

  // פונקציות עזר להצגת שגיאות
  const getFieldError = (fieldName) => errors[fieldName] || '';
  const hasFieldError = (fieldName) => Boolean(errors[fieldName]);


  return (
    <ThemeProvider theme={rtlTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
        <Container maxWidth="md" dir="rtl">
        {!isEditMode && <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          onClick={(e) => {
            e.preventDefault();
            navigate('/employees/list');
          }}
          sx={{ cursor: 'pointer' }}
        >
          רשימת עובדים
        </Link>
        <Typography color="text.primary">
          {'עריכת עובד' }
        </Typography>
      </Breadcrumbs>}
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
             {pageTitle} 
            </Typography>

            {successMessage && (
              <Alert
                severity="success"
                sx={{ mb: 3 }}
                onClose={() => setSuccessMessage("")}
              >
                {successMessage}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {/* פרטים אישיים */}
              <Box sx={{ marginBottom: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#4cb5c3", fontWeight: "bold", marginBottom: 2 }}
                >
                  פרטים אישיים
                </Typography>
                <Divider sx={{ mb: 2 }} />

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
                          error: hasFieldError("birthDate"),
                          helperText: getFieldError("birthDate"),
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
                    <FormControl
                      fullWidth
                      required
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

               
                  {/* אזור תצוגה מקדימה לתמונת פרופיל */}
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
  
  {/* הצגת שם הקובץ אם נבחר */}
  {profilePhoto && (
    <Typography variant="caption" display="block">
      {profilePhoto.name} ({Math.round(profilePhoto.size / 1024)} KB)
    </Typography>
  )}
  
  {/* תצוגה מקדימה של התמונה */}
  <Box mt={1} textAlign="center" display={profilePhoto ? 'block' : 'none'}>
    <img 
      id="profile-preview"
      src="" 
      alt="תצוגה מקדימה" 
      style={{ 
        maxHeight: '100px', 
        maxWidth: '100%', 
        borderRadius: '50%',
        border: '1px solid #ddd',
        display: 'none'
      }} 
    />
  </Box>
  
  {/* הצגת תמונה קיימת אם בעריכה */}
  {isEditMode && formData.photo && !profilePhoto && (
    <Box mt={1} textAlign="center">
      {console.log(isEditMode,formData.photo,profilePhoto)}
      <Typography variant="caption" display="block" sx={{ mb: 1 }}>
        תמונה נוכחית:
      </Typography>
      <img 
        src={`${baseUrl}/api/Documents/content-by-path?path=${encodeURIComponent(formData.photo)}`}
        alt="תמונה נוכחית" 
        style={{ 
          width: '25%',
          maxHeight: '100px', 
          maxWidth: '100%', 
          borderRadius: '50%',
          border: '1px solid #ddd'
        }} 
      />
    </Box>
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
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      required
                      error={hasFieldError("roleName")}
                    >
                      <InputLabel>תפקיד</InputLabel>
                      <Select
                        name="roleName"
                        value={formData.roleName}
                        onChange={handleChange}
                        label="תפקיד"
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
                    <FormControl required fullWidth variant="outlined">
                      <InputLabel>שיוך לכיתה</InputLabel>
                      <Select
                        name="classId"
                        value={formData.classId}
                        onChange={handleChange}
                        label="שיוך לכיתה"
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
                      disabled={isEditMode}
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
                      <Box sx={{ mt: 1 }}>
                        {documents.map((doc, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="caption">
                              {doc.name} ({Math.round(doc.size / 1024)} KB)
                            </Typography>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeDocument(index)}
                              sx={{ ml: 1 }}
                            >
                              &times;
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Box>

              {/* פרטי כניסה למערכת */}
              {!isEditMode && (
              <Box sx={{ marginBottom: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#4cb5c3", fontWeight: "bold", marginBottom: 2 }}
                >
                  פרטי כניסה למערכת
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="דוא״ל"
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
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="סיסמה ראשונית"
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
                              // onClick={handleCopyPassword}
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
              )}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="outlined"
                  onClick={() =>isEditMode ? onClose() : navigate("/employees/list")}
                  disabled={submitting || uploadingFiles}
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
                  disabled={submitting || uploadingFiles}
                >
                  {submitting || uploadingFiles ? (
                    <CircularProgress size={24} />
                  ) : (
                    `${submitButtonText}`
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

export default EmployeeForm;