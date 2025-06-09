// components/kids/OnboardingDashboard.jsx - עדכון מלא
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Button,
  LinearProgress, Alert, AlertTitle, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Paper,
  Divider, List, ListItem, ListItemIcon, ListItemText,
  ListItemButton, Tooltip, IconButton
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Send as SendIcon,
  PlayArrow as StartIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

import {
  startForm,
  completeForm,
  sendFormToParent,
  clearError
} from '../../Redux/features/onboardingSlice';

// Styled Components
const StyledCard = styled(Card)(({ theme, formStatus }) => {
  const getCardStyles = () => {
    switch (formStatus) {
      case 'completed':
      case 'completed_by_parent':
        return {
          borderLeft: `6px solid ${theme.palette.success.main}`,
          backgroundColor: theme.palette.success.light + '10',
        };
      case 'in_progress':
        return {
          borderLeft: `6px solid ${theme.palette.primary.main}`,
          backgroundColor: theme.palette.primary.light + '10',
        };
      case 'sent_to_parent':
        return {
          borderLeft: `6px solid ${theme.palette.info.main}`,
          backgroundColor: theme.palette.info.light + '10',
        };
      default:
        return {
          borderLeft: `6px solid ${theme.palette.grey[300]}`,
          backgroundColor: theme.palette.grey[50],
        };
    }
  };

  return {
    height: '100%',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    ...getCardStyles(),
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
    }
  };
});

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255,255,255,0.1)',
    transform: 'skewY(-12deg) translateY(-50%)',
  }
}));

const OnboardingDashboard = ({ 
  kidId, 
  onboardingData, 
  onFormSelect,
  loading = false 
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [sendDialog, setSendDialog] = useState({ open: false, form: null });
  const { formActions, error } = useSelector(state => state.onboarding);

  if (!onboardingData) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>אין נתוני קליטה</AlertTitle>
        לא נמצא תהליך קליטה עבור ילד זה
      </Alert>
    );
  }

  const { process, forms, stats, reminders } = onboardingData;

  // פונקציות עזר
  const getStatusConfig = (form) => {
    switch (form.status) {
      case 'completed':
        return {
          icon: <CheckIcon />,
          label: 'הושלם',
          color: 'success',
          variant: 'filled'
        };
      case 'completed_by_parent':
        return {
          icon: <CheckIcon />,
          label: 'הושלם ע"י הורה',
          color: 'success',
          variant: 'outlined'
        };
      case 'in_progress':
        return {
          icon: <EditIcon />,
          label: 'בתהליך',
          color: 'primary',
          variant: 'filled'
        };
      case 'sent_to_parent':
        return {
          icon: <EmailIcon />,
          label: 'נשלח להורים',
          color: 'info',
          variant: 'filled'
        };
      default:
        return {
          icon: <ScheduleIcon />,
          label: 'ממתין',
          color: 'default',
          variant: 'outlined'
        };
    }
  };

  const canStartForm = (form) => {
    return form.status === 'not_started' && form.canStart;
  };

  const canEditForm = (form) => {
    return ['not_started', 'in_progress'].includes(form.status) && form.canStart;
  };

  const canSendToParent = (form) => {
    return form.status === 'in_progress' && form.completionPercentage > 0;
  };

  // טיפול בפעולות טפסים
  const handleStartForm = async (form) => {
    try {
      await dispatch(startForm({ kidId, formId: form.formId })).unwrap();
      onFormSelect(form);
    } catch (error) {
      console.error('Error starting form:', error);
    }
  };

  const handleEditForm = (form) => {
    onFormSelect(form);
  };

  const handleSendToParent = (form) => {
    setSendDialog({ open: true, form });
  };

  const confirmSendToParent = async () => {
    if (!sendDialog.form) return;

    try {
      await dispatch(sendFormToParent({
        kidId,
        formId: sendDialog.form.formId
      })).unwrap();

      setSendDialog({ open: false, form: null });
    } catch (error) {
      console.error('Error sending form to parent:', error);
    }
  };

  // קבלת הצבע לפי אחוז השלמה
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'primary';
    if (percentage >= 25) return 'warning';
    return 'error';
  };

  return (
    <Box>
      {/* שגיאות */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
          <AlertTitle>שגיאה</AlertTitle>
          {typeof error === 'string' ? error : error.message || 'שגיאה לא ידועה'}
        </Alert>
      )}

      {/* סטטיסטיקות כלליות */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StatsCard>
            <Typography variant="h3" fontWeight="bold" sx={{ zIndex: 1, position: 'relative' }}>
              {stats.completionPercentage}%
            </Typography>
            <Typography variant="body1" sx={{ zIndex: 1, position: 'relative' }}>
              התקדמות כללית
            </Typography>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              סיכום תהליך
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {stats.completedForms}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    טפסים הושלמו
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary.main">
                    {stats.inProgressForms}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    בתהליך
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="info.main">
                    {stats.sentToParentForms}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    נשלחו להורים
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="text.secondary">
                    {stats.daysInProcess}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ימים בתהליך
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* רשימת טפסים */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        טפסי קליטה
      </Typography>

      <Grid container spacing={3}>
        {forms.map((form) => {
          const statusConfig = getStatusConfig(form);
          
          return (
            <Grid item xs={12} lg={6} key={form.formId}>
              <StyledCard formStatus={form.status}>
                <CardContent>
                  {/* כותרת הטופס */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box flex={1}>
                      <Typography variant="h6" gutterBottom>
                        {form.formName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {form.formDescription}
                      </Typography>
                    </Box>
                    
                    <Chip
                      icon={statusConfig.icon}
                      label={statusConfig.label}
                      color={statusConfig.color}
                      variant={statusConfig.variant}
                      size="small"
                    />
                  </Box>

                  {/* התקדמות */}
                  {form.status !== 'not_started' && (
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          התקדמות
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {form.answeredQuestions}/{form.totalQuestions}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={form.completionPercentage}
                        color={getProgressColor(form.completionPercentage)}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}

                  {/* מידע נוסף */}
                  {(form.assignedToName || form.notes) && (
                    <Box sx={{ mb: 2 }}>
                      {form.assignedToName && (
                        <Typography variant="body2" color="text.secondary">
                          <PersonIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          אחראי: {form.assignedToName}
                        </Typography>
                      )}
                      {form.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          <InfoIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          {form.notes}
                        </Typography>
                      )}
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* כפתורי פעולה */}
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {/* התחל/ערוך טופס */}
                    {canEditForm(form) && (
                      <Button
                        variant={form.status === 'not_started' ? 'contained' : 'outlined'}
                        size="small"
                        startIcon={form.status === 'not_started' ? <StartIcon /> : <EditIcon />}
                        onClick={() => form.status === 'not_started' ? handleStartForm(form) : handleEditForm(form)}
                        disabled={formActions.starting}
                      >
                        {form.status === 'not_started' ? 'התחל' : 'ערוך'}
                      </Button>
                    )}

                    {/* שלח להורים */}
                    {canSendToParent(form) && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<SendIcon />}
                        onClick={() => handleSendToParent(form)}
                        disabled={formActions.sendingToParent}
                      >
                        שלח להורים
                      </Button>
                    )}

                    {/* צפייה (לטפסים שהושלמו) */}
                    {['completed', 'completed_by_parent'].includes(form.status) && (
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<InfoIcon />}
                        onClick={() => handleEditForm(form)}
                      >
                        צפייה
                      </Button>
                    )}

                    {/* אינדיקטור אם הטופס לא יכול להתחיל */}
                    {form.status === 'not_started' && !form.canStart && (
                      <Tooltip title="יש להשלים תחילה את הטופס הראשון">
                        <IconButton size="small" disabled>
                          <WarningIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          );
        })}
      </Grid>

      {/* תזכורות פעילות */}
      {reminders && reminders.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            תזכורות פעילות
          </Typography>
          <Paper sx={{ borderRadius: 2 }}>
            <List>
              {reminders.slice(0, 5).map((reminder, index) => (
                <React.Fragment key={reminder.reminderId}>
                  <ListItem>
                    <ListItemIcon>
                      <ScheduleIcon color={reminder.isOverdue ? 'error' : 'primary'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={reminder.title}
                      secondary={
                        <Box>
                          {reminder.description && (
                            <Typography variant="body2" color="text.secondary">
                              {reminder.description}
                            </Typography>
                          )}
                          {reminder.dueDate && (
                            <Typography 
                              variant="caption" 
                              color={reminder.isOverdue ? 'error' : 'text.secondary'}
                            >
                              יעד: {new Date(reminder.dueDate).toLocaleDateString('he-IL')}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < Math.min(reminders.length, 5) - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      {/* דיאלוג שליחה להורים */}
      <Dialog
        open={sendDialog.open}
        onClose={() => setSendDialog({ open: false, form: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          שליחת טופס להורים
        </DialogTitle>
        <DialogContent>
          <Typography paragraph>
            האם אתה בטוח שברצונך לשלוח את הטופס "{sendDialog.form?.formName}" להורים?
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            הטופס יישלח להורים באימייל/SMS עם קישור למילוי
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setSendDialog({ open: false, form: null })}
            disabled={formActions.sendingToParent}
          >
            ביטול
          </Button>
          <Button 
            onClick={confirmSendToParent}
            variant="contained"
            disabled={formActions.sendingToParent}
            startIcon={formActions.sendingToParent ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {formActions.sendingToParent ? 'שולח...' : 'שלח'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OnboardingDashboard;