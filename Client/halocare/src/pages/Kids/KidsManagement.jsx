// src/components/kids/KidsList.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Avatar, 
  Button, 
  IconButton, 
  TextField,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { fetchKids } from '../../Redux/features/kidsSlice';

const KidsManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { kids, status, error } = useSelector(state => state.kids);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    dispatch(fetchKids());
  }, [dispatch]);
  
  const filteredKids = kids.filter(kid => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (kid.firstName && kid.firstName.toLowerCase().includes(searchLower)) ||
      (kid.lastName && kid.lastName.toLowerCase().includes(searchLower))
    );
  });
  
  const handleViewKidProfile = (kidId) => {
    navigate(`/kids/${kidId}`);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };
  
  return (
    <Box sx={{ p: 3 }} dir="rtl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#4cb5c3' }}>
          רשימת ילדים
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="חיפוש ילד..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: '#4cb5c3',
              '&:hover': { backgroundColor: '#3da1af' }
            }}
            onClick={() => navigate('/kids/add')}
          >
            הוספת ילד חדש
          </Button>
        </Box>
      </Box>
      
      {status === 'loading' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {status === 'failed' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {status === 'succeeded' && (
        <TableContainer component={Paper} sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: '10px' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>שם הילד</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>תאריך לידה</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>כיתה</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>מגדר</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredKids.length > 0 ? (
                filteredKids.map(kid => (
                  <TableRow key={kid.kidId} sx={{ '&:hover': { backgroundColor: '#f5f9fa' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={kid.photo ? `https://localhost:7225/api/Documents/content-by-path?path=${encodeURIComponent(kid.photo)}` : ''}
                          alt={`${kid.firstName} ${kid.lastName}`}
                          sx={{ width: 40, height: 40, mr: 1 }}
                        >
                          {!kid.photo && (
                            <>
                              {kid.firstName && kid.firstName[0]}
                              {kid.lastName && kid.lastName[0]}
                            </>
                          )}
                        </Avatar>
                        <Typography sx={{ fontWeight: 'medium' }}>
                          {`${kid.firstName || ""} ${kid.lastName || ""}`}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(kid.birthDate)}</TableCell>
                    <TableCell>{kid.className || '–'}</TableCell>
                    <TableCell>{kid.gender || '–'}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewKidProfile(kid.kidId)}
                        sx={{
                          backgroundColor: '#4cb5c3',
                          color: 'white',
                          '&:hover': { backgroundColor: '#3da1af' },
                          width: 35,
                          height: 35
                        }}
                      >
                        <VisibilityIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      לא נמצאו ילדים
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default KidsManagement;