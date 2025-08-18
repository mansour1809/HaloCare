import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Stack,
  Chip,
  LinearProgress,
  Alert,
  Fade,
  Zoom,
  IconButton,
  Paper,
  Tooltip,
  alpha,
  styled,
  keyframes
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { fetchOnboardingStatus, selectOnboardingData } from '../../Redux/features/onboardingSlice';
import { fetchKids } from '../../Redux/features/kidsSlice';
import { baseURL } from '../../components/common/axiosConfig';

// Professional animations matching the style
const gradientShift = keyframes`
  0% { backgroundPosition: 0% 50%; }
  50% { backgroundPosition: 100% 50%; }
  100% { backgroundPosition: 0% 50%; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(76, 181, 195, 0.3); }
  50% { box-shadow: 0 0 30px rgba(76, 181, 195, 0.6), 0 0 40px rgba(76, 181, 195, 0.4); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Professional styled components
const MainCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    borderRadius: '20px 20px 0 0',
  }
}));

const StatsCard = styled(Card)(({  color = '#4cb5c3' }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 15px 35px rgba(76, 181, 195, 0.25)',
    animation: `${glow} 2s infinite`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.6)}, ${color})`,
    animation: `${gradientShift} 3s ease infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(color, 0.1)}, transparent)`,
    animation: `${shimmer} 3s infinite`,
  }
}));

const GlowingButton = styled(Button)(({  glowColor = '#4cb5c3' }) => ({
  borderRadius: 16,
  textTransform: 'none',
  fontWeight: 600,
  color: 'white',
  padding: '12px 24px',
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(45deg, ${glowColor} 30%, ${alpha(glowColor, 0.8)} 90%)`,
  boxShadow: `0 6px 20px ${alpha(glowColor, 0.3)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 12px 35px ${alpha(glowColor, 0.4)}`,
    background: `linear-gradient(45deg, ${alpha(glowColor, 0.9)} 30%, ${alpha(glowColor, 0.7)} 90%)`,
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

const AnimatedChip = styled(Chip)(() => ({
  borderRadius: 8,
  fontWeight: 600,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  animation: `${pulse} 2s infinite`,
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  }
}));

const StyledIconButton = styled(IconButton)(() => ({
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: '0 6px 20px rgba(76, 181, 195, 0.25)',
  }
}));

const KidRowContainer = styled(Box)(({ theme }) => ({
  borderBottom: '1px solid rgba(0,0,0,0.05)',
  '&:hover': {
    backgroundColor: 'rgba(76, 181, 195, 0.05)',
    transform: 'translateX(-4px)',
  },
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:last-child': {
    borderBottom: 'none',
  }
}));

const StyledLinearProgress = styled(LinearProgress)(() => ({
  height: 6,
  borderRadius: 3,
  backgroundColor: 'rgba(76, 181, 195, 0.1)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 3,
    background: 'linear-gradient(90deg, #4cb5c3, #2a8a95, #ff7043)',
  }
}));

const StatusChip = styled(Chip)(({  statusColor }) => ({
  borderRadius: 8,
  fontWeight: 600,
  backgroundColor: alpha(statusColor || '#4cb5c3', 0.1),
  color: statusColor || '#4cb5c3',
  border: `1px solid ${alpha(statusColor || '#4cb5c3', 0.3)}`,
  '& .MuiChip-icon': {
    color: statusColor || '#4cb5c3',
  }
}));

const OnboardingSection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state - PRESERVED EXACTLY
  const onboardingData = useSelector(selectOnboardingData);
  const { kids, status: kidsStatus } = useSelector(state => state.kids);
  
  // Local state - PRESERVED EXACTLY
  const [loading, setLoading] = useState(true);
  const [showExpanded, setShowExpanded] = useState(false);
  const [selectedKid, setSelectedKid] = useState(null);

  // Load data on mount - PRESERVED EXACTLY
  useEffect(() => {
    loadOnboardingData();
  }, [dispatch]);

  const loadOnboardingData = async () => {
    setLoading(true);
    try {
      // Get the kids directly from the dispatch result
      const kidsResult = await dispatch(fetchKids()).unwrap();
      
      // Use the result directly instead of relying on state
      const activeKids = kidsResult.filter(kid => kid.isActive === true);
      const recentKids = activeKids.slice(0, 20);
      
      for (const kid of recentKids) {
        try {
          await dispatch(fetchOnboardingStatus(kid.id));
        } catch (error) {
          console.log(`No onboarding process for kid ${kid.id}`);
        }
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Completed': return 'הושלם';
      case 'InProgress': return 'בתהליך';
      case 'SentToParent': return 'אצל הורים';
      case 'NotStarted': return 'לא התחיל';
      default: return 'לא ידוע';
    }
  };

  // Process data for display - PRESERVED EXACTLY
  const processOnboardingData = () => {
    const activeKids = kids.filter(kid => kid.isActive === true);
    
    const kidsWithOnboarding = activeKids
      .map(kid => ({
        ...kid,
        onboarding: onboardingData[kid.id]
      }))
      .filter(kid => kid.onboarding)
      .sort((a, b) => {
        const aProgress = a.onboarding?.overallProgress || 0;
        const bProgress = b.onboarding?.overallProgress || 0;
        
        if (aProgress !== bProgress) {
          return aProgress - bProgress;
        }
        
        return new Date(b.onboarding?.lastUpdated || 0) - new Date(a.onboarding?.lastUpdated || 0);
      });

    const totalForms = kidsWithOnboarding.reduce((sum, kid) => sum + (kid.onboarding?.totalForms || 0), 0);
    const completedForms = kidsWithOnboarding.reduce((sum, kid) => sum + (kid.onboarding?.completedForms || 0), 0);
    const inProgressForms = kidsWithOnboarding.reduce((sum, kid) => {
      return sum + (kid.onboarding?.forms?.filter(f => f.status === 'InProgress').length || 0);
    }, 0);
    const sentToParentForms = kidsWithOnboarding.reduce((sum, kid) => {
      return sum + (kid.onboarding?.forms?.filter(f => f.status === 'SentToParent').length || 0);
    }, 0);

    return {
      kidsWithOnboarding,
      stats: {
        totalForms,
        completedForms,
        inProgressForms,
        sentToParentForms,
        completionRate: totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0,
        totalKids: kidsWithOnboarding.length
      }
    };
  };

  const getCurrentForm = (forms) => {
    if (!forms?.length) return null;
    
    const inProgress = forms.find(f => f.status === 'InProgress');
    if (inProgress) return inProgress;
    
    const sentToParent = forms.find(f => f.status === 'SentToParent');
    if (sentToParent) return sentToParent;
    
    const notStarted = forms.find(f => f.status === 'NotStarted');
    if (notStarted) return notStarted;
    
    return forms.reduce((latest, current) => {
      const latestDate = new Date(latest.lastUpdated || latest.startDate || 0);
      const currentDate = new Date(current.lastUpdated || current.startDate || 0);
      return currentDate > latestDate ? current : latest;
    });
  };

  const calculateProgress = (onboarding) => {
    if (!onboarding?.totalForms || onboarding.totalForms === 0) return 0;
    return Math.round((onboarding.completedForms / onboarding.totalForms) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'InProgress': return '#f59e0b';
      case 'SentToParent': return '#3b82f6';
      case 'NotStarted': return '#6b7280';
      default: return '#4cb5c3';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircleIcon />;
      case 'InProgress': return <ScheduleIcon />;
      case 'SentToParent': return <SendIcon />;
      case 'NotStarted': return <WarningIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const { kidsWithOnboarding, stats } = processOnboardingData();
  const isLoading = loading || kidsStatus === 'loading';
  
  const displayKids = showExpanded ? kidsWithOnboarding : kidsWithOnboarding.slice(0, 5);

  if (isLoading) {
    return (
      <MainCard elevation={0}>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Avatar sx={{ 
            width: 60, 
            height: 60, 
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
            animation: `${float} 3s ease-in-out infinite`
          }}>
            <AssignmentIcon sx={{ fontSize: '2rem' }} />
          </Avatar>
          <Typography variant="h6" fontWeight={600}>
            טוען נתוני קליטה...
          </Typography>
        </CardContent>
      </MainCard>
    );
  }

  return (
    <MainCard elevation={0} dir="rtl">
      {/* Professional Header */}
      <Box sx={{ 
        p: 4,
        background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.05) 0%, rgba(255, 112, 67, 0.05) 100%)',
        borderRadius: '20px 20px 0 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Zoom in timeout={600}>
              <Avatar sx={{ 
                width: 70, 
                height: 70,
                background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
                boxShadow: '0 8px 25px rgba(76, 181, 195, 0.3)',
                animation: `${float} 3s ease-in-out infinite`
              }}>
                <AssignmentIcon sx={{ fontSize: '2rem' }} />
              </Avatar>
            </Zoom>
            <Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}>
                טפסי קליטה
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <AnimatedChip 
                  icon={<TrendingIcon />}
                  label={`${stats.totalKids} תהליכים פעילים`}
                  color="primary"
                  variant="outlined"
                />
                {stats.completionRate > 0 && (
                  <AnimatedChip 
                    label={`${stats.completionRate}% הושלם`}
                    color="success"
                  />
                )}
              </Stack>
            </Box>
          </Stack>
          
          <Box sx={{ textAlign: 'center' }}>
            <GlowingButton
              startIcon={<PersonAddIcon />}
              onClick={() => navigate('kids/onboarding/new')}
              glowColor="#10b981"
            >
              הוסף ילד חדש
            </GlowingButton>
          </Box>
        </Stack>

        {/* Professional Stats Overview */}
        {stats.totalForms > 0 && (
          <Grid container spacing={3}>
            <Grid item size={{xs:12,sm:3}}>
              <Zoom in timeout={800}>
                <StatsCard color="#10b981" height="100%">
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar sx={{ 
                      width: 40, 
                      height: 40, 
                      margin: '0 auto 16px',
                      background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
                      animation: `${glow} 2s infinite`
                    }}>
                      <CheckCircleIcon sx={{ fontSize: '2rem' }} />
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#10b981', mb: 1 }}>
                      {stats.completedForms}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight={600}>
                      טפסים הושלמו
                    </Typography>
                  </CardContent>
                </StatsCard>
              </Zoom>
            </Grid>
            
            <Grid item size={{xs:12,sm:3}}>
              <Zoom in timeout={1000}>
                <StatsCard color="#f59e0b" height="100%">
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar sx={{ 
                      width: 40, 
                      height: 40, 
                      margin: '0 auto 16px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                      boxShadow: '0 6px 20px rgba(245, 158, 11, 0.3)',
                      animation: stats.inProgressForms > 0 ? `${pulse} 1s infinite` : 'none'
                    }}>
                      <ScheduleIcon sx={{ fontSize: '2rem' }} />
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#f59e0b', mb: 1 }}>
                      {stats.inProgressForms}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight={600}>
                      בתהליך
                    </Typography>
                  </CardContent>
                </StatsCard>
              </Zoom>
            </Grid>
            
            <Grid item size={{xs:12,sm:3}}>
              <Zoom in timeout={1200}>
                <StatsCard color="#3b82f6" height="100%">
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar sx={{ 
                      width: 40, 
                      height: 40, 
                      margin: '0 auto 16px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)'
                    }}>
                      <SendIcon sx={{ fontSize: '2rem' }} />
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#3b82f6', mb: 1 }}>
                      {stats.sentToParentForms}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight={600}>
                      אצל הורים
                    </Typography>
                  </CardContent>
                </StatsCard>
              </Zoom>
            </Grid>
            
            <Grid item size={{xs:12,sm:3}}>
              <Zoom in timeout={1400}>
                <StatsCard color="#4cb5c3" height="100%">
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar sx={{ 
                      width: 40, 
                      height: 40, 
                      margin: '0 auto 16px',
                      background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
                      boxShadow: '0 6px 20px rgba(76, 181, 195, 0.3)'
                    }}>
                      <AssignmentIcon sx={{ fontSize: '2rem' }} />
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#4cb5c3', mb: 1 }}>
                      {stats.totalForms}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight={600}>
                      סה"כ טפסים
                    </Typography>
                  </CardContent>
                </StatsCard>
              </Zoom>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Professional Kids List - Table Format */}
      <CardContent sx={{ p: 4 }}>
        {kidsWithOnboarding.length > 0 ? (
          <>
            <Paper elevation={0} sx={{ 
              borderRadius: 16, 
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              {/* Table Header */}
              <Box sx={{ 
                p: 2, 
                background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.05) 0%, rgba(255, 112, 67, 0.05) 100%)',
                borderBottom: '1px solid rgba(76, 181, 195, 0.1)'
              }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item size={{xs:3}}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#2a8a95' }}>
                      ילד
                    </Typography>
                  </Grid>
                  <Grid item size={{xs:2}}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#2a8a95' }}>
                      התקדמות
                    </Typography>
                  </Grid>
                  <Grid item size={{xs:3}}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#2a8a95' }}>
                      מצב נוכחי
                    </Typography>
                  </Grid>
                  <Grid item size={{xs:2}}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#2a8a95' }}>
                      טפסים
                    </Typography>
                  </Grid>
                  <Grid item size={{xs:2}}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#2a8a95' }}>
                      פעולות
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Kids Rows */}
              {displayKids.map((kid, index) => (
                <Fade in timeout={300 + index * 50} key={kid.id}>
                  <KidRowContainer>
                    <Box sx={{ p: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        {/* Kid Info */}
                        <Grid item size={{xs:3}}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                              src={
                                kid.photoPath
                                  ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(kid.photoPath)}`
                                  : ''
                              }
                              sx={{ 
                                width: 40, 
                                height: 40,
                                background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
                                border: '2px solid rgba(255, 255, 255, 0.9)',
                                boxShadow: '0 4px 12px rgba(76, 181, 195, 0.2)'
                              }}
                            >
                              {!kid.photoPath && `${kid.firstName?.charAt(0) || ''}${kid.lastName?.charAt(0) || ''}`}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {kid.firstName} {kid.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {kid.classId == '1002' ? 'לא משובץ' : 'כיתה ' + kid.classId}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>

                        {/* Progress */}
                        <Grid item size={{xs:2}}>
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                              <Typography variant="body2" fontWeight={700} sx={{ 
                                background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                              }}>
                                {calculateProgress(kid.onboarding)}%
                              </Typography>
                            </Stack>
                            <StyledLinearProgress 
                              variant="determinate" 
                              value={calculateProgress(kid.onboarding)}
                            />
                          </Box>
                        </Grid>

                        {/* Current Form Status */}
                        <Grid item size={{xs:3}}>
                          {(() => {
                            const currentForm = getCurrentForm(kid.onboarding?.forms);
                            return currentForm ? (
                              <StatusChip
                                icon={getStatusIcon(currentForm.status)}
                                label={getStatusText(currentForm.status)}
                                size="small"
                                statusColor={getStatusColor(currentForm.status)}
                              />
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                אין נתונים
                              </Typography>
                            );
                          })()}
                        </Grid>

                        {/* Forms Count */}
                        <Grid item size={{xs:2}}>
                          <Typography variant="body2" fontWeight={600}>
                            {kid.onboarding?.completedForms || 0}/{kid.onboarding?.totalForms || 0}
                          </Typography>
                        </Grid>

                        {/* Actions */}
                        <Grid item size={{xs:2}}>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="דף קליטה" placement="top" 
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
                              }}
                            >
                              <StyledIconButton 
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedKid(kid);
                                  navigate(`/kids/onboarding/${kid.id}`);
                                }}
                                sx={{ 
                                  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1) 0%, rgba(76, 181, 195, 0.05) 100%)',
                                  '&:hover': { 
                                    background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.2) 0%, rgba(76, 181, 195, 0.1) 100%)',
                                  }
                                }}
                              >
                                <AssignmentIcon fontSize="small" sx={{ color: '#4cb5c3' }} />
                              </StyledIconButton>
                            </Tooltip>
                            
                            <Tooltip title="פרופיל ילד" placement="top"
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
                              }}
                            >
                              <StyledIconButton 
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedKid(kid);
                                  navigate(`/kids/${kid.id}`);
                                }}
                                sx={{ 
                                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                                  '&:hover': { 
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
                                  }
                                }}
                              >
                                <VisibilityIcon fontSize="small" sx={{ color: '#10b981' }} />
                              </StyledIconButton>
                            </Tooltip>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                  </KidRowContainer>
                </Fade>
              ))}
            </Paper>

            {/* Expand/Collapse Button */}
            {kidsWithOnboarding.length > 5 && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <GlowingButton
                  onClick={() => setShowExpanded(!showExpanded)}
                  startIcon={showExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  glowColor="#4cb5c3"
                >
                  {showExpanded ? 'הצג פחות' : `הצג עוד ${kidsWithOnboarding.length - 5} ילדים`}
                </GlowingButton>
              </Box>
            )}

          </>
        ) : (
          <Alert severity="info" sx={{ 
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(76, 181, 195, 0.2)'
          }}>
            אין תהליכי קליטה פעילים כרגע
          </Alert>
        )}
      </CardContent>
    </MainCard>
  );
};

export default OnboardingSection;