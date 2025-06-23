import  { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { useTreatmentContext } from './TreatmentContext';
import { jsPDF } from 'jspdf';
import Swal from 'sweetalert2';

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

  // עדכון נתוני הטופס בעת פתיחת הדיאלוג
  useEffect(() => {
    if (currentTreatment && isViewDialogOpen) {
      setFormData({
        ...currentTreatment,
        cooperationLevel: currentTreatment.cooperationLevel || 0,
        treatmentDate: currentTreatment.treatmentDate ? new Date(currentTreatment.treatmentDate) : new Date()
      });
      setEditMode(false);
      setFormError('');
      setExpandedSections({
        details: true,
        description: true,
        highlight: Boolean(currentTreatment.highlight)
      });
    }
  }, [currentTreatment, isViewDialogOpen]);

  if (!currentTreatment) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // ניקוי שגיאות
    if (formError) {
      setFormError('');
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

  const validateForm = () => {
    if (!formData.description?.trim()) {
      setFormError('יש להזין תיאור טיפול');
      return false;
    }
    
    if (formData.description.trim().length < 10) {
      setFormError('תיאור הטיפול חייב להכיל לפחות 10 תווים');
      return false;
    }
    
    setFormError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const treatmentData = {
        ...formData,
        treatmentDate: formData.treatmentDate.toISOString().split('T')[0]
      };
      
      await updateTreatment(currentTreatment.treatmentId, treatmentData);
      
      Swal.fire({
        title: 'עודכן בהצלחה',
        text: 'פרטי הטיפול עודכנו בהצלחה',
        icon: 'success',
        confirmButtonText: 'אישור',
        confirmButtonColor: '#4fc3f7'
      });
      
      setEditMode(false);
    } catch (err) {
      setFormError(err.message || 'שגיאה בעדכון טיפול');
    }
  };

  const handleDelete = async () => {
    try {
      const result = await Swal.fire({
        title: 'מחיקת טיפול',
        text: 'האם אתה בטוח שברצונך למחוק את סיכום הטיפול? פעולה זו אינה הפיכה.',
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
          confirmButtonColor: '#4fc3f7'
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

  const exportToPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // הגדרת כיוון RTL
    doc.setR2L(true);
    
    // כותרת הדוח
    doc.setFontSize(18);
    doc.text('סיכום טיפול', 105, 20, { align: 'center' });
    
    // פרטי הטיפול
    doc.setFontSize(12);
    doc.text(`סוג טיפול: ${getTreatmentName(currentTreatment.treatmentTypeId)}`, 180, 40, { align: 'right' });
    doc.text(`תאריך: ${formatDate(currentTreatment.treatmentDate)}`, 180, 50, { align: 'right' });
    doc.text(`מטפל: ${getEmployeeName(currentTreatment.employeeId)}`, 180, 60, { align: 'right' });
    doc.text(`רמת שיתוף פעולה: ${currentTreatment.cooperationLevel}/5`, 180, 70, { align: 'right' });
    
    // תיאור הטיפול
    doc.setFontSize(14);
    doc.text('תיאור הטיפול:', 180, 90, { align: 'right' });
    
    const splitDescription = doc.splitTextToSize(currentTreatment.description || '', 160);
    doc.setFontSize(12);
    doc.text(splitDescription, 180, 100, { align: 'right' });
    
    // היילייט
    if (currentTreatment.highlight) {
      const yPos = 100 + (splitDescription.length * 7);
      doc.setFontSize(14);
      doc.text('נקודות חשובות:', 180, yPos, { align: 'right' });
      
      const splitHighlight = doc.splitTextToSize(currentTreatment.highlight, 160);
      doc.setFontSize(12);
      doc.text(splitHighlight, 180, yPos + 10, { align: 'right' });
    }
    
    // שמירת הקובץ
    doc.save(`סיכום_טיפול_${getTreatmentName(currentTreatment.treatmentTypeId)}_${formatDate(currentTreatment.treatmentDate)}.pdf`);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <Dialog
      open={isViewDialogOpen}
      onClose={closeViewDialog}
      maxWidth="lg"
      height="220vh"
      fullWidth
      dir="rtl"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          maxHeight: '150vh',
        }
      }}
    >
      {/* כותרת משופרת */}
      <DialogTitle sx={{ 
        background: editMode 
          ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
          : 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)',
        color: 'white',
        p: 3
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)',
              width: 48,
              height: 48
            }}>
              {editMode ? <EditIcon /> : <VisibilityIcon />}
            </Avatar>
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
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
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
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
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
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {(formError || error) && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {formError || error}
          </Alert>
        )}

        {editMode ? (
          /* editMode */
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Treatment Details */}
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid', borderColor: 'primary.light', borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon />
                      פרטי הטיפול
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="סוג טיפול"
                          value={getTreatmentName(currentTreatment.treatmentTypeId)}
                          disabled
                          fullWidth
                          variant="outlined"
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
                          <DatePicker
                            label="תאריך טיפול"
                            value={formData.treatmentDate}
                            onChange={handleDateChange}
                            renderInput={(params) => (
                              <TextField 
                                {...params} 
                                fullWidth
                                disabled={loading}
                              />
                            )}
                            maxDate={new Date()}
                          />
                        </LocalizationProvider>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="מטפל"
                          value={getEmployeeName(currentTreatment.employeeId)}
                          disabled
                          fullWidth
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Cooperation Level */}
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid', borderColor: 'warning.light', borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="warning.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StarIcon />
                      רמת שיתוף פעולה
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Rating
                        value={parseInt(formData.cooperationLevel) || 0}
                        onChange={handleCooperationChange}
                        max={5}
                        size="large"
                        disabled={loading}
                        sx={{
                          '& .MuiRating-iconFilled': {
                            color: '#ffc107',
                          }
                        }}
                      />
                      <Chip 
                        label={`${formData.cooperationLevel}/5`}
                        color="warning"
                        size="medium"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Treatment Description */}
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid', borderColor: 'info.light', borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="info.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon />
                      תיאור מהלך הטיפול
                    </Typography>
                    
                    <TextField
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      fullWidth
                      multiline
                      rows={4}
                      required
                      disabled={loading}
                      placeholder="תאר את מהלך הטיפול, התקדמות הילד, קשיים שהתגלו..."
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Highlight Points */}
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid', borderColor: 'secondary.light', borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="secondary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HighlightIcon />
                      נקודות חשובות / היילייט
                    </Typography>
                    
                    <TextField
                      name="highlight"
                      value={formData.highlight || ''}
                      onChange={handleInputChange}
                      fullWidth
                      multiline
                      rows={2}
                      disabled={loading}
                      placeholder="הוסף נקודות חשובות שיש לשים לב אליהן בטיפול הבא..."
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </form>
        ) : (
            /* view mode */
          <Grid container spacing={3}>
            {/* Treatment Details */}
            <Grid item xs={12}>
              <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box 
                  sx={{ 
                    p: 2, 
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                  onClick={() => toggleSection('details')}
                >
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" />
                    פרטי הטיפול
                  </Typography>
                  {expandedSections.details ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Box>
                <Collapse in={expandedSections.details}>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                          <Typography variant="body2">סוג טיפול</Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {getTreatmentName(currentTreatment.treatmentTypeId)}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
                          <Typography variant="body2">תאריך</Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {formatDate(currentTreatment.treatmentDate)}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'white' }}>
                          <Typography variant="body2">מטפל</Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {getEmployeeName(currentTreatment.employeeId)}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
                          <Typography variant="body2">שיתוף פעולה</Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                            <Rating
                              value={currentTreatment.cooperationLevel || 0}
                              readOnly
                              size="small"
                              sx={{ '& .MuiRating-iconFilled': { color: 'white' } }}
                            />
                            <Typography variant="h6" fontWeight="bold">
                              {currentTreatment.cooperationLevel}/5
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Collapse>
              </Card>
            </Grid>
            
            {/* Treatment Description */}
            <Grid item xs={12}>
              <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box 
                  sx={{ 
                    p: 2, 
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                  onClick={() => toggleSection('description')}
                >
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionIcon color="info" />
                    תיאור מהלך הטיפול
                  </Typography>
                  {expandedSections.description ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Box>
                <Collapse in={expandedSections.description}>
                  <CardContent>
                    <Typography variant="body1" sx={{ 
                      lineHeight: 1.7,
                      p: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                      whiteSpace: 'pre-line'
                    }}>
                      {currentTreatment.description || 'לא הוזן תיאור'}
                    </Typography>
                  </CardContent>
                </Collapse>
              </Card>
            </Grid>
            
            {/* Highlight Points */}
            {currentTreatment.highlight && (
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid', borderColor: 'warning.light', borderRadius: 2 }}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'warning.light',
                      color: 'white'
                    }}
                    onClick={() => toggleSection('highlight')}
                  >
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HighlightIcon />
                      נקודות חשובות
                    </Typography>
                    {expandedSections.highlight ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>
                  <Collapse in={expandedSections.highlight}>
                    <CardContent>
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        <Typography variant="body1" sx={{ 
                          lineHeight: 1.7,
                          whiteSpace: 'pre-line'
                        }}>
                          {currentTreatment.highlight}
                        </Typography>
                      </Alert>
                    </CardContent>
                  </Collapse>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ justifyContent: 'space-between', p: 3 }}>
        {editMode ? (
          // כפתורים במצב עריכה
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setEditMode(false);
                setFormData(currentTreatment);
                setFormError('');
              }}
              disabled={loading}
              sx={{ px: 3, borderRadius: 2 }}
            >
              ביטול
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{ 
                px: 4, 
                borderRadius: 2,
                background: 'linear-gradient(45deg, #ff9800, #f57c00)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #f57c00, #e65100)',
                }
              }}
            >
              {loading ? 'שומר...' : 'שמור שינויים'}
            </Button>
          </>
        ) : (
          // כפתורים במצב צפייה
          <>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
              disabled={loading}
              startIcon={<DeleteIcon />}
              sx={{ px: 3, borderRadius: 2 }}
            >
              מחק טיפול
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={closeViewDialog}
                disabled={loading}
                sx={{ px: 3, borderRadius: 2 }}
              >
                סגור
              </Button>
              
              <Button
                variant="contained"
                onClick={() => setEditMode(true)}
                disabled={loading}
                startIcon={<EditIcon />}
                sx={{ px: 3, borderRadius: 2 }}
              >
                ערוך
              </Button>
            </Box>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TreatmentViewDialog;