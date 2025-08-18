// Calendar.jsx - קומפוננטה ראשית מחודשת
import React, { useRef } from 'react';
import { 
  Box, 
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
  Badge,
  Avatar,
  Divider,
  alpha
} from '@mui/material';
import { 
  Add as AddIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  CalendarMonth as CalendarIcon,
  Event as EventIcon,
  Today as TodayIcon,
  ViewWeek as WeekIcon,
  ViewDay as DayIcon,
  ViewList as AgendaIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

// Import components
import CalendarFilter from './CalendarFilter';
import ModernCalendarView from './ModernCalendarView'; 
import EventDialog from './EventDialog';
import { useCalendar } from './CalendarContext';

// Professional animations
const gradientShift = keyframes`
  0% { backgroundPosition: 0% 50%; }
  50% { backgroundPosition: 100% 50%; }
  100% { backgroundPosition: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components
const GradientContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 20s ease infinite`,
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
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

const HeaderCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 20,
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  marginBottom: theme.spacing(3),
  position: 'relative',
  zIndex: 1,
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    animation: `${shimmer} 3s infinite`,
  }
}));

const ControlCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 20,
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  marginBottom: theme.spacing(3),
  position: 'relative',
  zIndex: 1,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #10b981, #34d399, #10b981)',
    animation: `${gradientShift} 3s ease infinite`,
  }
}));

const CalendarCard = styled(Card)(() => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 20,
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  position: 'relative',
  zIndex: 1,
  overflow: 'visible',
  minHeight: '700px',
}));

const StatsChip = styled(Chip)(() => ({
  borderRadius: 8,
  fontWeight: 600,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  }
}));

const GlowButton = styled(Button)(({  glowColor = '#4cb5c3' }) => ({
  borderRadius: 16,
  textTransform: 'none',
  fontWeight: 600,
  padding: '10px 20px',
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(45deg, ${glowColor} 30%, ${alpha(glowColor, 0.8)} 90%)`,
  color: 'white',
  boxShadow: `0 6px 20px ${alpha(glowColor, 0.3)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 12px 35px ${alpha(glowColor, 0.4)}`,
    '&::after': {
      left: '100%',
    }
  }
}));

const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
  background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
  color: 'white',
  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.1) rotate(180deg)',
    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
    background: 'linear-gradient(45deg, #059669 30%, #10b981 90%)',
  },
  '&:disabled': {
    background: 'rgba(0,0,0,0.12)',
    color: 'rgba(0,0,0,0.26)',
  }
}));

const ViewButton = styled(IconButton)(({ theme, active }) => ({
  background: active ? 
    'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)' : 
    'rgba(255, 255, 255, 0.8)',
  color: active ? 'white' : '#4cb5c3',
  boxShadow: active ? 
    '0 6px 20px rgba(76, 181, 195, 0.3)' : 
    '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(76, 181, 195, 0.3)',
    background: active ? 
      'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)' : 
      'rgba(76, 181, 195, 0.1)',
  }
}));

const Calendar = () => {
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
    handleDateClick,
    handleEventClick,
    eventTypes
  } = useCalendar();
  
  const calendarRef = useRef(null);
  const [currentView, setCurrentView] = React.useState('month');

  const displayEvents = filterOptions.kidId || filterOptions.employeeId || filterOptions.eventTypeId 
    ? filteredEvents 
    : events;
  
  const hasActiveFilters = filterOptions.kidId || filterOptions.employeeId || filterOptions.eventTypeId;
  
  // סטטיסטיקות
  const todayEvents = displayEvents.filter(event => {
    const eventDate = new Date(event.start);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  });
  
  const weekEvents = displayEvents.filter(event => {
    const eventDate = new Date(event.start);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate >= today && eventDate <= weekFromNow;
  });
  
  // Handle slot selection (for creating new events)
  const handleSelectSlot = (slotInfo) => {
    handleDateClick({ 
      date: slotInfo.start,
      dateStr: slotInfo.start.toISOString() 
    });
  };
  
  // Handle event selection
  const handleSelectEvent = (event) => {
    const fullEvent = displayEvents.find(e => e.id === event.id);
    if (fullEvent) {
      handleEventClick({ event: fullEvent });
    }
  };
  
  return (
    <GradientContainer maxWidth="xl" dir="rtl">
      {/* Header */}
      <Fade in timeout={800}>
        <HeaderCard>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar sx={{ 
                  width: 70, 
                  height: 70,
                  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
                  boxShadow: '0 8px 25px rgba(76, 181, 195, 0.3)',
                  animation: `${float} 3s ease-in-out infinite`
                }}>
                  <CalendarIcon sx={{ fontSize: '2.5rem' }} />
                </Avatar>
                
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    לוח שנה
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ניהול אירועים ופגישות
                  </Typography>
                </Box>
              </Stack>
              
              {/* Statistics */}
              <Stack direction="row" spacing={2}>
                <StatsChip
                  icon={<TodayIcon />}
                  label={`${todayEvents.length} היום`}
                  color="success"
                />
                <StatsChip
                  icon={<WeekIcon />}
                  label={`${weekEvents.length} השבוע`}
                  color="primary"
                />
                <StatsChip
                  icon={<EventIcon />}
                  label={`${displayEvents.length} סה״כ`}
                  color="secondary"
                />
                {hasActiveFilters && (
                  <StatsChip
                    icon={<FilterListIcon />}
                    label="מסונן"
                    color="warning"
                  />
                )}
              </Stack>
            </Stack>
          </CardContent>
        </HeaderCard>
      </Fade>
      
      {/* Control Panel */}
      <Zoom in timeout={1000}>
        <ControlCard>
          <CardContent sx={{ p: 2.5 }}>
            <Stack 
              direction={{ xs: 'column', md: 'row' }} 
              spacing={2} 
              alignItems="center" 
              justifyContent="space-between"
            >
              {/* Action buttons */}
              <Stack direction="row" spacing={2} alignItems="center">
                <GlowButton 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={createNewEvent}
                  glowColor="#4cb5c3"
                  sx={{ minWidth: 140 }}
                >
                  אירוע חדש
                </GlowButton>
                
                <GlowButton
                  variant={showFilterForm ? "contained" : "outlined"}
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowFilterForm(!showFilterForm)}
                  glowColor={showFilterForm ? "#ff7043" : "#4cb5c3"}
                  sx={{ 
                    background: showFilterForm ? 
                      'linear-gradient(45deg, #ff7043 30%, #ff9575 90%)' : 
                      'transparent',
                    border: showFilterForm ? 'none' : '2px solid #4cb5c3',
                    color: showFilterForm ? 'white' : '#4cb5c3',
                  }}
                >
                  {showFilterForm ? "הסתר סינון" : "סינון"}
                </GlowButton>
              </Stack>
              
              
            </Stack>
          </CardContent>
        </ControlCard>
      </Zoom>
      
      {/* Filter form */}
      {showFilterForm && (
        <Fade in timeout={500}>
          <Box sx={{ mb: 3 }}>
            <CalendarFilter />
          </Box>
        </Fade>
      )}
      
      {/* Calendar Component - Using the new Modern Calendar */}
      <Zoom in timeout={1200}>
        <CalendarCard>
          <CardContent sx={{ p: 0 }}>
            <ModernCalendarView 
              events={displayEvents}
              isLoading={isLoadingFromRedux}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              currentView={currentView}
              eventTypes={eventTypes}
            />
          </CardContent>
        </CalendarCard>
      </Zoom>
      
      {/* Event Dialog */}
      <EventDialog />
    </GradientContainer>
  );
};

export default Calendar;