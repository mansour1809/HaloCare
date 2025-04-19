// src/components/treatments/AddTreatmentDialog.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Rating,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useTreatmentContext } from './TreatmentContext';
import { fetchTreatmentTypes } from '../../../Redux/features/treatmentTypesSlice';

import { useAuth } from '../../../components/login/AuthContext'; 

const AddTreatmentDialog = ({ kidId, treatmentType = null }) => {
  const { isAddDialogOpen, closeAddDialog, addTreatment, loading, error } = useTreatmentContext();
  const dispatch = useDispatch();
  const { currentUser } = useAuth(); // קבלת המשתמש המחובר מקונטקסט האותנטיקציה
  
  // שליפת סוגי טיפולים מהסטור
  const { treatmentTypes, status: treatmentTypesStatus } = useSelector(state => state.treatmentTypes);
  
  const [formError, setFormError] = useState('');
  
  const [formData, setFormData] = useState({
    kidId: kidId,
    employeeId: currentUser?.id || '', // שימוש במזהה של המשתמש הנוכחי
    treatmentDate: new Date().toISOString().split('T')[0],
    treatmentType: treatmentType || '',
    description: '',
    cooperationLevel: 3,
    status: 'active',
    highlight: ''
  });
  
  // איפוס הטופס כאשר הדיאלוג נפתח
  useEffect(() => {
    if (isAddDialogOpen) {
      setFormData({
        kidId: kidId,
        employeeId: currentUser?.id || '', // שימוש במזהה של המשתמש הנוכחי
        treatmentDate: new Date().toISOString().split('T')[0],
        treatmentType: treatmentType || '',
        description: '',
        cooperationLevel: 3,
        status: 'active',
        highlight: ''
      });
      setFormError('');
    }
  }, [isAddDialogOpen, kidId, treatmentType, currentUser]);
  
  // טעינת סוגי טיפולים
  useEffect(() => {
    if (isAddDialogOpen && treatmentTypesStatus === 'idle') {
      dispatch(fetchTreatmentTypes());
    }
  }, [isAddDialogOpen, dispatch, treatmentTypesStatus]);
  
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
  
  const generateHighlight = async () => {
    // כאן תהיה לוגיקה לייצור היילייט באמצעות בינה מלאכותית
    // לצורך הדוגמה, נחזיר סיכום פשוט מהתיאור
    if (!formData.description.trim()) {
      setFormError('יש להזין תיאור טיפול לפני יצירת היילייט');
      return;
    }
    
    // לוגיקה פשוטה לחילוץ ההיילייט - במציאות זה יכול להיות קריאה ל-API של בינה מלאכותית
    const sentences = formData.description.split('.');
    const highlight = sentences.length > 1 ? sentences[0] + '.' : formData.description;
    
    setFormData(prev => ({
      ...prev,
      highlight: highlight
    }));
  };
  
  const validateForm = () => {
    if (!formData.treatmentType) {
      setFormError('יש לבחור סוג טיפול');
      return false;
    }
    
    if (!formData.description.trim()) {
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
      await addTreatment(kidId, formData);
      // אם הפעולה הצליחה, הדיאלוג ייסגר אוטומטית מהקונטקסט
    } catch (err) {
      setFormError(err.message || 'שגיאה בהוספת טיפול');
    }
  };
  
  return (
    <Dialog
      open={isAddDialogOpen}
      onClose={closeAddDialog}
      maxWidth="md"
      fullWidth
      dir="rtl"
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">הוספת סיכום טיפול</Typography>
        <IconButton edge="end" color="inherit" onClick={closeAddDialog} aria-label="סגור">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {(formError || error) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {formError || error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            {/* סוג טיפול */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>סוג טיפול</InputLabel>
                <Select
                  name="treatmentType"
                  value={formData.treatmentType}
                  onChange={handleInputChange}
                  label="סוג טיפול"
                  disabled={loading || treatmentTypesStatus === 'loading'}
                >
                  <MenuItem value="">בחר סוג טיפול</MenuItem>
                  {treatmentTypesStatus === 'succeeded' && treatmentTypes.map((type) => (
                    <MenuItem key={type.id || type.name} value={type.name}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {treatmentTypesStatus === 'loading' && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="caption">טוען סוגי טיפולים...</Typography>
                </Box>
              )}
            </Grid>
            
            {/* תאריך טיפול */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="תאריך טיפול"
                type="date"
                name="treatmentDate"
                value={formData.treatmentDate}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
                disabled={loading}
              />
            </Grid>
            
            {/* מידע על המטפל (מוצג כשדה קריאה בלבד) */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="מטפל"
                value={`${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`}
                fullWidth
                disabled
                helperText="הטיפול יירשם בשם המשתמש המחובר למערכת"
              />
            </Grid>
            
            {/* רמת שיתוף פעולה */}
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
            
            {/* תיאור הטיפול */}
            <Grid item xs={12}>
              <TextField
                label="תיאור מהלך הטיפול"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
                required
                disabled={loading}
                placeholder="תאר את מהלך הטיפול, תגובות הילד, והתקדמות ביחס לטיפולים קודמים..."
              />
            </Grid>
            
            {/* נקודות חשובות עם כפתור ליצירה אוטומטית */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <TextField
                  label="נקודות חשובות / היילייט"
                  name="highlight"
                  value={formData.highlight}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={2}
                  disabled={loading}
                  placeholder="הוסף נקודות חשובות שיש לשים לב אליהן בטיפול הבא..."
                />
                <Button 
                  variant="outlined" 
                  onClick={generateHighlight}
                  disabled={loading || !formData.description.trim()}
                  sx={{ mt: 1 }}
                >
                  צור אוטומטית
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary">
                לחיצה על "צור אוטומטית" תיצור המלצה אוטומטית על בסיס תיאור הטיפול
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        
        <Divider />
        
        <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {loading ? 'שומר...' : 'שמור'}
            </Button>
          </Box>
          
          <Box>
            <Button
              variant="outlined"
              onClick={closeAddDialog}
              disabled={loading}
            >
              ביטול
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddTreatmentDialog;