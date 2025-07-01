// src/pages/kids/KidProfilePage.jsx - update for tabs
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
  Paper
} from '@mui/material';
import {
  Home as HomeIcon,
  Group as GroupIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { fetchKidById } from '../../Redux/features/kidsSlice';
import { fetchTreatmentTypes } from '../../Redux/features/treatmentTypesSlice';
import KidProfileTabs from './KidProfileTabs';

const KidProfilePage = () => {
  const { kidId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux selectors
  const { selectedKid, status, error } = useSelector(state => state.kids);
  const { treatmentTypes, status: treatmentTypesStatus } = useSelector(state => state.treatmentTypes);

  //  Load data on initial load
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

  // loading state
  if (status === 'loading') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 3
        }}>
          <CircularProgress size={80} thickness={4} />
          <Typography variant="h5" color="text.secondary">
            🔄 טוען פרטי ילד...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Error handling
  if (status === 'failed' || error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 3,
            p: 3,
            fontSize: '1.1rem'
          }}
        >
          <Typography variant="h6" gutterBottom>
            ❌ שגיאה בטעינת פרטי הילד
          </Typography>
          <Typography variant="body1">
            {error || 'לא ניתן לטעון את פרטי הילד כרגע'}
          </Typography>
        </Alert>
      </Container>
    );
  }

  //  If the child is not found
  if (status === 'succeeded' && !selectedKid) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="warning" 
          sx={{ 
            borderRadius: 3,
            p: 3,
            fontSize: '1.1rem'
          }}
        >
          <Typography variant="h6" gutterBottom>
            ⚠️ ילד לא נמצא
          </Typography>
          <Typography variant="body1">
            ילד עם מזהה {kidId} לא קיים במערכת או שאין לך הרשאות לצפות בו
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Box dir='rtl' sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link
            underline="hover"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
            onClick={() => navigate('/')}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 'small' }} />
            ראשי
          </Link>
          
          <Link
            underline="hover"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
            onClick={() => navigate('/kids/list')}
          >
            <GroupIcon sx={{ mr: 0.5, fontSize: 'small' }} />
            רשימת ילדים
          </Link>
          
          <Typography 
            color="text.primary" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 'medium'
            }}
          >
            <PersonIcon sx={{ mr: 0.5, fontSize: 'small' }} />
            {selectedKid ? `${selectedKid.firstName} ${selectedKid.lastName}` : 'פרופיל ילד'}
          </Typography>
        </Breadcrumbs>

        {/* Page content - the tabs */}
        {selectedKid && (
          <KidProfileTabs selectedKid={selectedKid} />
        )}
      </Container>
    </Box>
  );
};

export default KidProfilePage;