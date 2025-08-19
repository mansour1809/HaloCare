import { 
  Box, 
  Typography, 
  Button, 
  Chip,
  Breadcrumbs,
  Link,
  Paper,
  Grid,
  Avatar,
  Stack,
  Tooltip,
  styled,
  alpha,
  Fade,
  Zoom,
  Container,
  keyframes
} from '@mui/material';
import { 
  Add as AddIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTreatmentContext } from './TreatmentContext';
import PropTypes from 'prop-types';

// Professional animations matching the global style
const gradientShift = keyframes`
  0% { backgroundPosition: 0% 50%; }
  50% { backgroundPosition: 100% 50%; }
  100% { backgroundPosition: 0% 50%; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
  100% { transform: scale(1); opacity: 1; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(76, 181, 195, 0.3); }
  50% { box-shadow: 0 0 30px rgba(76, 181, 195, 0.6), 0 0 40px rgba(76, 181, 195, 0.4); }
`;

// Enhanced Styled Components with professional design
const ModernHeader = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 20s ease infinite`,
  color: 'white',
  borderRadius: 20,
  overflow: 'hidden',
  position: 'relative',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 40%, rgba(76, 181, 195, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255, 112, 67, 0.2) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '4px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    animation: `${shimmer} 3s infinite`,
  }
}));

const StatsCard = styled(Paper)(({ theme, color = '#4cb5c3' }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 16,
  padding: theme.spacing(3),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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

const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: '12px 32px',
  fontWeight: 600,
  fontSize: '1.1rem',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  boxShadow: '0 6px 20px rgba(76, 181, 195, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px) scale(1.05)',
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

const AnimatedAvatar = styled(Avatar)(({ theme }) => ({
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  animation: `${float} 3s ease-in-out infinite`,
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-3px',
    left: '-3px',
    right: '-3px',
    bottom: '-3px',
    background: 'linear-gradient(45deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    borderRadius: '50%',
    zIndex: -1,
    opacity: 0.7,
    animation: `${gradientShift} 3s linear infinite`,
  }
}));

const GlowingChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.95rem',
  padding: '6px 12px',
  height: 'auto',
  borderRadius: 8,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
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
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    animation: `${gradientShift} 3s ease infinite`,
  },
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

const StatAvatar = styled(Avatar)(({ theme, bgcolor }) => ({
  background: `linear-gradient(135deg, ${bgcolor} 0%, ${alpha(bgcolor, 0.7)} 100%)`,
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  width: 56,
  height: 56,
  fontSize: '1.5rem',
  boxShadow: `0 6px 20px ${alpha(bgcolor, 0.3)}`,
  animation: `${pulse} 2s ease-in-out infinite`,
  '&:hover': {
    animation: `${float} 1s ease-in-out`,
  }
}));

const TreatmentsHeader = ({ kidId, treatmentType, selectedKid }) => {
  const navigate = useNavigate();
  const { 
    openAddDialog, 
    getTreatmentName, 
    getColorForTreatmentType,
    getEmployeeName,
    filteredTreatments,
    getFilteredTreatmentStats
  } = useTreatmentContext();

  // Get statistics - PRESERVED EXACTLY
  const stats = getFilteredTreatmentStats();

  // Function to calculate trend (approximate) - PRESERVED EXACTLY
  const getTrend = () => {
    if (!filteredTreatments.length) return null;
    
    const now = new Date();
    const thisMonth = filteredTreatments.filter(t => {
      const date = new Date(t.treatmentDate);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    
    const lastMonth = filteredTreatments.filter(t => {
      const date = new Date(t.treatmentDate);
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
      return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
    }).length;
    
    if (lastMonth === 0) return thisMonth > 0 ? '+100%' : '0%';
    const trend = ((thisMonth - lastMonth) / lastMonth * 100).toFixed(0);
    return trend > 0 ? `+${trend}%` : `${trend}%`;
  };

  return (
    <Box dir="rtl" sx={{ mb: 4 }}>
      {/* Enhanced Breadcrumbs */}
      <Fade in timeout={600}>
        <EnhancedBreadcrumbs dir="rtl">
          <StyledLink
            underline="hover"
            onClick={() => navigate('/')}
          >
            <HomeIcon />
            ראשי
          </StyledLink>
          <StyledLink
            underline="hover"
            onClick={() => navigate('/kids/list')}
          >
            <HomeIcon />
            רשימת ילדים
          </StyledLink>
          <StyledLink
            underline="hover"
            onClick={() => navigate(`/kids/${kidId}`)}
          >
            <PersonIcon />
            {selectedKid ? `${selectedKid.firstName} ${selectedKid.lastName}` : 'פרופיל ילד'}
          </StyledLink>
          <CurrentPage>
            <AssessmentIcon />
            סיכומי טיפולים
          </CurrentPage>
        </EnhancedBreadcrumbs>
      </Fade>
      
      {/* Modern Header */}
      <Fade in timeout={800}>
        <ModernHeader elevation={0} sx={{ p: 4, mb: 4 }}>
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
              <Box>
                <Typography variant="h3" component="h1" sx={{ 
                  fontWeight: 800, 
                  color: 'white',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}>
                  <AnimatedAvatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 64, 
                    height: 64,
                    fontSize: '2rem',
                    backdropFilter: 'blur(10px)',
                    border: '3px solid rgba(255,255,255,0.3)'
                  }}>
                    📋
                  </AnimatedAvatar>
                  
                  סיכומי טיפולים
                  {treatmentType && (
                    <GlowingChip 
                      label={getTreatmentName(treatmentType)}
                      sx={{ 
                        backgroundColor: alpha(getColorForTreatmentType(treatmentType), 0.9),
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                      }}
                    />
                  )}
                </Typography>
                
                {selectedKid && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="h5" sx={{ 
                      color: 'white',
                      fontWeight: 700,
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      {selectedKid.firstName} {selectedKid.lastName}
                    </Typography>
                    <GlowingChip 
                      label={selectedKid.isActive ? 'פעיל' : 'לא פעיל'}
                      color={selectedKid.isActive ? 'success' : 'error'}
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        backgroundColor: selectedKid.isActive ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)'
                      }}
                    />
                  </Box>
                )}
                
                {getTrend() && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon sx={{ color: 'rgba(255,255,255,0.9)' }} />
                    <Typography variant="body1" sx={{ 
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 600,
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      מגמה החודש: {getTrend()}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Zoom in timeout={1000}>
                <AnimatedButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openAddDialog}
                  sx={{ 
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  הוסף טיפול חדש
                </AnimatedButton>
              </Zoom>
            </Box>
          </Container>
        </ModernHeader>
      </Fade>

      {/* Enhanced Statistics Cards */}
      {stats && (
        <Fade in timeout={1200}>
          <Container maxWidth="xl">
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Total treatments */}
              <Grid item size={{ xs:12,sm:6, md:3}}>
                <Zoom in timeout={300}>
                  <StatsCard color="#4cb5c3">
                    <StatAvatar bgcolor="#4cb5c3">
                      📊
                    </StatAvatar>
                    <Typography variant="h3" sx={{ 
                      color: '#4cb5c3', 
                      fontWeight: 800,
                      textShadow: '0 2px 4px rgba(76, 181, 195, 0.2)'
                    }}>
                      {stats.total}
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: 'text.secondary',
                      fontWeight: 600,
                      mt: 1
                    }}>
                      סה"כ טיפולים
                    </Typography>
                  </StatsCard>
                </Zoom>
              </Grid>

              {/* Average cooperation */}
              <Grid item size={{ xs:12,sm:6, md:3}}>
                <Zoom in timeout={400}>
                  <StatsCard color="#ff7043">
                    <StatAvatar bgcolor="#ff7043">
                      🤝
                    </StatAvatar>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon 
                          key={star}
                          fontSize="small"
                          sx={{ 
                            color: star <= (stats.averageCooperation || 0) ? '#ffc107' : '#e0e0e0',
                            transition: 'all 0.2s ease',
                            filter: star <= (stats.averageCooperation || 0) ? 'drop-shadow(0 2px 4px rgba(255,193,7,0.5))' : 'none',
                            '&:hover': { 
                              transform: 'scale(1.2) rotate(15deg)' 
                            }
                          }} 
                        />
                      ))}
                    </Stack>
                    <Typography variant="h4" sx={{ 
                      color: '#ff7043', 
                      fontWeight: 800,
                      textShadow: '0 2px 4px rgba(255, 112, 67, 0.2)'
                    }}>
                      {stats.averageCooperation || '0.0'}
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: 'text.secondary',
                      fontWeight: 600
                    }}>
                      ממוצע שיתוף פעולה
                    </Typography>
                  </StatsCard>
                </Zoom>
              </Grid>

              {/* Different therapists */}
              <Grid item size={{ xs:12,sm:6, md:3}}>
                <Zoom in timeout={500}>
                  <StatsCard color="#10b981">
                    <StatAvatar bgcolor="#10b981">
                      👨‍⚕️
                    </StatAvatar>
                    <Typography variant="h3" sx={{ 
                      color: '#10b981', 
                      fontWeight: 800,
                      textShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                    }}>
                      {filteredTreatments.reduce((acc, t) => {
                        const employeeName = getEmployeeName(t.employeeId);
                        if (employeeName && employeeName !== 'לא ידוע' && !acc.includes(employeeName)) {
                          acc.push(employeeName);
                        }
                        return acc;
                      }, []).length}
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: 'text.secondary',
                      fontWeight: 600,
                      mt: 1
                    }}>
                      מטפלים שונים
                    </Typography>
                  </StatsCard>
                </Zoom>
              </Grid>

              {/* Recent treatments */}
              <Grid item size={{ xs:12,sm:6, md:3}}>
                <Zoom in timeout={600}>
                  <StatsCard color="#9c27b0">
                    <StatAvatar bgcolor="#9c27b0">
                      📅
                    </StatAvatar>
                    <Typography variant="h3" sx={{ 
                      color: '#9c27b0', 
                      fontWeight: 800,
                      textShadow: '0 2px 4px rgba(156, 39, 176, 0.2)'
                    }}>
                      {filteredTreatments.filter(t => {
                        const treatmentDate = new Date(t.treatmentDate);
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return treatmentDate >= thirtyDaysAgo;
                      }).length}
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: 'text.secondary',
                      fontWeight: 600,
                      mt: 1
                    }}>
                      ב-30 יום אחרונים
                    </Typography>
                  </StatsCard>
                </Zoom>
              </Grid>
            </Grid>

            {/* Distribution by treatment types */}
            {Object.keys(stats.treatmentTypeDistribution || {}).length > 1 && (
              <Fade in timeout={1400}>
                <StatsCard sx={{ 
                  p: 3, 
                  textAlign: 'right',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    color: 'text.primary', 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <TrendingUpIcon sx={{ 
                      color: '#4cb5c3',
                      animation: `${pulse} 2s ease-in-out infinite`
                    }} />
                    התפלגות לפי סוגי טיפול:
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap justifyContent="center">
                    {Object.entries(stats.treatmentTypeDistribution || {}).map(([type, count]) => (
                      <Tooltip 
                        placement="top" 
                        key={type} 
                        title={`${count} טיפולים מסוג ${type}`}
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
                        <GlowingChip
                          label={`${type}: ${count}`}
                          variant="outlined"
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            borderColor: '#4cb5c3',
                            color: '#4cb5c3',
                            background: 'rgba(76, 181, 195, 0.05)',
                            '&:hover': {
                              backgroundColor: alpha('#4cb5c3', 0.15),
                              transform: 'scale(1.08) translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(76, 181, 195, 0.3)',
                              borderColor: '#3da1af',
                            },
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Stack>
                </StatsCard>
              </Fade>
            )}
          </Container>
        </Fade>
      )}
    </Box>
  );
};

TreatmentsHeader.propTypes = {
  kidId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  treatmentType: PropTypes.string,
  selectedKid: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    isActive: PropTypes.bool,
  }),
};

export default TreatmentsHeader;