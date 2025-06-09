// // src/pages/kids/KidOnboarding.jsx - גרסה מעודכנת עם Dashboard
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   Container, Box, Paper, Typography, CircularProgress, Breadcrumbs,
//   Button, Alert, AlertTitle, Fade, Dialog, DialogTitle, DialogContent,
//   DialogActions
// } from '@mui/material';
// import {
//   Home as HomeIcon,
//   Group as GroupIcon,
//   ArrowBack as BackIcon,
//   Refresh as RefreshIcon
// } from '@mui/icons-material';

// import { 
//   fetchOnboardingStatus, 
//   fetchAvailableForms, 
//   clearOnboardingData,
//   setCurrentProcess
// } from '../../Redux/features/onboardingSlice';
// import { 
//   fetchKidById, 
//   clearSelectedKid
// } from '../../Redux/features/kidsSlice';
// import PersonalInfoForm from './PersonalInfoForm';
// import DynamicFormRenderer from './DynamicFormRenderer';
// import OnboardingDashboard from './OnboardingDashboard';
// import ProgressLogo from './ProgressLogo';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// const KidOnboarding = () => {
//   const { kidId } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   const { currentProcess, status, error } = useSelector(state => state.onboarding);
//   const { selectedKid } = useSelector(state => state.kids);
  
//   const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'form'
//   const [selectedForm, setSelectedForm] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const isNewKid = kidId === undefined ;

//   // טעינה ראשונית
//   useEffect(() => {
//     initializeOnboarding();
//   }, [kidId]);

//   const initializeOnboarding = async () => {
//     try {
//       setLoading(true);
//       dispatch(clearOnboardingData());
//       dispatch(clearSelectedKid());
      
//       if (!isNewKid) {
//         // טעינת נתוני ילד קיים
//         await dispatch(fetchKidById(kidId));
        
//         // טעינת סטטוס התהליך
//         try {
//           const statusResult = await dispatch(fetchOnboardingStatus(kidId)).unwrap();
//           dispatch(setCurrentProcess(kidId));
//           setViewMode('dashboard');
//         } catch (error) {
//           console.log('No onboarding process found, showing form creation');
//           // אין תהליך קליטה - מציגים הודעה
//         }
//       } else {
//         // ילד חדש - הצגת טופס פרטים אישיים
//         setViewMode('personalInfo');
//       }
      
//     } catch (error) {
//       console.error('Error initializing onboarding:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // רענון נתונים
//   const handleRefresh = async () => {
//     if (isNewKid) return;
    
//     setRefreshing(true);
//     try {
//       await dispatch(fetchOnboardingStatus(kidId)).unwrap();
//       dispatch(setCurrentProcess(kidId));
//     } catch (error) {
//       console.error('Error refreshing data:', error);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   // קליטת ילד חדש הושלמה
//   const handleKidCreated = (newKid) => {
//     navigate(`/kids/onboarding/${newKid.id}`, { replace: true });
//     // הטעינה החדשה תתרחש ב-useEffect
//   };

//   // בחירת טופס לעריכה
//   const handleFormSelect = (form) => {
//     setSelectedForm(form);
//     setViewMode('form');
//   };

//   // השלמת טופס
//   const handleFormComplete = async (formId) => {
//     setViewMode('dashboard');
//     setSelectedForm(null);
//     await handleRefresh(); // רענון הנתונים
//   };

//   // חזרה ל-Dashboard
//   const handleBackToDashboard = () => {
//     setViewMode('dashboard');
//     setSelectedForm(null);
//   };

//   // שליחה להורים
//   const handleSendToParent = (form) => {
//     // הפעולה מתבצעת ב-OnboardingDashboard
//     console.log('Form sent to parent:', form);
//   };

//   if (loading) {
//     return (
//       <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
//         <CircularProgress size={60} />
//         <Typography variant="h6" sx={{ mt: 2 }}>
//           טוען תהליך קליטה...
//         </Typography>
//       </Container>
//     );
//   }

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container maxWidth="lg" sx={{ py: 4 }}>
//         {/* Breadcrumbs */}
//         <Breadcrumbs sx={{ mb: 3 }}>
//           <Box 
//             sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
//             onClick={() => navigate('/')}
//           >
//             <HomeIcon sx={{ mr: 0.5 }} />
//             ראשי
//           </Box>
//           <Box 
//             sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
//             onClick={() => navigate('/kids')}
//           >
//             <GroupIcon sx={{ mr: 0.5 }} />
//             ניהול ילדים
//           </Box>
//           <Typography color="text.primary">
//             {isNewKid ? 'קליטת ילד חדש' : `קליטה - ${selectedKid?.firstName} ${selectedKid?.lastName}`}
//           </Typography>
//         </Breadcrumbs>

//         {/* שגיאות */}
//         {error && (
//           <Alert severity="error" sx={{ mb: 3 }}>
//             <AlertTitle>שגיאה</AlertTitle>
//             {error}
//           </Alert>
//         )}

//         {/* הלוגו עם הפרוגרס */}
//         {!isNewKid && currentProcess && (
//           <ProgressLogo 
//             onboardingData={currentProcess}
//             kidName={selectedKid ? `${selectedKid.firstName} ${selectedKid.lastName}` : null}
//             showFormsSummary={viewMode === 'dashboard'}
//             compact={viewMode !== 'dashboard'}
//           />
//         )}

//         {/* תוכן דינמי לפי מצב */}
//         <Fade in={true} timeout={500}>
//           <Box>
//             {viewMode === 'personalInfo' && (
//               <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
//                 <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
//                   <Typography variant="h5" gutterBottom>
//                     פרטים אישיים
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     מילוי פרטי הילד וההורים
//                   </Typography>
//                 </Box>
                
//                 <Box sx={{ p: 3 }}>
//                   <PersonalInfoForm
//                     data={null}
//                     onUpdate={handleKidCreated}
//                     isEditMode={false}
//                   />
//                 </Box>
//               </Paper>
//             )}

//             {viewMode === 'dashboard' && currentProcess && (
//               <>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//                   <Typography variant="h4" fontWeight="bold">
//                     תהליך קליטה
//                   </Typography>
//                   <Button
//                     variant="outlined"
//                     startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
//                     onClick={handleRefresh}
//                     disabled={refreshing}
//                   >
//                     {refreshing ? 'מרענן...' : 'רענן'}
//                   </Button>
//                 </Box>

//                 <OnboardingDashboard
//                   kidId={kidId}
//                   onboardingData={currentProcess}
//                   onFormSelect={handleFormSelect}
//                   onSendToParent={handleSendToParent}
//                 />
//               </>
//             )}

//             {viewMode === 'form' && selectedForm && (
//               <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
//                 <Box sx={{ p: 3, backgroundColor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                   <Box>
//                     <Typography variant="h5" gutterBottom>
//                       {selectedForm.form.formName}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       {selectedForm.form.formDescription}
//                     </Typography>
//                   </Box>
//                   <Button
//                     variant="outlined"
//                     startIcon={<BackIcon />}
//                     onClick={handleBackToDashboard}
//                   >
//                     חזרה
//                   </Button>
//                 </Box>
                
//                 <Box sx={{ p: 3 }}>
//                   <DynamicFormRenderer
//                     form={selectedForm.form}
//                     kidId={kidId}
//                     onFormComplete={handleFormComplete}
//                     showSendToParentOption={true}
//                     readOnly={selectedForm.status === 'completed' || selectedForm.status === 'completed_by_parent'}
//                   />
//                 </Box>
//               </Paper>
//             )}

//             {viewMode === 'dashboard' && !currentProcess && !isNewKid && (
//               <Alert severity="info" sx={{ mb: 3 }}>
//                 <AlertTitle>לא נמצא תהליך קליטה</AlertTitle>
//                 לא נמצא תהליך קליטה עבור ילד זה. ייתכן שהתהליך עדיין לא התחיל.
//                 <Box sx={{ mt: 2 }}>
//                   <Button 
//                     variant="contained" 
//                     onClick={() => navigate(`/kids/onboarding/new`)}
//                   >
//                     התחל תהליך קליטה חדש
//                   </Button>
//                 </Box>
//               </Alert>
//             )}
//           </Box>
//         </Fade>
//       </Container>
//     </LocalizationProvider>
//   );
// };

// export default KidOnboarding;