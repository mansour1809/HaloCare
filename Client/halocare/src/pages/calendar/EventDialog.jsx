import React, { useState } from 'react';
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
  FormHelperText,
  Stack,
  Card,
  CardContent,
  Slide,
  Zoom,
  alpha,
  useTheme
} from '@mui/material';
import { 
  Close as CloseIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocationOn as LocationOnIcon,
  Description as DescriptionIcon,
  Title as TitleIcon,
  AccessTime as AccessTimeIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  ChildCare as ChildCareIcon,
  AccountCircle as AccountCircleIcon,
  Event as EventIcon,
  AutoAwesome as AutoAwesomeIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// שימוש בקונטקסט
import { useCalendar } from './CalendarContext';
import { useSelector } from 'react-redux';

// אנימציית כניסה מותאמת
const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// דיאלוג מעוצב עם אפקטים
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 24,
    boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
    backdropFilter: 'blur(20px)',
    background: 'rgba(255, 255, 255, 0.98)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    overflow: 'visible',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '6px',
      background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb, #667eea)',
      borderRadius: '24px 24px 0 0',
    }
  }
}));

// כותרת דיאלוג מעוצבת
const StyledDialogTitle = styled(DialogTitle)(({ eventColor }) => ({
  background: `linear-gradient(135deg, ${eventColor} 0%, ${alpha(eventColor, 0.8)} 100%)`,
  color: '#ffffff',
  padding: '24px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    animation: 'shimmer 3s infinite',
  },
  '@keyframes shimmer': {
    '0%': { left: '-100%' },
    '100%': { left: '100%' },
  }
}));

// TextField מעוצב
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 16,
    transition: 'all 0.3s ease',
    background: 'rgba(255, 255, 255, 0.8)',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)',
    },
    '&.Mui-focused': {
      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.25)',
      transform: 'translateY(-3px)',
    }
  }
}));

// FormControl מעוצב
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 16,
    transition: 'all 0.3s ease',
    background: 'rgba(255, 255, 255, 0.8)',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)',
    },
    '&.Mui-focused': {
      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.25)',
      transform: 'translateY(-3px)',
    }
  }
}));

// כפתור מעוצב עם זוהר
const GlowButton = styled(Button)(({ theme, glowColor = '#667eea' }) => ({
  borderRadius: 16,
  fontWeight: 600,
  padding: '12px 24px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(glowColor, 0.4)}, transparent)`,
    transition: 'left 0.5s',
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 8px 25px ${alpha(glowColor, 0.4)}`,
  },
  '&:hover::before': {
    left: '100%',
  }
}));

// Chip מעוצב לפרטיטנטים
const ParticipantChip = styled(Chip)(({ theme }) => ({
  borderRadius: 12,
  fontWeight: 600,
  margin: '2px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  }
}));

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
  } = useCalendar();
  
  const { eventTypes } = useSelector(state => state.eventTypes);
  const { kids } = useSelector(state => state.kids);
  const { employees } = useSelector(state => state.employees);
  
  const theme = useTheme();
  
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
    if (name === 'kidIds' || name === 'employeeIds') {
      const updatedValue = Array.isArray(value) ? value : [value];
      handleEventChange({
        target: {
          name,
          value: updatedValue
        }
      });
    } else {
      handleEventChange(event);
    }
  };

  // מציאת היוצר המקורי של האירוע
  const getCreatorName = () => {
    if (selectedEvent?.extendedProps?.createdBy) {
      const creatorId = selectedEvent.extendedProps.createdBy;
      const creatorEmployee = employees.find(emp => emp.employeeId === creatorId);
      if (creatorEmployee) 
        return `${creatorEmployee.firstName} ${creatorEmployee.lastName}`;
      return `משתמש #${creatorId}`;
    }

    if (newEvent?.createdBy) {
      const user = JSON.parse(localStorage.getItem('user'));
      return `${user.firstName} ${user.lastName}`;
    }
    return 'לא ידוע';
  }
  
  // פונקציית בדיקת תקינות הטופס
  const validateForm = () => {
    const errors = {
      title: !newEvent.title,
      eventTypeId: !newEvent.eventTypeId,
      start: !newEvent.start,
      end: !newEvent.end || new Date(newEvent.end) <= new Date(newEvent.start)
    };
    
    setValidationErrors(errors);
    return !Object.values(errors).some(hasError => hasError);
  };
  
  // טיפול בשמירת האירוע עם ולידציה
  const handleSaveEventWithValidation = () => {
    if (validateForm()) {
      handleSaveEvent();
    }
  };
  
  // קבלת צבע עבור סוג האירוע הנוכחי
  const getCurrentEventColor = () => {
    if (!newEvent.eventTypeId) return '#667eea';
    const selectedType = eventTypes.find(type => type.eventTypeId === parseInt(newEvent.eventTypeId));
    return selectedType ? selectedType.color : '#667eea';
  };
  
  const currentEventColor = getCurrentEventColor();
  
  return (
    <StyledDialog 
      open={openDialog} 
      onClose={() => setOpenDialog(false)} 
      maxWidth="md" 
      fullWidth
      dir="rtl"
      TransitionComponent={SlideTransition}
      TransitionProps={{ timeout: 600 }}
    >
      {/* כותרת הדיאלוג */}
      <StyledDialogTitle eventColor={currentEventColor}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ 
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
            }}>
              {selectedEvent ? <EventIcon /> : <CelebrationIcon />}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                {selectedEvent ? 'עריכת אירוע' : 'יצירת אירוע חדש'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {selectedEvent ? 'עדכן את פרטי האירוע' : 'הוסף אירוע חדש לטווח'}
              </Typography>
            </Box>
          </Stack>
          
          <Tooltip title="סגור" arrow>
            <IconButton 
              onClick={() => setOpenDialog(false)}
              sx={{ 
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                '&:hover': { 
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1) rotate(90deg)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </StyledDialogTitle>
      
      <DialogContent sx={{ p: 4, mt: 2 }}>
        <Grid container spacing={3}>
          {/* שורה ראשונה - כותרת וסוג אירוע */}
          <Grid item xs={12} md={7}>
            <StyledTextField
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
                startAdornment: (
                  <TitleIcon sx={{ color: 'primary.main', mr: 1 }} />
                )
              }}
              placeholder="הכנס כותרת מעניינת לאירוע"
            />
          </Grid>
          
          <Grid item xs={12} md={5}>
            <StyledFormControl fullWidth required variant="outlined" error={validationErrors.eventTypeId}>
              <InputLabel>סוג אירוע</InputLabel>
              <Select
                name="eventTypeId"
                value={newEvent.eventTypeId || ''}
                onChange={handleEventChange}
                label="סוג אירוע"
                startAdornment={<CategoryIcon sx={{ color: 'secondary.main', mr: 1 }} />}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      mt: 1,
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {eventTypes.map(type => (
                  <MenuItem 
                    key={type.eventTypeId} 
                    value={type.eventTypeId}
                    sx={{ 
                      borderRight: `6px solid ${type.color || '#1976d2'}`,
                      borderRadius: '8px !important',
                      margin: '4px 8px',
                      '&:hover': {
                        background: `${alpha(type.color || '#1976d2', 0.1)} !important`,
                        transform: 'translateX(-4px)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: type.color || '#1976d2',
                          boxShadow: `0 2px 8px ${alpha(type.color || '#1976d2', 0.4)}`,
                        }}
                      />
                      <Typography fontWeight={500}>{type.eventType}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.eventTypeId && (
                <FormHelperText>יש לבחור סוג אירוע</FormHelperText>
              )}
            </StyledFormControl>
          </Grid>
          
          {/* שורה שנייה - תאריך ושעה */}
          <Grid item xs={12} md={6}>
            <StyledTextField
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
                startAdornment: <AccessTimeIcon sx={{ color: 'success.main', mr: 1 }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <StyledTextField
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
                startAdornment: <AccessTimeIcon sx={{ color: 'warning.main', mr: 1 }} />
              }}
            />
          </Grid>
          
          {/* שורה שלישית - מיקום */}
          <Grid item xs={12}>
            <StyledTextField
              label="מיקום האירוע"
              name="location"
              value={newEvent.location || ''}
              onChange={handleEventChange}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: <LocationOnIcon sx={{ color: 'info.main', mr: 1 }} />
              }}
              placeholder="היכן יתקיים האירוע?"
            />
          </Grid>
          
          {/* שורה רביעית - משתתפים */}
          <Grid item xs={12} md={6}>
            <StyledFormControl fullWidth variant="outlined">
              <InputLabel>ילדים משתתפים</InputLabel>              
              <Select
                name="kidIds"
                multiple
                value={newEvent.kidIds || []}
                onChange={handleParticipantsChange}
                label="ילדים משתתפים"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const kid = kids.find(k => k.id === value);
                      return (
                        <ParticipantChip 
                          key={value} 
                          label={kid ? `${kid.firstName} ${kid.lastName}` : value}
                          size="small"
                          avatar={
                            <Avatar sx={{ 
                              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                              width: 20,
                              height: 20
                            }}>
                              <ChildCareIcon sx={{ fontSize: 12 }} />
                            </Avatar>
                          }
                          color="primary"
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    sx: { 
                      borderRadius: 3,
                      maxHeight: 250,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    },
                  },
                }}
                startAdornment={<ChildCareIcon sx={{ color: 'primary.main', mr: 1 }} />}
              >
                {kids.map(kid => (
                  <MenuItem key={kid.id} value={kid.id}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        👶
                      </Avatar>
                      <Typography>{`${kid.firstName} ${kid.lastName}`}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>
          </Grid>
          
          {/* אנשי צוות */}
          <Grid item xs={12} md={6}>
            <StyledFormControl fullWidth variant="outlined">
              <InputLabel>צוות משתתף</InputLabel>
              <Select
                name="employeeIds"
                multiple
                value={newEvent.employeeIds || []}
                onChange={handleParticipantsChange}
                label="צוות משתתף"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const employee = employees.find(emp => emp.employeeId === value);
                      return (
                        <ParticipantChip 
                          key={value} 
                          label={employee ? `${employee.firstName} ${employee.lastName}` : value}
                          size="small"
                          avatar={
                            <Avatar sx={{ 
                              background: 'linear-gradient(45deg, #f093fb 30%, #fbbf24 90%)',
                              width: 20,
                              height: 20,
                              fontSize: '0.6rem'
                            }}>
                              {employee ? employee.firstName.charAt(0) : '?'}
                            </Avatar>
                          }
                          color="secondary"
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    sx: { 
                      borderRadius: 3,
                      maxHeight: 250,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    },
                  },
                }}
                startAdornment={<PersonIcon sx={{ color: 'secondary.main', mr: 1 }} />}
              >
                {employees.map(emp => (
                  <MenuItem key={emp.employeeId} value={emp.employeeId}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ 
                        width: 24, 
                        height: 24, 
                        fontSize: '0.6rem',
                        background: 'linear-gradient(45deg, #f093fb 30%, #fbbf24 90%)'
                      }}>
                        {emp.firstName.charAt(0)}
                      </Avatar>
                      <Typography>{`${emp.firstName} ${emp.lastName}`}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>
          </Grid>
          
          {/* שורה חמישית - תיאור */}
          <Grid item xs={12}>
            <StyledTextField
              label="תיאור מפורט"
              name="description"
              value={newEvent.description || ''}
              onChange={handleEventChange}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <DescriptionIcon sx={{ color: 'info.main', mr: 1, mt: 1 }} />
                )
              }}
              placeholder="פרטים נוספים על האירוע (אופציונלי)"
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 3, justifyContent: 'space-between', background: alpha('#f8f9fa', 0.5) }}>
        {/* כפתור מחיקה */}
        <Box>
          {selectedEvent && (
            <GlowButton 
              onClick={handleDeleteEvent} 
              variant="outlined"
              startIcon={<DeleteIcon />}
              glowColor="#ef4444"
              sx={{ 
                color: '#ef4444',
                borderColor: '#ef4444',
                '&:hover': {
                  background: 'linear-gradient(45deg, #ef4444 30%, #dc2626 90%)',
                  color: 'white',
                  borderColor: 'transparent',
                }
              }}
            >
              מחק אירוע
            </GlowButton>
          )}
        </Box>
        
        {/* מידע על יוצר האירוע */}
        <Card sx={{ background: alpha('#f8f9fa', 0.8), borderRadius: 2 }}>
          <CardContent sx={{ p: '8px 16px !important' }}>
            <Tooltip title="יוצר האירוע" arrow>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccountCircleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {getCreatorName()}
                </Typography>
              </Stack>
            </Tooltip>
          </CardContent>
        </Card>
        
        {/* כפתורי פעולה */}
        <Stack direction="row" spacing={2}>
          <GlowButton 
            onClick={() => setOpenDialog(false)} 
            variant="outlined"
            startIcon={<CancelIcon />}
            glowColor="#6b7280"
            sx={{ color: 'text.secondary', borderColor: 'text.secondary' }}
          >
            ביטול
          </GlowButton>
          
          <GlowButton 
            onClick={handleSaveEventWithValidation} 
            variant="contained"
            startIcon={selectedEvent ? <SaveIcon /> : <AutoAwesomeIcon />}
            glowColor={currentEventColor}
            sx={{ 
              background: `linear-gradient(45deg, ${currentEventColor} 30%, ${alpha(currentEventColor, 0.8)} 90%)`,
              minWidth: 140,
              fontWeight: 700
            }}
          >
            {selectedEvent ? 'עדכן אירוע' : 'צור אירוע'}
          </GlowButton>
        </Stack>
      </DialogActions>
    </StyledDialog>
  );
};

export default EventDialog;