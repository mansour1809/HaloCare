// src/components/common/FileUploader.jsx
import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { uploadDocument } from '../../Redux/features/documentsSlice';
import Swal from 'sweetalert2';
import { 
  Button, Typography, Box, CircularProgress, 
  Paper, Chip, Alert
} from '@mui/material';
import { 
  CloudUpload as UploadIcon, 
  InsertDriveFile as FileIcon, 
  Image as ImageIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';

const FileUploader = ({ 
  entityId, 
  entityType,  // 'employee' או 'kid'
  docType,     // סוג המסמך
  onSuccess,
  allowedTypes = '*',
  maxSize = 5 * 1024 * 1024, // 5MB ברירת מחדל
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

    // בדיקת גודל קובץ
    if (file.size > maxSize) {
      setError(`הגודל המקסימלי המותר הוא ${Math.round(maxSize / 1024 / 1024)} MB`);
      return;
    }

    // בדיקת סוג קובץ
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
    if (!selectedFile) return;
    if (!entityId) {
      setError("חסר מזהה ישות (entityId)");
      return;
    }

    setLoading(true);
    setError(null);
    
    const documentData = {
      document: {
        KidId: entityType === 'kid' ? entityId : null,
        EmployeeId: entityType === 'employee' ? entityId : null,
        DocType: docType || 'document' // ערך ברירת מחדל אם חסר
      },
      file: selectedFile
    };

    try {
      const result = await dispatch(uploadDocument(documentData)).unwrap();
      
      // הודעת הצלחה
      Swal.fire({
        icon: 'success',
        title: 'הקובץ הועלה בהצלחה',
        confirmButtonText: 'אישור'
      });
      
      // ניקוי הטופס
      resetForm();
      
      // קריאה לפונקציית הקולבק
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError(err || 'אירעה שגיאה בהעלאת הקובץ');
    } finally {
      setLoading(false);
    }
  };

  // איפוס הטופס
  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // הצגת אייקון מתאים לסוג הקובץ
  const getFileIcon = () => {
    if (!selectedFile) return null;
    
    if (selectedFile.type.includes('pdf')) {
      return <PdfIcon fontSize="large" color="error" />;
    } else if (selectedFile.type.includes('image')) {
      return <ImageIcon fontSize="large" color="success" />;
    }
    return <FileIcon fontSize="large" color="info" />;
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        העלאת קובץ {docType ? `(${docType})` : ''}
      </Typography>
      
      {/* הודעת שגיאה */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* כפתור בחירת קובץ */}
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
          startIcon={<UploadIcon />}
          disabled={loading}
        >
          {buttonText}
        </Button>
        
        {/* הצגת שם הקובץ שנבחר */}
        {selectedFile && (
          <Chip
            label={`${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)`}
            onDelete={resetForm}
            color="primary"
            variant="outlined"
            sx={{ ml: 2 }}
          />
        )}
      </Box>

      {/* תצוגה מקדימה */}
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

      {/* אייקון לפי סוג הקובץ */}
      {selectedFile && !preview && showPreview && (
        <Box display="flex" alignItems="center" mb={2}>
          {getFileIcon()}
          <Typography variant="body2" ml={1}>
            סוג קובץ: {selectedFile.type || 'לא מזוהה'}
          </Typography>
        </Box>
      )}

      {/* כפתור העלאה */}
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