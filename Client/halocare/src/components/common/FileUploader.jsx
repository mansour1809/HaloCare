// src/components/common/FileUploader.jsx - Extended with improved child support

import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { 
  Box, Button, Typography, Paper, Alert, CircularProgress,
  IconButton, Grid, Card, CardContent, LinearProgress, Fade
} from '@mui/material';
import { 
  CloudUpload, InsertDriveFile, Image, PictureAsPdf,
  Delete as DeleteIcon, CheckCircle as CheckIcon
} from '@mui/icons-material';
import { uploadDocument } from '../../Redux/features/documentsSlice';

const FileUploader = ({ 
  entityId, 
  entityType,
  docType = 'document',
  onSuccess,
  allowedTypes = '*',
  maxSize = 5 * 1024 * 1024,
  buttonText = 'בחר קובץ',
  showPreview = true,
  allowMultiple = false,      // Option to upload multiple files
  title = 'העלאת קובץ',      // Custom title
  compact = false,            // Compact mode
  dragAndDrop = false,        // Drag & drop
  maxFiles = 5                // Maximum number of files
}) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  
  // States
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragOver, setDragOver] = useState(false);

  // Validate file
  const validateFile = (file) => {
    // Check size
    if (file.size > maxSize) {
      return `הגודל המקסימלי המותר הוא ${Math.round(maxSize / 1024 / 1024)} MB`;
    }

    // Check file type
    if (allowedTypes !== '*' && !file.type.match(allowedTypes)) {
      return `יש להעלות רק קבצים מסוג ${allowedTypes}`;
    }

    return null;
  };

  // Handle file selection
  const handleFileChange = (files) => {
    setError(null);
    const fileArray = Array.from(files);
    
    // Check number of files
    if (!allowMultiple && fileArray.length > 1) {
      setError('ניתן לבחור קובץ אחד בלבד');
      return;
    }

    if (selectedFiles.length + fileArray.length > maxFiles) {
      setError(`ניתן להעלות מקסימום ${maxFiles} קבצים`);
      return;
    }

    // Validate each file
    const validFiles = [];
    const newPreviews = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      validFiles.push(file);

      // Create preview for images
      if (file.type.startsWith('image/') && showPreview) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push({
            file: file,
            preview: e.target.result,
            type: 'image'
          });
          setPreviews(prev => [...prev, ...newPreviews]);
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push({
          file: file,
          preview: null,
          type: getFileType(file.type)
        });
      }
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    if (newPreviews.some(p => p.preview === null)) {
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // Get file type for icon
  const getFileType = (mimeType) => {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('image')) return 'image';
    return 'file';
  };

  // Get icon based on file type
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <PictureAsPdf fontSize="large" color="error" />;
      case 'image':
        return <Image fontSize="large" color="success" />;
      default:
        return <InsertDriveFile fontSize="large" color="info" />;
    }
  };

  // Remove file from list
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  };

  // Upload files
  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !entityId) {
      setError("נא לבחור קבצים ולוודא שיש מזהה ישות");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        setUploadProgress(prev => ({ ...prev, [index]: 0 }));

        const documentData = {
          document: {
            KidId: entityType === 'kid' ? entityId : null,
            EmployeeId: entityType === 'employee' ? entityId : null,
            DocType: docType,
            DocName: file.name
          },
          file: file
        };

        // Simulate progress (in reality, this would come from the request)
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [index]: Math.min((prev[index] || 0) + 10, 90)
          }));
        }, 200);

        try {
          const result = await dispatch(uploadDocument(documentData)).unwrap();
          clearInterval(progressInterval);
          setUploadProgress(prev => ({ ...prev, [index]: 100 }));
          return result;
        } catch (error) {
          clearInterval(progressInterval);
          throw error;
        }
      });

      const results = await Promise.all(uploadPromises);
      
      // Reset form
      setSelectedFiles([]);
      setPreviews([]);
      setUploadProgress({});
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Success message
      Swal.fire({
        icon: 'success',
        title: 'הקבצים הועלו בהצלחה',
        text: `${results.length} קבצים הועלו בהצלחה`,
        timer: 1500,
        showConfirmButton: false
      });
      
      // Callback function
      if (onSuccess) onSuccess(results);
      
    } catch (err) {
      const errorMessage = typeof err === 'object' ? 
        (err.message || 'שגיאה בהעלאת הקבצים') : err;
      setError(errorMessage);
      
      Swal.fire({
        icon: 'error',
        title: 'שגיאה בהעלאת קבצים',
        text: errorMessage,
        confirmButtonText: 'אישור'
      });
    } finally {
      setLoading(false);
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    if (dragAndDrop) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (dragAndDrop && e.dataTransfer.files) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  // Compact component
  if (compact) {
    return (
      <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, textAlign: 'center' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileChange(e.target.files)}
          accept={allowedTypes}
          multiple={allowMultiple}
          style={{ display: 'none' }}
        />
        
        <Button
          variant="outlined"
          onClick={() => fileInputRef.current?.click()}
          startIcon={<CloudUpload />}
          disabled={loading}
          size="small"
        >
          {buttonText}
        </Button>
        
        {selectedFiles.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption">
              {selectedFiles.length} קבצים נבחרו
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={handleUpload}
              disabled={loading}
              sx={{ ml: 1 }}
            >
              העלה
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  // Full component
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 3, 
        mb: 2,
        border: dragOver ? '2px dashed #1976d2' : '1px solid #e0e0e0',
        backgroundColor: dragOver ? 'rgba(25, 118, 210, 0.04)' : 'white',
        transition: 'all 0.3s ease'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* File selection area */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          p: 3,
          border: '2px dashed #e0e0e0',
          borderRadius: 2,
          backgroundColor: dragAndDrop ? '#fafafa' : 'transparent',
          cursor: 'pointer',
          '&:hover': {
            borderColor: '#1976d2',
            backgroundColor: 'rgba(25, 118, 210, 0.04)'
          }
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="body1" gutterBottom>
          {dragAndDrop ? 'גרור קבצים כאן או לחץ לבחירה' : 'לחץ לבחירת קבצים'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {allowMultiple ? `עד ${maxFiles} קבצים` : 'קובץ אחד'} • 
          מקסימום {Math.round(maxSize / 1024 / 1024)} MB לקובץ
        </Typography>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileChange(e.target.files)}
          accept={allowedTypes}
          multiple={allowMultiple}
          style={{ display: 'none' }}
        />
      </Box>

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <Fade in={true}>
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              קבצים נבחרים ({selectedFiles.length}):
            </Typography>
            
            <Grid container spacing={2}>
              {previews.map((preview, index) => (
                <Grid item size={{xs:12, sm:6, md:4 }} key={index}>
                  <Card variant="outlined" sx={{ position: 'relative' }}>
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      {/* Icon/Image */}
                      {preview.preview ? (
                        <img 
                          src={preview.preview} 
                          alt="תצוגה מקדימה" 
                          style={{ 
                            maxHeight: 80, 
                            maxWidth: '100%',
                            borderRadius: 4
                          }} 
                        />
                      ) : (
                        getFileIcon(preview.type)
                      )}
                      
                      {/* File name */}
                      <Typography 
                        variant="caption" 
                        display="block" 
                        sx={{ mt: 1, wordBreak: 'break-word' }}
                      >
                        {preview.file.name}
                      </Typography>
                      
                      {/* File size */}
                      <Typography variant="caption" color="text.secondary">
                        {Math.round(preview.file.size / 1024)} KB
                      </Typography>
                      
                      {/* Progress bar */}
                      {uploadProgress[index] !== undefined && (
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={uploadProgress[index]} 
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                          <Typography variant="caption" color="primary">
                            {uploadProgress[index]}%
                          </Typography>
                        </Box>
                      )}
                      
                      {/* Delete button */}
                      {!loading && (
                        <IconButton
                          size="small"
                          onClick={() => removeFile(index)}
                          sx={{ 
                            position: 'absolute', 
                            top: 4, 
                            right: 4,
                            backgroundColor: 'rgba(255,255,255,0.8)'
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                      
                      {/* Success icon */}
                      {uploadProgress[index] === 100 && (
                        <CheckIcon 
                          sx={{ 
                            position: 'absolute', 
                            top: 4, 
                            left: 4,
                            color: 'success.main'
                          }} 
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      )}

      {/* Upload button */}
      {selectedFiles.length > 0 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
            size="large"
          >
            {loading ? `מעלה... (${Object.keys(uploadProgress).length}/${selectedFiles.length})` : `העלה ${selectedFiles.length} קבצים`}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default FileUploader;