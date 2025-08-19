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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Rating,
  Alert,
  CircularProgress,
  FormHelperText,
  Chip,
  Avatar,
  styled,
  alpha,
  Fade,
  Stack,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Description as DescriptionIcon,
  Highlight as HighlightIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { useTreatmentContext } from './TreatmentContext';
import { useAuth } from '../../../components/login/AuthContext';
import Swal from 'sweetalert2';
import HebrewReactDatePicker from '../../../components/common/HebrewReactDatePicker';
import { baseURL } from '../../../components/common/axiosConfig';

// Simple and clean styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
  color: 'white',
  padding: theme.spacing(2.5),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&:hover fieldset': {
      borderColor: '#4cb5c3',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#4cb5c3',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#4cb5c3',
  }
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: 8,
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#4cb5c3',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#4cb5c3',
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: '10px 24px',
  fontWeight: 600,
  textTransform: 'none',
}));

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
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
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
      <StyledDialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AddIcon />
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
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </StyledDialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Stack spacing={3}>
            {/* Row 1: Employee and Date */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl 
                fullWidth 
                required 
                error={touched.employeeId && Boolean(formErrors.employeeId)}
              >
                <InputLabel id="employee-label">מטפל</InputLabel>
                <StyledSelect
                MenuProps={{
    disablePortal: true,
    PaperProps: {
      sx: {
        maxHeight: 300
      }
    }
  }}
                  labelId="employee-label"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  label="מטפל"
                >
                  {employees?.map((employee) => (
                    <MenuItem key={employee.employeeId} value={employee.employeeId} dir="rtl">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: '#4cb5c3' }}
                            src={
                                    employee.photo
                                      ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(employee.photo)}`
                                      : ''
                                  }  
                                  alt={`${employee.firstName} ${employee.lastName}`}
                                  >
                          {!employee.photo && employee.firstName?.charAt(0)}
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

              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
                <HebrewReactDatePicker
                  maxDate={new Date()}
                  label="תאריך טיפול"
                  value={formData.treatmentDate}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: touched.treatmentDate && Boolean(formErrors.treatmentDate),
                      helperText: touched.treatmentDate && formErrors.treatmentDate,
                    }
                  }}
                />
              </LocalizationProvider>
            </Stack>

            {/* Row 2: Cooperation Level */}
            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                רמת שיתוף פעולה
              </Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Rating
                  value={formData.cooperationLevel}
                  onChange={handleCooperationChange}
                  max={5}
                  size="large"
                />
                <Chip 
                  label={`${formData.cooperationLevel}/5`}
                  color="primary"
                  size="small"
                />
              </Stack>
              {touched.cooperationLevel && formErrors.cooperationLevel && (
                <FormHelperText error>
                  {formErrors.cooperationLevel}
                </FormHelperText>
              )}
            </Box>

            {/* Row 3: Description */}
            <StyledTextField
              fullWidth
              multiline
              rows={5}
              name="description"
              label="תיאור הטיפול"
              value={formData.description}
              onChange={handleInputChange}
              required
              error={touched.description && Boolean(formErrors.description)}
              helperText={touched.description && formErrors.description}
              placeholder="פרט על הטיפול שניתן..."
            />

            {/* Row 4: Highlight (Optional) */}
            <StyledTextField
              fullWidth
              multiline
              rows={2}
              name="highlight"
              label="הדגשות (אופציונלי)"
              value={formData.highlight}
              onChange={handleInputChange}
              placeholder="הערות חשובות או המלצות..."
            />
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <ActionButton
            variant="outlined"
            onClick={closeAddDialog}
            disabled={loading}
            color="inherit"
          >
            ביטול
          </ActionButton>
          
          <ActionButton
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{
              background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
              }
            }}
          >
            {loading ? 'שומר...' : 'שמור טיפול'}
          </ActionButton>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};

export default AddTreatmentDialog;