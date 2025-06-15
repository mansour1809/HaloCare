import { useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  IconButton, 
  Tooltip, 
  CircularProgress,
  Container,
  Card,
  CardContent,
  Chip,
  Stack,
  Fade,
  Zoom,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Add as AddIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  CalendarMonth as CalendarIcon,
  Event as EventIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

// קומפוננטות משנה
import CalendarFilter from './CalendarFilter';
import CalendarView from './CalendarView';
import EventDialog from './EventDialog';

// שימוש בקונטקסט
import { useCalendar } from './CalendarContext';

// תמה מדהימה מותאמת
const calendarTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2.5rem',
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
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      paper: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
          '&:hover': {
            transform: 'translateY(-3px)',
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
            background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb, #667eea)',
            borderRadius: '20px 20px 0 0',
          }
        }
      }
    }
  }
});

// קונטיינר עם רקע מדהים
const GradientContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

// כותרת מעוצבת עם אנימציה
const AnimatedHeader = styled(Box)(({ theme }) => ({
  position: 'relative',
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -10,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 100,
    height: 4,
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    borderRadius: 2,
  }
}));

// כרטיס כלי בקרה מעוצב
const ControlCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '&::before': {
    background: 'linear-gradient(90deg, #10b981, #34d399, #059669)',
  }
}));

// כרטיס יומן ראשי
const CalendarCard = styled(Card)(({ theme }) => ({
  '&::before': {
    background: 'linear-gradient(90deg, #667eea, #818cf8, #4338ca)',
  }
}));

// סטטיסטיקה מעוצבת
const StatsChip = styled(Chip)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 600,
  padding: '8px 16px',
  background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
  color: 'white',
  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
  },
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

// כפתור מעוצב עם אפקטים
const GlowButton = styled(Button)(({ theme, glowColor = '#667eea' }) => ({
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(glowColor, 0.4)}, transparent)`,
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  }
}));

const Calendar = () => {
  // שימוש בערכים ופונקציות מהקונטקסט
  const {
    events,
    filteredEvents,
    isLoading,
    isLoadingFromRedux,
    showFilterForm,
    filterOptions, 
    fetchEvents,
    createNewEvent,
    setShowFilterForm,
  } = useCalendar();
  
  const theme = useTheme();
  
  // הפניה ל-fullCalendar
  const calendarRef = useRef(null);

  // קביעת האירועים המוצגים - מסוננים או הכל
  const displayEvents = filterOptions.kidId || filterOptions.employeeId || filterOptions.eventTypeId 
    ? filteredEvents 
    : events;
  
  // בדיקה אם יש מסננים פעילים
  const hasActiveFilters = filterOptions.kidId || filterOptions.employeeId || filterOptions.eventTypeId;
  
  return (
    <ThemeProvider theme={calendarTheme}>
      <GradientContainer maxWidth="xl" dir="rtl">
        {/* כותרת ראשית מעוצבת */}
        <Fade in timeout={800}>
          <AnimatedHeader>
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
              יומן מרכז הטיפול
              {hasActiveFilters && (
                <Chip 
                  label="מסונן" 
                  size="small" 
                  sx={{ 
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)'
                  }} 
                />
              )}
            </Typography>
          </AnimatedHeader>
        </Fade>

        {/* כלי בקרה */}
        <Zoom in timeout={1000}>
          <ControlCard>
            <CardContent sx={{ p: 3 }}>
              <Stack 
                direction={{ xs: 'column', md: 'row' }} 
                spacing={2} 
                alignItems="center" 
                justifyContent="space-between"
              >
                {/* סטטיסטיקות */}
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
                    <StatsChip 
                      label={`${displayEvents.length} אירועים`}
                      icon={<AutoAwesomeIcon />}
                    />
                  </Box>
                  
                  {hasActiveFilters && (
                    <Chip 
                      label="סינון פעיל" 
                      color="warning" 
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Stack>

                {/* כפתורי פעולה */}
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <GlowButton 
                    variant="contained" 
                    color="primary" 
                    startIcon={<AddIcon />}
                    onClick={createNewEvent}
                    glowColor="#667eea"
                    sx={{ minWidth: 140 }}
                  >
                    אירוע חדש
                  </GlowButton>
                  
                  <GlowButton
                    variant={showFilterForm ? "contained" : "outlined"}
                    color={showFilterForm ? "secondary" : "primary"}
                    startIcon={<FilterListIcon />}
                    onClick={() => setShowFilterForm(!showFilterForm)}
                    glowColor={showFilterForm ? "#f093fb" : "#667eea"}
                  >
                    {showFilterForm ? "הסתר סינון" : "סינון"}
                  </GlowButton>
                  
                  <Tooltip title="רענן יומן" arrow>
                    <IconButton 
                      onClick={fetchEvents}
                      disabled={isLoading}
                      sx={{ 
                        background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
                        color: 'white',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                        '&:hover': {
                          transform: 'scale(1.1) rotate(180deg)',
                          boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                        },
                        '&:disabled': {
                          background: 'rgba(0,0,0,0.12)',
                          color: 'rgba(0,0,0,0.26)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      {isLoading ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                      ) : (
                        <RefreshIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </CardContent>
          </ControlCard>
        </Zoom>
        
        {/* טופס סינון */}
        {showFilterForm && (
          <Fade in timeout={500}>
            <Box>
              <CalendarFilter />
            </Box>
          </Fade>
        )}
        
        {/* היומן עצמו */}
        <Zoom in timeout={1200}>
          <CalendarCard>
            <CardContent sx={{ p: 0 }}>
              <CalendarView 
                calendarRef={calendarRef}
                events={displayEvents}
                isLoadingFromRedux={isLoadingFromRedux}
              />
            </CardContent>
          </CalendarCard>
        </Zoom>
        
        {/* דיאלוג עריכה/יצירה של אירוע */}
        <EventDialog />
      </GradientContainer>
    </ThemeProvider>
  );
};

export default Calendar;