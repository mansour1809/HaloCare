import  { useRef } from 'react';
import { Box, Paper, Typography, Button, IconButton, Tooltip, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';

// 2nd level components
import CalendarFilter from './CalendarFilter';
import CalendarView from './CalendarView';
import EventDialog from './EventDialog';

// use context
import { useCalendar } from './CalendarContext';

const Calendar = () => {
  // using context values and functions
  const {
    events,
    filteredEvents,
    isLoading,
    showFilterForm,
    filterOptions, 
    fetchEvents,
    createNewEvent,
    setShowFilterForm,
  } = useCalendar();
  
  // reference to fullCalendar
  const calendarRef = useRef(null);

  return (
    <Box sx={{ p: 2, direction: 'rtl' }}>
      {/* title and buttons */}
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
      
      {/* filter form */}
      {showFilterForm && (
        <CalendarFilter />
      )}


      
      {/* showing the calendar */}
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
      
      {/* adding event dialog */}
      <EventDialog />
    </Box>
  );
};

export default Calendar;