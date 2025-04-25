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
  Box,
  Divider,
  Rating,
  Chip,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import { useTreatmentContext } from './TreatmentContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const TreatmentViewDialog = () => {
  const { 
    isViewDialogOpen, 
    closeViewDialog, 
    currentTreatment, 
    updateTreatment,
    deleteTreatment,
    loading, 
    error 
  } = useTreatmentContext();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // עדכון נתוני הטופס בעת פתיחת הדיאלוג או שינוי הטיפול הנוכחי
  React.useEffect(() => {
    if (currentTreatment) {
      setFormData({
        ...currentTreatment,
        cooperationLevel: currentTreatment.cooperationLevel || 0
      });
    }
    setEditMode(false);
    setDeleteConfirm(false);
    setFormError('');
  }, [currentTreatment, isViewDialogOpen]);

  if (!currentTreatment) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCooperationLevelChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      cooperationLevel: newValue
    }));
  };

  const validateForm = () => {
    if (!formData.description?.trim()) {
      setFormError('יש להזין תיאור טיפול');
      return false;
    }
    
    setFormError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await updateTreatment(currentTreatment.id || currentTreatment.treatmentId, formData);
      setEditMode(false);
    } catch (err) {
      setFormError(err.message || 'שגיאה בעדכון טיפול');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    
    try {
      await deleteTreatment(currentTreatment.id || currentTreatment.treatmentId);
      // אם הפעולה הצליחה, הדיאלוג ייסגר אוטומטית
    } catch (err) {
      setFormError(err.message || 'שגיאה במחיקת טיפול');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };

  const exportToPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // הגדרת כיוון מימין לשמאל עבור עברית
    doc.setR2L(true);
    
    // כותרת הדוח
    doc.setFontSize(18);
    doc.text('סיכום טיפול', 105, 20, { align: 'center' });
    
    // פרטי הטיפול
    doc.setFontSize(12);
    doc.text(`סוג טיפול: ${currentTreatment.treatmentType || ''}`, 180, 40, { align: 'right' });
    doc.text(`תאריך: ${formatDate(currentTreatment.treatmentDate)}`, 180, 50, { align: 'right' });
    doc.text(`מטפל: ${currentTreatment.employeeName || ''}`, 180, 60, { align: 'right' });
    doc.text(`רמת שיתוף פעולה: ${currentTreatment.cooperationLevel}/5`, 180, 70, { align: 'right' });
    
    // תיאור הטיפול
    doc.setFontSize(14);
    doc.text('תיאור הטיפול:', 180, 90, { align: 'right' });
    
    const splitDescription = doc.splitTextToSize(currentTreatment.description || '', 160);
    doc.setFontSize(12);
    doc.text(splitDescription, 180, 100, { align: 'right' });
    
    // היילייט
    if (currentTreatment.highlight) {
      const yPos = 100 + (splitDescription.length * 7);
      doc.setFontSize(14);
      doc.text('נקודות חשובות:', 180, yPos, { align: 'right' });
      
      const splitHighlight = doc.splitTextToSize(currentTreatment.highlight, 160);
      doc.setFontSize(12);
      doc.text(splitHighlight, 180, yPos + 10, { align: 'right' });
    }
    
    // שמירת הקובץ
    doc.save(`סיכום_טיפול_${currentTreatment.treatmentType}_${formatDate(currentTreatment.treatmentDate)}.pdf`);
  };

  // תצוגת פרטי הטיפול במצב צפייה
  const renderViewMode = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle1" gutterBottom>סוג טיפול</Typography>
        <Typography variant="body1">{currentTreatment.treatmentType || 'לא צוין'}</Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle1" gutterBottom>תאריך טיפול</Typography>
        <Typography variant="body1">{formatDate(currentTreatment.treatmentDate)}</Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle1" gutterBottom>מטפל</Typography>
        <Typography variant="body1">{currentTreatment.employeeName || 'לא צוין'}</Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle1" gutterBottom>רמת שיתוף פעולה</Typography>
        <Rating 
          value={parseInt(currentTreatment.cooperationLevel) || 0} 
          readOnly 
          max={5}
        />
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>תיאור הטיפול</Typography>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {currentTreatment.description || 'לא צוין'}
          </Typography>
        </Paper>
      </Grid>
      
      {currentTreatment.highlight && (
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            נקודות חשובות
          </Typography>
          <Chip 
            label={currentTreatment.highlight} 
            color="primary" 
            sx={{ 
              height: 'auto', 
              '& .MuiChip-label': { 
                whiteSpace: 'normal',
                p: 1
              } 
            }}
          />
        </Grid>
      )}
    </Grid>
  );

  return (
    <Dialog
      open={isViewDialogOpen}
      onClose={() => {
        if (!loading) closeViewDialog();
      }}
      maxWidth="md"
      fullWidth
      dir="rtl"
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {editMode ? 'עריכת סיכום טיפול' : 'צפייה בסיכום טיפול'}
        </Typography>
        <Box>
          {!editMode && (
            <>
              <IconButton 
                color="primary" 
                onClick={() => setEditMode(true)} 
                disabled={loading}
                title="ערוך טיפול"
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                color="primary" 
                onClick={exportToPdf} 
                disabled={loading}
                title="ייצא ל-PDF"
              >
                <DownloadIcon />
              </IconButton>
            </>
          )}
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={closeViewDialog}
            disabled={loading}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      
      <DialogContent>
        {(formError || error) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {formError || error}
          </Alert>
        )}
        
        {deleteConfirm && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            האם אתה בטוח שברצונך למחוק את סיכום הטיפול? פעולה זו אינה הפיכה.
          </Alert>
        )}
        
        {/* מציג את תצוגת העריכה או הצפייה בהתאם למצב */}
        {editMode ? renderEditMode() : renderViewMode()}
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
        {editMode ? (
          // כפתורים במצב עריכה
          <>
            <Button
              type="button"
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {loading ? 'שומר...' : 'שמור שינויים'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => {
                setEditMode(false);
                setFormData(currentTreatment);
                setFormError('');
              }}
              disabled={loading}
            >
              ביטול
            </Button>
          </>
        ) : (
          // כפתורים במצב צפייה
          <>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
            >
              {deleteConfirm ? 'אישור מחיקה' : 'מחק טיפול'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={closeViewDialog}
              disabled={loading}
            >
              סגור
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );

  // טופס עריכת פרטי הטיפול
  const renderEditMode = () => (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="סוג טיפול"
            value={formData.treatmentType || ''}
            disabled
            fullWidth
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="תאריך טיפול"
            type="date"
            name="treatmentDate"
            value={formData.treatmentDate?.split('T')[0] || ''}
            onChange={handleInputChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="מטפל"
            value={formData.employeeName || ''}
            disabled
            fullWidth
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="body2" gutterBottom>
              רמת שיתוף פעולה
            </Typography>
            <Rating
              name="cooperationLevel"
              value={parseInt(formData.cooperationLevel) || 0}
              onChange={handleCooperationLevelChange}
              max={5}
              disabled={loading}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="תיאור מהלך הטיפול"
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={4}
            required
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="נקודות חשובות / היילייט"
            name="highlight"
            value={formData.highlight || ''}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={2}
            disabled={loading}
          />
        </Grid>
      </Grid>
    </form>
  )};

export default TreatmentViewDialog;