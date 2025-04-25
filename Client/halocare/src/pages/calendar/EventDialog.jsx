import  { useState } from 'react';
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
  Tooltip,
  FormHelperText
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

// שימוש בקונטקסט
import { useCalendar } from './CalendarContext';
import { useSelector } from 'react-redux';

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
    // eventTypes,
    // kids,
    // employees,
  } = useCalendar();
  
  const { eventTypes } = useSelector(state => state.eventTypes);
  const { kids  } = useSelector(state => state.kids);
  const { employees  } = useSelector(state => state.employees);
  
  // מצב לשמירת שגיאות ולידציה
  const [validationErrors, setValidationErrors] = useState({
    title: false,
    eventTypeId: false,
    start: false,
    end: false
  });

  // פונקציה לטיפול בשינויים במשתתפים
  const handleParticipantsChange = (event) => {
    const { name, value } = event.target;
    // אם זה מערכים - יש לוודא שזה יישאר מערך גם כשבוחרים ערך יחיד
    if (name === 'kidIds' || name === 'employeeIds') {
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
    if (
      selectedEvent &&
      selectedEvent.extendedProps &&
      selectedEvent.extendedProps.createdBy
    ) {
      const creatorId = selectedEvent.extendedProps.createdBy;
      const creatorEmployee = employees.find(
        (emp) => emp.employeeId === creatorId
      );
      if (creatorEmployee) 
        return `${creatorEmployee.firstName} ${creatorEmployee.lastName}`;
      return `משתמש #${creatorId}`;
    }

    // אם זה אירוע חדש
    if (newEvent && newEvent.createdBy) {
      const user = JSON.parse(localStorage.getItem('user'));
      return `${user.firstName} ${user.lastName}`;

    }
  }
  
  // פונקציית בדיקת תקינות הטופס לפני שמירה
  const validateForm = () => {
    const errors = {
      title: !newEvent.title,
      eventTypeId: !newEvent.eventTypeId,
      start: !newEvent.start,
      end: !newEvent.end || new Date(newEvent.end) <= new Date(newEvent.start)
    };
    
    setValidationErrors(errors);
    
    // הטופס תקין אם אין שגיאות
    return !Object.values(errors).some(hasError => hasError);
  };
  
  // טיפול משופר בשמירת האירוע
  const handleSaveEventWithValidation = () => {
    if (validateForm()) {
      handleSaveEvent();
    }
  };
  
  // קבלת צבע עבור סוג האירוע הנוכחי
  const getCurrentEventColor = () => {
    if (!newEvent.eventTypeId) return '#1976d2';
    
    const selectedType = eventTypes.find(type => type.eventTypeId === parseInt(newEvent.eventTypeId));
    return selectedType ? selectedType.color : '#1976d2';
  };
  
  // current color
  const currentEventColor = getCurrentEventColor();
  
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
          overflow: 'hidden',
          zIndex: 1300
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
          <Grid item xs={12} sm={7} >
            <TextField sx={{ marginTop: 2 }}
              label="כותרת האירוע"
              name="title"
              value={newEvent.title || ''}
              onChange={handleEventChange}
              fullWidth
              required 
              variant="outlined"
              error={validationErrors.title}
              helperText={validationErrors.title ? "נדרשת כותרת לאירוע" : ""}
              InputProps={{
                startAdornment: <TitleIcon color="action" sx={{ mr: 1 }} />
              }}
              placeholder="הכנס כותרת לאירוע"
            />
          </Grid>
          
          <Grid item xs={12} sm={5}>
            <FormControl sx={{ marginTop: 2 }} fullWidth required variant="outlined" error={validationErrors.eventTypeId}>
              <InputLabel >סוג אירוע</InputLabel>
              <Select
                name="eventTypeId"
                value={newEvent.eventTypeId || ''}
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
                    key={type.eventTypeId} 
                    value={type.eventTypeId}
                    sx={{ 
                      borderRight: `4px solid ${type.color || '#1976d2'}`
                    }}
                  >
                    {type.eventType}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.eventTypeId && (
                <FormHelperText>יש לבחור סוג אירוע</FormHelperText>
              )}
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
              error={validationErrors.start}
              helperText={validationErrors.start ? "יש להזין תאריך ושעת התחלה" : ""}
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
              error={validationErrors.end}
              helperText={validationErrors.end ? "שעת הסיום חייבת להיות מאוחרת משעת ההתחלה" : ""}
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
                      const employee = employees.find(emp => emp.employeeId === value);
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
                  <MenuItem key={emp.employeeId} value={emp.employeeId}>
                    {`${emp.firstName} ${emp.lastName}`}
                    {/* {emp.role && ` (${emp.role})`} */}
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
            onClick={handleSaveEventWithValidation} 
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