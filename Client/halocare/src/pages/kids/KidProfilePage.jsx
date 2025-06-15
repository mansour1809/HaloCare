// src/pages/kids/KidProfilePage.jsx - גרסה משופרת
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Typography, Button, Paper, Divider, CircularProgress, Alert,
  Tabs, Tab, Breadcrumbs, Link, Chip, Grid, Card, CardContent,
  Avatar, IconButton, Tooltip, 
    Accordion,
  AccordionSummary, AccordionDetails, List, ListItem, ListItemIcon,
  ListItemText, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineConnector from '@mui/lab/TimelineConnector';

import {
  PersonAdd as PersonAddIcon, Home as HomeIcon, Group as GroupIcon,
  Edit as EditIcon, ExpandMore as ExpandMoreIcon, CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon, Assignment as AssignmentIcon, 
  LocalHospital as MedicalIcon, Restaurant as NutritionIcon,
  Approval as ApprovalIcon, Home as HomeVisitIcon,
  Phone as PhoneIcon, Email as EmailIcon, LocationOn as LocationIcon,
  CalendarToday as CalendarIcon, Person as PersonIcon,
  School as SchoolIcon, Refresh as RefreshIcon
  
} from '@mui/icons-material';
import { fetchKidById } from '../../Redux/features/kidsSlice';
// import { fetchKidIntakeProcess } from '../../Redux/features/intakeProcessSlice';
import { fetchTreatmentTypes } from '../../Redux/features/treatmentTypesSlice';
import KidFlowerProfile from './KidFlowerProfile';
import IntakeStatusBadge from '../../components/kids/IntakeStatusBadge';
import Swal from 'sweetalert2';

const KidProfilePage = () => {
  const { kidId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { selectedKid, status: kidStatus, error: kidError } = useSelector(state => state.kids);
  // const { selectedProcess } = useSelector(state => state.intakeProcess);
  const { treatmentTypes, status: typesStatus } = useSelector(state => state.treatmentTypes);
  
  // Local state
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  useEffect(() => {
    if (kidId) {
      dispatch(fetchKidById(kidId));
      // dispatch(fetchKidIntakeProcess(kidId));
      dispatch(fetchTreatmentTypes());
    }
  }, [dispatch, kidId]);
  
  // רענון נתונים
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchKidById(kidId)),
        // dispatch(fetchKidIntakeProcess(kidId))
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // הוספת טיפול חדש
  const handleAddTreatment = () => {
    navigate(`/kids/${kidId}/treatments/add`);
  };
  
  // עריכת פרטי ילד
  const handleEditKid = () => {
    navigate(`/kids/intake/${kidId}`);
  };
  
  // המשך תהליך קליטה
  const handleContinueIntake = () => {
    navigate(`/kids/intake/${kidId}`);
  };
  
  // פורמט תאריך
  const formatDate = (dateString) => {
    if (!dateString) return '–';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };
  
  // פורמט גיל
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return '–';
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }
    
    return `${years} שנים ו-${months} חודשים`;
  };
  
  // רכיב מידע אישי
  const PersonalInfoSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card sx={{ textAlign: 'center', p: 3 }}>
          <Avatar
            src={selectedKid.photo ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(selectedKid.photo)}` : ''}
            alt={`${selectedKid.firstName} ${selectedKid.lastName}`}
            sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
          >
            {!selectedKid.photo && `${selectedKid.firstName?.[0] || ''}${selectedKid.lastName?.[0] || ''}`}
          </Avatar>
          <Typography variant="h5" gutterBottom>
            {selectedKid.firstName} {selectedKid.lastName}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
            <Chip 
              label={selectedKid.isActive ? "פעיל" : "לא פעיל"} 
              color={selectedKid.isActive ? "success" : "default"}
              size="small"
            />
            <Chip
              label={`כיתה: ${selectedKid.className || "לא משויך"}`}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Box>
          <IntakeStatusBadge 
            status={selectedProcess?.status || 'NOT_STARTED'} 
            percentage={selectedProcess?.completionPercentage || 0}
          />
        </Card>
      </Grid>
      
      <Grid item xs={12} md={8}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            פרטים אישיים
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">שם פרטי</Typography>
                <Typography variant="body1">{selectedKid.firstName || '–'}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">שם משפחה</Typography>
                <Typography variant="body1">{selectedKid.lastName || '–'}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">תאריך לידה</Typography>
                <Typography variant="body1">{formatDate(selectedKid.birthDate)}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">גיל</Typography>
                <Typography variant="body1">{calculateAge(selectedKid.birthDate)}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">מגדר</Typography>
                <Typography variant="body1">
                  {selectedKid.gender === 'male' ? 'זכר' : selectedKid.gender === 'female' ? 'נקבה' : '–'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SchoolIcon fontSize="small" />
                  כיתה
                </Typography>
                <Typography variant="body1">{selectedKid.className || '–'}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationIcon fontSize="small" />
                  כתובת
                </Typography>
                <Typography variant="body1">
                  {selectedKid.address ? `${selectedKid.address}, ${selectedKid.cityName || ''}` : '–'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  );
  
  // רכיב פרטי הורים
  const ParentsInfoSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            הורה ראשי
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              <Typography>{selectedKid.parentName1 || '–'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon />
              <Typography>{selectedKid.parentPhone1 || '–'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon />
              <Typography>{selectedKid.parentEmail1 || '–'}</Typography>
            </Box>
          </Box>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            הורה משני
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              <Typography>{selectedKid.parentName2 || '–'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon />
              <Typography>{selectedKid.parentPhone2 || '–'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon />
              <Typography>{selectedKid.parentEmail2 || '–'}</Typography>
            </Box>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
  
  // רכיב תהליך קליטה
  const IntakeProcessSection = () => {
    const getFormName = (formId) => {
      const formNames = {
        1002: 'פרטים אישיים',
        1003: 'רקע התפתחותי', 
        1004: 'מידע רפואי',
        1005: 'שאלון תזונתי',
        1006: 'אישורים',
        1007: 'ביקור בית'
      };
      return formNames[formId] || `טופס ${formId}`;
    };
    
    const getFormIcon = (formId) => {
      const icons = {
        1002: <PersonIcon />,
        1003: <AssignmentIcon />,
        1004: <MedicalIcon />,
        1005: <NutritionIcon />,
        1006: <ApprovalIcon />,
        1007: <HomeVisitIcon />
      };
      return icons[formId] || <AssignmentIcon />;
    };
    
    const completedForms = selectedProcess?.completedForms ? 
      JSON.parse(selectedProcess.completedForms) : [];
    const pendingForms = selectedProcess?.pendingForms ? 
      JSON.parse(selectedProcess.pendingForms) : [];
    const parentPendingForms = selectedProcess?.parentPendingForms ? 
      JSON.parse(selectedProcess.parentPendingForms) : [];
    
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            מעקב תהליך קליטה
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            רענון
          </Button>
        </Box>
        
        {selectedProcess ? (
          <Box>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <IntakeStatusBadge 
                status={selectedProcess.status} 
                percentage={selectedProcess.completionPercentage}
                showPercentage={true}
              />
            </Box>
            
            <Timeline>
              {/* טפסים שהושלמו */}
              {completedForms.map((formId) => (
                <TimelineItem key={formId}>
                  <TimelineSeparator>
                    <TimelineDot color="success">
                      <CheckCircleIcon />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getFormIcon(formId)}
                      <Typography variant="body1">
                        {getFormName(formId)} - הושלם
                      </Typography>
                    </Box>
                  </TimelineContent>
                </TimelineItem>
              ))}
              
              {/* טפסים אצל הורים */}
              {parentPendingForms.map((formId) => (
                <TimelineItem key={`parent-${formId}`}>
                  <TimelineSeparator>
                    <TimelineDot color="info">
                      <ScheduleIcon />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getFormIcon(formId)}
                      <Typography variant="body1">
                        {getFormName(formId)} - אצל הורים
                      </Typography>
                    </Box>
                  </TimelineContent>
                </TimelineItem>
              ))}
              
              {/* טפסים ממתינים */}
              {pendingForms.map((formId) => (
                <TimelineItem key={`pending-${formId}`}>
                  <TimelineSeparator>
                    <TimelineDot color="warning">
                      <ScheduleIcon />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getFormIcon(formId)}
                      <Typography variant="body1">
                        {getFormName(formId)} - ממתין למילוי
                      </Typography>
                    </Box>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
            
            {selectedProcess.notes && (
              <Paper sx={{ p: 2, mt: 3, backgroundColor: '#f5f5f5' }}>
                <Typography variant="subtitle2" gutterBottom>
                  הערות:
                </Typography>
                <Typography variant="body2">
                  {selectedProcess.notes}
                  </Typography>
             </Paper>
           )}
         </Box>
       ) : (
         <Alert severity="info">
           לא נמצא תהליך קליטה עבור ילד זה
         </Alert>
       )}
     </Box>
   );
 };
 
 // מצב טעינה
 if (kidStatus === 'loading' || typesStatus === 'loading') {
   return (
     <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
       <CircularProgress size={60} />
     </Box>
   );
 }
 
 // מצב שגיאה
 if (kidStatus === 'failed') {
   return (
     <Box sx={{ p: 3 }}>
       <Alert severity="error" sx={{ mb: 2 }}>{kidError}</Alert>
       <Button variant="contained" onClick={() => navigate('/kids/list')}>
         חזרה לרשימת ילדים
       </Button>
     </Box>
   );
 }
 
 // ילד לא נמצא
 if (!selectedKid) {
   return (
     <Box sx={{ p: 3, textAlign: 'center' }}>
       <Alert severity="info" sx={{ mb: 2 }}>לא נמצא ילד עם המזהה שצוין</Alert>
       <Button variant="contained" onClick={() => navigate('/kids/list')}>
         חזרה לרשימת ילדים
       </Button>
     </Box>
   );
 }
 
 return (
   <Box sx={{ p: 3 }} dir="rtl">
     {/* Breadcrumbs */}
     <Breadcrumbs sx={{ mb: 2 }}>
       <Link
         underline="hover"
         sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
         color="inherit"
         onClick={() => navigate('/')}
       >
         <HomeIcon sx={{ mr: 0.5, fontSize: 'small' }} />
         ראשי
       </Link>
       <Link
         underline="hover"
         sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
         color="inherit"
         onClick={() => navigate('/kids/list')}
       >
         <GroupIcon sx={{ mr: 0.5, fontSize: 'small' }} />
         רשימת ילדים
       </Link>
       <Typography color="text.primary" sx={{ fontWeight: 'medium' }}>
         {selectedKid.firstName} {selectedKid.lastName}
       </Typography>
     </Breadcrumbs>
     
     {/* כותרת וכפתורי פעולה */}
     <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
         <Box>
           <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#4cb5c3', mb: 1 }}>
             תיק ילד: {selectedKid.firstName} {selectedKid.lastName}
           </Typography>
           <Typography variant="body1" color="text.secondary">
             מידע מפורט על הילד, תהליכי טיפול ומעקב התקדמות
           </Typography>
         </Box>
         
         <Box sx={{ display: 'flex', gap: 2 }}>
           <Tooltip title="רענון נתונים">
             <IconButton 
               onClick={handleRefresh} 
               disabled={refreshing}
               sx={{ 
                 backgroundColor: '#f5f5f5',
                 '&:hover': { backgroundColor: '#e0e0e0' }
               }}
             >
               <RefreshIcon />
             </IconButton>
           </Tooltip>
           
           {selectedProcess?.status !== 'COMPLETED' && (
             <Button
               variant="outlined"
               startIcon={<EditIcon />}
               onClick={handleContinueIntake}
               sx={{ borderRadius: '8px' }}
             >
               המשך קליטה
             </Button>
           )}
           
           <Button
             variant="contained"
             startIcon={<PersonAddIcon />}
             onClick={handleAddTreatment}
             sx={{
               backgroundColor: '#4cb5c3',
               '&:hover': { backgroundColor: '#3da1af' },
               borderRadius: '8px'
             }}
           >
             הוספת טיפול חדש
           </Button>
         </Box>
       </Box>
     </Paper>
     
     {/* טאבים */}
     <Paper sx={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
       <Tabs 
         value={activeTab} 
         onChange={(e, newValue) => setActiveTab(newValue)}
         variant="fullWidth"
         sx={{ 
           borderBottom: 1, 
           borderColor: 'divider',
           '& .MuiTab-root': {
             fontWeight: 600,
             fontSize: '1rem'
           }
         }}
       >
         <Tab 
           label="פרטים אישיים" 
           icon={<PersonIcon />} 
           iconPosition="start"
         />
         <Tab 
           label="פרטי הורים" 
           icon={<GroupIcon />} 
           iconPosition="start"
         />
         <Tab 
           label="תהליך קליטה" 
           icon={<AssignmentIcon />} 
           iconPosition="start"
         />
         <Tab 
           label="טיפולים" 
           icon={<MedicalIcon />} 
           iconPosition="start"
         />
       </Tabs>
       
       {/* תוכן הטאבים */}
       <Box sx={{ p: 3 }}>
         {activeTab === 0 && <PersonalInfoSection />}
         
         {activeTab === 1 && <ParentsInfoSection />}
         
         {activeTab === 2 && <IntakeProcessSection />}
         
         {activeTab === 3 && (
           <Box>
             {/* תצוגת פרח של תחומי הטיפול */}
             <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
               מפת טיפולים
             </Typography>
             <KidFlowerProfile kid={selectedKid} />
             
             {/* רשימת טיפולים אחרונים */}
             <Paper sx={{ p: 3, mt: 3, backgroundColor: '#f8f9fa' }}>
               <Typography variant="h6" gutterBottom>
                 טיפולים אחרונים
               </Typography>
               <Alert severity="info">
                 רשימת הטיפולים תוצג כאן לאחר פיתוח המודול
               </Alert>
             </Paper>
           </Box>
         )}
       </Box>
     </Paper>
     
     {/* סטטיסטיקות מהירות */}
     <Grid container spacing={2} sx={{ mt: 2 }}>
       <Grid item xs={12} sm={6} md={3}>
         <Card sx={{ textAlign: 'center', p: 2 }}>
           <Typography variant="h4" color="primary" fontWeight="bold">
             {selectedProcess?.completionPercentage || 0}%
           </Typography>
           <Typography variant="body2" color="text.secondary">
             התקדמות קליטה
           </Typography>
         </Card>
       </Grid>
       
       <Grid item xs={12} sm={6} md={3}>
         <Card sx={{ textAlign: 'center', p: 2 }}>
           <Typography variant="h4" color="success.main" fontWeight="bold">
             {selectedProcess ? JSON.parse(selectedProcess.completedForms || '[]').length : 0}
           </Typography>
           <Typography variant="body2" color="text.secondary">
             טפסים הושלמו
           </Typography>
         </Card>
       </Grid>
       
       <Grid item xs={12} sm={6} md={3}>
         <Card sx={{ textAlign: 'center', p: 2 }}>
           <Typography variant="h4" color="warning.main" fontWeight="bold">
             {selectedProcess ? JSON.parse(selectedProcess.pendingForms || '[]').length : 0}
           </Typography>
           <Typography variant="body2" color="text.secondary">
             טפסים ממתינים
           </Typography>
         </Card>
       </Grid>
       
       <Grid item xs={12} sm={6} md={3}>
         <Card sx={{ textAlign: 'center', p: 2 }}>
           <Typography variant="h4" color="info.main" fontWeight="bold">
             0
           </Typography>
           <Typography variant="body2" color="text.secondary">
             טיפולים החודש
           </Typography>
         </Card>
       </Grid>
     </Grid>
   </Box>
 );
};

export default KidProfilePage;