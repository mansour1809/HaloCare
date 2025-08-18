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
  Grid,
  Box,
  Divider,
  Rating,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Avatar,
  Card,
  CardContent,
  Collapse,
  styled,
  alpha,
  Fade,
  Zoom,
  Stack
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  DeleteOutline as DeleteIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Description as DescriptionIcon,
  Highlight as HighlightIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarToday as CalendarIcon,
  MedicalServices as MedicalIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { useTreatmentContext } from './TreatmentContext';
import { jsPDF } from 'jspdf';
import Swal from 'sweetalert2';
import HebrewReactDatePicker from '../../../components/common/HebrewReactDatePicker';

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

const EnhancedCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha('#4cb5c3', 0.1)}`,
  borderRadius: '16px',
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
    },
    error: {
      bg: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
      hover: 'linear-gradient(45deg, #d32f2f 30%, #b71c1c 90%)',
      shadow: 'rgba(244, 67, 54, 0.4)'
    }
  };
  
  const colorScheme = variant === 'error' ? colors.error : (variant === 'contained' ? colors.contained : colors.outlined);
  
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
    formatDate
  } = useTreatmentContext();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    description: true,
    highlight: true
  });

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

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
  const exportToPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm', 
      format: 'a4'
    });
    
    // Set RTL direction
    doc.setR2L(true);
    
    // Report title
    doc.setFontSize(18);
    doc.text('סיכום טיפול', 105, 20, { align: 'center' });
    
    // Treatment details
    doc.setFontSize(12);
    doc.text(`סוג טיפול: ${getTreatmentName(currentTreatment.treatmentTypeId)}`, 180, 40, { align: 'right' });
    doc.text(`תאריך: ${formatDate(currentTreatment.treatmentDate)}`, 180, 50, { align: 'right' });
    doc.text(`מטפל: ${getEmployeeName(currentTreatment.employeeId)}`, 180, 60, { align: 'right' });
    doc.text(`רמת שיתוף פעולה: ${currentTreatment.cooperationLevel}/5`, 180, 70, { align: 'right' });
    
    // Treatment description
    doc.setFontSize(14);
    doc.text('תיאור הטיפול:', 180, 90, { align: 'right' });
    
    const splitDescription = doc.splitTextToSize(currentTreatment.description || '', 160);
    doc.setFontSize(12);
    doc.text(splitDescription, 180, 100, { align: 'right' });
    
    // Highlight
    if (currentTreatment.highlight) {
      const yPos = 100 + (splitDescription.length * 7) + 20;
      doc.setFontSize(14);
      doc.text('הדגשה:', 180, yPos, { align: 'right' });
      
      const splitHighlight = doc.splitTextToSize(currentTreatment.highlight, 160);
      doc.setFontSize(12);
      doc.text(splitHighlight, 180, yPos + 10, { align: 'right' });
    }
    
    doc.save(`treatment-${currentTreatment.treatmentId}.pdf`);
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
      <ModernDialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AnimatedAvatar sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              width: 48, 
              height: 48,
              backdropFilter: 'blur(10px)'
            }}>
              {editMode ? <EditIcon /> : <VisibilityIcon />}
            </AnimatedAvatar>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                {editMode ? 'עריכת סיכום טיפול' : 'צפייה בסיכום טיפול'}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
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
                  <EditIcon />
                </IconButton>
                <IconButton 
                  color="inherit" 
                  onClick={exportToPdf} 
                  disabled={loading}
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
                  <DownloadIcon />
                </IconButton>
              </>
            )}
            <IconButton 
              color="inherit" 
              onClick={closeViewDialog}
              disabled={loading}
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
        </Box>
      </ModernDialogTitle>
      
      <DialogContent sx={{ p: 4, background: 'linear-gradient(135deg, #f8fafb 0%, #ffffff 100%)' }}>
        {(formError || error) && (
          <Fade in>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
              {formError || error}
            </Alert>
          </Fade>
        )}

        {editMode ? (
          <Fade in>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Date */}
                  <Grid item size={{ xs:12,md:6}}>
                    <HebrewReactDatePicker
                      maxDate={new Date()}
                      label="תאריך טיפול"
                      value={formData.treatmentDate}
                      onChange={handleDateChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              background: 'rgba(255, 255, 255, 0.8)',
                            }
                          }
                        }
                      }}
                    />
                  </Grid>

                  {/* Cooperation Level */}
                  <Grid itemsize={{ xs:12,md:6}}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                        רמת שיתוף פעולה
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Rating
                          value={formData.cooperationLevel}
                          onChange={handleCooperationChange}
                          max={5}
                          size="large"
                          sx={{
                            '& .MuiRating-iconFilled': {
                              color: '#ffc107',
                              filter: 'drop-shadow(0 2px 4px rgba(255, 193, 7, 0.3))'
                            }
                          }}
                        />
                        <Chip 
                          label={`${formData.cooperationLevel}/5`}
                          color="primary"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Stack>
                    </Box>
                  </Grid>

                  {/* Description */}
                  <Grid item size={{ xs:12}}>
                    <StyledTextField
                      fullWidth
                      multiline
                      rows={6}
                      name="description"
                      label="תיאור הטיפול"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>

                  {/* Highlight */}
                  <Grid item size={{ xs:12}}>
                    <StyledTextField
                      fullWidth
                      multiline
                      rows={3}
                      name="highlight"
                      label="הדגשה (אופציונלי)"
                      value={formData.highlight || ''}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              </form>
            </LocalizationProvider>
          </Fade>
        ) : (
          <Fade in>
            <Grid container spacing={3}>
              {/* Basic Details */}
              <Grid item size={{ xs:12}}>
                <EnhancedCard>
                  <Box 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: alpha('#4cb5c3', 0.05) }
                    }}
                    onClick={() => toggleSection('details')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <AnimatedAvatar sx={{ bgcolor: '#4cb5c3' }}>
                        <MedicalIcon />
                      </AnimatedAvatar>
                      <Typography variant="h6" fontWeight={700}>
                        פרטי הטיפול
                      </Typography>
                    </Box>
                    {expandedSections.details ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>
                  <Collapse in={expandedSections.details}>
                    <CardContent sx={{ pt: 0 }}>
                      <Grid container spacing={3}>
                        <Grid item size={{ xs:12,md:6}}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: alpha('#4cb5c3', 0.05) }}>
                            <CalendarIcon sx={{ color: '#4cb5c3' }} />
                            <Box>
                              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                תאריך טיפול
                              </Typography>
                              <Typography variant="body1" fontWeight={700}>
                                {formatDate(currentTreatment.treatmentDate)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item size={{ xs:12,md:6}}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: alpha('#ff7043', 0.05) }}>
                            <PersonIcon sx={{ color: '#ff7043' }} />
                            <Box>
                              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                מטפל
                              </Typography>
                              <Typography variant="body1" fontWeight={700}>
                                {getEmployeeName(currentTreatment.employeeId)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item size={{ xs:12}}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: alpha('#10b981', 0.05) }}>
                            <StarIcon sx={{ color: '#10b981' }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
                                רמת שיתוף פעולה
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Rating
                                  value={currentTreatment.cooperationLevel || 0}
                                  readOnly
                                  size="small"
                                  sx={{ '& .MuiRating-iconFilled': { color: '#ffc107' } }}
                                />
                                <Typography variant="body1" fontWeight={700}>
                                  {currentTreatment.cooperationLevel}/5
                                </Typography>
                              </Stack>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </EnhancedCard>
              </Grid>

              {/* Treatment Description */}
              <Grid item size={{ xs:12}}>
                <EnhancedCard>
                  <Box 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: alpha('#4cb5c3', 0.05) }
                    }}
                    onClick={() => toggleSection('description')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <AnimatedAvatar sx={{ bgcolor: '#ff7043' }}>
                        <DescriptionIcon />
                      </AnimatedAvatar>
                      <Typography variant="h6" fontWeight={700}>
                        תיאור הטיפול
                      </Typography>
                    </Box>
                    {expandedSections.description ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>
                  <Collapse in={expandedSections.description}>
                    <CardContent sx={{ pt: 0 }}>
                      <Paper sx={{ 
                        p: 3, 
                        borderRadius: 3, 
                        bgcolor: alpha('#4cb5c3', 0.02),
                        border: `1px solid ${alpha('#4cb5c3', 0.1)}`
                      }}>
                        <Typography variant="body1" sx={{ 
                          lineHeight: 1.8,
                          whiteSpace: 'pre-line'
                        }}>
                          {currentTreatment.description}
                        </Typography>
                      </Paper>
                    </CardContent>
                  </Collapse>
                </EnhancedCard>
              </Grid>

              {/* Highlight */}
              {currentTreatment.highlight && (
                <Grid item size={{ xs:12}}>
                  <EnhancedCard>
                    <Box 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: alpha('#4cb5c3', 0.05) }
                      }}
                      onClick={() => toggleSection('highlight')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AnimatedAvatar sx={{ bgcolor: '#10b981' }}>
                          <HighlightIcon />
                        </AnimatedAvatar>
                        <Typography variant="h6" fontWeight={700}>
                          הדגשה
                        </Typography>
                      </Box>
                      {expandedSections.highlight ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Box>
                    <Collapse in={expandedSections.highlight}>
                      <CardContent sx={{ pt: 0 }}>
                        <Alert severity="warning" sx={{ borderRadius: 3 }}>
                          <Typography variant="body1" sx={{ 
                            lineHeight: 1.7,
                            whiteSpace: 'pre-line'
                          }}>
                            {currentTreatment.highlight}
                          </Typography>
                        </Alert>
                      </CardContent>
                    </Collapse>
                  </EnhancedCard>
                </Grid>
              )}
            </Grid>
          </Fade>
        )}
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ 
        justifyContent: 'space-between', 
        p: 3,
        background: 'linear-gradient(135deg, #f8fafb 0%, #ffffff 100%)'
      }}>
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
            >
              ביטול
            </ActionButton>
            
            <ActionButton
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {loading ? 'שומר...' : 'שמור שינויים'}
            </ActionButton>
          </>
        ) : (
          <>
            <ActionButton
              variant="error"
              onClick={handleDelete}
              disabled={loading}
              startIcon={<DeleteIcon />}
            >
              מחק טיפול
            </ActionButton>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <ActionButton
                variant="outlined"
                onClick={closeViewDialog}
                disabled={loading}
              >
                סגור
              </ActionButton>
              
              <ActionButton
                variant="contained"
                onClick={() => setEditMode(true)}
                disabled={loading}
                startIcon={<EditIcon />}
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