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
  alpha,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  MedicalServices as TreatmentIcon,
  Palette as ColorIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';

import { fetchTreatmentTypes, addTreatmentType, updateTreatmentType, clearError, resetActionStatus } from '../../Redux/features/treatmentTypesSlice';

const TreatmentTypesTab = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Redux state
  const { treatmentTypes, status, actionStatus, error } = useSelector(state => state.treatmentTypes);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editColor, setEditColor] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeColor, setNewTypeColor] = useState('#1976d2');

  // Filter treatment types based on search term
  const filteredTreatmentTypes = treatmentTypes.filter(type =>
    type.treatmentTypeName.toLowerCase().includes(searchTerm.toLowerCase())
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
  const handleEditStart = (type) => {
    setEditingId(type.treatmentTypeId);
    setEditValue(type.treatmentTypeName);
    setEditColor(type.treatmentColor || '#1976d2');
  };

  // Handle edit save
  const handleEditSave = async () => {
    if (editValue.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'שם סוג הטיפול לא יכול להיות ריק',
        confirmButtonText: 'אישור'
      });
      return;
    }

    const originalType = treatmentTypes.find(type => type.treatmentTypeId === editingId);
    if (editValue === originalType.treatmentTypeName && editColor === originalType.treatmentColor) {
      setEditingId(null);
      return;
    }

    // Check if new name already exists (for different type)
    if (treatmentTypes.some(type => type.treatmentTypeName === editValue && type.treatmentTypeId !== editingId)) {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'סוג טיפול בשם זה כבר קיים',
        confirmButtonText: 'אישור'
      });
      return;
    }

    await dispatch(updateTreatmentType({
      treatmentTypeId: editingId,
      treatmentTypeName: editValue,
      treatmentColor: editColor
    }));

    setEditingId(null);
    setEditValue('');
    setEditColor('');
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
    setEditColor('');
  };

  // Handle add treatment type
  const handleAddTreatmentType = async () => {
    if (newTypeName.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'שם סוג הטיפול לא יכול להיות ריק',
        confirmButtonText: 'אישור'
      });
      return;
    }

    // Check if treatment type already exists
    if (treatmentTypes.some(type => type.treatmentTypeName === newTypeName)) {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'סוג טיפול בשם זה כבר קיים',
        confirmButtonText: 'אישור'
      });
      return;
    }

    await dispatch(addTreatmentType({
      treatmentTypeName: newTypeName,
      treatmentColor: newTypeColor
    }));

    setOpenDialog(false);
    setNewTypeName('');
    setNewTypeColor('#1976d2');
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewTypeName('');
    setNewTypeColor('#1976d2');
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
          <TreatmentIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight="bold">
            ניהול סוגי טיפולים ({filteredTreatmentTypes.length})
          </Typography>
        </Box>
        
        <TextField
          placeholder="חיפוש סוג טיפול..."
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

      {/* Treatment Types Table */}
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
                שם סוג הטיפול
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  fontSize: '1.1rem'
                }}
              >
                צבע
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
            {filteredTreatmentTypes.map((type) => (
              <TableRow 
                key={type.treatmentTypeId}
                hover
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: alpha(theme.palette.action.hover, 0.5),
                  },
                }}
              >
                <TableCell>
                  {editingId === type.treatmentTypeId ? (
                    <TextField
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      size="small"
                      fullWidth
                      autoFocus
                    />
                  ) : (
                    <Typography 
                      variant="body1" 
                      onDoubleClick={() => handleEditStart(type)}
                      sx={{ 
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    >
                      {type.treatmentTypeName}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === type.treatmentTypeId ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        style={{
                          width: 40,
                          height: 30,
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      />
                      <TextField
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        size="small"
                        sx={{ width: 100 }}
                      />
                    </Box>
                  ) : (
                    <Chip
                      size="small"
                      sx={{
                        backgroundColor: type.treatmentColor || '#1976d2',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                      label={type.treatmentColor || '#1976d2'}
                    />
                  )}
                </TableCell>
                <TableCell align="center">
                  {editingId === type.treatmentTypeId ? (
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
                      onClick={() => handleEditStart(type)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredTreatmentTypes.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchTerm ? 'לא נמצאו סוגי טיפולים מתאימים לחיפוש' : 'אין סוגי טיפולים במערכת'}
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

      {/* Add Treatment Type Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          הוספת סוג טיפול חדש
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="שם סוג הטיפול"
            fullWidth
            variant="outlined"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box display="flex" alignItems="center" gap={2}>
            <ColorIcon color="primary" />
            <Typography variant="body1">צבע:</Typography>
            <input
              type="color"
              value={newTypeColor}
              onChange={(e) => setNewTypeColor(e.target.value)}
              style={{
                width: 50,
                height: 40,
                border: '2px solid #ddd',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            />
            <TextField
              value={newTypeColor}
              onChange={(e) => setNewTypeColor(e.target.value)}
              size="small"
              sx={{ width: 120 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleDialogClose}
            color="inherit"
          >
            ביטול
          </Button>
          <Button 
            onClick={handleAddTreatmentType}
            variant="contained"
            disabled={actionStatus === 'loading'}
            startIcon={actionStatus === 'loading' ? <CircularProgress size={16} /> : <AddIcon />}
          >
            הוסף סוג טיפול
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TreatmentTypesTab;