// src/pages/HomePage.jsx - עיצוב מקצועי RTL
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
  createTheme
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
  CheckCircle
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// יצירת theme עם תמיכה ב-RTL
const rtlTheme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2'
    }
  },
  typography: {
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif'
  }
});

// מסך מלא מותאם RTL
const FullScreenContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.primary.light, 0.06)} 0%, 
    ${alpha(theme.palette.background.default, 0.98)} 50%,
    ${alpha(theme.palette.secondary.light, 0.03)} 100%)`,
  display: 'flex',
  flexDirection: 'column'
}));

// כותרת עם עיצוב נקי
const ModernHeader = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  borderRadius: 0,
  boxShadow: '0 2px 20px rgba(0, 0, 0, 0.06)',
  borderBottom: `2px solid ${theme.palette.primary.main}`,
  position: 'sticky',
  top: 0,
  zIndex: 1000
}));

// כרטיס סטטיסטיקה מקצועי
const StatCard = styled(Card)(({ theme, color }) => ({
  padding: '32px 24px',
  textAlign: 'center',
  background: '#ffffff',
  borderRadius: '16px',
  border: `1px solid ${alpha(theme.palette.grey[200], 0.8)}`,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  position: 'relative',
  height: '160px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: `0 12px 40px rgba(0, 0, 0, 0.12)`,
    borderColor: theme.palette[color]?.main
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette[color]?.main}, ${theme.palette[color]?.light})`,
    borderRadius: '16px 16px 0 0'
  }
}));

// כרטיס תכונה מקצועי
const FeatureCard = styled(Card)(({ theme }) => ({
  height: '280px',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '20px',
  background: '#ffffff',
  border: `1px solid ${alpha(theme.palette.grey[200], 0.6)}`,
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
    '& .feature-icon': {
      transform: 'scale(1.1)',
    }
  }
}));

// אייקון מעוצב
const StyledIcon = styled(Avatar)(({ theme, color }) => ({
  width: 72,
  height: 72,
  margin: '0 auto 20px',
  background: `linear-gradient(135deg, ${theme.palette[color]?.main}, ${theme.palette[color]?.dark})`,
  color: 'white',
  fontSize: '2rem',
  transition: 'transform 0.3s ease',
  boxShadow: `0 8px 24px ${alpha(theme.palette[color]?.main, 0.3)}`
}));

const HomePage = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'ילדים פעילים', value: '24', icon: <GroupIcon fontSize="large" />, color: 'primary' },
    { label: 'הושלמו השבוע', value: '8', icon: <CompleteIcon fontSize="large" />, color: 'success' },
    { label: 'בתהליך כעת', value: '12', icon: <ProgressIcon fontSize="large" />, color: 'warning' },
    { label: 'אחוז השלמה', value: '85%', icon: <TrendingIcon fontSize="large" />, color: 'info' }
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
      color: 'info',
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
      color: 'error',
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
      color: 'info',
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
          {/* כותרת מקצועית */}
          <ModernHeader elevation={0}>
            <Container maxWidth="lg">
              <Box 
                sx={{ 
                  py: 2.5, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      width: 48, 
                      height: 48,
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    }}
                  >
                    🌟
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="h5" 
                      fontWeight="bold" 
                      color="primary.main"
                      sx={{ lineHeight: 1.2 }}
                    >
                      Halo Care
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    variant="text"
                    startIcon={<ContactIcon />}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none'
                    }}
                  >
                    צור קשר
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LoginIcon />}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 'medium'
                    }}
                  >
                    כניסה למערכת
                  </Button>
                </Box>
              </Box>
            </Container>
          </ModernHeader>

          {/* תוכן ראשי */}
          <Container maxWidth="lg" sx={{ flex: 1, py: 6 }}>
            {/* סטטיסטיקות מרכזיות */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: 8 
            }}>
              <Grid container spacing={3} sx={{ maxWidth: '800px' }}>
                {stats.map((stat, index) => (
                  <Grid item xs={6} md={3} key={index}>
                    <StatCard color={stat.color}>
                      <Avatar
                        sx={{
                          bgcolor: `${stat.color}.main`,
                          width: 56,
                          height: 56,
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                      <Typography variant="h3" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight="medium">
                        {stat.label}
                      </Typography>
                    </StatCard>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* לוח פעילות יומי */}
            <Box sx={{ mb: 6 }}>
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                textAlign="center" 
                sx={{ mb: 4 }}
                color="text.primary"
              >
                מה קורה בגן שלנו היום 🌟
              </Typography>
              <Grid container spacing={3}>
                {/* אירועים השבוע */}
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ 
                    height: '320px', 
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
                    border: '1px solid #e1f5fe',
                    borderRadius: '16px',
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <CardContent sx={{ p: 3, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          📅
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold">
                          אירועים השבוע
                        </Typography>
                      </Box>
                      <Box sx={{ space: 2 }}>
                        <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                            היום - יום שני
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            🎨 פעילות יצירה - 10:00
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                            מחר - יום שלישי
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            🏃‍♂️ ספורט וחינוך גופני - 11:00
                          </Typography>
                        </Box>
                        <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="warning.main">
                            יום חמישי
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            🎭 הצגת תיאטרון - 14:00
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* מילוי נוכחות */}
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ 
                    height: '320px', 
                    background: 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)',
                    border: '1px solid #c8e6c9',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}
                  onClick={() => navigate('/attendance')}
                  >
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                          ✅
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold">
                          נוכחות יומית
                        </Typography>
                      </Box>
                      
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                        <Typography variant="h2" fontWeight="bold" color="success.main" sx={{ mb: 1 }}>
                          18/24
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                          ילדים נוכחים היום
                        </Typography>
                        
                        <Button 
                          variant="contained" 
                          color="success"
                          size="large"
                          startIcon={<CheckCircle />}
                          fullWidth
                          sx={{ borderRadius: 3 }}
                        >
                          עדכן נוכחות
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* הישגים אחרונים */}
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ 
                    height: '320px', 
                    background: 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)',
                    border: '1px solid #ffcc02',
                    borderRadius: '16px',
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <CardContent sx={{ p: 3, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                          🏆
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold">
                          הישגים אחרונים
                        </Typography>
                      </Box>
                      <Box sx={{ space: 1.5 }}>
                        <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 2, border: '1px solid #ffe082' }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="warning.dark">
                            🌟 יוסי - צעד ראשון!
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            לפני 2 ימים
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 2, border: '1px solid #ffe082' }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="warning.dark">
                            🎨 שרה - יצירה מדהימה
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            לפני 3 ימים
                          </Typography>
                        </Box>
                        <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 2, border: '1px solid #ffe082' }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="warning.dark">
                            🗣️ דוד - מילה חדשה
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            לפני שבוע
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* הודעות חשובות */}
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ 
                    height: '320px', 
                    background: 'linear-gradient(135deg, #fce4ec 0%, #ffffff 100%)',
                    border: '1px solid #f8bbd9',
                    borderRadius: '16px',
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <CardContent sx={{ p: 3, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                          📢
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold">
                          הודעות חשובות
                        </Typography>
                      </Box>
                      <Box sx={{ space: 1.5 }}>
                        <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 2, border: '1px solid #f48fb1' }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="secondary.dark">
                            🔔 תזכורת חיסונים
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            3 ילדים צריכים עדכון חיסונים
                          </Typography>
                          <Chip label="דחוף" size="small" color="error" sx={{ mt: 1 }} />
                        </Box>
                        <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 2, border: '1px solid #f48fb1' }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="secondary.dark">
                            📝 טפסים חסרים
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            5 הורים לא מילאו טפסי בריאות
                          </Typography>
                        </Box>
                        <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 2, border: '1px solid #f48fb1' }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="secondary.dark">
                            🎉 חדש במערכת
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            עדכון תכונות חדשות זמין
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            {/* פעולות מהירות */}
            <Box sx={{ mb: 6 }}>
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                sx={{ mb: 3 }}
                color="text.primary"
              >
                פעולות מהירות
              </Typography>
              <Grid container spacing={3}>
                {quickActions.map((action, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card 
                      sx={{ 
                        height: '140px',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        borderRadius: '12px',
                        background: '#ffffff',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3
                        }
                      }}
                      onClick={() => navigate(action.path)}
                    >
                      <CardActionArea sx={{ p: 3, height: '100%' }}>
                        <Box sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <Avatar
                            sx={{
                              bgcolor: `${action.color}.main`,
                              width: 48,
                              height: 48,
                              mx: 'auto',
                              mb: 1.5
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
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Container>

          {/* כותרת תחתונה */}
          <Paper 
            component="footer" 
            sx={{ 
              py: 4, 
              textAlign: 'center',
              background: '#ffffff',
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
              mt: 'auto'
            }}
          >
            <Container maxWidth="lg">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                © 2025 Halo Care. כל הזכויות שמורות.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                מערכת ניהול מתקדמת לגני ילדים מיוחדים - פותח באהבה לילדים ולחינוך 💙
              </Typography>
            </Container>
          </Paper>
        </FullScreenContainer>
      </Box>
    </ThemeProvider>
  );
};

export default HomePage;