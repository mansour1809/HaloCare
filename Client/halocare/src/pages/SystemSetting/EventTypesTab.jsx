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
  Event as EventIcon,
  Palette as ColorIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';

import { fetchEventTypes, addEventType, updateEventType, clearError, resetActionStatus } from '../../Redux/features/eventTypesSlice';

const EventTypesTab = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Redux state
  const { eventTypes, status, actionStatus, error } = useSelector(state => state.eventTypes);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editColor, setEditColor] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newEventTypeName, setNewEventTypeName] = useState('');
  const [newEventColor, setNewEventColor] = useState('#1976d2');

  // Filter event types based on search term
  const filteredEventTypes = eventTypes.filter(type =>
    type.eventType.toLowerCase().includes(searchTerm.toLowerCase())
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
    setEditingId(type.eventTypeId);
    setEditValue(type.eventType);
    setEditColor(type.color || '#1976d2');
  };

  // Handle edit save
  const handleEditSave = async () => {
    if (editValue.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'שם סוג האירוע לא יכול להיות ריק',
        confirmButtonText: 'אישור'
      });
      return;
    }

    const originalType = eventTypes.find(type => type.eventTypeId === editingId);
    if (editValue === originalType.eventType && editColor === originalType.color) {
      setEditingId(null);
      return;
    }

    // Check if new name already exists (for different type)
    if (eventTypes.some(type => type.eventType === editValue && type.eventTypeId !== editingId)) {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'סוג אירוע בשם זה כבר קיים',
        confirmButtonText: 'אישור'
      });
      return;
    }

    await dispatch(updateEventType({
      eventTypeId: editingId,
      eventType: editValue,
      color: editColor
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

  // Handle add event type
  const handleAddEventType = async () => {
    if (newEventTypeName.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'שם סוג האירוע לא יכול להיות ריק',
        confirmButtonText: 'אישור'
      });
      return;
    }

    // Check if event type already exists
    if (eventTypes.some(type => type.eventType === newEventTypeName)) {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'סוג אירוע בשם זה כבר קיים',
        confirmButtonText: 'אישור'
      });
      return;
    }

    await dispatch(addEventType({
      eventType: newEventTypeName,
      color: newEventColor
    }));

    setOpenDialog(false);
    setNewEventTypeName('');
    setNewEventColor('#1976d2');
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewEventTypeName('');
    setNewEventColor('#1976d2');
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
          <EventIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight="bold">
            ניהול סוגי אירועים ({filteredEventTypes.length})
          </Typography>
        </Box>
        
        <TextField
          placeholder="חיפוש סוג אירוע..."
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

      {/* Event Types Table */}
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
                שם סוג האירוע
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
            {filteredEventTypes.map((type) => (
              <TableRow 
                key={type.eventTypeId}
                hover
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: alpha(theme.palette.action.hover, 0.5),
                  },
                }}
              >
                <TableCell>
                  {editingId === type.eventTypeId ? (
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
                      {type.eventType}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === type.eventTypeId ? (
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
                        backgroundColor: type.color || '#1976d2',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                      label={type.color || '#1976d2'}
                    />
                  )}
                </TableCell>
                <TableCell align="center">
                  {editingId === type.eventTypeId ? (
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
            {filteredEventTypes.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchTerm ? 'לא נמצאו סוגי אירועים מתאימים לחיפוש' : 'אין סוגי אירועים במערכת'}
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

      {/* Add Event Type Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          הוספת סוג אירוע חדש
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="שם סוג האירוע"
            fullWidth
            variant="outlined"
            value={newEventTypeName}
            onChange={(e) => setNewEventTypeName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box display="flex" alignItems="center" gap={2}>
            <ColorIcon color="primary" />
            <Typography variant="body1">צבע:</Typography>
            <input
              type="color"
              value={newEventColor}
              onChange={(e) => setNewEventColor(e.target.value)}
              style={{
                width: 50,
                height: 40,
                border: '2px solid #ddd',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            />
            <TextField
              value={newEventColor}
              onChange={(e) => setNewEventColor(e.target.value)}
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
            onClick={handleAddEventType}
            variant="contained"
            disabled={actionStatus === 'loading'}
            startIcon={actionStatus === 'loading' ? <CircularProgress size={16} /> : <AddIcon />}
          >
            הוסף סוג אירוע
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventTypesTab;