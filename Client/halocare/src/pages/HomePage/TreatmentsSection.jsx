import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Stack,
  Paper,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

const TreatmentsSection = ({ onViewAllTreatments }) => {
  const treatmentChecks = [
    {
      kidId: 7,
      kidName: "דני כהן",
      treatment: "פיזיותרפיה - 09:00",
      hasReport: true,
      details: "סיכום נוסף"
    },
    {
      kidId: 8,
      kidName: "מיה לוי",
      treatment: "טיפול רגשי - 10:30",
      hasReport: false,
      details: "ממתין לסיכום"
    },
    {
      kidId: 10,
      kidName: "תמר משה",
      treatment: "ריפוי בעיסוק - 11:15",
      hasReport: true,
      details: "סיכום נוסף"
    },
    {
      kidId: 11,
      kidName: "יוסף דוד",
      treatment: "פיזיותרפיה - אתמול",
      hasReport: false,
      details: "ממתין לסיכום"
    },
    {
      kidId: 12,
      kidName: "שרה בן שמעון",
      treatment: "טיפול תזונתי - אתמול",
      hasReport: false,
      details: "ממתין לסיכום"
    }
  ];

  const completed = treatmentChecks.filter(t => t.hasReport).length;
  const missing = treatmentChecks.filter(t => !t.hasReport).length;

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
            <HospitalIcon color="primary" />
            <Typography variant="h5" fontWeight="bold">
              מעקב סיכומי טיפול
            </Typography>
          </Stack>
          <Button
            variant="contained"
            size="small"
            startIcon={<ViewIcon />}
            onClick={onViewAllTreatments}
          >
            כל הטיפולים
          </Button>
        </Stack>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {/* סטטיסטיקות עליונות */}
        <Grid container spacing={2} mb={3}>
          <Grid item size={{xs:6}}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {completed}
              </Typography>
              <Typography variant="caption">סיכומים נוספו</Typography>
            </Paper>
          </Grid>
          <Grid item size={{xs:6}}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" color="error.main">
                {missing}
              </Typography>
              <Typography variant="caption">ממתינים לסיכום</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* רשימת בדיקות טיפול */}
        <Stack spacing={1.5} sx={{ maxHeight: 280, overflow: 'auto' }}>
          {treatmentChecks.map((check, index) => (
            <Paper
              key={index}
              elevation={1}
              sx={{
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                border: 1,
                borderColor: check.hasReport ? 'success.light' : 'error.light',
                bgcolor: check.hasReport ? 'success.lighter' : 'error.lighter'
              }}
            >
              <Avatar
                sx={{
                  width: 35,
                  height: 35,
                  bgcolor: check.hasReport ? 'success.main' : 'error.main',
                  fontSize: '0.9rem'
                }}
              >
                {check.hasReport ? <CheckIcon /> : <WarningIcon />}
              </Avatar>
              <Box flex={1}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {check.kidName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {check.treatment} • {check.details}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TreatmentsSection;