// src/components/shared/SharedCalendarWidget.jsx
// קומפוננטה כללית ליומן שיתופי - לשימוש בפרופיל עובד ותיק ילד

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Badge,
  Stack,
  Grid
} from '@mui/material';
import {
  Event as EventIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { format, isToday, isTomorrow, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { he } from 'date-fns/locale';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: 16,
  overflow: 'visible',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981)',
    borderRadius: '16px 16px 0 0',
  }
}));

const EventListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: 12,
  marginBottom: theme.spacing(1),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    transform: 'translateX(-4px)',
    boxShadow: `4px 0 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  }
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5, 0),
  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '50px',
    height: '2px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043)',
  }
}));

const SharedCalendarWidget = ({ 
  entityId, 
  entityType = 'employee', // 'employee' או 'kid'
  title = '📅 יומן ואירועים',
  maxEvents = 5,
  showQuickActions = true,
  compact = false
}) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock data - בהמשך יחובר לAPI האמיתי
  const mockEvents = [
    {
      id: 1,
      title: 'ישיבת צוות חודשית',
      startTime: new Date(),
      endTime: addDays(new Date(), 0),
      type: 'meeting',
      participants: ['מנהלת המעון', 'צוות החינוך'],
      location: 'חדר הישיבות',
      priority: 'high',
      description: 'דיווח על התקדמות הילדים ותכנון פעילויות'
    },
    {
      id: 2,
      title: 'יום הולדת - שרה כהן',
      startTime: addDays(new Date(), 1),
      endTime: addDays(new Date(), 1),
      type: 'celebration',
      participants: ['כיתה א\''],
      location: 'כיתה א\'',
      priority: 'medium',
      description: 'חגיגת יום הולדת עם עוגה ושירים'
    },
    {
      id: 3,
      title: 'הדרכה מקצועית - טיפול בהתנהגות',
      startTime: addDays(new Date(), 3),
      endTime: addDays(new Date(), 3),
      type: 'training',
      participants: ['כל הצוות'],
      location: 'אולם הרצאות',
      priority: 'high',
      description: 'הדרכה מקצועית עם פסיכולוגית חינוכית'
    },
    {
      id: 4,
      title: 'ביקור הורים - התכוננות לחופש',
      startTime: addDays(new Date(), 5),
      endTime: addDays(new Date(), 5),
      type: 'parent_meeting',
      participants: ['הורי כיתה ב\''],
      location: 'חדר הרב תכליתי',
      priority: 'medium',
      description: 'מפגש הכנה לחופש הקיץ והנחיות להורים'
    },
    {
      id: 5,
      title: 'פעילות חוץ - גן החיות',
      startTime: addDays(new Date(), 7),
      endTime: addDays(new Date(), 7),
      type: 'activity',
      participants: ['כיתה ג\'', 'כיתה ד\''],
      location: 'גן החיות התנכי',
      priority: 'low',
      description: 'טיול לימודי לגן החיות עם צוות מלא'
    }
  ];

  useEffect(() => {
    // סימולציה של טעינת נתונים
    const loadEvents = async () => {
      setLoading(true);
      try {
        // כאן יהיה קריאה לAPI האמיתי
        // const response = await fetchEventsByEntity(entityId, entityType);
        
        // בינתיים נשתמש במידע הדמה
        setTimeout(() => {
          setEvents(mockEvents.slice(0, maxEvents));
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('שגיאה בטעינת אירועים');
        setLoading(false);
      }
    };

    loadEvents();
  }, [entityId, entityType, maxEvents]);

  // פונקציות עזר
  const getEventTypeIcon = (type) => {
    const icons = {
      meeting: <GroupsIcon />,
      celebration: '🎉',
      training: '📚',
      parent_meeting: <PersonIcon />,
      activity: '🎯'
    };
    return icons[type] || <EventIcon />;
  };

  const getEventTypeColor = (type) => {
    const colors = {
      meeting: '#2196f3',
      celebration: '#ff9800',
      training: '#4caf50',
      parent_meeting: '#9c27b0',
      activity: '#ff5722'
    };
    return colors[type] || '#757575';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#f44336',
      medium: '#ff9800',
      low: '#4caf50'
    };
    return colors[priority] || '#757575';
  };

  const formatEventDate = (date) => {
    if (isToday(date)) {
      return 'היום';
    } else if (isTomorrow(date)) {
      return 'מחר';
    } else {
      return format(date, 'dd/MM', { locale: he });
    }
  };

  const formatEventTime = (date) => {
    return format(date, 'HH:mm', { locale: he });
  };

  const handleViewFullCalendar = () => {
    navigate('/calendar');
  };

  const getUpcomingEventsCount = () => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    return events.filter(event => 
      event.startTime >= today && event.startTime <= nextWeek
    ).length;
  };

  if (loading) {
    return (
      <StyledCard>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            טוען אירועים...
          </Typography>
        </CardContent>
      </StyledCard>
    );
  }

  if (error) {
    return (
      <StyledCard>
        <CardContent sx={{ p: 3 }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <StyledCard>
      <CardContent sx={{ p: compact ? 2 : 3 }}>
        {/* כותרת */}
        <SectionHeader>
          <CalendarIcon sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', flex: 1 }}>
            {title}
          </Typography>
          
          {/* תג מספר אירועים */}
          <Badge badgeContent={getUpcomingEventsCount()} color="primary">
            <NotificationsIcon color="action" />
          </Badge>
        </SectionHeader>

        {/* אירועים קרובים */}
        {events.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              🗓️ אין אירועים קרובים השבוע
            </Typography>
          </Alert>
        ) : (
          <List sx={{ p: 0 }}>
            {events.map((event, index) => (
              <EventListItem key={event.id}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: getEventTypeColor(event.type),
                      fontSize: '1rem'
                    }}
                  >
                    {typeof getEventTypeIcon(event.type) === 'string' 
                      ? getEventTypeIcon(event.type) 
                      : getEventTypeIcon(event.type)
                    }
                  </Avatar>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body1" fontWeight={600}>
                        {event.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={formatEventDate(event.startTime)}
                        sx={{
                          backgroundColor: getPriorityColor(event.priority),
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 20
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Stack spacing={0.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatEventTime(event.startTime)}
                        </Typography>
                        {event.location && (
                          <>
                            <Typography variant="caption" color="text.secondary">
                              •
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              📍 {event.location}
                            </Typography>
                          </>
                        )}
                      </Box>
                      
                      {event.participants && (
                        <Typography variant="caption" color="text.secondary">
                          👥 {event.participants.join(', ')}
                        </Typography>
                      )}
                      
                      {!compact && event.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ 
                          fontStyle: 'italic',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {event.description}
                        </Typography>
                      )}
                    </Stack>
                  }
                />
              </EventListItem>
            ))}
          </List>
        )}

        {/* פעולות מהירות */}
        {showQuickActions && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<CalendarIcon />}
                onClick={handleViewFullCalendar}
                sx={{ borderRadius: 3, flex: 1 }}
              >
                יומן מלא
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<TodayIcon />}
                sx={{ borderRadius: 3, flex: 1 }}
                color="success"
              >
                אירועי היום
              </Button>
              
              {!compact && (
                <IconButton
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      transform: 'scale(1.1)'
                    }
                  }}
                  onClick={handleViewFullCalendar}
                >
                  <ArrowForwardIcon />
                </IconButton>
              )}
            </Box>
          </>
        )}

        {/* סטטיסטיקה מהירה */}
        {!compact && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            borderRadius: 2, 
            backgroundColor: alpha('#4cb5c3', 0.05),
            border: '1px solid rgba(76, 181, 195, 0.2)'
          }}>
            <Grid container spacing={2} sx={{ textAlign: 'center' }}>
              <Grid item xs={4}>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {events.filter(e => isToday(e.startTime)).length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  היום
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h6" fontWeight={700} color="warning.main">
                  {events.filter(e => isTomorrow(e.startTime)).length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  מחר
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  {getUpcomingEventsCount()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  השבוע
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default SharedCalendarWidget;