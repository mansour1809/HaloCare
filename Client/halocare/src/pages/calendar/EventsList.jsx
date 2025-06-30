import React, { useState, useEffect } from 'react';
import { useCalendar } from './CalendarContext';
import {
  Box,
  Typography,
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
  CircularProgress,
  Container,
  Stack,
  Avatar,
  Fade,
  Zoom,
  alpha,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Link as LinkIcon,
  AccessTime as AccessTimeIcon,
  Room as RoomIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Person as PersonIcon,
  ChildCare as ChildIcon,
  CalendarMonth as CalendarIcon,
  AutoAwesome as AutoAwesomeIcon,
  Celebration as CelebrationIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

// Custom theme for the events list
const eventsTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
  },
  palette: {
    primary: {
      main: '#667eea',
      light: '#818cf8',
      dark: '#4338ca',
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
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
          }
        }
      }
    }
  }
});

const GradientContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const MainHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -15,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 120,
    height: 4,
    background: 'linear-gradient(90deg, #ffffff, rgba(255,255,255,0.5), #ffffff)',
    borderRadius: 2,
  }
}));

const ControlCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.98)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: 'linear-gradient(90deg, #10b981, #34d399, #059669)',
    borderRadius: '20px 20px 0 0',
  }
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 25,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
      transform: 'translateY(-2px)',
    },
    '&.Mui-focused': {
      boxShadow: '0 6px 25px rgba(102, 126, 234, 0.3)',
      transform: 'translateY(-3px)',
    }
  }
}));

const NavButton = styled(IconButton)(({ theme }) => ({
  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
  color: 'white',
  boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
  }
}));

// Styled Event Card
const EventCard = styled(Card)(({ borderColor }) => ({
  cursor: 'pointer',
  height: '100%',
  position: 'relative',
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: borderColor || '#667eea',
    borderRadius: '20px 20px 0 0',
  },
  '&:hover': {
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(135deg, ${alpha(borderColor || '#667eea', 0.1)} 0%, transparent 100%)`,
      borderRadius: 20,
      pointerEvents: 'none',
    }
  }
}));

const StatsChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
  color: 'white',
  fontWeight: 600,
  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
  }
}));

// Helper function to group events by date
const groupEventsByDate = (events) => {
  const grouped = {};

  events.forEach(event => {
    const date = event.start.split('T')[0];

    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(event);
  });

  return Object.keys(grouped)
    .sort()
    .reduce((acc, date) => {
      acc[date] = grouped[date];
      return acc;
    }, {});
};

const formatHebrewDate = (dateStr) => {
  const date = new Date(dateStr);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  };
  return date.toLocaleDateString('he-IL', options);
};

const formatTime = (timeStr) => {
  const date = new Date(timeStr);
  return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
};

const getDurationInMinutes = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.round((endDate - startDate) / (1000 * 60));
};

const EventsList = () => {
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

  const theme = useTheme();

  const [groupedEvents, setGroupedEvents] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [localFilteredEvents, setLocalFilteredEvents] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Update grouped events
  useEffect(() => {
    let eventsToShow = filteredEvents.length > 0 ? filteredEvents : events;

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

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  const getKidName = (kidId) => {
    if (!kidId) return 'ללא ילד';
    const kid = kids.find(k => k.id === parseInt(kidId));
    return kid ? `${kid.firstName} ${kid.lastName}` : 'ילד לא מוכר';
  };

  // Finding employee names by IDs
  const getEmployeeNames = (employeeIds) => {
    if (!employeeIds || employeeIds.length === 0) return 'ללא מטפלים';
    return employeeIds.map(id => {
      const employee = employees.find(e => e.id === parseInt(id));
      return employee ? `${employee.firstName} ${employee.lastName}` : 'עובד לא מוכר';
    }).join(', ');
  };

  const onEventClick = (event) => {
    handleEventClick({ event });
  };

  return (
    <ThemeProvider theme={eventsTheme}>
      <GradientContainer maxWidth="xl" dir="rtl">
        {/* Main Header */}
        <Fade in timeout={800}>
          <MainHeader>
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
              לוח פגישות
            </Typography>
          </MainHeader>
        </Fade>

        {/* Navigation and Filtering Tools */}
        <Zoom in timeout={1000}>
          <ControlCard>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                {/* Search */}
                <Grid item xs={12} md={4}>
                  <SearchField
                    placeholder="חיפוש באירועים..."
                    variant="outlined"
                    size="medium"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Monthly Navigation */}
                <Grid item xs={12} md={4}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                    <Tooltip title="חודש קודם" arrow>
                      <NavButton onClick={goToPreviousMonth} size="small">
                        <ChevronRightIcon />
                      </NavButton>
                    </Tooltip>

                    <Typography
                      variant="h6"
                      sx={{
                        mx: 2,
                        fontWeight: 600,
                        color: 'primary.main',
                        minWidth: 150,
                        textAlign: 'center'
                      }}
                    >
                      {currentMonth.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
                    </Typography>

                    <Tooltip title="חודש הבא" arrow>
                      <NavButton onClick={goToNextMonth} size="small">
                        <ChevronLeftIcon />
                      </NavButton>
                    </Tooltip>

                    <Tooltip title="חזור להיום" arrow>
                      <IconButton
                        onClick={goToCurrentMonth}
                        sx={{
                          mx: 1,
                          background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
                          color: 'white',
                          '&:hover': {
                            transform: 'scale(1.1) rotate(360deg)',
                            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                          },
                          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        <TodayIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Grid>

                {/* Buttons and Statistics */}
                <Grid item xs={12} md={4}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
                    <StatsChip
                      label={`${localFilteredEvents.length} אירועים`}
                      icon={<ScheduleIcon />}
                    />

                    <Button
                      variant={filterOpen ? "contained" : "outlined"}
                      startIcon={filterOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      onClick={() => setFilterOpen(!filterOpen)}
                      sx={{
                        borderRadius: 4,
                        fontWeight: 600,
                        ...(filterOpen && {
                          background: 'linear-gradient(45deg, #f59e0b 30%, #fbbf24 90%)',
                          color: 'white'
                        })
                      }}
                    >
                      סינון מתקדם
                    </Button>

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={createNewEvent}
                      startIcon={<CelebrationIcon />}
                      sx={{
                        borderRadius: 4,
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                        boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                        }
                      }}
                    >
                      אירוע חדש
                    </Button>
                  </Stack>
                </Grid>
              </Grid>

              <Collapse in={filterOpen}>
                <Divider sx={{ my: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="medium">
                      <InputLabel>סוג אירוע</InputLabel>
                      <Select
                        name="eventType"
                        value={filterOptions.eventType}
                        onChange={handleFilterChange}
                        label="סוג אירוע"
                        sx={{ borderRadius: 3 }}
                      >
                        <MenuItem value="">כל הסוגים</MenuItem>
                        {eventTypes.map((type, index) => (
                          <MenuItem key={index} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="medium">
                      <InputLabel>ילד</InputLabel>
                      <Select
                        name="kidId"
                        value={filterOptions.kidId}
                        onChange={handleFilterChange}
                        label="ילד"
                        sx={{ borderRadius: 3 }}
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
                    <FormControl fullWidth size="medium">
                      <InputLabel>מטפל</InputLabel>
                      <Select
                        name="employeeId"
                        value={filterOptions.employeeId}
                        onChange={handleFilterChange}
                        label="מטפל"
                        sx={{ borderRadius: 3 }}
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

                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      onClick={resetFilters}
                      fullWidth
                      sx={{
                        height: 56,
                        borderRadius: 3,
                        fontWeight: 600,
                        borderColor: 'error.main',
                        color: 'error.main',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #ef4444 30%, #dc2626 90%)',
                          color: 'white',
                          borderColor: 'transparent',
                        }
                      }}
                    >
                      נקה סינון
                    </Button>
                  </Grid>
                </Grid>
              </Collapse>
            </CardContent>
          </ControlCard>
        </Zoom>

        {isLoading && (
          <Fade in>
            <Card sx={{ p: 4, textAlign: 'center', mb: 3 }}>
              <CircularProgress
                size={60}
                thickness={4}
                sx={{
                  color: 'primary.main',
                  filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))'
                }}
              />
              <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                טוען אירועים...
              </Typography>
            </Card>
          </Fade>
        )}

        {/* Error message */}
        {error && (
          <Fade in>
            <Card sx={{
              p: 3,
              mb: 3,
              background: 'linear-gradient(45deg, #fee2e2 30%, #fef2f2 90%)',
              border: '1px solid #f87171',
              '&::before': {
                background: 'linear-gradient(90deg, #ef4444, #dc2626, #b91c1c)',
              }
            }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ background: '#ef4444' }}>
                  ⚠️
                </Avatar>
                <Typography color="error.main" fontWeight={600}>
                  {error}
                </Typography>
              </Stack>
            </Card>
          </Fade>
        )}

        {/* Events list*/}
        {!isLoading && Object.keys(groupedEvents).length > 0 ? (
          Object.keys(groupedEvents).map((date, dateIndex) => (
            <Fade in timeout={1200 + (dateIndex * 200)} key={date}>
              <Box sx={{ mb: 4 }}>
                {/* Date Header */}
                <Card sx={{
                  mb: 3,
                  background: 'rgba(255, 255, 255, 0.9)',
                  '&::before': {
                    background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #d97706)',
                  }
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{
                          background: 'linear-gradient(45deg, #f59e0b 30%, #fbbf24 90%)',
                          boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)'
                        }}>
                          📅
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={700}>
                            {formatHebrewDate(date)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {groupedEvents[date].length} אירועים ביום זה
                          </Typography>
                        </Box>
                      </Stack>

                      <Chip
                        label={`${groupedEvents[date].length} אירועים`}
                        color="warning"
                        variant="outlined"
                        icon={<AutoAwesomeIcon />}
                      />
                    </Stack>
                  </CardContent>
                </Card>

                {/* Events Grid */}
                <Grid container spacing={3}>
                  {groupedEvents[date].map((event, eventIndex) => {
                    const duration = getDurationInMinutes(event.start, event.end);
                    const backgroundColor = event.backgroundColor || '#667eea';

                    return (
                      <Grid item xs={12} sm={6} lg={4} key={event.id}>
                        <Zoom in timeout={300 + (eventIndex * 100)}>
                          <EventCard
                            borderColor={backgroundColor}
                            onClick={() => onEventClick(event)}
                          >
                            <CardContent sx={{ p: 3 }}>
                              {/* Event header */}
                              <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
                                <Avatar sx={{
                                  background: backgroundColor,
                                  width: 40,
                                  height: 40,
                                  fontSize: '1.2rem'
                                }}>
                                  🎯
                                </Avatar>
                                <Box flex={1}>
                                  <Typography
                                    variant="h6"
                                    component="h3"
                                    sx={{
                                      fontWeight: 700,
                                      color: backgroundColor,
                                      mb: 0.5,
                                      lineHeight: 1.2
                                    }}
                                  >
                                    {event.title}
                                  </Typography>

                                  <Chip
                                    label={`${duration} דקות`}
                                    size="small"
                                    sx={{
                                      background: alpha(backgroundColor, 0.1),
                                      color: backgroundColor,
                                      fontWeight: 600
                                    }}
                                  />
                                </Box>
                              </Stack>

                              {/* Evevnt details*/}
                              <Stack spacing={1.5}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <AccessTimeIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                                  <Typography variant="body2" fontWeight={500}>
                                    {formatTime(event.start)} - {formatTime(event.end)}
                                  </Typography>
                                </Stack>

                                <Stack direction="row" spacing={1} alignItems="center">
                                  <RoomIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {event.extendedProps.location || 'ללא מיקום מוגדר'}
                                  </Typography>
                                </Stack>

                                <Stack direction="row" spacing={1} alignItems="center">
                                  <ChildIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {getKidName(event.extendedProps.kidId)}
                                  </Typography>
                                </Stack>

                                <Stack direction="row" spacing={1} alignItems="center">
                                  <PersonIcon sx={{ color: 'secondary.main', fontSize: 18 }} />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {getEmployeeNames(event.extendedProps.employeeIds)}
                                  </Typography>
                                </Stack>

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
                                      textOverflow: 'ellipsis',
                                      fontStyle: 'italic'
                                    }}
                                  >
                                    "{event.extendedProps.description}"
                                  </Typography>
                                )}
                              </Stack>
                            </CardContent>

                            <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                              <Tooltip title="פרטים נוספים" arrow>
                                <IconButton
                                  size="small"
                                  sx={{
                                    background: alpha(backgroundColor, 0.1),
                                    color: backgroundColor,
                                    '&:hover': {
                                      background: backgroundColor,
                                      color: 'white',
                                      transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEventClick(event);
                                  }}
                                >
                                  <LinkIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </CardActions>
                          </EventCard>
                        </Zoom>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Fade>
          ))
        ) : !isLoading && (
          <Fade in>
            <Card sx={{
              p: 6,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.9)',
              '&::before': {
                background: 'linear-gradient(90deg, #6b7280, #9ca3af, #d1d5db)',
              }
            }}>
              <Avatar sx={{
                width: 80,
                height: 80,
                margin: '0 auto 16px',
                background: 'linear-gradient(45deg, #6b7280 30%, #9ca3af 90%)',
                fontSize: '2rem'
              }}>
                📅
              </Avatar>
              <Typography variant="h5" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
                לא נמצאו אירועים
              </Typography>
              <Typography variant="body1" color="text.secondary">
                אין אירועים העונים לקריטריונים שנבחרו
              </Typography>
            </Card>
          </Fade>
        )}
      </GradientContainer>
    </ThemeProvider>
  );
};

export default EventsList;