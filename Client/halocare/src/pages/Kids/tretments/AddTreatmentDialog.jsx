import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  Avatar,
  styled,
  alpha,
  Fade,
  Zoom,
  Stack
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  Highlight as HighlightIcon,
  Add as AddIcon,
  MedicalServices as MedicalIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { useTreatmentContext } from './TreatmentContext';
import { useAuth } from '../../../components/login/AuthContext';
import Swal from 'sweetalert2';

// Enhanced Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '24px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha('#ffffff', 0.2)}`,
    boxShadow: '0 25px 80px rgba(76, 181, 195, 0.15)',
    overflow: 'visible',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '6px',
      background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 8s ease infinite',
      borderRadius: '24px 24px 0 0',
    },
    '@keyframes gradientShift': {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    }
  }
}));

const ModernDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
  backgroundSize: '400% 400%',
  animation: 'gradientShift 15s ease infinite',
  color: 'white',
  padding: theme.spacing(3),
  borderRadius: '24px 24px 0 0',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  }
}));

const FormSection = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha('#4cb5c3', 0.1)}`,
  borderRadius: '16px',
  padding: theme.spacing(3),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 35px rgba(76, 181, 195, 0.15)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981)',
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: alpha('#4cb5c3', 0.3),
    },
    '&:hover fieldset': {
      borderColor: '#4cb5c3',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#4cb5c3',
      borderWidth: 2,
      boxShadow: '0 0 0 3px rgba(76, 181, 195, 0.1)',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#4cb5c3',
  }
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: alpha('#4cb5c3', 0.3),
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#4cb5c3',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#4cb5c3',
    borderWidth: 2,
    boxShadow: '0 0 0 3px rgba(76, 181, 195, 0.1)',
  }
}));

const AnimatedAvatar = styled(Avatar)(({ theme }) => ({
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 6px 20px rgba(76, 181, 195, 0.3)',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: '0 10px 30px rgba(76, 181, 195, 0.4)',
  }
}));

const ActionButton = styled(Button)(({ variant, theme }) => {
  const colors = {
    contained: {
      bg: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
      hover: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
      shadow: 'rgba(76, 181, 195, 0.4)'
    },
    outlined: {
      bg: 'transparent',
      hover: alpha('#4cb5c3', 0.1),
      shadow: 'rgba(76, 181, 195, 0.2)'
    }
  };
  
  const colorScheme = variant === 'contained' ? colors.contained : colors.outlined;
  
  return {
    borderRadius: '12px',
    padding: '12px 24px',
    fontWeight: 600,
    fontSize: '1rem',
    position: 'relative',
    overflow: 'hidden',
    background: colorScheme.bg,
    boxShadow: `0 6px 20px ${colorScheme.shadow}`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: colorScheme.hover,
      transform: 'translateY(-2px)',
      boxShadow: `0 10px 30px ${colorScheme.shadow}`,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
      transition: 'all 0.5s ease',
    },
    '&:hover::after': {
      left: '100%',
    }
  };
});

const AddTreatmentDialog = ({ kidId, treatmentType = null }) => {
  const { 
    isAddDialogOpen, 
    closeAddDialog, 
    addTreatment, 
    loading, 
    error,
    getTreatmentName,
  } = useTreatmentContext();
  
  const { currentUser } = useAuth();
  const { employees } = useSelector(state => state.employees);
  const { selectedKid } = useSelector(state => state.kids);
  
  // For validations
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
  
  // Reset the form when the dialog opens
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

  // Handle field changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setFormData(prev => ({
      ...prev,
      treatmentDate: newDate
    }));
    
    if (formErrors.treatmentDate) {
      setFormErrors(prev => ({
        ...prev,
        treatmentDate: ''
      }));
    }
  };

  // Handle cooperation level change
  const handleCooperationChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      cooperationLevel: newValue
    }));
  };

  // Validation function
  const validate = () => {
    const errors = {};
    
    if (!formData.employeeId) {
      errors.employeeId = 'יש לבחור מטפל';
    }
    
    if (!formData.treatmentDate) {
      errors.treatmentDate = 'יש לבחור תאריך טיפול';
    }
    
    if (!formData.description?.trim()) {
      errors.description = 'יש להזין תיאור טיפול';
    }
    
    if (formData.cooperationLevel < 1 || formData.cooperationLevel > 5) {
      errors.cooperationLevel = 'רמת שיתוף פעולה חייבת להיות בין 1 ל-5';
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const errors = validate();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      // Mark all fields as touched to show errors
      const touchedFields = {};
      Object.keys(errors).forEach(key => {
        touchedFields[key] = true;
      });
      setTouched(touchedFields);
      return;
    }

    try {
      await addTreatment(formData);
      
      Swal.fire({
        title: 'נוסף בהצלחה!',
        text: 'סיכום הטיפול נוסף למערכת',
        icon: 'success',
        confirmButtonColor: '#4cb5c3',
        customClass: {
          container: 'swal-rtl'
        }
      });
    } catch (err) {
      Swal.fire({
        title: 'שגיאה!',
        text: err.message || 'שגיאה בשמירת הטיפול',
        icon: 'error',
        confirmButtonColor: '#f44336',
        customClass: {
          container: 'swal-rtl'
        }
      });
    }
  };

  return (
    <StyledDialog
      open={isAddDialogOpen}
      onClose={closeAddDialog}
      maxWidth="md"
      fullWidth
      dir="rtl"
    >
      <ModernDialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AnimatedAvatar sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              width: 48, 
              height: 48,
              backdropFilter: 'blur(10px)'
            }}>
              <AddIcon />
            </AnimatedAvatar>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                הוספת סיכום טיפול חדש
              </Typography>
              {selectedKid && (
                <Typography variant="body1" sx={{ opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
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
              backdropFilter: 'blur(10px)',
              '&:hover': { 
                bgcolor: 'rgba(255,255,255,0.2)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </ModernDialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 4, background: 'linear-gradient(135deg, #f8fafb 0%, #ffffff 100%)' }}>
          {error && (
            <Fade in>
              <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                {error}
              </Alert>
            </Fade>
          )}
          
          <Grid container spacing={3}>
            {/* Therapist Selection */}
            <Grid item xs={12} md={6}>
              <Zoom in timeout={300}>
                <FormSection>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <AnimatedAvatar sx={{ bgcolor: '#4cb5c3', width: 40, height: 40 }}>
                      <PersonIcon />
                    </AnimatedAvatar>
                    <Typography variant="h6" fontWeight={700}>
                      מטפל
                    </Typography>
                  </Box>
                  <FormControl 
                    fullWidth 
                    required 
                    error={touched.employeeId && Boolean(formErrors.employeeId)}
                  >
                    <InputLabel id="employee-label" sx={{ '&.Mui-focused': { color: '#4cb5c3' } }}>
                      בחר מטפל
                    </InputLabel>
                    <StyledSelect
                      labelId="employee-label"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      label="בחר מטפל"
                    >
                      {employees?.map((employee) => (
                        <MenuItem key={employee.employeeId} value={employee.employeeId}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                              {employee.firstName?.charAt(0)}
                            </Avatar>
                            {employee.firstName} {employee.lastName}
                          </Box>
                        </MenuItem>
                      ))}
                    </StyledSelect>
                    {touched.employeeId && formErrors.employeeId && (
                      <FormHelperText>{formErrors.employeeId}</FormHelperText>
                    )}
                  </FormControl>
                </FormSection>
              </Zoom>
            </Grid>

            {/* Date Selection */}
            <Grid item xs={12} md={6}>
              <Zoom in timeout={400}>
                <FormSection>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <AnimatedAvatar sx={{ bgcolor: '#ff7043', width: 40, height: 40 }}>
                      <CalendarIcon />
                    </AnimatedAvatar>
                    <Typography variant="h6" fontWeight={700}>
                      תאריך טיפול
                    </Typography>
                  </Box>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
                    <DatePicker
                      label="בחר תאריך"
                      value={formData.treatmentDate}
                      onChange={handleDateChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: touched.treatmentDate && Boolean(formErrors.treatmentDate),
                          helperText: touched.treatmentDate && formErrors.treatmentDate,
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              background: 'rgba(255, 255, 255, 0.8)',
                            }
                          }
                        }
                      }}
                    />
                  </LocalizationProvider>
                </FormSection>
              </Zoom>
            </Grid>

            {/* Cooperation Level */}
            <Grid item xs={12}>
              <Zoom in timeout={500}>
                <FormSection>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <AnimatedAvatar sx={{ bgcolor: '#10b981', width: 40, height: 40 }}>
                      <StarIcon />
                    </AnimatedAvatar>
                    <Typography variant="h6" fontWeight={700}>
                      רמת שיתוף פעולה
                    </Typography>
                  </Box>
                  <Stack direction="row" alignItems="center" spacing={3}>
                    <Rating
                      value={formData.cooperationLevel}
                      onChange={handleCooperationChange}
                      max={5}
                      size="large"
                      sx={{
                        '& .MuiRating-iconFilled': {
                          color: '#ffc107',
                          filter: 'drop-shadow(0 2px 4px rgba(255, 193, 7, 0.3))'
                        },
                        '& .MuiRating-iconHover': {
                          color: '#ffb300',
                        }
                      }}
                    />
                    <Chip 
                      label={`${formData.cooperationLevel}/5`}
                      color="primary"
                      sx={{ 
                        fontWeight: 700,
                        fontSize: '1rem',
                        backgroundColor: '#4cb5c3'
                      }}
                    />
                  </Stack>
                  {touched.cooperationLevel && formErrors.cooperationLevel && (
                    <FormHelperText error sx={{ mt: 1 }}>
                      {formErrors.cooperationLevel}
                    </FormHelperText>
                  )}
                </FormSection>
              </Zoom>
            </Grid>

            {/* Treatment Description */}
            <Grid item xs={12}>
              <Zoom in timeout={600}>
                <FormSection>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <AnimatedAvatar sx={{ bgcolor: '#9c27b0', width: 40, height: 40 }}>
                      <DescriptionIcon />
                    </AnimatedAvatar>
                    <Typography variant="h6" fontWeight={700}>
                      תיאור הטיפול
                    </Typography>
                  </Box>
                  <StyledTextField
                    fullWidth
                    multiline
                    rows={6}
                    name="description"
                    label="פרט על הטיפול שניתן..."
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    error={touched.description && Boolean(formErrors.description)}
                    helperText={touched.description && formErrors.description}
                  />
                </FormSection>
              </Zoom>
            </Grid>

            {/* Highlight (Optional) */}
            <Grid item xs={12}>
              <Zoom in timeout={700}>
                <FormSection>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <AnimatedAvatar sx={{ bgcolor: '#f57c00', width: 40, height: 40 }}>
                      <HighlightIcon />
                    </AnimatedAvatar>
                    <Typography variant="h6" fontWeight={700}>
                      הדגשה (אופציונלי)
                    </Typography>
                  </Box>
                  <StyledTextField
                    fullWidth
                    multiline
                    rows={3}
                    name="highlight"
                    label="הדגשות חשובות או הערות מיוחדות..."
                    value={formData.highlight}
                    onChange={handleInputChange}
                  />
                </FormSection>
              </Zoom>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ 
          justifyContent: 'space-between', 
          p: 3,
          background: 'linear-gradient(135deg, #f8fafb 0%, #ffffff 100%)'
        }}>
          <ActionButton
            variant="outlined"
            onClick={closeAddDialog}
            disabled={loading}
          >
            ביטול
          </ActionButton>
          
          <ActionButton
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {loading ? 'שומר...' : 'שמור טיפול'}
          </ActionButton>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};

export default AddTreatmentDialog;