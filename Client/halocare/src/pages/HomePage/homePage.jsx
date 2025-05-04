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
  DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const HomePage = () => {
  const [tasks, setTasks] = useState([
    { text: 'לסדר את הכיתה', done: false },
    { text: 'לבדוק ציוד יצירה', done: false },
  ]);
  const [newTask, setNewTask] = useState('');
  const [dailyMessage, setDailyMessage] = useState('זכרו שמחר מגיעה מפקחת — נא להכין את לוחות הקיר בהתאם 🙏');
  const [editOpen, setEditOpen] = useState(false);
  const [editedMessage, setEditedMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(true); // לשנות ל-false למשתמש רגיל
  const [attendanceSummary, setAttendanceSummary] = useState({
    class1: 0,
    class2: 0
  });

  useEffect(() => {
    // כאן יש קריאה לדאטהבייס (דמה):
    // נניח שמחזירים אובייקט כמו: { class1: 12, class2: 14 }
    const fetchAttendanceSummary = async () => {
      // דוגמה נתונים זמניים
      const dataFromDB = { class1: 12, class2: 14 };
      setAttendanceSummary(dataFromDB);
    };

    fetchAttendanceSummary();
  }, []);

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

  const dailySchedule = [
    { time: '08:00', activity: 'קבלת הילדים' },
    { time: '09:00', activity: 'פעילות יצירה' },
    { time: '10:30', activity: 'ארוחת בוקר' },
    { time: '11:00', activity: 'משחק בחצר' },
    { time: '12:00', activity: 'הביתה' },
  ];

  const handleEditMessage = () => {
    setEditedMessage(dailyMessage);
    setEditOpen(true);
  };

  const handleSaveMessage = () => {
    setDailyMessage(editedMessage);
    setEditOpen(false);
    // כאן אפשר לשמור גם לדאטהבייס אם צריך
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#eaf4fc', minHeight: '100vh' }}>

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
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
            autoFocus
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
            <Typography variant="h6" fontWeight="bold" gutterBottom>📋 לוח משימות</Typography>
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
                sx={{ flexGrow: 1, mr: 1 }}
              />
              <Button variant="contained" onClick={handleAddTask}>הוסף</Button>
            </Box>
          </Paper>
        </Grid>

        {/* לוח זמנים יומי + נוכחות */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>📆 לוח זמנים יומי</Typography>
            <List>
              {dailySchedule.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={`${item.time} - ${item.activity}`}
                    />
                  </ListItem>
                  {index < dailySchedule.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>

          <Paper elevation={3} sx={{ p: 3, mt: 3, backgroundColor: '#fce4ec' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>👧👦 סיכום נוכחות יומית</Typography>
            <Typography>כיתה 1: {attendanceSummary.class1} ילדים נוכחים</Typography>
            <Typography>כיתה 2: {attendanceSummary.class2} ילדים נוכחים</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;