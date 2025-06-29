import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import heLocale from '@fullcalendar/core/locales/he';
import { 
  Box, 
  CardContent, 
  Typography, 
  Fade, 
  CircularProgress,
  Stack,
  Avatar,
  Chip,
  Card,
  useTheme
} from '@mui/material';
import { 
  Event as EventIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  ChildCare as ChildIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';


import { useCalendar } from './CalendarContext';

// Styled container for FullCalendar
const CalendarContainer = styled(Box)(() => ({
  
  '& .fc': {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    background: 'transparent',
  },

  // Custom styling for all FullCalendar components
  '& .fc-toolbar': {
    padding: '24px',
    marginBottom: '20px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,255,0.95) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.3)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    position: 'relative',
    overflow: 'hidden',
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb, #667eea)',
      borderRadius: '20px 20px 0 0',
    }
  },

  '& .fc-toolbar-title': {
    fontSize: '2rem',
    fontWeight: 700,
    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '0 1rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },

  '& .fc-button': {
    borderRadius: '16px',
    padding: '12px 20px',
    fontWeight: 600,
    textTransform: 'none',
    border: 'none',
    boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: 'Rubik, sans-serif',
    position: 'relative',
    overflow: 'hidden',
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      transition: 'left 0.5s',
      zIndex: 1,
    },
    
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      
      '&::before': {
        left: '100%',
      }
    },
  },

  '& .fc-button-primary': {
    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
    color: 'white',
    
    '&:not(:disabled):active, &:not(:disabled).fc-button-active': {
      background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
      transform: 'translateY(-1px)',
    }
  },

  '& .fc-today-button:not(:disabled)': {
    background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
    color: 'white',
    
    '&:hover': {
      background: 'linear-gradient(45deg, #059669 30%, #10b981 90%)',
      transform: 'translateY(-3px) scale(1.05)',
    }
  },

  '& .fc-col-header': {
    background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
    borderRadius: '12px',
    margin: '4px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },

  '& .fc-col-header-cell': {
    padding: '16px 8px',
    border: 'none',
  },

  '& .fc-col-header-cell-cushion': {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '1.1em',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },

  '& .fc-daygrid-day, & .fc-timegrid-slot': {
    transition: 'all 0.3s ease',
    borderColor: 'rgba(0,0,0,0.05)',
    
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)',
      transform: 'scale(1.02)',
    }
  },

  '& .fc-day-today': {
    background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(52,211,153,0.1) 100%)',
    border: '2px solid rgba(16,185,129,0.3)',
    borderRadius: '8px',
    position: 'relative',
    
    '&::before': {
      content: '"🌟"',
      position: 'absolute',
      top: '8px',
      right: '8px',
      fontSize: '1.2em',
      zIndex: 2,
    }
  },

  // Event styling
  '& .fc-event': {
    borderRadius: '12px',
    border: 'none',
    borderRight: '5px solid currentColor',
    boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    margin: '2px 4px',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    overflow: 'hidden',
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
      transition: 'left 0.8s',
      zIndex: 1,
    },
    
    '&:hover': {
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      zIndex: 10,
      
      '&::before': {
        left: '100%',
      }
    }
  },

  '& .fc-event-title-container': {
    position: 'relative',
    zIndex: 2,
    padding: '8px 12px',
  },

  '& .fc-event-title': {
    fontWeight: 600,
    fontSize: '0.95em',
    lineHeight: 1.3,
    marginBottom: '4px',
    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },

  '& .fc-event-time': {
    fontWeight: 700,
    fontSize: '0.85em',
    opacity: 0.9,
    marginBottom: '2px',
    display: 'flex',
    alignItems: 'center',
    
    '&::before': {
      content: '"🕐"',
      marginLeft: '4px',
      fontSize: '0.9em',
    }
  },

  '& .fc-timegrid-now-indicator-line': {
    borderColor: '#ef4444',
    borderWidth: '3px',
    boxShadow: '0 0 10px rgba(239,68,68,0.5)',
    position: 'relative',
    
    '&::before': {
      content: '"🔴 עכשיו"',
      position: 'absolute',
      right: '10px',
      top: '-12px',
      background: '#ef4444',
      color: 'white',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '0.8em',
      fontWeight: 600,
      boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
      animation: 'pulse 2s infinite',
    }
  },

  '& .fc-timegrid-now-indicator-arrow': {
    borderColor: '#ef4444',
    borderWidth: '8px',
    filter: 'drop-shadow(0 2px 4px rgba(239,68,68,0.3))',
  },

  '@keyframes pulse': {
    '0%, 100%': {
      transform: 'scale(1)',
      opacity: 1,
    },
    '50%': {
      transform: 'scale(1.05)',
      opacity: 0.9,
    }
  },
}));

// Styled Loading component
const LoadingCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb, #667eea)',
    borderRadius: '20px 20px 0 0',
    animation: 'loading-shimmer 2s infinite',
  },
  '@keyframes loading-shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  }
}));



const CalendarView = ({
  calendarRef,
  events,
  isLoadingFromRedux
}) => {
  
  const {
    calendarView,
    handleDateClick,
    handleEventClick
  } = useCalendar();

  const theme = useTheme();

  // If loading events, display styled loading
  if (isLoadingFromRedux) {
    return (
      <Fade in timeout={500}>
        <LoadingCard>
          <CardContent sx={{ p: 4, textAlign: 'center', minHeight: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Stack spacing={3} alignItems="center">
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                animation: 'pulse 2s infinite'
              }}>
                <EventIcon sx={{ fontSize: '2.5rem' }} />
              </Avatar>
              
              <CircularProgress 
                size={60} 
                thickness={4}
                sx={{ 
                  color: 'primary.main',
                  filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))'
                }} 
              />
              
              <Box>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}>
                  טוען יומן...
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  מכין את האירועים שלך
                </Typography>
              </Box>
              
              <Stack direction="row" spacing={1}>
                <Chip 
                  label="אירועים" 
                  color="primary" 
                  variant="outlined"
                  icon={<EventIcon />}
                  sx={{ animation: 'pulse 1.5s infinite' }}
                />
                <Chip 
                  label="זמנים" 
                  color="secondary" 
                  variant="outlined"
                  icon={<TimeIcon />}
                  sx={{ animation: 'pulse 1.5s infinite 0.3s' }}
                />
                <Chip 
                  label="מיקומים" 
                  color="success" 
                  variant="outlined"
                  icon={<LocationIcon />}
                  sx={{ animation: 'pulse 1.5s infinite 0.6s' }}
                />
              </Stack>
            </Stack>
          </CardContent>
        </LoadingCard>
      </Fade>
    );
  }
  
  return (

    <Fade in timeout={800}>
      <CalendarContainer>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={calendarView}
          locale={heLocale}
          direction="rtl"
          headerToolbar={{
            right: 'next today prev',
            center: 'title',
            left: 'timeGridDay timeGridWeek dayGridMonth'
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          allDaySlot={false}
          slotMinTime="07:00:00"
          slotMaxTime="19:00:00"
          height="auto"
          aspectRatio={1.8}
          handleWindowResize={true}
          stickyHeaderDates={true}
          nowIndicator={true}
          
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          
          buttonText={{
            today: 'היום',
            month: 'חודש',
            week: 'שבוע',
            day: 'יום'
          }}
          
            // Date format in the title
          views={{
            timeGridDay: {
              titleFormat: { day: 'numeric', month: 'long', year: 'numeric' }
            },
            timeGridWeek: {
              titleFormat: { day: 'numeric', month: 'long', year: 'numeric' }
            },
            dayGridMonth: {
              titleFormat: { month: 'long', year: 'numeric' }
            }
          }}
          
          eventContent={renderEventContent}
          
          dayHeaderClassNames="fc-day-header"
          eventClassNames="fc-event-custom"
        />
      </CalendarContainer>
    </Fade>

  );
};

// Function to render event content
const renderEventContent = (eventInfo) => {
  const event = eventInfo.event;
  const location = event.extendedProps.location;
  const kidIds = event.extendedProps.kidIds || [];
  const employeeIds = event.extendedProps.employeeIds || [];
  const eventTimeC = (event.end - event.start) / (1000 * 60);

  let maxIcons = 0;
  if (eventTimeC >= 90) maxIcons = 3;
  else if (eventTimeC >= 60) maxIcons = 2;
  else if (eventTimeC >= 30) maxIcons = 1;

  const availableElements = [];

  if (location) {
    availableElements.push(
      <Box key="location" sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        fontSize: '0.8em',
        opacity: 0.85,
        marginTop: '2px'
      }}>
        <LocationIcon sx={{ fontSize: '0.9em', marginLeft: '2px' }} />
        <span>{location}</span>
      </Box>
    );
  }

  if (kidIds.length > 0) {
    availableElements.push(
      <Box key="kids" sx={{ 
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.25)',
        borderRadius: '12px',
        padding: '2px 6px',
        fontSize: '0.75em',
        fontWeight: 600,
        backdropFilter: 'blur(5px)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginTop: '2px'
      }}>
        <ChildIcon sx={{ fontSize: '0.9em', marginLeft: '2px' }} />
        <span>{kidIds.length}</span>
      </Box>
    );
  }

  if (employeeIds.length > 0) {
    availableElements.push(
      <Box key="employees" sx={{ 
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.25)',
        borderRadius: '12px',
        padding: '2px 6px',
        fontSize: '0.75em',
        fontWeight: 600,
        backdropFilter: 'blur(5px)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginTop: '2px',
        marginRight: '4px'
      }}>
        <PersonIcon sx={{ fontSize: '0.9em', marginLeft: '2px' }} />
        <span>{employeeIds.length}</span>
      </Box>
    );
  }

  const visibleElements = availableElements.slice(0, maxIcons);

  return (
    <Box sx={{ position: 'relative', zIndex: 2 }}>
      <Box sx={{ 
        fontWeight: 700,
        fontSize: '0.85em',
        opacity: 0.9,
        marginBottom: '2px',
        display: 'flex',
        alignItems: 'center'
      }}>
        {eventInfo.timeText}
      </Box>
      
      <Box>
        <Box sx={{ 
          fontWeight: 600,
          fontSize: '0.95em',
          lineHeight: 1.3,
          marginBottom: '4px',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>
          {event.title}
        </Box>
        
        {eventInfo.view.type !== 'dayGridMonth' && (
          <Stack direction="row" spacing={0.5} sx={{ marginTop: '4px' }}>
            {visibleElements}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

CalendarView.propTypes = {
  calendarRef: PropTypes.object,
  events: PropTypes.array.isRequired,
  isLoadingFromRedux: PropTypes.bool.isRequired,
};

export default CalendarView;