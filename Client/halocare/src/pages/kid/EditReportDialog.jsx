import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { updateTasheReport } from '../../Redux/features/tasheReportsSlice';
import { useAuth } from '../../components/login/AuthContext';

const EditReportDialog = ({ open, onClose, report, onSuccess }) => {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    reportTitle: '',
    reportContent: '',
    notes: ''
  });

  // טעינת נתוני הדוח כשנפתח הדיאלוג
  useEffect(() => {
    if (open && report) {
      setFormData({
        reportTitle: report.reportTitle || '',
        reportContent: report.reportContent || '',
        notes: report.notes || ''
      });
      setError('');
    }
  }, [open, report]);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError(''); // נקה שגיאות כשמשנים
  };

  const handleSave = async () => {
    // בדיקות תקינות
    if (!formData.reportTitle.trim()) {
      setError('כותרת הדוח היא שדה חובה');
      return;
    }

    if (!formData.reportContent.trim()) {
      setError('תוכן הדוח הוא שדה חובה');
      return;
    }

    if (formData.reportContent.length < 50) {
      setError('תוכן הדוח חייב להכיל לפחות 50 תווים');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updateData = {
        reportTitle: formData.reportTitle.trim(),
        reportContent: formData.reportContent.trim(),
        notes: formData.notes.trim() || null,
        updatedByEmployeeId: currentUser.id
      };

      await dispatch(updateTasheReport({ 
        reportId: report.reportId, 
        reportData: updateData 
      })).unwrap();

      // הצלחה
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setError(err.message || 'שגיאה בעדכון הדוח');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // מניעת סגירה במהלך שמירה
    onClose();
  };

  if (!report) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pb: 1 }}>
        <EditIcon sx={{ mr: 2, color: 'primary.main' }} />
        <Box>
          <Typography variant="h6">
            עריכת דוח תש"ה
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {report.kidName} • {new Date(report.periodStartDate).toLocaleDateString('he-IL')} - {new Date(report.periodEndDate).toLocaleDateString('he-IL')}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* מידע על הדוח */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            מידע על הדוח:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={`נוצר: ${new Date(report.generatedDate).toLocaleDateString('he-IL')}`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`על ידי: ${report.generatedByEmployeeName}`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={report.isApproved ? "מאושר" : "ממתין לאישור"} 
              size="small" 
              color={report.isApproved ? "success" : "warning"}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* כותרת הדוח */}
        <TextField
          fullWidth
          label="כותרת הדוח"
          value={formData.reportTitle}
          onChange={handleInputChange('reportTitle')}
          required
          disabled={loading}
          sx={{ mb: 3 }}
          helperText="כותרת זו תופיע בראש הדוח ובשם הקובץ"
        />

        {/* תוכן הדוח */}
        <TextField
          fullWidth
          multiline
          rows={12}
          label="תוכן הדוח"
          value={formData.reportContent}
          onChange={handleInputChange('reportContent')}
          required
          disabled={loading}
          sx={{ mb: 3 }}
          helperText={`${formData.reportContent.length} תווים (מינימום 50)`}
        />

        {/* הערות */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="הערות נוספות (אופציונלי)"
          value={formData.notes}
          onChange={handleInputChange('notes')}
          disabled={loading}
          helperText="הערות אלו יופיעו בפרטי הדוח"
        />

        {/* אזהרה על עריכה */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>שימו לב:</strong>
          <br />• עריכת הדוח תתועד במערכת
          <br />• לא ניתן לערוך דוח שכבר אושר
          <br />• השינויים יחליפו את התוכן הקיים במלואו
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
          startIcon={<CloseIcon />}
        >
          ביטול
        </Button>
        
        <Button 
          variant="contained"
          onClick={handleSave}
          disabled={loading || !formData.reportTitle.trim() || !formData.reportContent.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'שומר...' : 'שמירת שינויים'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditReportDialog;