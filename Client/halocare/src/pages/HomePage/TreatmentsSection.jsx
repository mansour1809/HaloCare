import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Stack,
  Divider,
  Tooltip,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  LinearProgress,
  Alert,
  Fade,
  Zoom,
  Container,
  Rating
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  MedicalServices as TreatmentIcon,
  Person as PersonIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  CheckCircle as CompletedIcon,
  AccessTime as TimeIcon,
  Analytics as AnalyticsIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  LocalHospital as HospitalIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { fetchTreatmentsByKid } from '../../Redux/features/treatmentsSlice';
import { fetchTreatmentTypes } from '../../Redux/features/treatmentTypesSlice';
import { fetchKids } from '../../Redux/features/kidsSlice';
import { fetchEmployees } from '../../Redux/features/employeesSlice';
import Swal from 'sweetalert2';
import  {baseURL} from '../../components/common/axiosConfig';


// 🎨 Stunning animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.3); }
  50% { box-shadow: 0 0 30px rgba(76, 175, 80, 0.6), 0 0 40px rgba(76, 175, 80, 0.4); }
`;

// 🎭 Styled Components
const GradientContainer = styled(Container)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
  minHeight: '100vh',
  padding: theme.spacing(3),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '200px',
    background: 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(129,199,132,0.1) 100%)',
    borderRadius: '0 0 30px 30px',
    zIndex: 0,
  }
}));

const MainCard = styled(Card)(() => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.2)',
  border: 'none',
  position: 'relative',
  zIndex: 1,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: 'linear-gradient(90deg, #4caf50, #81c784, #a5d6a7)',
    borderRadius: '24px 24px 0 0',
  }
}));

const StatsCard = styled(Card)(({ color = '#4caf50' }) => ({
  background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
  borderRadius: '20px',
  border: `2px solid ${color}20`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 20px 40px ${color}30`,
    animation: `${glow} 2s infinite`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
    animation: `${shimmer} 3s infinite`,
  }
}));

const TreatmentCard = styled(Card)(({ treatmentColor = '#4caf50' }) => ({
  background: `linear-gradient(135deg, ${treatmentColor}15 0%, ${treatmentColor}05 100%)`,
  borderRadius: '16px',
  border: `2px solid ${treatmentColor}30`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-6px) scale(1.02)',
    boxShadow: `0 15px 35px ${treatmentColor}40`,
    border: `2px solid ${treatmentColor}60`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    background: treatmentColor,
    borderRadius: '0 2px 2px 0',
  }
}));

const GlowingButton = styled(Button)(({ glowColor = '#4caf50' }) => ({
  borderRadius: '16px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${glowColor} 0%, ${glowColor}dd 100%)`,
  boxShadow: `0 8px 25px ${glowColor}40`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 15px 35px ${glowColor}60`,
    animation: `${pulse} 1.5s infinite`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  }
}));

const FloatingAvatar = styled(Avatar)(({ status }) => {
  const getStatusColor = () => {
    switch(status) {
      case 'completed': return '#4caf50';
      case 'inProgress': return '#ff9800';
      case 'pending': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  return {
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: `linear-gradient(135deg, ${getStatusColor()} 0%, ${getStatusColor()}dd 100%)`,
    border: '3px solid rgba(255,255,255,0.8)',
    boxShadow: `0 8px 25px ${getStatusColor()}40`,
    '&:hover': {
      transform: 'scale(1.15) rotate(5deg)',
      animation: `${float} 2s ease-in-out infinite`,
      boxShadow: `0 15px 35px ${getStatusColor()}60`,
    }
  };
});

const TreatmentsSection = ({ onNavigateToTreatment }) => {
  const dispatch = useDispatch();
  
  // Redux state
  const { treatmentTypes, status: treatmentTypesStatus } = useSelector(state => state.treatmentTypes);
  const { treatments, status: treatmentsStatus } = useSelector(state => state.treatments);
  const { kids } = useSelector(state => state.kids);
  const { employees } = useSelector(state => state.employees);
  
  // Local state
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [treatmentDetailsDialog, setTreatmentDetailsDialog] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loadingTreatments, setLoadingTreatments] = useState(false);

  // Load data on mount
  useEffect(() => {
    dispatch(fetchTreatmentTypes());
    dispatch(fetchKids());
    dispatch(fetchEmployees());
  }, [dispatch]);

  // Load treatments for all active kids
  useEffect(() => {
    const loadTreatmentsForAllKids = async () => {
      if (!kids?.length) return;
      
      setLoadingTreatments(true);
      const activeKids = kids.filter(kid => kid.isActive);
      
      try {
        // Load treatments for each active kid
        for (const kid of activeKids) {
          console.log(kid)
          await dispatch(fetchTreatmentsByKid({ kidId: kid.id }));
        }
      } catch (error) {
        console.error('Error loading treatments:', error);
      } finally {
        setLoadingTreatments(false);
      }
    };

    loadTreatmentsForAllKids();
  }, [kids, dispatch]);

  // Auto refresh every 10 minutes
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      dispatch(fetchTreatmentTypes());
    }, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, dispatch]);

  // Process treatments for today
  const todaysTreatments = useMemo(() => {
    if (!treatments?.length || !kids?.length || !employees?.length || !treatmentTypes?.length) {
      return [];
    }

    const today = new Date();
    const todayString = today.toDateString();

    return treatments
      .filter(treatment => {
        const treatmentDate = new Date(treatment.treatmentDate);
        return treatmentDate.toDateString() === todayString;
      })
      .map(treatment => {
        const kid = kids.find(k => k.id === treatment.kidId);
        const employee = employees.find(e => e.employeeId === treatment.employeeId);
        const treatmentType = treatmentTypes.find(t => t.treatmentTypeId === treatment.treatmentTypeId);
        
        // Determine status based on time and cooperation level
        const treatmentTime = new Date(treatment.treatmentDate);
        const now = new Date();
        
        let status = 'pending';
        if (treatmentTime < now) {
          status = treatment.cooperationLevel > 0 ? 'completed' : 'completed'; // If has cooperation level, it's completed
        } else if (Math.abs(treatmentTime - now) < 2 * 60 * 60 * 1000) { // Within 2 hours
          status = 'inProgress';
        }

        return {
          ...treatment,
          kid,
          employee,
          treatmentType,
          status
        };
      })
      .sort((a, b) => new Date(a.treatmentDate) - new Date(b.treatmentDate));
  }, [treatments, kids, employees, treatmentTypes]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalToday = todaysTreatments.length;
    const completed = todaysTreatments.filter(t => t.status === 'completed').length;
    const pending = todaysTreatments.filter(t => t.status === 'pending').length;
    const inProgress = todaysTreatments.filter(t => t.status === 'inProgress').length;
    
    const avgCooperation = todaysTreatments.length > 0 
      ? todaysTreatments.reduce((sum, t) => sum + (t.cooperationLevel || 0), 0) / todaysTreatments.length 
      : 0;
    
    const activeTherapists = new Set(todaysTreatments.map(t => t.employeeId)).size;
    
    const treatmentTypeStats = {};
    todaysTreatments.forEach(treatment => {
      const typeName = treatment.treatmentType?.treatmentTypeName || 'לא ידוע';
      treatmentTypeStats[typeName] = (treatmentTypeStats[typeName] || 0) + 1;
    });
    
    return {
      totalToday,
      completed,
      pending,
      inProgress,
      avgCooperation,
      activeTherapists,
      treatmentTypeStats
    };
  }, [todaysTreatments]);

  const handleTreatmentClick = (treatment) => {
    setSelectedTreatment(treatment);
    setTreatmentDetailsDialog(true);
  };

  const handleNavigateToFull = () => {
    Swal.fire({
      title: '🏥 מסך טיפולים מלא',
      html: `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 18px; margin-bottom: 15px; color: #4caf50; font-weight: bold;">
            עבור למסך הטיפולים המלא
          </div>
          <div style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            במסך המלא תוכל לראות את כל הטיפולים,<br>
            לערוך טיפולים, לצפות בהיסטוריה מלאה ולנהל מטפלים.
          </div>
          <div style="font-size: 14px; color: #6b7280; background: #f3f4f6; padding: 15px; border-radius: 10px;">
            💡 <strong>טיפ:</strong> במסך המלא תוכל גם לייצא דוחות, לנתח מגמות ולתכנן טיפולים עתידיים
          </div>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: '🏥 עבור למסך מלא',
      cancelButtonText: '❌ ביטול',
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'swal-rtl'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Navigate to full treatments screen
        console.log('Navigate to full treatments screen');
      }
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'completed': return 'הושלם';
      case 'inProgress': return 'בביצוע';
      case 'pending': return 'ממתין';
      default: return 'לא ידוע';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CompletedIcon />;
      case 'inProgress': return <ScheduleIcon />;
      case 'pending': return <TimeIcon />;
      default: return <WarningIcon />;
    }
  };

  const isLoading = treatmentTypesStatus === 'loading' || treatmentsStatus === 'loading' || loadingTreatments;

  return (
    <GradientContainer maxWidth="xl" dir="rtl">
      <Fade in timeout={800}>
        <MainCard elevation={0}>
          {/* Header */}
          <Box sx={{ 
            p: 4,
            background: 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(129,199,132,0.1) 100%)',
            borderRadius: '24px 24px 0 0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><defs><pattern id=\'grain\' width=\'100\' height=\'100\' patternUnits=\'userSpaceOnUse\'><circle cx=\'50\' cy=\'50\' r=\'1\' fill=\'%234caf50\' opacity=\'0.1\'/></pattern></defs><rect width=\'100\' height=\'100\' fill=\'url(%23grain)\'/></svg>")',
              opacity: 0.3
            }} />
            
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} sx={{ position: 'relative', zIndex: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Zoom in timeout={600}>
                  <Avatar sx={{ 
                    width: 70, 
                    height: 70,
                    background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                    boxShadow: '0 10px 30px rgba(76, 175, 80, 0.4)',
                    animation: `${float} 3s ease-in-out infinite`
                  }}>
                    <TreatmentIcon sx={{ fontSize: '2rem' }} />
                  </Avatar>
                </Zoom>
                <Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}>
                    טיפולים 🏥
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip 
                      icon={<TodayIcon />}
                      label={`${stats.totalToday} טיפולים היום`}
                      color="primary"
                      variant="outlined"
                      sx={{ animation: `${pulse} 2s infinite` }}
                    />
                    {stats.avgCooperation > 0 && (
                      <Chip 
                        icon={<StarIcon />}
                        label={`ממוצע שיתוף פעולה: ${stats.avgCooperation.toFixed(1)}/5`}
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>
              
              <Stack direction="row" spacing={2}>
                <IconButton
                  onClick={() => {
                    dispatch(fetchTreatmentTypes());
                    dispatch(fetchKids());
                    dispatch(fetchEmployees());
                  }}
                  sx={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': { background: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
                
                <GlowingButton
                  startIcon={<AnalyticsIcon />}
                  onClick={handleNavigateToFull}
                  glowColor="#ff9800"
                >
                  מסך טיפולים מלא
                </GlowingButton>
              </Stack>
            </Stack>

            {/* Stats Overview */}
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Zoom in timeout={800}>
                  <StatsCard color="#4caf50">
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                        <Avatar sx={{ 
                          width: 50, 
                          height: 50,
                          background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)'
                        }}>
                          <CompletedIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: '#4caf50' }}>
                            {stats.completed}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            הושלמו
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </StatsCard>
                </Zoom>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Zoom in timeout={1000}>
                  <StatsCard color="#ff9800">
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                        <Avatar sx={{ 
                          width: 50, 
                          height: 50,
                          background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)'
                        }}>
                          <ScheduleIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: '#ff9800' }}>
                            {stats.inProgress}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            בביצוע
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </StatsCard>
                </Zoom>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Zoom in timeout={1200}>
                  <StatsCard color="#2196f3">
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                        <Avatar sx={{ 
                          width: 50, 
                          height: 50,
                          background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)'
                        }}>
                          <TimeIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: '#2196f3' }}>
                            {stats.pending}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            ממתינים
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </StatsCard>
                </Zoom>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Zoom in timeout={1400}>
                  <StatsCard color="#9c27b0">
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                        <Avatar sx={{ 
                          width: 50, 
                          height: 50,
                          background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)'
                        }}>
                          <PeopleIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                            {stats.activeTherapists}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            מטפלים פעילים
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </StatsCard>
                </Zoom>
              </Grid>
            </Grid>

            {/* Treatment Types Distribution */}
            {Object.keys(stats.treatmentTypeStats).length > 0 && (
              <Paper elevation={1} sx={{ 
                p: 3, 
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#4caf50', fontWeight: 700 }}>
                  📊 התפלגות סוגי טיפולים היום
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  {Object.entries(stats.treatmentTypeStats).map(([type, count]) => (
                    <Chip
                      key={type}
                      label={`${type}: ${count}`}
                      variant="outlined"
                      sx={{ 
                        fontWeight: 600,
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    />
                  ))}
                </Stack>
              </Paper>
            )}
          </Box>

          {/* Loading Bar */}
          {isLoading && (
            <LinearProgress 
              sx={{ 
                height: 4,
                background: 'linear-gradient(90deg, #4caf50, #81c784)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #66bb6a, #a5d6a7)'
                }
              }} 
            />
          )}

          {/* Today's Treatments */}
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ 
              fontWeight: 700,
              color: '#4caf50',
              mb: 3,
              textAlign: 'center'
            }}>
              🏥 טיפולים היום
            </Typography>
            
            {todaysTreatments.length > 0 ? (
              <Grid container spacing={3}>
                {todaysTreatments.map((treatment, index) => (
                  <Grid item xs={12} md={6} lg={4} key={treatment.treatmentId}>
                    <Zoom in timeout={1000 + index * 200}>
                      <TreatmentCard 
                        treatmentColor={treatment.treatmentType?.treatmentColor || '#4caf50'}
                        onClick={() => handleTreatmentClick(treatment)}
                      >
                        <CardContent sx={{ p: 3 }}>
                          {/* Treatment Header */}
                          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                            <FloatingAvatar status={treatment.status} sx={{ width: 50, height: 50 }}>
                              <HospitalIcon />
                            </FloatingAvatar>
                            <Box flex={1}>
                              <Typography variant="h6" fontWeight="bold" gutterBottom>
                                {treatment.treatmentType?.treatmentTypeName || 'טיפול'}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip 
                                  icon={getStatusIcon(treatment.status)}
                                  label={getStatusText(treatment.status)}
                                  size="small"
                                  color={treatment.status === 'completed' ? 'success' : 
                                         treatment.status === 'inProgress' ? 'warning' : 'info'}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {formatTime(treatment.treatmentDate)}
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>

                          {/* Kid and Therapist Info */}
                          <Box mb={2}>
                            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                              <Avatar 
                                sx={{ width: 32, height: 32 }}
                                src={
                                  treatment.kid?.photoPath
                                    ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(treatment.kid.photoPath)}`
                                    : ''
                                }
                              >
                                {!treatment.kid?.photoPath && treatment.kid?.firstName?.[0]}
                              </Avatar>
                              <Typography variant="body2" fontWeight={600}>
                                {treatment.kid ? `${treatment.kid.firstName} ${treatment.kid.lastName}` : 'ילד לא ידוע'}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
                                <PersonIcon sx={{ fontSize: '1rem' }} />
                              </Avatar>
                              <Typography variant="caption" color="text.secondary">
                                מטפל: {treatment.employee ? `${treatment.employee.firstName} ${treatment.employee.lastName}` : 'לא ידוע'}
                              </Typography>
                            </Stack>
                          </Box>

                          {/* Cooperation Level */}
                          {treatment.cooperationLevel > 0 && (
                            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                              <Typography variant="caption" color="text.secondary">
                                שיתוף פעולה:
                              </Typography>
                              <Rating 
                                value={treatment.cooperationLevel} 
                                readOnly 
                                size="small"
                                sx={{ direction: 'ltr' }}
                              />
                              <Typography variant="caption" fontWeight={600}>
                                ({treatment.cooperationLevel}/5)
                              </Typography>
                            </Stack>
                          )}

                          {/* Description Preview */}
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              mb: 2
                            }}
                          >
                            {treatment.description || 'אין תיאור'}
                          </Typography>

                          {/* Highlight */}
                          {treatment.highlight && (
                            <Alert severity="info" sx={{ fontSize: '0.75rem' }}>
                              <Typography variant="caption">
                                <strong>חשוב:</strong> {treatment.highlight}
                              </Typography>
                            </Alert>
                          )}
                        </CardContent>
                      </TreatmentCard>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper sx={{ 
                p: 6, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(76,175,80,0.05) 0%, rgba(129,199,132,0.05) 100%)',
                borderRadius: '20px'
              }}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  margin: '0 auto 16px',
                  background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)'
                }}>
                  <TreatmentIcon sx={{ fontSize: '2.5rem' }} />
                </Avatar>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  אין טיפולים מתוכננים להיום
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {isLoading ? 'טוען נתונים...' : 'כל הטיפולים הושלמו או שלא נקבעו טיפולים לתאריך זה'}
                </Typography>
                
                {!isLoading && (
                  <GlowingButton
                    startIcon={<AssignmentIcon />}
                    onClick={handleNavigateToFull}
                    glowColor="#4caf50"
                  >
                    📋 תכנן טיפולים חדשים
                  </GlowingButton>
                )}
              </Paper>
            )}
          </CardContent>
        </MainCard>
      </Fade>

      {/* Treatment Details Dialog */}
      <Dialog 
        open={treatmentDetailsDialog} 
        onClose={() => setTreatmentDetailsDialog(false)}
        maxWidth="md"
        fullWidth
        dir="rtl"
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }
        }}
      >
        {selectedTreatment && (
          <>
            <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: 4 }}>
              <Stack direction="row" spacing={3} alignItems="center" justifyContent="center">
                <FloatingAvatar
                  status={selectedTreatment.status}
                  sx={{ width: 80, height: 80, fontSize: '2rem' }}
                >
                  <HospitalIcon sx={{ fontSize: '2.5rem' }} />
                </FloatingAvatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {selectedTreatment.treatmentType?.treatmentTypeName || 'טיפול'}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                    <Chip 
                      icon={getStatusIcon(selectedTreatment.status)}
                      label={getStatusText(selectedTreatment.status)}
                      color={selectedTreatment.status === 'completed' ? 'success' : 
                             selectedTreatment.status === 'inProgress' ? 'warning' : 'info'}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(selectedTreatment.treatmentDate)}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </DialogTitle>
            
            <DialogContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                {/* Kid Info */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ 
                    p: 3, 
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(33,150,243,0.1) 0%, rgba(33,150,243,0.05) 100%)'
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#2196f3', fontWeight: 700 }}>
                      👶 פרטי הילד
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar 
                        sx={{ width: 50, height: 50 }}
                        src={
                          selectedTreatment.kid?.photoPath
                            ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(selectedTreatment.kid.photoPath)}`
                            : ''
                        }
                      >
                        {selectedTreatment.kid?.firstName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {selectedTreatment.kid ? `${selectedTreatment.kid.firstName} ${selectedTreatment.kid.lastName}` : 'ילד לא ידוע'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          מזהה: {selectedTreatment.kidId}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                {/* Therapist Info */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ 
                    p: 3, 
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(156,39,176,0.1) 0%, rgba(156,39,176,0.05) 100%)'
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0', fontWeight: 700 }}>
                      👨‍⚕️ פרטי המטפל
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ width: 50, height: 50, bgcolor: '#9c27b0' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {selectedTreatment.employee ? `${selectedTreatment.employee.firstName} ${selectedTreatment.employee.lastName}` : 'מטפל לא ידוע'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedTreatment.employee?.roleName || 'תפקיד לא ידוע'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                {/* Cooperation Level */}
                {selectedTreatment.cooperationLevel > 0 && (
                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ 
                      p: 3, 
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(255,193,7,0.1) 0%, rgba(255,193,7,0.05) 100%)'
                    }}>
                      <Typography variant="h6" gutterBottom sx={{ color: '#ffc107', fontWeight: 700 }}>
                        ⭐ רמת שיתוף פעולה
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Rating 
                          value={selectedTreatment.cooperationLevel} 
                          readOnly 
                          size="large"
                          sx={{ direction: 'ltr' }}
                        />
                        <Typography variant="h5" fontWeight={600}>
                          {selectedTreatment.cooperationLevel}/5
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                )}

                {/* Description */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ 
                    p: 3, 
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(76,175,80,0.05) 100%)'
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#4caf50', fontWeight: 700 }}>
                      📝 תיאור הטיפול
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      lineHeight: 1.7,
                      whiteSpace: 'pre-line'
                    }}>
                      {selectedTreatment.description || 'לא הוזן תיאור'}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Highlight */}
                {selectedTreatment.highlight && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ borderRadius: '16px', fontSize: '1rem' }}>
                      <Typography variant="body1" fontWeight={600}>
                        <strong>נקודה חשובה:</strong> {selectedTreatment.highlight}
                      </Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 4, justifyContent: 'space-between' }}>
              <GlowingButton
                onClick={() => setTreatmentDetailsDialog(false)}
                glowColor="#6b7280"
              >
                ❌ סגור
              </GlowingButton>
              <GlowingButton
                startIcon={<ViewIcon />}
                onClick={() => {
                  setTreatmentDetailsDialog(false);
                  if (onNavigateToTreatment) {
                    onNavigateToTreatment(selectedTreatment.kidId, selectedTreatment.treatmentTypeId);
                  }
                }}
                glowColor="#4caf50"
              >
                👁️ צפה בכל הטיפולים
              </GlowingButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </GradientContainer>
  );
};

export default TreatmentsSection;