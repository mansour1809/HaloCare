// components/kids/KidProfile.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, Grid, Tabs, Tab, Divider, Chip, 
  Avatar, IconButton, Button, List, ListItem, ListItemText,
  Card, CardHeader, CardContent, Accordion, AccordionSummary,
  AccordionDetails, Table, TableBody, TableCell, TableHead,
  TableRow, Badge, Alert, CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  EventNote as EventIcon,
  Home as HomeIcon,
  Restaurant as RestaurantIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Send as SendIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { fetchKidById } from '../../Redux/features/kidsSlice';
import { fetchAllKidAnswers } from '../../Redux/features/answersSlice';
import { sendFormToParent } from '../../Redux/features/formsSlice';
import { toast } from 'react-toastify';

// סטיילינג מותאם אישית
const ProfileHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(3),
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
}));

const InfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    borderTopLeftRadius: theme.spacing(2),
    borderTopRightRadius: theme.spacing(2),
    background: theme.palette.primary.main,
  }
}));

const TabPanel = ({ children, value, index, ...props }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`kid-profile-tabpanel-${index}`}
    aria-labelledby={`kid-profile-tab-${index}`}
    {...props}
  >
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const KidProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  
  const { selectedKid: kidProfile, status: profileStatus, error: profileError } = useSelector(state => state.kids);
  const { allKidAnswers, status: answersStatus } = useSelector(state => state.answers);
  const { sendStatus } = useSelector(state => state.forms);
  
  // טעינת פרטי הילד ותשובות הטפסים
  useEffect(() => {
    if (id) {
      dispatch(fetchKidById(Number(id)));
      dispatch(fetchAllKidAnswers(Number(id)));
    }
  }, [dispatch, id]);
  
  // טיפול בשינוי טאב
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // פונקציה לקבלת התשובות בטופס מסוים
  const getFormAnswers = (formId) => {
    return allKidAnswers.filter(answer => answer.formId === formId);
  };
  
  // פונקציה לבדיקה האם טופס הושלם
  const isFormCompleted = (formId) => {
    const answers = getFormAnswers(formId);
    // הטופס נחשב שהושלם אם יש לפחות תשובה אחת
    return answers.length > 0;
  };
  
  // שליחת טופס להורה
  const handleSendToParent = async (formId) => {
    try {
      await dispatch(sendFormToParent({ 
        kidId: Number(id), 
        formId 
      })).unwrap();
      
      toast.success(`הטופס נשלח בהצלחה להורה`);
    } catch (error) {
      toast.error('אירעה שגיאה בשליחת הטופס');
      console.error(error);
    }
  };
  
  if (profileStatus === 'loading' || answersStatus === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  console.log('Kid Profile:', kidProfile);
  console.log('profileError:', profileError);
  if (profileError || !kidProfile) {
    return <Alert severity="error">לא נמצאו נתונים עבור ילד זה או שאירעה שגיאה בטעינת הנתונים.</Alert>;
  }
  
  const { 
    firstName, lastName, birthDate, gender, cityName, address, photoPath, 
    parent1FirstName, parent1LastName, parent1Mobile, parent1Email,
    parent2FirstName, parent2LastName, parent2Mobile, parent2Email,
    emergencyContactName, emergencyContactPhone
  } = kidProfile;
  
  // חישוב גיל הילד
  const calculateAge = (birthDateStr) => {
    const today = new Date();
    const birthDateObj = new Date(birthDateStr);
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    
    // בני פחות משנה - הצג בחודשים
    if (age === 0) {
      const monthAge = monthDiff + 12; // אם monthDiff שלילי, נוסיף 12
      return `${monthAge} חודשים`;
    }
    
    return `${age} שנים`;
  };
  
  const age = calculateAge(birthDate);
  
  // מצב השלמת הטפסים
  const formStatuses = [
    { id: 1002, name: 'פרטים אישיים', completed: true }, // תמיד מושלם כי אנחנו בדף התיק
    { id: 1003, name: 'רקע התפתחותי', completed: isFormCompleted(1003) },
    { id: 1004, name: 'מצב בריאותי', completed: isFormCompleted(1004) },
    { id: 1005, name: 'שאלון תזונתי', completed: isFormCompleted(1005) },
    { id: 1006, name: 'אישורים', completed: isFormCompleted(1006) },
    { id: 1007, name: 'ביקור בית', completed: isFormCompleted(1007) }
  ];
  
  // כאן יבוא הרינדור של הקומפוננטה כפי שהיה

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      {/* כותרת וסרגל פעולות */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          תיק ילד
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            onClick={() => navigate(`/edit-kid/${id}`)}
            sx={{ mx: 1 }}
          >
            ערוך פרטים
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            הדפס תיק
          </Button>
        </Box>
      </Box>
      
      {/* כרטיס פרטי פרופיל */}
      <ProfileHeader>
        <ProfileAvatar src={photoPath || '/assets/default-avatar.png'} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {firstName} {lastName}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
            {age} | {gender === 'זכר' ? 'זכר' : 'נקבה'}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            <Chip 
              icon={<HomeIcon />} 
              label={`${address}, ${cityName}`} 
              variant="outlined"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit' }}
            />
          </Box>
        </Box>
      </ProfileHeader>
      
      {/* סיכום סטטוס טפסים */}
      <Paper elevation={1} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          סטטוס טפסים
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {formStatuses.map((form) => (
            <Chip
              key={form.id}
              label={form.name}
              color={form.completed ? 'success' : 'default'}
              icon={form.completed ? <CheckCircleIcon /> : null}
              variant={form.completed ? 'filled' : 'outlined'}
              onClick={() => !form.completed && navigate(`/forms/${form.id}/${id}`)}
            />
          ))}
        </Box>
      </Paper>
      
      {/* טאבים לתוכן פרופיל */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<PersonIcon />} label="פרטים אישיים" />
          <Tab icon={<FavoriteIcon />} label="מידע רפואי" />
          <Tab icon={<RestaurantIcon />} label="תזונה" />
          <Tab icon={<AssignmentIcon />} label="התפתחות" />
          <Tab icon={<EventIcon />} label="יומן טיפולים" />
          <Tab icon={<HomeIcon />} label="ביקור בית" />
          <Tab icon={<DescriptionIcon />} label="מסמכים" />
        </Tabs>
      </Box>
      
      {/* תוכן הטאבים */}
      {/* TabPanel כפי שהוגדר */}
    </Box>
  );
};

export default KidProfile;