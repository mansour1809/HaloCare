// src/components/common/FileUploader.jsx
import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { uploadDocument } from '../../Redux/features/documentsSlice';
import Swal from 'sweetalert2';
import { 
  Button, Typography, Box, CircularProgress, 
  Paper, Chip, Alert
} from '@mui/material';
import { CloudUpload, InsertDriveFile, Image, PictureAsPdf } from '@mui/icons-material';

const FileUploader = ({ 
  entityId, 
  entityType,
  docType = 'document',
  onSuccess,
  allowedTypes = '*',
  maxSize = 5 * 1024 * 1024,
  buttonText = 'בחר קובץ',
  showPreview = true
}) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // טיפול בבחירת קובץ
  const handleFileChange = (e) => {
    setError(null);
    const file = e.target.files[0];
    if (!file) return;

    // בדיקות תקינות
    if (file.size > maxSize) {
      setError(`הגודל המקסימלי המותר הוא ${Math.round(maxSize / 1024 / 1024)} MB`);
      return;
    }

    if (allowedTypes !== '*' && !file.type.match(allowedTypes)) {
      setError(`יש להעלות רק קבצים מסוג ${allowedTypes}`);
      return;
    }

    setSelectedFile(file);
    
    // יצירת תצוגה מקדימה עבור תמונות
    if (file.type.startsWith('image/') && showPreview) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // העלאת הקובץ
  const handleUpload = async () => {
    if (!selectedFile || !entityId) {
      setError("נא לבחור קובץ ולוודא שיש מזהה ישות");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // הכנת נתוני המסמך
      const documentData = {
        document: {
          KidId: entityType === 'kid' ? entityId : null,
          EmployeeId: entityType === 'employee' ? entityId : null,
          DocType: docType,
          DocName: selectedFile.name
        },
        file: selectedFile
      };

      // העלאת המסמך
      const result = await dispatch(uploadDocument(documentData)).unwrap();
      
      // איפוס הטופס
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // הודעת הצלחה
      Swal.fire({
        icon: 'success',
        title: 'הקובץ הועלה בהצלחה',
        timer: 1500,
        showConfirmButton: false
      });
      
      // קריאה לפונקציית קולבק עם תוצאת ההעלאה
      if (onSuccess) onSuccess(result);
      
    } catch (err) {
      const errorMessage = typeof err === 'object' ? (err.message || 'שגיאה בהעלאת הקובץ') : err;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // הצגת אייקון מתאים לסוג הקובץ
  const getFileIcon = () => {
    if (!selectedFile) return null;
    
    if (selectedFile.type.includes('pdf')) {
      return <PictureAsPdf fontSize="large" color="error" />;
    } else if (selectedFile.type.includes('image')) {
      return <Image fontSize="large" color="success" />;
    }
    return <InsertDriveFile fontSize="large" color="info" />;
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        העלאת {docType === 'profile' ? 'תמונת פרופיל' : 'מסמך'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Box display="flex" alignItems="center" mb={2}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={allowedTypes}
          style={{ display: 'none' }}
        />
        <Button
          variant="contained"
          onClick={() => fileInputRef.current.click()}
          startIcon={<CloudUpload />}
          disabled={loading}
        >
          {buttonText}
        </Button>
        
        {selectedFile && (
          <Chip
            label={`${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)`}
            onDelete={() => {
              setSelectedFile(null);
              setPreview(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            color="primary"
            variant="outlined"
            sx={{ ml: 2 }}
          />
        )}
      </Box>

      {preview && showPreview && (
        <Box mb={2} maxWidth={300} maxHeight={200} overflow="hidden">
          <img 
            src={preview} 
            alt="תצוגה מקדימה" 
            style={{ 
              maxHeight: '100%', 
              maxWidth: '100%', 
              borderRadius: 4,
              objectFit: 'contain'
            }} 
          />
        </Box>
      )}

      {selectedFile && !preview && showPreview && (
        <Box display="flex" alignItems="center" mb={2}>
          {getFileIcon()}
          <Typography variant="body2" ml={1}>
            סוג קובץ: {selectedFile.type || 'לא מזוהה'}
          </Typography>
        </Box>
      )}

      {selectedFile && (
        <Button
          variant="contained"
          color="success"
          onClick={handleUpload}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'מעלה...' : 'העלה קובץ'}
        </Button>
      )}
    </Paper>
  );
};

export default FileUploader;