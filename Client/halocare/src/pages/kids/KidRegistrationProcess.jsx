// // src/pages/kids/KidRegistrationProcess.jsx - עדכונים נדרשים
// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate, useParams } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { 
//   Box, Paper, Button, Typography, Container, 
//   Slide, Fade, Stepper, Step, StepLabel, StepContent,
//   Breadcrumbs, CircularProgress, Divider, Alert
// } from '@mui/material';
// import { styled } from '@mui/material/styles';
// import { 
//   ChevronLeft as ArrowBackIcon,
//   Check as CheckCircleIcon,
//   Send as SendIcon,
//   Home as HomeIcon,
//   Person as PersonIcon,
//   ArrowForward as ArrowForwardIcon
// } from '@mui/icons-material';
// import GroupIcon from '@mui/icons-material/Group';
// import { sendFormToParent } from '../../Redux/features/formsSlice';
// import { fetchKidById } from '../../Redux/features/kidsSlice';
// // import { fetchKidIntakeProcess, startIntakeProcess } from '../../Redux/features/intakeProcessSlice';
// import PersonalInfoForm from './PersonalInfoForm';
// import DynamicFormRenderer from './DynamicFormRenderer';
// import ProgressLogo from './ProgressLogo';
// // import IntakeStatusBadge from '../../components/kids/IntakeStatusBadge';
// import { intakeProcessService } from '../../services/intakeProcessService';
// import { toast } from 'react-toastify';
// import Swal from 'sweetalert2';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// // סטיילינג מותאם אישית
// const FormContainer = styled(Paper)(({ theme }) => ({
//   padding: theme.spacing(4),
//   paddingTop: theme.spacing(5),
//   direction: 'rtl',
//   marginTop: 0,
//   marginBottom: theme.spacing(3),
//   boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
//   borderRadius: theme.spacing(2),
//   maxWidth: '100%',
//   margin: '0 auto',
//   position: 'relative',
//   overflow: 'hidden',
//   '&::before': {
//     content: '""',
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     width: '100%',
//     height: '4px',
//     background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
//   }
// }));

// const KidRegistrationProcess = () => {
//   const { kidId } = useParams();
//   const isEditMode = Boolean(kidId);
  
//   const [activeStep, setActiveStep] = useState(0);
//   const [completedSteps, setCompletedSteps] = useState({});
//   const [formData, setFormData] = useState({
//     personalInfo: {},
//     developmentalInfo: {},
//     healthInfo: {},
//     nutritionInfo: {},
//     approvals: {},
//     homeVisit: {}
//   });
//   const [isFormSaved, setIsFormSaved] = useState(isEditMode);
//   const [isLoading, setIsLoading] = useState(isEditMode);
  
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   const { status: sendStatus } = useSelector(state => state.forms);
//   const { selectedKid, status: kidStatus } = useSelector(state => state.kids);
//   const { selectedProcess } = useSelector(state => state.intakeProcess);
  
//   // טעינת נתוני ילד קיים במצב עריכה
//  useEffect(() => {
//     if (isEditMode && kidId) {
//       setIsLoading(true);
      
//       // טעינת נתוני הילד עם פרטי הורים
//       dispatch(fetchKidById(kidId))
//         .unwrap()
//         .then(kidData => {
//           // הנתונים כבר מגיעים עם פרטי ההורים מהSP המעודכן
//           setFormData(prev => ({
//             ...prev,
//             personalInfo: {
//               ...kidData,
//               // נוודא שיש לנו את פרטי ההורים
//               parentName1: kidData.parentName1 || '',
//               parentPhone1: kidData.parentPhone1 || '',
//               parentEmail1: kidData.parentEmail1 || '',
//               parentName2: kidData.parentName2 || '',
//               parentPhone2: kidData.parentPhone2 || '',
//               parentEmail2: kidData.parentEmail2 || '',
//             }
//           }));
          
//           setIsFormSaved(true);
//           setCompletedSteps(prev => ({...prev, 0: true}));
          
//           // טעינת תהליך הקליטה
//           // return dispatch(fetchKidIntakeProcess(kidId));
//           return
//         })
//         .then(processResult => {
//           if (processResult.payload) {
//             const completedForms = JSON.parse(processResult.payload.completedForms || '[]');
//             const newCompletedSteps = { 0: true }; // שלב ראשון תמיד מושלם
            
//             completedForms.forEach(formId => {
//               const stepIndex = getStepIndexByFormId(formId);
//               if (stepIndex > 0) {
//                 newCompletedSteps[stepIndex] = true;
//               }
//             });
            
//             setCompletedSteps(newCompletedSteps);
            
//             // קביעת השלב הנוכחי
//             const maxCompletedStep = Math.max(...Object.keys(newCompletedSteps).map(Number));
//             setActiveStep(Math.min(maxCompletedStep + 1, steps.length - 1));
//           }
//         })
//         .catch(error => {
//           Swal.fire({
//             icon: 'error',
//             title: 'שגיאה בטעינת נתוני הילד',
//             text: 'לא ניתן לטעון את נתוני הילד. אנא נסה שנית מאוחר יותר.'
//           });
//           console.error('Error loading kid data:', error);
//         })
//         .finally(() => {
//           setIsLoading(false);
//         });
//     }
//   }, [dispatch, kidId, isEditMode]);

//   // פונקציה למציאת אינדקס שלב לפי מזהה טופס
//   const getStepIndexByFormId = (formId) => {
//     const formToStepMap = {
//       1003: 1, // רקע התפתחותי
//       1004: 2, // מידע רפואי
//       1005: 3, // שאלון תזונתי
//       1006: 4, // אישורים
//       1007: 5  // ביקור בית
//     };
//     return formToStepMap[formId] || -1;
//   };
  
//   // רשימת השלבים
//   const steps = [
//     {
//       label: 'פרטים אישיים',
//       description: 'הזנת פרטי הילד וההורים',
//       formId: null,
//       component: <PersonalInfoForm 
//                   data={formData.personalInfo} 
//                   onUpdate={handlePersonalInfoUpdate} 
//                   isEditMode={isEditMode}
//                 />
//     },
//     {
//       label: 'רקע התפתחותי',
//       description: 'מידע על התפתחות הילד',
//       formId: 1003,
//       component: props => <DynamicFormRenderer 
//                   formId={1003}
//                   kidId={formData.personalInfo.id}
//                   onUpdate={(data) => handleFormUpdate('developmentalInfo', data)} 
//                 />
//     },
//     {
//       label: 'מידע רפואי',
//       description: 'פרטים על מצב בריאותי ותרופות',
//       formId: 1004,
//       component: props => <DynamicFormRenderer 
//                   formId={1004}
//                   kidId={formData.personalInfo.id}
//                   onUpdate={(data) => handleFormUpdate('healthInfo', data)} 
//                 />
//     },
//     {
//       label: 'שאלון תזונתי',
//       description: 'מידע על הרגלי אכילה ותזונה',
//       formId: 1005,
//       component: props => <DynamicFormRenderer 
//                   formId={1005}
//                   kidId={formData.personalInfo.id}
//                   onUpdate={(data) => handleFormUpdate('nutritionInfo', data)} 
//                 />
//     },
//     {
//       label: 'אישורים',
//       description: 'אישורים נדרשים מההורים',
//       formId: 1006,
//       component: props => <DynamicFormRenderer 
//                   formId={1006}
//                   kidId={formData.personalInfo.id}
//                   onUpdate={(data) => handleFormUpdate('approvals', data)} 
//                 />
//     },
//     {
//       label: 'ביקור בית',
//       description: 'תיעוד ביקור בית',
//       formId: 1007,
//       component: props => <DynamicFormRenderer 
//                   formId={1007}
//                   kidId={formData.personalInfo.id}
//                   onUpdate={(data) => handleFormUpdate('homeVisit', data)} 
//                 />
//     }
//   ];

//   // פונקציה מיוחדת לטיפול בעדכון נתוני הילד בשלב הראשון
//   function handlePersonalInfoUpdate(kidData) {
//     setFormData(prev => ({
//       ...prev,
//       personalInfo: kidData
//     }));
    
//     setCompletedSteps(prev => ({...prev, 0: true}));
//     setIsFormSaved(true);
    
//     // התחלת תהליך קליטה אם זה ילד חדש
//     if (!isEditMode) {
//       dispatch(startIntakeProcess(kidData.id))
//         .unwrap()
//         .then(() => {
//           Swal.fire({
//             icon: 'success',
//             title: 'תהליך קליטה התחיל בהצלחה',
//             text: `פרטי הילד ${kidData.firstName} ${kidData.lastName} נשמרו והתחיל תהליך הקליטה`,
//             timer: 2000,
//             showConfirmButton: false
//           });
//         })
//         .catch(error => {
//           console.error('Error starting intake process:', error);
//         });
//     } else {
//       // במצב עריכה - רק הודעת הצלחה
//       Swal.fire({
//         icon: 'success',
//         title: 'פרטי הילד עודכנו בהצלחה',
//         text: `פרטי הילד ${kidData.firstName} ${kidData.lastName} עודכנו במערכת`,
//         timer: 2000,
//         showConfirmButton: false
//       });
//     }
    
//     handleNext();
//   }
  
//   // עדכון נתוני הטפסים האחרים
//   const handleFormUpdate = async (formName, data) => {
//     setFormData(prev => ({
//       ...prev,
//       [formName]: data
//     }));
    
//     // סימון השלב הנוכחי כהושלם ועדכון בשרת
//     const currentFormId = steps[activeStep].formId;
//     if (currentFormId && formData.personalInfo.id) {
//       try {
//         await intakeProcessService.completeForm(formData.personalInfo.id, currentFormId);
//         setCompletedSteps(prev => ({...prev, [activeStep]: true}));
        
//         // רענון תהליך הקליטה
//         // dispatch(fetchKidIntakeProcess(formData.personalInfo.id));
        
//       } catch (error) {
//         console.error('Error completing form step:', error);
//       }
//     }
//   };
  
//   // מעבר לשלב הבא
//   const handleNext = () => {
//     setActiveStep((prevActiveStep) => {
//       const nextStep = prevActiveStep + 1;
//       if (nextStep === steps.length) {
//         Swal.fire({
//           icon: 'success',
//           title: 'תהליך קליטת הילד הושלם בהצלחה!',
//           text: 'כל השלבים הושלמו. כעת ניתן לצפות בפרופיל הילד המלא.',
//           confirmButtonText: 'מעבר לפרופיל הילד',
//         }).then((result) => {
//           if (result.isConfirmed) {
//             navigate(`/kids/${formData.personalInfo.id}`);
//           }
//         });
//       }
//       return nextStep;
//     });
//   };
  
//   // חזרה לשלב הקודם
//   const handleBack = () => {
//     setActiveStep((prevActiveStep) => prevActiveStep - 1);
//   };
  
//   // מעבר לשלב ספציפי
//   const handleStepClick = (stepIndex) => {
//     if (stepIndex > 0 && !isFormSaved) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'לא ניתן להמשיך',
//         text: 'יש למלא ולשמור קודם את פרטי הילד הבסיסיים',
//       });
//       return;
//     }
    
//     if (stepIndex <= activeStep + 1 || completedSteps[stepIndex - 1]) {
//       setActiveStep(stepIndex);
//     } else {
//       toast.info('יש להשלים את השלבים בסדר הנכון');
//     }
//   };
  
//   // שליחת טופס למילוי ע"י הורה
//   const handleSendToParent = async (formId) => {
//     if (!formData.personalInfo.id) {
//       Swal.fire({
//         icon: 'error',
//         title: 'לא ניתן לשלוח טופס',
//         text: 'יש לשמור תחילה את פרטי הילד',
//       });
//       return;
//     }
    
//     try {
//       Swal.fire({
//         title: 'שולח טופס...',
//         text: 'אנא המתן בזמן שליחת הטופס להורה',
//         allowOutsideClick: false,
//         didOpen: () => {
//           Swal.showLoading();
//         }
//       });
      
//       await Promise.all([
//         dispatch(sendFormToParent({ 
//           kidId: formData.personalInfo.id, 
//           formId 
//         })).unwrap(),
//         intakeProcessService.sendToParents(formData.personalInfo.id, formId)
//       ]);
      
//       Swal.fire({
//         icon: 'success',
//         title: 'הטופס נשלח בהצלחה',
//         text: `הטופס נשלח בהצלחה להורה של ${formData.personalInfo.firstName}`,
//         timer: 2000,
//       });
      
//       // רענון תהליך הקליטה
//       // dispatch(fetchKidIntakeProcess(formData.personalInfo.id));
      
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'שגיאה בשליחת הטופס',
//         text: error.message || 'אירעה שגיאה בלתי צפויה, אנא נסה שנית',
//       });
//       console.error(error);
//     }
//   };
  
//   // סיום התהליך ומעבר לפרופיל הילד
//   const handleFinish = () => {
//     Swal.fire({
//       icon: 'success',
//       title: 'תהליך קליטת הילד הושלם בהצלחה!',
//       text: 'כל השלבים הושלמו. כעת ניתן לצפות בפרופיל הילד המלא.',
//       confirmButtonText: 'מעבר לפרופיל הילד',
//     }).then((result) => {
//       if (result.isConfirmed) {
//         navigate(`/kids/${formData.personalInfo.id}`);
//       }
//     });
//   };
  
//   // שם הילד לתצוגה בלוגו
//   const kidName = formData.personalInfo.firstName 
//     ? `${formData.personalInfo.firstName} ${formData.personalInfo.lastName || ''}`
//     : null;
  
//   // מצב טעינה
//   if (isLoading) {
//     return (
//       <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
//         <CircularProgress size={60} />
//         <Typography variant="h6" sx={{ mt: 2 }}>
//           טוען נתוני ילד...
//         </Typography>
//       </Container>
//     );
//   }
  
//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container maxWidth="lg" sx={{ py: 4}}>
//         <Box sx={{ display: 'flex', direction: 'rtl'}}>
//           <Breadcrumbs sx={{ mb: 2 }}>
//             <Link
//               underline="hover"
//               sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
//               color="inherit"
//               onClick={() => navigate('/')}
//             >
//               <HomeIcon sx={{ mr: 0.5, fontSize: 'small' }} />
//               ראשי
//             </Link>
//             <Link
//               underline="hover"
//               sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
//               color="inherit"
//               onClick={() => navigate('/kids/list')}
//             >
//               <GroupIcon sx={{ mr: 0.5, fontSize: 'medium' }} />
//               רשימת ילדים
//             </Link>
//             <Typography color="text.primary" sx={{ fontWeight: 'medium' }}>
//               {isEditMode ? `עריכת פרטי ${kidName || 'ילד'}` : 'קליטת ילד חדש'}
//             </Typography>
//           </Breadcrumbs>
//         </Box>
      
       
        
//         {/* לוגו התקדמות */}
//         <ProgressLogo 
//           activeStep={activeStep} 
//           totalSteps={steps.length}
//           kidName={kidName}
//           onStepClick={handleStepClick}
//           formIds={steps.map(step => step.formId)}
//           completedSteps={completedSteps}
//         />
        
//         {/* טופס נוכחי */}
//         <Fade in={true} timeout={500}>
//           <FormContainer>
//             <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.dark' }}>
//               {steps[activeStep].label}
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
//               {steps[activeStep].description}
//             </Typography>
            
//             {steps[activeStep].component}
            
//             {/* כפתורי פעולה */}
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
//               <Button
//                 disabled={activeStep === 0}
//                 onClick={handleBack}
//                 variant="outlined"
//                 startIcon={<ArrowForwardIcon />}
//               >
//                 חזרה
//               </Button>
//               <Box>
//                 {/* כפתור שליחה להורה - מופיע רק בשלבים מסוימים */}
//                 {[1, 2, 3, 4].includes(activeStep) && isFormSaved && (
//                   <Button 
//                     onClick={() => handleSendToParent(steps[activeStep].formId)}
//                     variant="contained" 
//                     color="info" 
//                     sx={{ mr: 1 }}
//                     startIcon={<SendIcon />}
//                     disabled={sendStatus === 'loading'}
//                   >
//                     שלח להורה
//                   </Button>
//                 )}
                
//                 {activeStep === steps.length - 1 ? (
//                   <Button
//                     variant="contained"
//                     color="success"
//                     onClick={handleFinish}
//                     startIcon={<CheckCircleIcon />}
//                   >
//                     סיים תהליך
//                   </Button>
//                 ) : (
//                   <Button
//                     variant="contained"
//                     onClick={handleNext}
//                     endIcon={<ArrowBackIcon />}
//                     disabled={activeStep === 0 && !isFormSaved}
//                   >
//                     הבא
//                   </Button>
//                 )}
//               </Box>
//             </Box>
//           </FormContainer>
//         </Fade>
        
//         {/* הודעת סיום */}
//         {activeStep === steps.length && (
//           <Slide direction="up" in={true} mountOnEnter unmountOnExit>
//             <Paper sx={{ p: 3, borderRadius: 2, backgroundColor: 'success.light', maxWidth: 600, mx: 'auto', mt: 4 }}>
//               <Typography variant="h6" gutterBottom>
//                 כל השלבים הושלמו בהצלחה!
//               </Typography>
//               <Typography paragraph>
//                 הילד נקלט במערכת. ניתן לצפות בפרטיו בדף תיק הילד.
//               </Typography>
//               <Button 
//                 onClick={() => navigate(`/kids/${formData.personalInfo.id}`)} 
//                 variant="contained"
//                 startIcon={<CheckCircleIcon />}
//              >
//                מעבר לתיק הילד
//              </Button>
//            </Paper>
//          </Slide>
//        )}
//      </Container>
//    </LocalizationProvider>
//  );
// };

// export default KidRegistrationProcess;