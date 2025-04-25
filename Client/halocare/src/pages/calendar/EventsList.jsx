//COMPONENT: EventsList.jsx
import React, { useState, useEffect } from 'react';
import { useCalendar } from './CalendarContext';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Button, 
  Chip, 
  Divider,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Collapse,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Event as EventIcon,
  Link as LinkIcon,
  AccessTime as AccessTimeIcon,
  Room as RoomIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Person as PersonIcon,
  ChildCare as ChildIcon
} from '@mui/icons-material';

// פונקציה עזר לקיבוץ אירועים לפי תאריך
const groupEventsByDate = (events) => {
  const grouped = {};
  
  events.forEach(event => {
    const date = event.start.split('T')[0]; // חילוץ רק תאריך ללא שעה
    
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(event);
  });

  // מיון לפי תאריך
  return Object.keys(grouped)
    .sort()
    .reduce((acc, date) => {
      acc[date] = grouped[date];
      return acc;
    }, {});
};

// פורמט תאריך לעברית
const formatHebrewDate = (dateStr) => {
  const date = new Date(dateStr);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('he-IL', options);
};

// המרת שעה משרשור ISO לפורמט HH:MM
const formatTime = (timeStr) => {
  const date = new Date(timeStr);
  return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
};

// חישוב משך זמן באירוע בדקות
const getDurationInMinutes = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.round((endDate - startDate) / (1000 * 60));
};

const EventsList = () => {
  // שימוש בקונטקסט היומן
  const {
    events,
    filteredEvents,
    isLoading,
    error,
    kids,
    employees,
    eventTypes,
    filterOptions,
    handleFilterChange,
    resetFilters,
    handleEventClick,
    createNewEvent
  } = useCalendar();

  // מצבים מקומיים
  const [groupedEvents, setGroupedEvents] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [localFilteredEvents, setLocalFilteredEvents] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // עדכון האירועים המקובצים כאשר האירועים המסוננים משתנים
  useEffect(() => {
    let eventsToShow = filteredEvents.length > 0 ? filteredEvents : events;
    
    // אם יש חיפוש טקסט
    if (searchTerm) {
      eventsToShow = eventsToShow.filter(event => 
        event.title.includes(searchTerm) || 
        (event.extendedProps.location && event.extendedProps.location.includes(searchTerm)) ||
        (event.extendedProps.description && event.extendedProps.description.includes(searchTerm))
      );
    }
    
    setLocalFilteredEvents(eventsToShow);
    setGroupedEvents(groupEventsByDate(eventsToShow));
  }, [events, filteredEvents, searchTerm]);

  // ניווט לחודש הקודם
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  // ניווט לחודש הבא
  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  // ניווט לחודש הנוכחי
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  // מציאת שם ילד לפי מזהה
  const getKidName = (kidId) => {
    if (!kidId) return 'לא נבחר ילד';
    
    const kid = kids.find(k => k.id === parseInt(kidId));
    return kid ? `${kid.firstName} ${kid.lastName}` : 'ילד לא מוכר';
  };

  // מציאת שמות עובדים לפי מזהים
  const getEmployeeNames = (employeeIds) => {
    if (!employeeIds || employeeIds.length === 0) return 'ללא מטפלים';
    
    return employeeIds.map(id => {
      const employee = employees.find(e => e.id === parseInt(id));
      return employee ? `${employee.firstName} ${employee.lastName}` : 'עובד לא מוכר';
    }).join(', ');
  };

  // טיפול בלחיצה על אירוע
  const onEventClick = (event) => {
    handleEventClick({ event });
  };

  return (
    <Box sx={{ p: 3, dir: 'rtl' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'right' }}>
        לוח אירועים
      </Typography>

      {/* כלי ניווט וסינון */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {/* חיפוש */}
          <TextField
            placeholder="חיפוש אירועים..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: '300px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          {/* כפתורי ניווט */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ mx: 2 }}>
              {currentMonth.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
            </Typography>
            
            <Tooltip title="חודש קודם">
              <IconButton onClick={goToPreviousMonth} color="primary">
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="היום">
              <IconButton 
                onClick={goToCurrentMonth} 
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
              <IconButton onClick={goToNextMonth} color="primary">
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="outlined"
              startIcon={filterOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setFilterOpen(!filterOpen)}
              sx={{ mx: 2 }}
            >
              סינון
            </Button>
            
            <Chip 
              label={`${localFilteredEvents.length} אירועים`} 
              color="primary" 
              variant="outlined" 
            />
          </Box>
        </Box>
        
        {/* אזור סינון מורחב */}
        <Collapse in={filterOpen}>
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>סוג אירוע</InputLabel>
                <Select
                  name="eventType"
                  value={filterOptions.eventType}
                  onChange={handleFilterChange}
                  label="סוג אירוע"
                >
                  <MenuItem value="">כל הסוגים</MenuItem>
                  {eventTypes.map((type, index) => (
                    <MenuItem key={index} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>ילד</InputLabel>
                <Select
                  name="kidId"
                  value={filterOptions.kidId}
                  onChange={handleFilterChange}
                  label="ילד"
                >
                  <MenuItem value="">כל הילדים</MenuItem>
                  {kids.map(kid => (
                    <MenuItem key={kid.id} value={kid.id}>
                      {kid.firstName} {kid.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>מטפל</InputLabel>
                <Select
                  name="employeeId"
                  value={filterOptions.employeeId}
                  onChange={handleFilterChange}
                  label="מטפל"
                >
                  <MenuItem value="">כל המטפלים</MenuItem>
                  {employees.map(employee => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={resetFilters}
                sx={{ ml: 1 }}
              >
                נקה סינון
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={createNewEvent}
                startIcon={<EventIcon />}
              >
                אירוע חדש
              </Button>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>
      
      {/* אינדיקטור טעינה */}
      {isLoading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>טוען אירועים...</Typography>
        </Box>
      )}
      
      {/* הודעת שגיאה */}
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#FFEBEE', color: '#D32F2F', textAlign: 'right' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}
      
      {/* רשימת אירועים */}
      {!isLoading && Object.keys(groupedEvents).length > 0 ? (
        Object.keys(groupedEvents).map(date => (
          <Box key={date} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6" fontWeight="bold">
                {formatHebrewDate(date)}
              </Typography>
              <Chip 
                label={`${groupedEvents[date].length} אירועים`} 
                size="small" 
                sx={{ ml: 2 }} 
              />
            </Box>
            
            <Grid container spacing={2}>
              {groupedEvents[date].map(event => {
                const duration = getDurationInMinutes(event.start, event.end);
                const backgroundColor = event.backgroundColor || '#4caf50';
                
                return (
                  <Grid item xs={12} md={4} key={event.id}>
                    <Card 
                      sx={{ 
                        borderRight: `4px solid ${backgroundColor}`,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 3
                        },
                        transition: 'box-shadow 0.3s ease-in-out'
                      }}
                      onClick={() => onEventClick(event)}
                    >
                      <CardContent>
                        <Typography 
                          variant="h6" 
                          component="h3" 
                          sx={{ mb: 1.5, color: backgroundColor }}
                        >
                          {event.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTimeIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatTime(event.start)} | {duration} דק'
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <RoomIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {event.extendedProps.location || 'ללא מיקום'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <ChildIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {getKidName(event.extendedProps.kidId)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PersonIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {getEmployeeNames(event.extendedProps.employeeIds)}
                          </Typography>
                        </Box>
                        
                        {event.extendedProps.description && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mt: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {event.extendedProps.description}
                          </Typography>
                        )}
                      </CardContent>
                      
                      <CardActions sx={{ mt: 'auto', justifyContent: 'flex-end' }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            // פעולת הלינק
                          }}
                        >
                          <LinkIcon fontSize="small" />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))
      ) : !isLoading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            לא נמצאו אירועים העונים לקריטריונים
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default EventsList;