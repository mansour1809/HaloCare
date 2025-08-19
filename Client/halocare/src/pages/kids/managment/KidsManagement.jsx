// src/pages/kids/KidsManagement.jsx
import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, Chip, Button, TextField, Grid, Card,
  CircularProgress, Alert, Breadcrumbs, InputAdornment, IconButton,
  Tooltip, Fab, MenuItem, Select, FormControl, InputLabel, Link,keyframes
} from '@mui/material';
import {
  Home as HomeIcon,
  Group as GroupIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Emergency as EmergencyIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled, alpha } from '@mui/material/styles';

// Redux imports
import { fetchKids } from '../../../Redux/features/kidsSlice';
import { 
  fetchOnboardingStatus,
  selectOnboardingData,
} from '../../../Redux/features/onboardingSlice';
import { fetchParents } from '../../../Redux/features/parentSlice';
import { baseURL } from "../../../components/common/axiosConfig";

// Animation keyframes
const gradientShift = keyframes`
  0% { backgroundPosition: 0% 50%; }
  50% { backgroundPosition: 100% 50%; }
  100% { backgroundPosition: 0% 50%; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

// Enhanced theme matching our style
const rtlTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2.2rem',
    },
    h6: {
      fontWeight: 600,
    }
  },
  palette: {
    primary: {
      main: '#4cb5c3',
      light: '#76d4e0',
      dark: '#2a8a95',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff7043',
      light: '#ff9575',
      dark: '#c8562e',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#065f46',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    }
  }
});

// Enhanced Styled Components
const FullScreenContainer = styled(Box)(() => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 20s ease infinite`,
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
    pointerEvents: 'none',
    zIndex: 1,
  }
}));

const ModernHeader = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  position: 'relative',
  zIndex: 2,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    animation: `${shimmer} 3s ease infinite`,
  }
}));

const StatCard = styled(Card)(({ theme, color }) => ({
  padding: '24px 20px',
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  height: '140px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0 15px 50px rgba(0,0,0,0.15)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette[color]?.main}, ${theme.palette[color]?.light})`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '200%',
    height: '200%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  }
}));

const StyledTableContainer = styled(TableContainer)(() => ({
  borderRadius: 20,
  overflow: 'hidden',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  position: 'relative',
  zIndex: 2,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
  }
}));

const AnimatedButton = styled(Button)(() => ({
  borderRadius: 16,
  padding: '12px 24px',
  fontWeight: 600,
  fontSize: '1rem',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  boxShadow: '0 6px 20px rgba(76, 181, 195, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px) scale(1.02)',
    boxShadow: '0 12px 35px rgba(76, 181, 195, 0.4)',
    background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    transition: 'all 0.5s ease',
  },
  '&:hover::after': {
    left: '100%',
  }
}));

const StyledFab = styled(Fab)(() => ({
  position: 'fixed',
  bottom: 24,
  left: 24,
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  boxShadow: '0 8px 24px rgba(76, 181, 195, 0.4)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  zIndex: 1000,
  animation: `${pulse} 2s infinite`,
  '&:hover': {
    transform: 'scale(1.1) rotate(15deg)',
    boxShadow: '0 12px 32px rgba(76, 181, 195, 0.6)',
    background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
  }
}));

const StyledChip = styled(Chip)(() => ({
  borderRadius: 10,
  fontWeight: 600,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  }
}));

const ContactInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  '& .contact-item': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    '& svg': {
      fontSize: '1rem',
      color: theme.palette.primary.main,
    }
  }
}));
const EnhancedBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  '& .MuiBreadcrumbs-separator': {
    color: theme.palette.primary.main,
  },
  '& .MuiBreadcrumbs-li': {
    '& a': {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      padding: '4px 8px',
      borderRadius: 8,
      '&:hover': {
        background: 'rgba(76, 181, 195, 0.1)',
        transform: 'translateY(-2px)',
      }
    }
  }
}));

const StyledLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    '& svg': {
      transform: 'scale(1.2) rotate(10deg)',
    }
  },
  '& svg': {
    marginRight: theme.spacing(0.5),
    fontSize: 'small',
    transition: 'transform 0.3s ease',
  }
}));

const CurrentPage = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontWeight: 700,
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  '& svg': {
    marginRight: theme.spacing(0.5),
    fontSize: 'small',
    color: theme.palette.primary.main,
  }
}));

// Components remain the same
const OnboardingStatusChip = ({ onboardingData }) => {
  if (!onboardingData) {
    return <StyledChip label="לא התחיל" color="default" variant="outlined" size="small" />;
  }

  const { overallStatus, completedForms, totalForms } = onboardingData;
  
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Completed':
        return { label: 'הושלם', color: 'success', variant: 'filled' };
      case 'InProgress':
        return { label: 'בתהליך', color: 'primary', variant: 'filled' };
      case 'NotStarted':
      default:
        return { label: 'לא התחיל', color: 'default', variant: 'outlined' };
    }
  };

  const config = getStatusConfig(overallStatus);
  
  return (
    <Tooltip placement="top" 
  PopperProps={{
    disablePortal: true,
    modifiers: [
      {
        name: 'flip',
        enabled: false 
      },
      {
        name: 'preventOverflow',
        options: {
          boundary: 'window', 
        },
      },
    ],
  }} title={`${completedForms} מתוך ${totalForms} טפסים הושלמו`}>
      <StyledChip 
        label={config.label} 
        color={config.color} 
        variant={config.variant}
        size="small" 
        sx={{
          background: config.variant === 'filled' ? 
            `linear-gradient(45deg, ${config.color}.main 30%, ${config.color}.light 90%)` : 
            'transparent'
        }}
      />
    </Tooltip>
  );
};

const OnboardingActions = ({ kid, onboardingData, onAction }) => {
  const canStartOnboarding = !onboardingData;

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {canStartOnboarding && (
        <AnimatedButton
          size="small"
          variant="contained"
          onClick={() => onAction('start', kid)}
        >
          התחל קליטה
        </AnimatedButton>
      )}
      
      {onboardingData && (
        <AnimatedButton
          size="small"
          variant="outlined"
          startIcon={<ViewIcon />}
          onClick={() => onAction('view', kid)}
          sx={{
            background: 'transparent',
            border: '2px solid',
            borderColor: 'secondary.main',
            color: 'secondary.main',
            '&:hover': {
              background: alpha('#ff7043', 0.1),
              borderColor: 'secondary.dark',
            }
          }}
        >
         קליטה
        </AnimatedButton>
      )}
    </Box>
  );
};

const KidsManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state 
  const { kids,  error } = useSelector(state => state.kids);
  const { parents } = useSelector(state => state.parent);
  const onboardingData = useSelector(selectOnboardingData);
  
  // Local State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [parentsMap, setParentsMap] = useState({});

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load kids
      const kidsResult = await dispatch(fetchKids()).unwrap();
      
      // Load parents
      const parentsResult = await dispatch(fetchParents()).unwrap();
      
      // Create parents map for quick lookup
      const pMap = {};
      parentsResult.forEach(parent => {
        pMap[parent.parentId] = parent;
      });
      setParentsMap(pMap);
      
      // Load onboarding data
      const onboardingPromises = kidsResult.map(kid => 
        dispatch(fetchOnboardingStatus(kid.id))
          .unwrap()
          .catch(error => {
            console.warn(`Error loading onboarding data for kid ${kid.id}:`, error);
            return null; 
          })
      );
      
      await Promise.allSettled(onboardingPromises);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };



  const calculateAge = (birthDate) => {
    if (!birthDate) return '–';
    
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInMs = today - birth;
    const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
    
    if (ageInDays < 30) {
      return `${ageInDays} ימים`;
    } else if (ageInDays < 365) {
      const months = Math.floor(ageInDays / 30);
      return `${months} חודשים`;
    } else {
      const years = Math.floor(ageInDays / 365);
      const months = Math.floor((ageInDays % 365) / 30);
      return months > 0 ? `${years} שנים ו-${months} חודשים` : `${years} שנים`;
    }
  };

  const filteredKids = kids.filter(kid => {
    const searchMatch = !searchTerm || 
      (kid.firstName && kid.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (kid.lastName && kid.lastName.toLowerCase().includes(searchTerm.toLowerCase())) || (kid.id && kid.id.toString().includes(searchTerm));

    const kidOnboardingData = onboardingData[kid.id];
    const overallStatus = kidOnboardingData?.overallStatus || 'NotStarted';
    const statusMatch = !statusFilter || overallStatus === statusFilter;
    
    return searchMatch && statusMatch;
  });

  const handleAction = (action, kid) => {
    switch (action) {
      case 'start':
        navigate(`/kids/onboarding/${kid.id}`);
        break;
      case 'continue':
      case 'view':
        navigate(`/kids/onboarding/${kid.id}`);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  };

  const stats = {
    total: kids.length,
    completed: Object.values(onboardingData).filter(data => data?.overallStatus === 'Completed').length,
    inProgress: Object.values(onboardingData).filter(data => data?.overallStatus === 'InProgress').length,
    notStarted: kids.length - Object.keys(onboardingData).filter(kidId => onboardingData[kidId]).length
  };

  // Get parent phone number
  const getParentPhone = (kid) => {
    const parent1 = parentsMap[kid.parentId1];
    const parent2 = parentsMap[kid.parentId2];
    
    if (parent1?.mobilePhone) return parent1.mobilePhone;
    if (parent2?.mobilePhone) return parent2.mobilePhone;
    if (parent1?.homePhone) return parent1.homePhone;
    if (parent2?.homePhone) return parent2.homePhone;
    return null;
  };
const getParentName = (kid) => {
  const parent1 = parentsMap[kid.parentId1];
  const parent2 = parentsMap[kid.parentId2];

  if (parent1?.firstName) return `${parent1.firstName} ${parent1.lastName}`;
  if (parent2?.firstName) return `${parent2.firstName} ${parent2.lastName}`;
  return 'Unknown';
};

  return (
    <ThemeProvider theme={rtlTheme}>
      <FullScreenContainer>
        <Box sx={{ p: 3, position: 'relative', zIndex: 2 }} dir="rtl">
          {/* Breadcrumbs */}
           <EnhancedBreadcrumbs>
                    <StyledLink
                      underline="hover"
                      onClick={() => navigate('/')}
                    >
                      <HomeIcon />
                      ראשי
                    </StyledLink>
                    
                
                    <CurrentPage>
                      <GroupIcon />
                      ניהול ילדים
                    </CurrentPage>
                  </EnhancedBreadcrumbs>

       
          {/* Header Section */}
          <ModernHeader>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: '700', 
                  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}>
                  ניהול ילדים
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  מעקב אחר תהליכי קליטה וניהול פרטי ילדים במערכת
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <AnimatedButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/kids/onboarding/new')}
                >
                  קליטת ילד חדש
                </AnimatedButton>
              </Box>
            </Box>
            
            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <TextField
                size="small"
                placeholder="חיפוש לפי שם או תז..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          '&:hover fieldset': {
                            borderColor: '#4cb5c3',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#4cb5c3',
                            borderWidth: 2,
                          }
                        }
                      }}
              />
              
              <FormControl size="small" sx={{ width: 200 }}>
                <InputLabel>סינון לפי סטטוס</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="סינון לפי סטטוס"
                  sx={{
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <MenuItem value="">הכל</MenuItem>
                  <MenuItem value="Completed">הושלם</MenuItem>
                  <MenuItem value="InProgress">בתהליך</MenuItem>
                  <MenuItem value="NotStarted">לא התחיל</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </ModernHeader>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item size={{xs:12,sm:3}}>
              <StatCard color="primary">
                <Typography variant="h3" color="primary.main" fontWeight="bold">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  סה"כ ילדים
                </Typography>
              </StatCard>
            </Grid>
            <Grid item size={{xs:12,sm:3}}>
              <StatCard color="success">
                <Typography variant="h3" color="success.main" fontWeight="bold">
                  {stats.completed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  הושלמו
                </Typography>
              </StatCard>
            </Grid>
            <Grid item size={{xs:12,sm:3}}>
              <StatCard color="secondary">
                <Typography variant="h3" color="secondary.main" fontWeight="bold">
                  {stats.inProgress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  בתהליך
                </Typography>
              </StatCard>
            </Grid>
            <Grid item size={{xs:12,sm:3}}>
              <StatCard color="info">
                <Typography variant="h3" color="info.main" fontWeight="bold">
                  {stats.notStarted}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  לא התחילו
                </Typography>
              </StatCard>
            </Grid>
          </Grid>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          {/* Kids Table - Optimized columns */}
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: 'rgba(76, 181, 195, 0.1)',
                  '& .MuiTableCell-head': {
                    fontWeight: 700,
                    color: 'primary.main',
                    fontSize: '0.95rem'
                  }
                }}>
                  <TableCell align="center">👦 ילד</TableCell>
                  <TableCell>🎂 גיל</TableCell>
                  <TableCell>📞 טלפון חירום</TableCell>
                  <TableCell>👪 הורה ראשי</TableCell>
                  <TableCell>🚀 סטטוס קליטה</TableCell>
                  <TableCell>⚡ פעולות</TableCell>
                  <TableCell align="center">👁️ פרופיל</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <CircularProgress sx={{ color: 'primary.main' }} />
                    </TableCell>
                  </TableRow>
                ) : filteredKids.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        לא נמצאו ילדים
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredKids.map((kid) => {
                    const kidOnboardingData = onboardingData[kid.id];
                    const parentPhone = getParentPhone(kid);
                    const parentName = getParentName(kid);

                    return (
                      <TableRow 
                        key={kid.id} 
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(76, 181, 195, 0.05)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {/* Child info with photo */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              src={
                                kid.photoPath
                                  ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(kid.photoPath)}`
                                  : ''
                              }  
                              alt={`${kid.firstName} ${kid.lastName}`}
                              sx={{
                                width: 50,
                                height: 50,
                                ml: 1,
                                border: "3px solid #fff",
                                boxShadow: "0 4px 12px rgba(76, 181, 195, 0.3)",
                                background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  boxShadow: "0 6px 16px rgba(76, 181, 195, 0.4)",
                                }
                              }}
                            >
                              {!kid.photoPath && (
                                <>
                                  {`${kid.firstName?.[0] || ''}${kid.lastName?.[0] || ''}`}
                                </>
                              )}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600} sx={{ mb: 0.5 }}>
                                {`${kid.firstName || ''} ${kid.lastName || ''}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ת.ז: {kid.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        
                        {/* Age */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {calculateAge(kid.birthDate)}
                          </Typography>
                        </TableCell>
                        
                        {/* Emergency Contact */}
                        <TableCell>
                          <ContactInfo>
                            {kid.emergencyContact && (
                              <Box className="contact-item">
                                <EmergencyIcon sx={{ color: 'error.main !important' }} />
                                <Typography variant="body2">
                                  {kid.emergencyContact}
                                </Typography>
                              </Box>
                            )}
                            {parentPhone && !kid.emergencyContact && (
                              <Box className="contact-item">
                                <PhoneIcon />
                                <Typography variant="body2">
                                  {parentPhone}
                                </Typography>
                              </Box>
                            )}
                            {!kid.emergencyContact && !parentPhone && (
                              <Typography variant="body2" color="text.disabled">
                                –
                              </Typography>
                            )}
                          </ContactInfo>
                        </TableCell>
                        
                        {/* Parent Name */}
                        <TableCell>
                          <Typography variant="body2">
                            {parentName || '–'}
                          </Typography>
                        </TableCell>
                        
                        {/* Onboarding Status */}
                        <TableCell>
                          <OnboardingStatusChip onboardingData={kidOnboardingData} />
                        </TableCell>
                        
                        {/* Actions */}
                        <TableCell>
                          <OnboardingActions
                            kid={kid}
                            onboardingData={kidOnboardingData}
                            onAction={handleAction}
                          />
                        </TableCell>
                        
                        {/* Profile Button */}
                        <TableCell align="center">
                          <Tooltip placement="top" 
  PopperProps={{
    disablePortal: true,
    modifiers: [
      {
        name: 'flip',
        enabled: false 
      },
      {
        name: 'preventOverflow',
        options: {
          boundary: 'window', 
        },
      },
    ],
  }} title="פרופיל ילד">
                            <IconButton
                              sx={{
                                width: 45,
                                height: 45,
                                background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                                color: "white",
                                transition: "all 0.3s ease",
                                boxShadow: '0 4px 12px rgba(76, 181, 195, 0.3)',
                                "&:hover": { 
                                  background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
                                  transform: 'scale(1.1) rotate(10deg)',
                                  boxShadow: '0 6px 20px rgba(76, 181, 195, 0.4)',
                                },
                              }}
                              onClick={() => navigate(`/kids/${kid.id}`)}
                            >
                              <PersonIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>

          {/* Floating Action Button */}
          <StyledFab
            color="primary"
            onClick={() => navigate('/kids/onboarding/new')}
          >
            <AddIcon />
          </StyledFab>
        </Box>
      </FullScreenContainer>
    </ThemeProvider>
  );
};

export default KidsManagement;