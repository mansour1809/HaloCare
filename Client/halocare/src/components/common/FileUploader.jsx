import  { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { uploadDocument } from '../../Redux/features/documentsSlice';
import Swal from 'sweetalert2';
import { 
  Button, 
  Typography, 
  Box, 
  CircularProgress, 
  IconButton,
  Paper,
  Chip
} from '@mui/material';
import { 
  CloudUpload as UploadIcon, 
  InsertDriveFile as FileIcon, 
  Image as ImageIcon, 
  Close as CloseIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';

const FileUploader = ({ 
  entityId, 
  entityType, // 'employee' או 'kid'
  docType,    // 'profile', 'document', 'picture', וכו'
  onSuccess,
  allowedTypes = '*', // אופציונלי, למשל "image/*" רק לתמונות
  maxSize = 5 * 1024 * 1024, // 5MB ברירת מחדל
  buttonText = 'בחר קובץ',
  showPreview = true
}) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // טיפול בבחירת קובץ
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // בדיקת גודל קובץ
    if (file.size > maxSize) {
      Swal.fire({
        icon: 'error',
        title: 'הקובץ גדול מדי',
        text: `הגודל המקסימלי המותר הוא ${Math.round(maxSize / 1024 / 1024)} MB`,
        confirmButtonText: 'אישור'
      });
      return;
    }

    // בדיקת סוג קובץ אם יש הגבלה
    if (allowedTypes !== '*' && !file.type.match(allowedTypes)) {
      Swal.fire({
        icon: 'error',
        title: 'סוג קובץ לא מורשה',
        text: `יש להעלות רק קבצים מסוג ${allowedTypes}`,
        confirmButtonText: 'אישור'
      });
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

  // פתיחת חלון בחירת קבצים
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // העלאת הקובץ לשרת
  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    
    const documentData = {
      document: {
        KidId: entityType === 'kid' ? entityId : null,
        EmployeeId: entityType === 'employee' ? entityId : null,
        DocType: docType
      },
      file: selectedFile
    };

    try {
      const resultAction = await dispatch(uploadDocument(documentData));
      if (uploadDocument.fulfilled.match(resultAction)) {
        Swal.fire({
          icon: 'success',
          title: 'הקובץ הועלה בהצלחה',
          confirmButtonText: 'אישור'
        });
        
        // ניקוי הטופס
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        // קריאה לפונקציית הקולבק עם המסמך שהועלה
        if (onSuccess) onSuccess(resultAction.payload);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'שגיאה בהעלאת הקובץ',
        text: error.message || 'אירעה שגיאה, אנא נסה שוב מאוחר יותר',
        confirmButtonText: 'אישור'
      });
    } finally {
      setLoading(false);
    }
  };

  // ניקוי הקובץ שנבחר
  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
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
          color="primary"
          onClick={handleButtonClick}
          startIcon={<UploadIcon />}
          disabled={loading}
          sx={{ ml: 1 }}
        >
          {buttonText}
        </Button>
        
        {selectedFile && (
          <Box display="flex" alignItems="center" ml={2}>
            <Chip
              label={`${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)`}
              onDelete={handleClear}
              color="default"
              variant="outlined"
            />
          </Box>
        )}
      </Box>

      {/* תצוגה מקדימה */}
      {preview && showPreview && (
        <Box mb={2} maxWidth={300}>
          <Box 
            component="img" 
            src={preview} 
            alt="תצוגה מקדימה" 
            sx={{ 
              maxHeight: 200, 
              maxWidth: '100%', 
              borderRadius: 1,
              objectFit: 'contain'
            }} 
          />
        </Box>
      )}

      {/* אייקון לפי סוג הקובץ אם אינו תמונה */}
      {selectedFile && !preview && showPreview && (
        <Box display="flex" alignItems="center" mb={2}>
          {selectedFile.type.includes('pdf') ? (
            <PdfIcon fontSize="large" color="error" />
          ) : selectedFile.type.includes('image') ? (
            <ImageIcon fontSize="large" color="success" />
          ) : (
            <FileIcon fontSize="large" color="info" />
          )}
          <Typography variant="body2" ml={1}>
            סוג קובץ: {selectedFile.type}
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