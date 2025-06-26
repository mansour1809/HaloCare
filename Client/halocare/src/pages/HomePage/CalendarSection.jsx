import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Paper,

} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';


const CalendarSection = ({ onViewFullCalendar, onEventClick }) => {
  const todayEvents = [
    {
      id: 1,
      time: "09:00",
      title: "טיפול פיזיותרפיה - דני כהן",
      type: "פיזיותרפיה",
      location: "חדר 1",
      therapist: "רותי כהן",
      color: "#7AC7D7"
    },
    {
      id: 2,
      time: "10:30",
      title: "טיפול רגשי - מיה לוי",
      type: "טיפול רגשי",
      location: "חדר 2",
      therapist: "מירי שלום",
      color: "#8FD3C3"
    },
    {
      id: 3,
      time: "11:15",
      title: "ריפוי בעיסוק - תמר משה",
      type: "ריפוי בעיסוק",
      location: "חדר 3",
      therapist: "שרה לוי",
      color: "#FF9F9F"
    },
    {
      id: 4,
      time: "14:00",
      title: "פגישה עם משפחת אבני",
      type: "פגישת הורים",
      location: "משרד המנהלת",
      therapist: "מנהלת הגן",
      color: "#93CE85"
    },
    {
      id: 5,
      time: "15:30",
      title: "ישיבת צוות שבועית",
      type: "ישיבת צוות",
      location: "חדר הישיבות",
      therapist: "כל הצוות",
      color: "#DEC49F"
    }
  ];

  const today = new Date();
  const dayNumber = today.getDate();
  const monthName = today.toLocaleDateString('he-IL', { month: 'long' });

  return (
    <Card elevation={3} sx={{ height: '100%' }}>
      <Box 
        sx={{ 
          p: 2.5,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CalendarIcon color="primary" />
            <Typography variant="h5" fontWeight="bold">
              יומן היום
            </Typography>
          </Stack>
          <Button
            variant="contained"
            size="small"
            startIcon={<ViewIcon />}
            onClick={onViewFullCalendar}
          >
            יומן מלא
          </Button>
        </Stack>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {/* לוח תאריך מיני */}
        <Paper 
          elevation={1}
          sx={{ 
            p: 2,
            mb: 3,
            textAlign: 'center',
            bgcolor: 'grey.50'
          }}
        >
          <Typography variant="h3" fontWeight="bold" color="primary.main">
            {dayNumber}
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={1}>
            יום רביעי, {monthName}
          </Typography>
          <Chip 
            label={`${todayEvents.length} אירועים מתוכננים`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Paper>

        {/* רשימת אירועים */}
        <Stack spacing={1.5} sx={{ maxHeight: 350, overflow: 'auto' }}>
          {todayEvents.map((event) => (
            <Paper
              key={event.id}
              elevation={1}
              sx={{
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateX(-4px)',
                  boxShadow: 2,
                  borderRight: 3,
                  borderColor: 'primary.main'
                }
              }}
              onClick={() => onEventClick(event.id)}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Chip
                  label={event.time}
                  size="small"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
                <Chip
                  label={event.type}
                  size="small"
                  sx={{
                    bgcolor: event.color,
                    color: 'white'
                  }}
                />
              </Stack>
              <Typography variant="subtitle2" fontWeight="bold" mb={0.5}>
                {event.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {event.location} • {event.therapist}
              </Typography>
            </Paper>
          ))}
        </Stack>

        <Box textAlign="center" mt={2}>
          <Button
            variant="outlined"
            size="small"
            onClick={onViewFullCalendar}
          >
            עוד {Math.max(0, 7)} אירועים...
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CalendarSection;