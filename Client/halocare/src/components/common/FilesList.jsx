// src/components/common/FilesList.jsx
import { useDispatch, useSelector } from 'react-redux';
import { fetchDocumentsByEntityId, deleteDocument } from '../../Redux/features/documentsSlice';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, IconButton, Tooltip, Typography, Box, CircularProgress
} from '@mui/material';
import { 
  Download as DownloadIcon, Delete as DeleteIcon, 
  InsertDriveFile as FileIcon, Image as ImageIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import { useEffect } from 'react';

const FilesList = ({ entityId,entityType,showFileType =true, onDelete}) => {
  const dispatch = useDispatch();
  
  // קבלת נתונים מהרדקס
  const documents = useSelector(state => state.documents.documents);
  const status = useSelector(state => state.documents.status);
  const error = useSelector(state => state.documents.error);

// useEffect(() => {
//   console.log('entityId:', entityId, 'entityType:', entityType, 'autoFetch:', autoFetch);
//   if (autoFetch && entityId) {
//     console.log('טוען מסמכים אוטומטית עבור:', entityId, 'סוג:', entityType);
//     dispatch(fetchDocumentsByEntityId({ entityId, entityType }));
//   }
// }, [dispatch, entityId, entityType, autoFetch]);

useEffect(() => {
  console.log('entityId:', entityId, 'entityType:', entityType);
    dispatch(fetchDocumentsByEntityId({ entityId, entityType }));
},[dispatch, entityId, entityType]);

  // הורדת קובץ
  const handleDownload = (docId) => {
    window.open(`/api/Documents/${docId}/content`, '_blank');
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

  // תצוגת טעינה
  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  // תצוגת שגיאה
  if (status === 'failed') {
    return (
      <Typography color="error" p={2}>
        שגיאה: {error || 'אירעה שגיאה בטעינת המסמכים'}
      </Typography>
    );
  }

  // אין מסמכים
  if (!documents || documents.length === 0) {
    return (
      <Typography color="textSecondary" p={2} textAlign="center">
        אין מסמכים להצגה
      </Typography>
    );
  }

  // הצגת הטבלה
  return (
    <TableContainer component={Paper}>
      <Table size="small" aria-label="טבלת מסמכים">
        <TableHead>
          <TableRow>
            {showFileType && <TableCell>סוג</TableCell>}
            <TableCell>שם הקובץ</TableCell>
            <TableCell>תאריך העלאה</TableCell>
            <TableCell align="center">פעולות</TableCell>
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
              <TableCell align="center">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FilesList;