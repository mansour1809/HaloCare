// src/components/treatments/TreatmentsHeader.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Chip,
  Breadcrumbs,
  Link
} from '@mui/material';
import { 
  Add as AddIcon,
  Home as HomeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTreatmentContext } from './TreatmentContext';

const TreatmentsHeader = ({ kidId, treatmentType, selectedKid }) => {
  const navigate = useNavigate();
  const { openAddDialog, getTreatmentName, getColorForTreatmentType } = useTreatmentContext();

  return (
    <Box sx={{ mb: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => navigate('/')}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 'small' }} />
          ראשי
        </Link>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => navigate('/kids')}
        >
          <PersonIcon sx={{ mr: 0.5, fontSize: 'small' }} />
          רשימת ילדים
        </Link>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => navigate(`/kids/${kidId}`)}
        >
          {selectedKid ? `${selectedKid.firstName} ${selectedKid.lastName}` : 'תיק ילד'}
        </Link>
        <Typography color="text.primary" sx={{ fontWeight: 'medium' }}>
          {getTreatmentName(treatmentType) ? `טיפולי ${getTreatmentName(treatmentType)}` : 'סיכומי טיפולים'}
        </Typography>
      </Breadcrumbs>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#4cb5c3' }}>
            סיכומי טיפולים {treatmentType && (
              <Chip 
                label={getTreatmentName(treatmentType)}
                sx={{ 
                  ml: 1, 
                  backgroundColor: getColorForTreatmentType(treatmentType),
                  color: '#fff'
                }}
              />
            )}
          </Typography>
          {selectedKid && (
            <Typography variant="subtitle1" color="text.secondary">
              {selectedKid.firstName} {selectedKid.lastName}
            </Typography>
          )}
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={openAddDialog}
          sx={{ 
            fontWeight: 'bold',
            backgroundColor: '#4cb5c3',
            '&:hover': { backgroundColor: '#3da1af' }
          }}
        >
          סיכום חדש
        </Button>
      </Box>
    </Box>
  );
};

export default TreatmentsHeader;