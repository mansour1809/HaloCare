import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  CircularProgress, 
  Alert,
  Container,
  styled,
  alpha,
  Fade,
  Typography,
  Paper,
  keyframes
} from '@mui/material';
import { fetchTreatmentsByKid } from '../../../Redux/features/treatmentsSlice';
import { fetchKidById } from '../../../Redux/features/kidsSlice';

// Sub components
import TreatmentsHeader from './TreatmentsHeader';
import TreatmentsFilters from './TreatmentsFilters';
import TreatmentsTable from './TreatmentsTable';
import TreatmentViewDialog from './TreatmentViewDialog';
import AddTreatmentDialog from './AddTreatmentDialog';

// Professional animations
const gradientShift = keyframes`
  0% { backgroundPosition: 0% 50%; }
  50% { backgroundPosition: 100% 50%; }
  100% { backgroundPosition: 0% 50%; }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
  100% { transform: scale(1); opacity: 1; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Enhanced Styled Components with professional design
const FullScreenContainer = styled(Box)(() => ({
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
    zIndex: 1,
  }
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const LoadingContainer = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 20,
  padding: theme.spacing(6),
  textAlign: 'center',
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
    backgroundSize: '400% 400%',
    animation: `${gradientShift} 3s ease infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '200%',
    height: '200%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  }
}));

const ErrorAlert = styled(Alert)(() => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: 16,
  boxShadow: '0 10px 40px rgba(239, 68, 68, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #ef4444, #dc2626, #ef4444)',
    animation: `${gradientShift} 3s ease infinite`,
  },
  '& .MuiAlert-icon': {
    fontSize: '2rem',
    animation: `${pulse} 2s ease-in-out infinite`,
  },
  '& .MuiAlert-message': {
    fontSize: '1.1rem',
    fontWeight: 600,
  }
}));

const AnimatedCircularProgress = styled(CircularProgress)(() => ({
  '& .MuiCircularProgress-circle': {
    strokeLinecap: 'round',
    stroke: 'url(#circularGradient)',
  },
  animation: `${rotate} 2s linear infinite`,
}));

const LoadingBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(3),
  animation: `${pulse} 2s ease-in-out infinite`,
}));

const TreatmentsList = () => {
  const { kidId, treatmentType } = useParams();
  const dispatch = useDispatch();
  
  // Select state from the store 
  const { status, error } = useSelector(state => state.treatments);
  const { selectedKid, status: kidStatus } = useSelector(state => state.kids);
  
  // Load treatments when the page loads 
  useEffect(() => {
    if (kidId) {
      dispatch(fetchTreatmentsByKid({ kidId, treatmentType }));
      
      // If kid details are missing, fetch them
      if (!selectedKid || selectedKid.id !== parseInt(kidId)) {
        dispatch(fetchKidById(kidId));
      }
    }
  }, [dispatch, kidId, treatmentType, selectedKid]);

  // Loading state component 
  const LoadingComponent = () => (
    <Fade in timeout={800}>
      <LoadingContainer elevation={0}>
        <svg width="0" height="0">
          <defs>
            <linearGradient id="circularGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4cb5c3" />
              <stop offset="50%" stopColor="#ff7043" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
        <LoadingBox>
          <AnimatedCircularProgress size={80} thickness={4} />
          <Typography variant="h5" sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(76, 181, 195, 0.1)'
          }}>
            🔄 טוען נתוני טיפולים...
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            אנא המתן בזמן שאנחנו מביאים את המידע עבורך
          </Typography>
        </LoadingBox>
      </LoadingContainer>
    </Fade>
  );

  // Error state component 
  const ErrorComponent = ({ error }) => (
    <Fade in timeout={600}>
      <ErrorAlert severity="error" sx={{ mx: 2 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
          ❌ אופס! משהו השתבש
        </Typography>
        <Typography variant="body1">
          {error || 'שגיאה לא צפויה התרחשה. אנא נסה שוב מאוחר יותר.'}
        </Typography>
      </ErrorAlert>
    </Fade>
  );

  // Main content component 
  const MainContent = () => (
    <Fade in timeout={1000}>
      <Box>
        {/* Search filter and filtering options */}
        <TreatmentsFilters />

        {/* Treatments table */}
        <TreatmentsTable />
      </Box>
    </Fade>
  );

  // Content to display based on loading state 
  let content;
  if (status === 'loading' || kidStatus === 'loading') {
    content = <LoadingComponent />;
  } else if (status === 'failed') {
    content = <ErrorComponent error={error} />;
  } else {
    content = <MainContent />;
  }

  return (
    <FullScreenContainer dir="rtl">
      <ContentContainer maxWidth="xl">
        <TreatmentsHeader 
          kidId={kidId} 
          treatmentType={treatmentType} 
          selectedKid={selectedKid}
        />
        {content}

        {/* Dialogs */}
        <TreatmentViewDialog />
        <AddTreatmentDialog kidId={kidId} treatmentType={treatmentType} />
      </ContentContainer>
    </FullScreenContainer>
  );
};

export default TreatmentsList;