// src/pages/kids/OnboardingDashboard.jsx
import React from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Chip, Button,
  LinearProgress, IconButton, Tooltip, Paper, Divider
} from '@mui/material';
import {
  CheckCircle as CompleteIcon,
  PlayArrow as StartIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Schedule as PendingIcon,
  Assignment as FormIcon,
  Email as EmailIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';

const FormCard = ({ form, onAction, disabled = false }) => {
  const getStatusConfig = () => {
    switch (form.status) {
      case 'completed':
        return {
          color: 'success',
          icon: <CompleteIcon />,
          label: 'הושלם',
          bgColor: '#e8f5e8',
          borderColor: '#4caf50'
        };
      case 'in_progress':
        return {
          color: 'warning',
          icon: <EditIcon />,
          label: 'בתהליך',
          bgColor: '#fff3e0',
          borderColor: '#ff9800'
        };
      case 'sent_to_parent':
        return {
          color: 'info',
          icon: <EmailIcon />,
          label: 'נשלח להורים',
          bgColor: '#e3f2fd',
          borderColor: '#2196f3'
        };
      case 'returned_from_parent':
        return {
          color: 'secondary',
          icon: <BackIcon />,
          label: 'חזר מההורים',
          bgColor: '#f3e5f5',
          borderColor: '#9c27b0'
        };
      default:
        return {
          color: 'default',
          icon: <PendingIcon />,
          label: 'ממתין',
          bgColor: '#f5f5f5',
          borderColor: '#e0e0e0'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const progress = form.totalQuestions > 0 ? (form.answeredQuestions / form.totalQuestions) * 100 : 0;

  const getActionButton = () => {
    switch (form.status) {
      case 'completed':
        return (
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onAction('edit', form.formId)}
            disabled={disabled}
          >
            עריכה
          </Button>
        );
      case 'in_progress':
        return (
          <Button
            variant="contained"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onAction('continue', form.formId)}
            disabled={disabled}
          >
            המשך
          </Button>
        );
      case 'not_started':
        return (
          <Button
            variant="contained"
            size="small"
            startIcon={<StartIcon />}
            onClick={() => onAction('start', form.formId)}
            disabled={disabled || (form.isFirstStep === false && !isFirstStepCompleted())}
          >
            התחל
          </Button>
        );
      default:
        return (
          <Button
            variant="outlined"
            size="small"
            startIcon={<FormIcon />}
            onClick={() => onAction('view', form.formId)}
            disabled={disabled}
          >
            צפייה
          </Button>
        );
    }
  };

  // בדיקה אם השלב הראשון הושלם (רק עבור טפסים שאינם הראשונים)
  const isFirstStepCompleted = () => {
    // זה יצריך access לרשימת הטפסים הכללית - נעביר דרך props
    return true; // לעת עתה
  };

  return (
    <Card
      sx={{
        height: '100%',
        border: `2px solid ${statusConfig.borderColor}`,
        backgroundColor: statusConfig.bgColor,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent>
        {/* כותרת הטופס */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              {form.formName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {form.formDescription}
            </Typography>
          </Box>
          
          <Chip
            icon={statusConfig.icon}
            label={statusConfig.label}
            color={statusConfig.color}
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        {/* התקדמות */}
        {form.totalQuestions > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                התקדמות:
              </Typography>
              <Typography variant="body2" color="text.primary" fontWeight="bold">
                {form.answeredQuestions}/{form.totalQuestions} שאלות
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4
                }
              }}
            />
          </Box>
        )}

        {/* תאריכים */}
        <Box sx={{ mb: 2 }}>
          {form.completedAt && (
            <Typography variant="caption" color="success.main" display="block">
              הושלם: {new Date(form.completedAt).toLocaleDateString('he-IL')}
            </Typography>
          )}
          {form.sentToParentAt && (
            <Typography variant="caption" color="info.main" display="block">
              נשלח: {new Date(form.sentToParentAt).toLocaleDateString('he-IL')}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* כפתורי פעולה */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {getActionButton()}
          
          {/* כפתור שליחה להורים - רק לטפסים שהושלמו */}
          {(form.status === 'completed' || form.status === 'in_progress') && (
            <Tooltip title="שלח טופס להורים">
              <IconButton
                size="small"
                onClick={() => onAction('sendToParent', form.formId)}
                disabled={disabled}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': { backgroundColor: 'primary.dark' }
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const OnboardingDashboard = ({ 
  onboardingProcess, 
  onFormAction, 
  loading = false 
}) => {
  if (!onboardingProcess || !onboardingProcess.forms) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          לא נמצא תהליך קליטה פעיל
        </Typography>
      </Paper>
    );
  }

  const { forms, completionPercentage, processStatus } = onboardingProcess;

  return (
    <Box>
      {/* סיכום כללי */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            תהליך קליטה
          </Typography>
          <Chip
            label={`${completionPercentage}% הושלם`}
            color={completionPercentage === 100 ? 'success' : 'primary'}
            variant="filled"
            sx={{ fontWeight: 'bold', fontSize: '1rem', px: 2 }}
          />
        </Box>
        
        <LinearProgress
          variant="determinate"
          value={completionPercentage}
          sx={{
            height: 12,
            borderRadius: 6,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 6
            }
          }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {forms.filter(f => f.status === 'completed' || f.status === 'returned_from_parent').length} מתוך {forms.length} טפסים הושלמו
          </Typography>
          <Typography variant="body2" color="text.secondary">
            סטטוס: {processStatus === 'Completed' ? 'הושלם' : processStatus === 'InProgress' ? 'בתהליך' : 'לא התחיל'}
          </Typography>
        </Box>
      </Paper>

      {/* רשת הטפסים */}
      <Grid container spacing={3}>
        {forms
          .sort((a, b) => a.formOrder - b.formOrder)
          .map((form) => (
            <Grid item xs={12} sm={6} md={4} key={form.formId}>
              <FormCard
                form={form}
                onAction={onFormAction}
                disabled={loading}
              />
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};

export default OnboardingDashboard;