import { useState, useEffect } from "react";
import {
  Typography, Box, Container, Card, CardContent,
  Fade, Zoom, Avatar, Stack, Chip, useTheme, alpha, keyframes
} from "@mui/material";
import {
  HowToReg as AttendanceIcon,
  Assessment as ReportsIcon,
  Analytics as AnalyticsIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon
} from "@mui/icons-material";
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { useDispatch } from "react-redux";
import { fetchKids } from "../../Redux/features/kidsSlice";
import { AttendanceProvider } from "./AttendanceContext";
import AttendanceMarking from "./AttendanceMarking";
import AttendanceReports from "./AttendanceReports";

// Professional animations matching our style
const gradientShift = keyframes`
  0% { backgroundPosition: 0% 50%; }
  50% { backgroundPosition: 100% 50%; }
  100% { backgroundPosition: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(76, 181, 195, 0.3); }
  50% { box-shadow: 0 0 30px rgba(76, 181, 195, 0.6), 0 0 40px rgba(76, 181, 195, 0.4); }
`;

// Professional theme with our color scheme
const attendanceTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '2rem',
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
    }
  },
  components: {
    MuiTabs: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 20,
          padding: '8px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          '& .MuiTabs-indicator': {
            height: '100%',
            borderRadius: 16,
            background: 'linear-gradient(45deg, #4cb5c3 30%, #10b981 90%)',
            zIndex: 0,
          }
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          minHeight: 56,
          zIndex: 1,
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&.Mui-selected': {
            color: 'white',
            transform: 'translateY(-2px)',
          },
          '&:hover': {
            transform: 'translateY(-1px)',
            background: 'rgba(76, 181, 195, 0.1)',
          }
        }
      }
    },
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
        }
      }
    }
  }
});

// Professional styled components
const GradientContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 20s ease infinite`,
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
  }
}));

const MainHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  position: 'relative',
  zIndex: 1,
  padding: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -15,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 120,
    height: 4,
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981)',
    borderRadius: 2,
    animation: `${shimmer} 3s infinite`,
  }
}));

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    borderRadius: '20px 20px 0 0',
    animation: `${gradientShift} 3s ease infinite`,
  }
}));

const TabCard = styled(Card)(({ theme, color }) => ({
  flex: 1,
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.6)}, ${color})`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(color, 0.1)}, transparent)`,
    transition: 'all 0.5s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 15px 35px ${alpha(color, 0.25)}`,
    animation: `${glow} 2s infinite`,
    '&::after': {
      left: '100%',
    }
  }
}));

const LoadingCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981)',
    animation: `${shimmer} 2s infinite`,
  }
}));

const AnimatedAvatar = styled(Avatar)(({ theme }) => ({
  animation: `${pulse} 2s ease-in-out infinite, ${float} 3s ease-in-out infinite`,
}));

const ContentCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
  position: 'relative',
  zIndex: 1,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #10b981, #34d399, #059669, #10b981)',
    borderRadius: '20px 20px 0 0',
    animation: `${gradientShift} 3s ease infinite`,
  }
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  animation: `${pulse} 2s ease-in-out infinite`,
}));

const AttendanceDashboard = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load the list of kids - PRESERVED EXACTLY
  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchKids());
      } catch (error) {
        console.error('שגיאה בטעינת נתונים:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  // Handle tab switching - PRESERVED EXACTLY
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Tab data - PRESERVED EXACTLY with updated colors
  const tabs = [
    {
      icon: <AttendanceIcon />,
      label: 'סימון נוכחות',
      color: '#4cb5c3',
      description: 'סמן נוכחות יומית לילדים'
    },
    {
      icon: <ReportsIcon />,
      label: 'דוחות נוכחות',
      color: '#10b981',
      description: 'צפה והפק דוחות נוכחות'
    }
    
  ];

  if (isLoading) {
    return (
      <ThemeProvider theme={attendanceTheme}>
        <GradientContainer maxWidth="xl" dir="rtl">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <LoadingCard>
              <AnimatedAvatar sx={{
                width: 80,
                height: 80,
                margin: '0 auto 16px',
                background: 'linear-gradient(45deg, #4cb5c3 30%, #10b981 90%)',
                boxShadow: '0 8px 25px rgba(76, 181, 195, 0.3)',
              }}>
                <SchoolIcon sx={{ fontSize: '2.5rem' }} />
              </AnimatedAvatar>
              <Typography 
                variant="h6" 
                fontWeight={600}
                sx={{
                  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                טוען מערכת נוכחות...
              </Typography>
            </LoadingCard>
          </Box>
        </GradientContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={attendanceTheme}>
      <AttendanceProvider>
        <GradientContainer maxWidth="xl" dir="rtl">
          {/* Main header - Enhanced styling */}
          <Fade in timeout={800}>
            <MainHeader>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  background: 'linear-gradient(45deg, #ffffff 30%, rgba(255,255,255,0.9) 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  fontWeight: 800,
                }}
              >
                <CalendarIcon sx={{ 
                  fontSize: '3rem', 
                  color: 'white', 
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                  animation: `${float} 3s ease-in-out infinite` 
                }} />
                מערכת ניהול נוכחות
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.95)',
                  mt: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  fontWeight: 500,
                }}
              >
                ניהול נוכחות מתקדם וחכם
              </Typography>
            </MainHeader>
          </Fade>

          {/* Overview of tabs - Enhanced styling */}
          <Zoom in timeout={1000}>
            <StyledCard sx={{ mb: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  <TrendingUpIcon sx={{ mr: 1, color: '#4cb5c3' }} />
                  מה תוכל לעשות
                </Typography>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mt: 2 }}>
                  {tabs.map((tab, index) => (
                    <TabCard
                      key={index}
                      color={tab.color}
                      onClick={() => setTabValue(index)}
                    >
                      <CardContent sx={{ p: 2, textAlign: 'center', minHeight: 180 }}>
                        <Avatar sx={{
                          background: `linear-gradient(45deg, ${tab.color} 30%, ${alpha(tab.color, 0.8)} 90%)`,
                          width: 56,
                          height: 56,
                          margin: '0 auto 12px',
                          boxShadow: `0 6px 20px ${alpha(tab.color, 0.3)}`,
                          animation: `${float} 3s ease-in-out infinite`,
                          animationDelay: `${index * 0.2}s`
                        }}>
                          {tab.icon}
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                          {tab.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {tab.description}
                        </Typography>

                        {tabValue === index && (
                          <StyledChip
                            label="פעיל כעת"
                            size="small"
                            sx={{
                              background: `linear-gradient(45deg, ${tab.color} 30%, ${alpha(tab.color, 0.8)} 90%)`,
                              color: 'white',
                            }}
                          />
                        )}
                      </CardContent>
                    </TabCard>
                  ))}
                </Stack>
              </CardContent>
            </StyledCard>
          </Zoom>

          {/* Tab content - Enhanced styling */}
          <Fade in timeout={1400}>
            <ContentCard>
              <CardContent sx={{ p: 0 }}>
                {/* Tab content for marking attendance - PRESERVED EXACTLY */}
                {tabValue === 0 && (
                  <Box sx={{ p: 3 }}>
                    <AttendanceMarking />
                  </Box>
                )}

                {/* Tab content for reports - PRESERVED EXACTLY */}
                {tabValue === 1 && (
                  <Box sx={{ p: 3 }}>
                    <AttendanceReports />
                  </Box>
                )}

               
              </CardContent>
            </ContentCard>
          </Fade>
        </GradientContainer>
      </AttendanceProvider>
    </ThemeProvider>
  );
};

export default AttendanceDashboard;