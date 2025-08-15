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
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  LinearProgress,
  styled,
  alpha,
  keyframes
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Psychology as BrainIcon,
  Assessment as ReportIcon,
  CheckCircle as CheckIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import { generateTasheReport, fetchTreatmentsPreview } from '../../Redux/features/tasheReportsSlice';
import { useAuth } from '../../components/login/AuthContext';
import Swal from 'sweetalert2';
import FullscreenAILoader from './FullscreenAILoader';
import HebrewReactDatePicker  from '../../components/common/HebrewReactDatePicker';
import { h } from '@fullcalendar/core/preact.js';

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Enhanced Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 20,
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    height: '100%',
  }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.05) 0%, rgba(255, 112, 67, 0.05) 100%)',
  borderBottom: '2px solid rgba(76, 181, 195, 0.1)',
  paddingBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
}));

const AnimatedBrainIcon = styled(BrainIcon)(({ theme }) => ({
  marginRight: theme.spacing(2),
  fontSize: 32,
  color: theme.palette.primary.main,
  filter: 'drop-shadow(0 4px 8px rgba(76, 181, 195, 0.3))',
  animation: `${pulse} 2s infinite`,
}));

const StyledStepper = styled(Stepper)(({ theme }) => ({
      height: '100%',

  marginBottom: theme.spacing(4),
  '& .MuiStepIcon-root': {
    color: 'rgba(200, 200, 200, 0.5)',
    '&.Mui-active': {
      color: theme.palette.primary.main,
      filter: 'drop-shadow(0 4px 8px rgba(76, 181, 195, 0.3))',
    },
    '&.Mui-completed': {
      color: theme.palette.success.main,
      filter: 'drop-shadow(0 4px 8px rgba(76, 175, 80, 0.3))',
    }
  },
  '& .MuiStepLabel-label': {
    fontWeight: 500,
    '&.Mui-active': {
      fontWeight: 700,
      color: theme.palette.primary.main,
    },
    '&.Mui-completed': {
      fontWeight: 600,
      color: theme.palette.success.main,
    }
  },
  '& .MuiStepConnector-line': {
    borderColor: 'rgba(200, 200, 200, 0.3)',
    borderWidth: 2,
  },
  '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
    borderColor: theme.palette.primary.main,
    borderImage: 'linear-gradient(90deg, #4cb5c3, #ff7043) 1',
  },
  '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
    borderColor: theme.palette.success.main,
  }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 16,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, currentColor, transparent)',
  }
}));

const InfoPaper = styled(StyledPaper)(({ theme, severity }) => ({
  marginTop: theme.spacing(3),
  borderColor: theme.palette[severity]?.light || theme.palette.primary.light,
  backgroundColor: alpha(theme.palette[severity]?.main || theme.palette.primary.main, 0.03),
  '&::before': {
    background: `linear-gradient(90deg, ${theme.palette[severity]?.main || theme.palette.primary.main}, ${theme.palette[severity]?.light || theme.palette.primary.light})`,
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.9)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 1)',
      '& fieldset': {
        borderColor: theme.palette.primary.main,
      }
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 1)',
      '& fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
      }
    }
  }
}));

const TreatmentCard = styled(Card)(({ theme, treatmentColor }) => ({
  height: '100%',
  borderRadius: 16,
  border: '2px solid',
  borderColor: treatmentColor,
  background: `linear-gradient(135deg, ${alpha(treatmentColor, 0.05)} 0%, ${alpha(treatmentColor, 0.02)} 100%)`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${slideIn} 0.5s ease-out`,
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: `0 8px 25px ${alpha(treatmentColor, 0.25)}`,
  }
}));

const CountCircle = styled(Box)(({ theme, bgcolor }) => ({
  width: 50,
  height: 50,
  background: `linear-gradient(135deg, ${bgcolor} 0%, ${alpha(bgcolor, 0.8)} 100%)`,
  borderRadius: '50%',
  margin: '0 auto',
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 4px 15px ${alpha(bgcolor, 0.4)}`,
  animation: `${pulse} 2s infinite`,
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 20,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  '& .MuiLinearProgress-bar': {
    borderRadius: 20,
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981)',
    backgroundSize: '200% 100%',
    animation: `${shimmer} 1.5s ease infinite`,
  }
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  fontWeight: 600,
  padding: theme.spacing(1, 3),
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    transition: 'all 0.5s ease',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
    '&::before': {
      left: '100%',
    }
  }
}));

const GenerateButton = styled(AnimatedButton)(({ theme }) => ({
  minWidth: 140,
  background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(45deg, #FF5252 30%, #26A69A 90%)',
    transform: 'translateY(-3px) scale(1.02)',
    boxShadow: '0 10px 30px rgba(255, 107, 107, 0.4)',
  }
}));

const StyledList = styled(List)(({ theme }) => ({
  maxHeight: 200,
  overflow: 'auto',
  background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(255, 255, 255, 0.9) 100%)',
  borderRadius: 12,
  border: '1px solid rgba(200, 200, 200, 0.2)',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(200, 200, 200, 0.1)',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(180deg, #4cb5c3, #2a8a95)',
    borderRadius: '10px',
  },
}));

const AnimatedCheckIcon = styled(CheckIcon)(({ theme }) => ({
  fontSize: 80,
  color: theme.palette.success.main,
  marginBottom: theme.spacing(2),
  animation: `${pulse} 1s ease`,
  filter: 'drop-shadow(0 4px 15px rgba(76, 175, 80, 0.4))',
}));

const TasheReportGenerator = ({ open, onClose, selectedKid, onSuccess }) => {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  
  // State management 
  const [activeStep, setActiveStep] = useState(0);
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

  // All useEffect, validation and handler functions PRESERVED EXACTLY
  useEffect(() => {
    if (selectedKid && open) {
      // Reset form when opening dialog
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

  // Date validation function 
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
    if (daysDiff > 365) {
      setError('תקופת הדוח לא יכולה לעלות על שנה');
      return false;
    }

    if (daysDiff < 7) {
      setError('תקופת הדוח חייבת להיות לפחות שבוע');
      return false;
    }

    return true;
  };

  // Fetch treatments for preview 
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

  // Generate report 
  const generateReport = async () => {
    if (!formData.reportTitle.trim()) {
      setError('יש למלא כותרת לדוח');
      return;
    }

    setGenerating(true);
    setError('');
    setGenerationProgress(0);

    // Progress simulation
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
      
      Swal.fire({
        title: 'הדוח נוצר בהצלחה! 🎉',
        text: `הדוח "${reportData.reportTitle}" נוצר בהצלחה `,
        icon: 'success',
        confirmButtonText: 'מעולה!',
        confirmButtonColor: '#4CAF50',
        timer: 3500,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });
      setActiveStep(3);
      setSuccess('הדוח נוצר בהצלחה! 🎉');
      
      // Call parent component function to refresh list
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

  // Close dialog 
  const handleClose = () => {
    if (generating) return; // Prevent closing during generation
    
    setActiveStep(0);
    setError('');
    setSuccess('');
    setTreatmentsPreview([]);
    setGenerationProgress(0);
    onClose();
  };

  // Next step 
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

  // Previous step 
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      setError('');
    }
  };

  // Get treatments summary 
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

  // Get color by treatment type 
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

  // Render current step content - Enhanced styling only
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ py: 3 }} dir="rtl">
            <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <CalendarIcon sx={{ mr: 1, color: 'primary.main', animation: `${pulse} 2s infinite` }} />
              בחירת תקופת הדוח
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item size={{ xs: 12, sm:6}}>
      <HebrewReactDatePicker
  label="תאריך התחלה"
  value={formData.startDate}
  onChange={(newValue) => setFormData(prev => ({ ...prev, startDate: newValue }))}
  maxDate={dayjs()}
  
/>
      </Grid>
              
              <Grid item size={{ xs: 12, sm:6}}>
                <HebrewReactDatePicker
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
              <InfoPaper severity="primary">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  <strong>תקופת הדוח:</strong> {formData.endDate.diff(formData.startDate, 'day')} ימים
                  ({formData.startDate.format('DD/MM/YYYY')} - {formData.endDate.format('DD/MM/YYYY')})
                </Typography>
              </InfoPaper>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ py: 3 }} dir="rtl">
            <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <TimelineIcon sx={{ mr: 1, color: 'primary.main', animation: `${pulse} 2s infinite` }} />
              סיכום טיפולים בתקופה
            </Typography>

            {previewLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: 'primary.main' }} />
              </Box>
            ) : (
              <>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {getTreatmentsSummary().map(({ type, count, color }) => (
                    <Grid item size={{ xs: 12, sm:6, md:4}} key={type}>
                      <TreatmentCard treatmentColor={color}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <CountCircle bgcolor={color}>
                            <Typography variant="h6" color="white" fontWeight="bold">
                              {count}
                            </Typography>
                          </CountCircle>
                          <Typography variant="body2" fontWeight="bold">
                            {type}
                          </Typography>
                        </CardContent>
                      </TreatmentCard>
                    </Grid>
                  ))}
                </Grid>

                <InfoPaper severity="success">
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckIcon sx={{ color: 'success.main', mr: 1 }} />
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      נמצאו {treatmentsPreview.length} טיפולים בתקופה שנבחרה
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    הדוח יכלול ניתוח מקיף של כל הטיפולים והתקדמות הילד בתקופה זו
                  </Typography>
                </InfoPaper>

                {/* Shortened treatments list */}
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 700 }}>
                  טיפולים אחרונים:
                </Typography>
                <StyledList>
                  {treatmentsPreview.slice(0, 5).map((treatment, index) => (
                    <ListItem key={index} divider sx={{ '&:hover': { bgcolor: 'rgba(76, 181, 195, 0.05)' } }}>
                      <ListItemIcon>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            bgcolor: getTreatmentTypeColor(treatment.treatmentTypeName), 
                            borderRadius: '50%',
                            boxShadow: `0 2px 8px ${alpha(getTreatmentTypeColor(treatment.treatmentTypeName), 0.4)}`
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
                        sx={{ textAlign: 'center', fontStyle: 'italic', color: 'text.secondary' }}
                      />
                    </ListItem>
                  )}
                </StyledList>
              </>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 3 }} dir="rtl">
            <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <ReportIcon sx={{ mr: 1, color: 'primary.main', animation: `${pulse} 2s infinite` }} />
              פרטי הדוח
            </Typography>

            <Grid container spacing={3}>
              <Grid item size={{xs:12}}>
                <StyledTextField
                  fullWidth
                  label="כותרת הדוח"
                  value={formData.reportTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, reportTitle: e.target.value }))}
                  required
                  helperText="כותרת זו תופיע בראש הדוח ובשם הקובץ"
                />
              </Grid>
              
              <Grid item size={{xs:12}}>
                <StyledTextField
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

            <InfoPaper severity="info">
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                <strong>מה יכלל הדוח:</strong>
                <br />• ניתוח מקיף של {treatmentsPreview.length} טיפולים
                <br />• התקדמות לפי תחומי טיפול
                <br />• מטרות והמלצות להמשך
                <br />• סיכום מקצועי ומובנה
              </Typography>
            </InfoPaper>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ py: 3, textAlign: 'center' }} dir="rtl">
            {generating ? (
              <>
                <CircularProgress 
                  size={60} 
                  sx={{ 
                    mb: 3,
                    color: 'primary.main',
                    animation: `${rotate} 1s linear infinite`
                  }} 
                />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  יוצר דוח באמצעות בינה מלאכותית...
                </Typography>
                <StyledLinearProgress 
                  variant="determinate" 
                  value={generationProgress} 
                  sx={{ mb: 2, mx: 'auto', maxWidth: 400 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {generationProgress < 30 && 'מנתח את נתוני הטיפולים...'}
                  {generationProgress >= 30 && generationProgress < 60 && 'מעבד את המידע...'}
                  {generationProgress >= 60 && generationProgress < 90 && 'כותב את הדוח...'}
                  {generationProgress >= 90 && 'משלים את הדוח...'}
                </Typography>
              </>
            ) : success ? (
              <>
                <AnimatedCheckIcon />
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  הדוח נוצר בהצלחה!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  הדוח זמין כעת לצפייה ולהורדה בטאב הדוחות
                </Typography>
                
                <Alert 
                  severity="info" 
                  sx={{ 
                    textAlign: 'right',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(3, 169, 244, 0.05) 100%)',
                    border: '1px solid rgba(33, 150, 243, 0.2)',
                  }}
                >
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
      <StyledDialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        dir="rtl"
        fullWidth
        disableEscapeKeyDown={generating}
      >
        <StyledDialogTitle>
          <AnimatedBrainIcon />
          <Box>
            <Typography 
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              יצירת דוח תש"ה חכם
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {selectedKid && `${selectedKid.firstName} ${selectedKid.lastName}`}
            </Typography>
          </Box>
        </StyledDialogTitle>

        <DialogContent>
          <StyledStepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </StyledStepper>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.05) 0%, rgba(239, 83, 80, 0.05) 100%)',
                border: '1px solid rgba(244, 67, 54, 0.2)',
              }}
            >
              {error}
            </Alert>
          )}

          {renderStepContent()}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <AnimatedButton 
            onClick={handleClose}
            disabled={generating}
            sx={{ borderRadius: 12 }}
          >
            {success ? 'סגירה' : 'ביטול'}
          </AnimatedButton>
          
          {activeStep > 0 && activeStep < 3 && (
            <AnimatedButton 
              onClick={handleBack}
              disabled={generating || previewLoading}
              sx={{ borderRadius: 12 }}
            >
              חזור
            </AnimatedButton>
          )}
          
          {activeStep < 2 && (
            <AnimatedButton 
              variant="contained"
              onClick={handleNext}
              disabled={generating || previewLoading}
              sx={{ 
                minWidth: 120,
                borderRadius: 12,
                background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
                }
              }}
            >
              {previewLoading ? <CircularProgress size={20} color="inherit" /> : 'המשך'}
            </AnimatedButton>
          )}
          
          {activeStep === 2 && (
            <GenerateButton 
              variant="contained"
              onClick={handleNext}
              disabled={generating || !formData.reportTitle.trim()}
            >
              {generating ? <FullscreenAILoader
        open={generating} 
        progress={generationProgress} 
      /> : 'יצירת דוח'}
            </GenerateButton>
          )}
        </DialogActions>
      </StyledDialog>
      
    </LocalizationProvider>
  );
};

export default TasheReportGenerator;