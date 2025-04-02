import React, { useEffect, useState } from 'react';
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
  Divider,
  Chip,
  Avatar,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import TitleIcon from '@mui/icons-material/Title';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// יבוא צבעים לסוגי אירועים
// import { eventColors } from './calendarUtils';

// שימוש בקונטקסט
import { useCalendar } from './CalendarContext';

const EventDialog = () => {
  // קבלת ערכים ופונקציות מהקונטקסט
  const {
    openDialog,
    setOpenDialog,
    selectedEvent,
    newEvent,
    handleEventChange,
    handleSaveEvent,
    handleDeleteEvent,
    eventTypes,
    kids,
    employees,
    eventColors
  } = useCalendar();
  
  // שמירת פרטי היוצר
  const [creator, setCreator] = useState(null);
  
  // אפקט לטעינת פרטי היוצר מ-localStorage
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        setCreator(user);
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    }
  }, []);
  
  // פונקציה מעודכנת לטיפול בשינויים במשתתפים
  const handleParticipantsChange = (event) => {
    const { name, value } = event.target;
    
    // אם זה kidIds - צריך להיות מערך גם אם בוחרים ערך אחד
    if (name === 'kidIds') {
      const updatedValue = Array.isArray(value) ? value : [value];
      handleEventChange({
        target: {
          name,
          value: updatedValue
        }
      });
    } else {
      // טיפול רגיל בשדות אחרים
      handleEventChange(event);
    }
  };
  
  // מציאת היוצר המקורי של האירוע (אם קיים)
  const getCreatorName = () => {
    if (selectedEvent && selectedEvent.createdBy) {
      const creatorEmployee = employees.find(emp => emp.id === selectedEvent.createdBy);
      if (creatorEmployee) {
        return `${creatorEmployee.firstName} ${creatorEmployee.lastName}`;
      }
      return `משתמש #${selectedEvent.createdBy}`;
    }
    
    if (creator) {
      return `${creator.firstName} ${creator.lastName}`;
    }
    
    return 'משתמש לא מזוהה';
  };
  
  // קבלת צבע עבור סוג האירוע הנוכחי
  const currentEventColor = eventColors[newEvent.type] || '#6C757D';
  
  return (
    <Dialog 
      open={openDialog} 
      onClose={() => setOpenDialog(false)} 
      maxWidth="md" 
      fullWidth
      dir="rtl"
      PaperProps={{
        sx: { 
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden'
        }
      }}
    >
      {/* כותרת הדיאלוג */}
      <DialogTitle
        sx={{ 
          p: 2,
          backgroundColor: currentEventColor,
          color: '#fff',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <CategoryIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {selectedEvent ? 'עריכת אירוע' : 'הוספת אירוע חדש'}
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setOpenDialog(false)}
            sx={{ 
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, mt: 1 }}>
        <Grid container spacing={3}>
          {/* שורה ראשונה - כותרת וסוג אירוע */}
          <Grid item xs={12} sm={7}>
            <TextField
              label="כותרת האירוע"
              name="title"
              value={newEvent.title || ''}
              onChange={handleEventChange}
              fullWidth
              required
              variant="outlined"
              InputProps={{
                startAdornment: <TitleIcon color="action" sx={{ mr: 1 }} />
              }}
              placeholder="הכנס כותרת לאירוע"
            />
          </Grid>
          
          <Grid item xs={12} sm={5}>
            <FormControl fullWidth required variant="outlined">
              <InputLabel>סוג אירוע</InputLabel>
              <Select
                name="type"
                value={newEvent.type || ''}
                onChange={handleEventChange}
                label="סוג אירוע"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 250,
                    },
                  },
                }}
                startAdornment={<CategoryIcon color="action" sx={{ mr: 1 }} />}
              >
                {eventTypes.map(type => (
                  <MenuItem 
                    key={type.id || type}
                    value={type.id || type}
                    sx={{ 
                      borderRight: `4px solid ${type.color || eventColors[type] || '#6C757D'}`
                    }}
                  >
                    {type.name || type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* שורה שנייה - תאריך ושעה */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="תאריך ושעת התחלה"
              name="start"
              type="datetime-local"
              value={newEvent.start || ''}
              onChange={handleEventChange}
              fullWidth
              required
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <AccessTimeIcon color="action" sx={{ mr: 1 }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="תאריך ושעת סיום"
              name="end"
              type="datetime-local"
              value={newEvent.end || ''}
              onChange={handleEventChange}
              fullWidth
              required
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <AccessTimeIcon color="action" sx={{ mr: 1 }} />
              }}
            />
          </Grid>
          
          {/* שורה שלישית - מיקום */}
          <Grid item xs={12}>
            <TextField
              label="מיקום"
              name="location"
              value={newEvent.location || ''}
              onChange={handleEventChange}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: <LocationOnIcon color="action" sx={{ mr: 1 }} />
              }}
              placeholder="הזן את מיקום האירוע"
            />
          </Grid>
          
          {/* שורה רביעית - קישור לילדים */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>ילדים</InputLabel>
              <Select
                name="kidIds"
                multiple
                value={newEvent.kidIds || []}
                onChange={handleParticipantsChange}
                label="ילדים"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const kid = kids.find(k => k.id === value);
                      return (
                        <Chip 
                          key={value} 
                          label={kid ? `${kid.firstName} ${kid.lastName}` : value}
                          size="small"
                          avatar={<Avatar><ChildCareIcon fontSize="small" /></Avatar>}
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    style: { maxHeight: 250 },
                  },
                }}
                startAdornment={<ChildCareIcon color="action" sx={{ mr: 1 }} />}
              >
                {kids.map(kid => (
                  <MenuItem key={kid.id} value={kid.id}>
                    {`${kid.firstName} ${kid.lastName}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* קישור לאנשי צוות */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>אנשי צוות</InputLabel>
              <Select
                name="employeeIds"
                multiple
                value={newEvent.employeeIds || []}
                onChange={handleParticipantsChange}
                label="אנשי צוות"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const employee = employees.find(emp => emp.id === value);
                      return (
                        <Chip 
                          key={value} 
                          label={employee ? `${employee.firstName} ${employee.lastName}` : value}
                          size="small"
                          avatar={<Avatar><PersonIcon fontSize="small" /></Avatar>}
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    style: { maxHeight: 250 },
                  },
                }}
                startAdornment={<PersonIcon color="action" sx={{ mr: 1 }} />}
              >
                {employees.map(emp => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {`${emp.firstName} ${emp.lastName}`}
                    {emp.role && ` (${emp.role})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* שורה חמישית - תיאור */}
          <Grid item xs={12}>
            <TextField
              label="תיאור"
              name="description"
              value={newEvent.description || ''}
              onChange={handleEventChange}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <DescriptionIcon color="action" sx={{ mr: 1, mt: 1 }} />
                )
              }}
              placeholder="תיאור מפורט של האירוע (אופציונלי)"
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        {/* כפתור מחיקה - מוצג רק באירוע קיים */}
        <Box>
          {selectedEvent && (
            <Button 
              onClick={handleDeleteEvent} 
              color="error" 
              variant="outlined"
              startIcon={<DeleteIcon />}
              sx={{ 
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.08)'
                }
              }}
            >
              מחק אירוע
            </Button>
          )}
        </Box>
        
        {/* מידע על יוצר האירוע */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="יוצר האירוע" arrow>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, color: 'text.secondary', fontSize: '0.85rem' }}>
              <AccountCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="caption">{getCreatorName()}</Typography>
            </Box>
          </Tooltip>
        </Box>
        
        <Box>
          <Button 
            onClick={() => setOpenDialog(false)} 
            color="inherit"
            startIcon={<CancelIcon />}
            sx={{ 
              mr: 1, 
              borderRadius: '8px' 
            }}
          >
            ביטול
          </Button>
          
          <Button 
            onClick={handleSaveEvent} 
            color="primary" 
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ 
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
              }
            }}
          >
            {selectedEvent ? 'עדכן' : 'שמור'} אירוע
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EventDialog;