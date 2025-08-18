// src/pages/kids/KidProfilePage.jsx - Professional styled version with ALL functionality preserved
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Breadcrumbs,
  Link,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  styled,
  alpha,
  keyframes
} from '@mui/material';
import {
  Home as HomeIcon,
  Group as GroupIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { fetchKidById } from '../../Redux/features/kidsSlice';
import { fetchTreatmentTypes } from '../../Redux/features/treatmentTypesSlice';
import KidProfileTabs from './KidProfileTabs';

// Gradient animation keyframe
const gradientShift = keyframes`
  0% { backgroundPosition: 0% 50%; }
  50% { backgroundPosition: 100% 50%; }
  100% { backgroundPosition: 0% 50%; }
`;

// Pulse animation for loading
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

// Styled Components with professional design
const GradientBackground = styled(Box)(({ theme }) => ({
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
  },
}));

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  position: 'relative',
  zIndex: 1,
}));

const EnhancedBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  '& .MuiBreadcrumbs-separator': {
    color: theme.palette.primary.main,
  },
  '& .MuiBreadcrumbs-li': {
    '& a': {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      padding: '4px 8px',
      borderRadius: 8,
      '&:hover': {
        background: 'rgba(76, 181, 195, 0.1)',
        transform: 'translateY(-2px)',
      }
    }
  }
}));

const StyledLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    '& svg': {
      transform: 'scale(1.2) rotate(10deg)',
    }
  },
  '& svg': {
    marginRight: theme.spacing(0.5),
    fontSize: 'small',
    transition: 'transform 0.3s ease',
  }
}));

const CurrentPage = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontWeight: 700,
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  '& svg': {
    marginRight: theme.spacing(0.5),
    fontSize: 'small',
    color: theme.palette.primary.main,
  }
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  gap: theme.spacing(4),
  padding: theme.spacing(4),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    animation: `${gradientShift} 3s ease infinite`,
  }
}));

const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  '& .MuiCircularProgress-circle': {
    strokeLinecap: 'round',
    stroke: 'url(#circularGradient)',
  },
  animation: `${pulse} 2s ease-in-out infinite`,
}));

const LoadingText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: 600,
  letterSpacing: '0.5px',
  animation: `${pulse} 2s ease-in-out infinite`,
  animationDelay: '0.5s',
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(3),
  fontSize: '1.1rem',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: props => {
      if (props.severity === 'error') {
        return 'linear-gradient(90deg, #ef4444, #dc2626, #ef4444)';
      }
      if (props.severity === 'warning') {
        return 'linear-gradient(90deg, #f59e0b, #d97706, #f59e0b)';
      }
      return 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981)';
    },
  },
  '& .MuiAlert-icon': {
    fontSize: '2rem',
  },
  '& .MuiAlertTitle-root': {
    fontWeight: 700,
    fontSize: '1.3rem',
    marginBottom: theme.spacing(1),
  }
}));

const KidProfilePage = () => {
  const { kidId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux selectors 
  const { selectedKid, status, error } = useSelector(state => state.kids);
  const { treatmentTypes, status: treatmentTypesStatus } = useSelector(state => state.treatmentTypes);

  // Load data on initial load 
  useEffect(() => {
    if (kidId) {
      // fetch Kid By Id
      dispatch(fetchKidById(kidId));
      
      // Loading treatment Types Status 
      if (treatmentTypesStatus === 'idle') {
        dispatch(fetchTreatmentTypes());
      }
    }
  }, [kidId, dispatch, treatmentTypesStatus]);

  // loading state - Enhanced with styled components
  if (status === 'loading') {
    return (
      <GradientBackground>
        <StyledContainer maxWidth="lg">
          <LoadingContainer>
            <svg width="0" height="0">
              <defs>
                <linearGradient id="circularGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4cb5c3" />
                  <stop offset="50%" stopColor="#ff7043" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <StyledCircularProgress size={80} thickness={4} />
            <LoadingText variant="h5">
              🔄 טוען פרטי ילד...
            </LoadingText>
          </LoadingContainer>
        </StyledContainer>
      </GradientBackground>
    );
  }

  // Error handling - Enhanced with styled components
  if (status === 'failed' || error) {
    return (
      <GradientBackground>
        <StyledContainer maxWidth="lg">
          <StyledAlert severity="error">
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              ❌ שגיאה בטעינת פרטי הילד
            </Typography>
            <Typography variant="body1">
              {error || 'לא ניתן לטעון את פרטי הילד כרגע'}
            </Typography>
          </StyledAlert>
        </StyledContainer>
      </GradientBackground>
    );
  }

  // If the child is not found - Enhanced with styled components
  if (status === 'succeeded' && !selectedKid) {
    return (
      <GradientBackground>
        <StyledContainer maxWidth="lg">
          <StyledAlert severity="warning">
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              ⚠️ ילד לא נמצא
            </Typography>
            <Typography variant="body1">
              ילד עם מזהה {kidId} לא קיים במערכת או שאין לך הרשאות לצפות בו
            </Typography>
          </StyledAlert>
        </StyledContainer>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground dir='rtl'>
      <StyledContainer maxWidth="lg">
        {/* Breadcrumbs - Enhanced styling only */}
        <EnhancedBreadcrumbs>
          <StyledLink
            underline="hover"
            onClick={() => navigate('/')}
          >
            <HomeIcon />
            ראשי
          </StyledLink>
          
          <StyledLink
            underline="hover"
            onClick={() => navigate('/kids/list')}
          >
            <GroupIcon />
            רשימת ילדים
          </StyledLink>
          
          <CurrentPage>
            <PersonIcon />
            {selectedKid ? `${selectedKid.firstName} ${selectedKid.lastName}` : 'פרופיל ילד'}
          </CurrentPage>
        </EnhancedBreadcrumbs>

        {/* Page content - the tabs  */}
        {selectedKid && (
          <KidProfileTabs selectedKid={selectedKid} />
        )}
      </StyledContainer>
    </GradientBackground>
  );
};

export default KidProfilePage;