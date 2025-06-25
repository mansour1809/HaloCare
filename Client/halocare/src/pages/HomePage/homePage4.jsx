import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Stack,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  AccessTime as TimeIcon,
  Groups as GroupsIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';

// =============================================================================
// קומפוננטת כותרת ראשית
// =============================================================================
const HomePageHeader = ({ onRefresh }) => {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const date = new Date().toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCurrentDate(date);
  }, []);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 3,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            color="primary.main"
            sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}
          >
            👋 ברוכה הבאה, מנהלת הגן
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            📅 {currentDate} • מעקב ובקרה יומית
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={3} alignItems="center">
          {/* סטטיסטיקות מהירות */}
          <Stack direction="row" spacing={3}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" color="success.main">15/18</Typography>
              <Typography variant="caption" color="text.secondary">נוכחות היום</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" color="primary.main">12</Typography>
              <Typography variant="caption" color="text.secondary">אירועים היום</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" color="warning.main">5</Typography>
              <Typography variant="caption" color="text.secondary">בתהליך קליטה</Typography>
            </Box>
          </Stack>
          
          <Tooltip title="רענון נתונים">
            <IconButton 
              onClick={onRefresh}
              color="primary"
              sx={{ 
                bgcolor: 'primary.light',
                '&:hover': { bgcolor: 'primary.main', color: 'white' }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
};

// =============================================================================
// קומפוננטת תצוגת כיתות
// =============================================================================
const ClassroomsSection = ({ onKidClick, onViewAllKids }) => {
  const classesData = [
    {
      id: 1,
      name: "כיתת הפרפרים",
      icon: "🦋",
      teacher: "רותי כהן",
      kids: [
        { id: 7, name: "דני כהן", initial: "ד", isPresent: true },
        { id: 8, name: "מיה לוי", initial: "מ", isPresent: true },
        { id: 9, name: "נועם אבני", initial: "נ", isPresent: false },
        { id: 10, name: "תמר משה", initial: "ת", isPresent: true },
        { id: 11, name: "יוסף דוד", initial: "י", isPresent: true },
        { id: 12, name: "שרה בן שמעון", initial: "ש", isPresent: true },
        { id: 13, name: "אור גרין", initial: "א", isPresent: true },
        { id: 14, name: "עדן סימון", initial: "ע", isPresent: false },
        { id: 15, name: "רון אליהו", initial: "ר", isPresent: true }
      ]
    },
    {
      id: 2,
      name: "כיתת הדבורים",
      icon: "🐝",
      teacher: "מירי שלום",
      kids: [
        { id: 16, name: "ליה זוהר", initial: "ל", isPresent: true },
        { id: 17, name: "גיל כץ", initial: "ג", isPresent: true },
        { id: 18, name: "טל בר", initial: "ט", isPresent: true },
        { id: 19, name: "רועי נחמני", initial: "ר", isPresent: false },
        { id: 20, name: "מעיין שמיר", initial: "מ", isPresent: true },
        { id: 21, name: "איתי פרץ", initial: "א", isPresent: true },
        { id: 22, name: "נגה רוזן", initial: "נ", isPresent: true },
        { id: 23, name: "אביב חן", initial: "א", isPresent: true },
        { id: 24, name: "יעל גולד", initial: "י", isPresent: true }
      ]
    }
  ];

  const ClassCard = ({ classData }) => {
    const presentKids = classData.kids.filter(kid => kid.isPresent).length;
    const absentKids = classData.kids.length - presentKids;

    return (
      <Card 
        elevation={2}
        sx={{ 
          height: '100%',
          transition: 'all 0.3s ease',
          '&:hover': { 
            transform: 'translateY(-4px)',
            boxShadow: 4 
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* כותרת כיתה */}
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                width: 50,
                height: 50,
                fontSize: '1.5rem'
              }}
            >
              {classData.icon}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">{classData.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                גננת: {classData.teacher}
              </Typography>
            </Box>
          </Stack>

          {/* תמונות ילדים */}
          <Grid container spacing={1} mb={2}>
            {classData.kids.map((kid) => (
              <Grid item key={kid.id}>
                <Tooltip title={`${kid.name} - ${kid.isPresent ? 'נוכח' : 'נעדר'}`}>
                  <Avatar
                    onClick={() => onKidClick(kid.id)}
                    sx={{
                      width: 45,
                      height: 45,
                      cursor: 'pointer',
                      bgcolor: kid.isPresent ? 'success.main' : 'error.main',
                      opacity: kid.isPresent ? 1 : 0.6,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: 2
                      },
                      position: 'relative'
                    }}
                  >
                    {kid.initial}
                  </Avatar>
                </Tooltip>
              </Grid>
            ))}
          </Grid>

          {/* סטטיסטיקות */}
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" justifyContent="space-around">
            <Box textAlign="center">
              <Typography variant="h6" color="success.main" fontWeight="bold">
                {presentKids}
              </Typography>
              <Typography variant="caption">נוכחים</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" color="error.main" fontWeight="bold">
                {absentKids}
              </Typography>
              <Typography variant="caption">נעדרים</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                {classData.kids.length}
              </Typography>
              <Typography variant="caption">סה"כ</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
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
            <SchoolIcon color="primary" />
            <Typography variant="h5" fontWeight="bold">
              כיתות הגן
            </Typography>
          </Stack>
          <Button
            variant="contained"
            size="small"
            startIcon={<GroupsIcon />}
            onClick={onViewAllKids}
          >
            כל הילדים
          </Button>
        </Stack>
      </Box>
      
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {classesData.map((classData) => (
            <Grid item xs={12} md={6} key={classData.id}>
              <ClassCard classData={classData} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

// =============================================================================
// קומפוננטת יומן
// =============================================================================
const CalendarSection = ({ onViewFullCalendar, onEventClick }) => {
  const todayEvents = [
    {
      id: 1,
      time: "09:00",
      title: "טיפול פיזיותרפיה - דני כהן",
      type: "פיזיותרפיה",
      location: "חדר 1",
      therapist: "רותי כהן",
      color: "#7AC7D7"
    },
    {
      id: 2,
      time: "10:30",
      title: "טיפול רגשי - מיה לוי",
      type: "טיפול רגשי",
      location: "חדר 2",
      therapist: "מירי שלום",
      color: "#8FD3C3"
    },
    {
      id: 3,
      time: "11:15",
      title: "ריפוי בעיסוק - תמר משה",
      type: "ריפוי בעיסוק",
      location: "חדר 3",
      therapist: "שרה לוי",
      color: "#FF9F9F"
    },
    {
      id: 4,
      time: "14:00",
      title: "פגישה עם משפחת אבני",
      type: "פגישת הורים",
      location: "משרד המנהלת",
      therapist: "מנהלת הגן",
      color: "#93CE85"
    },
    {
      id: 5,
      time: "15:30",
      title: "ישיבת צוות שבועית",
      type: "ישיבת צוות",
      location: "חדר הישיבות",
      therapist: "כל הצוות",
      color: "#DEC49F"
    }
  ];

  const today = new Date();
  const dayNumber = today.getDate();
  const monthName = today.toLocaleDateString('he-IL', { month: 'long' });

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
            <CalendarIcon color="primary" />
            <Typography variant="h5" fontWeight="bold">
              יומן היום
            </Typography>
          </Stack>
          <Button
            variant="contained"
            size="small"
            startIcon={<ViewIcon />}
            onClick={onViewFullCalendar}
          >
            יומן מלא
          </Button>
        </Stack>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {/* לוח תאריך מיני */}
        <Paper 
          elevation={1}
          sx={{ 
            p: 2,
            mb: 3,
            textAlign: 'center',
            bgcolor: 'grey.50'
          }}
        >
          <Typography variant="h3" fontWeight="bold" color="primary.main">
            {dayNumber}
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={1}>
            יום רביעי, {monthName}
          </Typography>
          <Chip 
            label={`${todayEvents.length} אירועים מתוכננים`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Paper>

        {/* רשימת אירועים */}
        <Stack spacing={1.5} sx={{ maxHeight: 350, overflow: 'auto' }}>
          {todayEvents.map((event) => (
            <Paper
              key={event.id}
              elevation={1}
              sx={{
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateX(-4px)',
                  boxShadow: 2,
                  borderRight: 3,
                  borderColor: 'primary.main'
                }
              }}
              onClick={() => onEventClick(event.id)}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Chip
                  label={event.time}
                  size="small"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
                <Chip
                  label={event.type}
                  size="small"
                  sx={{
                    bgcolor: event.color,
                    color: 'white'
                  }}
                />
              </Stack>
              <Typography variant="subtitle2" fontWeight="bold" mb={0.5}>
                {event.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {event.location} • {event.therapist}
              </Typography>
            </Paper>
          ))}
        </Stack>

        <Box textAlign="center" mt={2}>
          <Button
            variant="outlined"
            size="small"
            onClick={onViewFullCalendar}
          >
            עוד {Math.max(0, 7)} אירועים...
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// =============================================================================
// קומפוננטת מצב קליטה
// =============================================================================
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

// =============================================================================
// קומפוננטת מעקב טיפולים
// =============================================================================
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
          <Grid item xs={6}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {completed}
              </Typography>
              <Typography variant="caption">סיכומים נוספו</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
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

// =============================================================================
// קומפוננטה ראשית
// =============================================================================
const HomePage4 = () => {
  const [isLoading, setIsLoading] = useState(false);

  // פונקציות ניתוב
  const handleRefresh = async () => {
    setIsLoading(true);
    // סימולציה של רענון נתונים
    setTimeout(() => {
      setIsLoading(false);
      console.log('Data refreshed');
    }, 1500);
  };

  const handleKidClick = (kidId) => {
    console.log(`Navigate to kid profile: ${kidId}`);
    // כאן יהיה ניתוב אמיתי
  };

  const handleViewAllKids = () => {
    console.log('Navigate to kids list');
  };

  const handleViewFullCalendar = () => {
    console.log('Navigate to full calendar');
  };

  const handleEventClick = (eventId) => {
    console.log(`Navigate to event details: ${eventId}`);
  };

  const handleViewFullOnboarding = () => {
    console.log('Navigate to full onboarding management');
  };

  const handleKidOnboardingClick = (kidId) => {
    console.log(`Navigate to kid onboarding: ${kidId}`);
  };

  const handleViewAllTreatments = () => {
    console.log('Navigate to all treatments');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3, direction: 'rtl' }}>
      {/* כותרת ראשית */}
      <HomePageHeader onRefresh={handleRefresh} />

      {/* לייאוט ראשי */}
      <Grid container spacing={3}>
        {/* עמודה ראשית - כיתות */}
        <Grid item xs={12} lg={8}>
          <ClassroomsSection 
            onKidClick={handleKidClick}
            onViewAllKids={handleViewAllKids}
          />
        </Grid>

        {/* עמודה ימנית - יומן */}
        <Grid item xs={12} lg={4}>
          <CalendarSection 
            onViewFullCalendar={handleViewFullCalendar}
            onEventClick={handleEventClick}
          />
        </Grid>

        {/* שורה תחתונה - קליטה וטיפולים */}
        <Grid item xs={12} lg={6}>
          <OnboardingSection 
            onViewFullOnboarding={handleViewFullOnboarding}
            onKidOnboardingClick={handleKidOnboardingClick}
          />
        </Grid>

        <Grid item xs={12} lg={6}>
          <TreatmentsSection 
            onViewAllTreatments={handleViewAllTreatments}
          />
        </Grid>
      </Grid>

      {/* אינדיקטור טעינה */}
      {isLoading && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(0,0,0,0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={9999}
        >
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <RefreshIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6">מרענן נתונים...</Typography>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default HomePage4;