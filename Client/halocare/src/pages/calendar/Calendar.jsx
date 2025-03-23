import React, { useRef } from 'react';
import { Box, Paper, Typography, Button, IconButton, Tooltip, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import TodayIcon from '@mui/icons-material/Today';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import RefreshIcon from '@mui/icons-material/Refresh';

// קומפוננטים משניים
import CalendarFilter from './CalendarFilter';
import CalendarView from './CalendarView';
import EventDialog from './EventDialog';

// שימוש בקונטקסט
import { useCalendar } from './CalendarContext';

const Calendar = () => {
  // קבלת ערכים ופונקציות מהקונטקסט
  const {
    events,
    filteredEvents,
    isLoading,
    //isLoadingReferenceData,
    // calendarView,
    showFilterForm,
    filterOptions,
    
    fetchEvents,
    //handleDateClick,
    //handleEventClick,
    // handleViewChange,
    createNewEvent,
    setShowFilterForm,
    //resetFilters
  } = useCalendar();
  
  // reference to fullCalendar
  const calendarRef = useRef(null);
  
  // // פעולות ניווט ביומן
  // const goToToday = () => {
  //   if (calendarRef.current) {
  //     calendarRef.current.getApi().today();
  //   }
  // };
  
  // // מעבר לחודש קודם
  // const goToPrevious = () => {
  //   if (calendarRef.current) {
  //     calendarRef.current.getApi().prev();
  //   }
  // };
  
  // // מעבר לחודש הבא
  // const goToNext = () => {
  //   if (calendarRef.current) {
  //     calendarRef.current.getApi().next();
  //   }
  // };
  
  // // עדכון תצוגת היומן
  // const changeView = (view) => {
  //   handleViewChange(view);
  //   if (calendarRef.current) {
  //     calendarRef.current.getApi().changeView(view);
  //   }
  // };

  return (
    <Box sx={{ p: 2, direction: 'rtl' }}>
      {/* כותרת ובקרים עליונים */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 2, 
          borderRadius: '12px',
          background: 'linear-gradient(to left, #ffffff, #f5f9ff)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            יומן
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
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
      
      {/* בקרי תצוגת יומן */}
      {/* <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 2, 
          borderRadius: '12px',
          background: 'linear-gradient(to left, #ffffff, #f7faff)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Button
              variant={calendarView === 'dayGridMonth' ? 'contained' : 'outlined'}
              onClick={() => changeView('dayGridMonth')}
              sx={{ ml: 1, borderRadius: '8px' }}
            >
              חודש
            </Button>
            <Button
              variant={calendarView === 'timeGridWeek' ? 'contained' : 'outlined'}
              onClick={() => changeView('timeGridWeek')}
              sx={{ ml: 1, borderRadius: '8px' }}
            >
              שבוע
            </Button>
            <Button
              variant={calendarView === 'timeGridDay' ? 'contained' : 'outlined'}
              onClick={() => changeView('timeGridDay')}
              sx={{ borderRadius: '8px' }}
            >
              יום
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="חודש קודם">
              <IconButton onClick={goToPrevious} color="primary">
                <NavigateNextIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="היום">
              <IconButton 
                onClick={goToToday} 
                color="primary" 
                sx={{ 
                  mx: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(79, 195, 247, 0.15)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <TodayIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="חודש הבא">
              <IconButton onClick={goToNext} color="primary">
                <NavigateBeforeIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper> */}
      
      {/* מציג לוח השנה */}
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
            events={filterOptions.kidId || filterOptions.employeeId || filterOptions.eventType 
              ? filteredEvents 
              : events}
            isLoading={isLoading}
          />
        </Box>
      </Paper>
      
      {/* דיאלוג הוספה/עריכת אירוע */}
      <EventDialog />
    </Box>
  );
};

export default Calendar;