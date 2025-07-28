// src/pages/kids/KidsManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, Chip, Button, TextField, Grid, Card,
  CircularProgress, Alert, Breadcrumbs, InputAdornment, IconButton,
  Tooltip, Fab, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import {
  Home as HomeIcon,
  Group as GroupIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled, alpha } from '@mui/material/styles';

// New Redux
import { fetchKids } from '../../Redux/features/kidsSlice';
import { 
  fetchOnboardingStatus,
  selectOnboardingData,
  selectOnboardingStats 
} from '../../Redux/features/onboardingSlice';
import { baseURL } from "../../components/common/axiosConfig";

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
    background: {
      default: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          overflow: 'visible',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
            borderRadius: '20px 20px 0 0',
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
          boxShadow: '0 6px 20px rgba(76, 181, 195, 0.3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
            boxShadow: '0 12px 35px rgba(76, 181, 195, 0.4)',
          }
        }
      }
    }
  }
});

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

// Modern Header
const ModernHeader = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
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
    borderRadius: '20px 20px 0 0',
  }
}));

// Stat Card
const StatCard = styled(Card)(({ theme, color }) => ({
  padding: '24px 20px',
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  height: '140px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette[color]?.main}, ${theme.palette[color]?.light})`,
    borderRadius: '20px 20px 0 0',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '200%',
    height: '200%',
    background: `radial-gradient(circle, ${alpha(theme.palette[color]?.main, 0.1)} 0%, transparent 70%)`,
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  }
}));

//Styled Table Container 
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
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

// Animated Button
const AnimatedButton = styled(Button)(({ theme }) => ({
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
    transform: 'translateY(-3px)',
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
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'all 0.5s ease',
  },
  '&:hover::after': {
    left: '100%',
  }
}));

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 24,
  left: 24,
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  boxShadow: '0 8px 24px rgba(76, 181, 195, 0.4)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  zIndex: 1000,
  '&:hover': {
    transform: 'scale(1.1) rotate(15deg)',
    boxShadow: '0 12px 32px rgba(76, 181, 195, 0.6)',
    background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
  }
}));

const OnboardingStatusChip = ({ onboardingData }) => {
  if (!onboardingData) {
    return <Chip label="לא התחיל" color="default" variant="outlined" size="small" />;
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
    <Tooltip PopperProps={{ disablePortal: true }} title={`${completedForms} מתוך ${totalForms} טפסים הושלמו`}>
      <Chip 
        label={config.label} 
        color={config.color} 
        variant={config.variant}
        size="small" 
      />
    </Tooltip>
  );
};

const DetailedProgress = ({ onboardingData }) => {
  if (!onboardingData) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          –
        </Typography>
      </Box>
    );
  }

  const { completedForms, totalForms } = onboardingData;
  const completionPercentage = totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0;

  const statusCounts = {
    completed: onboardingData.forms?.filter(f => ['Completed', 'CompletedByParent'].includes(f.status)).length || 0,
    inProgress: onboardingData.forms?.filter(f => f.status === 'InProgress').length || 0,
    sentToParent: onboardingData.forms?.filter(f => f.status === 'SentToParent').length || 0,
  };

  return (
    <Box sx={{ minWidth: 150 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box 
          sx={{ 
            width: 100, 
            height: 8, 
            backgroundColor: 'grey.200', 
            borderRadius: 4,
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              width: `${completionPercentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4cb5c3, #10b981)',
              borderRadius: 'inherit',
              transition: 'width 0.3s ease'
            }}
          />
        </Box>
        <Typography variant="body2" fontWeight="bold">
          {completionPercentage}%
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {statusCounts.completed > 0 && (
          <Chip 
            label={`✅ ${statusCounts.completed}`} 
            size="small" 
            color="success" 
            variant="outlined"
          />
        )}
        {statusCounts.inProgress > 0 && (
          <Chip 
            label={`⚡ ${statusCounts.inProgress}`} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        )}
        {statusCounts.sentToParent > 0 && (
          <Chip 
            label={`📧 ${statusCounts.sentToParent}`} 
            size="small" 
            color="info" 
            variant="outlined"
          />
        )}
      </Box>
    </Box>
  );
};

const OnboardingActions = ({ kid, onboardingData, onAction }) => {
  const canStartOnboarding = !onboardingData;
  const canContinue = onboardingData && onboardingData.overallStatus === 'InProgress';
  const isCompleted = onboardingData && onboardingData.overallStatus === 'Completed';

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {canStartOnboarding && (
        <AnimatedButton
          size="small"
          variant="contained"
          color="primary"
          onClick={() => onAction('start', kid)}
        >
          התחל קליטה
        </AnimatedButton>
      )}
      
      {onboardingData && (
        <AnimatedButton
          size="small"
          variant="outlined"
          color="secondary"
          startIcon={<ViewIcon />}
          onClick={() => onAction('view', kid)}
        >
          צפייה בקליטה
        </AnimatedButton>
      )}
    </Box>
  );
};

const KidsManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // New Redux state 
  const { kids, status, error } = useSelector(state => state.kids);
  const onboardingData = useSelector(selectOnboardingData);
  const onboardingStats = useSelector(selectOnboardingStats);
  
  // Local State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    setLoading(true);
    try {
      const kidsResult = await dispatch(fetchKids()).unwrap();
      
      const onboardingPromises = kidsResult.map(kid => 
        dispatch(fetchOnboardingStatus(kid.id))
          .unwrap()
          .catch(error => {
            console.warn(`שגיאה בטעינת נתוני קליטה לילד ${kid.id}:`, error);
            return null; 
          })
      );
      
      await Promise.allSettled(onboardingPromises);
      
    } catch (error) {
      console.error('שגיאה בטעינת נתונים:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadData();
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
      (kid.lastName && kid.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
        console.warn('פעולה לא מוכרת:', action);
    }
  };

  const stats = {
    total: kids.length,
    completed: Object.values(onboardingData).filter(data => data?.overallStatus === 'Completed').length,
    inProgress: Object.values(onboardingData).filter(data => data?.overallStatus === 'InProgress').length,
    notStarted: kids.length - Object.keys(onboardingData).filter(kidId => onboardingData[kidId]).length
  };

  return (
    <ThemeProvider theme={rtlTheme}>
      <FullScreenContainer>
        <Box sx={{ p: 3, position: 'relative', zIndex: 2 }} dir="rtl">
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 2, color: 'white' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.8)',
                '&:hover': { color: 'white' }
              }}
              onClick={() => navigate('/')}
            >
              <HomeIcon sx={{ mr: 0.5, fontSize: 'small' }} />
              ראשי
            </Box>
            <Typography color="white" sx={{ display: 'flex', alignItems: 'center' }}>
              <GroupIcon sx={{ mr: 0.5, fontSize: 'small' }} />
              ניהול ילדים
            </Typography>
          </Breadcrumbs>
          
          {/* Title and Actions */}
          <ModernHeader>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: '700', 
                  color: 'white', 
                  mb: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                 👦 ניהול ילדים
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  מעקב אחר תהליכי קליטה וניהול פרטי ילדים במערכת
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Tooltip PopperProps={{ disablePortal: true }} title="רענון נתונים">
                  <IconButton 
                    onClick={handleRefresh} 
                    disabled={loading}
                    sx={{
                      background: 'rgba(3, 129, 146, 0.27)',
                      color: 'white',
                      '&:hover': {
                        background: 'rgba(237, 246, 247, 0.78)',
                        transform: 'rotate(180deg)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                
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
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                size="small"
                placeholder="חיפוש לפי שם..."
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
                  width: 300,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)'
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

          {/* Statistics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item size={{xs:12, sm:3}}>
              <StatCard color="primary">
                <Typography variant="h3" color="primary.main" fontWeight="bold">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  סה"כ ילדים
                </Typography>
              </StatCard>
            </Grid>
            <Grid item size={{xs:12, sm:3}}>
              <StatCard color="success">
                <Typography variant="h3" color="success.main" fontWeight="bold">
                  {stats.completed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  הושלמו
                </Typography>
              </StatCard>
            </Grid>
            <Grid item size={{xs:12, sm:3}}>
              <StatCard color="secondary">
                <Typography variant="h3" color="secondary.main" fontWeight="bold">
                  {stats.inProgress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  בתהליך
                </Typography>
              </StatCard>
            </Grid>
            <Grid item size={{xs:12, sm:3}}>
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

          {/* Errors */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          {/* Kids Table */}
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: 'rgba(76, 181, 195, 0.1)',
                  '& .MuiTableCell-head': {
                    fontWeight: 700,
                    color: 'primary.main'
                  }
                }}>
                  <TableCell>👦 שם מלא</TableCell>
                  <TableCell>🎂 גיל</TableCell>
                  <TableCell>🆔 ת"ז</TableCell>
                  <TableCell>👤 מגדר</TableCell>
                  <TableCell>👪 הורה ראשי</TableCell>
                  <TableCell>🚀 סטטוס קליטה</TableCell>
                  <TableCell>⏳ התקדמות מפורטת</TableCell>
                  <TableCell>👁️ צפייה בקליטה</TableCell>
                  <TableCell>⚡ פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <CircularProgress sx={{ color: 'primary.main' }} />
                    </TableCell>
                  </TableRow>
                ) : filteredKids.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        לא נמצאו ילדים
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredKids.map((kid) => {
                    const kidOnboardingData = onboardingData[kid.id];
                    
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
                            <Typography fontWeight="medium">
                              {`${kid.firstName || ''} ${kid.lastName || ''}`}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{calculateAge(kid.birthDate)}</TableCell>
                        <TableCell>{kid.id}</TableCell>
                        <TableCell>
                          <Chip 
                            label={kid.gender === 'זכר' ? 'זכר' : 'נקבה'} 
                            size="small"
                            color={kid.gender === 'זכר' ? 'primary' : 'secondary'}
                            sx={{ 
                              fontWeight: 600,
                              borderRadius: 2 
                            }}
                          />
                        </TableCell>
                        <TableCell>{kid.parentName1 || '–'}</TableCell>
                        <TableCell>
                          <OnboardingStatusChip onboardingData={kidOnboardingData} />
                        </TableCell>
                        <TableCell>
                          <DetailedProgress onboardingData={kidOnboardingData} />
                        </TableCell>
                        <TableCell>
                          <OnboardingActions
                            kid={kid}
                            onboardingData={kidOnboardingData}
                            onAction={handleAction}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip PopperProps={{ disablePortal: true }} title="פרופיל ילד">
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
                                  transform: 'scale(1.1)',
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

          {/* Floating Button */}
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