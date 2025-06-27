import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Stack,
  Divider,
  Tooltip,
  Chip,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Container,
  Fade,
  Zoom,
  Slide,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
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
  FilterList as FilterIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Schedule as ScheduleIcon,
  Groups as GroupIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Analytics as AnalyticsIcon,
  AutoAwesome as MagicIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  ViewWeek as WeekIcon,
  ViewDay as DayIcon,
  CalendarViewMonth as MonthIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { fetchEvents } from '../../Redux/features/eventsSlice';
import { fetchEventTypes } from '../../Redux/features/eventTypesSlice';
import { fetchKids } from '../../Redux/features/kidsSlice';
import { fetchEmployees } from '../../Redux/features/employeesSlice';

// 🎨 Amazing animations
const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
  50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.6), 0 0 40px rgba(102, 126, 234, 0.4); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideInUp = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
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

const MainCard = styled(Card)(({ theme }) => ({
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

const EventCard = styled(Card)(({ theme, eventColor = '#667eea' }) => ({
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

const MiniCalendarCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
  borderRadius: '20px',
  border: '1px solid rgba(255,255,255,0.3)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
  }
}));

const CalendarDay = styled(Box)(({ theme, isToday, hasEvents, isSelected }) => ({
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  position: 'relative',
  background: isToday 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : isSelected 
    ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
    : hasEvents 
    ? 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(102,126,234,0.05) 100%)'
    : 'transparent',
  color: isToday || isSelected ? 'white' : 'inherit',
  fontWeight: isToday || isSelected ? 700 : hasEvents ? 600 : 400,
  '&:hover': {
    background: isToday || isSelected 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'linear-gradient(135deg, rgba(102,126,234,0.2) 0%, rgba(102,126,234,0.1) 100%)',
    transform: 'scale(1.1)',
  },
  '&::after': hasEvents ? {
    content: '""',
    position: 'absolute',
    bottom: 4,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: isToday || isSelected ? 'white' : '#667eea',
    animation: `${pulse} 2s infinite`,
  } : {}
}));

const GlowingButton = styled(Button)(({ theme, glowColor = '#667eea' }) => ({
  borderRadius: '16px',
  textTransform: 'none',
  fontWeight: 600,
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

const StatsCard = styled(Card)(({ theme, color = '#667eea' }) => ({
  background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
  borderRadius: '20px',
  border: `2px solid ${color}20`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 20px 40px ${color}30`,
    animation: `${glow} 2s infinite`,
  }
}));

const EnhancedCalendarSection = ({ onNavigateToFull }) => {
  const dispatch = useDispatch();
  
  // Redux state
  const { events, status: eventsStatus } = useSelector(state => state.events);
  const { eventTypes, status: eventTypesStatus } = useSelector(state => state.eventTypes);
  const { kids } = useSelector(state => state.kids);
  const { employees } = useSelector(state => state.employees);
  
  // Local state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day'); 
  const [filters, setFilters] = useState({
    eventTypeId: '',
    employeeId: '',
    kidId: ''
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

  

  const getMonthDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Next month days to complete the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    console.log(events)
    if (!events || events.length === 0) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.start);
      console.log(eventDate)
      // Date filter based on view mode
      let dateMatch = false;
      if (viewMode === 'day') {
        dateMatch = eventDate.toDateString() === selectedDate.toDateString();
      } 
      
      // Other filters
      const typeMatch = !filters.eventTypeId || event.eventTypeId === parseInt(filters.eventTypeId);
      const employeeMatch = !filters.employeeId || event.employeeIds?.includes(parseInt(filters.employeeId));
      const kidMatch = !filters.kidId || event.kidIds?.includes(parseInt(filters.kidId));
      
      return dateMatch && typeMatch && employeeMatch && kidMatch;
    });
  }, [events, selectedDate, viewMode, filters]);

  // Get today's events
  const todaysEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    const today = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === today.toDateString();
    }).sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [events]);

  // Get events for specific date
  const getEventsForDate = (date) => {
    if (!events || events.length === 0) return [];
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Filter kids based on search term
  const filteredKids = useMemo(() => {
    if (!kids) return [];
    const activeKids = kids.filter(kid => kid.isActive);
    if (!searchTerm) return activeKids;
    
    return activeKids.filter(kid => 
      kid.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kid.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [kids, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredEvents.length;
    const today = todaysEvents.length;
    const thisWeek = events?.filter(event => {
      const eventDate = new Date(event.start);
    }).length || 0;
    
    return { total, today, thisWeek };
  }, [filteredEvents, todaysEvents, events]);

  const handleDateNavigation = (direction) => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    }
    setSelectedDate(newDate);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setEventDetailsDialog(true);
  };

  const clearFilters = () => {
    setFilters({
      eventTypeId: '',
      employeeId: '',
      kidId: ''
    });
    setSearchTerm('');
  };

  const isLoading = eventsStatus === 'loading' || eventTypesStatus === 'loading';
  const hasFilters = Object.values(filters).some(filter => filter !== '') || searchTerm !== '';

  // Debug: Add console logs to see what's happening
  console.log('Events from Redux:', events);
  console.log('Filtered Events:', filteredEvents);
  console.log('Selected Date:', selectedDate);
  console.log('View Mode:', viewMode);

  return (
    <GradientContainer maxWidth="xl">
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
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><defs><pattern id=\'grain\' width=\'100\' height=\'100\' patternUnits=\'userSpaceOnUse\'><circle cx=\'50\' cy=\'50\' r=\'1\' fill=\'%23667eea\' opacity=\'0.1\'/></pattern></defs><rect width=\'100\' height=\'100\' fill=\'url(%23grain)\'/></svg>")',
              opacity: 0.3
            }} />
            
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
                    יומן הגן ✨
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
                        icon={<FilterIcon />}
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
                  startIcon={<RefreshIcon />}
                  onClick={() => dispatch(fetchEvents())}
                  disabled={isLoading}
                >
                  רענן
                </GlowingButton>
                
                <GlowingButton
                  startIcon={<AddIcon />}
                  onClick={() => console.log('Create new event')}
                  glowColor="#10b981"
                >
                  אירוע חדש
                </GlowingButton>
                
                <GlowingButton
                  startIcon={<AnalyticsIcon />}
                  onClick={onNavigateToFull}
                  glowColor="#f59e0b"
                >
                  יומן מלא
                </GlowingButton>
              </Stack>
            </Stack>

            {/* Amazing Stats */}
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
                            {stats.today}
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
                            {stats.total}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            בתצוגה
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </StatsCard>
                </Zoom>
              </Grid>
            </Grid>

            {/* Navigation & View Controls */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton onClick={() => handleDateNavigation(-1)} sx={{ 
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': { background: 'rgba(255,255,255,0.3)' }
                }}>
                  <PrevIcon />
                </IconButton>
                
                <Typography variant="h6" sx={{ 
                  minWidth: 200, 
                  textAlign: 'center',
                  fontWeight: 600,
                  color: '#667eea'
                }}>
                  {viewMode === 'month' 
                    ? selectedDate.toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })
                    : formatDate(selectedDate)
                  }
                </Typography>
                
                <IconButton onClick={() => handleDateNavigation(1)} sx={{ 
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': { background: 'rgba(255,255,255,0.3)' }
                }}>
                  <NextIcon />
                </IconButton>
              </Stack>

              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newValue) => newValue && setViewMode(newValue)}
                sx={{
                  '& .MuiToggleButton-root': {
                    borderRadius: '12px',
                    margin: '0 4px',
                    fontWeight: 600,
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                    }
                  }
                }}
              >
                <ToggleButton value="day">
                  <DayIcon sx={{ mr: 1 }} />
                  יום
                </ToggleButton>
                <ToggleButton value="week">
                  <WeekIcon sx={{ mr: 1 }} />
                  שבוע
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Box>

          {/* Main Content */}
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              {/* Left Side - Filters & Mini Calendar */}
              <Grid item size={{xs:12,lg:3}}>
                <Stack spacing={3}>
                  {/* Quick Filters */}
                  <Fade in timeout={1000}>
                    <MiniCalendarCard>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          fontWeight: 700,
                          color: '#667eea'
                        }}>
                          <FilterIcon sx={{ mr: 1 }} />
                          מסננים מהירים
                        </Typography>
                        
                        <Stack spacing={2}>
                          <FormControl fullWidth size="small">
                            <InputLabel>סוג אירוע</InputLabel>
                            <Select
                              value={filters.eventTypeId}
                              onChange={(e) => setFilters(prev => ({ ...prev, eventTypeId: e.target.value }))}
                              label="סוג אירוע"
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

                          <FormControl fullWidth size="small">
                            <InputLabel>מטפל</InputLabel>
                            <Select
                              value={filters.employeeId}
                              onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
                              label="מטפל"
                            >
                              <MenuItem value="">כל המטפלים</MenuItem>
                              {employees?.map(employee => (
                                <MenuItem key={employee.id} value={employee.id}>
                                  {employee.firstName} {employee.lastName}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl fullWidth size="small">
                            <InputLabel>ילד</InputLabel>
                            <Select
                              value={filters.kidId}
                              onChange={(e) => setFilters(prev => ({ ...prev, kidId: e.target.value }))}
                              label="ילד"
                            >
                              <MenuItem value="">
                                <TextField
                                  size="small"
                                  placeholder="🔍 חיפוש ילד..."
                                  value={searchTerm}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    setSearchTerm(e.target.value);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <SearchIcon color="primary" fontSize="small" />
                                      </InputAdornment>
                                    )
                                  }}
                                  sx={{ width: '100%', mb: 1 }}
                                />
                              </MenuItem>
                              <MenuItem value="">כל הילדים</MenuItem>
                              {filteredKids?.map(kid => (
                                <MenuItem key={kid.id} value={kid.id}>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Avatar sx={{ 
                                      width: 24, 
                                      height: 24, 
                                      fontSize: '0.7rem',
                                      background: 'linear-gradient(135deg, #10b981 30%, #34d399 90%)'
                                    }}>
                                      {kid.firstName?.charAt(0)}
                                    </Avatar>
                                    {kid.firstName} {kid.lastName}
                                  </Stack>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Stack>
                      </CardContent>
                    </MiniCalendarCard>
                  </Fade>

                  {/* Mini Calendar - Only for week view */}
                  {viewMode === 'week' && (
                    <Fade in timeout={1200}>
                      <MiniCalendarCard>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" gutterBottom sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            fontWeight: 700,
                            color: '#667eea'
                          }}>
                            <CalendarIcon sx={{ mr: 1 }} />
                            השבוע הנוכחי
                          </Typography>
                          
                          <Grid container spacing={0.5}>
                            {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(day => (
                              <Grid item xs key={day} sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                  {day}
                                </Typography>
                              </Grid>
                            ))}
                            {getWeekDays(selectedDate).map((date, index) => {
                              const hasEvents = getEventsForDate(date).length > 0;
                              const isToday = date.toDateString() === new Date().toDateString();
                              const isSelected = date.toDateString() === selectedDate.toDateString();
                              
                              return (
                                <Grid item xs key={index} sx={{ textAlign: 'center' }}>
                                  <CalendarDay
                                    isToday={isToday}
                                    hasEvents={hasEvents}
                                    isSelected={isSelected}
                                    onClick={() => setSelectedDate(new Date(date))}
                                    sx={{ fontSize: '0.8rem' }}
                                  >
                                    {date.getDate()}
                                  </CalendarDay>
                                </Grid>
                              );
                            })}
                          </Grid>
                        </CardContent>
                      </MiniCalendarCard>
                    </Fade>
                  )}

                  {/* Today's Events */}
                  <Fade in timeout={1400}>
                    <MiniCalendarCard>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          fontWeight: 700,
                          color: '#10b981'
                        }}>
                          <TodayIcon sx={{ mr: 1 }} />
                          אירועי היום ({todaysEvents.length})
                        </Typography>
                        
                        {todaysEvents.length > 0 ? (
                          <List dense>
                            {todaysEvents.slice(0, 5).map((event, index) => {
                              const eventType = eventTypes?.find(type => type.eventTypeId === event.eventTypeId);
                              return (
                                <Zoom in timeout={1600 + index * 100} key={event.eventId}>
                                  <ListItem 
                                    sx={{ 
                                      p: 1, 
                                      borderRadius: '8px',
                                      mb: 1,
                                      background: `${eventType?.color}15`,
                                      border: `1px solid ${eventType?.color}30`,
                                      cursor: 'pointer',
                                      '&:hover': { 
                                        background: `${eventType?.color}25`,
                                        transform: 'translateX(-4px)'
                                      },
                                      transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => handleEventClick(event)}
                                  >
                                    <ListItemAvatar>
                                      <Avatar sx={{ 
                                        width: 32, 
                                        height: 32, 
                                        background: eventType?.color,
                                        fontSize: '0.8rem'
                                      }}>
                                        <ScheduleIcon />
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={
                                        <Typography variant="body2" fontWeight={600}>
                                          {event.eventTitle}
                                        </Typography>
                                      }
                                      secondary={
                                        <Typography variant="caption" color="text.secondary">
                                          {formatTime(event.start)} - {formatTime(event.end)}
                                        </Typography>
                                      }
                                    />
                                  </ListItem>
                                </Zoom>
                              );
                            })}
                            {todaysEvents.length > 5 && (
                              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', mt: 1 }}>
                                ועוד {todaysEvents.length - 5} אירועים...
                              </Typography>
                            )}
                          </List>
                        ) : (
                          <Box sx={{ textAlign: 'center', py: 3 }}>
                            <MagicIcon sx={{ fontSize: '3rem', color: 'grey.300', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              אין אירועים היום
                            </Typography>
                            {isLoading && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                טוען אירועים...
                              </Typography>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </MiniCalendarCard>
                  </Fade>
                </Stack>
              </Grid>

              {/* Right Side - Events Display */}
              <Grid item xs={12} lg={9}>
                {viewMode === 'day' && (
                  <Fade in timeout={1000}>
                    <Box>
                      <Typography variant="h5" gutterBottom sx={{ 
                        fontWeight: 700,
                        color: '#667eea',
                        mb: 3
                      }}>
                        📅 אירועי {formatDate(selectedDate)}
                      </Typography>
                      
                      {filteredEvents.length > 0 ? (
                        <Grid container spacing={3}>
                          {filteredEvents.map((event, index) => {
                            const eventType = eventTypes?.find(type => type.eventTypeId === event.eventTypeId);
                            return (
                              <Grid item xs={12} sm={6} md={4} key={event.eventId}>
                                <Zoom in timeout={1200 + index * 100}>
                                  <EventCard 
                                    eventColor={eventType?.color}
                                    onClick={() => handleEventClick(event)}
                                  >
                                    <CardContent sx={{ p: 3 }}>
                                      <Stack spacing={2}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                          <Avatar sx={{ 
                                            background: eventType?.color,
                                            width: 40,
                                            height: 40
                                          }}>
                                            <EventIcon />
                                          </Avatar>
                                          <Box flex={1}>
                                            <Typography variant="h6" fontWeight="bold">
                                              {event.eventTitle}
                                            </Typography>
                                            <Chip 
                                              label={eventType?.eventType}
                                              size="small"
                                              sx={{ 
                                                background: eventType?.color,
                                                color: 'white',
                                                fontWeight: 600
                                              }}
                                            />
                                          </Box>
                                        </Stack>
                                        
                                        <Stack spacing={1}>
                                          <Stack direction="row" spacing={1} alignItems="center">
                                            <TimeIcon color="action" fontSize="small" />
                                            <Typography variant="body2">
                                              {formatTime(event.start)} - {formatTime(event.end)}
                                            </Typography>
                                          </Stack>
                                          
                                          {event.location && (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                              <LocationIcon color="action" fontSize="small" />
                                              <Typography variant="body2">
                                                {event.location}
                                              </Typography>
                                            </Stack>
                                          )}
                                          
                                          {event.kidIds?.length > 0 && (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                              <GroupIcon color="action" fontSize="small" />
                                              <Typography variant="body2">
                                                {event.kidIds.length} ילדים
                                              </Typography>
                                            </Stack>
                                          )}
                                          
                                          {event.employeeIds?.length > 0 && (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                              <PersonIcon color="action" fontSize="small" />
                                              <Typography variant="body2">
                                                {event.employeeIds.length} מטפלים
                                              </Typography>
                                            </Stack>
                                          )}
                                        </Stack>
                                      </Stack>
                                    </CardContent>
                                  </EventCard>
                                </Zoom>
                              </Grid>
                            );
                          })}
                        </Grid>
                      ) : (
                        <Paper sx={{ 
                          p: 6, 
                          textAlign: 'center',
                          background: 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)',
                          borderRadius: '20px'
                        }}>
                          <MagicIcon sx={{ fontSize: '4rem', color: 'grey.300', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            אין אירועים ב{formatDate(selectedDate)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            נסה לשנות את המסננים או לבחור תאריך אחר
                          </Typography>
                          {isLoading && (
                            <Typography variant="caption" color="primary" display="block" sx={{ mt: 1 }}>
                              טוען אירועים מהשרת...
                            </Typography>
                          )}
                          {!isLoading && events?.length === 0 && (
                            <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 1 }}>
                              לא נמצאו אירועים במערכת
                            </Typography>
                          )}
                        </Paper>
                      )}
                    </Box>
                  </Fade>
                )}

                {viewMode === 'week' && (
                  <Fade in timeout={1000}>
                    <Box>
                      <Typography variant="h5" gutterBottom sx={{ 
                        fontWeight: 700,
                        color: '#667eea',
                        mb: 3
                      }}>
                        📅 השבוע של {formatDate(selectedDate)}
                      </Typography>
                      
                      <Grid container spacing={2}>
                        {getWeekDays(selectedDate).map((day, dayIndex) => {
                          const dayEvents = getEventsForDate(day).filter(event => {
                            const typeMatch = !filters.eventTypeId || event.eventTypeId === parseInt(filters.eventTypeId);
                            const employeeMatch = !filters.employeeId || event.employeeIds?.includes(parseInt(filters.employeeId));
                            const kidMatch = !filters.kidId || event.kidIds?.includes(parseInt(filters.kidId));
                            return typeMatch && employeeMatch && kidMatch;
                          });
                          
                          const isToday = day.toDateString() === new Date().toDateString();
                          
                          return (
                            <Grid item xs key={dayIndex}>
                              <Zoom in timeout={1200 + dayIndex * 100}>
                                <MiniCalendarCard sx={{ 
                                  border: isToday ? '2px solid #667eea' : '1px solid rgba(255,255,255,0.3)',
                                  background: isToday 
                                    ? 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(102,126,234,0.05) 100%)'
                                    : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)'
                                }}>
                                  <CardContent sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" textAlign="center" gutterBottom sx={{
                                      fontWeight: 700,
                                      color: isToday ? '#667eea' : 'text.primary'
                                    }}>
                                      {day.toLocaleDateString('he-IL', { weekday: 'short' })}
                                    </Typography>
                                    <Typography variant="h6" textAlign="center" gutterBottom sx={{
                                      fontWeight: 800,
                                      color: isToday ? '#667eea' : 'text.primary'
                                    }}>
                                      {day.getDate()}
                                    </Typography>
                                    
                                    <Stack spacing={1}>
                                      {dayEvents.slice(0, 3).map((event, eventIndex) => {
                                        const eventType = eventTypes?.find(type => type.eventTypeId === event.eventTypeId);
                                        return (
                                          <Box
                                            key={event.eventId}
                                            onClick={() => handleEventClick(event)}
                                            sx={{
                                              p: 1,
                                              borderRadius: '6px',
                                              background: `${eventType?.color}20`,
                                              border: `1px solid ${eventType?.color}40`,
                                              cursor: 'pointer',
                                              fontSize: '0.75rem',
                                              '&:hover': {
                                                background: `${eventType?.color}30`,
                                                transform: 'scale(1.02)'
                                              },
                                              transition: 'all 0.2s ease',
                                              animation: `${slideInUp} 0.3s ease ${eventIndex * 0.1}s both`
                                            }}
                                          >
                                            <Typography variant="caption" fontWeight="bold" display="block">
                                              {event.eventTitle}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              {formatTime(event.start)}
                                            </Typography>
                                          </Box>
                                        );
                                      })}
                                      {dayEvents.length > 3 && (
                                        <Typography variant="caption" color="text.secondary" textAlign="center">
                                          +{dayEvents.length - 3} עוד
                                        </Typography>
                                      )}
                                      {dayEvents.length === 0 && (
                                        <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
                                          אין אירועים
                                        </Typography>
                                      )}
                                    </Stack>
                                  </CardContent>
                                </MiniCalendarCard>
                              </Zoom>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </Fade>
                )}

                {viewMode === 'month' && (
                  <Fade in timeout={1000}>
                    <Box>
                      <Typography variant="h5" gutterBottom sx={{ 
                        fontWeight: 700,
                        color: '#667eea',
                        mb: 3
                      }}>
                        📅 {selectedDate.toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}
                      </Typography>
                      
                      <MiniCalendarCard>
                        <CardContent sx={{ p: 3 }}>
                          <Grid container spacing={1}>
                            {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map(day => (
                              <Grid item xs key={day}>
                                <Typography variant="subtitle2" textAlign="center" fontWeight="bold" color="text.secondary" sx={{ p: 1 }}>
                                  {day}
                                </Typography>
                              </Grid>
                            ))}
                            {getMonthDays(selectedDate).map(({ date, isCurrentMonth }, index) => {
                              const dayEvents = getEventsForDate(date).filter(event => {
                                const typeMatch = !filters.eventTypeId || event.eventTypeId === parseInt(filters.eventTypeId);
                                const employeeMatch = !filters.employeeId || event.employeeIds?.includes(parseInt(filters.employeeId));
                                const kidMatch = !filters.kidId || event.kidIds?.includes(parseInt(filters.kidId));
                                return typeMatch && employeeMatch && kidMatch;
                              });
                              
                              const isToday = date.toDateString() === new Date().toDateString();
                              const isSelected = date.toDateString() === selectedDate.toDateString();
                              
                              return (
                                <Grid item xs key={index}>
                                  <Box
                                    onClick={() => setSelectedDate(new Date(date))}
                                    sx={{
                                      minHeight: 80,
                                      p: 1,
                                      border: '1px solid',
                                      borderColor: isToday ? '#667eea' : 'grey.200',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      background: isToday 
                                        ? 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(102,126,234,0.05) 100%)'
                                        : isSelected
                                        ? 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)'
                                        : isCurrentMonth ? 'white' : 'grey.50',
                                      opacity: isCurrentMonth ? 1 : 0.5,
                                      '&:hover': {
                                        background: 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(102,126,234,0.08) 100%)',
                                        transform: 'scale(1.02)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    <Typography variant="body2" fontWeight={isToday || isSelected ? 'bold' : 'normal'} sx={{ mb: 1 }}>
                                      {date.getDate()}
                                    </Typography>
                                    
                                    <Stack spacing={0.5}>
                                      {dayEvents.slice(0, 2).map((event, eventIndex) => {
                                        const eventType = eventTypes?.find(type => type.eventTypeId === event.eventTypeId);
                                        return (
                                          <Box
                                            key={event.eventId}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEventClick(event);
                                            }}
                                            sx={{
                                              fontSize: '0.7rem',
                                              p: 0.5,
                                              borderRadius: '4px',
                                              background: eventType?.color,
                                              color: 'white',
                                              fontWeight: 600,
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap',
                                              '&:hover': {
                                                opacity: 0.8
                                              }
                                            }}
                                          >
                                            {event.eventTitle}
                                          </Box>
                                        );
                                      })}
                                      {dayEvents.length > 2 && (
                                        <Typography variant="caption" color="text.secondary">
                                          +{dayEvents.length - 2}
                                        </Typography>
                                      )}
                                    </Stack>
                                  </Box>
                                </Grid>
                              );
                            })}
                          </Grid>
                        </CardContent>
                      </MiniCalendarCard>
                    </Box>
                  </Fade>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </MainCard>
      </Fade>

      {/* Event Details Dialog */}
      <Dialog 
        open={eventDetailsDialog} 
        onClose={() => setEventDetailsDialog(false)}
        maxWidth="md"
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
            <DialogTitle dir='rtl' sx={{ textAlign: 'center', pb: 1, pt: 4 }}>
              <Stack direction="row" spacing={3} alignItems="center" justifyContent="center">
                <Avatar sx={{ 
                  width: 80, 
                  height: 80,
                  background: eventTypes?.find(type => type.eventTypeId === selectedEvent.extendedProps.eventTypeId)?.color || '#667eea'
                }}>
                  <EventIcon sx={{ fontSize: '2.5rem' }} />
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
                      fontWeight: 600
                    }}
                  />
                </Box>
              </Stack>
            </DialogTitle>
            
            <DialogContent dir='rtl' sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item size={{xs:12,md:6}}>
                  <Paper elevation={2} sx={{ 
                    p: 3, 
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(102,126,234,0.05) 100%)'
                  }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: '#667eea' }}>
                      ⏰ פרטי זמן
                    </Typography>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TimeIcon color="primary" />
                        <Typography variant="body1">
                          {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarIcon color="primary" />
                        <Typography variant="body1">
                          {new Date(selectedEvent.start).toLocaleDateString('he-IL')}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
                {selectedEvent.extendedProps.location && (
                  <Grid item size={{xs:12,md:6}}>
                    <Paper elevation={2} sx={{ 
                      p: 3, 
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)'
                    }}>
                      <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: '#10b981' }}>
                        📍 מיקום
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocationIcon sx={{ color: '#10b981' }} />
                        <Typography variant="body1">
                          {selectedEvent.extendedProps.location}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                )}
                
                {selectedEvent.extendedProps.description && (
                  <Grid item size={{xs:12}}>
                    <Paper elevation={2} sx={{ 
                      p: 3, 
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.05) 100%)'
                    }}>
                      <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: '#f59e0b' }}>
                        📝 תיאור
                      </Typography>
                      <Typography variant="body1">
                        {selectedEvent.extendedProps.description}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                
                {(selectedEvent.extendedProps.kidIds?.length > 0 || selectedEvent.extendedProps.employeeIds?.length > 0) && (
                  <Grid item size={{xs:12}}>
                    <Paper elevation={2} sx={{ 
                      p: 3, 
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(139,69,19,0.1) 0%, rgba(139,69,19,0.05) 100%)'
                    }}>
                      <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: '#8b4513' }}>
                        👥 משתתפים
                      </Typography>
                      <Grid container spacing={2}>
                        {selectedEvent.extendedProps.kidIds?.length > 0 && (
                          <Grid item size={{xs:12,sm:6}}>
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                              ילדים:
                            </Typography>
                            <Stack spacing={1}>
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
                          </Grid>
                        )}
                        
                        {selectedEvent.extendedProps.employeeIds?.length > 0 && (
                          <Grid item size={{xs:12,sm:6}}>
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                              מטפלים:
                            </Typography>
                            <Stack spacing={1}>
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
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 4, justifyContent: 'space-between' }}>
              <GlowingButton
                onClick={() => setEventDetailsDialog(false)}
                glowColor="#6b7280"
              >
                ❌ סגור
              </GlowingButton>
              <GlowingButton
                onClick={() => console.log('Edit event:', selectedEvent)}
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

export default EnhancedCalendarSection;