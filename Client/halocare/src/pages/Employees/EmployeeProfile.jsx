// src/pages/employees/EmployeeProfile.jsx - פרופיל עובד מקצועי ומודרני

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Paper, Typography, Button, Grid, Box, 
  Avatar, Chip, Tabs, Tab, Card, CardContent, 
  CircularProgress, Alert, Breadcrumbs, IconButton,
  Fade, Zoom, Divider, Stack, Tooltip, Badge
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Badge as BadgeIcon,
  Event as EventIcon,
  Folder as FolderIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
  PhotoCamera as PhotoCameraIcon,
  Description as DocumentIcon,
  Star as StarIcon,
  AutoAwesome as AutoAwesomeIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled, alpha } from '@mui/material/styles';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

// Import קומפוננטות
import { useEmployees } from './EmployeesContext';
import EmployeeForm from './EmployeeForm';
import EmployeeDocumentManager from './EmployeeDocumentManager';
import { baseURL } from '../../components/common/axiosConfig';

// תמה מדהימה RTL
const profileTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
    },
    h4: { 
      fontWeight: 700, 
      fontSize: '2.2rem' 
    },
    h5: { 
      fontWeight: 600, 
      fontSize: '1.8rem' 
    },
    h6: { 
      fontWeight: 600, 
      fontSize: '1.4rem' 
    }
  },
  palette: {
    primary: {
      main: '#4cb5c3',
      light: '#7ec8d3',
      dark: '#2a8a95',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff7043',
      light: '#ff9575',
      dark: '#c63f17',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    background: {
      default: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 100%)',
      paper: '#ffffff',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'visible',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          }
        },
        contained: {
          background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
          }
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '1rem',
          borderRadius: '12px 12px 0 0',
          transition: 'all 0.3s ease',
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1) 0%, rgba(42, 138, 149, 0.1) 100%)',
            color: '#2a8a95',
          }
        }
      }
    }
  }
});

// מסך מלא מותאם RTL עם רקע מדהים
const FullScreenContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
  backgroundSize: '400% 400%',
  animation: 'gradientShift 20s ease infinite',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 40%, rgba(76, 181, 195, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255, 112, 67, 0.2) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  }
}));

// אווטאר מעוצב מדהים
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 150,
  height: 150,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: `0 12px 40px rgba(76, 181, 195, 0.4)`,
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: `0 20px 60px rgba(76, 181, 195, 0.6)`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-6px',
    left: '-6px',
    right: '-6px',
    bottom: '-6px',
    background: 'linear-gradient(45deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    borderRadius: '50%',
    zIndex: -1,
    animation: 'borderRotate 3s linear infinite',
  },
  '@keyframes borderRotate': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  }
}));

// כרטיס מידע מעוצב
const InfoCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981)',
  }
}));

// כותרת סקציה מעוצבת
const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5, 0),
  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '50px',
    height: '2px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043)',
  }
}));

// כרטיס פרופיל עליון מדהים
const HeroProfileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
  color: 'white',
  borderRadius: 24,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(76, 181, 195, 0.3)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '300px',
    height: '300px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '50%',
    transform: 'translate(100px, -100px)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '200px',
    height: '200px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '50%',
    transform: 'translate(-50px, 50px)',
  }
}));

const EmployeeProfile = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux/Context
  const { employees, loading } = useEmployees();
  
  // State מקומי
  const [employee, setEmployee] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loadingEmployee, setLoadingEmployee] = useState(true);
  
  // טעינת העובד
  useEffect(() => {
    const loadEmployee = () => {
      if (employees && employees.length > 0) {
        const foundEmployee = employees.find(emp => 
          emp.employeeId === parseInt(employeeId)
        );
        
        if (foundEmployee) {
          setEmployee(foundEmployee);
        }
        setLoadingEmployee(false);
      }
    };
    
    loadEmployee();
  }, [employeeId, employees]);

  // פורמט תאריך
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'NULL') return 'לא הוזן';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: he });
    } catch {
      return 'לא הוזן';
    }
  };

  // קבלת צבע תפקיד
  const getRoleColor = (roleName) => {
    const roleColors = {
      'מנהל': '#e53e3e',
      'מחנך': '#3182ce', 
      'סייעת': '#38a169',
      'מטפל': '#d69e2e',
      'ממלא מקום': '#805ad5'
    };
    return roleColors[roleName] || '#718096';
  };

  // חישוב ותק בעבודה
  const calculateSeniority = (startDate) => {
    if (!startDate) return 'לא הוזן';
    try {
      const start = new Date(startDate);
      const now = new Date();
      const diffTime = Math.abs(now - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      
      if (years > 0) {
        return `${years} שנים ו-${months} חודשים`;
      } else {
        return `${months} חודשים`;
      }
    } catch {
      return 'לא הוזן';
    }
  };

  // טיפול בעדכון עובד
  const handleEmployeeUpdate = (updatedEmployee) => {
    setEmployee(updatedEmployee);
    setEditMode(false);
  };

  // מצב טעינה
  if (loading || loadingEmployee) {
    return (
      <ThemeProvider theme={profileTheme}>
        <Box sx={{ direction: 'rtl' }}>
          <FullScreenContainer>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '100vh',
              position: 'relative',
              zIndex: 2
            }}>
              <CircularProgress size={80} thickness={4} sx={{ color: 'white', mb: 3 }} />
              <Typography variant="h5" sx={{ 
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                fontWeight: 600
              }}>
                🔄 טוען פרטי עובד...
              </Typography>
            </Box>
          </FullScreenContainer>
        </Box>
      </ThemeProvider>
    );
  }

  // עובד לא נמצא
  if (!employee) {
    return (
      <ThemeProvider theme={profileTheme}>
        <Box dir='rtl'>
          <FullScreenContainer>
            <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 2 }}>
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Typography variant="h6">❌ עובד לא נמצא</Typography>
                עובד עם מזהה {employeeId} לא נמצא במערכת
              </Alert>
              <Button 
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/employees/list')}
                sx={{ 
                  mt: 2,
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#2a8a95',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 1)',
                  }
                }}
              >
                חזרה לרשימת עובדים
              </Button>
            </Container>
          </FullScreenContainer>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={profileTheme}>
      <Box dir='rtl'>
        <FullScreenContainer>
          <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 2 }}>
            {/* Breadcrumbs */}
            <Fade in timeout={600}>
              <Breadcrumbs sx={{ 
                mb: 3,
                '& .MuiBreadcrumbs-ol': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  padding: '8px 16px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }
              }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/employees/list')}
                  sx={{ 
                    p: 0, 
                    minWidth: 'auto',
                    color: 'white',
                    '&:hover': {
                      color: 'rgba(255,255,255,0.8)'
                    }
                  }}
                >
                  רשימת עובדים
                </Button>
                <Typography color="rgba(255,255,255,0.9)" fontWeight={600}>
                  פרופיל עובד
                </Typography>
              </Breadcrumbs>
            </Fade>

            {/* כרטיס פרופיל עליון מדהים */}
            <Zoom in timeout={800}>
              <HeroProfileCard elevation={8}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={3} textAlign="center">
                    <ProfileAvatar
                      src={employee.photo ? 
                        `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(employee.photo)}` : 
                        undefined
                      }
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                    >
                      {!employee.photo && (
                        <>
                          {employee.firstName?.[0]}
                          {employee.lastName?.[0]}
                        </>
                      )}
                    </ProfileAvatar>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h4" gutterBottom sx={{ 
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2
                    }}>
                      <StarIcon sx={{ mr: 2, fontSize: '2.5rem', color: '#fbbf24' }} />
                      {employee.firstName} {employee.lastName}
                    </Typography>
                    
                    <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        icon={<WorkIcon />}
                        label={employee.roleName || 'לא הוזן תפקיד'}
                        sx={{
                          backgroundColor: getRoleColor(employee.roleName),
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '1rem',
                          px: 2,
                          py: 1,
                          height: 'auto'
                        }}
                      />
                     
                      <Chip
                        icon={employee.isActive ? <CelebrationIcon /> : <SecurityIcon />}
                        // label={employee.isActive ? '✅ פעיל' : '❌ לא פעיל'}
                        label={employee.isActive ? ' פעיל' : ' לא פעיל'}
                        color={employee.isActive ? 'success' : 'error'}
                        sx={{ 
                          fontWeight: 700,
                          fontSize: '1rem',
                          px: 2,
                          py: 1,
                          height: 'auto'
                        }}
                      />
                    </Stack>
                    
                    <Typography variant="h6" sx={{ 
                      opacity: 0.9, 
                      fontSize: '1.3rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <EventIcon sx={{ mr: 1 }} />
                      ותק: {calculateSeniority(employee.startDate)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={3} textAlign="center">
                    <Button
                      variant="contained"
                      // startIcon={<EditIcon />}
                      onClick={() => setEditMode(true)}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '2px solid rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.3)',
                          transform: 'translateY(-3px) scale(1.05)',
                          boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
                        },
                        borderRadius: 3,
                        px: 4,
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 700
                      }}
                    >
                      ✏️ עריכת פרופיל
                    </Button>
                  </Grid>
                </Grid>
              </HeroProfileCard>
            </Zoom>

            {/* טאבים ראשיים מעוצבים */}
            <Fade in timeout={1000}>
              <Paper sx={{ 
                borderRadius: 4, 
                overflow: 'hidden', 
                mb: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
                }
              }}>
                <Tabs 
                  value={currentTab} 
                  onChange={(e, newValue) => setCurrentTab(newValue)}
                  variant="fullWidth"
                  sx={{ 
                    borderBottom: '2px solid rgba(76, 181, 195, 0.1)',
                    backgroundColor: 'rgba(76, 181, 195, 0.05)',
                    '& .MuiTab-root': {
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      py: 3,
                      transition: 'all 0.3s ease'
                    },
                    '& .Mui-selected': {
                      color: '#2a8a95 !important',
                      background: 'rgba(76, 181, 195, 0.1)'
                    },
                    '& .MuiTabs-indicator': {
                      height: 4,
                      borderRadius: '4px 4px 0 0',
                      background: 'linear-gradient(90deg, #4cb5c3, #2a8a95)'
                    }
                  }}
                >
                  <Tab 
                    // icon={<PersonIcon />} 
                    label="📋 מידע כללי" 
                    iconPosition="start"
                  />
                  <Tab 
                    // icon={<FolderIcon />} 
                    label="📁 מסמכים וקבצים" 
                    iconPosition="start"
                  />
                </Tabs>

                {/* תוכן הטאבים */}
                <Box sx={{ p: 4 }}>
                  {/* טאב מידע כללי */}
                  {currentTab === 0 && (
                    <Fade in timeout={500}>
                      <Box>
                        <Grid container spacing={4}>
                          {/* פרטים אישיים */}
                          <Grid item xs={12} md={6}>
                            <InfoCard>
                              <CardContent sx={{ p: 4 }}>
                                <SectionHeader>
                                  {/* <PersonIcon sx={{ color: 'primary.main', mr: 2, fontSize: '2rem' }} /> */}
                                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700, fontSize: '1.3rem' }}>
                                    👤 פרטים אישיים
                                  </Typography>
                                </SectionHeader>
                                
                                <Stack spacing={3}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 2, background: 'rgba(76, 181, 195, 0.05)' }}>
                                    {/* <EmailIcon sx={{ color: 'primary.main', mr: 3, fontSize: '1.5rem' }} /> */}
                                    <Box>
                                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                        📧 דוא"ל
                                      </Typography>
                                      <Typography variant="h6" fontWeight={600} sx={{ color: '#2a8a95' }}>
                                        {employee.email || 'לא הוזן'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 2, background: 'rgba(255, 112, 67, 0.05)' }}>
                                    {/* <PhoneIcon sx={{ color: 'secondary.main', mr: 3, fontSize: '1.5rem' }} /> */}
                                    <Box>
                                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                        📱 טלפון נייד
                                      </Typography>
                                      <Typography variant="h6" fontWeight={600} sx={{ color: '#c63f17' }}>
                                        {employee.mobilePhone || 'לא הוזן'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 2, background: 'rgba(16, 185, 129, 0.05)' }}>
                                    <LocationIcon sx={{ color: 'success.main', mr: 3, fontSize: '1.5rem' }} />
                                    <Box>
                                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                        🏠 עיר מגורים
                                      </Typography>
                                      <Typography variant="h6" fontWeight={600} sx={{ color: '#059669' }}>
                                        {employee.cityName || 'לא הוזן'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 2, background: 'rgba(245, 158, 11, 0.05)' }}>
                                    <EventIcon sx={{ color: 'warning.main', mr: 3, fontSize: '1.5rem' }} />
                                    <Box>
                                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                        🎂 תאריך לידה
                                      </Typography>
                                      <Typography variant="h6" fontWeight={600} sx={{ color: '#d97706' }}>
                                        {formatDate(employee.birthDate)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Stack>
                              </CardContent>
                            </InfoCard>
                          </Grid>

                          {/* פרטי עבודה */}
                          <Grid item xs={12} md={6}>
                            <InfoCard>
                              <CardContent sx={{ p: 4 }}>
                                <SectionHeader>
                                  <WorkIcon sx={{ color: 'secondary.main', mr: 2, fontSize: '2rem' }} />
                                  <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 700, fontSize: '1.3rem' }}>
                                    💼 פרטי עבודה
                                  </Typography>
                                </SectionHeader>
                                
                                <Stack spacing={3}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 2, background: 'rgba(76, 181, 195, 0.05)' }}>
                                    <BadgeIcon sx={{ color: 'primary.main', mr: 3, fontSize: '1.5rem' }} />
                                    <Box>
                                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                        🎯 תפקיד
                                      </Typography>
                                      <Typography variant="h6" fontWeight={600} sx={{ color: '#2a8a95' }}>
                                        {employee.roleName || 'לא הוזן'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 2, background: 'rgba(255, 112, 67, 0.05)' }}>
                                    <WorkIcon sx={{ color: 'secondary.main', mr: 3, fontSize: '1.5rem' }} />
                                    <Box>
                                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                        🆔 מספר רישיון
                                      </Typography>
                                      <Typography variant="h6" fontWeight={600} sx={{ color: '#c63f17' }}>
                                        {employee.licenseNum || 'לא הוזן'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 2, background: 'rgba(16, 185, 129, 0.05)' }}>
                                    <EventIcon sx={{ color: 'success.main', mr: 3, fontSize: '1.5rem' }} />
                                    <Box>
                                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                        📅 תחילת עבודה
                                      </Typography>
                                      <Typography variant="h6" fontWeight={600} sx={{ color: '#059669' }}>
                                        {formatDate(employee.startDate)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 2, background: 'rgba(245, 158, 11, 0.05)' }}>
                                    <SecurityIcon sx={{ color: 'warning.main', mr: 3, fontSize: '1.5rem' }} />
                                    <Box>
                                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                        🔐 סטטוס
                                      </Typography>
                                      <Chip
                                        label={employee.isActive ? '✅ עובד פעיל' : '❌ עובד לא פעיל'}
                                        color={employee.isActive ? 'success' : 'error'}
                                        size="medium"
                                        sx={{ 
                                          fontWeight: 700,
                                          fontSize: '1rem'
                                        }}
                                      />
                                    </Box>
                                  </Box>
                                </Stack>
                              </CardContent>
                            </InfoCard>
                          </Grid>
                        </Grid>
                      </Box>
                    </Fade>
                  )}

                  {/* טאב מסמכים */}
                  {currentTab === 1 && (
                    <Fade in timeout={500}>
                      <Box>
                        <EmployeeDocumentManager
                          employeeId={employee.employeeId}
                          employeeName={`${employee.firstName} ${employee.lastName}`}
                          compact={false}
                          showUpload={true}
                          showStats={true}
                        />
                      </Box>
                    </Fade>
                  )}
                </Box>
              </Paper>
            </Fade>

            {/* דיאלוג עריכה מעוצב מדהים */}
            {editMode && (
              <Paper
                sx={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                  zIndex: 9999,
                  backdropFilter: 'blur(15px)',
                  animation: 'fadeIn 0.3s ease-out',
                  '@keyframes fadeIn': {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                  }
                }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setEditMode(false);
                  }
                }}
              >
                <Zoom in={editMode} timeout={500}>
                  <Box
                    sx={{
                      maxWidth: 'md',
                      width: '100%',
                      maxHeight: '90%',
                      overflow: 'auto',
                      backgroundColor: 'background.paper',
                      borderRadius: 6,
                      boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
                      border: '3px solid rgba(76, 181, 195, 0.4)',
                      position: 'relative',
                      background: 'rgba(255, 255, 255, 0.98)',
                      backdropFilter: 'blur(20px)',
                      transform: 'scale(1)',
                      transition: 'all 0.3s ease',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
                        borderRadius: '6px 6px 0 0',
                        animation: 'shimmer 2s infinite',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        right: -2,
                        bottom: -2,
                        background: 'linear-gradient(45deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
                        borderRadius: 8,
                        zIndex: -1,
                        opacity: 0.3,
                        animation: 'glow 3s ease-in-out infinite alternate',
                      },
                      '@keyframes shimmer': {
                        '0%': { backgroundPosition: '0% 50%' },
                        '50%': { backgroundPosition: '100% 50%' },
                        '100%': { backgroundPosition: '0% 50%' },
                      },
                      '@keyframes glow': {
                        '0%': { opacity: 0.3 },
                        '100%': { opacity: 0.6 },
                      }
                    }}
                  >
                    {/* כותרת דיאלוג מעוצבת */}
                    <Box sx={{
                      background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
                      color: 'white',
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: '6px 6px 0 0',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #ff7043, #10b981, #4cb5c3)',
                      }
                    }}>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        <EditIcon sx={{ mr: 2, fontSize: '2rem' }} />
                        ✏️ עריכת פרופיל עובד
                      </Typography>
                      
                      <IconButton
                        onClick={() => setEditMode(false)}
                        sx={{
                          color: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Typography sx={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                          ×
                        </Typography>
                      </IconButton>
                    </Box>

                    {/* תוכן הדיאלוג */}
                    <Box sx={{ p: 3 }}>
                      <Alert 
                        severity="info" 
                        sx={{ 
                          mb: 3,
                          borderRadius: 3,
                          background: 'rgba(76, 181, 195, 0.1)',
                          border: '1px solid rgba(76, 181, 195, 0.3)',
                          '& .MuiAlert-icon': {
                            fontSize: '1.5rem'
                          }
                        }}
                        icon={<AutoAwesomeIcon />}
                      >
                        <Typography variant="body1" fontWeight={600}>
                          💡 עריכת פרטי העובד - {employee.firstName} {employee.lastName}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          ניתן לעדכן את כל הפרטים האישיים והמקצועיים של העובד
                        </Typography>
                      </Alert>

                      <EmployeeForm
                        existingEmployee={employee}
                        onSubmitSuccess={handleEmployeeUpdate}
                        onClose={() => setEditMode(false)}
                      />
                    </Box>
                  </Box>
                </Zoom>
              </Paper>
            )}
          </Container>
        </FullScreenContainer>
      </Box>
    </ThemeProvider>
  );
};

export default EmployeeProfile;