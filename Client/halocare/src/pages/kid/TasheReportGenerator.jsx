import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Psychology as BrainIcon,
  Assessment as ReportIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import { generateTasheReport, fetchTreatmentsPreview } from '../../Redux/features/tasheReportsSlice';
import { useAuth } from '../../components/login/AuthContext';

const TasheReportGenerator = ({ open, onClose, selectedKid, onSuccess }) => {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    startDate: dayjs().subtract(3, 'month'),
    endDate: dayjs(),
    reportTitle: '',
    notes: ''
  });
  
  // Preview data
  const [treatmentsPreview, setTreatmentsPreview] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const steps = [
    'בחירת תקופה',
    'בדיקת טיפולים',
    'פרטי דוח',
    'יצירת דוח'
  ];

  useEffect(() => {
    if (selectedKid && open) {
      // איפוס הטופס כשפותחים את הדיאלוג
      const defaultTitle = `דוח תש"ה - ${selectedKid.firstName} ${selectedKid.lastName} - ${dayjs().format('MM/YYYY')}`;
      setFormData(prev => ({
        ...prev,
        reportTitle: defaultTitle
      }));
      setActiveStep(0);
      setError('');
      setSuccess('');
      setTreatmentsPreview([]);
    }
  }, [selectedKid, open]);

  // פונקציה לבדיקת תקינות תאריכים
  const validateDates = () => {
    if (!formData.startDate || !formData.endDate) {
      setError('יש לבחור תאריכי התחלה וסיום');
      return false;
    }

    if (formData.startDate.isAfter(formData.endDate)) {
      setError('תאריך ההתחלה חייב להיות לפני תאריך הסיום');
      return false;
    }

    if (formData.endDate.isAfter(dayjs())) {
      setError('לא ניתן ליצור דוח לתקופה עתידית');
      return false;
    }

    const daysDiff = formData.endDate.diff(formData.startDate, 'day');
    if (daysDiff > 180) {
      setError('תקופת הדוח לא יכולה לעלות על 6 חודשים');
      return false;
    }

    if (daysDiff < 7) {
      setError('תקופת הדוח חייבת להיות לפחות שבוע');
      return false;
    }

    return true;
  };

  // שליפת טיפולים לתצוגה מקדימה
  const fetchPreview = async () => {
    if (!validateDates()) return;

    setPreviewLoading(true);
    setError('');

    try {
      const response = await dispatch(fetchTreatmentsPreview({
        kidId: selectedKid.id,
        startDate: formData.startDate.format('YYYY-MM-DD'),
        endDate: formData.endDate.format('YYYY-MM-DD')
      })).unwrap();

      setTreatmentsPreview(response);
      
      if (response.length === 0) {
        setError('לא נמצאו טיפולים לתקופה שנבחרה. אנא בחרו תקופה אחרת.');
      } else {
        setActiveStep(1);
      }
    } catch (err) {
      setError(err.message || 'שגיאה בשליפת הטיפולים');
    } finally {
      setPreviewLoading(false);
    }
  };

  // יצירת הדוח
  const generateReport = async () => {
    if (!formData.reportTitle.trim()) {
      setError('יש למלא כותרת לדוח');
      return;
    }

    setGenerating(true);
    setError('');
    setGenerationProgress(0);

    // סימולציה של התקדמות
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      const reportData = {
        kidId: selectedKid.id,
        periodStartDate: formData.startDate.format('YYYY-MM-DD'),
        periodEndDate: formData.endDate.format('YYYY-MM-DD'),
        generatedByEmployeeId: currentUser.id,
        reportTitle: formData.reportTitle.trim(),
        notes: formData.notes.trim() || ''
      };

      const response = await dispatch(generateTasheReport(reportData)).unwrap();
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      setSuccess('הדוח נוצר בהצלחה! 🎉');
      setActiveStep(3);
      
      // קריאה לפונקציה של הקומפוננט האב לרענון הרשימה
      if (onSuccess) {
        onSuccess(response);
      }
      
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || 'שגיאה ביצירת הדוח');
      setGenerationProgress(0);
    } finally {
      setGenerating(false);
    }
  };

  // סגירת הדיאלוג
  const handleClose = () => {
    if (generating) return; // מניעת סגירה במהלך יצירה
    
    setActiveStep(0);
    setError('');
    setSuccess('');
    setTreatmentsPreview([]);
    setGenerationProgress(0);
    onClose();
  };

  // מעבר לשלב הבא
  const handleNext = () => {
    setError('');
    
    switch (activeStep) {
      case 0:
        fetchPreview();
        break;
      case 1:
        setActiveStep(2);
        break;
      case 2:
        generateReport();
        break;
      default:
        break;
    }
  };

  // חזרה לשלב הקודם
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      setError('');
    }
  };

  // קבלת סיכום הטיפולים
  const getTreatmentsSummary = () => {
    const byType = treatmentsPreview.reduce((acc, treatment) => {
      acc[treatment.treatmentTypeName] = (acc[treatment.treatmentTypeName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(byType).map(([type, count]) => ({
      type,
      count,
      color: getTreatmentTypeColor(type)
    }));
  };

  // קבלת צבע לפי סוג טיפול
  const getTreatmentTypeColor = (type) => {
    const colors = {
      'טיפול רגשי': '#FF6B6B',
      'פיזיותרפיה': '#4ECDC4',
      'ריפוי בעיסוק': '#45B7D1',
      'תזונה': '#96CEB4',
      'רפואי': '#FFEAA7'
    };
    return colors[type] || '#BDC3C7';
  };

  // רנדור תוכן השלב הנוכחי
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ py: 3 }} dir="rtl">
            <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
              בחירת תקופת הדוח
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="תאריך התחלה"
                  value={formData.startDate}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, startDate: newValue }))}
                  maxDate={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="תאריך סיום"
                  value={formData.endDate}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, endDate: newValue }))}
                  maxDate={dayjs()}
                  minDate={formData.startDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </Grid>
            </Grid>

            {formData.startDate && formData.endDate && (
              <Paper sx={{ mt: 3, p: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                <Typography variant="body2" color="primary.main">
                  <strong>תקופת הדוח:</strong> {formData.endDate.diff(formData.startDate, 'day')} ימים
                  ({formData.startDate.format('DD/MM/YYYY')} - {formData.endDate.format('DD/MM/YYYY')})
                </Typography>
              </Paper>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ py: 3 }} dir="rtl">
            <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
              סיכום טיפולים בתקופה
            </Typography>

            {previewLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {getTreatmentsSummary().map(({ type, count, color }) => (
                    <Grid item xs={12} sm={6} md={4} key={type}>
                      <Card sx={{ height: '100%', border: '2px solid', borderColor: color }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Box 
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              bgcolor: color, 
                              borderRadius: '50%', 
                              mx: 'auto', 
                              mb: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Typography variant="h6" color="white" fontWeight="bold">
                              {count}
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight="bold">
                            {type}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Paper sx={{ p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckIcon sx={{ color: 'success.main', mr: 1 }} />
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      נמצאו {treatmentsPreview.length} טיפולים בתקופה שנבחרה
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    הדוח יכלול ניתוח מקיף של כל הטיפולים והתקדמות הילד בתקופה זו
                  </Typography>
                </Paper>

                {/* רשימת טיפולים מקוצרת */}
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }} fontWeight="bold">
                  טיפולים אחרונים:
                </Typography>
                <List sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'grey.50', borderRadius: 1 }}>
                  {treatmentsPreview.slice(0, 5).map((treatment, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            bgcolor: getTreatmentTypeColor(treatment.treatmentTypeName), 
                            borderRadius: '50%' 
                          }} 
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${treatment.treatmentTypeName} - ${treatment.employeeName}`}
                        secondary={`${dayjs(treatment.treatmentDate).format('DD/MM/YYYY')} | ${treatment.description.substring(0, 60)}...`}
                      />
                    </ListItem>
                  ))}
                  {treatmentsPreview.length > 5 && (
                    <ListItem>
                      <ListItemText
                        primary={`ועוד ${treatmentsPreview.length - 5} טיפולים נוספים...`}
                        sx={{ textAlign: 'center', fontStyle: 'italic' }}
                      />
                    </ListItem>
                  )}
                </List>
              </>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 3 }} dir="rtl">
            <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <ReportIcon sx={{ mr: 1, color: 'primary.main' }} />
              פרטי הדוח
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="כותרת הדוח"
                  value={formData.reportTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, reportTitle: e.target.value }))}
                  required
                  helperText="כותרת זו תופיע בראש הדוח ובשם הקובץ"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="הערות נוספות (אופציונלי)"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  helperText="הערות אלו יופיעו בפרטי הדוח"
                />
              </Grid>
            </Grid>

            <Paper sx={{ mt: 3, p: 2, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
              <Typography variant="body2" color="info.main">
                <strong>מה יכלל הדוח:</strong>
                <br />• ניתוח מקיף של {treatmentsPreview.length} טיפולים
                <br />• התקדמות לפי תחומי טיפול
                <br />• מטרות והמלצות להמשך
                <br />• סיכום מקצועי ומובנה
              </Typography>
            </Paper>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ py: 3, textAlign: 'center' }} dir="rtl">
            {generating ? (
              <>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h6" gutterBottom>
                  יוצר דוח באמצעות בינה מלאכותית...
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={generationProgress} 
                  sx={{ mb: 2, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {generationProgress < 30 && 'מנתח את נתוני הטיפולים...'}
                  {generationProgress >= 30 && generationProgress < 60 && 'מעבד את המידע...'}
                  {generationProgress >= 60 && generationProgress < 90 && 'כותב את הדוח...'}
                  {generationProgress >= 90 && 'משלים את הדוח...'}
                </Typography>
              </>
            ) : success ? (
              <>
                <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom color="success.main">
                  הדוח נוצר בהצלחה!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  הדוח זמין כעת לצפייה ולהורדה בטאב הדוחות
                </Typography>
                
                <Alert severity="info" sx={{ textAlign: 'right' }}>
                  <strong>הצעות לפעולות הבאות:</strong>
                  <br />• עיינו בדוח ובדקו את התוכן
                  <br />• הורידו את הדוח כקובץ Word לעריכה
                  <br />• שתפו את הדוח עם הורי הילד או הצוות הרפואי
                </Alert>
              </>
            ) : null}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        dir="rtl"
        fullWidth
        disableEscapeKeyDown={generating}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', pb: 1 }}>
          <BrainIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h6">
              יצירת דוח תש"ה חכם
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedKid && `${selectedKid.firstName} ${selectedKid.lastName}`}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {renderStepContent()}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleClose}
            disabled={generating}
          >
            {success ? 'סגירה' : 'ביטול'}
          </Button>
          
          {activeStep > 0 && activeStep < 3 && (
            <Button 
              onClick={handleBack}
              disabled={generating || previewLoading}
            >
              חזור
            </Button>
          )}
          
          {activeStep < 2 && (
            <Button 
              variant="contained"
              onClick={handleNext}
              disabled={generating || previewLoading}
              sx={{ minWidth: 120 }}
            >
              {previewLoading ? <CircularProgress size={20} /> : 'המשך'}
            </Button>
          )}
          
          {activeStep === 2 && (
            <Button 
              variant="contained"
              onClick={handleNext}
              disabled={generating || !formData.reportTitle.trim()}
              sx={{ 
                minWidth: 140,
                background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF5252, #26A69A)',
                }
              }}
            >
              {generating ? <CircularProgress size={20} /> : 'יצירת דוח AI'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default TasheReportGenerator;