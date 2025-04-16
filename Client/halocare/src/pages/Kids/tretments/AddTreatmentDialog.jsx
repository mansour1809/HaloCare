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
import { useTreatmentContext } from '../../context/TreatmentContext';
import { fetchTreatmentTypes } from '../../store/slices/treatmentTypesSlice';
import axios from '../../components/common/axiosConfig';

const AddTreatmentDialog = ({ kidId, treatmentType = null }) => {
  const { isAddDialogOpen, closeAddDialog, addTreatment, loading, error } = useTreatmentContext();
  const dispatch = useDispatch();
  
  // שליפת סוגי טיפולים מהסטור
  const { treatmentTypes, status: treatmentTypesStatus } = useSelector(state => state.treatmentTypes);
  
  const [employees, setEmployees] = useState([]);
  const [formError, setFormError] = useState('');
  
  const [formData, setFormData] = useState({
    kidId: kidId,
    employeeId: '',
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
        employeeId: '',
        treatmentDate: new Date().toISOString().split('T')[0],
        treatmentType: treatmentType || '',
        description: '',
        cooperationLevel: 3,
        status: 'active',
        highlight: ''
      });
      setFormError('');
    }
  }, [isAddDialogOpen, kidId, treatmentType]);
  
  // טעינת רשימת עובדים וסוגי טיפולים
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("/api/Employees?role=therapist");
        setEmployees(response.data);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setFormError('שגיאה בטעינת רשימת המטפלים');
      }
    };
    
    if (isAddDialogOpen) {
      // טען סוגי טיפולים אם לא נטענו כבר
      if (treatmentTypesStatus === 'idle') {
        dispatch(fetchTreatmentTypes());
      }
      
      // טען רשימת עובדים
      fetchEmployees();
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
  
  const validateForm = () => {
    if (!formData.employeeId) {
      setFormError('יש לבחור מטפל');
      return false;
    }
    
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
        <IconButton edge="end" color="inherit" onClick={closeAddDialog}>
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
            
            {/* מטפל */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>מטפל</InputLabel>
                <Select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  label="מטפל"
                  disabled={loading}
                >
                  <MenuItem value="">בחר מטפל</MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
            
            {/* נקודות חשובות */}
            <Grid item xs={12}>
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