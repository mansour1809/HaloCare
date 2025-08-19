import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  Divider,
  Rating,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  styled,
  Stack,
  Grid
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  DeleteOutline as DeleteIcon,
  Person as PersonIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { useTreatmentContext } from './TreatmentContext';
import Swal from 'sweetalert2';
import HebrewReactDatePicker from '../../../components/common/HebrewReactDatePicker';
import { generateTreatmentPDF } from '../../../utils/pdfGenerator';

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

const InfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  backgroundColor: theme.palette.grey[50],
  border: '1px solid',
  borderColor: theme.palette.grey[200],
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: '10px 24px',
  fontWeight: 600,
  textTransform: 'none',
}));

const TreatmentViewDialog = () => {
  const { 
    isViewDialogOpen, 
    closeViewDialog, 
    currentTreatment, 
    updateTreatment,
    deleteTreatment,
    loading, 
    error,
    getTreatmentName,
    getEmployeeName,
    formatDate,
    kids
  } = useTreatmentContext();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');

  // Update form data when opening the dialog 
  useEffect(() => {
    if (currentTreatment && isViewDialogOpen) {
      setFormData({
        ...currentTreatment,
        cooperationLevel: currentTreatment.cooperationLevel || 0,
        treatmentDate: currentTreatment.treatmentDate ? new Date(currentTreatment.treatmentDate) : new Date()
      });
      setFormError('');
      setEditMode(false);
    }
  }, [currentTreatment, isViewDialogOpen]);

  // Handle input changes 
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setFormError('');
  };

  // Handle date change 
  const handleDateChange = (newDate) => {
    setFormData(prev => ({
      ...prev,
      treatmentDate: newDate
    }));
    setFormError('');
  };

  // Handle cooperation level change 
  const handleCooperationChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      cooperationLevel: newValue
    }));
    setFormError('');
  };

  // Handle form submission 
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!formData.description?.trim()) {
      setFormError('נא הזן תיאור טיפול');
      return;
    }

    try {
      await updateTreatment(formData);
      setEditMode(false);
      Swal.fire({
        title: 'עודכן בהצלחה',
        text: 'פרטי הטיפול עודכנו במערכת',
        icon: 'success',
        confirmButtonColor: '#4cb5c3'
      });
    } catch (err) {
      setFormError(err.message || 'שגיאה בעדכון הטיפול');
    }
  };

  // Handle treatment deletion 
  const handleDelete = async () => {
    
    try {
      const result = await Swal.fire({
        title: 'האם אתה בטוח?',
        text: 'פעולה זו אינה הפיכה.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f44336',
        cancelButtonColor: '#9e9e9e',
        confirmButtonText: 'כן, מחק',
        cancelButtonText: 'ביטול',
        customClass: {
          container: 'swal-rtl'
        }
      });

      if (result.isConfirmed) {
        await deleteTreatment(
          currentTreatment.treatmentId, 
          currentTreatment.kidId, 
          currentTreatment.treatmentTypeId
        );
        
        Swal.fire({
          title: 'נמחק בהצלחה',
          text: 'סיכום הטיפול נמחק מהמערכת',
          icon: 'success',
          confirmButtonColor: '#4cb5c3'
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'שגיאה',
        text: err.message || 'שגיאה במחיקת הטיפול',
        icon: 'error',
        confirmButtonColor: '#f44336'
      });
    }
  };

  // Export to PDF 
  const handleDownloadPDF = async () => {
    try {
      await generateTreatmentPDF({
        treatment: currentTreatment,
        child: kids.find(kid => kid.id === currentTreatment.kidId),
        employeeName: getEmployeeName(currentTreatment.employeeId),
        treatmentTypeName: getTreatmentName(currentTreatment.treatmentTypeId)
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (!currentTreatment) {
    return null;
  }

  return (
    <StyledDialog
      open={isViewDialogOpen}
      onClose={closeViewDialog}
      maxWidth="md"
      fullWidth
      dir="rtl"
    >
      <StyledDialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {editMode ? <EditIcon /> : <VisibilityIcon />}
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {editMode ? 'עריכת סיכום טיפול' : 'צפייה בסיכום טיפול'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {getTreatmentName(currentTreatment.treatmentTypeId)} • {formatDate(currentTreatment.treatmentDate)}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!editMode && (
              <>
                <IconButton 
                  color="inherit" 
                  onClick={() => setEditMode(true)} 
                  disabled={loading}
                >
                  <EditIcon />
                </IconButton>
            
                <IconButton 
                  color="inherit" 
                  onClick={handleDownloadPDF} 
                  disabled={loading}
                >
                  <DownloadIcon />
                </IconButton>
              </>
            )}
            <IconButton 
              color="inherit" 
              onClick={closeViewDialog}
              disabled={loading}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </StyledDialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {(formError || error) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError || error}
          </Alert>
        )}

        {editMode ? (
          // Edit Mode
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3} sx={{ mt: 2 }}>
                {/* Date and Cooperation */}
                
                <Stack  spacing={2}>
                  <HebrewReactDatePicker
                  dirr="bottom"
                    maxDate={new Date()}
                    label="תאריך טיפול"
                    value={formData.treatmentDate}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      }
                    }}
                  />

                  <Box sx={{ minWidth: { md: '50%' } }}>
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
                  </Box>
                </Stack>

                {/* Description */}
                <StyledTextField
                  fullWidth
                  multiline
                  rows={5}
                  name="description"
                  label="תיאור הטיפול"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  required
                />

                {/* Highlight */}
                <StyledTextField
                  fullWidth
                  multiline
                  rows={2}
                  name="highlight"
                  label="הדגשה (אופציונלי)"
                  value={formData.highlight || ''}
                  onChange={handleInputChange}
                />
              </Stack>
            </form>
          </LocalizationProvider>
        ) : (
          // View Mode
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Basic Details */}
            <Grid container spacing={2} sx={{mt:2}}>
              <Grid item size={{xs:12,md:6}}>
                <InfoCard>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <CalendarIcon sx={{ color: '#4cb5c3' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        תאריך טיפול
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formatDate(currentTreatment.treatmentDate)}
                      </Typography>
                    </Box>
                  </Stack>
                </InfoCard>
              </Grid>

              <Grid item size={{ xs: 12, md: 6 }}>
                <InfoCard>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <PersonIcon sx={{ color: '#ff7043' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        מטפל
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {getEmployeeName(currentTreatment.employeeId)}
                      </Typography>
                    </Box>
                  </Stack>
                </InfoCard>
              </Grid>
              
              <Grid item size={{xs:12}}>
                <InfoCard>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <StarIcon sx={{ color: '#10b981' }} />
                    <Box >
                      <Typography variant="caption" color="text.secondary">
                        רמת שיתוף פעולה
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                        <Rating
                          value={currentTreatment.cooperationLevel || 0}
                          readOnly
                          size="small"
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {currentTreatment.cooperationLevel}/5
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </InfoCard>
              </Grid>
            </Grid>

            <Divider />

            {/* Treatment Description */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                תיאור הטיפול
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {currentTreatment.description}
                </Typography>
              </Paper>
            </Box>

            {/* Highlight */}
            {currentTreatment.highlight && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    הדגשה
                  </Typography>
                  <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {currentTreatment.highlight}
                    </Typography>
                  </Alert>
                </Box>
              </>
            )}
          </Stack>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        {editMode ? (
          <>
            <ActionButton
              variant="outlined"
              onClick={() => {
                setEditMode(false);
                setFormData(currentTreatment);
                setFormError('');
              }}
              disabled={loading}
              color="inherit"
            >
              ביטול
            </ActionButton>
            
            <ActionButton
              variant="contained"
              onClick={handleSubmit}
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
              {loading ? 'שומר...' : 'שמור שינויים'}
            </ActionButton>
          </>
        ) : (
          <>
            <ActionButton
              variant="outlined"
              color="error"
              onClick={()=>{
                closeViewDialog();
                handleDelete();
              }}
              disabled={loading}
              startIcon={<DeleteIcon />}
            >
              מחק טיפול
            </ActionButton>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <ActionButton
                variant="outlined"
                onClick={closeViewDialog}
                disabled={loading}
                color="inherit"
              >
                סגור
              </ActionButton>
              
              <ActionButton
                variant="contained"
                onClick={() => setEditMode(true)}
                disabled={loading}
                startIcon={<EditIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
                  }
                }}
              >
                ערוך
              </ActionButton>
            </Box>
          </>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default TreatmentViewDialog;