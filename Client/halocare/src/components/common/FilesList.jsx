// src/components/common/FilesList.jsx
import { useDispatch, useSelector } from 'react-redux';
import { fetchDocumentsByEntityId, deleteDocument, clearDocuments } from '../../Redux/features/documentsSlice';
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
import { useEffect} from 'react';
import axios from './axiosConfig';



const FilesList = ({
  entityId,
  entityType,
  showFileType = true,
  onDelete,
  openDialog,
  closeDialog,
}) => {
  const dispatch = useDispatch();
  // קבלת נתונים מהרדקס
  const documents = useSelector((state) => state.documents.documents);
  const status = useSelector((state) => state.documents.status);
  const error = useSelector((state) => state.documents.error);


  useEffect(() => {
    console.log(entityId)
    if (entityId) {

if(status === "idle")
    dispatch(fetchDocumentsByEntityId({ entityId, entityType }));

    }
  }, [entityId,entityType, dispatch, status]);

  
    
  const handleDownload = async (docId, fileName) => {
    try {
      // response from the server a file type - blob
      const response = await axios.get(`/Documents/${docId}/content`, {
        responseType: "blob",
      });

      // creating url for the bloc- file func
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      // create a link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `document_${docId}`;
      document.body.appendChild(link);
      link.click();

      //cleanup
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

  // delete document
  const handleDelete = async (docId) => {
    closeDialog();
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

        openDialog();
        if (onDelete) onDelete(docId);
      } catch (err) {
        Swal.fire({
          title: "שגיאה!",
          text: err || "אירעה שגיאה במחיקת המסמך",
          icon: "error",
          confirmButtonText: "אישור",
        });
      }
    }
    else 
      openDialog();
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

  // תצוגת טעינה
  if (status === "loading") {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  // תצוגת שגיאה
  if (status === "failed") {
    return (
      <Typography color="error" p={2}>
        שגיאה: {error || "אירעה שגיאה בטעינת המסמכים"}
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
          {documents.map((doc) => (
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
              <TableCell>{doc.docName || "קובץ ללא שם"}</TableCell>
              <TableCell>
                {new Date(doc.uploadDate).toLocaleDateString("he-IL")}
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