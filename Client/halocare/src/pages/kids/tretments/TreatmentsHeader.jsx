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
  Divider,
  Tooltip,
  styled,
  alpha,
  Fade,
  Zoom,
  Container
} from '@mui/material';
import { 
  Add as AddIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTreatmentContext } from './TreatmentContext';
import PropTypes from 'prop-types';

// Enhanced Styled Components with modern design
const ModernHeader = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.95) 0%, rgba(42, 138, 149, 0.95) 25%, rgba(255, 112, 67, 0.95) 50%, rgba(16, 185, 129, 0.95) 75%, rgba(76, 181, 195, 0.95) 100%)',
  backgroundSize: '400% 400%',
  animation: 'gradientShift 20s ease infinite',
  color: 'white',
  borderRadius: '20px',
  overflow: 'hidden',
  position: 'relative',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha('#ffffff', 0.2)}`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  }
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha('#ffffff', 0.2)}`,
  borderRadius: '16px',
  padding: theme.spacing(3),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 60px rgba(76, 181, 195, 0.25)',
  },
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

const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: '12px 32px',
  fontWeight: 700,
  fontSize: '1.1rem',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  boxShadow: '0 8px 25px rgba(76, 181, 195, 0.4)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: '0 15px 40px rgba(76, 181, 195, 0.5)',
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
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-4px',
    left: '-4px',
    right: '-4px',
    bottom: '-4px',
    background: 'linear-gradient(45deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    borderRadius: '50%',
    zIndex: -1,
    animation: 'avatarBorderRotate 3s linear infinite',
  },
  '@keyframes avatarBorderRotate': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  }
}));

const GlowingChip = styled(Chip)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1rem',
  padding: '8px 16px',
  height: 'auto',
  borderRadius: '12px',
  boxShadow: '0 4px 15px rgba(76, 181, 195, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 20px rgba(76, 181, 195, 0.4)',
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

  // Get statistics
  const stats = getFilteredTreatmentStats();

  // Function to calculate trend (approximate)
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
        <Breadcrumbs 
          separator="›" 
          sx={{ 
            mb: 3,
            '& .MuiBreadcrumbs-separator': { color: 'rgba(255, 255, 255, 0.7)' }
          }}
        >
          <Link 
            color="inherit" 
            href="/" 
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: '#fff',
              textDecoration: 'none !important',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#fff',
                transform: 'scale(1.02)'
              }
            }}
          >
            <HomeIcon fontSize="small" />
            דף הבית
          </Link>

           <Link
           color="inherit" 
            href="/kids/list" 
                     sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: '#fff',
              textDecoration: 'none !important',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#fff',
                transform: 'scale(1.02)'
              }
            }}
                      onClick={() => navigate('/kids/list')}
                    >
                      <GroupIcon sx={{ mr: 0.5, fontSize: 'small' }} />
                      רשימת ילדים
                    </Link>
          <Link 
            color="inherit" 
            href={`/kids/${kidId}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/kids/${kidId}`);
            }}
            sx={{ 
              textDecoration: 'none !important',
              transition: 'all 0.2s ease',
              color: '#fff',
              '&:hover': {
                color: '#fff',
                transform: 'scale(1.02)'
              }
            }}
          >
            {selectedKid ? `${selectedKid.firstName} ${selectedKid.lastName}` : 'פרופיל ילד'}
          </Link>
          <Typography color="white" sx={{ display: 'flex', alignItems: 'center' }}>
            <AssessmentIcon sx={{ mr: 0.5, fontSize: 'small' }} />
              סיכומי טיפולים
            </Typography>
        </Breadcrumbs>
      </Fade>
      
      {/* Modern Header */}
      <Fade in timeout={800}>
        <ModernHeader elevation={0} sx={{ p: 4, mb: 4 }}>
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
              <Box>
                <Typography variant="h3" component="h1" sx={{ 
                  fontWeight: 600, 
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
                    backdropFilter: 'blur(10px)'
                  }}>
                    📋
                  </AnimatedAvatar>
                  
                  סיכומי טיפולים
                  {console.log(treatmentType)}
                  {treatmentType && (
                    console.log(treatmentType),
                    console.log(getTreatmentName(treatmentType)),
                    <GlowingChip 
                      label={getTreatmentName(treatmentType)}
                      sx={{ 
                        backgroundColor: getColorForTreatmentType(treatmentType),
                        color: '#fff',
                      }}
                    />
                  )}
                </Typography>
                
                {selectedKid && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="h5" sx={{ 
                      color: 'white',
                      fontWeight: 600,
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
                        backdropFilter: 'blur(10px)'
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
                  <StatsCard>
                    <AnimatedAvatar sx={{ 
                      bgcolor: '#4cb5c3', 
                      mx: 'auto', 
                      mb: 2,
                      width: 56,
                      height: 56,
                      fontSize: '1.5rem'
                    }}>
                      📊
                    </AnimatedAvatar>
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
                  <StatsCard>
                    <AnimatedAvatar sx={{ 
                      bgcolor: '#ff7043', 
                      mx: 'auto', 
                      mb: 2,
                      width: 56,
                      height: 56,
                      fontSize: '1.5rem'
                    }}>
                      🤝
                    </AnimatedAvatar>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon 
                          key={star}
                          fontSize="small"
                          sx={{ 
                            color: star <= (stats.averageCooperation || 0) ? '#ffc107' : '#e0e0e0',
                            transition: 'all 0.2s ease',
                            '&:hover': { transform: 'scale(1.2)' }
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
                  <StatsCard>
                    <AnimatedAvatar sx={{ 
                      bgcolor: '#10b981', 
                      mx: 'auto', 
                      mb: 2,
                      width: 56,
                      height: 56,
                      fontSize: '1.5rem'
                    }}>
                      👨‍⚕️
                    </AnimatedAvatar>
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
                  <StatsCard>
                    <AnimatedAvatar sx={{ 
                      bgcolor: '#9c27b0', 
                      mx: 'auto', 
                      mb: 2,
                      width: 56,
                      height: 56,
                      fontSize: '1.5rem'
                    }}>
                      📅
                    </AnimatedAvatar>
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
                <StatsCard sx={{ p: 3, textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    color: 'text.primary', 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <TrendingUpIcon sx={{ color: '#4cb5c3' }} />
                    התפלגות לפי סוגי טיפול:
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap justifyContent="center">
                    {Object.entries(stats.treatmentTypeDistribution || {}).map(([type, count]) => (
                      <Tooltip PopperProps={{ disablePortal: true }} key={type} title={`${count} טיפולים מסוג ${type}`}>
                        <GlowingChip
                          label={`${type}: ${count}`}
                          variant="outlined"
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            borderColor: '#4cb5c3',
                            color: '#4cb5c3',
                            '&:hover': {
                              backgroundColor: alpha('#4cb5c3', 0.1),
                              transform: 'scale(1.05)',
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