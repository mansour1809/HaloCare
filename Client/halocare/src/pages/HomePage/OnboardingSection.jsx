import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

const OnboardingSection = ({ onViewFullOnboarding, onKidOnboardingClick }) => {
  const onboardingData = [
    {
      kidId: 7,
      kidName: "דני כהן",
      progress: 85,
      completed: 5,
      total: 6,
      missing: "ביקור בית"
    },
    {
      kidId: 16,
      kidName: "ליה זוהר",
      progress: 67,
      completed: 4,
      total: 6,
      missing: "בריאות + אישורים"
    },
    {
      kidId: 9,
      kidName: "נועם אבני",
      progress: 33,
      completed: 2,
      total: 6,
      missing: "דורש מעקב דחוף"
    }
  ];

  const stats = {
    completed: 8,
    inProgress: 5,
    needsAttention: 2
  };

  return (
    <Card elevation={3} sx={{ height: '100%' }}>
      <Box 
        sx={{ 
          p: 2.5,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <AssignmentIcon color="primary" />
            <Typography variant="h5" fontWeight="bold">
              מצב קליטה
            </Typography>
          </Stack>
          <Button
            variant="contained"
            size="small"
            startIcon={<ViewIcon />}
            onClick={onViewFullOnboarding}
          >
            ניהול מלא
          </Button>
        </Stack>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {/* סטטיסטיקות עליונות */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={4}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {stats.completed}
              </Typography>
              <Typography variant="caption">הושלמו</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" color="warning.main">
                {stats.inProgress}
              </Typography>
              <Typography variant="caption">בתהליך</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" color="error.main">
                {stats.needsAttention}
              </Typography>
              <Typography variant="caption">דורשים תשומת לב</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* רשימת ילדים */}
        <Stack spacing={2}>
          {onboardingData.map((kid) => (
            <Paper
              key={kid.kidId}
              elevation={1}
              sx={{
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateX(-4px)',
                  boxShadow: 2
                }
              }}
              onClick={() => onKidOnboardingClick(kid.kidId)}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {kid.kidName}
                </Typography>
                <Chip
                  label={`${kid.progress}%`}
                  size="small"
                  color="primary"
                />
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={kid.progress} 
                sx={{ mb: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                {kid.completed}/{kid.total} טפסים הושלמו • חסר: {kid.missing}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default OnboardingSection;