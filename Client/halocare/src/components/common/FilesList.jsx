// src/components/common/FilesList.jsx - מעודכן עם תמיכה בסינון

import { useDispatch, useSelector } from 'react-redux';
import { fetchDocumentsByEntityId, deleteDocument, clearDocuments } from '../../Redux/features/documentsSlice';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, IconButton, Tooltip, Typography, Box, CircularProgress,
  Alert, Chip
} from '@mui/material';
import { 
  Download as DownloadIcon, Delete as DeleteIcon, 
  InsertDriveFile as FileIcon, Image as ImageIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import { useEffect } from 'react';
import axios from './axiosConfig';

const FilesList = ({
  entityId,
  entityType,
  showFileType = true,
  onDelete,
  openDialog,
  closeDialog,
  filterByType = null,        // 🔥 חדש - סינון לפי סוג מסמך ('profile', 'document', או null לכל הסוגים)
  compact = false,            // 🔥 חדש - מצב קומפקטי
  maxHeight = null            // 🔥 חדש - גובה מקסימלי
}) => {
  const dispatch = useDispatch();
  
  // קבלת נתונים מהרדקס
  const documents = useSelector((state) => state.documents.documents);
  const status = useSelector((state) => state.documents.status);
  const error = useSelector((state) => state.documents.error);

  useEffect(() => {
    if (entityId && status === "idle") {
      dispatch(fetchDocumentsByEntityId({ entityId, entityType }));
    }
  }, [entityId, entityType, dispatch, status]);

  // 🔥 סינון מסמכים לפי סוג
  const filteredDocuments = filterByType 
    ? documents.filter(doc => doc.docType === filterByType)
    : documents;

  const handleDownload = async (docId, fileName) => {
    try {
      const response = await axios.get(`/Documents/${docId}/content`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `document_${docId}`;
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("שגיאה בהורדת הקובץ:", error);
      Swal.fire({
        icon: "error",
        title: "שגיאה בהורדת הקובץ",
        text: "לא ניתן להוריד את הקובץ כרגע. נסה שוב מאוחר יותר.",
        confirmButtonText: "אישור",
      });
    }
  };

  const handleDelete = async (docId) => {
    if (closeDialog) closeDialog();
    dispatch(clearDocuments());
    
    const result = await Swal.fire({
      title: "האם אתה בטוח?",
      text: "פעולה זו אינה ניתנת לביטול!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "כן, מחק!",
      cancelButtonText: "ביטול",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteDocument(docId)).unwrap();

        await new Promise((resolve) => {
          Swal.fire({
            title: "נמחק!",
            text: "המסמך נמחק בהצלחה",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            didClose: () => resolve(),
          });
        });

        if (openDialog) openDialog();
        if (onDelete) onDelete(docId);
      } catch (err) {
        Swal.fire({
          title: "שגיאה!",
          text: err || "אירעה שגיאה במחיקת המסמך",
          icon: "error",
          confirmButtonText: "אישור",
        });
      }
    } else if (openDialog) {
      openDialog();
    }
  };

  // החזרת אייקון לפי סוג המסמך
  const getFileIcon = (contentType, docType) => {
    if (
      contentType?.includes("image") ||
      docType === "profile" ||
      docType === "picture"
    ) {
      return <ImageIcon color="success" />;
    } else if (contentType?.includes("pdf")) {
      return <PdfIcon color="error" />;
    }
    return <FileIcon color="info" />;
  };

  // 🔥 קבלת תווית סוג מסמך
  const getDocTypeLabel = (docType) => {
    switch (docType) {
      case 'profile':
        return { label: 'תמונת פרופיל', color: 'secondary' };
      case 'document':
        return { label: 'מסמך', color: 'primary' };
      default:
        return { label: 'אחר', color: 'default' };
    }
  };

  // תצוגת טעינה
  if (status === "loading") {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          טוען מסמכים...
        </Typography>
      </Box>
    );
  }

  // תצוגת שגיאה
  if (status === "failed") {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <Typography variant="h6">שגיאה בטעינת מסמכים</Typography>
        {error || "אירעה שגיאה בטעינת המסמכים"}
      </Alert>
    );
  }

  // אין מסמכים
  if (!filteredDocuments || filteredDocuments.length === 0) {
    const messageByFilter = filterByType === 'profile' 
      ? 'אין תמונות פרופיל'
      : filterByType === 'document' 
      ? 'אין מסמכים רגילים'
      : 'אין מסמכים להצגה';
      
    return (
      <Box p={2} textAlign="center">
        <Typography color="textSecondary">
          {messageByFilter}
        </Typography>
        {!filterByType && (
          <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
            ניתן להעלות מסמכים באמצעות כפתור "העלאת מסמכים"
          </Typography>
        )}
      </Box>
    );
  }

  // 🔥 תצוגה קומפקטית
  if (compact) {
    return (
      <Box sx={{ maxHeight: maxHeight || 200, overflow: 'auto' }}>
        {filteredDocuments.map((doc) => {
          const typeInfo = getDocTypeLabel(doc.docType);
          
          return (
            <Box 
              key={doc.docId}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1,
                borderBottom: '1px solid #f0f0f0',
                '&:hover': { backgroundColor: '#f9f9f9' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                {getFileIcon(doc.contentType, doc.docType)}
                <Box sx={{ ml: 1, minWidth: 0, flex: 1 }}>
                  <Typography 
                    variant="body2" 
                    noWrap
                    title={doc.docName}
                  >
                    {doc.docName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <Chip
                      label={typeInfo.label}
                      size="small"
                      color={typeInfo.color}
                      sx={{ fontSize: '0.65rem', height: 16 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(doc.uploadDate).toLocaleDateString('he-IL')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="הורד">
                  <IconButton
                    size="small"
                    onClick={() => handleDownload(doc.docId, doc.docName)}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="מחק">
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(doc.docId)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }

  // תצוגת טבלה מלאה
  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        maxHeight: maxHeight,
        '& .MuiTableCell-root': {
          borderBottom: '1px solid #f0f0f0'
        }
      }}
    >
      <Table size="small" aria-label="טבלת מסמכים" stickyHeader>
        <TableHead>
          <TableRow sx={{ '& .MuiTableCell-head': { backgroundColor: '#fafafa' } }}>
            {showFileType && (
              <TableCell>
                <Typography variant="subtitle2" fontWeight="bold">
                  סוג
                </Typography>
              </TableCell>
            )}
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                שם הקובץ
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                תאריך העלאה
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                גודל
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="subtitle2" fontWeight="bold">
                פעולות
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredDocuments.map((doc) => {
            const typeInfo = getDocTypeLabel(doc.docType);
            
            return (
              <TableRow 
                key={doc.docId} 
                hover
                sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
              >
                {showFileType && (
                  <TableCell sx={{ width: 60 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getFileIcon(doc.contentType, doc.docType)}
                      <Chip
                        label={typeInfo.label}
                        size="small"
                        color={typeInfo.color}
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </Box>
                  </TableCell>
                )}
                <TableCell>
                  <Typography variant="body2" title={doc.docName}>
                    {doc.docName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(doc.uploadDate).toLocaleDateString('he-IL')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : '-'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    <Tooltip title="הורד קובץ">
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(doc.docId, doc.docName)}
                        color="primary"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="מחק קובץ">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(doc.docId)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FilesList;