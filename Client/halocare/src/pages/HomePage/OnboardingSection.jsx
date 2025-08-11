import  { useState, useEffect } from 'react';
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
  Tooltip
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
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

// 🎨 Same animations as classrooms
const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
  50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.6), 0 0 40px rgba(102, 126, 234, 0.4); }
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

// Same styled components as classrooms
const MainCard = styled(Card)(( ) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.2)',
  border: 'none',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
    borderRadius: '24px 24px 0 0',
  }
}));

const StatsCard = styled(Card)(({  color = '#667eea' }) => ({
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

const GlowingButton = styled(Button)(({  glowColor = '#667eea' }) => ({
  borderRadius: '16px',
  textTransform: 'none',
  fontWeight: 600,
  color: 'white',
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

const AnimatedChip = styled(Chip)(() => ({
  borderRadius: '12px',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  animation: `${pulse} 2s infinite`,
  '&:hover': {
    transform: 'scale(1.1)',
  }
}));


const OnboardingSection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const onboardingData = useSelector(selectOnboardingData);
  const { kids, status: kidsStatus } = useSelector(state => state.kids);
  
  // Local state
  const [loading, setLoading] = useState(true);
  const [showExpanded, setShowExpanded] = useState(false);
  const [selectedKid, setSelectedKid] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadOnboardingData();
  }, [dispatch]);

  const loadOnboardingData = async () => {
    setLoading(true);
    try {
      // Load kids first
      await dispatch(fetchKids()).unwrap();
      
      // Get active kids that might have onboarding processes
      const activeKids = kids.filter(kid => kid.isActive === true);
      
      // Load onboarding status for recent kids (limit to avoid overload)
      const recentKids = activeKids.slice(0, 20); // Last 20 active kids
      
      for (const kid of recentKids) {
        try {
          await dispatch(fetchOnboardingStatus(kid.id));
        } catch (error) {
          // Kid might not have onboarding process yet - that's ok
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



  // Process data for display
  const processOnboardingData = () => {
    const activeKids = kids.filter(kid => kid.isActive === true);
    
    // Get kids with onboarding data
    const kidsWithOnboarding = activeKids
      .map(kid => ({
        ...kid,
        onboarding: onboardingData[kid.id]
      }))
      .filter(kid => kid.onboarding) // Only kids with onboarding processes
      .sort((a, b) => {
        // Sort by completion status (incomplete first) and last updated
        const aProgress = a.onboarding?.overallProgress || 0;
        const bProgress = b.onboarding?.overallProgress || 0;
        
        if (aProgress !== bProgress) {
          return aProgress - bProgress; // Show incomplete first
        }
        
        return new Date(b.onboarding?.lastUpdated || 0) - new Date(a.onboarding?.lastUpdated || 0);
      });

    // Calculate overall stats
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
    
    // חפש טופס בתהליך
    const inProgress = forms.find(f => f.status === 'InProgress');
    if (inProgress) return inProgress;
    
    // חפש טופס שנשלח להורים  
    const sentToParent = forms.find(f => f.status === 'SentToParent');
    if (sentToParent) return sentToParent;
    
    // חפש טופס שלא התחיל
    const notStarted = forms.find(f => f.status === 'NotStarted');
    if (notStarted) return notStarted;
    
    // אחרת קח את האחרון שעודכן
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
      default: return '#667eea';
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
  
  // Show only top kids initially
  const displayKids = showExpanded ? kidsWithOnboarding : kidsWithOnboarding.slice(0, 5);

  if (isLoading) {
    return (
      <MainCard elevation={0}>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Avatar sx={{ 
            width: 60, 
            height: 60, 
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
      {/* Header */}
      <Box sx={{ 
        p: 4,
        background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
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
          background: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><defs><pattern id=\'grain\' width=\'100\' height=\'100\' patternUnits=\'userSpaceOnUse\'><circle cx=\'50\' cy=\'50\' r=\'1\' fill=\'%23667eea\' opacity=\'0.1\'/></pattern></defs><rect width=\'100\' height=\'100\' fill=\'url(%23grain)\'/></svg>")',
          opacity: 0.3
        }} />
        
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Zoom in timeout={600}>
              <Avatar sx={{ 
                width: 70, 
                height: 70,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                animation: `${float} 3s ease-in-out infinite`
              }}>
                <AssignmentIcon sx={{ fontSize: '2rem' }} />
              </Avatar>
            </Zoom>
            <Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          
          
           <Box sx={{ textAlign: 'center', mt: 3 }}>
              <GlowingButton
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('kids/onboarding/new')}
                glowColor="#10b981"
              >
                הוסף ילד חדש
              </GlowingButton>
            </Box>

        </Stack>

        {/* Stats Overview */}
        {stats.totalForms > 0 && (
          <Grid container spacing={3}>
            <Grid item size={{xs:12,sm:3}}>
              <Zoom in timeout={800}>
                <StatsCard color="#10b981">
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar sx={{ 
                      width: 60, 
                      height: 60, 
                      margin: '0 auto 16px',
                      background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
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
                <StatsCard color="#f59e0b">
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar sx={{ 
                      width: 60, 
                      height: 60, 
                      margin: '0 auto 16px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
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
                <StatsCard color="#3b82f6">
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar sx={{ 
                      width: 60, 
                      height: 60, 
                      margin: '0 auto 16px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
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
                <StatsCard color="#667eea">
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar sx={{ 
                      width: 60, 
                      height: 60, 
                      margin: '0 auto 16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}>
                      <AssignmentIcon sx={{ fontSize: '2rem' }} />
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#667eea', mb: 1 }}>
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

      {/* Kids List - Table Format */}
      <CardContent sx={{ p: 4 }}>
        {kidsWithOnboarding.length > 0 ? (
          <>
            <Paper elevation={1} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
              {/* Table Header */}
              <Box sx={{ 
                p: 2, 
                background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
                borderBottom: '1px solid rgba(0,0,0,0.08)'
              }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item size={{xs:3}}>
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      ילד
                    </Typography>
                  </Grid>
                  <Grid item size={{xs:2}}>
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      התקדמות
                    </Typography>
                  </Grid>
                  <Grid item size={{xs:3}}>
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      מצב נוכחי
                    </Typography>
                  </Grid>
                  <Grid item size={{xs:2}}>
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      טפסים
                    </Typography>
                  </Grid>
                  <Grid item size={{xs:2}}>
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      פעולות
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Kids Rows */}
              {displayKids.map((kid, index) => (
                <Fade in timeout={300 + index * 50} key={kid.id}>
                  <Box sx={{ 
                    borderBottom: index < displayKids.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(102,126,234,0.05)',
                      transform: 'translateX(-4px)',
                    },
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}>
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
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
                              <Typography variant="body2" fontWeight={600} color="primary.main">
                                {calculateProgress(kid.onboarding)}%
                              </Typography>
                            </Stack>
                            <LinearProgress 
                              variant="determinate" 
                              value={calculateProgress(kid.onboarding)}
                              sx={{ 
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'primary.main20',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                                }
                              }}
                            />
                          </Box>
                        </Grid>

                        {/* Current Form Status */}
                        <Grid item size={{xs:3}}>
                          {(() => {
                            const currentForm = getCurrentForm(kid.onboarding?.forms);
                            return currentForm ? (
                              <Chip
                                icon={getStatusIcon(currentForm.status)}
                                label={getStatusText(currentForm.status)}
                                size="small"
                                sx={{ 
                                  bgcolor: `${getStatusColor(currentForm.status)}15`,
                                  color: getStatusColor(currentForm.status),
                                  border: `1px solid ${getStatusColor(currentForm.status)}30`
                                }}
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
                        {/* Actions - 2 Direct Buttons */}
<Grid item size={{xs:2}}>
  <Stack direction="row" spacing={1}>
    <Tooltip title="דף קליטה" placement="top" PopperProps={{
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
  }}>
      <IconButton 
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedKid(kid);
          navigate(`/kids/onboarding/${selectedKid.id}`);
        }}
        sx={{ 
          background: 'rgba(102, 126, 234, 0.1)',
          '&:hover': { 
            background: 'rgba(102, 126, 234, 0.2)',
            transform: 'scale(1.1)'
          }
        }}
      >
        <AssignmentIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    
    <Tooltip title="פרופיל ילד"  placement="top" PopperProps={{
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
  }}>
      <IconButton 
        size="small"
        onClick={(e) => {
          console.log("sadsfsdfsdf",kid)
          e.stopPropagation();
          setSelectedKid(kid);
          navigate(`/kids/${kid.id}`);
        }}
        sx={{ 
          background: 'rgba(16, 185, 129, 0.1)',
          '&:hover': { 
            background: 'rgba(16, 185, 129, 0.2)',
            transform: 'scale(1.1)'
          }
        }}
      >
        <VisibilityIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  </Stack>
</Grid>
                      </Grid>
                    </Box>
                  </Box>
                </Fade>
              ))}
            </Paper>

            {/* Expand/Collapse Button */}
            {kidsWithOnboarding.length > 5 && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <GlowingButton
                  onClick={() => setShowExpanded(!showExpanded)}
                  startIcon={showExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  glowColor="#667eea"
                >
                  {showExpanded ? 'הצג פחות' : `הצג עוד ${kidsWithOnboarding.length - 5} ילדים`}
                </GlowingButton>
              </Box>
            )}

          </>
        ) : (
          <Alert severity="info" sx={{ borderRadius: '20px' }}>
            אין תהליכי קליטה פעילים כרגע
          </Alert>
        )}
      </CardContent>

      {/* Kid Actions Menu
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { borderRadius: '12px', minWidth: 200 }
        }}
      >
        <MenuItem onClick={() => {
          navigate(`/kids/onboarding/${selectedKid?.id}`);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <AssignmentIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="דף קליטה" />
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/kids/${selectedKid?.id}`);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <VisibilityIcon color="secondary" />
          </ListItemIcon>
          <ListItemText primary="פרופיל ילד" />
        </MenuItem>
      </Menu> */}
    </MainCard>
  );
};

export default OnboardingSection;