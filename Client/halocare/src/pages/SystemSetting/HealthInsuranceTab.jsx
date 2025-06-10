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
  LocalHospital as HealthIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';

import { fetchHealthInsurances, addHealthInsurance, updateHealthInsurance, clearError, resetActionStatus } from '../../Redux/features/healthinsurancesSlice';

const HealthInsuranceTab = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Redux state - התאם לשם הslice שלך
  const { healthInsurances, status, actionStatus, error } = useSelector(state => state.healthInsurances || { healthInsurances: [], status: 'idle', actionStatus: 'idle', error: null });
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newHealthInsuranceName, setNewHealthInsuranceName] = useState('');

  // Filter health insurances based on search term
  const filteredHealthInsurances = healthInsurances.filter(insurance =>
    insurance.hName.toLowerCase().includes(searchTerm.toLowerCase())
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
  const handleEditStart = (insurance) => {
    setEditingId(insurance.hName);
    setEditValue(insurance.hName);
  };

  // Handle edit save
  const handleEditSave = async () => {
    if (editValue.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'שם קופת החולים לא יכול להיות ריק',
        confirmButtonText: 'אישור'
      });
      return;
    }

    if (editValue === editingId) {
      setEditingId(null);
      return;
    }

    // Check if new name already exists
    if (healthInsurances.some(insurance => insurance.hName === editValue && insurance.hName !== editingId)) {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'קופת חולים בשם זה כבר קיימת',
        confirmButtonText: 'אישור'
      });
      return;
    }

    await dispatch(updateHealthInsurance({
      oldName: editingId,
      newData: { NewHName: editValue }
    }));

    setEditingId(null);
    setEditValue('');
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  // Handle add health insurance
  const handleAddHealthInsurance = async () => {
    if (newHealthInsuranceName.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'שם קופת החולים לא יכול להיות ריק',
        confirmButtonText: 'אישור'
      });
      return;
    }

    // Check if health insurance already exists
    if (healthInsurances.some(insurance => insurance.hName === newHealthInsuranceName)) {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'קופת חולים בשם זה כבר קיימת',
        confirmButtonText: 'אישור'
      });
      return;
    }

    await dispatch(addHealthInsurance({ HName: newHealthInsuranceName }));

    setOpenDialog(false);
    setNewHealthInsuranceName('');
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewHealthInsuranceName('');
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
          <HealthIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight="bold">
            ניהול קופות חולים ({filteredHealthInsurances.length})
          </Typography>
        </Box>
        
        <TextField
          placeholder="חיפוש קופת חולים..."
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

      {/* Health Insurances Table */}
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
                שם קופת החולים
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
            {filteredHealthInsurances.map((insurance) => (
              <TableRow 
                key={insurance.hName}
                hover
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: alpha(theme.palette.action.hover, 0.5),
                  },
                }}
              >
                <TableCell>
                  {editingId === insurance.hName ? (
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
                      onDoubleClick={() => handleEditStart(insurance)}
                      sx={{ 
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    >
                      {insurance.hName}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  {editingId === insurance.hName ? (
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
                      onClick={() => handleEditStart(insurance)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredHealthInsurances.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchTerm ? 'לא נמצאו קופות חולים מתאימות לחיפוש' : 'אין קופות חולים במערכת'}
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

      {/* Add Health Insurance Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          הוספת קופת חולים חדשה
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="שם קופת החולים"
            fullWidth
            variant="outlined"
            value={newHealthInsuranceName}
            onChange={(e) => setNewHealthInsuranceName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddHealthInsurance();
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
            onClick={handleAddHealthInsurance}
            variant="contained"
            disabled={actionStatus === 'loading'}
            startIcon={actionStatus === 'loading' ? <CircularProgress size={16} /> : <AddIcon />}
          >
            הוסף קופת חולים
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HealthInsuranceTab;