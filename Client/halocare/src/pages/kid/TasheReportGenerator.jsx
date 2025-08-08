// =========================================
// components/kids/tabs/TasheReportGenerator.jsx
// =========================================
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Preview as PreviewIcon,
  CheckCircle as CheckIcon,
  Psychology as BrainIcon,
  Timeline as TimelineIcon,
  Assessment as ReportIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';

import {
  generateTasheReport,
  fetchTreatmentsPreview,
  resetGenerateStatus,
  clearTreatmentsPreview
} from '../../Redux/features/tasheReportsSlice';
import { baseURL } from '../../components/common/axiosConfig';

const TasheReportGenerator = ({ open, onClose, kidId, kidName, currentUser }) => {
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  
  // Redux state
  const { 
    generateStatus, 
    generateError, 
    treatmentsPreview, 
    previewStatus, 
    previewError,
    currentReport 
  } = useSelector(state => state.tasheReports);

  // Form data
  const [formData, setFormData] = useState({
    kidId: kidId,
    periodStartDate: null,
    periodEndDate: null,
    generatedByEmployeeId: currentUser?.id,
    reportTitle: '',
    notes: ''
  });

  const steps = [
    'בחירת תקופה',
    'תצוגה מקדימה', 
    'יצירת דוח AI',
    'הושלם'
  ];

  // איפוס כשנפתח הדיאלוג
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      dispatch(resetGenerateStatus());
      dispatch(clearTreatmentsPreview());
      
      // הגדרת תאריכי ברירת מחדל (3 חודשים אחורה)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      
      setFormData({
        kidId: kidId,
        periodStartDate: startDate,
        periodEndDate: endDate,
        generatedByEmployeeId: currentUser?.id,
        reportTitle: `דוח תש"ה - ${kidName} - ${endDate.getMonth() + 1}/${endDate.getFullYear()}`,
        notes: ''
      });
    }
  }, [open, kidId, kidName, currentUser]);

  // בדיקת תקינות שלב
  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.periodStartDate && 
               formData.periodEndDate && 
               formData.periodStartDate < formData.periodEndDate;
      case 1:
        return treatmentsPreview && treatmentsPreview.length > 0;
      case 2:
        return generateStatus === 'succeeded';
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      // שליפת טיפולים לתצוגה מקדימה
      try {
        await dispatch(fetchTreatmentsPreview({
          kidId: formData.kidId,
          startDate: formData.periodStartDate.toISOString(),
          endDate: formData.periodEndDate.toISOString()
        })).unwrap();
      } catch (error) {
        return; // stay 
      }
    } else if (activeStep === 1) {
      // יצירת הדוח
      try {
        await dispatch(generateTasheReport(formData)).unwrap();
      } catch (error) {
        return; // נשאר בשלב הנוכחי אם יש שגיאה
      }
    }
    
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    dispatch(resetGenerateStatus());
    dispatch(clearTreatmentsPreview());
    onClose();
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }} dir="rtl">
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    בחירת תקופה לדוח תש"ה
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  בחרו את התקופה שעבורה תרצו ליצור את הדוח. מומלץ תקופה של 3 חודשים.
                </Typography>
              </CardContent>
            </Card>
            
            <Grid container spacing={3}>
              <Grid item size={{xs:12,md:6}}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
                  <DatePicker
                    label="תאריך התחלה"
                    value={formData.periodStartDate}
                    onChange={(date) => setFormData(prev => ({ ...prev, periodStartDate: date }))}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item size={{xs:12,md:6}}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
                  <DatePicker
                    label="תאריך סיום"
                    value={formData.periodEndDate}
                    onChange={(date) => setFormData(prev => ({ ...prev, periodEndDate: date }))}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item size={{xs:12}}>
                <TextField
                  fullWidth
                  label="כותרת הדוח"
                  value={formData.reportTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, reportTitle: e.target.value }))}
                  placeholder={`דוח תש"ה - ${kidName}`}
                />
              </Grid>
              <Grid item size={{xs:12}}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="הערות (אופציונלי)"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="הערות נוספות לדוח..."
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }} dir="rtl">
            {previewStatus === 'loading' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress />
                <Typography>טוען טיפולים...</Typography>
              </Box>
            ) : previewError ? (
              <Alert severity="error">{previewError}</Alert>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  תצוגה מקדימה של הטיפולים
                </Typography>
                
                {treatmentsPreview && treatmentsPreview.length > 0 && (
                  <>
                    {/* סטטיסטיקות */}
                    <Card sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          📊 סטטיסטיקות התקופה
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item size={{xs:12,md:4}}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TimelineIcon color="primary" />
                              <Typography>
                                סה"כ טיפולים: {treatmentsPreview.length}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item size={{xs:12,md:4}}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckIcon color="success" />
                              <Typography>
                                ממוצע שיתוף פעולה: {
                                  treatmentsPreview
                                    .filter(t => t.cooperationLevel)
                                    .reduce((sum, t) => sum + t.cooperationLevel, 0) / 
                                  treatmentsPreview.filter(t => t.cooperationLevel).length || 0
                                }/5
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="subtitle1" gutterBottom>
                          סוגי טיפולים:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {[...new Set(treatmentsPreview.map(t => t.treatmentTypeName))]
                            .map((type, index) => (
                              <Chip 
                                key={index}
                                label={`${type} (${treatmentsPreview.filter(t => t.treatmentTypeName === type).length})`}
                                variant="outlined"
                                size="small"
                              />
                            ))}
                        </Box>
                      </CardContent>
                    </Card>

                    {/* רשימת טיפולים */}
                    <Typography variant="subtitle1" gutterBottom>
                      רשימת הטיפולים שיכללו בדוח:
                    </Typography>
                    
                    <Paper sx={{ maxHeight: 300, overflow: 'auto' }}>
                      <List>
                        {treatmentsPreview.map((treatment, index) => (
                          <ListItem key={index} divider>
                            <ListItemIcon>
                              <Box 
                                sx={{ 
                                  width: 12, 
                                  height: 12, 
                                  borderRadius: '50%', 
                                  bgcolor: treatment.treatmentColor || 'primary.main' 
                                }} 
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={`${treatment.treatmentTypeName} - ${treatment.employeeName}`}
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    📅 {new Date(treatment.treatmentDate).toLocaleDateString('he-IL')}
                                  </Typography>
                                  <Typography variant="body2" sx={{ 
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                  }}>
                                    {treatment.description}
                                  </Typography>
                                  {treatment.cooperationLevel && (
                                    <Typography variant="caption" color="primary">
                                      🤝 שיתוף פעולה: {treatment.cooperationLevel}/5
                                    </Typography>
                                  )}
                                  {treatment.highlight && (
                                    <Typography variant="caption" color="warning.main" sx={{ display: 'block' }}>
                                      ⭐ {treatment.highlight}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </>
                )}
              </>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2, textAlign: 'center' }} dir="rtl">
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 2,
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)'
            }}>
              <BrainIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Typography variant="h5" gutterBottom fontWeight="bold">
              יצירת דוח תש"ה באמצעות בינה מלאכותית
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              המערכת מנתחת את {treatmentsPreview?.length || 0} הטיפולים ויוצרת דוח מקצועי ומפורט...
            </Typography>
            {console.log(generateStatus)}
            {generateStatus === 'loading' && (
              <Box sx={{ mb: 3 }}>
                <LinearProgress sx={{ mb: 2, borderRadius: 2, height: 8 }} />
                <Typography variant="body2" color="text.secondary">
                  ⏳ אנא המתינו, זה עלול לקחת עד דקה...
                </Typography>
              </Box>
            )}

            {generateError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {generateError}
              </Alert>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}   dir="rtl">
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                mb: 2,
                bgcolor: 'success.main'
              }}>
                <CheckIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h5" gutterBottom color="success.main" fontWeight="bold">
                🎉 הדוח נוצר בהצלחה!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                דוח תש"ה מקצועי נוצר באמצעות בינה מלאכותית
              </Typography>
            </Box>
            
            {currentReport && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📋 {currentReport.reportTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    📅 נוצר: {new Date(currentReport.generatedDate).toLocaleString('he-IL')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    📊 תקופה: {new Date(currentReport.periodStartDate).toLocaleDateString('he-IL')} - {new Date(currentReport.periodEndDate).toLocaleDateString('he-IL')}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" sx={{ 
                    maxHeight: 150, 
                    overflow: 'auto', 
                    whiteSpace: 'pre-line',
                    backgroundColor: 'grey.50',
                    p: 2,
                    borderRadius: 2,
                    lineHeight: 1.6
                  }}>
                    {currentReport.reportContent.substring(0, 400)}...
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
  variant="outlined"
  startIcon={<PreviewIcon />}
  onClick={() => {
    const viewUrl = `/tashereports/${currentReport.reportId}/view`;
    window.open(baseURL + viewUrl, '_blank', 'width=1000,height=800,scrollbars=yes');
  }}
>
  צפה בדוח המלא
</Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      dir="rtl"
      PaperProps={{
        sx: { 
          minHeight: '600px',
          borderRadius: 3
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReportIcon />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              יצירת דוח תש"ה חכם
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {kidName}
            </Typography>
          </Box>
        </Box>
        <Button
          onClick={handleClose}
          color="inherit"
          startIcon={<CloseIcon />}
        >
          סגור
        </Button>
      </DialogTitle>
      
      <DialogContent sx={{ px: 3 }}>
        {(generateError || previewError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {generateError || previewError}
          </Alert>
        )}

        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 2 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>
                <Typography fontWeight={activeStep === index ? 'bold' : 'normal'}>
                  {label}
                </Typography>
              </StepLabel>
              <StepContent>
                {getStepContent(index)}
                
                <Box sx={{ mt: 3, mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={
                        !validateStep(index) || 
                        generateStatus === 'loading' || 
                        previewStatus === 'loading'
                      }
                      sx={{ 
                        mt: 1, 
                        mr: 1,
                        background: index === 1 ? 
                          'linear-gradient(45deg, #FF6B6B, #4ECDC4)' : 
                          undefined
                      }}
                      startIcon={
                        index === 1 ? <AIIcon /> : 
                        index === 0 ? <PreviewIcon /> : 
                        <CheckIcon />
                      }
                    >
                      {generateStatus === 'loading' ? 'יוצר דוח...' :
                       previewStatus === 'loading' ? 'טוען...' :
                       index === steps.length - 1 ? 'סיום' : 
                       index === 1 ? '🚀 צור דוח באמצעות AI' : 'המשך'}
                    </Button>
                    <Button
                      disabled={index === 0 || generateStatus === 'loading'}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      חזור
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          💡 הדוח נוצר באמצעות בינה מלאכותית של Google Gemini
        </Typography>
      </DialogActions>
    </Dialog>
  );
};

export default TasheReportGenerator;