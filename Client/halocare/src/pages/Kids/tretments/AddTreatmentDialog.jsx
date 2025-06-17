// src/components/treatments/AddTreatmentDialog.jsx - גרסה משופרת
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Divider,
  Rating,
  Alert,
  CircularProgress,
  FormHelperText,
  Paper,
  Chip,
  Stack,
  Avatar
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  Highlight as HighlightIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { useTreatmentContext } from './TreatmentContext';
import { useAuth } from '../../../components/login/AuthContext';
import Swal from 'sweetalert2';

const AddTreatmentDialog = ({ kidId, treatmentType = null }) => {
  const { 
    isAddDialogOpen, 
    closeAddDialog, 
    addTreatment, 
    loading, 
    error,
    getTreatmentName,
    getColorForTreatmentType 
  } = useTreatmentContext();
  
  const { currentUser } = useAuth();
  const { employees } = useSelector(state => state.employees);
  const { selectedKid } = useSelector(state => state.kids);
  
  // מצב עבור ולידציות
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const [formData, setFormData] = useState({
    treatmentId: 0,
    kidId: kidId,
    employeeId: currentUser?.employeeId || '',
    treatmentDate: new Date(),
    treatmentTypeId: treatmentType || '',
    description: '',
    cooperationLevel: 3,
    status: 'active',
    highlight: ''
  });
  
  // איפוס הטופס בפתיחת הדיאלוג
  useEffect(() => {
    if (isAddDialogOpen) {
      setFormData({
        treatmentId: 0,
        kidId: kidId,
        employeeId: currentUser?.employeeId || '',
        treatmentDate: new Date(),
        treatmentTypeId: treatmentType || '',
        description: '',
        cooperationLevel: 3,
        status: 'active',
        highlight: ''
      });
      setFormErrors({});
      setTouched({});
    }
  }, [isAddDialogOpen, kidId, treatmentType, currentUser]);

  // טיפול בשינוי שדות
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // ניקוי שגיאות
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      treatmentDate: date
    }));
  };

  const handleCooperationChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      cooperationLevel: newValue
    }));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  // ולידציות
  const validateForm = () => {
    const errors = {};
    
    if (!formData.employeeId) {
      errors.employeeId = 'נדרש לבחור מטפל';
    }
    
    if (!formData.treatmentDate) {
      errors.treatmentDate = 'נדרש לבחור תאריך טיפול';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'נדרש לכתב תיאור הטיפול';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'תיאור הטיפול חייב להכיל לפחות 10 תווים';
    }
    
    if (!formData.cooperationLevel || formData.cooperationLevel < 1 || formData.cooperationLevel > 5) {
      errors.cooperationLevel = 'נדרש לבחור רמת שיתוף פעולה';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // שליחת הטופס
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // הכנת הנתונים לשליחה
      const treatmentData = {
        ...formData,
        treatmentId: 0, // ניצור טיפול חדש
        treatmentDate: formData.treatmentDate.toISOString().split('T')[0]
      };

      // שליחת הטופס
      await addTreatment(kidId, treatmentData);
      
      // הצגת הצלחה
      Swal.fire({
        title: 'נשמר בהצלחה',
        text: 'סיכום הטיפול נשמר בהצלחה במערכת',
        icon: 'success',
        confirmButtonText: 'אישור',
        confirmButtonColor: '#4fc3f7',
        customClass: {
          container: 'swal-rtl'
        }
      });
      
    } catch (err) {
      // הצגת שגיאה
      Swal.fire({
        title: 'שגיאה',
        text: err.message || 'אירעה שגיאה בשמירת סיכום הטיפול',
        icon: 'error',
        confirmButtonText: 'הבנתי',
        confirmButtonColor: '#f44336',
        customClass: {
          container: 'swal-rtl'
        }
      });
    }
  };

  // קבלת שם העובד
  const getEmployeeName = (employeeId) => {
    if (!employees) return '';
    const employee = employees.find(emp => emp.employeeId == employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : '';
  };

  return (
    <Dialog
      open={isAddDialogOpen}
      onClose={closeAddDialog}
      maxWidth="md"
      fullWidth
      dir="rtl"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)',
        color: 'white',
        p: 3
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              <SaveIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                הוספת סיכום טיפול חדש
              </Typography>
              {selectedKid && (
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedKid.firstName} {selectedKid.lastName} • {getTreatmentName(treatmentType)}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={closeAddDialog} 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            {/* בחירת מטפל */}
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight="600">
                    מטפל
                  </Typography>
                </Box>
                <FormControl 
                  fullWidth 
                  required 
                  error={touched.employeeId && Boolean(formErrors.employeeId)}
                >
                  <InputLabel>בחר מטפל</InputLabel>
                  <Select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    label="בחר מטפל"
                    disabled={loading}
                  >
                    {employees && employees.map((employee) => (
                      <MenuItem key={employee.employeeId} value={employee.employeeId}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                            {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                          </Avatar>
                          {employee.firstName} {employee.lastName}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.employeeId && formErrors.employeeId && (
                    <FormHelperText>{formErrors.employeeId}</FormHelperText>
                  )}
                </FormControl>
              </Paper>
            </Grid>
            
            {/* תאריך טיפול */}
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <EventIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight="600">
                    תאריך טיפול
                  </Typography>
                </Box>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
                  <DatePicker
                    label="תאריך טיפול"
                    value={formData.treatmentDate}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth
                        required
                        error={touched.treatmentDate && Boolean(formErrors.treatmentDate)}
                        helperText={touched.treatmentDate && formErrors.treatmentDate}
                        disabled={loading}
                      />
                    )}
                    maxDate={new Date()}
                    minDate={new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)} // 6 חודשים אחורה
                  />
                </LocalizationProvider>
              </Paper>
            </Grid>
            
            {/* רמת שיתוף פעולה */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <StarIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight="600">
                    רמת שיתוף פעולה
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Rating
                    value={formData.cooperationLevel}
                    onChange={handleCooperationChange}
                    max={5}
                    size="large"
                    disabled={loading}
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: '#ffc107',
                      },
                      '& .MuiRating-iconEmpty': {
                        color: '#e0e0e0',
                      }
                    }}
                  />
                  <Chip 
                    label={`${formData.cooperationLevel}/5`}
                    color="primary"
                    size="small"
                  />
                </Box>
                {touched.cooperationLevel && formErrors.cooperationLevel && (
                  <FormHelperText error>{formErrors.cooperationLevel}</FormHelperText>
                )}
              </Paper>
            </Grid>
            
            {/* תיאור הטיפול */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <DescriptionIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight="600">
                    תיאור מהלך הטיפול
                  </Typography>
                </Box>
                <TextField
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  multiline
                  rows={4}
                  required
                  placeholder="תאר את מהלך הטיפול, התקדמות הילד, קשיים שהתגלו, דברים חיוביים..."
                  disabled={loading}
                  error={touched.description && Boolean(formErrors.description)}
                  helperText={touched.description && formErrors.description}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Paper>
            </Grid>
            
            {/* נקודות חשובות */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <HighlightIcon color="warning" />
                  <Typography variant="subtitle1" fontWeight="600">
                    נקודות חשובות / היילייט
                  </Typography>
                </Box>
                <TextField
                  name="highlight"
                  value={formData.highlight}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="הוסף נקודות חשובות שיש לשים לב אליהן בטיפול הבא..."
                  disabled={loading}
                  error={touched.highlight && Boolean(formErrors.highlight)}
                  helperText={touched.highlight && formErrors.highlight}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <Divider />
        
        <DialogActions sx={{ justifyContent: 'space-between', p: 3 }}>
          <Button
            variant="outlined"
            onClick={closeAddDialog}
            disabled={loading}
            sx={{ px: 3, borderRadius: 2 }}
          >
            ביטול
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{ 
              px: 4, 
              borderRadius: 2,
              background: 'linear-gradient(45deg, #4fc3f7, #29b6f6)',
              '&:hover': {
                background: 'linear-gradient(45deg, #29b6f6, #1976d2)',
              }
            }}
          >
            {loading ? 'שומר...' : 'שמור טיפול'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddTreatmentDialog;