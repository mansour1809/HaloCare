import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Typography,
  Paper,
  CircularProgress,
  InputAdornment,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocationCity as CityIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';

import { fetchCities, addCity, updateCity, clearError, resetActionStatus } from '../../Redux/features/citiesSlice';

const CitiesTab = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Redux state
  const { cities, status, actionStatus, error } = useSelector(state => state.cities);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newCityName, setNewCityName] = useState('');

  // Filter cities based on search term
  const filteredCities = cities.filter(city =>
    city.cityName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle success/error messages
  useEffect(() => {
    if (actionStatus === 'succeeded') {
      Swal.fire({
        icon: 'success',
        title: 'הצלחה!',
        text: 'הפעולה בוצעה בהצלחה',
        timer: 2000,
        showConfirmButton: false
      });
      dispatch(resetActionStatus());
    } else if (actionStatus === 'failed' && error) {
      Swal.fire({
        icon: 'error',
        title: 'שגיאה',
        text: error,
        confirmButtonText: 'אישור'
      });
      dispatch(clearError());
      dispatch(resetActionStatus());
    }
  }, [actionStatus, error, dispatch]);

  // Handle edit start
  const handleEditStart = (city) => {
    setEditingId(city.cityName);
    setEditValue(city.cityName);
  };

  // Handle edit save
  const handleEditSave = async () => {
    if (editValue.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'שם העיר לא יכול להיות ריק',
        confirmButtonText: 'אישור'
      });
      return;
    }

    if (editValue === editingId) {
      setEditingId(null);
      return;
    }

    // Check if new name already exists
    if (cities.some(city => city.cityName === editValue && city.cityName !== editingId)) {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'עיר בשם זה כבר קיימת',
        confirmButtonText: 'אישור'
      });
      return;
    }

    await dispatch(updateCity({
      oldName: editingId,
      newData: { NewCityName: editValue }
    }));

    setEditingId(null);
    setEditValue('');
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  // Handle add city
  const handleAddCity = async () => {
    if (newCityName.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'שם העיר לא יכול להיות ריק',
        confirmButtonText: 'אישור'
      });
      return;
    }

    // Check if city already exists
    if (cities.some(city => city.cityName === newCityName)) {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'עיר בשם זה כבר קיימת',
        confirmButtonText: 'אישור'
      });
      return;
    }

    await dispatch(addCity({ CityName: newCityName }));
    setOpenDialog(false);
    setNewCityName('');
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewCityName('');
  };

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with search */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
        p={2}
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
          borderRadius: 2
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <CityIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight="bold">
            ניהול ערים ({filteredCities.length})
          </Typography>
        </Box>
        
        <TextField
          placeholder="חיפוש עיר..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Cities Table */}
      <TableContainer 
        component={Paper} 
        elevation={2}
        sx={{ 
          borderRadius: 2,
          maxHeight: 500
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  fontSize: '1.1rem'
                }}
              >
                שם העיר
              </TableCell>
              <TableCell 
                align="center"
                sx={{ 
                  fontWeight: 'bold', 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  fontSize: '1.1rem',
                  width: 120
                }}
              >
                פעולות
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCities.map((city, index) => (
              <TableRow 
                key={city.cityName}
                hover
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: alpha(theme.palette.action.hover, 0.5),
                  },
                }}
              >
                <TableCell>
                  {editingId === city.cityName ? (
                    <TextField
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      size="small"
                      fullWidth
                      autoFocus
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleEditSave();
                        } else if (e.key === 'Escape') {
                          handleEditCancel();
                        }
                      }}
                    />
                  ) : (
                    <Typography 
                      variant="body1" 
                      onDoubleClick={() => handleEditStart(city)}
                      sx={{ 
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    >
                      {city.cityName}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  {editingId === city.cityName ? (
                    <Box display="flex" gap={1} justifyContent="center">
                      <IconButton
                        onClick={handleEditSave}
                        color="primary"
                        size="small"
                        disabled={actionStatus === 'loading'}
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton
                        onClick={handleEditCancel}
                        color="error"
                        size="small"
                      >
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <IconButton
                      onClick={() => handleEditStart(city)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredCities.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchTerm ? 'לא נמצאו ערים מתאימות לחיפוש' : 'אין ערים במערכת'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setOpenDialog(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
      >
        <AddIcon />
      </Fab>

      {/* Add City Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          הוספת עיר חדשה
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="שם העיר"
            fullWidth
            variant="outlined"
            value={newCityName}
            onChange={(e) => setNewCityName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddCity();
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleDialogClose}
            color="inherit"
          >
            ביטול
          </Button>
          <Button 
            onClick={handleAddCity}
            variant="contained"
            disabled={actionStatus === 'loading'}
            startIcon={actionStatus === 'loading' ? <CircularProgress size={16} /> : <AddIcon />}
          >
            הוסף עיר
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CitiesTab;