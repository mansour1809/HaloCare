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
  Description as DocumentIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled, alpha } from '@mui/material/styles';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

// Import קומפוננטות
import { useEmployees } from './EmployeesContext';
import EmployeeForm from './EmployeeForm';
import EmployeeDocumentManager from './EmployeeDocumentManager'; // נתאים לעובדים
import { baseURL } from '../../components/common/axiosConfig';

// תמה מותאמת
const profileTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    h4: { fontWeight: 700, fontSize: '2.2rem' },
    h5: { fontWeight: 600, fontSize: '1.8rem' },
    h6: { fontWeight: 600, fontSize: '1.4rem' }
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
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#2d3748',
      secondary: '#718096',
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.3s ease',
        }
      }
    }
  }
});

// אווטאר מעוצב
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: `0 8px 24px rgba(76, 181, 195, 0.3)`,
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 12px 32px rgba(76, 181, 195, 0.4)`,
  }
}));

// כרטיס מידע מעוצב
const InfoCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

// כותרת סקציה מעוצבת
const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5, 0),
  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
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
        <Container maxWidth="lg" dir="rtl" sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            טוען פרטי עובד...
          </Typography>
        </Container>
      </ThemeProvider>
    );
  }

  // עובד לא נמצא
  if (!employee) {
    return (
      <ThemeProvider theme={profileTheme}>
        <Container maxWidth="lg" dir="rtl" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            <Typography variant="h6">עובד לא נמצא</Typography>
            עובד עם מזהה {employeeId} לא נמצא במערכת
          </Alert>
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/employees/list')}
            sx={{ mt: 2 }}
          >
            חזרה לרשימת עובדים
          </Button>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={profileTheme}>
      <Container maxWidth="lg" dir="rtl" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/employees/list')}
            sx={{ p: 0, minWidth: 'auto' }}
          >
            רשימת עובדים
          </Button>
          <Typography color="text.primary" fontWeight={600}>
            פרופיל עובד
          </Typography>
        </Breadcrumbs>

        {/* כרטיס פרופיל עליון */}
        <Zoom in timeout={800}>
          <Paper
            elevation={8}
            sx={{ 
              p: 4, 
              mb: 4,
              background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
              color: 'white',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                transform: 'translate(50%, -50%)',
              }
            }}
          >
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
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                  {employee.firstName} {employee.lastName}
                </Typography>
                
                <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    icon={<WorkIcon />}
                    label={employee.roleName || 'לא הוזן תפקיד'}
                    sx={{
                      backgroundColor: getRoleColor(employee.roleName),
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  />
                 
                  <Chip
                    label={employee.isActive ? 'פעיל' : 'לא פעיל'}
                    color={employee.isActive ? 'success' : 'error'}
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>
                
                <Typography variant="body1" sx={{ opacity: 0.9, fontSize: '1.1rem' }}>
                  ותק: {calculateSeniority(employee.startDate)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={3} textAlign="center">
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      transform: 'translateY(-2px)',
                    },
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    fontSize: '1rem'
                  }}
                >
                  עריכת פרופיל
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Zoom>

        {/* טאבים ראשיים */}
        <Fade in timeout={1000}>
          <Paper sx={{ borderRadius: 4, overflow: 'hidden', mb: 4 }}>
            <Tabs 
              value={currentTab} 
              onChange={(e, newValue) => setCurrentTab(newValue)}
              variant="fullWidth"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  fontSize: '1rem',
                  fontWeight: 600,
                  py: 2
                }
              }}
            >
              <Tab 
                icon={<PersonIcon />} 
                label="מידע כללי" 
                iconPosition="start"
              />
              <Tab 
                icon={<FolderIcon />} 
                label="מסמכים וקבצים" 
                iconPosition="start"
              />
              <Tab 
                icon={<SettingsIcon />} 
                label="הגדרות" 
                iconPosition="start"
                disabled
              />
            </Tabs>

            {/* תוכן הטאבים */}
            <Box sx={{ p: 3 }}>
              {/* טאב מידע כללי */}
              {currentTab === 0 && (
                <Fade in timeout={500}>
                  <Box>
                    <Grid container spacing={3}>
                      {/* פרטים אישיים */}
                      <Grid item xs={12} md={6}>
                        <InfoCard>
                          <CardContent sx={{ p: 3 }}>
                            <SectionHeader>
                              <PersonIcon sx={{ color: 'primary.main', mr: 1 }} />
                              <Typography variant="h6" color="primary.main">
                                פרטים אישיים
                              </Typography>
                            </SectionHeader>
                            
                            <Stack spacing={2}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EmailIcon sx={{ color: 'text.secondary', mr: 2 }} />
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    דוא"ל
                                  </Typography>
                                  <Typography variant="body1" fontWeight={500}>
                                    {employee.email || 'לא הוזן'}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PhoneIcon sx={{ color: 'text.secondary', mr: 2 }} />
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    טלפון נייד
                                  </Typography>
                                  <Typography variant="body1" fontWeight={500}>
                                    {employee.mobilePhone || 'לא הוזן'}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationIcon sx={{ color: 'text.secondary', mr: 2 }} />
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    עיר מגורים
                                  </Typography>
                                  <Typography variant="body1" fontWeight={500}>
                                    {employee.cityName || 'לא הוזן'}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EventIcon sx={{ color: 'text.secondary', mr: 2 }} />
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    תאריך לידה
                                  </Typography>
                                  <Typography variant="body1" fontWeight={500}>
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
                          <CardContent sx={{ p: 3 }}>
                            <SectionHeader>
                              <WorkIcon sx={{ color: 'secondary.main', mr: 1 }} />
                              <Typography variant="h6" color="secondary.main">
                                פרטי עבודה
                              </Typography>
                            </SectionHeader>
                            
                            <Stack spacing={2}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <BadgeIcon sx={{ color: 'text.secondary', mr: 2 }} />
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    תפקיד
                                  </Typography>
                                  <Typography variant="body1" fontWeight={500}>
                                    {employee.roleName || 'לא הוזן'}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <WorkIcon sx={{ color: 'text.secondary', mr: 2 }} />
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    מספר רישיון
                                  </Typography>
                                  <Typography variant="body1" fontWeight={500}>
                                    {employee.licenseNum || 'לא הוזן'}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EventIcon sx={{ color: 'text.secondary', mr: 2 }} />
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    תחילת עבודה
                                  </Typography>
                                  <Typography variant="body1" fontWeight={500}>
                                    {formatDate(employee.startDate)}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <SecurityIcon sx={{ color: 'text.secondary', mr: 2 }} />
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    סטטוס
                                  </Typography>
                                  <Chip
                                    label={employee.isActive ? 'עובד פעיל' : 'עובד לא פעיל'}
                                    color={employee.isActive ? 'success' : 'error'}
                                    size="small"
                                    sx={{ fontWeight: 600 }}
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

              {/* טאב הגדרות */}
              {currentTab === 2 && (
                <Fade in timeout={500}>
                  <Box textAlign="center" py={6}>
                    <SettingsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      טאב הגדרות יגיע בקרוב
                    </Typography>
                  </Box>
                </Fade>
              )}
            </Box>
          </Paper>
        </Fade>

        {/* דיאלוג עריכה */}
        {editMode && (
          <Paper
            sx={{
              position: 'fixed',
              top: 40,
              left: 0,
              right: 0,
              bottom: -40,
              backgroundColor: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setEditMode(false);
              }
            }}
          >
            <Box
              sx={{
                maxWidth: 'md',
                width: '100%',
                maxHeight: '90%',
                overflow: 'auto',
                backgroundColor: 'background.paper',
                borderRadius: 4
              }}
            >
              <EmployeeForm
                existingEmployee={employee}
                onSubmitSuccess={handleEmployeeUpdate}
                onClose={() => setEditMode(false)}
              />
            </Box>
          </Paper>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default EmployeeProfile;