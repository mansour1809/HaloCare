// // src/pages/kids/KidProfilePage.jsx
// import React, { useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { 
//   Box, 
//   Typography, 
//   Button, 
//   Paper, 
//   Divider, 
//   CircularProgress, 
//   Alert,
//   Tabs,
//   Tab,
//   Breadcrumbs,
//   Link,
//   Chip
// } from '@mui/material';
// import PersonAddIcon from '@mui/icons-material/PersonAdd';
// import HomeIcon from '@mui/icons-material/Home';
// import GroupIcon from '@mui/icons-material/Group';
// import { fetchKidById } from '../../../Redux/features/kidsSlice';
// import { fetchTreatmentTypes } from '../../../Redux/features/treatmentTypesSlice';
// import KidFlowerProfile from './KidFlowerProfile';

// const KidProfilePage = () => {
//   const { kidId } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   const { selectedKid, status: kidStatus, error: kidError } = useSelector(state => state.kids);
//   const { treatmentTypes, status: typesStatus } = useSelector(state => state.treatmentTypes);
  
//   useEffect(() => {
//     if (kidId) {
//       dispatch(fetchKidById(kidId));
//       dispatch(fetchTreatmentTypes());
//     }
//   }, [dispatch, kidId]);
  
//   const handleAddTreatment = () => {
//     navigate(`/kids/${kidId}/treatments/add`);
//   };
  
//   const formatDate = (dateString) => {
//     if (!dateString) return '–';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('he-IL');
//   };
  
//   if (kidStatus === 'loading' || typesStatus === 'loading') {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }
  
//   if (kidStatus === 'failed') {
//     return (
//       <Box sx={{ p: 3 }}>
//         <Alert severity="error">{kidError}</Alert>
//       </Box>
//     );
//   }
  
//   if (!selectedKid) {
//     return (
//       <Box sx={{ p: 3 }}>
//         <Alert severity="info">לא נמצא ילד עם המזהה שצוין</Alert>
//       </Box>
//     );
//   }
  
//   return (
//     <Box sx={{ p: 3 }} dir="rtl">
//       {/* Breadcrumbs */}
//       <Breadcrumbs sx={{ mb: 2 }}>
//         <Link
//           underline="hover"
//           sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
//           color="inherit"
//           onClick={() => navigate('/')}
//         >
//           <HomeIcon sx={{ mr: 0.5, fontSize: 'small' }} />
//           ראשי
//         </Link>
//         <Link
//           underline="hover"
//           sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
//           color="inherit"
//           onClick={() => navigate('/kids/list')}
//         >
//           <GroupIcon sx={{ mr: 0.5, fontSize: 'small' }} />
//           רשימת ילדים
//         </Link>
//         <Typography color="text.primary" sx={{ fontWeight: 'medium' }}>
//           {selectedKid.firstName} {selectedKid.lastName}
//         </Typography>
//       </Breadcrumbs>
      
//       <Paper sx={{ p: 3, mb: 3, borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//           <Box>
//             <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#4cb5c3' }}>
//               תיק ילד: {selectedKid.firstName} {selectedKid.lastName}
//             </Typography>
//             <Box sx={{ mt: 1 }}>
//               <Chip 
//                 label={selectedKid.isActive ? "פעיל" : "לא פעיל"} 
//                 color={selectedKid.isActive ? "success" : "default"}
//                 size="small"
//                 sx={{ mr: 1 }}
//               />
//               <Chip
//                 label={`כיתה: ${selectedKid.className || "לא משויך"}`}
//                 color="primary"
//                 variant="outlined"
//                 size="small"
//               />
//             </Box>
//           </Box>
          
//           <Button
//             variant="contained"
//             startIcon={<PersonAddIcon />}
//             onClick={handleAddTreatment}
//             sx={{
//               backgroundColor: '#4cb5c3',
//               '&:hover': { backgroundColor: '#3da1af' }
//             }}
//           >
//             הוספת טיפול חדש
//           </Button>
//         </Box>
        
//         <Divider sx={{ mb: 3 }} />
        
//         {/* תצוגת פרח של תחומי הטיפול */}
//         <KidFlowerProfile kid={selectedKid} />
//       </Paper>
      
//       <Paper sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
//         <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
//           פרטי ילד
//         </Typography>
        
//         <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
//           <Box>
//             <Typography variant="subtitle2" color="text.secondary">שם פרטי</Typography>
//             <Typography>{selectedKid.firstName || '–'}</Typography>
//           </Box>
          
//           <Box>
//             <Typography variant="subtitle2" color="text.secondary">שם משפחה</Typography>
//             <Typography>{selectedKid.lastName || '–'}</Typography>
//           </Box>
          
//           <Box>
//             <Typography variant="subtitle2" color="text.secondary">תאריך לידה</Typography>
//             <Typography>{formatDate(selectedKid.birthDate)}</Typography>
//           </Box>
          
//           <Box>
//             <Typography variant="subtitle2" color="text.secondary">מגדר</Typography>
//             <Typography>{selectedKid.gender || '–'}</Typography>
//           </Box>
          
//           <Box>
//             <Typography variant="subtitle2" color="text.secondary">כיתה</Typography>
//             <Typography>{selectedKid.className || '–'}</Typography>
//           </Box>
          
//           <Box>
//             <Typography variant="subtitle2" color="text.secondary">כתובת</Typography>
//             <Typography>{selectedKid.address ? `${selectedKid.address}, ${selectedKid.cityName || ''}` : '–'}</Typography>
//           </Box>
          
//           <Box>
//             <Typography variant="subtitle2" color="text.secondary">הורה ראשי</Typography>
//             <Typography>{selectedKid.parentName1 || '–'}</Typography>
//           </Box>
          
//           <Box>
//             <Typography variant="subtitle2" color="text.secondary">הורה משני</Typography>
//             <Typography>{selectedKid.parentName2 || '–'}</Typography>
//           </Box>
//         </Box>
//       </Paper>
//     </Box>
//   );
// };

// export default KidProfilePage;
// src/pages/kids/KidOnboarding.jsx - גרסה פשוטה וברורה
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Box, Paper, Typography, Stepper, Step, StepLabel,
  Button, CircularProgress, Breadcrumbs
} from '@mui/material';
import {
  Home as HomeIcon,
  Group as GroupIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon
} from '@mui/icons-material';

import { fetchOnboardingStatus, fetchAvailableForms } from '../../Redux/features/onboardingSlice';
import { fetchKidById } from '../../Redux/features/kidsSlice';
import PersonalInfoForm from './PersonalInfoForm';
import ProgressLogo from './ProgressLogo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const KidOnboarding = () => {
  const { kidId } = useParams(); // kidId או "new"
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { availableForms } = useSelector(state => state.onboarding);
  const { selectedKid } = useSelector(state => state.kids);
  
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  // האם זה ילד חדש או קיים
  const isNewKid = kidId === undefined;

  // טעינה ראשונית
  useEffect(() => {
    initializeOnboarding();
  }, [kidId]);

  const initializeOnboarding = async () => {
    try {
      setLoading(true);
      
      // טעינת רשימת הטפסים
      const formsResult = await dispatch(fetchAvailableForms()).unwrap();
      
      // יצירת רשימת השלבים מהטפסים
    const sortedForms = [...formsResult].sort((a, b) => a.formOrder - b.formOrder);
setSteps(sortedForms);

      if (!isNewKid) {
        // טעינת נתוני ילד קיים
        await dispatch(fetchKidById(kidId));
        
        // טעינת סטטוס התהליך
        const statusResult = await dispatch(fetchOnboardingStatus(kidId)).unwrap();
        
        // קביעת השלב הנוכחי
        const completedSteps = statusResult.forms.filter(f => f.status === 'completed').length;
        setActiveStep(completedSteps);
      }
      
    } catch (error) {
      console.error('Error initializing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  // מעבר לשלב הבא
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      // סיום התהליך
      navigate(`/kids/${kidId}`);
    }
  };

  // חזרה לשלב קודם
  const handleBack = () => {
    setActiveStep(prev => Math.max(0, prev - 1));
  };

  // קליטת ילד חדש הושלמה
  const handleKidCreated = (newKid) => {
    // עדכון ה-URL לילד החדש
    navigate(`/kids/onboarding/${newKid.id}`, { replace: true });
    
    // מעבר לשלב הבא
    setActiveStep(1);
  };

  // רנדור תוכן השלב הנוכחי
  const renderStepContent = () => {
    if (steps.length === 0 ) return null;
    
    const currentStep = steps[activeStep];
    
    // השלב הראשון - פרטים אישיים
    if (currentStep?.isFirstStep || activeStep === 0) {
      return (
        <PersonalInfoForm
          data={selectedKid}
          onUpdate={handleKidCreated}
          isEditMode={!isNewKid}
        />
      );
    }
    
    // שאר השלבים - טפסים דינמיים (נוסיף בהמשך)
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">
          טופס {currentStep.formName}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {currentStep.formDescription}
        </Typography>
        <Button variant="contained" onClick={handleNext}>
          סמן כהושלם והמשך
        </Button>
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          טוען תהליך קליטה...
        </Typography>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Box 
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <HomeIcon sx={{ mr: 0.5 }} />
          ראשי
        </Box>
        <Box 
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigate('/kids/list')}
        >
          <GroupIcon sx={{ mr: 0.5 }} />
          ניהול ילדים
        </Box>
        {console.log(isNewKid)}
        <Typography color="text.primary">
          {isNewKid ? 'קליטת ילד חדש' : `המשך קליטה - ${selectedKid?.firstName} ${selectedKid?.lastName}`}
        </Typography>
      </Breadcrumbs>

      {/* הלוגו עם הפרוגרס */}
      <ProgressLogo 
        activeStep={!isNewKid ? activeStep : 0} 
        totalSteps={steps.length}
        kidName={!isNewKid ? `${selectedKid.firstName} ${selectedKid.lastName}` : null}
        steps={steps.map(step => step.formName)}
      />

      {/* תוכן השלב הנוכחי */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        {steps.length > 0 ? (
          <>
            <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
              <Typography variant="h5" gutterBottom>
                {steps[activeStep]?.formName || 'פרטים אישיים'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {steps[activeStep]?.formDescription || 'מילוי פרטי הילד וההורים'}
              </Typography>
            </Box>
            
            <Box sx={{ p: 0 }}>
              {renderStepContent()}
            </Box>
          </>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography>לא נמצאו טפסים זמינים</Typography>
          </Box>
        )}
      </Paper>

      {/* כפתורי ניווט - רק אם זה לא השלב הראשון */}
      {activeStep > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={handleBack}
          >
            חזרה
          </Button>
          
          <Button
            variant="contained"
            endIcon={<NextIcon />}
            onClick={handleNext}
          >
            {activeStep === steps.length - 1 ? 'סיום' : 'הבא'}
          </Button>
        </Box>
      )}
    </Container>
    </LocalizationProvider>
  );
};

export default KidOnboarding;