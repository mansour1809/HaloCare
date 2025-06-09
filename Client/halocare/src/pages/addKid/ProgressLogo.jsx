// components/kids/ProgressLogo.jsx - עדכון מלא
import React from 'react';
import { Box, Typography, Paper, Grid, Chip, LinearProgress } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

// Container עיקרי
const IntegratedContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  marginBottom: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

// אזור הלוגו
const LogoArea = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '150px',
  height: '134px',
  marginBottom: '-10px',
  zIndex: 2,
}));

// מעטפת ה-SVG
const LogoWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'visible',
}));

// SVG המלא (רקע אפור)
const LogoOutline = styled('svg')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 1,
}));

// SVG המתמלא (צבעוני)
const LogoFill = styled('svg')(({ progress, theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 2,
  clipPath: `inset(${100 - progress}% 0 0 0)`,
  transition: 'clip-path 0.8s ease-in-out',
}));

// אזור המידע תחת הלוגו
const InfoArea = styled(Paper)(({ theme, compact }) => ({
  width: '100%',
  maxWidth: compact ? '500px' : '800px',
  padding: theme.spacing(compact ? 2 : 3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
  boxShadow: theme.shadows[4],
  zIndex: 1,
}));

// רכיב הלוגו עצמו
const LogoSVG = ({ progress, theme }) => {
  const gradientColor = progress >= 75 ? '#4caf50' : progress >= 50 ? '#2196f3' : progress >= 25 ? '#ff9800' : '#f44336';

  return (
    <>
      {/* רקע אפור - קווי המתאר */}
      <LogoOutline>
        <defs>
          <linearGradient id="grayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0e0e0" />
            <stop offset="100%" stopColor="#bdbdbd" />
          </linearGradient>
        </defs>
        
        {/* צורת הלוגו - ניתן להתאים לפי הלוגו הארגוני */}
        <rect width="140" height="120" x="5" y="7" rx="15" fill="url(#grayGradient)" stroke="#9e9e9e" strokeWidth="2"/>
        <circle cx="75" cy="45" r="20" fill="#f5f5f5" stroke="#9e9e9e" strokeWidth="2"/>
        <rect width="80" height="8" x="30" y="75" rx="4" fill="#f5f5f5" stroke="#9e9e9e" strokeWidth="1"/>
        <rect width="60" height="6" x="40" y="90" rx="3" fill="#f5f5f5" stroke="#9e9e9e" strokeWidth="1"/>
        <rect width="70" height="6" x="35" y="102" rx="3" fill="#f5f5f5" stroke="#9e9e9e" strokeWidth="1"/>
      </LogoOutline>

      {/* מילוי צבעוני */}
      <LogoFill progress={progress}>
        <defs>
          <linearGradient id="colorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColor} />
            <stop offset="100%" stopColor={gradientColor + '80'} />
          </linearGradient>
        </defs>
        
        <rect width="140" height="120" x="5" y="7" rx="15" fill="url(#colorGradient)" stroke={gradientColor} strokeWidth="2"/>
        <circle cx="75" cy="45" r="20" fill="white" stroke={gradientColor} strokeWidth="2"/>
        <rect width="80" height="8" x="30" y="75" rx="4" fill="white" stroke={gradientColor} strokeWidth="1"/>
        <rect width="60" height="6" x="40" y="90" rx="3" fill="white" stroke={gradientColor} strokeWidth="1"/>
        <rect width="70" height="6" x="35" y="102" rx="3" fill="white" stroke={gradientColor} strokeWidth="1"/>
      </LogoFill>
    </>
  );
};

const ProgressLogo = ({ 
  onboardingData, 
  kidName, 
  showFormsSummary = true, 
  compact = false 
}) => {
  const theme = useTheme();

  if (!onboardingData) {
    return null;
  }

  const { process, stats, forms } = onboardingData;
  const progress = stats.completionPercentage || 0;

  // קבלת הטופס הבא המומלץ
  const nextRecommendedForm = stats.nextRecommendedForm;

  // פונקציה לקבלת צבע סטטוס
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'completed_by_parent':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'sent_to_parent':
        return 'info';
      default:
        return 'default';
    }
  };

  // פונקציה לקבלת אייקון סטטוס
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'completed_by_parent':
        return <CheckIcon />;
      case 'in_progress':
        return <EditIcon />;
      case 'sent_to_parent':
        return <EmailIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  return (
    <IntegratedContainer>
      {/* הלוגו */}
      <LogoArea>
        <LogoWrapper>
          <LogoSVG progress={progress} theme={theme} />
          
          {/* טקסט האחוזים במרכז */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 3,
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              color="primary.main"
              sx={{ lineHeight: 1 }}
            >
              {progress}%
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.7rem' }}
            >
              הושלם
            </Typography>
          </Box>
        </LogoWrapper>
      </LogoArea>

      {/* אזור המידע */}
      <InfoArea compact={compact}>
        {/* שם הילד ופרטי התהליך */}
        <Box textAlign="center" mb={compact ? 1 : 2}>
          <Typography variant={compact ? "h6" : "h5"} fontWeight="bold" gutterBottom>
            {kidName || 'תהליך קליטה'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            התחיל ב: {new Date(process.startDate).toLocaleDateString('he-IL')} • 
            {stats.daysInProcess} ימים בתהליך
          </Typography>
        </Box>

        {/* פרוגרס בר כללי */}
        <Box mb={compact ? 1 : 2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" fontWeight="medium">
              התקדמות כללית
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {stats.completedForms}/{stats.totalForms} טפסים
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            color={progress >= 75 ? 'success' : progress >= 50 ? 'primary' : 'warning'}
            sx={{ 
              height: compact ? 6 : 8, 
              borderRadius: 4,
              backgroundColor: 'grey.200'
            }}
          />
        </Box>

        {/* סיכום טפסים - רק במצב מלא */}
        {showFormsSummary && !compact && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h6" color="success.main" fontWeight="bold">
                  {stats.completedForms}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  הושלמו
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  {stats.inProgressForms}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  בתהליך
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h6" color="info.main" fontWeight="bold">
                  {stats.sentToParentForms}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  אצל הורים
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h6" color="text.secondary" fontWeight="bold">
                  {stats.notStartedForms}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ממתינים
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}

        {/* הטופס הבא המומלץ */}
        {nextRecommendedForm && (
          <Box 
            sx={{ 
              bgcolor: 'primary.light', 
              color: 'primary.contrastText',
              p: compact ? 1 : 1.5, 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <TrendingUpIcon fontSize="small" />
            <Box flex={1}>
              <Typography variant="body2" fontWeight="medium">
                הטופס הבא: {nextRecommendedForm.formName}
              </Typography>
              {!compact && (
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {nextRecommendedForm.formDescription}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* סטטוס התהליך */}
        <Box display="flex" justifyContent="center" mt={compact ? 1 : 2}>
          <Chip
            label={
              process.processStatus === 'Completed' ? 'תהליך הושלם' :
              process.processStatus === 'InProgress' ? 'בתהליך' : 'טרם החל'
            }
            color={
              process.processStatus === 'Completed' ? 'success' :
              process.processStatus === 'InProgress' ? 'primary' : 'default'
            }
            variant="filled"
            icon={
              process.processStatus === 'Completed' ? <CheckIcon /> :
              process.processStatus === 'InProgress' ? <EditIcon /> : <ScheduleIcon />
            }
          />
        </Box>
      </InfoArea>
    </IntegratedContainer>
  );
};

export default ProgressLogo;