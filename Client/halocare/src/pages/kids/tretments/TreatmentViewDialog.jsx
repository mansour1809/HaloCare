// src/components/treatments/TreatmentViewDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Divider,
  Avatar,
  Rating,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useTreatmentContext } from './TreatmentContext';

const TreatmentViewDialog = () => {
  const {
    isViewDialogOpen,
    currentTreatment,
    closeViewDialog,
    updateTreatment,
    deleteTreatment,
    loading
  } = useTreatmentContext();

  const [isEditing, setIsEditing] = useState(false);
  const [editedTreatment, setEditedTreatment] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  // כאשר הטיפול משתנה, עדכן את הטיפול לעריכה
  React.useEffect(() => {
    if (currentTreatment) {
      setEditedTreatment({ ...currentTreatment });
    }
  }, [currentTreatment]);

  if (!currentTreatment) {
    return null;
  }

  const handleCloseDialog = () => {
    setIsEditing(false);
    setConfirmDelete(false);
    closeViewDialog();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTreatment((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCooperationLevelChange = (event, newValue) => {
    setEditedTreatment((prev) => ({
      ...prev,
      cooperationLevel: newValue
    }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // אם כבר עורכים, נחזור למצב רגיל ללא שמירה
      setEditedTreatment({ ...currentTreatment });
    }
    setIsEditing(!isEditing);
    setConfirmDelete(false);
  };

  const handleSave = async () => {
    try {
      await updateTreatment(currentTreatment.treatmentId, editedTreatment);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating treatment:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      await deleteTreatment(currentTreatment.treatmentId);
    } catch (error) {
      console.error('Error deleting treatment:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };

  return (
    <Dialog
      open={isViewDialogOpen}
      onClose={handleCloseDialog}
      maxWidth="md"
      fullWidth
      dir="rtl"
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center">
          <Typography variant="h6">סיכום טיפול</Typography>
          <Chip 
            label={currentTreatment.treatmentType} 
            color="primary" 
            size="small" 
            sx={{ mr: 1 }} 
          />
        </Box>
        <IconButton edge="end" color="inherit" onClick={handleCloseDialog}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      
      <DialogContent>
        <Grid container spacing={3}>
          {/* תאריך טיפול */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              תאריך טיפול
            </Typography>
            {isEditing ? (
              <TextField
                type="date"
                name="treatmentDate"
                value={editedTreatment.treatmentDate ? new Date(editedTreatment.treatmentDate).toISOString().split('T')[0] : ''}
                onChange={handleInputChange}
                fullWidth
                disabled={loading}
                size="small"
              />
            ) : (
              <Typography variant="body1">
                {formatDate(currentTreatment.treatmentDate)}
              </Typography>
            )}
          </Grid>
          
          {/* מטפל */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              מטפל
            </Typography>
            <Box display="flex" alignItems="center">
              <Avatar 
                src={currentTreatment.employeePhoto || ''} 
                sx={{ width: 32, height: 32, ml: 1 }}
              >
                {(currentTreatment.employeeName || '')[0]}
              </Avatar>
              <Typography variant="body1">
                {currentTreatment.employeeName || 'XXXXX'}
              </Typography>
            </Box>
          </Grid>
          
          {/* רמת שיתוף פעולה */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              רמת שיתוף פעולה
            </Typography>
            {isEditing ? (
              <Rating
                name="cooperationLevel"
                value={parseInt(editedTreatment.cooperationLevel) || 0}
                onChange={handleCooperationLevelChange}
                max={5}
                disabled={loading}
              />
            ) : (
              <Rating
                value={parseInt(currentTreatment.cooperationLevel) || 0}
                readOnly
                max={5}
              />
            )}
          </Grid>
          
          {/* תיאור הטיפול */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              תיאור מהלך הטיפול
            </Typography>
            {isEditing ? (
              <TextField
                name="description"
                value={editedTreatment.description || ''}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
                disabled={loading}
              />
            ) : (
              <Typography variant="body1" sx={{ 
                p: 2, 
                bgcolor: 'background.default', 
                borderRadius: 1,
                minHeight: '100px'
              }}>
                {currentTreatment.description}
              </Typography>
            )}
          </Grid>
          
          {/* נקודות חשובות */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              נקודות חשובות / היילייט
            </Typography>
            {isEditing ? (
              <TextField
                name="highlight"
                value={editedTreatment.highlight || ''}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
                disabled={loading}
              />
            ) : (
              <Typography variant="body1" sx={{ 
                p: 2, 
                bgcolor: 'warning.light', 
                color: 'warning.contrastText',
                borderRadius: 1
              }}>
                {currentTreatment.highlight || 'אין נקודות מודגשות'}
              </Typography>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Box>
          {isEditing ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={loading}
              startIcon={<SaveIcon />}
            >
              שמור
            </Button>
          ) : (
            <Button
              variant="contained"
              color={confirmDelete ? "error" : "default"}
              onClick={handleDelete}
              disabled={loading}
              startIcon={<DeleteIcon />}
            >
              {confirmDelete ? 'אישור מחיקה' : 'מחק'}
            </Button>
          )}
        </Box>
        
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleEditToggle}
            disabled={loading}
            startIcon={isEditing ? <CloseIcon /> : <EditIcon />}
            sx={{ ml: 1 }}
          >
            {isEditing ? 'ביטול' : 'עריכה'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleCloseDialog}
            disabled={loading}
          >
            סגור
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default TreatmentViewDialog;