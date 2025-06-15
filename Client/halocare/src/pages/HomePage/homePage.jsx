import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
  Avatar,
  Button,
  Paper,
  IconButton,
  Chip,
  useTheme,
  alpha,
  ThemeProvider,
  createTheme,
  Stack,
  Fade,
  Zoom,
  Divider
} from '@mui/material';
import {
  Group as GroupIcon,
  PersonAdd as AddIcon,
  Timeline as ProgressIcon,
  Assessment as ReportsIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as CompleteIcon,
  Login as LoginIcon,
  ContactSupport as ContactIcon,
  Dashboard as DashboardIcon,
  LocalHospital as MedicalIcon,
  CalendarMonth as CalendarIcon,
  Description as FormIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  CheckCircle,
  Star as StarIcon,
  AutoAwesome as AutoAwesomeIcon,
  Celebration as CelebrationIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// יצירת theme מדהים עם תמיכה ב-RTL
const rtlTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '2.2rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.8rem',
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
      main: '#f093fb',
      light: '#fbbf24',
      dark: '#c2410c',
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
    },
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #667eea 100%)',
      paper: '#ffffff',
    },
  },
  components: {
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
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
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
          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
          }
        }
      }
    }
  }
});

// מסך מלא מותאם RTL עם רקע מדהים
const FullScreenContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #10b981 75%, #667eea 100%)',
  backgroundSize: '400% 400%',
  animation: 'gradientShift 15s ease infinite',
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
    background: 'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(240, 147, 251, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  }
}));

// כותרת עם עיצוב זכוכית ואפקטים
const ModernHeader = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(20px)',
  borderRadius: 0,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, #667eea, #f093fb, #10b981, #667eea)',
  }
}));

// כרטיס סטטיסטיקה מדהים
const StatCard = styled(Card)(({ theme, color }) => ({
  padding: '32px 24px',
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  height: '180px',
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
    height: '6px',
    background: `linear-gradient(90deg, ${theme.palette[color]?.main}, ${theme.palette[color]?.light})`,
    borderRadius: '24px 24px 0 0',
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

// כרטיס תכונה מעוצב עם זוהר
const FeatureCard = styled(Card)(({ theme, color }) => ({
  height: '320px',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: `linear-gradient(90deg, ${theme.palette[color]?.main}, ${theme.palette[color]?.light})`,
    borderRadius: '20px 20px 0 0',
  },
  '&:hover .feature-icon': {
    transform: 'scale(1.2) rotate(10deg)',
  },
  '&:hover::after': {
    opacity: 1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${alpha(theme.palette[color]?.main, 0.1)} 0%, transparent 100%)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  }
}));

// אייקון מעוצב עם אנימציות
const StyledIcon = styled(Avatar)(({ theme, color }) => ({
  width: 80,
  height: 80,
  margin: '0 auto 20px',
  background: `linear-gradient(135deg, ${theme.palette[color]?.main}, ${theme.palette[color]?.dark})`,
  color: 'white',
  fontSize: '2.5rem',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: `0 8px 24px ${alpha(theme.palette[color]?.main, 0.4)}`,
  position: 'relative',
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-4px',
    left: '-4px',
    right: '-4px',
    bottom: '-4px',
    background: `linear-gradient(45deg, ${theme.palette[color]?.light}, ${theme.palette[color]?.main})`,
    borderRadius: '50%',
    zIndex: -1,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
  }
}));

// כרטיס דשבורד מעוצב
const DashboardCard = styled(Card)(({ theme, gradientColor }) => ({
  height: '320px',
  background: gradientColor,
  border: 'none',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  }
}));

// כפתור פעולה מהירה
const QuickActionCard = styled(Card)(({ theme }) => ({
  height: '160px',
  cursor: 'pointer',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 1)',
    '& .action-icon': {
      transform: 'scale(1.1)',
    }
  }
}));

const HomePage = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'ילדים פעילים', value: '24', icon: <GroupIcon fontSize="large" />, color: 'primary' },
    { label: 'הושלמו השבוע', value: '8', icon: <CompleteIcon fontSize="large" />, color: 'success' },
    { label: 'בתהליך כעת', value: '12', icon: <ProgressIcon fontSize="large" />, color: 'warning' },
    { label: 'אחוז השלמה', value: '85%', icon: <TrendingIcon fontSize="large" />, color: 'error' }
  ];

  const features = [
    {
      title: 'ניהול ילדים',
      description: 'הוספה, עריכה ומעקב מקצועי אחרי כל הילדים בגן עם מעקב התפתחות מפורט ותיעוד מתקדם',
      icon: <GroupIcon />,
      color: 'primary',
      path: '/kids'
    },
    {
      title: 'נוכחות יומית',
      description: 'רישום נוכחות חכם ויצוא דוחות מפורטים לפי תאריכים עם ניתוח סטטיסטי ומעקב מגמות',
      icon: <CalendarIcon />,
      color: 'success',
      path: '/attendance'
    },
    {
      title: 'טפסים רפואיים',
      description: 'ניהול מקצועי של טופסי בריאות, תזונה ואישורים רפואיים - הכל דיגיטלי, מאובטח ונגיש',
      icon: <MedicalIcon />,
      color: 'warning',
      path: '/medical-forms'
    },
    {
      title: 'דוחות ואנליטיקה',
      description: 'מערכת דוחות מתקדמת עם ויזואליזציה של נתונים וניתוח טרנדים להתפתחות הילדים',
      icon: <ReportsIcon />,
      color: 'error',
      path: '/reports'
    },
    {
      title: 'הגדרות מערכת',
      description: 'ניהול הגדרות המערכת, הרשאות משתמשים וקונפיגורציות מתקדמות לגן',
      icon: <SettingsIcon />,
      color: 'secondary',
      path: '/settings'
    },
    {
      title: 'התראות ועדכונים',
      description: 'מערכת התראות חכמה להורים והצוות עם עדכונים בזמן אמת על אירועים חשובים',
      icon: <NotificationsIcon />,
      color: 'primary',
      path: '/notifications'
    }
  ];

  const quickActions = [
    {
      title: 'הוסף ילד חדש',
      description: 'התחל תהליך קליטה מקצועי',
      icon: <AddIcon />,
      color: 'primary',
      path: '/kids/new'
    },
    {
      title: 'לוח בקרה',
      description: 'מבט כללי על המצב',
      icon: <DashboardIcon />,
      color: 'secondary',
      path: '/dashboard'
    },
    {
      title: 'יצירת דוחות',
      description: 'דוחות מפורטים וסטטיסטיקות',
      icon: <FormIcon />,
      color: 'warning',
      path: '/reports'
    },
    {
      title: 'מעקב התקדמות',
      description: 'צפייה בהתקדמות הילדים',
      icon: <ProgressIcon />,
      color: 'success',
      path: '/progress'
    }
  ];

  return (
    <ThemeProvider theme={rtlTheme}>
      <Box sx={{ direction: 'rtl' }}>
        <FullScreenContainer>
          {/* כותרת מקצועית עם אפקטי זכוכית */}
          <Fade in timeout={800}>
            <ModernHeader elevation={0}>
              <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                <Stack 
                  direction={{ xs: 'column', md: 'row' }}
                  justifyContent="space-between" 
                  alignItems="center"
                  spacing={2}
                  sx={{ py: 3 }}
                >
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Avatar 
                      sx={{ 
                        background: 'linear-gradient(45deg, #667eea 30%, #f093fb 90%)',
                        width: 64, 
                        height: 64,
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                        animation: 'pulse 2s infinite'
                      }}
                    >
                      🌟
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="h4"
                        sx={{
                          fontWeight: 800,
                          background: 'linear-gradient(45deg, #ffffff 30%, rgba(255,255,255,0.8) 90%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                          lineHeight: 1.2
                        }}
                      >
                        Halo Care
                      </Typography>
                      <Typography 
                        variant="subtitle1"
                        sx={{ 
                          color: 'rgba(255,255,255,0.9)',
                          fontWeight: 500,
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                      >
                        מערכת ניהול מתקדמת לגן ילדים מיוחד
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      startIcon={<ContactIcon />}
                      sx={{ 
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          borderColor: 'white',
                          background: 'rgba(255,255,255,0.2)',
                        }
                      }}
                    >
                      צור קשר
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<LoginIcon />}
                      sx={{ 
                        background: 'linear-gradient(45deg, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.1) 90%)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.2) 90%)',
                        }
                      }}
                    >
                      כניסה למערכת
                    </Button>
                  </Stack>
                </Stack>
              </Container>
            </ModernHeader>
          </Fade>

          {/* תוכן ראשי */}
          <Container maxWidth="lg" sx={{ flex: 1, py: 6, position: 'relative', zIndex: 2 }}>
            {/* סטטיסטיקות מרכזיות */}
            <Zoom in timeout={1000}>
              <Box sx={{ mb: 8 }}>
                <Typography 
                  variant="h4" 
                  fontWeight="bold" 
                  textAlign="center" 
                  sx={{ 
                    mb: 6,
                    color: 'white',
                    textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  ✨ המצב כרגע בגן שלנו ✨
                </Typography>
                <Grid container spacing={4} justifyContent="center">
                  {stats.map((stat, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Fade in timeout={1200 + (index * 200)}>
                        <StatCard color={stat.color}>
                          <Avatar
                            sx={{
                              background: `linear-gradient(135deg, ${rtlTheme.palette[stat.color]?.main}, ${rtlTheme.palette[stat.color]?.dark})`,
                              width: 64,
                              height: 64,
                              mx: 'auto',
                              mb: 2,
                              boxShadow: `0 8px 24px ${alpha(rtlTheme.palette[stat.color]?.main, 0.4)}`,
                              position: 'relative',
                              zIndex: 2
                            }}
                          >
                            {stat.icon}
                          </Avatar>
                          <Typography variant="h3" fontWeight="bold" color="text.primary" sx={{ mb: 1, position: 'relative', zIndex: 2 }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" fontWeight="medium" sx={{ position: 'relative', zIndex: 2 }}>
                            {stat.label}
                          </Typography>
                        </StatCard>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Zoom>

            {/* לוח פעילות יומי מעוצב */}
            <Fade in timeout={1400}>
              <Box sx={{ mb: 8 }}>
                <Typography 
                  variant="h4" 
                  fontWeight="bold" 
                  textAlign="center" 
                  sx={{ 
                    mb: 6,
                    color: 'white',
                    textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  🎯 מה קורה בגן שלנו היום
                </Typography>
                <Grid container spacing={4}>
                  {/* אירועים השבוע */}
                  <Grid item xs={12} md={6} lg={3}>
                    <DashboardCard gradientColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                      <CardContent sx={{ p: 4, height: '100%', position: 'relative', zIndex: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                          <Avatar sx={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                            📅
                          </Avatar>
                          <Typography variant="h6" fontWeight="bold" color="white">
                            אירועים השבוע
                          </Typography>
                        </Stack>
                        <Stack spacing={2}>
                          {[
                            { day: 'היום - יום שני', activity: '🎨 פעילות יצירה - 10:00', color: 'rgba(255,255,255,0.9)' },
                            { day: 'מחר - יום שלישי', activity: '🏃‍♂️ ספורט וחינוך גופני - 11:00', color: 'rgba(255,255,255,0.8)' },
                            { day: 'יום חמישי', activity: '🎭 הצגת תיאטרון - 14:00', color: 'rgba(255,255,255,0.7)' }
                          ].map((event, index) => (
                            <Card key={index} sx={{ background: event.color, backdropFilter: 'blur(10px)', borderRadius: 2 }}>
                              <CardContent sx={{ p: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                                  {event.day}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {event.activity}
                                </Typography>
                              </CardContent>
                            </Card>
                          ))}
                        </Stack>
                      </CardContent>
                    </DashboardCard>
                  </Grid>

                  {/* מילוי נוכחות */}
                  <Grid item xs={12} md={6} lg={3}>
                    <DashboardCard gradientColor="linear-gradient(135deg, #10b981 0%, #34d399 100%)">
                      <CardActionArea 
                        onClick={() => navigate('/attendance')}
                        sx={{ height: '100%' }}
                      >
                        <CardContent sx={{ p: 4, height: '100%', position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column' }}>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                            <Avatar sx={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                              ✅
                            </Avatar>
                            <Typography variant="h6" fontWeight="bold" color="white">
                              נוכחות יומית
                            </Typography>
                          </Stack>
                          
                          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                            <Typography variant="h2" fontWeight="bold" color="white" sx={{ mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                              18/24
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
                              ילדים נוכחים היום
                            </Typography>
                            
                            <Button 
                              variant="contained" 
                              size="large"
                              startIcon={<CheckCircle />}
                              fullWidth
                              sx={{ 
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.3)',
                                '&:hover': {
                                  background: 'rgba(255,255,255,0.3)',
                                }
                              }}
                            >
                              עדכן נוכחות
                            </Button>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </DashboardCard>
                  </Grid>

                  {/* הישגים אחרונים */}
                  <Grid item xs={12} md={6} lg={3}>
                    <DashboardCard gradientColor="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)">
                      <CardContent sx={{ p: 4, height: '100%', position: 'relative', zIndex: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                          <Avatar sx={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                            🏆
                          </Avatar>
                          <Typography variant="h6" fontWeight="bold" color="white">
                            הישגים אחרונים
                          </Typography>
                        </Stack>
                        <Stack spacing={2}>
                          {[
                            { achievement: '🌟 יוסי - צעד ראשון!', time: 'לפני 2 ימים' },
                            { achievement: '🎨 שרה - יצירה מדהימה', time: 'לפני 3 ימים' },
                            { achievement: '🗣️ דוד - מילה חדשה', time: 'לפני שבוע' }
                          ].map((item, index) => (
                            <Card key={index} sx={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: 2 }}>
                              <CardContent sx={{ p: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="warning.dark">
                                  {item.achievement}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.time}
                                </Typography>
                              </CardContent>
                            </Card>
                          ))}
                        </Stack>
                      </CardContent>
                    </DashboardCard>
                  </Grid>

                  {/* הודעות חשובות */}
                  <Grid item xs={12} md={6} lg={3}>
                    <DashboardCard gradientColor="linear-gradient(135deg, #f093fb 0%, #e879f9 100%)">
                      <CardContent sx={{ p: 4, height: '100%', position: 'relative', zIndex: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                          <Avatar sx={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                            📢
                          </Avatar>
                          <Typography variant="h6" fontWeight="bold" color="white">
                            הודעות חשובות
                          </Typography>
                        </Stack>
                        <Stack spacing={2}>
                          {[
                            { message: '🔔 תזכורת חיסונים', detail: '3 ילדים צריכים עדכון חיסונים', urgent: true },
                            { message: '📝 טפסים חסרים', detail: '5 הורים לא מילאו טפסי בריאות', urgent: false },
                            { message: '🎉 חדש במערכת', detail: 'עדכון תכונות חדשות זמין', urgent: false }
                          ].map((item, index) => (
                            <Card key={index} sx={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: 2 }}>
                              <CardContent sx={{ p: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="secondary.dark">
                                  {item.message}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {item.detail}
                                </Typography>
                                {item.urgent && (
                                  <Chip label="דחוף" size="small" color="error" />
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </Stack>
                      </CardContent>
                    </DashboardCard>
                  </Grid>
                </Grid>
              </Box>
            </Fade>

            {/* פעולות מהירות */}
            <Zoom in timeout={1600}>
              <Box sx={{ mb: 8 }}>
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  textAlign="center"
                  sx={{ 
                    mb: 4,
                    color: 'white',
                    textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  ⚡ פעולות מהירות
                </Typography>
                <Grid container spacing={3}>
                  {quickActions.map((action, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Fade in timeout={1800 + (index * 100)}>
                        <QuickActionCard onClick={() => navigate(action.path)}>
                          <CardActionArea sx={{ p: 3, height: '100%' }}>
                            <Box sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <Avatar
                                className="action-icon"
                                sx={{
                                  background: `linear-gradient(135deg, ${rtlTheme.palette[action.color]?.main}, ${rtlTheme.palette[action.color]?.dark})`,
                                  width: 56,
                                  height: 56,
                                  mx: 'auto',
                                  mb: 2,
                                  boxShadow: `0 6px 20px ${alpha(rtlTheme.palette[action.color]?.main, 0.3)}`,
                                  transition: 'all 0.3s ease'
                                }}
                              >
                                {action.icon}
                              </Avatar>
                              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                {action.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {action.description}
                              </Typography>
                            </Box>
                          </CardActionArea>
                        </QuickActionCard>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Zoom>
          </Container>

          {/* כותרת תחתונה עם עיצוב זכוכית */}
          <Fade in timeout={2000}>
            <Paper 
              component="footer" 
              sx={{ 
                py: 4, 
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 0,
                mt: 'auto',
                position: 'relative',
                zIndex: 2,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, #667eea, #f093fb, #10b981, #667eea)',
                }
              }}
            >
              
            </Paper>
          </Fade>
        </FullScreenContainer>
      </Box>
    </ThemeProvider>
  );
};

export default HomePage;