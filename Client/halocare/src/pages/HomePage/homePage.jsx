import React, { useState, useEffect } from 'react';
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
  Divider,
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


const HomePage = () => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // פונקציה לחישוב סיכום נוכחות
  const calculateAttendanceSummary = (attendanceData) => {
    const summary = {};
    
    attendanceData.forEach(record => {
      if (record.attendanceStatus === 'נוכח') {
        const className = record.className || 'לא משויך לכיתה';
        summary[className] = (summary[className] || 0) + 1;
      }
    });

    return Object.entries(summary).map(([className, count]) => ({
      className,
      count
    }));
  };

  // טעינת נתונים ראשונית
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // קבלת התאריך הנוכחי בפורמט YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        
        // טעינת נתוני נוכחות
        try {
          const attendanceData = await api.getAttendanceByDate(today);
          const summary = calculateAttendanceSummary(attendanceData);
          setAttendanceSummary(summary);
        } catch (err) {
          console.error('Error fetching attendance:', err);
        }

        // טעינת אירועים מהיומן
        try {
          const eventsData = await api.getEventsByDate(today);
          // סינון אירועים להיום בלבד
          const todayEventsFiltered = eventsData.filter(event => 
            event.startTime && event.startTime.startsWith(today)
          );
          // מיון לפי שעת התחלה
          todayEventsFiltered.sort((a, b) => 
            new Date(a.startTime) - new Date(b.startTime)
          );
          setTodayEvents(todayEventsFiltered);
        } catch (err) {
          console.error('Error fetching events:', err);
        }

      } catch (err) {
        setError('שגיאה בטעינת הנתונים. אנא נסה שוב.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // רענון הדף
  const handleRefresh = async () => {
    const today = new Date().toISOString().split('T')[0];
    setLoading(true);
    
    try {
      const [attendanceData, eventsData] = await Promise.all([
        api.getAttendanceByDate(today),
        api.getEventsByDate(today)
      ]);
      
      const summary = calculateAttendanceSummary(attendanceData);
      setAttendanceSummary(summary);
      
      const todayEventsFiltered = eventsData.filter(event => 
        event.startTime && event.startTime.startsWith(today)
      );
      todayEventsFiltered.sort((a, b) => 
        new Date(a.startTime) - new Date(b.startTime)
      );
      setTodayEvents(todayEventsFiltered);
      
      setError(null);
    } catch (err) {
      setError('שגיאה ברענון הנתונים');
      console.error('Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
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
              <IconButton onClick={handleRefresh} size="small" disabled={loading}>
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
          {/* יומן יומי */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <EventNoteIcon sx={{ mr: 1, color: '#1976d2' }} />
              <Typography variant="h6" fontWeight="bold">לוח זמנים יומי</Typography>
            </Box>
            
            {todayEvents.length > 0 ? (
              <List>
                {todayEvents.map((event, index) => (
                  <React.Fragment key={event.id}>
                    <ListItem sx={{ 
                      backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                      borderRadius: 1,
                      mb: 0.5
                    }}>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ minWidth: 60 }}>
                              {formatTime(event.startTime)}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ ml: 2 }}>
                              {event.eventType} - {event.description}
                            </Typography>
                          </Box>
                        }
                        secondary={event.location ? `מיקום: ${event.location}` : null}
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                אין אירועים מתוכננים להיום
              </Typography>
            )}
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