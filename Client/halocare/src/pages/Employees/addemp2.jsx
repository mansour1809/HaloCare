// import { useState, useEffect } from 'react';
// import { 
//   TextField, 
//   Button, 
//   Container, 
//   Grid, 
//   Typography, 
//   Paper, 
//   Select, 
//   MenuItem, 
//   InputLabel, 
//   FormControl,
//   Box,
//   Snackbar,
//   Alert,
//   IconButton,
//   InputAdornment,
//   CircularProgress,
//   Switch,
//   FormControlLabel,
//   Checkbox
// } from '@mui/material';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { he } from 'date-fns/locale';
// import { createTheme, ThemeProvider } from '@mui/material/styles';
// import { ContentCopy, Visibility, VisibilityOff } from '@mui/icons-material';
// import axios from 'axios';

// // יצירת תמה מותאמת עם תמיכה בעברית
// const theme = createTheme({
//   direction: 'rtl',
//   typography: {
//     fontFamily: 'Rubik, Arial, sans-serif',
//   },
//   palette: {
//     primary: {
//       main: '#4cb5c3',
//     },
//   },
// });

// // פונקציה לייצור סיסמה אקראית
// const generateRandomPassword = (length = 8) => {
//   const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   let password = '';
  
//   const randomValues = new Uint32Array(length);
//   window.crypto.getRandomValues(randomValues);
  
//   for (let i = 0; i < length; i++) {
//     password += charset[randomValues[i] % charset.length];
//   }
  
//   return password;
// };

// const API_URL = 'http://localhost:7225/api'; // עדכון לפורט 7225

// const NewEmployeeForm = () => {
//   // מצבים לטעינת נתונים מהשרת
//   const [formDefinition, setFormDefinition] = useState(null);
//   const [formQuestions, setFormQuestions] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
  
//   // מצבים לניהול סיסמה ומייל
//   const [generatedPassword, setGeneratedPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [passwordCopied, setPasswordCopied] = useState(false);
//   const [sendEmail, setSendEmail] = useState(true);
//   const [emailSent, setEmailSent] = useState(false);

//   // מצב הטופס - יתעדכן דינמית לפי השדות שמגיעים מהשרת
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     birthDate: null,
//     mobilePhone: '',
//     email: '',
//     password: '',
//     licenseNum: '',
//     startDate: null,
//     isActive: true,
//     classId: '',
//     roleName: '',
//   });

//   // טעינת נתונים מהשרת
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
        
//         // טעינת השאלות מהשרת לפי הנתיב הנכון
//         const questionsResponse = await axios.get(`${API_URL}/Forms/1/questions`);
//         console.log('נתוני שאלות:', questionsResponse.data);
        
//         // טעינת רשימת כיתות
//         const classesResponse = await axios.get(`${API_URL}/Classes`);
//         console.log('נתוני כיתות:', classesResponse.data);
        
//         // טעינת רשימת תפקידים
//         const rolesResponse = await axios.get(`${API_URL}/Roles`);
//         console.log('נתוני תפקידים:', rolesResponse.data);
        
//         // עדכון המצבים
//         setFormQuestions(questionsResponse.data || []);
//         setClasses(classesResponse.data || []);
//         setRoles(rolesResponse.data || []);
        
//         // יצירת מצב התחלתי לטופס בהתאם לשאלות שהגיעו
//         const initialData = {...formData};
        
//         // עדכון הערכים ההתחלתיים לפי השאלות
//         if (questionsResponse.data && Array.isArray(questionsResponse.data)) {
//           questionsResponse.data.forEach(question => {
//             if (question.type === 'date') {
//               initialData[question.name] = null;
//             } else if (question.type === 'boolean') {
//               initialData[question.name] = question.defaultValue || false;
//             } else {
//               initialData[question.name] = question.defaultValue || '';
//             }
//           });
//         }
        
//         setFormData(initialData);
//         setLoading(false);
//       } catch (err) {
//         console.error('שגיאה בטעינת נתונים:', err);
//         setError('שגיאה בטעינת נתוני הטופס. אנא נסה שוב מאוחר יותר.');
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // פונקציה לייצור סיסמה
//   const handleGeneratePassword = () => {
//     const newPassword = generateRandomPassword(10);
//     setGeneratedPassword(newPassword);
//     setFormData(prevData => ({
//       ...prevData,
//       password: newPassword
//     }));
//     setPasswordCopied(false);
//   };

//   // פונקציה להעתקת הסיסמה ללוח
//   const handleCopyPassword = () => {
//     navigator.clipboard.writeText(generatedPassword);
//     setPasswordCopied(true);
//     setTimeout(() => setPasswordCopied(false), 3000);
//   };

//   // טיפול בשינויים בשדות הטופס
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prevData => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   // טיפול בשינויי מתג ותיבות סימון
//   const handleSwitchChange = (e) => {
//     const { name, checked } = e.target;
//     setFormData(prevData => ({
//       ...prevData,
//       [name]: checked,
//     }));
//   };

//   // טיפול בשינוי תאריכים
//   const handleDateChange = (name, date) => {
//     setFormData(prevData => ({
//       ...prevData,
//       [name]: date,
//     }));
//   };

//   // פונקציה לשליחת מייל
//   const sendWelcomeEmail = async (email, password) => {
//     try {
//       // קריאה לשרת לשליחת מייל
//       const response = await axios.post(`${API_URL}/Employees/sendWelcomeEmail`, {
//         email,
//         password,
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         loginUrl: window.location.origin + '/login' // לינק דינמי למערכת
//       });
      
//       if (response.data.success) {
//         setEmailSent(true);
//         setTimeout(() => setEmailSent(false), 5000);
//         return true;
//       }
//       return false;
//     } catch (err) {
//       console.error('שגיאה בשליחת המייל:', err);
//       return false;
//     }
//   };

//   // שליחת הטופס
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // בדיקת שדות חובה
//     const isMandatoryFields = formQuestions.filter(question => question.isMandatory);
//     const missingFields = isMandatoryFields.filter(field => !formData[field.name]);
    
//     if (missingFields.length > 0) {
//       setError(`יש למלא את כל שדות החובה: ${missingFields.map(field => field.label || field.name).join(', ')}`);
//       return;
//     }
    
//     // וידוא שיש סיסמה אם לא יצרנו
//     if (!formData.password) {
//       const autoPassword = generateRandomPassword(10);
//       setFormData(prevData => ({
//         ...prevData,
//         password: autoPassword
//       }));
//       setGeneratedPassword(autoPassword);
//     }
    
//     try {
//       setLoading(true);
      
//       // שליחת נתוני העובד לשרת
//       const response = await axios.post(`${API_URL}/Employees`, formData);
      
//       console.log('תגובת השרת:', response.data);
      
//       // שליחת מייל אם האפשרות מסומנת
//       if (sendEmail && formData.email) {
//         await sendWelcomeEmail(formData.email, formData.password);
//       }
      
//       // הצגת הודעת הצלחה
//       setError("");
//       alert("העובד נוסף בהצלחה!");
      
//       // איפוס הטופס
//       const resetData = {...formData};
      
//       // איפוס הערכים
//       Object.keys(resetData).forEach(key => {
//         if (key === 'isActive') {
//           resetData[key] = true;
//         } else if (typeof resetData[key] === 'boolean') {
//           resetData[key] = false;
//         } else if (key === 'birthDate' || key === 'startDate') {
//           resetData[key] = null;
//         } else {
//           resetData[key] = '';
//         }
//       });
      
//       setFormData(resetData);
//       setGeneratedPassword("");
      
//     } catch (err) {
//       console.error('שגיאה בשליחת הטופס:', err);
//       setError(err.response?.data?.message || 'שגיאה בשליחת הטופס. אנא בדוק את הנתונים ונסה שוב.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // רנדור שאלה דינמית לפי הסוג שלה
//   const renderQuestion = (question) => {
//     if (!question || !question.name) return null;
        
//     const { questionText, title, type, isMandatory, options } = question;


//     switch (type) {
//       case 'text':
//       case 'email':
//       case 'password':
//       case 'tel':
//       case 'number':
//         return (
//           <TextField
//             fullWidth
//             label={`${title || questionText}${isMandatory ? ' *' : ''}`}
//             name={questionText}
//             type={type}
//             value={formData[name] || ''}
//             onChange={handleChange}
//             variant="outlined"
//             isMandatory={isMandatory}
//             sx={{ marginBottom: 2 }}
//           />
//         );
      
//       case 'select':
//         return (
//           <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
//             <InputLabel>{`${title || questionText}${isMandatory ? ' *' : ''}`}</InputLabel>
//             <Select
//               name={questionText}
//               value={formData[name] || ''}
//               onChange={handleChange}
//               label={`${title || questionText}${isMandatory ? ' *' : ''}`}
//               isMandatory={isMandatory}
//             >
//               {options?.map((option) => (
//                 <MenuItem key={option.value} value={option.value}>
//                   {option.label}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         );
      
//       case 'date':
//         return (
//           <DatePicker
//             label={`${title || questionText}${isMandatory ? ' *' : ''}`}
//             value={formData[name] || null}
//             onChange={(date) => handleDateChange(name, date)}
//             slotProps={{ 
//               textField: { 
//                 fullWidth: true, 
//                 variant: "outlined",
//                 isMandatory: isMandatory
//               } 
//             }}
//           />
//         );
      
//       case 'boolean':
//         return (
//           <FormControlLabel
//             control={
//               <Switch
//                 name={questionText}
//                 checked={Boolean(formData[name])}
//                 onChange={handleSwitchChange}
//                 color="primary"
//               />
//             }
//             label={title || questionText}
//           />
//         );
      
//       case 'checkbox':
//         return (
//           <FormControlLabel
//             control={
//               <Checkbox
//                 name={questionText}
//                 checked={Boolean(formData[name])}
//                 onChange={handleSwitchChange}
//                 color="primary"
//               />
//             }
//             label={title || questionText}
//           />
//         );
      
//       case 'textarea':
//         return (
//           <TextField
//             fullWidth
//             multiline
//             rows={4}
//             label={`${title || questionText}${isMandatory ? ' *' : ''}`}
//             name={questionText}
//             value={formData[name] || ''}
//             onChange={handleChange}
//             variant="outlined"
//             isMandatory={isMandatory}
//             sx={{ marginBottom: 2 }}
//           />
//         );
      
//       default:
//         return (
//           <TextField
//             fullWidth
//             label={`${title || questionText}${isMandatory ? ' *' : ''}`}
//             name={questionText}
//             value={formData[name] || ''}
//             onChange={handleChange}
//             variant="outlined"
//             isMandatory={isMandatory}
//             sx={{ marginBottom: 2 }}
//           />
//         );
//     }
//   };

//   if (loading && !formQuestions.length) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   // קבצי שאלות לפי קטגוריות
//   const personalQuestions = formQuestions.filter(q => q.section === "personal");
//   const employmentQuestions = formQuestions.filter(q => q.section === "employment");
//   const otherQuestions = formQuestions.filter(q => !q.section || (q.section !== "personal" && q.section !== "employment"));

//   return (
//     <ThemeProvider theme={theme}>
//       <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
//         <Container maxWidth="md" dir="rtl">
//           <Paper elevation={3} sx={{ padding: 3, marginTop: 4, marginBottom: 4 }}>
//             <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
//               קליטת עובד חדש
//             </Typography>
            
//             {error && (
//               <Alert severity="error" sx={{ marginBottom: 2 }}>
//                 {error}
//               </Alert>
//             )}
            
//             <form onSubmit={handleSubmit}>
//               {/* פרטים אישיים */}
//               <Box sx={{ marginBottom: 3 }}>
//                 <Typography variant="subtitle1" sx={{ color: '#4cb5c3', fontWeight: 'bold', marginBottom: 2 }}>
//                   פרטים אישיים
//                 </Typography>
                
//                 <Grid container spacing={2}>
//                   {personalQuestions.map((question) => (
//                     <Grid 
//                       item 
//                       xs={12} 
//                       md={question.fullWidth ? 12 : 6} 
//                       key={question.questionText}
//                     >
//                       {renderQuestion(question)}
//                     </Grid>
//                   ))}
//                 </Grid>
//               </Box>
              
//               {/* פרטי העסקה */}
//               <Box sx={{ marginBottom: 3 }}>
//                 <Typography variant="subtitle1" sx={{ color: '#4cb5c3', fontWeight: 'bold', marginBottom: 2 }}>
//                   פרטי העסקה
//                 </Typography>
                
//                 <Grid container spacing={2}>
//                   {employmentQuestions.map((question) => (
//                     <Grid 
//                       item 
//                       xs={12} 
//                       md={question.fullWidth ? 12 : 6} 
//                       key={question.questionText}
//                     >
//                       {renderQuestion(question)}
//                     </Grid>
//                   ))}
                  
//                   <Grid item xs={12} md={6}>
//                     <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
//                       <InputLabel>תפקיד *</InputLabel>
//                       <Select
//                         name="roleName"
//                         value={formData.roleName || ''}
//                         onChange={handleChange}
//                         label="תפקיד *"
//                         isMandatory
//                       >
//                         {roles.map((role) => (
//                           <MenuItem key={role.id || role.rolequestionText} value={role.rolequestionText}>
//                             {role.rolequestionText}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Grid>
                  
//                   <Grid item xs={12} md={6}>
//                     <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
//                       <InputLabel>שיוך לכיתה</InputLabel>
//                       <Select
//                         name="classId"
//                         value={formData.classId || ''}
//                         onChange={handleChange}
//                         label="שיוך לכיתה"
//                       >
//                         <MenuItem value="">ללא שיוך</MenuItem>
//                         {classes.map((cls) => (
//                           <MenuItem key={cls.classId} value={cls.classId}>
//                             {cls.classquestionText}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Grid>
                  
//                   <Grid item xs={12} md={6}>
//                     <FormControlLabel
//                       control={
//                         <Switch
//                           name="isActive"
//                           checked={Boolean(formData.isActive)}
//                           onChange={handleSwitchChange}
//                           color="primary"
//                         />
//                       }
//                       label="עובד פעיל"
//                     />
//                   </Grid>
//                 </Grid>
//               </Box>
              
//               {/* שאלות נוספות */}
//               {otherQuestions.length > 0 && (
//                 <Box sx={{ marginBottom: 3 }}>
//                   <Typography variant="subtitle1" sx={{ color: '#4cb5c3', fontWeight: 'bold', marginBottom: 2 }}>
//                     פרטים נוספים
//                   </Typography>
                  
//                   <Grid container spacing={2}>
//                     {otherQuestions.map((question) => (
//                       <Grid 
//                         item 
//                         xs={12} 
//                         md={question.fullWidth ? 12 : 6} 
//                         key={question.questionText}
//                       >
//                         {renderQuestion(question)}
//                       </Grid>
//                     ))}
//                   </Grid>
//                 </Box>
//               )}
              
//               {/* שדה סיסמה עם ייצור אוטומטי - תמיד מוצג */}
//               <Box sx={{ marginBottom: 3 }}>
//                 <Typography variant="subtitle1" sx={{ color: '#4cb5c3', fontWeight: 'bold', marginBottom: 2 }}>
//                   פרטי כניסה למערכת
//                 </Typography>
                
//                 <Grid container spacing={2}>
//                   <Grid item xs={12}>
//                     <Box sx={{ marginBottom: 2 }}>
//                       <TextField
//                         fullWidth
//                         label="סיסמה ראשונית"
//                         name="password"
//                         type={showPassword ? 'text' : 'password'}
//                         value={formData.password || ''}
//                         onChange={handleChange}
//                         variant="outlined"
//                         InputProps={{
//                           endAdornment: (
//                             <InputAdornment position="end">
//                               <IconButton
//                                 onClick={() => setShowPassword(!showPassword)}
//                                 edge="end"
//                               >
//                                 {showPassword ? <VisibilityOff /> : <Visibility />}
//                               </IconButton>
//                               <IconButton
//                                 onClick={handleCopyPassword}
//                                 disabled={!generatedPassword}
//                                 edge="end"
//                               >
//                                 <ContentCopy />
//                               </IconButton>
//                             </InputAdornment>
//                           ),
//                         }}
//                       />
//                       <Button 
//                         onClick={handleGeneratePassword}
//                         variant="outlined" 
//                         sx={{ mt: 1 }}
//                       >
//                         ייצר סיסמה אקראית
//                       </Button>
//                     </Box>
//                   </Grid>
                  
//                   <Grid item xs={12}>
//                     <FormControlLabel
//                       control={<Switch checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />}
//                       label="שלח אימייל לעובד עם פרטי הכניסה"
//                     />
//                     <Typography variant="caption" color="text.secondary">
//                       אימייל יישלח לעובד עם הסיסמה הראשונית ולינק לכניסה למערכת
//                     </Typography>
//                   </Grid>
//                 </Grid>
//               </Box>
              
//               <Box sx={{ display: 'flex', justifyContent: 'center' }}>
//                 <Button 
//                   type="submit" 
//                   variant="contained" 
//                   color="primary" 
//                   sx={{ 
//                     paddingX: 4, 
//                     paddingY: 1,
//                     fontSize: '1rem',
//                     borderRadius: 2
//                   }}
//                   disabled={loading}
//                 >
//                   {loading ? 'שומר...' : 'שמירה'}
//                 </Button>
//               </Box>
//             </form>
//           </Paper>
//         </Container>
//       </LocalizationProvider>
      
//       <Snackbar
//         open={passwordCopied}
//         autoHideDuration={3000}
//         onClose={() => setPasswordCopied(false)}
//         message="הסיסמה הועתקה ללוח"
//       />
      
//       <Snackbar
//         open={emailSent}
//         autoHideDuration={5000}
//         onClose={() => setEmailSent(false)}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//       >
//         <Alert severity="success" sx={{ width: '100%' }}>
//           מייל נשלח בהצלחה לכתובת {formData.email}
//         </Alert>
//       </Snackbar>
//     </ThemeProvider>
//   );
// };

// export default NewEmployeeForm;