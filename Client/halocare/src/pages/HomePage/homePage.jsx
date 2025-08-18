import { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  styled,
  alpha,
  keyframes
} from '@mui/material';
import {
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import OnboardingSection from './OnboardingSection'
import ClassroomsSection from './ClassroomsSection'
import CalendarSection from './CalendarSection'
import HomePageHeader from './HomePageHeader'

// Professional animations
const gradientShift = keyframes`
  0% { backgroundPosition: 0% 50%; }
  50% { backgroundPosition: 100% 50%; }
  100% { backgroundPosition: 0% 50%; }
`;

const fadeIn = keyframes`
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components
const GradientContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  direction: 'rtl',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 20s ease infinite`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
  }
}));

const StyledGrid = styled(Grid)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  animation: `${fadeIn} 0.8s ease-out`,
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
}));

const LoadingCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  borderRadius: 20,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  animation: `${pulse} 1.5s ease-in-out infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    borderRadius: '20px 20px 0 0',
    animation: `${gradientShift} 3s ease infinite`,
  }
}));

const StyledRefreshIcon = styled(RefreshIcon)(({ theme }) => ({
  fontSize: 48,
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(2),
  animation: `${pulse} 1.5s ease-in-out infinite`,
}));

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Navigation functions - PRESERVED EXACTLY
  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulation of data refresh
    setTimeout(() => {
      setIsLoading(false);
      console.log('Data refreshed');
    }, 1500);
  };

  const handleKidClick = (kidId) => {
    console.log(`Navigate to kid profile: ${kidId}`);
    // Real navigation will be here
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

  return (
    <GradientContainer maxWidth="xl">
      {/* Header */}
      <HomePageHeader onRefresh={handleRefresh} />

      {/* Main Layout - PRESERVED EXACTLY */}
      <StyledGrid container spacing={3}>
        {/* ClassroomsSection */}
        <Grid item size={{sx:12 , lg:12}}>
          <ClassroomsSection 
            onKidClick={handleKidClick}
            onViewAllKids={handleViewAllKids}
          />
        </Grid>

        {/* CalendarSection */}
        <Grid item size={{sx:12 , lg:6}}>
          <CalendarSection 
            onViewFullCalendar={handleViewFullCalendar}
            onEventClick={handleEventClick}
          />
        </Grid>

        {/* OnboardingSection */}
        <Grid item size={{sx:12 , lg:6}}>
          <OnboardingSection 
            onViewFullOnboarding={handleViewFullOnboarding}
            onKidOnboardingClick={handleKidOnboardingClick}
          />
        </Grid>
      </StyledGrid>

      {/* Loading Indicator - Enhanced styling */}
      {isLoading && (
        <LoadingOverlay>
          <LoadingCard elevation={0}>
            <StyledRefreshIcon />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              מרענן נתונים...
            </Typography>
          </LoadingCard>
        </LoadingOverlay>
      )}
    </GradientContainer>
  );
};

export default HomePage;