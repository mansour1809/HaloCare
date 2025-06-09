// import { useState, useEffect } from 'react';
// import { 
//   Container, Paper, Typography, Button, Grid, Box, 
//   TextField, FormControl, InputLabel, Select, MenuItem, 
//   CircularProgress, InputAdornment, IconButton, Divider, Alert,
//   Avatar
// } from '@mui/material';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { he } from 'date-fns/locale';
// import { Visibility, VisibilityOff, CloudUpload, Person, Email, Phone, LocationOn, Edit } from '@mui/icons-material';
// import { createTheme, ThemeProvider } from '@mui/material/styles';
// import { useEmployees } from './EmployeesContext';
// import { useDispatch } from 'react-redux';
// import { deleteDocument, fetchDocumentsByEmployeeId, uploadDocument } from '../../Redux/features/documentsSlice';
// import Validations from '../../utils/employeeValidations';
// import Swal from 'sweetalert2';

// // יצירת תמה מותאמת לעברית
// const rtlTheme = createTheme({
//   direction: 'rtl',
//   typography: {
//     fontFamily: 'Rubik, Arial, sans-serif',
//   },
//   palette: {
//     primary: {
//       main: '#4cb5c3',
//     },
//     background: {
//       default: '#f5f5f5',
//     },
//   },
// });

// const EmployeeProfile = ({ currentEmployee, onUpdateSuccess }) => {
//   const dispatch = useDispatch();
  
//   const { 
//     updateEmployee,
//     generateRandomPassword,
//     cities,
//   } = useEmployees();
  
//   // מצב טופס
//   const [formData, setFormData] = useState({
//     employeeId: currentEmployee?.employeeId || '',
//     firstName: currentEmployee?.firstName || '',
//     lastName: currentEmployee?.lastName || '',
//     email: currentEmployee?.email || '',
//     mobilePhone: currentEmployee?.mobilePhone || '',
//     cityName: currentEmployee?.cityName || '',
//     birthDate: currentEmployee?.birthDate ? new Date(currentEmployee.birthDate) : null,
//     photo: currentEmployee?.photo || '',
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: '',
//   });

//   // מצבי טופס
//   const [errors, setErrors] = useState({});
//   const [submitting, setSubmitting] = useState(false);
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [editMode, setEditMode] = useState(false);
//   const [changePasswordMode, setChangePasswordMode] = useState(false);
  
//   // קבצים ותמונות
//   const [profilePhoto, setProfilePhoto] = useState(null);
//   const [uploadingFiles, setUploadingFiles] = useState(false);
  
//   // פונקציות טיפול בטופס
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     validateField(name, value);
//   };
  
//   const handleDateChange = (name, date) => {
//     setFormData(prev => ({ ...prev, [name]: date }));
//     validateField(name, date);
//   };
  
//   // טיפול בתמונת פרופיל
//   const handleProfilePhotoChange = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
      
//       if (!file.type.startsWith('image/')) {
//         Swal.fire({
//           icon: 'error',
//           title: 'קובץ לא מתאים',
//           text: 'יש לבחור קובץ תמונה בלבד (jpg, png, etc.)',
//           confirmButtonText: 'אישור'
//         });
//         return;
//       }
      
//       if (file.size > 5 * 1024 * 1024) {
//         Swal.fire({
//           icon: 'error',
//           title: 'קובץ גדול מדי',
//           text: 'גודל התמונה המקסימלי הוא 5MB',
//           confirmButtonText: 'אישור'
//         });
//         return;
//       }
      
//       setProfilePhoto(file);
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const previewElement = document.getElementById('profile-preview');
//         if (previewElement) {
//           previewElement.src = e.target.result;
//           previewElement.style.display = 'block';
//         }
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // העלאת תמונת פרופיל
//   const uploadProfilePhoto = async (employeeId) => {
//     if (!profilePhoto) return true;
    
//     try {
//       setUploadingFiles(true);
      
//       const existingDocs = await dispatch(fetchDocumentsByEmployeeId(employeeId)).unwrap();
//       const existingProfilePic = existingDocs.find(doc => doc.docType === 'profile');
      
//       if (existingProfilePic) {
//         await dispatch(deleteDocument(existingProfilePic.docId)).unwrap();
//       }
      
//       const profileData = {
//         document: {
//           EmployeeId: employeeId.toString(),
//           DocType: "profile",
//           DocName: profilePhoto.name,
//         },
//         file: profilePhoto,
//       };

//       const uploadResult = await dispatch(uploadDocument(profileData)).unwrap();

//       if (uploadResult && uploadResult.docPath) {
//         await updateEmployee({
//           ...formData,
//           photo: uploadResult.docPath
//         });
        
//         // עדכון המצב המקומי
//         setFormData(prev => ({ ...prev, photo: uploadResult.docPath }));
//       }
      
//       return true;
//     } catch (error) {
//       console.error('שגיאה בהעלאת תמונה:', error);
//       Swal.fire({
//         icon: 'error',
//         title: 'שגיאה בהעלאת תמונה',
//         text: 'אירעה שגיאה בהעלאת התמונה. אנא נסה שוב.',
//         confirmButtonText: 'אישור'
//       });
//       return false;
//     } finally {
//       setUploadingFiles(false);
//     }
//   };
  
//   // ייצור סיסמה אקראית
//   const handleGeneratePassword = () => {
//     const newPassword = generateRandomPassword();
//     setFormData(prev => ({ 
//       ...prev, 
//       newPassword: newPassword,
//       confirmPassword: newPassword
//     }));
//     validateField('newPassword', newPassword);
//     validateField('confirmPassword', newPassword);
//   };
  
//   // פונקציות ולידציה
//   const validateField = (name, value) => {
//     let error = '';
    
//     if (name === 'firstName' || name === 'lastName') {
//       if (!value || value.trim() === '') {
//         error = 'שדה חובה';
//       } else if (value.length < 2) {
//         error = 'שם חייב להכיל לפחות 2 תווים';
//       }
//     }
    
//     if (name === 'email') {
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (value && !emailRegex.test(value)) {
//         error = 'כתובת אימייל לא תקינה';
//       }
//     }
    
//     if (name === 'mobilePhone') {
//       const phoneRegex = /^05\d{8}$/;
//       if (value && !phoneRegex.test(value)) {
//         error = 'מספר טלפון לא תקין (05xxxxxxxx)';
//       }
//     }
    
//     if (name === 'newPassword' && changePasswordMode) {
//       if (!value) {
//         error = 'יש להזין סיסמה חדשה';
//       } else if (value.length < 6) {
//         error = 'סיסמה חייבת להכיל לפחות 6 תווים';
//       }
//     }
    
//     if (name === 'confirmPassword' && changePasswordMode) {
//       if (!value) {
//         error = 'יש לאשר את הסיסמה החדשה';
//       } else if (value !== formData.newPassword) {
//         error = 'הסיסמאות אינן תואמות';
//       }
//     }
    
//     if (name === 'currentPassword' && changePasswordMode) {
//       if (!value) {
//         error = 'יש להזין את הסיסמה הנוכחית';
//       }
//     }
    
//     setErrors(prev => ({
//       ...prev,
//       [name]: error
//     }));
    
//     return !error;
//   };

//   const validateForm = () => {
//     const fieldsToValidate = ['firstName', 'lastName'];
    
//     if (changePasswordMode) {
//       fieldsToValidate.push('currentPassword', 'newPassword', 'confirmPassword');
//     }
    
//     let isValid = true;
//     const newErrors = {};
    
//     for (const field of fieldsToValidate) {
//       if (!validateField(field, formData[field])) {
//         isValid = false;
//       }
//     }
    
//     setErrors(newErrors);
//     return isValid;
//   };
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       Swal.fire({
//         title: 'שגיאה בטופס',
//         text: 'יש לתקן את השגיאות המסומנות',
//         icon: 'error',
//         confirmButtonText: 'אישור'
//       });
//       return;
//     }
    
//     try {
//       setSubmitting(true);
      
//       // עדכון פרטים אישיים
//       const updateData = {
//         employeeId: formData.employeeId,
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         email: formData.email,
//         mobilePhone: formData.mobilePhone,
//         cityName: formData.cityName,
//         birthDate: formData.birthDate,
//       };
      
//       // אם משנים סיסמה, הוסף אותה לעדכון
//       if (changePasswordMode && formData.newPassword) {
//         updateData.password = formData.newPassword;
//       }
      
//       const result = await updateEmployee(updateData);
      
//       if (!result.success) {
//         throw new Error(result.error);
//       }
      
//       // העלאת תמונת פרופיל אם נבחרה
//       await uploadProfilePhoto(formData.employeeId);
      
//       // הודעת הצלחה
//       Swal.fire({
//         title: 'הפרטים עודכנו בהצלחה!',
//         icon: 'success',
//         timer: 2000,
//         showConfirmButton: false
//       });
      
//       // איפוס מצבי עריכה
//       setEditMode(false);
//       setChangePasswordMode(false);
//       setFormData(prev => ({
//         ...prev,
//         currentPassword: '',
//         newPassword: '',
//         confirmPassword: ''
//       }));
      
//       // קריאה לפונקציית קולבק אם קיימת
//       if (onUpdateSuccess) {
//         onUpdateSuccess(result.data);
//       }
      
//     } catch (err) {
//       Swal.fire({
//         title: 'שגיאה בעדכון הפרטים',
//         text: err.message || 'אנא בדוק את הנתונים ונסה שוב',
//         icon: 'error',
//         confirmButtonText: 'אישור'
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // פונקציות עזר להצגת שגיאות
//   const getFieldError = (fieldName) => errors[fieldName] || '';
//   const hasFieldError = (fieldName) => Boolean(errors[fieldName]);

//   return (
//     <ThemeProvider theme={rtlTheme}>
//       <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
//         <Container maxWidth="md" dir="rtl" sx={{ py: 4 }}>
//           {/* כרטיס פרופיל עליון */}
//           <Paper
//             elevation={3}
//             sx={{ 
//               padding: 3, 
//               marginBottom: 3,
//               background: 'linear-gradient(135deg, #4cb5c3 0%, #3a8a95 100%)',
//               color: 'white',
//               textAlign: 'center'
//             }}
//           >
//             <Avatar
//               sx={{ 
//                 width: 120, 
//                 height: 120, 
//                 margin: '0 auto 16px',
//                 border: '4px solid white',
//                 fontSize: '3rem'
//               }}
//               src={formData.photo ? `${baseUrl}/api/Documents/content-by-path?path=${encodeURIComponent(formData.photo)}` : undefined}
//             >
//               {!formData.photo && (formData.firstName?.[0] || '') + (formData.lastName?.[0] || '')}
//             </Avatar>
            
//             <Typography variant="h4" gutterBottom>
//               {formData.firstName} {formData.lastName}
//             </Typography>
            
//             <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
//               {formData.email && (
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                   <Email />
//                   <Typography>{formData.email}</Typography>
//                 </Box>
//               )}
//               {formData.mobilePhone && (
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                   <Phone />
//                   <Typography>{formData.mobilePhone}</Typography>
//                 </Box>
//               )}
//               {formData.cityName && (
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                   <LocationOn />
//                   <Typography>{formData.cityName}</Typography>
//                 </Box>
//               )}
//             </Box>
//           </Paper>

//           {/* כפתורי עריכה */}
//           <Paper elevation={2} sx={{ padding: 2, marginBottom: 3 }}>
//             <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
//               <Button
//                 variant={editMode ? "contained" : "outlined"}
//                 startIcon={<Edit />}
//                 onClick={() => setEditMode(!editMode)}
//                 color="primary"
//               >
//                 {editMode ? "ביטול עריכה" : "עריכת פרטים"}
//               </Button>
              
//               <Button
//                 variant={changePasswordMode ? "contained" : "outlined"}
//                 onClick={() => setChangePasswordMode(!changePasswordMode)}
//                 color="secondary"
//               >
//                 {changePasswordMode ? "ביטול שינוי סיסמה" : "שינוי סיסמה"}
//               </Button>
//             </Box>
//           </Paper>

//           {/* טופס עריכה */}
//           {(editMode || changePasswordMode) && (
//             <Paper elevation={3} sx={{ padding: 3 }}>
//               <Typography
//                 variant="h5"
//                 component="h1"
//                 gutterBottom
//                 align="center"
//                 sx={{ fontWeight: "bold", color: "#333", mb: 3 }}
//               >
//                 עריכת פרטי פרופיל
//               </Typography>

//               {successMessage && (
//                 <Alert
//                   severity="success"
//                   sx={{ mb: 3 }}
//                   onClose={() => setSuccessMessage("")}
//                 >
//                   {successMessage}
//                 </Alert>
//               )}

//               <form onSubmit={handleSubmit}>
//                 {editMode && (
//                   <>
//                     {/* פרטים אישיים */}
//                     <Box sx={{ marginBottom: 3 }}>
//                       <Typography
//                         variant="subtitle1"
//                         sx={{ color: "#4cb5c3", fontWeight: "bold", marginBottom: 2 }}
//                       >
//                         פרטים אישיים
//                       </Typography>
//                       <Divider sx={{ mb: 2 }} />

//                       <Grid container spacing={2}>
//                         <Grid item xs={12} md={6}>
//                           <TextField
//                             fullWidth
//                             label="שם פרטי"
//                             name="firstName"
//                             value={formData.firstName}
//                             onChange={handleChange}
//                             variant="outlined"
//                             required
//                             error={hasFieldError("firstName")}
//                             helperText={getFieldError("firstName")}
//                           />
//                         </Grid>

//                         <Grid item xs={12} md={6}>
//                           <TextField
//                             fullWidth
//                             label="שם משפחה"
//                             name="lastName"
//                             value={formData.lastName}
//                             onChange={handleChange}
//                             variant="outlined"
//                             required
//                             error={hasFieldError("lastName")}
//                             helperText={getFieldError("lastName")}
//                           />
//                         </Grid>

//                         <Grid item xs={12} md={6}>
//                           <TextField
//                             fullWidth
//                             label="דוא״ל"
//                             name="email"
//                             type="email"
//                             value={formData.email}
//                             onChange={handleChange}
//                             variant="outlined"
//                             error={hasFieldError("email")}
//                             helperText={getFieldError("email")}
//                           />
//                         </Grid>

//                         <Grid item xs={12} md={6}>
//                           <TextField
//                             fullWidth
//                             label="טלפון נייד"
//                             name="mobilePhone"
//                             type="tel"
//                             value={formData.mobilePhone}
//                             onChange={handleChange}
//                             variant="outlined"
//                             error={hasFieldError("mobilePhone")}
//                             helperText={getFieldError("mobilePhone")}
//                           />
//                         </Grid>

//                         <Grid item xs={12} md={6}>
//                           <DatePicker
//                             label="תאריך לידה"
//                             value={formData.birthDate}
//                             onChange={(date) => handleDateChange("birthDate", date)}
//                             slotProps={{
//                               textField: {
//                                 fullWidth: true,
//                                 variant: "outlined",
//                                 error: hasFieldError("birthDate"),
//                                 helperText: getFieldError("birthDate"),
//                               },
//                             }}
//                           />
//                         </Grid>

//                         <Grid item xs={12} md={6}>
//                           <FormControl fullWidth variant="outlined">
//                             <InputLabel>עיר</InputLabel>
//                             <Select
//                               name="cityName"
//                               value={formData.cityName}
//                               onChange={handleChange}
//                               label="עיר"
//                             >
//                               {!cities.length ? (
//                                 <MenuItem disabled>טוען ערים...</MenuItem>
//                               ) : (
//                                 cities.map((city) => (
//                                   <MenuItem key={city.cityName} value={city.cityName}>
//                                     {city.cityName}
//                                   </MenuItem>
//                                 ))
//                               )}
//                             </Select>
//                           </FormControl>
//                         </Grid>

//                         {/* העלאת תמונת פרופיל */}
//                         <Grid item xs={12}>
//                           <Button
//                             variant="outlined"
//                             component="label"
//                             startIcon={<CloudUpload />}
//                             sx={{ height: "56px", width: "100%" }}
//                           >
//                             {profilePhoto ? "תמונה חדשה נבחרה" : "שינוי תמונת פרופיל"}
//                             <input
//                               type="file"
//                               hidden
//                               accept="image/*"
//                               onChange={handleProfilePhotoChange}
//                             />
//                           </Button>
                          
//                           {profilePhoto && (
//                             <Box mt={2} textAlign="center">
//                               <Typography variant="caption" display="block" sx={{ mb: 1 }}>
//                                 תצוגה מקדימה:
//                               </Typography>
//                               <img 
//                                 id="profile-preview"
//                                 src="" 
//                                 alt="תצוגה מקדימה" 
//                                 style={{ 
//                                   maxHeight: '150px', 
//                                   maxWidth: '150px', 
//                                   borderRadius: '50%',
//                                   border: '2px solid #4cb5c3'
//                                 }} 
//                               />
//                             </Box>
//                           )}
//                         </Grid>
//                       </Grid>
//                     </Box>
//                   </>
//                 )}

//                 {changePasswordMode && (
//                   <Box sx={{ marginBottom: 3 }}>
//                     <Typography
//                       variant="subtitle1"
//                       sx={{ color: "#4cb5c3", fontWeight: "bold", marginBottom: 2 }}
//                     >
//                       שינוי סיסמה
//                     </Typography>
//                     <Divider sx={{ mb: 2 }} />

//                     <Grid container spacing={2}>
//                       <Grid item xs={12}>
//                         <TextField
//                           fullWidth
//                           label="סיסמה נוכחית"
//                           name="currentPassword"
//                           type={showCurrentPassword ? "text" : "password"}
//                           value={formData.currentPassword}
//                           onChange={handleChange}
//                           variant="outlined"
//                           required
//                           error={hasFieldError("currentPassword")}
//                           helperText={getFieldError("currentPassword")}
//                           InputProps={{
//                             endAdornment: (
//                               <InputAdornment position="end">
//                                 <IconButton
//                                   onClick={() => setShowCurrentPassword(!showCurrentPassword)}
//                                   edge="end"
//                                 >
//                                   {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
//                                 </IconButton>
//                               </InputAdornment>
//                             ),
//                           }}
//                         />
//                       </Grid>

//                       <Grid item xs={12}>
//                         <TextField
//                           fullWidth
//                           label="סיסמה חדשה"
//                           name="newPassword"
//                           type={showNewPassword ? "text" : "password"}
//                           value={formData.newPassword}
//                           onChange={handleChange}
//                           variant="outlined"
//                           required
//                           error={hasFieldError("newPassword")}
//                           helperText={getFieldError("newPassword")}
//                           InputProps={{
//                             endAdornment: (
//                               <InputAdornment position="end">
//                                 <IconButton
//                                   onClick={() => setShowNewPassword(!showNewPassword)}
//                                   edge="end"
//                                 >
//                                   {showNewPassword ? <VisibilityOff /> : <Visibility />}
//                                 </IconButton>
//                               </InputAdornment>
//                             ),
//                           }}
//                         />
//                       </Grid>

//                       <Grid item xs={12}>
//                         <TextField
//                           fullWidth
//                           label="אישור סיסמה חדשה"
//                           name="confirmPassword"
//                           type={showConfirmPassword ? "text" : "password"}
//                           value={formData.confirmPassword}
//                           onChange={handleChange}
//                           variant="outlined"
//                           required
//                           error={hasFieldError("confirmPassword")}
//                           helperText={getFieldError("confirmPassword")}
//                           InputProps={{
//                             endAdornment: (
//                               <InputAdornment position="end">
//                                 <IconButton
//                                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                                   edge="end"
//                                 >
//                                   {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
//                                 </IconButton>
//                               </InputAdornment>
//                             ),
//                           }}
//                         />
//                       </Grid>

//                       <Grid item xs={12}>
//                         <Button
//                           onClick={handleGeneratePassword}
//                           variant="outlined"
//                           fullWidth
//                           sx={{ mt: 1 }}
//                         >
//                           ייצור סיסמה אקראית
//                         </Button>
//                       </Grid>
//                     </Grid>
//                   </Box>
//                 )}

//                 {/* כפתורי שמירה */}
//                 <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
//                   <Button
//                     variant="outlined"
//                     onClick={() => {
//                       setEditMode(false);
//                       setChangePasswordMode(false);
//                     }}
//                     disabled={submitting || uploadingFiles}
//                   >
//                     ביטול
//                   </Button>
                  
//                   <Button
//                     type="submit"
//                     variant="contained"
//                     color="primary"
//                     sx={{
//                       paddingX: 4,
//                       paddingY: 1,
//                       fontSize: "1rem",
//                       borderRadius: 2,
//                     }}
//                     disabled={submitting || uploadingFiles}
//                   >
//                     {submitting || uploadingFiles ? (
//                       <CircularProgress size={24} />
//                     ) : (
//                       "שמור שינויים"
//                     )}
//                   </Button>
//                 </Box>
//               </form>
//             </Paper>
//           )}
//         </Container>
//       </LocalizationProvider>
//     </ThemeProvider>
//   );
// };

// export default EmployeeProfile;
import { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Button, Grid, Box, 
  TextField, FormControl, InputLabel, Select, MenuItem, 
  CircularProgress, InputAdornment, IconButton, Divider, Alert,
  Avatar, Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { format } from 'date-fns';
import { 
  Visibility, VisibilityOff, CloudUpload, Person, Email, Phone, 
  LocationOn, Edit, Check, Close, Cake, Lock
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useEmployees } from './EmployeesContext';
import { useAuth } from './AuthContext'; // הוספתי את זה
import { useDispatch } from 'react-redux';
import { deleteDocument, fetchDocumentsByEmployeeId, uploadDocument } from '../../Redux/features/documentsSlice';
import Swal from 'sweetalert2';

// TODO: החליפי את זה עם ה-baseUrl האמיתי שלך
const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
    background: {
      default: '#f5f5f5',
    },
  },
});

const EmployeeProfile = ({ onUpdateSuccess }) => {
  const dispatch = useDispatch();
  const { currentUser } = useAuth(); // שימוש במשתמש המחובר
  
  const { 
    updateEmployee,
    generateRandomPassword,
    cities,
  } = useEmployees();
  
  // מצב טופס - מאתחלים עם נתוני המשתמש המחובר
  const [formData, setFormData] = useState({
    employeeId: currentUser?.employeeId || '',
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
  });

  // מצבי עריכה לכל שדה
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  
  // מצבי טופס
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  
  // קבצים ותמונות
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // עדכון הנתונים כשהמשתמש המחובר משתנה
  useEffect(() => {
    if (currentUser) {
      setFormData({
        employeeId: currentUser.employeeId || '',
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
      });
    }
  }, [currentUser]);

  // התחלת עריכה של שדה
  const startEditingField = (fieldName) => {
    setEditingField(fieldName);
    setTempValue(formData[fieldName] || '');
  };

  // ביטול עריכת שדה
  const cancelEditingField = () => {
    setEditingField(null);
    setTempValue('');
    setErrors({});
  };

  // שמירת שדה בודד
  const saveField = async (fieldName) => {
    // ולידציה
    if (!validateField(fieldName, tempValue)) {
      return;
    }

    try {
      setSubmitting(true);
      
      const updateData = {
        employeeId: formData.employeeId,
        [fieldName]: tempValue
      };

      // הוספת כל השדות הנדרשים לעדכון
      const fullUpdateData = {
        ...formData,
        ...updateData
      };

      const result = await updateEmployee(fullUpdateData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // עדכון המצב המקומי
      setFormData(prev => ({ ...prev, [fieldName]: tempValue }));
      setEditingField(null);
      setTempValue('');

      Swal.fire({
        icon: 'success',
        title: 'השדה עודכן בהצלחה',
        timer: 1500,
        showConfirmButton: false
      });

      if (onUpdateSuccess) {
        onUpdateSuccess(result.data);
      }

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'שגיאה בעדכון',
        text: err.message || 'אנא נסה שוב',
        confirmButtonText: 'אישור'
      });
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
      
      // העלאה מיידית
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
        await updateEmployee({
          ...formData,
          photo: uploadResult.docPath
        });
        
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

  // פונקציות ולידציה
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
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    return !error;
  };

  // שינוי סיסמה
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // ולידציה
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
    
    if (!isValid) {
      return;
    }

    try {
      setSubmitting(true);
      
      const updateData = {
        ...formData,
        password: formData.newPassword
      };
      
      const result = await updateEmployee(updateData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      Swal.fire({
        title: 'הסיסמה שונתה בהצלחה!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      setChangePasswordMode(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (err) {
      Swal.fire({
        title: 'שגיאה בשינוי הסיסמה',
        text: err.message || 'אנא בדוק את הנתונים ונסה שוב',
        icon: 'error',
        confirmButtonText: 'אישור'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // פונקציה לעיצוב תאריך
  const formatDate = (date) => {
    if (!date) return 'לא הוזן';
    try {
      return format(new Date(date), 'dd/MM/yyyy');
    } catch {
      return 'לא הוזן';
    }
  };

  // רכיב שדה עם אפשרות עריכה
  const EditableField = ({ label, fieldName, value, icon, type = 'text' }) => {
    const isEditing = editingField === fieldName;
    
    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {icon}
          <Typography variant="subtitle2" color="text.secondary">
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
            >
              {submitting ? <CircularProgress size={20} /> : <Check />}
            </IconButton>
            
            <IconButton 
              color="error" 
              onClick={cancelEditingField}
              disabled={submitting}
              size="small"
            >
              <Close />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body1">
              {fieldName === 'birthDate' ? formatDate(value) : (value || 'לא הוזן')}
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => startEditingField(fieldName)}
              sx={{ ml: 1 }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    );
  };

  if (!currentUser) {
    return (
      <Container maxWidth="md" dir="rtl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>טוען פרטי משתמש...</Typography>
      </Container>
    );
  }

  return (
    <ThemeProvider theme={rtlTheme}>
      <Container maxWidth="md" dir="rtl" sx={{ py: 4 }}>
        {/* כרטיס פרופיל עליון */}
        <Paper
          elevation={3}
          sx={{ 
            padding: 3, 
            marginBottom: 3,
            background: 'linear-gradient(135deg, #4cb5c3 0%, #3a8a95 100%)',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              sx={{ 
                width: 120, 
                height: 120, 
                margin: '0 auto 16px',
                border: '4px solid white',
                fontSize: '3rem'
              }}
              src={formData.photo ? `${baseUrl}/api/Documents/content-by-path?path=${encodeURIComponent(formData.photo)}` : undefined}
            >
              {!formData.photo && (formData.firstName?.[0] || '') + (formData.lastName?.[0] || '')}
            </Avatar>
            
            <IconButton
              component="label"
              sx={{
                position: 'absolute',
                bottom: 16,
                right: -10,
                backgroundColor: 'white',
                '&:hover': { backgroundColor: '#f0f0f0' },
                boxShadow: 2
              }}
              size="small"
              disabled={uploadingFiles}
            >
              {uploadingFiles ? <CircularProgress size={20} /> : <Edit fontSize="small" />}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleProfilePhotoChange}
              />
            </IconButton>
          </Box>
          
          <Typography variant="h4" gutterBottom>
            {formData.firstName} {formData.lastName}
          </Typography>
          
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            עובד/ת מספר: {formData.employeeId}
          </Typography>
        </Paper>

        {/* פרטים אישיים */}
        <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#333", mb: 3 }}
          >
            פרטים אישיים
          </Typography>
          
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

        {/* שינוי סיסמה */}
        <Paper elevation={3} sx={{ padding: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#333" }}
            >
              אבטחה
            </Typography>
            <Lock fontSize="small" color="action" />
          </Box>
          
          {!changePasswordMode ? (
            <Button
              variant="outlined"
              onClick={() => setChangePasswordMode(true)}
              fullWidth
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
                    >
                      ביטול
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={submitting}
                    >
                      {submitting ? <CircularProgress size={24} /> : 'שמור סיסמה'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default EmployeeProfile;