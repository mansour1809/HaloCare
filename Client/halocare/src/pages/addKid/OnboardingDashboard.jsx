// components/kids/OnboardingDashboard.jsx - עיצוב משופר עם מסמכים

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Grid, Card, CardContent, CardActions, Typography, Button,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, CircularProgress, Tooltip, LinearProgress,
  Divider, Paper, Avatar, Container
} from '@mui/material';
import {
  Edit as EditIcon,
  Send as SendIcon,
  Visibility as ViewIcon,
  Folder as FolderIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  PendingActions as PendingIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import axios from '../../components/common/axiosConfig';

import { 
  updateFormStatus,
} from '../../Redux/features/onboardingSlice';

import { fetchParentById } from '../../Redux/features/parentSlice';

import KidDocumentManager from './KidDocumentManager';

// מסך מלא מותאם RTL עם רקע מדהים
const FullScreenContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
  backgroundSize: '400% 400%',
  animation: 'gradientShift 20s ease infinite',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(4),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 40%, rgba(76, 181, 195, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255, 112, 67, 0.2) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  }
}));

// כרטיס סטטיסטיקה מדהים
const StatCard = styled(Card)(({ theme, color, size = 'medium' }) => ({
  padding: size === 'small' ? '16px 12px' : '24px 20px',
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  height: size === 'small' ? '120px' : '140px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 15px 35px ${alpha(theme.palette[color]?.main || '#4cb5c3', 0.3)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette[color]?.main || '#4cb5c3'}, ${theme.palette[color]?.light || '#6dd5ed'})`,
    borderRadius: '20px 20px 0 0',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '200%',
    height: '200%',
    background: `radial-gradient(circle, ${alpha(theme.palette[color]?.main || '#4cb5c3', 0.1)} 0%, transparent 70%)`,
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  }
}));

// כרטיס טופס מעוצב
const FormCard = styled(Card)(({ theme, status }) => ({
  height: '100%',
  width: '280px',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: 20,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: status === 'Completed' || status === 'CompletedByParent' 
      ? 'linear-gradient(90deg, #10b981, #34d399)'
      : status === 'InProgress' 
      ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
      : status === 'SentToParent'
      ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
      : 'linear-gradient(90deg, #6b7280, #9ca3af)',
    borderRadius: '20px 20px 0 0',
  }
}));

// כרטיס תוכן מעוצב עם זכוכית
const ContentCard = styled(Paper)(({ theme }) => ({
  borderRadius: 20,
  overflow: 'hidden',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  position: 'relative',
  zIndex: 2,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
  }
}));

// כותרת סקציה מעוצבת
const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha('#4cb5c3', 0.1)} 0%, ${alpha('#ff7043', 0.1)} 100%)`,
  borderRadius: 16,
  border: `1px solid ${alpha('#4cb5c3', 0.2)}`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '4px',
    height: '60%',
    background: 'linear-gradient(180deg, #4cb5c3, #ff7043)',
    borderRadius: '2px',
  }
}));

// כפתור מונפש מדהים
const AnimatedButton = styled(Button)(({ theme, variant = 'contained' }) => ({
  borderRadius: 12,
  padding: '10px 20px',
  fontWeight: 600,
  fontSize: '0.95rem',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  ...(variant === 'contained' && {
    background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
    boxShadow: '0 4px 15px rgba(76, 181, 195, 0.3)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(76, 181, 195, 0.4)',
      background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
    },
  }),
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
}));

// אייקון מעוצב עם אנימציות
const StyledIcon = styled(Avatar)(({ theme, color }) => ({
  width: 50,
  height: 50,
  margin: '0 auto 12px',
  background: `linear-gradient(135deg, ${theme.palette[color]?.main || '#4cb5c3'}, ${theme.palette[color]?.dark || '#2a8a95'})`,
  color: 'white',
  fontSize: '1.5rem',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: `0 6px 20px ${alpha(theme.palette[color]?.main || '#4cb5c3', 0.4)}`,
  '&:hover': {
    transform: 'scale(1.1) rotate(10deg)',
    boxShadow: `0 8px 25px ${alpha(theme.palette[color]?.main || '#4cb5c3', 0.5)}`,
  }
}));

const OnboardingDashboard = ({ 
  onboardingData, 
  selectedKid, 
  onFormClick, 
  onRefresh 
}) => {
  const dispatch = useDispatch();
  
  // Local State 
  const [sendDialog, setSendDialog] = useState({ open: false, form: null });
  const [parentEmail, setParentEmail] = useState('');
  const [sendingToParent, setSendingToParent] = useState(false);
  const [loadingParentEmail, setLoadingParentEmail] = useState(false);

  // Parent sending functions (existing code)
  const handleSendToParent = async (form) => {
    try {
      setLoadingParentEmail(true);
      
      if (selectedKid?.parentId1) {
        const parentResult = await dispatch(fetchParentById(selectedKid.parentId1)).unwrap();
        const defaultEmail = parentResult?.email || '';
        setParentEmail(defaultEmail);
      } else {
        setParentEmail('');
      }
      
      setSendDialog({ open: true, form });
    } catch (error) {
      console.error('שגיאה בטעינת נתוני הורה:', error);
      setParentEmail('');
      setSendDialog({ open: true, form });
    } finally {
      setLoadingParentEmail(false);
    }
  };

  const confirmSendToParent = async () => {
    if (!sendDialog.form || !parentEmail.trim()) {
      return;
    }

    try {
      setSendingToParent(true);
      
      const response = await axios.post('/ParentForm/send', {
        kidId: selectedKid.id,
        formId: sendDialog.form.formId,
        parentEmail: parentEmail.trim()
      });

      if (response.data.success) {
        setSendDialog({ open: false, form: null });
        setParentEmail('');
        
        alert('הטופס נשלח בהצלחה להורה!');
        
        setTimeout(() => {
          onRefresh && onRefresh();
        }, 1000);
      } else {
        alert('שגיאה בשליחת הטופס');
      }

    } catch (error) {
      console.error('שגיאה בשליחת הטופס:', error);
      alert('שגיאה בשליחת הטופס');
    } finally {
      setSendingToParent(false);
    }
  };

  // Reset form to start
  const handleResetForm = async (form) => {
    try {
      await dispatch(updateFormStatus({
        kidId: selectedKid.id,
        formId: form.formId,
        newStatus: 'NotStarted',
        notes: `אופס בתאריך ${new Date().toLocaleDateString('he-IL')}`
      })).unwrap();

      setTimeout(() => {
        onRefresh && onRefresh();
      }, 1000);

    } catch (error) {
      console.error('שגיאה באיפוס הטופס:', error);
    }
  };

  // Permission checks
  const canEditForm = (form) => {
    return ['NotStarted', 'InProgress'].includes(form.status);
  };

  const canSendToParent = (form) => {
    return ['NotStarted', 'InProgress', 'Completed'].includes(form.status);
  };

  // פונקציה לקבלת צבע הסטטוס
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
      case 'CompletedByParent':
        return 'success';
      case 'InProgress':
        return 'primary';
      case 'SentToParent':
        return 'warning';
      case 'NotStarted':
      default:
        return 'grey';
    }
  };

  // פונקציה לקבלת אייקון הסטטוס
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
      case 'CompletedByParent':
        return <CheckCircleIcon />;
      case 'InProgress':
        return <ScheduleIcon />;
      case 'SentToParent':
        return <EmailIcon />;
      case 'NotStarted':
      default:
        return <PendingIcon />;
    }
  };

  if (!onboardingData || !onboardingData.forms) {
    return (
      <FullScreenContainer>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Alert 
            severity="info"
            sx={{
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
          >
            אין נתוני קליטה זמינים
          </Alert>
        </Container>
      </FullScreenContainer>
    );
  }

  return (
    <FullScreenContainer>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }} dir="rtl">
        {/* General Statistics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={3}>
            <StatCard color="success" size="small">
              <StyledIcon color="success">
                <CheckCircleIcon />
              </StyledIcon>
              <Typography variant="h3" fontWeight="bold" color="success.main">
                {onboardingData.completedForms}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                הושלמו
              </Typography>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={3}>
            <StatCard color="primary" size="small">
              <StyledIcon color="primary">
                <TrendingUpIcon />
              </StyledIcon>
              <Typography variant="h3" fontWeight="bold" color="primary.main">
                {onboardingData.forms.filter(f => f.status === 'InProgress').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                בתהליך
              </Typography>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={3}>
            <StatCard color="warning" size="small">
              <StyledIcon color="warning">
                <EmailIcon />
              </StyledIcon>
              <Typography variant="h3" fontWeight="bold" color="warning.main">
                {onboardingData.forms.filter(f => f.status === 'SentToParent').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                אצל הורים
              </Typography>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={3}>
            <StatCard color="grey" size="small">
              <StyledIcon color="grey">
                <PendingIcon />
              </StyledIcon>
              <Typography variant="h3" fontWeight="bold" color="grey.600">
                {onboardingData.forms.filter(f => f.status === 'NotStarted').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                לא התחילו
              </Typography>
            </StatCard>
          </Grid>
        </Grid>

        {/* New Documents Area */}
        <ContentCard sx={{ mb: 4, p: 3 }}>
          <SectionHeader>
            <AutoAwesomeIcon sx={{ mr: 2, color: '#4cb5c3', fontSize: '1.8rem' }} />
            <Typography variant="h6" fontWeight="600" sx={{ flex: 1 }}>
              מסמכים ותעודות
            </Typography>
            <Chip 
              label="אופציונלי" 
              size="small" 
              color="secondary" 
              sx={{ 
                borderRadius: 2,
                fontWeight: 600
              }} 
            />
          </SectionHeader>
          
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${alpha('#2196f3', 0.3)}`,
              background: `linear-gradient(135deg, ${alpha('#2196f3', 0.1)} 0%, ${alpha('#2196f3', 0.05)} 100%)`,
            }}
          >
            <Typography variant="body2">
              ניתן להעלות מסמכים רלוונטיים לילד (תעודות חיסונים, דוחות רפואיים, תעודות וכו'). 
              העלאת מסמכים היא אופציונלית ולא חוסמת את תהליך הקליטה.
            </Typography>
          </Alert>

          <KidDocumentManager
            kidId={selectedKid?.id}
            kidName={selectedKid ? `${selectedKid.firstName} ${selectedKid.lastName}` : ''}
            compact={true}
            showUpload={true}
            showStats={true}
            maxHeight={400}
          />
        </ContentCard>

        <Divider sx={{ 
          my: 4, 
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          height: 2
        }} />

        {/* Form Cards */}
        <ContentCard sx={{ p: 3 }}>
          <SectionHeader>
            <AssignmentIcon sx={{ mr: 2, color: '#ff7043', fontSize: '1.8rem' }} />
            <Typography variant="h6" fontWeight="600">
              טפסי קליטה
            </Typography>
          </SectionHeader>
          
          <Grid container spacing={3}>
            {onboardingData.forms.map((form) => {
              const progress = form.totalQuestions > 0 
                ? Math.round((form.answeredQuestions / form.totalQuestions) * 100) 
                : 0;

              return (
                <Grid item xs={12} md={6} lg={4} key={form.formId}>
                  <FormCard status={form.status}>
                    <CardContent sx={{ flex: 1, p: 3 }}>
                      {/* Title and Status */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="h3" sx={{ flex: 1, fontWeight: 600 }}>
                          {form.formName}
                        </Typography>
                        <Chip
                          icon={getStatusIcon(form.status)}
                          label={
                            form.status === 'Completed' ? 'הושלם' :
                            form.status === 'CompletedByParent' ? 'הושלם ע"י הורים' :
                            form.status === 'InProgress' ? 'בתהליך' :
                            form.status === 'SentToParent' ? 'נשלח להורים' :
                            'לא התחיל'
                          }
                          size="small"
                          color={getStatusColor(form.status)}
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        />
                      </Box>

                      {/* Description */}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                        {form.formDescription}
                      </Typography>

                      {/* Progress */}
                      {form.status === 'InProgress' && form.totalQuestions > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="600">
                              התקדמות
                            </Typography>
                            <Typography variant="caption" color="primary" fontWeight="bold">
                              {progress}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={progress} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              background: alpha('#2196f3', 0.2),
                              '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
                                borderRadius: 4,
                              }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {form.answeredQuestions} מתוך {form.totalQuestions} שאלות
                          </Typography>
                        </Box>
                      )}

                      {/* Dates */}
                      <Box sx={{ mt: 'auto' }}>
                        {form.startDate && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            התחיל: {new Date(form.startDate).toLocaleDateString('he-IL')}
                          </Typography>
                        )}
                        {form.completedDate && (
                          <Typography variant="caption" color="success.main" display="block" fontWeight="bold">
                            הושלם: {new Date(form.completedDate).toLocaleDateString('he-IL')}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>

                    {/* Actions */}
                    <CardActions sx={{ justifyContent: 'space-between', p: 3, pt: 0 }}>
                      <Box>
                        {/* Buttons for Edit/View */}
                        { canEditForm(form) ? (
                          <AnimatedButton
                            startIcon={<EditIcon />}
                            onClick={() => onFormClick(form, 'edit')}
                            variant="contained"
                            size="small"
                          >
                            {form.status === 'NotStarted' ? 'התחל' : 'המשך עריכה'}
                          </AnimatedButton>
                        ) : (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {(form.formId != '1002' || !form.formName.includes('אישי') )&& (
                              <AnimatedButton
                                startIcon={<ViewIcon />}
                                onClick={() => onFormClick(form, 'view')}
                                variant="outlined"
                                size="small"
                              >
                                צפייה
                              </AnimatedButton>
                            )}
                            {!form.formName.includes('אישור') && (
                              <AnimatedButton
                                startIcon={<EditIcon />}
                                onClick={() => onFormClick(form, 'edit')}
                                variant="contained"
                                size="small"
                              >
                                עריכה
                              </AnimatedButton>
                            )}
                          </Box>
                        )}
                      </Box>
                      
                      <Box>
                        {/* Send to Parent */}
                        {canSendToParent(form) && form.formId != '1002' && (
                          <Tooltip title="שלח טופס להורה">
                            <IconButton
                              onClick={() => handleSendToParent(form)}
                              sx={{
                                background: 'linear-gradient(45deg, #ff7043, #ff8a65)',
                                color: 'white',
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #f4511e, #ff7043)',
                                  transform: 'scale(1.1)',
                                }
                              }}
                            >
                              <SendIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </CardActions>
                  </FormCard>
                </Grid>
              );
            })}
          </Grid>
        </ContentCard>

        {/* Parent Send Dialog */}
        <Dialog 
          open={sendDialog.open} 
          onClose={() => setSendDialog({ open: false, form: null })}
          maxWidth="sm"
          fullWidth
          dir='rtl'
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #4cb5c3, #ff7043)',
            color: 'white',
            fontWeight: 600,
            borderRadius: '16px 16px 0 0'
          }}>
            שליחת טופס להורה
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
              שליחת הטופס "{sendDialog.form?.formName}" להורה של {selectedKid?.firstName}
            </Typography>
            
            {loadingParentEmail && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  טוען פרטי הורה...
                </Typography>
              </Box>
            )}
            
            <TextField
              fullWidth
              label="כתובת דוא״ל של ההורה"
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              margin="normal"
              required
              placeholder="example@email.com"
              helperText="הטופס יישלח עם קישור למילוי אונליין"
              disabled={true}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                }
              }}
            />
            <Alert 
              severity="info" 
              sx={{ 
                mt: 2,
                borderRadius: 3,
                border: `1px solid ${alpha('#2196f3', 0.3)}`,
              }}
            >
              הטופס יישלח להורים באימייל עם קישור למילוי
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 3, background: 'rgba(0,0,0,0.02)' }}>
            <Button 
              onClick={() => setSendDialog({ open: false, form: null })}
              disabled={sendingToParent || loadingParentEmail}
              sx={{ borderRadius: 2 }}
            >
              ביטול
            </Button>
            <AnimatedButton 
              onClick={confirmSendToParent}
              variant="contained"
              disabled={sendingToParent || !parentEmail.trim() || loadingParentEmail}
              startIcon={sendingToParent ? <CircularProgress size={20} /> : <SendIcon />}
            >
              {sendingToParent ? 'שולח...' : 'שלח'}
            </AnimatedButton>
          </DialogActions>
        </Dialog>
      </Container>
    </FullScreenContainer>
  );
};

export default OnboardingDashboard;