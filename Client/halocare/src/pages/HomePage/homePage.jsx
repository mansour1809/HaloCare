import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Checkbox,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import EventNoteIcon from '@mui/icons-material/EventNote';
import GroupsIcon from '@mui/icons-material/Groups';

// נייבא את ה-actions מה-slices
import { fetchAttendanceByDate } from '../../redux/features/attendanceSlice';
import { fetchEvents } from '../../redux/features/eventsSlice';
import { fetchEventTypes } from '../../redux/features/eventTypesSlice';

const HomePage = () => {
  const dispatch = useDispatch();
  
  // גישה ישירה למבנה הנכון בחנות
  const attendance = useSelector(state => state.attendance);
  const events = useSelector(state => state.events);
  const eventTypes = useSelector(state => state.eventTypes?.eventTypes || []);
  
  // משתני מצב מקומיים
  const [tasks, setTasks] = useState([
    { text: 'לסדר את הכיתה', done: false },
    { text: 'לבדוק ציוד יצירה', done: false },
  ]);
  const [newTask, setNewTask] = useState('');
  const [dailyMessage, setDailyMessage] = useState('זכרו שמחר מגיעה מפקחת — נא להכין את לוחות הקיר בהתאם 🙏');
  const [editOpen, setEditOpen] = useState(false);
  const [editedMessage, setEditedMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(true);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);
  const [error, setError] = useState(null);
  
  // חישוב התאריך הנוכחי בפורמט YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // טעינת נתונים ראשוניים
  useEffect(() => {
    // טעינת נוכחות להיום
    dispatch(fetchAttendanceByDate(today));
    
    // טעינת כל האירועים
    dispatch(fetchEvents());
    
    // טעינת סוגי אירועים (לצבעים)
    dispatch(fetchEventTypes());
  }, [dispatch, today]);
  
  // חישוב סיכום נוכחות
  useEffect(() => {
    // גישה לנתוני נוכחות בצורה בטוחה
    const attendanceData = attendance?.attendances || [];
    
    if (attendanceData.length > 0) {
      // חישוב סיכום נוכחות לפי כיתה
      const summary = {};
      
      attendanceData.forEach(record => {
        // בודק את שדה הסטטוס (יתכן ששם השדה שונה במערכת שלך)
        if (record.attendanceStatus === 'נוכח' || record.status === 'נוכח') {
          const className = record.className || record.class?.name || 'לא משויך לכיתה';
          summary[className] = (summary[className] || 0) + 1;
        }
      });
      
      // המרה למערך לתצוגה
      const summaryArray = Object.entries(summary).map(([className, count]) => ({
        className,
        count
      }));
      
      setAttendanceSummary(summaryArray);
    }
  }, [attendance]);
  
  // עיבוד אירועים עם צבעים
  useEffect(() => {
    // בדיקת טעינת אירועים
    const eventsData = events?.events || [];
    if (eventsData.length > 0) {
      // סינון אירועים רק להיום
      const filteredEvents = eventsData.filter(event => {
        const eventDate = event.start?.split('T')[0];
        return eventDate === today;
      });
      
      // הוספת מידע על צבעים מטבלת סוגי אירועים
      const coloredEvents = filteredEvents.map(event => {
        // חיפוש סוג האירוע וצבע מתאים
        const eventType = eventTypes.find(type => 
          type.id === event.eventTypeId || type.eventTypeId === event.eventTypeId
        );
        
        return {
          ...event,
          color: eventType?.color || '#1976d2', // צבע ברירת מחדל אם אין התאמה
          typeDescription: eventType?.description || event.eventType || 'אירוע'
        };
      });
      
      // מיון לפי זמן התחלה
      coloredEvents.sort((a, b) => 
        new Date(a.start) - new Date(b.start)
      );
      
      setTodayEvents(coloredEvents);
    }
  }, [events, eventTypes, today]);
  
  // פורמט שעה לתצוגה
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };
  
  // פונקציות למשימות
  const handleTaskToggle = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].done = !updatedTasks[index].done;
    setTasks(updatedTasks);
  };
  
  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { text: newTask, done: false }]);
      setNewTask('');
    }
  };
  
  // רענון הנתונים
  const handleRefresh = () => {
    dispatch(fetchAttendanceByDate(today));
    dispatch(fetchEvents());
  };
  
  // עריכת הודעה יומית
  const handleEditMessage = () => {
    setEditedMessage(dailyMessage);
    setEditOpen(true);
  };
  
  const handleSaveMessage = () => {
    setDailyMessage(editedMessage);
    setEditOpen(false);
  };
  
  // בדיקה אם יש טעינה
  const isLoading = attendance?.loading || events?.loading;
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 4, backgroundColor: '#eaf4fc', minHeight: '100vh' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* הודעה יומית מהמנהלת */}
      <Paper elevation={4} sx={{ p: 3, mb: 4, backgroundColor: '#fff9c4', position: 'relative' }}>
        <Typography variant="h6" fontWeight="bold">📢 הודעה יומית מהמנהלת:</Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>{dailyMessage}</Typography>
        {isAdmin && (
          <IconButton
            onClick={handleEditMessage}
            sx={{ position: 'absolute', top: 8, left: 8 }}
          >
            <EditIcon />
          </IconButton>
        )}
      </Paper>

      {/* דיאלוג עריכת הודעה */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>עריכת הודעה יומית</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
            autoFocus
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>ביטול</Button>
          <Button variant="contained" onClick={handleSaveMessage}>שמור</Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={4}>
        {/* לוח משימות */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">📋 לוח משימות</Typography>
              <IconButton onClick={handleRefresh} size="small" disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </Box>
            <List>
              {tasks.map((task, index) => (
                <ListItem key={index}>
                  <Checkbox
                    checked={task.done}
                    onChange={() => handleTaskToggle(index)}
                  />
                  <ListItemText
                    primary={task.text}
                    sx={{ textDecoration: task.done ? 'line-through' : 'none' }}
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', mt: 2 }}>
              <TextField
                label="הוסף משימה"
                size="small"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                sx={{ flexGrow: 1, mr: 1 }}
              />
              <Button variant="contained" onClick={handleAddTask}>הוסף</Button>
            </Box>
          </Paper>
        </Grid>

        {/* יומן + נוכחות */}
        <Grid item xs={12} md={6}>
          {/* יומן יומי - דומה ללוח שנה */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <EventNoteIcon sx={{ mr: 1, color: '#1976d2' }} />
              <Typography variant="h6" fontWeight="bold">לוח זמנים יומי</Typography>
            </Box>
            
            {/* תצוגת אירועים בדומה ללוח השנה */}
            <Box sx={{ position: 'relative', minHeight: '300px', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
              {todayEvents.length > 0 ? (
                todayEvents.map((event, index) => {
                  // חישוב מיקום וגובה לפי זמן
                  const startTime = new Date(event.start);
                  const endTime = event.end ? new Date(event.end) : new Date(startTime.getTime() + 60 * 60 * 1000);
                  
                  const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                  const endHour = endTime.getHours() + endTime.getMinutes() / 60;
                  
                  // מיקום וגודל בוקס האירוע (7:00-18:00 = 11 שעות)
                  const top = ((startHour - 7) / 11) * 100;
                  const height = ((endHour - startHour) / 11) * 100;
                  
                  return (
                    <Box
                      key={event.id || index}
                      sx={{
                        position: 'absolute',
                        top: `${top}%`,
                        height: `${height}%`,
                        width: 'calc(100% - 60px)',
                        right: '60px', // מרחק מציר הזמן
                        backgroundColor: event.color,
                        borderRadius: '4px',
                        padding: '8px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        opacity: 0.9,
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 1,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#fff' }}>
                        {formatTime(event.start)} - {formatTime(event.end)}
                      </Typography>
                      <Typography variant="body2" noWrap sx={{ color: '#fff' }}>
                        {event.typeDescription}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#fff', mt: 'auto' }}>
                        {event.description || event.title}
                      </Typography>
                    </Box>
                  );
                })
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  אין אירועים מתוכננים להיום
                </Typography>
              )}
              
              {/* ציר זמנים */}
              <Box sx={{ position: 'absolute', top: 0, right: 0, height: '100%', width: '60px' }}>
                {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((hour) => (
                  <Box key={hour} sx={{ 
                    position: 'absolute', 
                    top: `${(hour - 7) / 11 * 100}%`, 
                    right: 0, 
                    width: '100%',
                    borderTop: '1px solid #e0e0e0',
                    paddingRight: '5px',
                    textAlign: 'right',
                    fontSize: '0.8rem',
                    color: '#666'
                  }}>
                    {`${hour}:00`}
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>

          {/* סיכום נוכחות */}
          <Paper elevation={3} sx={{ p: 3, backgroundColor: '#e3f2fd' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <GroupsIcon sx={{ mr: 1, color: '#1976d2' }} />
              <Typography variant="h6" fontWeight="bold">סיכום נוכחות יומית</Typography>
            </Box>
            
            {attendanceSummary.length > 0 ? (
              <Grid container spacing={2}>
                {attendanceSummary.map((item, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card sx={{ backgroundColor: '#fff', boxShadow: 1 }}>
                      <CardContent sx={{ py: 1.5 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {item.className}
                        </Typography>
                        <Typography variant="h4" color="primary">
                          {item.count}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ילדים נוכחים
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                אין נתוני נוכחות להיום
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;