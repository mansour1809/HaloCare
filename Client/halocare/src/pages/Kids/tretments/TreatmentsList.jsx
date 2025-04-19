// src/components/treatments/TreatmentsList.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  IconButton, 
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Search as SearchIcon 
} from '@mui/icons-material';
import { fetchTreatmentsByKid } from '../../../Redux/features/treatmentsSlice';
import { useTreatmentContext } from './TreatmentContext';
import TreatmentViewDialog from './TreatmentViewDialog';
import AddTreatmentDialog from './AddTreatmentDialog';

const TreatmentsList = () => {
  const { kidId, treatmentType } = useParams();
  const dispatch = useDispatch();
  
  // שליפת state מהסטור
  const { treatments, status, error } = useSelector(state => state.treatments);
  
  const { openAddDialog, openViewDialog } = useTreatmentContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTreatments, setFilteredTreatments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // טעינת טיפולים בעת טעינת הדף
  useEffect(() => {
    if (kidId) {
      dispatch(fetchTreatmentsByKid({ kidId, treatmentType }));
    }
  }, [dispatch, kidId, treatmentType]);

  // סינון טיפולים
  useEffect(() => {
    if (!treatments || treatments.length === 0) {
      setFilteredTreatments([]);
      return;
    }
    
    // סינון לפי חיפוש חופשי
    if (searchTerm.trim() === '') {
      setFilteredTreatments(treatments);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredTreatments(
        treatments.filter(treatment => 
          treatment.description?.toLowerCase().includes(term) ||
          treatment.highlight?.toLowerCase().includes(term) ||
          treatment.treatmentType?.toLowerCase().includes(term) ||
          treatment.employeeName?.toLowerCase().includes(term)
        )
      );
    }
  }, [treatments, searchTerm]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };

  // עיצוב הכותרת של הדף
  const renderTitle = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
        סיכומי טיפולים {treatmentType ? `- ${treatmentType}` : ''}
      </Typography>
      <Button 
        variant="contained" 
        startIcon={<AddIcon />} 
        onClick={() => openAddDialog()}
        sx={{ fontWeight: 'bold' }}
      >
        סיכום חדש
      </Button>
    </Box>
  );

  // תצוגת טבלת הטיפולים
  const renderTreatmentsTable = () => (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="right">שם הטיפול</TableCell>
              <TableCell align="right">תאריך</TableCell>
              <TableCell align="right">מטפל</TableCell>
              <TableCell align="center">פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTreatments.length > 0 ? (
              filteredTreatments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((treatment) => (
                  <TableRow hover key={treatment.treatmentId || treatment.id}>
                    <TableCell align="right">{treatment.treatmentType}</TableCell>
                    <TableCell align="right">{formatDate(treatment.treatmentDate)}</TableCell>
                    <TableCell align="right">{treatment.employeeName || 'לא צוין'}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => openViewDialog(treatment)}
                        size="small"
                        title="צפייה בסיכום טיפול"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="default"
                        size="small"
                        title="הורדת סיכום טיפול"
                      >
                        <FileDownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  לא נמצאו טיפולים
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {filteredTreatments.length > 0 && (
        <TablePagination
          component="div"
          count={filteredTreatments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="שורות בעמוד:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} מתוך ${count}`}
          rowsPerPageOptions={[5, 10, 25]}
        />
      )}
    </Paper>
  );

  // תוכן שיוצג בהתאם למצב הטעינה
  let content;
  if (status === 'loading') {
    content = (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  } else if (status === 'failed') {
    content = (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  } else {
    content = (
      <>
        {/* פילטר חיפוש */}
        <Box sx={{ mb: 3 }}>
          <TextField
            variant="outlined"
            placeholder="חיפוש בטיפולים..."
            fullWidth
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
            sx={{ bgcolor: 'background.paper' }}
          />
        </Box>

        {/* טבלת טיפולים */}
        {renderTreatmentsTable()}
      </>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {renderTitle()}
      {content}

      {/* דיאלוגים */}
      <TreatmentViewDialog />
      <AddTreatmentDialog kidId={kidId} treatmentType={treatmentType} />
    </Box>
  );
};

export default TreatmentsList;