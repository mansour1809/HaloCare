import { useState, useEffect } from "react";
import {
  Typography, Box, Container, Card, CardContent,
  Fade, Zoom, Avatar, Stack, Chip, useTheme, alpha
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

// Amazing theme for the attendance system
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
      main: '#667eea',
      light: '#818cf8',
      dark: '#4338ca',
      contrastText: '#ffffff',
    },
    secondary: {
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
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #10b981 100%)',
      paper: '#ffffff',
    },
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
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          '& .MuiTabs-indicator': {
            height: '100%',
            borderRadius: 16,
            background: 'linear-gradient(45deg, #667eea 30%, #10b981 90%)',
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
            background: 'rgba(102, 126, 234, 0.1)',
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
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #667eea, #764ba2, #10b981, #667eea)',
            borderRadius: '20px 20px 0 0',
          }
        }
      }
    }
  }
});

// Container with an amazing background
const GradientContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #10b981 100%)',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

// Styled main header
const MainHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -15,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 120,
    height: 4,
    background: 'linear-gradient(90deg, #ffffff, rgba(255,255,255,0.5), #ffffff)',
    borderRadius: 2,
  }
}));

// Styled content card
const ContentCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
  '&::before': {
    background: 'linear-gradient(90deg, #10b981, #34d399, #059669)',
  }
}));

const AttendanceDashboard = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load the list of kids
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

  // Handle tab switching
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Tab data
  const tabs = [
    {
      icon: <AttendanceIcon />,
      label: 'סימון נוכחות',
      color: '#667eea',
      description: 'סמן נוכחות יומית לילדים'
    },
    {
      icon: <ReportsIcon />,
      label: 'דוחות נוכחות',
      color: '#10b981',
      description: 'צפה והפק דוחות נוכחות'
    },
    {
      icon: <AnalyticsIcon />,
      label: 'אנליטיקה',
      color: '#f59e0b',
      description: 'ניתוח נתוני נוכחות וטרנדים'
    }
  ];

  if (isLoading) {
    return (
      <ThemeProvider theme={attendanceTheme}>
        <GradientContainer maxWidth="xl" dir="rtl">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Avatar sx={{
                width: 80,
                height: 80,
                margin: '0 auto 16px',
                background: 'linear-gradient(45deg, #667eea 30%, #10b981 90%)',
                animation: 'pulse 2s infinite'
              }}>
                <SchoolIcon sx={{ fontSize: '2.5rem' }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                טוען מערכת נוכחות...
              </Typography>
            </Card>
          </Box>
        </GradientContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={attendanceTheme}>
      <AttendanceProvider>
        <GradientContainer maxWidth="xl" dir="rtl">
          {/* Main header */}
          <Fade in timeout={800}>
            <MainHeader>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  background: 'linear-gradient(45deg, #ffffff 30%, rgba(255,255,255,0.8) 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                <CalendarIcon sx={{ fontSize: '3rem', color: 'white', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
                מערכת ניהול נוכחות
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  mt: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                ניהול נוכחות מתקדם וחכם
              </Typography>
            </MainHeader>
          </Fade>

          {/* Overview of tabs */}
          <Zoom in timeout={1000}>
            <Card sx={{ mb: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 600,
                  color: 'primary.main'
                }}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  מה תוכל לעשות
                </Typography>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mt: 2 }}>
                  {tabs.map((tab, index) => (
                    <Card
                      key={index}
                      sx={{
                        flex: 1,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 12px 32px ${alpha(tab.color, 0.3)}`,
                        },
                        '&::before': {
                          background: `linear-gradient(90deg, ${tab.color}, ${alpha(tab.color, 0.7)})`,
                        }
                      }}
                      onClick={() => setTabValue(index)}
                    >
                      <CardContent sx={{ p: 2, textAlign: 'center', height: '20' }}>
                        <Avatar sx={{
                          background: `linear-gradient(45deg, ${tab.color} 30%, ${alpha(tab.color, 0.8)} 90%)`,
                          width: 48,
                          height: 48,
                          margin: '0 auto 12px',
                          boxShadow: `0 4px 14px ${alpha(tab.color, 0.3)}`
                        }}>
                          {tab.icon}
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          {tab.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tab.description}
                        </Typography>

                        {tabValue === index && (
                          <Chip
                            label="פעיל כעת"
                            size="small"
                            sx={{
                              mt: 1,
                              background: tab.color,
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Zoom>

          {/* Tab content */}
          <Fade in timeout={1400}>
            <ContentCard>
              <CardContent sx={{ p: 0 }}>
                {/* Tab content for marking attendance */}
                {tabValue === 0 && (
                  <Box sx={{ p: 3 }}>
                    <AttendanceMarking />
                  </Box>
                )}

                {/* Tab content for reports */}
                {tabValue === 1 && (
                  <Box sx={{ p: 3 }}>
                    <AttendanceReports />
                  </Box>
                )}

                {/* Tab content for analytics */}
                {tabValue === 2 && (
                  <Box sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 600,
                        color: 'warning.main',
                        mb: 3
                      }}
                    >
                      <AnalyticsIcon sx={{ mr: 1 }} />
                      אנליטיקת נוכחות מתקדמת
                    </Typography>
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