import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Container,
  Fade,
  Zoom,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  CalendarToday as CalendarIcon,
  Event as EventIcon,
  Today as TodayIcon,
  Add as AddIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Analytics as AnalyticsIcon,
  Clear as ClearIcon,
  ViewWeek as WeekIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { fetchEvents } from '../../Redux/features/eventsSlice';
import { fetchEventTypes } from '../../Redux/features/eventTypesSlice';
import { fetchKids } from '../../Redux/features/kidsSlice';
import { fetchEmployees } from '../../Redux/features/employeesSlice';
import EventsCarousel from './EventsCarousel';
import Swal from 'sweetalert2';

// animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

// 🎭 Styled Components
const GradientContainer = styled(Container)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  minHeight: '100vh',
  padding: theme.spacing(3),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '200px',
    background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
    borderRadius: '0 0 30px 30px',
    zIndex: 0,
  }
}));

const MainCard = styled(Card)(() => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.2)',
  border: 'none',
  position: 'relative',
  zIndex: 1,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
    borderRadius: '24px 24px 0 0',
  }
}));

const EventCard = styled(Card)(({  eventColor = '#667eea' }) => ({
  background: `linear-gradient(135deg, ${eventColor}15 0%, ${eventColor}05 100%)`,
  borderRadius: '16px',
  border: `2px solid ${eventColor}30`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 20px 40px ${eventColor}40`,
    border: `2px solid ${eventColor}60`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    background: eventColor,
    borderRadius: '0 2px 2px 0',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${eventColor}, transparent)`,
    animation: `${shimmer} 3s infinite`,
  }
}));

const StatsCard = styled(Card)(({  color = '#667eea' }) => ({
  background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
  borderRadius: '20px',
  border: `2px solid ${color}20`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 20px 40px ${color}30`,
  }
}));

const GlowingButton = styled(Button)(({  glowColor = '#667eea' }) => ({
  borderRadius: '16px',
  textTransform: 'none',
  fontWeight: 600,
  color: 'white',
  padding: '12px 24px',
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${glowColor} 0%, ${glowColor}dd 100%)`,
  boxShadow: `0 8px 25px ${glowColor}40`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 15px 35px ${glowColor}60`,
    animation: `${pulse} 1.5s infinite`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  }
}));

// Styled Chip for participants
const ParticipantChip = styled(Chip)(() => ({
  borderRadius: 12,
  fontWeight: 600,
  margin: '2px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(116, 11, 11, 0.15)',
  }
}));

const CalendarSection = () => {
const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { events, status: eventsStatus } = useSelector(state => state.events);
  const { eventTypes, status: eventTypesStatus } = useSelector(state => state.eventTypes);
  const { kids } = useSelector(state => state.kids);
  const { employees } = useSelector(state => state.employees);
  
  // Local state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState({
    eventTypeId: '',
    employeeId: '',
    kidId:''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetailsDialog, setEventDetailsDialog] = useState(false);

  // Load data on mount
  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(fetchEventTypes());
    dispatch(fetchKids());
    dispatch(fetchEmployees());
  }, [dispatch]);

  // Helper functions
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('he-IL').format(date);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getWeekDays = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    
    for (let i = 0; i < 7; i++) {
      const weekDay = new Date(startOfWeek);
      weekDay.setDate(diff + i);
      week.push(weekDay);
    }
    return week;
  };
const handleCreateEvent = (isEdit=false) => {
  Swal.fire({
    title: isEdit ? '🗓️ עריכת אירוע ' : '🗓️ יצירת אירוע חדש',
    html: 'ליצירה ועריכה של אירועים,<br>עבור ליומן המלא עם כל הכלים המתקדמים!',
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: '📅 עבור ליומן מלא',
    cancelButtonText: 'לא משנה',
    confirmButtonColor: '#667eea'
  }).then((result) => {
    if (result.isConfirmed) {
      navigate('/calendar/schedule');
    }
  });
};
  // Filter events - Only for selected day
  const filteredEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.start);
      
      // Only show events for selected day
      const dateMatch = eventDate.toDateString() === selectedDate.toDateString();
      
      // Apply filters
      const typeMatch = !filters.eventTypeId || event.extendedProps.eventTypeId === parseInt(filters.eventTypeId);
      const employeeMatch = !filters.employeeId || event.extendedProps.employeeIds?.includes(parseInt(filters.employeeId));
      const kidsMatch = !filters.kidId || event.extendedProps.kidIds?.includes(parseInt(filters.kidId));
      
      // Search filter
      const searchMatch = !searchTerm || 
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.extendedProps.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.extendedProps.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return dateMatch && typeMatch && employeeMatch && searchMatch && kidsMatch;
    }).sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [events, selectedDate, filters, searchTerm]);

  // Get today's events
  const todaysEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    const today = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === today.toDateString();
    }).sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [events]);

  // Stats
  const stats = useMemo(() => {
    const todayCount = todaysEvents.length;
    const selectedDayCount = filteredEvents.length;
    const thisWeek = events?.filter(event => {
      const eventDate = new Date(event.start);
      const weekDays = getWeekDays(new Date());
      return weekDays.some(day => day.toDateString() === eventDate.toDateString());
    }).length || 0;
    
    return { todayCount, selectedDayCount, thisWeek };
  }, [filteredEvents, todaysEvents, events]);

  const handleDateNavigation = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setEventDetailsDialog(true);
  };

  const clearFilters = () => {
    setFilters({
      eventTypeId: '',
      employeeId: ''
    });
    setSearchTerm('');
  };

  const isLoading = eventsStatus === 'loading' || eventTypesStatus === 'loading';
  const hasFilters = Object.values(filters).some(filter => filter !== '') || searchTerm !== '';

  return (
    <GradientContainer maxWidth="xl" dir='rtl'>
      <Fade in timeout={800}>
        <MainCard elevation={0}>
          {/* Magic Header */}
          <Box sx={{ 
            p: 4,
            background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
            borderRadius: '24px 24px 0 0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} sx={{ position: 'relative', zIndex: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Zoom in timeout={600}>
                  <Avatar sx={{ 
                    width: 70, 
                    height: 70,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                    animation: `${float} 3s ease-in-out infinite`
                  }}>
                    <CalendarIcon sx={{ fontSize: '2rem' }} />
                  </Avatar>
                </Zoom>
                <Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}>
                    יומן הגן
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip 
                      icon={<TodayIcon />}
                      label={formatDate(selectedDate)}
                      color="primary"
                      variant="outlined"
                      sx={{ animation: `${pulse} 2s infinite` }}
                    />
                    {hasFilters && (
                      <Chip 
                        icon={<SearchIcon />}
                        label="מסונן"
                        color="warning"
                        size="small"
                        onDelete={clearFilters}
                        deleteIcon={<ClearIcon />}
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>
              
              <Stack direction="row" spacing={2}>
                
                <GlowingButton
  startIcon={<AddIcon />}
  onClick={() => 
    handleCreateEvent()
  }
  glowColor="#10b981"
>
  אירוע חדש
</GlowingButton>
                <GlowingButton
                  startIcon={<AnalyticsIcon />}
                  onClick={()=> navigate('/calendar/schedule')}
                  glowColor="#f59e0b"
                >
                  יומן מלא
                </GlowingButton>
              </Stack>
            </Stack>

            {/* Amazing Stats - Simplified */}
            <Grid container spacing={3} mb={3}>
              <Grid item size={{xs:12,sm:4}}>
                <Zoom in timeout={800}>
                  <StatsCard color="#10b981">
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                        <Avatar sx={{ 
                          width: 50, 
                          height: 50,
                          background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                        }}>
                          <TodayIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981' }}>
                            {stats.todayCount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            אירועי היום
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </StatsCard>
                </Zoom>
              </Grid>
              
              <Grid item size={{xs:12,sm:4}}>
                <Zoom in timeout={1000}>
                  <StatsCard color="#667eea">
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                        <Avatar sx={{ 
                          width: 50, 
                          height: 50,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}>
                          <WeekIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: '#667eea' }}>
                            {stats.thisWeek}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            השבוע
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </StatsCard>
                </Zoom>
              </Grid>
              
              <Grid item size={{xs:12,sm:4}}>
                <Zoom in timeout={1200}>
                  <StatsCard color="#f59e0b">
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                        <Avatar sx={{ 
                          width: 50, 
                          height: 50,
                          background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
                        }}>
                          <EventIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                            {stats.selectedDayCount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            ביום שנבחר
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </StatsCard>
                </Zoom>
              </Grid>
            </Grid>

            {/* Compact Filters Bar */}
            <Paper elevation={1} sx={{ 
              p: 3, 
              mb: 3,
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(10px)'
            }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item size={{xs:12}}>
                  <TextField
                    size="small"
                    placeholder="🔍 חיפוש אירועים..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                        </InputAdornment>
                      )
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                  />
                </Grid>
                
                <Grid item size={{xs:12,sm:3}}>
                  <FormControl fullWidth size="small">
                    <InputLabel>סוג אירוע</InputLabel>
                    <Select
                      value={filters.eventTypeId}
                      onChange={(e) => setFilters(prev => ({ ...prev, eventTypeId: e.target.value }))}
                      label="סוג אירוע"
                      sx={{ borderRadius: '12px' }}
                    >

                      <MenuItem value="">כל הסוגים</MenuItem>
                      {eventTypes?.map(type => (
                        <MenuItem key={type.eventTypeId} value={type.eventTypeId}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              background: type.color 
                            }} />
                            {type.eventType}
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item size={{xs:12,sm:3}}>
                  <FormControl fullWidth size="small">
                    <InputLabel>מטפל</InputLabel>
                    <Select
                      value={filters.employeeId}
                      onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
                      label="מטפל"
                      sx={{ borderRadius: '12px' }}
                      renderValue={(selected) => {
  const employee = employees.find(emp => emp.employeeId === selected);
  return (
    <ParticipantChip
      label={employee ? `${employee.firstName} ${employee.lastName}` : selected}
      size="small"
      color="primary"
    />
  );
}}

                    >
                      <MenuItem value="">כל המטפלים</MenuItem>
                      {employees?.filter(emp => emp.isActive).map(employee => (
                        <MenuItem key={employee.employeeId} value={employee.employeeId}>
                          {employee.firstName} {employee.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item size={{xs:12,sm:3}}>
                  <FormControl fullWidth size="small">
                    <InputLabel>ילד</InputLabel>
                    <Select
                      value={filters.kidId}
                      onChange={(e) => setFilters(prev => ({ ...prev, kidId: e.target.value }))}
                      label="ילד"
                      sx={{ borderRadius: '12px' }}
                       renderValue={(selected) => {
  const kid = kids.find(k => k.id === selected);
  return (
    <ParticipantChip
      label={kid ? `${kid.firstName} ${kid.lastName}` : selected}
      size="small"
      color="primary"
    />
  );
}}
                    >
                      <MenuItem value="">כל המטפלים</MenuItem>
                      {kids?.filter(kid => kid.isActive).map(kid => (
                        <MenuItem key={kid.id} value={kid.id}>
                          {kid.firstName} {kid.lastName}
                        </MenuItem>
                        
                      ))}
                      
                    </Select>
                    
                  </FormControl>
                </Grid>

                <Grid item size={{xs:12,sm:3}}>
                  <Stack direction="row" spacing={1}>
                    {hasFilters && (
                      <GlowingButton
                        size="small"
                        startIcon={<ClearIcon />}
                        onClick={clearFilters}
                        glowColor="#ef4444"
                      >
                        נקה
                      </GlowingButton>
                    )}
                  
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* Simple Navigation */}
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} mb={3}>
              <IconButton 
                onClick={() => handleDateNavigation(1)} 
                sx={{ 
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': { background: 'rgba(255,255,255,0.3)' }
                }}
              >
                                <NextIcon />
              </IconButton>
              
              <Paper sx={{ 
                px: 4, 
                py: 2, 
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(20px)',
                textAlign: 'center',
                minWidth: 250
              }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700,
                  color: '#667eea',
                  mb: 0.5
                }}>
                  {formatDate(selectedDate)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedDate.toLocaleDateString('he-IL', { weekday: 'long' })}
                </Typography>
              </Paper>
              
              <IconButton 
                onClick={() => handleDateNavigation(-1)} 
                sx={{ 
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': { background: 'rgba(255,255,255,0.3)' }
                }}
              >
                <PrevIcon />
              </IconButton>
              
              <GlowingButton
                size="small"
                onClick={() => setSelectedDate(new Date())}
                glowColor="#10b981"
                disabled={selectedDate.toDateString() === new Date().toDateString()}
              >
                📅 היום
              </GlowingButton>
            </Stack>
          </Box>

          {/* Main Content - Simplified */}
          <CardContent sx={{ p: 4 }}>
            <Fade in timeout={1000}>
              <Box>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 700,
                  color: '#667eea',
                  mb: 3,
                  textAlign: 'center'
                }}>
                  📅 אירועי {formatDate(selectedDate)}
                </Typography>
                
                {filteredEvents.length > 0 ? (

                  <EventsCarousel
    events={filteredEvents}
    eventTypes={eventTypes}
    onEventClick={handleEventClick}
    formatTime={formatTime}
    maxVisible={3}
    showExpand={true}
  />
                ) : (
                  <Paper sx={{ 
                    p: 6, 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)',
                    borderRadius: '20px'
                  }}>
                    <Avatar sx={{ 
                      width: 80, 
                      height: 80, 
                      margin: '0 auto 16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}>
                      <CalendarIcon sx={{ fontSize: '2.5rem' }} />
                    </Avatar>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      אין אירועים ב{formatDate(selectedDate)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {hasFilters ? 'נסה לשנות את המסננים' : 'אין אירועים מתוכננים לתאריך זה'}
                    </Typography>
                    {isLoading && (
                      <Typography variant="caption" color="primary" display="block">
                        טוען אירועים מהשרת...
                      </Typography>
                    )}
                    {!isLoading && events?.length === 0 && (
                      <Typography variant="caption" color="warning.main" display="block">
                        לא נמצאו אירועים במערכת
                      </Typography>
                    )}
                  </Paper>
                )}
              </Box>
            </Fade>
          </CardContent>
        </MainCard>
      </Fade>

      {/* Event Details Dialog - Simplified */}
      <Dialog 
      dir='rtl'
        open={eventDetailsDialog} 
        onClose={() => setEventDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }
        }}
      >
        {selectedEvent && (
          <>
            <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: 4 }}>
              <Stack direction="row" spacing={3} alignItems="center" justifyContent="center">
                <Avatar sx={{ 
                  width: 60, 
                  height: 60,
                  background: eventTypes?.find(type => type.eventTypeId === selectedEvent.extendedProps.eventTypeId)?.color || '#667eea'
                }}>
                  <EventIcon sx={{ fontSize: '2rem' }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedEvent.title}
                  </Typography>
                  <Chip 
                    label={eventTypes?.find(type => type.eventTypeId === selectedEvent.extendedProps.eventTypeId)?.eventType}
                    sx={{ 
                      background: eventTypes?.find(type => type.eventTypeId === selectedEvent.extendedProps.eventTypeId)?.color,
                      color: 'white',
                      fontWeight: 600,
                      mt: 1
                    }}
                  />
                </Box>
              </Stack>
            </DialogTitle>
            
            <DialogContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Paper elevation={1} sx={{ 
                  p: 2, 
                  borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(102,126,234,0.05) 100%)'
                }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TimeIcon color="primary" />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(selectedEvent.start).toLocaleDateString('he-IL')}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
                
                {selectedEvent.extendedProps.location && (
                  <Paper elevation={1} sx={{ 
                    p: 2, 
                    borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)'
                  }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <LocationIcon sx={{ color: '#10b981' }} />
                      <Typography variant="body1">
                        {selectedEvent.extendedProps.location}
                      </Typography>
                    </Stack>
                  </Paper>
                )}
                
                {selectedEvent.extendedProps.description && (
                  <Paper elevation={1} sx={{ 
                    p: 2, 
                    borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.05) 100%)'
                  }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      📝 תיאור:
                    </Typography>
                    <Typography variant="body1">
                      {selectedEvent.extendedProps.description}
                    </Typography>
                  </Paper>
                )}
                
                {(selectedEvent.extendedProps.kidIds?.length > 0 || selectedEvent.extendedProps.employeeIds?.length > 0) && (
                  <Paper elevation={1} sx={{ 
                    p: 2, 
                    borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(139,69,19,0.1) 0%, rgba(139,69,19,0.05) 100%)'
                  }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
                      👥 משתתפים:
                    </Typography>
                    <Stack spacing={1}>
                      {selectedEvent.extendedProps.kidIds?.length > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            ילדים:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                            {selectedEvent.extendedProps.kidIds.map(kidId => {
                              const kid = kids?.find(k => k.id === kidId);
                              return kid ? (
                                <Chip 
                                  key={kidId}
                                  label={`${kid.firstName} ${kid.lastName}`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              ) : null;
                            })}
                          </Stack>
                        </Box>
                      )}
                      
                      {selectedEvent.extendedProps.employeeIds?.length > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            מטפלים:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                            {selectedEvent.extendedProps.employeeIds.map(employeeId => {
                              const employee = employees?.find(e => e.employeeId === employeeId);
                              return employee ? (
                                <Chip 
                                  key={employeeId}
                                  label={`${employee.firstName} ${employee.lastName}`}
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                />
                              ) : null;
                            })}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
              <GlowingButton
                onClick={() => setEventDetailsDialog(false)}
                glowColor="#6b7280"
              >
                ❌ סגור
              </GlowingButton>
             <GlowingButton
  onClick={() => {
    setEventDetailsDialog(false)
  handleCreateEvent(true)
  }
    
  }
  glowColor="#667eea"
>
  ✏️ ערוך אירוע
</GlowingButton>
            </DialogActions>
          </>
        )}
      </Dialog>


    </GradientContainer>
  );
};

export default CalendarSection;