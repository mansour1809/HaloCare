// EventsCarousel.jsx - פתרון לתצוגת אירועים רבים

import React, { useState, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Chip,
  IconButton,
  Fade,
  Zoom,
  useTheme
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Groups as GroupIcon,
  Person as PersonIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon
} from '@mui/icons-material';

// 🎨 Animations
const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

// 🎭 Styled Components
const EventCard = styled(Card)(({ theme, eventColor = '#667eea' }) => ({
  background: `linear-gradient(135deg, ${eventColor}15 0%, ${eventColor}05 100%)`,
  borderRadius: '16px',
  border: `2px solid ${eventColor}30`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  minWidth: '280px',
  maxWidth: '320px',
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
  }
}));

const CarouselContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '16px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '30px',
    height: '100%',
    background: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
    zIndex: 2,
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '30px',
    height: '100%',
    background: 'linear-gradient(270deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
    zIndex: 2,
    pointerEvents: 'none',
  }
}));

const ScrollContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  overflowX: 'auto',
  scrollBehavior: 'smooth',
  padding: theme.spacing(1, 2),
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

const NavButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 3,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(102, 126, 234, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    background: 'rgba(102, 126, 234, 0.1)',
    transform: 'translateY(-50%) scale(1.1)',
  },
  '&.prev': {
    left: 8,
  },
  '&.next': {
    right: 8,
  }
}));

const CompactEventCard = styled(Card)(({ theme, eventColor = '#667eea' }) => ({
  background: `linear-gradient(135deg, ${eventColor}20 0%, ${eventColor}10 100%)`,
  borderRadius: '12px',
  border: `1px solid ${eventColor}40`,
  padding: theme.spacing(1.5),
  margin: theme.spacing(0.5, 0),
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateX(8px)',
    boxShadow: `0 4px 20px ${eventColor}30`,
  }
}));

const EventsCarousel = ({ 
  events, 
  eventTypes, 
  onEventClick, 
  formatTime,
  maxVisible = 3,
  showExpand = true 
}) => {
  const [showAll, setShowAll] = useState(false);
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // שיטה 1: קרוסלה אופקית (לאירועים מעטים)
  if (events.length <= 4) {
    return (
      <CarouselContainer sx={{ position: 'relative' }}>
        <ScrollContainer ref={scrollRef}>
          {events.map((event, index) => {
            const eventType = eventTypes?.find(type => type.eventTypeId === event.extendedProps.eventTypeId);
            return (
              <Zoom in timeout={1200 + index * 100} key={event.eventId}>
                <EventCard 
                  eventColor={eventType?.color}
                  onClick={() => onEventClick(event)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ 
                          background: eventType?.color,
                          width: 45,
                          height: 45
                        }}>
                          <EventIcon />
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                            {event.title}
                          </Typography>
                          <Chip 
                            label={eventType?.eventType}
                            size="small"
                            sx={{ 
                              background: eventType?.color,
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                      </Stack>
                      
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TimeIcon color="action" fontSize="small" />
                          <Typography variant="body2" fontWeight={600}>
                            {formatTime(event.start)} - {formatTime(event.end)}
                          </Typography>
                        </Stack>
                        
                        {event.extendedProps.location && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationIcon color="action" fontSize="small" />
                            <Typography variant="body2">
                              {event.extendedProps.location}
                            </Typography>
                          </Stack>
                        )}
                        
                        <Stack direction="row" spacing={2}>
                          {event.extendedProps.kidIds?.length > 0 && (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <GroupIcon color="action" fontSize="small" />
                              <Typography variant="body2">
                                {event.extendedProps.kidIds.length} ילדים
                              </Typography>
                            </Stack>
                          )}
                          
                          {event.extendedProps.employeeIds?.length > 0 && (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <PersonIcon color="action" fontSize="small" />
                              <Typography variant="body2">
                                {event.extendedProps.employeeIds.length} מטפלים
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </EventCard>
              </Zoom>
            );
          })}
        </ScrollContainer>
        
        {events.length > 2 && (
          <>
          <NavButton className="next" onClick={() => scroll('left')}>
                            <PrevIcon />

            </NavButton>
            <NavButton className="prev" onClick={() => scroll('right')}>
              <NextIcon />

            </NavButton>
            
          </>
        )}
      </CarouselContainer>
    );
  }

  // שיטה 2: תצוגה מצומצמת + הרחבה (לאירועים רבים)
  const visibleEvents = showAll ? events : events.slice(0, maxVisible);
  const hasMore = events.length > maxVisible;

  return (
    <Box>
      <Stack spacing={2}>
        {/* אירועים עיקריים */}
        <Grid container spacing={2}>
          {visibleEvents.slice(0, Math.min(3, visibleEvents.length)).map((event, index) => {
            const eventType = eventTypes?.find(type => type.eventTypeId === event.extendedProps.eventTypeId);
            return (
              <Grid item size={{xs:12,sm:6,md:4}} key={event.eventId}>
                <Zoom in timeout={1200 + index * 100}>
                  <EventCard 
                    eventColor={eventType?.color}
                    onClick={() => onEventClick(event)}
                    sx={{ minWidth: 'auto', maxWidth: 'none' }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ 
                            background: eventType?.color,
                            width: 40,
                            height: 40
                          }}>
                            <EventIcon />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                              {event.title}
                            </Typography>
                            <Chip 
                              label={eventType?.eventType}
                              size="small"
                              sx={{ 
                                background: eventType?.color,
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>
                        </Stack>
                        
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TimeIcon color="action" fontSize="small" />
                          <Typography variant="body2" fontWeight={600}>
                            {formatTime(event.start)} - {formatTime(event.end)}
                          </Typography>
                        </Stack>
                        
                        {event.extendedProps.location && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationIcon color="action" fontSize="small" />
                            <Typography variant="body2" noWrap>
                              {event.extendedProps.location}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </EventCard>
                </Zoom>
              </Grid>
            );
          })}
        </Grid>

        {/* אירועים נוספים בפורמט קומפקטי */}
        {showAll && visibleEvents.length > 3 && (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2, mb: 1 }}>
                אירועים נוספים:
              </Typography>
              <Stack spacing={1}>
                {visibleEvents.slice(3).map((event, index) => {
                  const eventType = eventTypes?.find(type => type.eventTypeId === event.extendedProps.eventTypeId);
                  return (
                    <Fade in timeout={600 + index * 100} key={event.eventId}>
                      <CompactEventCard 
                        eventColor={eventType?.color}
                        onClick={() => onEventClick(event)}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ 
                            background: eventType?.color,
                            width: 32,
                            height: 32
                          }}>
                            <EventIcon fontSize="small" />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight="bold">
                              {event.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(event.start)} - {formatTime(event.end)}
                              {event.extendedProps.location && ` • ${event.extendedProps.location}`}
                            </Typography>
                          </Box>
                          <Chip 
                            label={eventType?.eventType}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              borderColor: eventType?.color,
                              color: eventType?.color,
                              fontSize: '0.65rem'
                            }}
                          />
                        </Stack>
                      </CompactEventCard>
                    </Fade>
                  );
                })}
              </Stack>
            </Box>
          </Fade>
        )}

        {/* כפתור הרחבה/כיווץ */}
        {hasMore && showExpand && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Chip
              icon={showAll ? <CollapseIcon /> : <ExpandIcon />}
              label={showAll ? `הסתר ${events.length - maxVisible} אירועים` : `הצג עוד ${events.length - maxVisible} אירועים`}
              onClick={() => setShowAll(!showAll)}
              clickable
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
                }
              }}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default EventsCarousel;

