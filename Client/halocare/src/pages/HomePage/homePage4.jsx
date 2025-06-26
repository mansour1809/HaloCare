
import  { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import TreatmentsSection from './TreatmentsSection'
import OnboardingSection from './OnboardingSection'
import ClassroomsSection from './ClassroomsSection'
import CalendarSection from './CalendarSection'
import HomePageHeader from './HomePageHeader'

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
        <Grid item size={{sx:12 , lg:12}}>
          <ClassroomsSection 
            onKidClick={handleKidClick}
            onViewAllKids={handleViewAllKids}
          />
        </Grid>

        {/* עמודה ימנית - יומן */}
        <Grid item size={{sx:12 , lg:4}}>
          <CalendarSection 
            onViewFullCalendar={handleViewFullCalendar}
            onEventClick={handleEventClick}
          />
        </Grid>

        {/* שורה תחתונה - קליטה וטיפולים */}
        <Grid item size={{sx:12 , lg:6}}>
          <OnboardingSection 
            onViewFullOnboarding={handleViewFullOnboarding}
            onKidOnboardingClick={handleKidOnboardingClick}
          />
        </Grid>

        <Grid item size={{sx:12 , lg:6}}>
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