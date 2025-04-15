// src/components/components/common/FilesList.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDocumentsByEmployeeId, fetchDocumentsByKidId, deleteDocument } from '../../Redux/features/documentsSlice';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  Tooltip,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { 
  Download as DownloadIcon, 
  Delete as DeleteIcon, 
  InsertDriveFile as FileIcon, 
  Image as ImageIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';

const FilesList = ({
  entityId,
  entityType, // 'employee' או 'kid'
  showFileType = true,
  onDelete
}) => {
  const dispatch = useDispatch();
  const { documents, status, error } = useSelector(state => state.documents);

  useEffect(() => {
    if (entityId) {
      if (entityType === 'employee') {
        dispatch(fetchDocumentsByEmployeeId(entityId));
      } else if (entityType === 'kid') {
        dispatch(fetchDocumentsByKidId(entityId));
      }
    }
  }, [dispatch, entityId, entityType]);

  // הורדת קובץ
  const handleDownload = (docId, fileName) => {
    // יצירת לינק זמני להורדה
    const downloadLink = document.createElement('a');
    downloadLink.href = `/api/Documents/${docId}/content`;
    downloadLink.download = fileName || `document-${docId}`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // מחיקת מסמך
  const handleDelete = async (docId) => {
    const result = await Swal.fire({
      title: 'האם אתה בטוח?',
      text: 'פעולה זו אינה ניתנת לביטול!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'כן, מחק!',
      cancelButtonText: 'ביטול'
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteDocument(docId)).unwrap();
        Swal.fire({
          title: 'נמחק!',
          text: 'המסמך נמחק בהצלחה',
          icon: 'success',
          confirmButtonText: 'אישור'
        });
        
        if (onDelete) onDelete(docId);
      } catch (err) {
        Swal.fire({
          title: 'שגיאה!',
          text: err || 'אירעה שגיאה במחיקת המסמך',
          icon: 'error',
          confirmButtonText: 'אישור'
        });
      }
    }
  };

  // החזרת אייקון לפי סוג המסמך
  const getFileIcon = (contentType, docType) => {
    if (contentType?.includes('image') || docType === 'profile' || docType === 'picture') {
      return <ImageIcon color="success" />;
    } else if (contentType?.includes('pdf')) {
      return <PdfIcon color="error" />;
    }
    return <FileIcon color="info" />;
  };

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'failed') {
    return (
      <Typography color="error" p={2}>
        שגיאה: {error || 'אירעה שגיאה בטעינת המסמכים'}
      </Typography>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Typography color="textSecondary" p={2}>
        אין מסמכים להצגה
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table aria-label="טבלת מסמכים">
        <TableHead>
          <TableRow>
            {showFileType && <TableCell>סוג מסמך</TableCell>}
            <TableCell>שם הקובץ</TableCell>
            <TableCell>תאריך העלאה</TableCell>
            <TableCell>פעולות</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {documents.map(doc => (
            <TableRow key={doc.docId} hover>
              {showFileType && (
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {getFileIcon(doc.contentType, doc.docType)}
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {doc.docType}
                    </Typography>
                  </Box>
                </TableCell>
              )}
              <TableCell>{doc.docName || 'קובץ ללא שם'}</TableCell>
              <TableCell>
                {new Date(doc.uploadDate).toLocaleDateString('he-IL')}
              </TableCell>
              <TableCell>
                <Box display="flex">
                  <Tooltip title="הורד">
                    <IconButton
                      color="primary"
                      onClick={() => handleDownload(doc.docId, doc.docName)}
                      size="small"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="מחק">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(doc.docId)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FilesList;