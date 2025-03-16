import  { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import heLocale from '@fullcalendar/core/locales/he';
import axios from 'axios';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  IconButton,
  Typography,
  Grid,
  Box,
  Tooltip,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import TodayIcon from '@mui/icons-material/Today';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// הגדרת צבעים לסוגי אירועים שונים
const eventColors = {
  'טיפול פיזיותרפיה': '#F4A261', // כתום
  'טיפול רגשי': '#E76F51', // אדום-כתום
  'טיפול בעיסוק': '#2A9D8F', // טורקיז
  'פגישת הורים': '#E9C46A', // צהוב
  'מפגש קבוצתי': '#8AB17D', // ירוק
  'ביקור בית': '#9E86C8', // סגול
  'אחר': '#6C757D' // אפור
};

function Calendar() {
  const calendarRef = useRef(null);
  // מצב לשמירת האירועים
  const [events, setEvents] = useState([]);
  
  // מצב לטיפול בהוספה/עריכת אירוע
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: '',
    end: '',
    location: '',
    description: '',
    createdBy: 1, // ברירת מחדל: מזהה המשתמש המחובר
    type: ''
  });
  
  // מצב תצוגה (יום/שבוע/חודש)
  const [calendarView, setCalendarView] = useState('timeGridWeek');
  
  // מצב לשמירת רשימות עזר
  const [eventTypes, setEventTypes] = useState([
    'טיפול פיזיותרפיה',
    'טיפול רגשי',
    'טיפול בעיסוק',
    'פגישת הורים',
    'מפגש קבוצתי',
    'ביקור בית',
    'אחר'
  ]);
  
  // מצב לסינון אירועים
  const [filterOptions, setFilterOptions] = useState({
    kidId: '',
    employeeId: '',
    eventType: ''
  });
  
  // מצב לשמירת רשימות עזר
  const [kids, setKids] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // מצב להצגת הטופס
  const [showFilterForm, setShowFilterForm] = useState(false);

  // מצב לשמירת האירועים המסוננים
  const [filteredEvents, setFilteredEvents] = useState([]);
  
  // טעינת נתונים ראשונית
  useEffect(() => {
    fetchEvents();
    fetchKids();
    fetchEmployees();
  }, []);
  
  // עדכון האירועים המסוננים כאשר משתנים האירועים או הסינון
  useEffect(() => {
    filterEvents();
  }, [events, filterOptions]);
  
  // פונקציה לטעינת אירועים מהשרת
  const fetchEvents = async () => {
    try {
      const response = await axios.get('https://localhost:7225/api/Events');
      
      // התאמת הנתונים מהשרת לפורמט של FullCalendar
      const formattedEvents = response.data.map(event => ({
        id: event.id,
        title: event.title || `אירוע ${event.type}`,
        start: event.startTime,
        end: event.endTime,
        backgroundColor: eventColors[event.type] || eventColors['אחר'],
        borderColor: eventColors[event.type] || eventColors['אחר'],
        extendedProps: {
          location: event.location,
          description: event.description,
          type: event.type,
          createdBy: event.createdBy
        }
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('שגיאה בטעינת אירועים:', error);
      
      // נתוני דמה למקרה שאין חיבור לשרת
      const demoEvents = [
        {
          id: 1,
          title: 'טיפול פיזיותרפיה - יוסי',
          start: '2024-03-14T09:00:00',
          end: '2024-03-14T10:00:00',
          backgroundColor: eventColors['טיפול פיזיותרפיה'],
          borderColor: eventColors['טיפול פיזיותרפיה'],
          extendedProps: {
            location: 'חדר טיפולים 1',
            description: 'טיפול שבועי',
            type: 'טיפול פיזיותרפיה',
            createdBy: 1,
            kidId: 1
          }
        },
        {
          id: 2,
          title: 'פגישת הורים - משפחת כהן',
          start: '2024-03-14T11:00:00',
          end: '2024-03-14T12:00:00',
          backgroundColor: eventColors['פגישת הורים'],
          borderColor: eventColors['פגישת הורים'],
          extendedProps: {
            location: 'חדר ישיבות',
            description: 'פגישה עם הורי יוסי',
            type: 'פגישת הורים',
            createdBy: 1,
            kidId: 1
          }
        },
        {
          id: 3,
          title: 'טיפול רגשי - נועה',
          start: '2024-03-15T10:00:00',
          end: '2024-03-15T11:00:00',
          backgroundColor: eventColors['טיפול רגשי'],
          borderColor: eventColors['טיפול רגשי'],
          extendedProps: {
            location: 'חדר טיפולים 2',
            description: 'טיפול רגשי שבועי',
            type: 'טיפול רגשי',
            createdBy: 1,
            kidId: 2
          }
        },
        {
          id: 4,
          title: 'מפגש קבוצתי',
          start: '2024-03-16T09:30:00',
          end: '2024-03-16T11:00:00',
          backgroundColor: eventColors['מפגש קבוצתי'],
          borderColor: eventColors['מפגש קבוצתי'],
          extendedProps: {
            location: 'חדר פעילות',
            description: 'מפגש קבוצתי שבועי',
            type: 'מפגש קבוצתי',
            createdBy: 1,
            employeeId: 3
          }
        }
      ];
      
      setEvents(demoEvents);
    }
  };
  
  // פונקציה לסינון אירועים
  const filterEvents = () => {
    let filtered = [...events];
    
    // סינון לפי ילד
    if (filterOptions.kidId) {
      filtered = filtered.filter(event => 
        event.extendedProps.kidId === parseInt(filterOptions.kidId)
      );
    }
    
    // סינון לפי מטפל/עובד
    if (filterOptions.employeeId) {
      filtered = filtered.filter(event => 
        event.extendedProps.employeeId === parseInt(filterOptions.employeeId)
      );
    }
    
    // סינון לפי סוג אירוע
    if (filterOptions.eventType) {
      filtered = filtered.filter(event => 
        event.extendedProps.type === filterOptions.eventType
      );
    }
    
    setFilteredEvents(filtered);
  };
  
  // פונקציות טעינת נתוני עזר
  const fetchKids = async () => {
    try {
      const response = await axios.get('https://localhost:7225/api/Kids');
      setKids(response.data);
    } catch (error) {
      console.error('שגיאה בטעינת ילדים:', error);
      // נתוני דמה
      setKids([
        { id: 1, firstName: 'יוסי', lastName: 'כהן' },
        { id: 2, firstName: 'נועה', lastName: 'לוי' },
        { id: 3, firstName: 'דני', lastName: 'גולן' }
      ]);
    }
  };
  
  const fetchEmployees = async () => {
    try {
      const response = await axios.get('https://localhost:7225/api/Employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('שגיאה בטעינת עובדים:', error);
      // נתוני דמה
      setEmployees([
        { id: 1, firstName: 'טלי', lastName: 'ישראלי', role: 'מנהלת' },
        { id: 2, firstName: 'יעל', lastName: 'כהן', role: 'פיזיותרפיסטית' },
        { id: 3, firstName: 'דן', lastName: 'לוי', role: 'מטפל רגשי' }
      ]);
    }
  };
  
  // טיפול בלחיצה על תאריך ריק בלוח השנה
  const handleDateClick = (info) => {
    const now = new Date();
    const startTime = new Date(info.date);
    const endTime = new Date(info.date);
    endTime.setHours(startTime.getHours() + 1); // ברירת מחדל: שעה אחת
    
    // פורמט את התאריכים כמחרוזות ISO
    const startStr = startTime.toISOString().slice(0, 16);
    const endStr = endTime.toISOString().slice(0, 16);
    
    setSelectedEvent(null);
    setNewEvent({
      title: '',
      start: startStr,
      end: endStr,
      location: '',
      description: '',
      createdBy: 1,
      type: 'אחר'
    });
    setOpenDialog(true);
  };
  
  // טיפול בלחיצה על אירוע קיים
  const handleEventClick = (info) => {
    const event = info.event;
    
    // המר את התאריכים לפורמט HTML datetime-local
    const startStr = new Date(event.start).toISOString().slice(0, 16);
    const endStr = event.end ? new Date(event.end).toISOString().slice(0, 16) : startStr;
    
    setSelectedEvent(event);
    setNewEvent({
      id: event.id,
      title: event.title,
      start: startStr,
      end: endStr,
      location: event.extendedProps.location,
      description: event.extendedProps.description,
      createdBy: event.extendedProps.createdBy,
      type: event.extendedProps.type
    });
    setOpenDialog(true);
  };
  
  // שמירת אירוע חדש/עדכון אירוע קיים
  const handleSaveEvent = async () => {
    try {
      // וידוא שכל השדות הנדרשים מולאו
      if (!newEvent.title || !newEvent.start || !newEvent.end || !newEvent.location || !newEvent.type) {
        alert('יש למלא את כל השדות הנדרשים');
        return;
      }
      
      // בדיקה שזמן הסיום אחרי זמן ההתחלה
      if (new Date(newEvent.end) <= new Date(newEvent.start)) {
        alert('זמן הסיום חייב להיות אחרי זמן ההתחלה');
        return;
      }
      
      // מבנה נתונים לשליחה לשרת
      const eventData = {
        title: newEvent.title,
        startTime: newEvent.start,
        endTime: newEvent.end,
        location: newEvent.location,
        description: newEvent.description,
        createdBy: newEvent.createdBy,
        type: newEvent.type
      };
      
      let response;
      
      // אם יש id, מדובר בעדכון. אחרת, יצירת אירוע חדש
      if (selectedEvent) {
        eventData.id = selectedEvent.id;
        response = await axios.put(`https://localhost:7225/api/Events/${selectedEvent.id}`, eventData);
        console.log('אירוע עודכן בהצלחה');
      } else {
        response = await axios.post('https://localhost:7225/api/Events', eventData);
        console.log('אירוע נוצר בהצלחה');
      }
      
      // רענון האירועים
      fetchEvents();
      setOpenDialog(false);
    } catch (error) {
      console.error('שגיאה בשמירת אירוע:', error);
      
      // לצורכי פיתוח - אם השרת לא מחובר, נעדכן את האירועים מקומית
      if (selectedEvent) {
        // עדכון אירוע קיים
        const updatedEvents = events.map(event => 
          event.id === parseInt(selectedEvent.id) ? 
          {
            ...event,
            title: newEvent.title,
            start: newEvent.start,
            end: newEvent.end,
            backgroundColor: eventColors[newEvent.type] || eventColors['אחר'],
            borderColor: eventColors[newEvent.type] || eventColors['אחר'],
            extendedProps: {
              location: newEvent.location,
              description: newEvent.description,
              type: newEvent.type,
              createdBy: newEvent.createdBy
            }
          } : event
        );
        setEvents(updatedEvents);
      } else {
        // הוספת אירוע חדש
        const newId = Math.max(...events.map(e => parseInt(e.id)), 0) + 1;
        const newEventObj = {
          id: newId,
          title: newEvent.title,
          start: newEvent.start,
          end: newEvent.end,
          backgroundColor: eventColors[newEvent.type] || eventColors['אחר'],
          borderColor: eventColors[newEvent.type] || eventColors['אחר'],
          extendedProps: {
            location: newEvent.location,
            description: newEvent.description,
            type: newEvent.type,
            createdBy: newEvent.createdBy
          }
        };
        
        setEvents([...events, newEventObj]);
      }
      
      setOpenDialog(false);
    }
  };
  
  // מחיקת אירוע
  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        await axios.delete(`https://localhost:7225/api/Events/${selectedEvent.id}`);
        console.log('אירוע נמחק בהצלחה');
        fetchEvents();
        setOpenDialog(false);
      } catch (error) {
        console.error('שגיאה במחיקת אירוע:', error);
        
        // לצורכי פיתוח - אם השרת לא מחובר, נמחק את האירוע מקומית
        const filteredEvents = events.filter(event => event.id !== parseInt(selectedEvent.id));
        setEvents(filteredEvents);
        setOpenDialog(false);
      }
    }
  };
  
  // עדכון נתוני האירוע החדש
  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // החלפת תצוגת היומן
  const handleViewChange = (view) => {
    setCalendarView(view);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
  };
  
  // סינון אירועים
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // איפוס הסינון
  const resetFilters = () => {
    setFilterOptions({
      kidId: '',
      employeeId: '',
      eventType: ''
    });
  };
  
  // מעבר ל"היום"
  const goToToday = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().today();
    }
  };

  return (
    <div className="calendar-container" style={{ padding: '16px', direction: 'rtl' }}>
      {/* כותרת ובר ניווט */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            לוח שנה
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedEvent(null);
                setNewEvent({
                  title: '',
                  start: new Date().toISOString().slice(0, 16),
                  end: new Date(new Date().getTime() + 60*60*1000).toISOString().slice(0, 16),
                  location: '',
                  description: '',
                  createdBy: 1,
                  type: 'אחר'
                });
                setOpenDialog(true);
              }}
              sx={{ borderRadius: '8px' }}
            >
              אירוע חדש
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilterForm(!showFilterForm)}
              sx={{ borderRadius: '8px' }}
            >
              סינון
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* טופס סינון */}
      {showFilterForm && (
        <Paper elevation={1} sx={{ mb: 2, p: 2, borderRadius: '8px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>ילד</InputLabel>
                <Select
                  name="kidId"
                  value={filterOptions.kidId}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">הכל</MenuItem>
                  {kids.map(kid => (
                    <MenuItem key={kid.id} value={kid.id}>
                      {kid.firstName} {kid.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>מטפל</InputLabel>
                <Select
                  name="employeeId"
                  value={filterOptions.employeeId}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">הכל</MenuItem>
                  {employees.map(employee => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>סוג אירוע</InputLabel>
                <Select
                  name="eventType"
                  value={filterOptions.eventType}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">הכל</MenuItem>
                  {eventTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={resetFilters}
              sx={{ mr: 1, borderRadius: '8px' }}
            >
              נקה
            </Button>
          </Box>
        </Paper>
      )}
      
      {/* בקרי תצוגת יומן */}
      <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Button
              variant={calendarView === 'dayGridMonth' ? 'contained' : 'outlined'}
              onClick={() => handleViewChange('dayGridMonth')}
              sx={{ ml: 1, borderRadius: '8px' }}
            >
              חודש
            </Button>
            <Button
              variant={calendarView === 'timeGridWeek' ? 'contained' : 'outlined'}
              onClick={() => handleViewChange('timeGridWeek')}
              sx={{ ml: 1, borderRadius: '8px' }}
            >
              שבוע
            </Button>
            <Button
              variant={calendarView === 'timeGridDay' ? 'contained' : 'outlined'}
              onClick={() => handleViewChange('timeGridDay')}
              sx={{ borderRadius: '8px' }}
            >
              יום
            </Button>
          </Box>
          
          <Box>
            <Tooltip title="היום">
              <IconButton onClick={goToToday}>
                <TodayIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
      
      {/* לוח השנה */}
      <Paper elevation={2} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: 'white' }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={calendarView}
            locale={heLocale}
            direction="rtl"
            headerToolbar={{
              right: '',
              center: 'title',
              left: ''
            }}
            events={filterOptions.kidId || filterOptions.employeeId || filterOptions.eventType ? filteredEvents : events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            allDaySlot={false}
            slotMinTime="07:00:00"
            slotMaxTime="19:00:00"
            height='auto'  // גובה קבוע לתצוגה טובה יותר
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            buttonText={{
              today: 'היום',
              month: 'חודש',
              week: 'שבוע',
              day: 'יום'
            }}
            views={{
              timeGridDay: {
                titleFormat: { day: 'numeric', month: 'long', year: 'numeric' }
              },
              timeGridWeek: {
                titleFormat: { day: 'numeric', month: 'long', year: 'numeric' }
              },
              dayGridMonth: {
                titleFormat: { month: 'long', year: 'numeric' }
              }
            }}
          />
        </Box>
      </Paper>
      
      {/* דיאלוג להוספה/עריכת אירוע */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        dir="rtl"
        PaperProps={{
          sx: { borderRadius: '8px' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {selectedEvent ? 'עריכת אירוע' : 'הוספת אירוע חדש'}
            </Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="כותרת"
                name="title"
                value={newEvent.title}
                onChange={handleEventChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="תאריך ושעת התחלה"
                name="start"
                type="datetime-local"
                value={newEvent.start}
                onChange={handleEventChange}
                fullWidth
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="תאריך ושעת סיום"
                name="end"
                type="datetime-local"
                value={newEvent.end}
                onChange={handleEventChange}
                fullWidth
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required variant="outlined">
                <InputLabel>סוג אירוע</InputLabel>
                <Select
                  name="type"
                  value={newEvent.type}
                  onChange={handleEventChange}
                  label="סוג אירוע"
                >
                  {eventTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="מיקום"
                name="location"
                value={newEvent.location}
                onChange={handleEventChange}
                fullWidth
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <LocationOnIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="תיאור"
                name="description"
                value={newEvent.description}
                onChange={handleEventChange}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          {selectedEvent && (
            <Button 
              onClick={handleDeleteEvent} 
              color="error" 
              variant="outlined"
              sx={{ borderRadius: '8px' }}
            >
              מחק
            </Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Button 
            onClick={() => setOpenDialog(false)} 
            color="inherit"
            sx={{ borderRadius: '8px', mr: 1 }}
          >
            ביטול
          </Button>
          <Button 
            onClick={handleSaveEvent} 
            color="primary" 
            variant="contained"
            sx={{ borderRadius: '8px' }}
          >
            שמור
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Calendar;