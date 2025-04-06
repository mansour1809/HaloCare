import  { useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  IconButton, 
  Tooltip, 
  CircularProgress,
  ButtonGroup
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewDayIcon from '@mui/icons-material/ViewDay';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// קומפוננטות משנה
import CalendarFilter from './CalendarFilter';
import CalendarView from './CalendarView';
import EventDialog from './EventDialog';

// שימוש בקונטקסט
import { useCalendar } from './CalendarContext';

const Calendar = () => {
  // שימוש בערכים ופונקציות מהקונטקסט
  const {
    events,
    filteredEvents,
    isLoading,
    showFilterForm,
    filterOptions, 
    fetchEvents,
    createNewEvent,
    setShowFilterForm,
    calendarView,
    setCalendarView
  } = useCalendar();
  
  // הפניה ל-fullCalendar
  const calendarRef = useRef(null);
  
  // פונקציה שמעדכנת את התצוגה עם אפשרות הנפשה
  const changeView = (view) => {
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
      setCalendarView(view);
    }
  };
  
  // קביעת האירועים המוצגים - מסוננים או הכל
  const displayEvents = filterOptions.kidId || filterOptions.employeeId || filterOptions.eventTypeId 
    ? filteredEvents 
    : events;
  
  // בדיקה אם יש מסננים פעילים
  const hasActiveFilters = filterOptions.kidId || filterOptions.employeeId || filterOptions.eventTypeId;
  
  return (
    <Box sx={{ p: 2, direction: 'rtl' }}>
      {/* כותרת וכפתורים */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 2, 
          borderRadius: '12px',
          background: 'linear-gradient(to left, #ffffff, #f5f9ff)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            יומן {hasActiveFilters ? '(מסונן)' : ''}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {/* כפתורי מעבר בין תצוגות */}
            <ButtonGroup 
              variant="outlined" 
              color="primary" 
              size="small"
              sx={{ mr: 1, display: { xs: 'none', sm: 'flex' } }}
            >
              <Tooltip title="תצוגת יום">
                <Button 
                  onClick={() => changeView('timeGridDay')}
                  variant={calendarView === 'timeGridDay' ? 'contained' : 'outlined'}
                >
                  <ViewDayIcon />
                </Button>
              </Tooltip>
              <Tooltip title="תצוגת שבוע">
                <Button 
                  onClick={() => changeView('timeGridWeek')}
                  variant={calendarView === 'timeGridWeek' ? 'contained' : 'outlined'}
                >
                  <ViewWeekIcon />
                </Button>
              </Tooltip>
              <Tooltip title="תצוגת חודש">
                <Button 
                  onClick={() => changeView('dayGridMonth')}
                  variant={calendarView === 'dayGridMonth' ? 'contained' : 'outlined'}
                >
                  <CalendarMonthIcon />
                </Button>
              </Tooltip>
            </ButtonGroup>
            
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={createNewEvent}
              sx={{ 
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s'
              }}
            >
              אירוע חדש
            </Button>
            
            <Button
              variant={showFilterForm ? "contained" : "outlined"}
              color={showFilterForm ? "secondary" : "primary"}
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilterForm(!showFilterForm)}
              sx={{ 
                borderRadius: '8px',
                '&:hover': {
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s'
              }}
            >
              {showFilterForm ? "הסתר סינון" : "סינון"}
            </Button>
            
            <Tooltip title="רענן יומן">
              <IconButton 
                onClick={fetchEvents}
                color="primary"
                sx={{ 
                  ml: 1,
                  '&:hover': { backgroundColor: 'rgba(79, 195, 247, 0.08)' }
                }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
      
      {/* טופס סינון */}
      {showFilterForm && (
        <CalendarFilter />
      )}
      
      {/* סיכום מספר האירועים */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1" color="textSecondary" fontWeight="500">
          סה"כ {displayEvents.length} אירועים {hasActiveFilters ? '(מסונן)' : ''}
        </Typography>
        
        {/* כפתורי תצוגה למובייל */}
        <ButtonGroup 
          variant="outlined" 
          color="primary" 
          size="small"
          sx={{ display: { xs: 'flex', sm: 'none' } }}
        >
          <Button onClick={() => changeView('timeGridDay')} sx={{ minWidth: 'auto', p: 0.5 }}>
            <ViewDayIcon />
          </Button>
          <Button onClick={() => changeView('timeGridWeek')} sx={{ minWidth: 'auto', p: 0.5 }}>
            <ViewWeekIcon />
          </Button>
          <Button onClick={() => changeView('dayGridMonth')} sx={{ minWidth: 'auto', p: 0.5 }}>
            <CalendarMonthIcon />
          </Button>
        </ButtonGroup>
      </Box>
      
      {/* היומן עצמו */}
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: '12px', 
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}
      >
        <Box sx={{ p: 0, bgcolor: 'white' }}>
          <CalendarView 
            calendarRef={calendarRef}
            events={displayEvents}
            isLoading={isLoading}
          />
        </Box>
      </Paper>
      
      {/* דיאלוג עריכה/יצירה של אירוע */}
      <EventDialog />
    </Box>
  );
};

export default Calendar;