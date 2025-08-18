// ============================================
// תחילה צריך להתקין:
// npm install react-big-calendar moment moment-timezone
// npm install date-fns date-fns-tz
// ============================================

// CalendarView.jsx - יומן מודרני עם React Big Calendar
import React, { useMemo, useCallback, useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/he';
import { 
  Box, 
  Paper,
  Typography, 
  Chip,
  Avatar,
  Stack,
  Tooltip,
  Card,
  CardContent,
  CircularProgress,
  Fade,
  useTheme,
  alpha,
  styled
} from '@mui/material';
import { 
  Event as EventIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  ChildCare as ChildIcon,
  Circle as CircleIcon
} from '@mui/icons-material';

import 'react-big-calendar/lib/css/react-big-calendar.css';

// הגדרת moment לעברית מלאה
moment.updateLocale('he', {
  months: [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ],
  monthsShort: [
    'ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני',
    'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'
  ],
  weekdays: [
    'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'
  ],
  weekdaysShort: [
    'א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'
  ],
  weekdaysMin: [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'
  ]
});
moment.locale('he');
const localizer = momentLocalizer(moment);

// Messages בעברית
const messages = {
  allDay: 'כל היום',
  previous: 'הקודם',
  next: 'הבא',
  today: 'היום',
  month: 'חודש',
  week: 'שבוע',
  day: 'יום',
  agenda: 'סדר יום',
  date: 'תאריך',
  time: 'זמן',
  event: 'אירוע',
  noEventsInRange: 'אין אירועים בטווח זה',
  showMore: total => `+ ${total} נוספים`,
  tomorrow: 'מחר',
  yesterday: 'אתמול',
  work_week: 'שבוע עבודה'
};

// Styled Components
const CalendarContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  width: '100%',
  padding: theme.spacing(2),
  
  // עיצוב כללי ליומן
  '& .rbc-calendar': {
    fontFamily: 'Rubik, Heebo, sans-serif',
    background: 'transparent',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  
  // Toolbar - כפתורים וכותרת
  '& .rbc-toolbar': {
    padding: '16px 20px',
    marginBottom: '20px',
    borderRadius: 16,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    justifyContent: 'space-between',
    alignItems: 'center',
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    }
  },
  
  '& .rbc-toolbar-label': {
    fontSize: '1.5rem',
    fontWeight: 700,
    background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    flex: '1 1 auto',
    textAlign: 'center',
  },
  
  '& .rbc-btn-group button': {
    padding: '8px 16px',
    borderRadius: 12,
    border: '1px solid #e0e0e0',
    background: 'white',
    color: '#4cb5c3',
    fontWeight: 600,
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    margin: '0 2px',
    
    '&:hover': {
      background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
      color: 'white',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(76, 181, 195, 0.3)',
    },
    
    '&.rbc-active': {
      background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(76, 181, 195, 0.3)',
    },
    
    '&:focus': {
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(76, 181, 195, 0.2)',
    }
  },
  
  // Headers - ימים/שעות
  '& .rbc-header': {
    padding: '12px',
    background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.08) 0%, rgba(255, 112, 67, 0.08) 100%)',
    borderBottom: '2px solid rgba(76, 181, 195, 0.2)',
    fontWeight: 700,
    fontSize: '0.95rem',
    color: '#4cb5c3',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  
  // תאים ביומן
  '& .rbc-month-view, & .rbc-time-view': {
    background: 'white',
    borderRadius: '0 0 16px 16px',
    overflow: 'hidden',
  },
  
  '& .rbc-day-bg': {
    transition: 'all 0.2s ease',
    
    '&:hover': {
      background: 'rgba(76, 181, 195, 0.05)',
    }
  },
  
  '& .rbc-off-range-bg': {
    background: 'rgba(0, 0, 0, 0.03)',
  },
  
  '& .rbc-today': {
    background: 'rgba(16, 185, 129, 0.08)',
    position: 'relative',
    
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      border: '2px solid #10b981',
      pointerEvents: 'none',
    }
  },
  
  '& .rbc-current-time-indicator': {
    backgroundColor: '#ef4444',
    height: '2px',
  },
  
  // אירועים
  '& .rbc-event': {
    borderRadius: 8,
    border: 'none',
    padding: '4px 8px',
    fontSize: '0.85rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    overflow: 'hidden',
    
    '&:hover': {
      transform: 'translateY(-2px) scale(1.02)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 10,
    },
    
    '&:focus': {
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(76, 181, 195, 0.3)',
    }
  },
  
  '& .rbc-event-label': {
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  
  '& .rbc-event-content': {
    whiteSpace: 'normal',
    lineHeight: 1.3,
  },
  
  // CSS for week view - cleaner look
  
  '& .rbc-time-view': {
    background: 'white',
    borderRadius: '0 0 16px 16px',
    overflow: 'hidden',

    '& .rbc-row': {
      minHeight: 'auto',  // או 'unset !important'
    },
    '& .rbc-time-header': {
      borderBottom: '2px solid rgba(76, 181, 195, 0.2)',
    },
    
    '& .rbc-time-content': {
      borderTop: 'none',
    },
    
    '& .rbc-day-slot': {
      '& .rbc-events-container': {
        margin: '0 2px',
      }
    },
    '& .rbc-label.rbc-time-header-gutter': {
    width: '52.6px !important',
    maxWidth: '52.6px !important',
    minWidth: '52.6px !important',
  },

  },



  '& .rbc-time-slot': {
    minHeight: '60px',
    borderTop: '1px dotted rgba(0, 0, 0, 0.05)', 
  },
  
  '& .rbc-timeslot-group': {
    minHeight: '60px',
    borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
  },
  
  '& .rbc-time-column': {
    position: 'relative',
  },
  
  '& .rbc-day-column': {
    borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
  },
  
  '& .rbc-time-header-gutter': {
    fontSize: '0.85rem',
    color: '#6b7280',
  },
  
  '& .rbc-label': {
    fontSize: '0.85rem',
    color: '#6b7280',
    fontWeight: 500,
    padding: '0 8px',
  },
  
  // Show more
  '& .rbc-show-more': {
    background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
    color: 'white',
    padding: '2px 8px',
    borderRadius: 8,
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 2px 8px rgba(76, 181, 195, 0.3)',
    }
  },
  
  // Selected
  '& .rbc-selected': {
    backgroundColor: 'rgba(76, 181, 195, 0.1) !important',
  },
  
  // Agenda view
  '& .rbc-agenda-view': {
    '& table': {
      borderCollapse: 'separate',
      borderSpacing: '0 8px',
    },
    
    '& tbody tr': {
      background: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      
      '&:hover': {
        transform: 'translateX(-4px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }
    },
    
    '& td': {
      padding: '12px',
      
      '&:first-of-type': {
        borderRadius: '12px 0 0 12px',
      },
      
      '&:last-child': {
        borderRadius: '0 12px 12px 0',
      }
    }
  }
}));

// Loading Component
const LoadingCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 20,
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  minHeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// פונקציה לקבלת צבע לפי סוג אירוע - מהשרת
const getEventColor = (event, eventTypes) => {
  // נסה לקבל צבע מהאירוע עצמו
  let color = event.resource?.color || event.backgroundColor || event.color;
  
  // אם אין צבע באירוע, חפש בסוגי האירועים
  if (!color && event.resource?.eventTypeId && eventTypes) {
    const eventType = eventTypes.find(type => 
      type.eventTypeId === event.resource.eventTypeId
    );
    color = eventType?.color;
  }
  
  // אם עדיין אין צבע, השתמש בברירת מחדל
  if (!color) {
    color = '#6b7280';
  }
  
  // המר צבע HEX לגרדיאנט
  const hexToGradient = (hex) => {
    // אם זה כבר גרדיאנט, החזר אותו
    if (hex.includes('gradient')) return hex;
    
    // צור גרדיאנט מצבע HEX
    const lighterColor = hex + '99'; // הוסף שקיפות
    return `linear-gradient(45deg, ${hex} 30%, ${lighterColor} 90%)`;
  };
  
  return { 
    bg: hexToGradient(color), 
    text: 'white' 
  };
};

const ModernCalendarView = ({ 
  events = [], 
  isLoading = false,
  onSelectEvent,
  onSelectSlot,
  selectedDate = new Date(),
  eventTypes = [] // הוסף את סוגי האירועים
}) => {
  const theme = useTheme();
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(selectedDate);
  
  // המרת אירועים לפורמט של React Big Calendar
  const calendarEvents = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start),
      end: new Date(event.end),
      resource: {
        ...event.extendedProps,
        eventTypeId: event.extendedProps?.eventTypeId || event.eventTypeId,
        color: event.backgroundColor || event.color,
        location: event.extendedProps?.location,
        kidIds: event.extendedProps?.kidIds || [],
        employeeIds: event.extendedProps?.employeeIds || []
      }
    }));
  }, [events]);
  
  // Custom Event Component
  const EventComponent = useCallback(({ event }) => {
    const eventColor = getEventColor(event, eventTypes);
    const hasLocation = event.resource?.location;
    const kidsCount = event.resource?.kidIds?.length || 0;
    const employeesCount = event.resource?.employeeIds?.length || 0;
    
    return (
      <Tooltip
        title={
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {event.title}
            </Typography>
            <Typography variant="caption" display="block">
              {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
            </Typography>
            {hasLocation && (
              <Typography variant="caption" display="block">
                📍 {event.resource.location}
              </Typography>
            )}
            {kidsCount > 0 && (
              <Typography variant="caption" display="block">
                👶 {kidsCount} ילדים
              </Typography>
            )}
            {employeesCount > 0 && (
              <Typography variant="caption" display="block">
                👤 {employeesCount} עובדים
              </Typography>
            )}
          </Box>
        }
        arrow
        placement="top"
      >
        <Box
          sx={{
            height: '100%',
            padding: '2px 6px',
            borderRadius: 1,
            background: eventColor.bg,
            color: eventColor.text,
            fontSize: '0.8rem',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.02)',
              zIndex: 10,
            }
          }}
        >
          <CircleIcon sx={{ fontSize: '0.5rem' }} />
          <span>{event.title}</span>
          {view !== Views.MONTH && (
            <Stack direction="row" spacing={0.5} sx={{ ml: 'auto' }}>
              {hasLocation && <LocationIcon sx={{ fontSize: '0.7rem' }} />}
              {kidsCount > 0 && (
                <Chip 
                  size="small" 
                  label={kidsCount} 
                  sx={{ 
                    height: '16px', 
                    fontSize: '0.6rem',
                    backgroundColor: 'rgba(255,255,255,0.3)'
                  }} 
                />
              )}
            </Stack>
          )}
        </Box>
      </Tooltip>
    );
  }, [view, eventTypes]);
  
  // Custom Date Cell Wrapper for month view
  const DateCellWrapper = useCallback(({ children, value }) => {
    const isToday = moment(value).isSame(moment(), 'day');
    
    return (
      <Box
        sx={{
          height: '100%',
          position: 'relative',
          '& .rbc-day-bg': {
            cursor: 'pointer',
          }
        }}
      >
        {isToday && (
          <Chip
            label="היום"
            size="small"
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              zIndex: 1,
              height: '20px',
              fontSize: '0.7rem',
              background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
              color: 'white',
              fontWeight: 600,
            }}
          />
        )}
        {children}
      </Box>
    );
  }, []);
  
  // Event style getter
  const eventStyleGetter = useCallback((event) => {
    const eventColor = getEventColor(event, eventTypes);
    
    return {
      style: {
        background: eventColor.bg,
        color: eventColor.text,
        border: 'none',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: 500,
        padding: '4px 8px',
      }
    };
  }, [eventTypes]);
  
  // Handlers
  const handleSelectSlot = useCallback((slotInfo) => {
    if (onSelectSlot) {
      onSelectSlot({
        start: slotInfo.start,
        end: slotInfo.end || slotInfo.start,
        action: slotInfo.action
      });
    }
  }, [onSelectSlot]);
  
  const handleSelectEvent = useCallback((event) => {
    if (onSelectEvent) {
      onSelectEvent(event);
    }
  }, [onSelectEvent]);
  
  if (isLoading) {
    return (
      <Fade in timeout={500}>
        <LoadingCard>
          <CardContent sx={{ textAlign: 'center' }}>
            <Stack spacing={3} alignItems="center">
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                animation: 'pulse 2s infinite'
              }}>
                <EventIcon sx={{ fontSize: '2.5rem' }} />
              </Avatar>
              
              <CircularProgress 
                size={60} 
                sx={{ color: '#4cb5c3' }}
              />
              
              <Typography variant="h5" sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                טוען יומן...
              </Typography>
            </Stack>
            
            <style>
              {`
                @keyframes pulse {
                  0%, 100% { transform: scale(1); opacity: 1; }
                  50% { transform: scale(1.05); opacity: 0.8; }
                }
              `}
            </style>
          </CardContent>
        </LoadingCard>
      </Fade>
    );
  }
  
  return (
    <Fade in timeout={800}>
      <CalendarContainer>
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700, width: '100%' }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          messages={messages}
          rtl={true}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent,
            dateCellWrapper: DateCellWrapper,
          }}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          defaultView={Views.MONTH}
          step={30}
          showMultiDayTimes
          min={new Date(0, 0, 0, 7, 0, 0)}
          max={new Date(0, 0, 0, 19, 0, 0)}
          formats={{
            dayFormat: (date, culture, localizer) =>
localizer.format(date, 'ddd DD/MM', culture),
                        weekdayFormat: (date, culture, localizer) =>
              localizer.format(date, 'dddd', culture),
            monthHeaderFormat: (date, culture, localizer) =>
              localizer.format(date, 'MMMM YYYY', culture),
            dayHeaderFormat: (date, culture, localizer) =>
              localizer.format(date, 'dddd DD/MM/YYYY', culture),
            dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
              `${localizer.format(start, 'DD/MM/YYYY', culture)} - ${localizer.format(end, 'DD/MM/YYYY', culture)}`,
            agendaDateFormat: (date, culture, localizer) =>
              localizer.format(date, 'DD/MM/YYYY', culture),
            agendaTimeFormat: (date, culture, localizer) =>
              localizer.format(date, 'HH:mm', culture),
            agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
              `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
            timeGutterFormat: (date, culture, localizer) =>
              localizer.format(date, 'HH:mm', culture),
            eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
              `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
            selectRangeFormat: ({ start, end }, culture, localizer) =>
              `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
          }}
        />
      </CalendarContainer>
    </Fade>
  );
};

export default ModernCalendarView;