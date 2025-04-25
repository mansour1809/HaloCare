// src/pages/kids/KidProfilePage.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Divider, 
  CircularProgress, 
  Alert,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import { fetchKidById } from '../../../Redux/features/kidsSlice';
import { fetchTreatmentTypes } from '../../../Redux/features/treatmentTypesSlice';
import KidFlowerProfile from './KidFlowerProfile';

const KidProfilePage = () => {
  const { kidId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { selectedKid, status: kidStatus, error: kidError } = useSelector(state => state.kids);
  const { treatmentTypes, status: typesStatus } = useSelector(state => state.treatmentTypes);
  
  useEffect(() => {
    if (kidId) {
      dispatch(fetchKidById(kidId));
      dispatch(fetchTreatmentTypes());
    }
  }, [dispatch, kidId]);
  
  const handleAddTreatment = () => {
    navigate(`/kids/${kidId}/treatments/add`);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '–';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };
  
  if (kidStatus === 'loading' || typesStatus === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (kidStatus === 'failed') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{kidError}</Alert>
      </Box>
    );
  }
  
  if (!selectedKid) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">לא נמצא ילד עם המזהה שצוין</Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }} dir="rtl">
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
          onClick={() => navigate('/kids/list')}
        >
          <PersonIcon sx={{ mr: 0.5, fontSize: 'small' }} />
          רשימת ילדים
        </Link>
        <Typography color="text.primary" sx={{ fontWeight: 'medium' }}>
          {selectedKid.firstName} {selectedKid.lastName}
        </Typography>
      </Breadcrumbs>
      
      <Paper sx={{ p: 3, mb: 3, borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#4cb5c3' }}>
              תיק ילד: {selectedKid.firstName} {selectedKid.lastName}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip 
                label={selectedKid.isActive ? "פעיל" : "לא פעיל"} 
                color={selectedKid.isActive ? "success" : "default"}
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip
                label={`כיתה: ${selectedKid.className || "לא משויך"}`}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleAddTreatment}
            sx={{
              backgroundColor: '#4cb5c3',
              '&:hover': { backgroundColor: '#3da1af' }
            }}
          >
            הוספת טיפול חדש
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* תצוגת פרח של תחומי הטיפול */}
        <KidFlowerProfile kid={selectedKid} />
      </Paper>
      
      <Paper sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          פרטי ילד
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">שם פרטי</Typography>
            <Typography>{selectedKid.firstName || '–'}</Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">שם משפחה</Typography>
            <Typography>{selectedKid.lastName || '–'}</Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">תאריך לידה</Typography>
            <Typography>{formatDate(selectedKid.birthDate)}</Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">מגדר</Typography>
            <Typography>{selectedKid.gender || '–'}</Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">כיתה</Typography>
            <Typography>{selectedKid.className || '–'}</Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">כתובת</Typography>
            <Typography>{selectedKid.address ? `${selectedKid.address}, ${selectedKid.cityName || ''}` : '–'}</Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">הורה ראשי</Typography>
            <Typography>{selectedKid.parentName1 || '–'}</Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">הורה משני</Typography>
            <Typography>{selectedKid.parentName2 || '–'}</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default KidProfilePage;