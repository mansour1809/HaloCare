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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  School as ClassIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';

import { fetchClasses, addClass, updateClass, clearError, resetActionStatus } from '../../Redux/features/classesSlice';

const ClassesTab = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Redux state
  const { classes, status, actionStatus, error } = useSelector(state => state.classes);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editTeacherId, setEditTeacherId] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newTeacherId, setNewTeacherId] = useState('');

  // Filter classes based on search term
  const filteredClasses = classes.filter(cls =>
    cls.className.toLowerCase().includes(searchTerm.toLowerCase())
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
  const handleEditStart = (cls) => {
    setEditingId(cls.classId);
    setEditValue(cls.className);
    setEditTeacherId(cls.teacherId);
  };

  // Handle edit save
  const handleEditSave = async () => {
    if (editValue.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'שם הכיתה לא יכול להיות ריק',
        confirmButtonText: 'אישור'
      });
      return;
    }

    const originalClass = classes.find(cls => cls.classId === editingId);
    if (editValue === originalClass.className && editTeacherId === originalClass.teacherId) {
      setEditingId(null);
      return;
    }

    // Check if new name already exists (for different class)
    if (classes.some(cls => cls.className === editValue && cls.classId !== editingId)) {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'כיתה בשם זה כבר קיימת',
        confirmButtonText: 'אישור'
      });
      return;
    }

    await dispatch(updateClass({
      classId: editingId,
      className: editValue,
      teacherId: parseInt(editTeacherId) || 0
    }));

    setEditingId(null);
    setEditValue('');
    setEditTeacherId('');
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
    setEditTeacherId('');
  };

  // Handle add class
  const handleAddClass = async () => {
    if (newClassName.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'שם הכיתה לא יכול להיות ריק',
        confirmButtonText: 'אישור'
      });
      return;
    }

    // Check if class already exists
    if (classes.some(cls => cls.className === newClassName)) {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'כיתה בשם זה כבר קיימת',
        confirmButtonText: 'אישור'
      });
      return;
    }

    await dispatch(addClass({
      className: newClassName,
      teacherId: parseInt(newTeacherId) || 0
    }));

    setOpenDialog(false);
    setNewClassName('');
    setNewTeacherId('');
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewClassName('');
    setNewTeacherId('');
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
          <ClassIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight="bold">
            ניהול כיתות ({filteredClasses.length})
          </Typography>
        </Box>
        
        <TextField
          placeholder="חיפוש כיתה..."
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

      {/* Classes Table */}
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
                שם הכיתה
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  fontSize: '1.1rem'
                }}
              >
                מזהה מורה
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
            {filteredClasses.map((cls) => (
              <TableRow 
                key={cls.classId}
                hover
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: alpha(theme.palette.action.hover, 0.5),
                  },
                }}
              >
                <TableCell>
                  {editingId === cls.classId ? (
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
                      onDoubleClick={() => handleEditStart(cls)}
                      sx={{ 
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    >
                      {cls.className}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === cls.classId ? (
                    <TextField
                      value={editTeacherId}
                      onChange={(e) => setEditTeacherId(e.target.value)}
                      size="small"
                      type="number"
                      fullWidth
                    />
                  ) : (
                    <Typography variant="body1">
                      {cls.teacherId || 'לא הוגדר'}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  {editingId === cls.classId ? (
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
                      onClick={() => handleEditStart(cls)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredClasses.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchTerm ? 'לא נמצאו כיתות מתאימות לחיפוש' : 'אין כיתות במערכת'}
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

      {/* Add Class Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          הוספת כיתה חדשה
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="שם הכיתה"
            fullWidth
            variant="outlined"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="מזהה מורה"
            fullWidth
            variant="outlined"
            type="number"
            value={newTeacherId}
            onChange={(e) => setNewTeacherId(e.target.value)}
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
            onClick={handleAddClass}
            variant="contained"
            disabled={actionStatus === 'loading'}
            startIcon={actionStatus === 'loading' ? <CircularProgress size={16} /> : <AddIcon />}
          >
            הוסף כיתה
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassesTab;