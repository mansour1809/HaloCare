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
  Paper
} from '@mui/material';
import { fetchTreatmentsByKid } from '../../../Redux/features/treatmentsSlice';
import { fetchKidById } from '../../../Redux/features/kidsSlice';

// Sub components
import TreatmentsHeader from './TreatmentsHeader';
import TreatmentsFilters from './TreatmentsFilters';
import TreatmentsTable from './TreatmentsTable';
import TreatmentViewDialog from './TreatmentViewDialog';
import AddTreatmentDialog from './AddTreatmentDialog';

// Enhanced Styled Components with modern design
const FullScreenContainer = styled(Box)(() => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
  backgroundSize: '400% 400%',
  animation: 'gradientShift 20s ease infinite',
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
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
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
  border: `1px solid ${alpha('#ffffff', 0.2)}`,
  borderRadius: '20px',
  padding: theme.spacing(6),
  textAlign: 'center',
  boxShadow: '0 20px 60px rgba(76, 181, 195, 0.15)',
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
    animation: 'gradientShift 8s ease infinite',
  }
}));

const ErrorAlert = styled(Alert)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha('#f44336', 0.3)}`,
  borderRadius: '16px',
  boxShadow: '0 15px 45px rgba(244, 67, 54, 0.1)',
  '& .MuiAlert-icon': {
    fontSize: '2rem',
  },
  '& .MuiAlert-message': {
    fontSize: '1.1rem',
    fontWeight: 600,
  }
}));

const AnimatedCircularProgress = styled(CircularProgress)(({ theme }) => ({
  color: '#4cb5c3',
  '& .MuiCircularProgress-circle': {
    strokeLinecap: 'round',
    animation: 'progressRotate 2s linear infinite',
  },
  '@keyframes progressRotate': {
    '0%': {
      strokeDasharray: '1px, 200px',
      strokeDashoffset: '0px',
    },
    '50%': {
      strokeDasharray: '100px, 200px',
      strokeDashoffset: '-15px',
    },
    '100%': {
      strokeDasharray: '100px, 200px',
      strokeDashoffset: '-125px',
    },
  }
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
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 3
        }}>
          <AnimatedCircularProgress size={80} thickness={4} />
          <Typography variant="h5" sx={{ 
            fontWeight: 700,
            color: '#4cb5c3',
            textShadow: '0 2px 4px rgba(76, 181, 195, 0.2)'
          }}>
            🔄 טוען נתוני טיפולים...
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            אנא המתן בזמן שאנחנו מביאים את המידע עבורך
          </Typography>
        </Box>
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