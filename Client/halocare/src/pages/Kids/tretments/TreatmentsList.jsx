// src/components/treatments/TreatmentsList.jsx (עדכון)
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
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
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import { 
  Add as AddIcon, 
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { fetchTreatmentsByKid } from '../../../Redux/features/treatmentsSlice';
import { fetchKidById } from '../../../Redux/features/kidsSlice';
import { useTreatmentContext } from './TreatmentContext';
import TreatmentViewDialog from './TreatmentViewDialog';
import AddTreatmentDialog from './AddTreatmentDialog';

const TreatmentsList = () => {
  const { kidId, treatmentType } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // שליפת state מהסטור
  const { treatments, status, error } = useSelector(state => state.treatments);
  const { selectedKid, status: kidStatus } = useSelector(state => state.kids);
  
  const { openAddDialog, openViewDialog } = useTreatmentContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTreatments, setFilteredTreatments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // טעינת טיפולים בעת טעינת הדף
  useEffect(() => {
    if (kidId) {
      dispatch(fetchTreatmentsByKid({ kidId, treatmentType }));
      
      // אם אין פרטי ילד, נטען אותם
      if (!selectedKid || selectedKid.kidId !== parseInt(kidId)) {
        dispatch(fetchKidById(kidId));
      }
    }
  }, [dispatch, kidId, treatmentType, selectedKid]);

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

  const handleGoBack = () => {
    navigate(`/kids/${kidId}`);
  };

  // עיצוב הכותרת של הדף
  const renderTitle = () => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconButton onClick={handleGoBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Breadcrumbs>
          <Link 
            color="inherit" 
            component="button"
            onClick={() => navigate('/kids')}
            underline="hover"
          >
            רשימת ילדים
          </Link>
          <Link 
            color="inherit" 
            component="button"
            onClick={() => navigate(`/kids/${kidId}`)}
            underline="hover"
          >
            {selectedKid ? `${selectedKid.firstName} ${selectedKid.lastName}` : 'תיק ילד'}
          </Link>
          <Typography color="text.primary">
            {treatmentType ? `טיפולי ${treatmentType}` : 'סיכומי טיפולים'}
          </Typography>
        </Breadcrumbs>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#4cb5c3' }}>
          סיכומי טיפולים {treatmentType ? `- ${treatmentType}` : ''}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => openAddDialog()}
          sx={{ 
            fontWeight: 'bold',
            backgroundColor: '#4cb5c3',
            '&:hover': { backgroundColor: '#3da1af' }
          }}
        >
          סיכום חדש
        </Button>
      </Box>
    </Box>
  );

  // תצוגת טבלת הטיפולים
  const renderTreatmentsTable = () => (
    <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: '10px' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>שם הטיפול</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>תאריך</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>מטפל</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>פעולות</TableCell>
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
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton
                          sx={{
                            width: 35,
                            height: 35,
                            backgroundColor: '#4cb5c3',
                            color: 'white',
                            '&:hover': { backgroundColor: '#3da1af' },
                          }}
                          onClick={() => openViewDialog(treatment)}
                          size="small"
                          title="צפייה בסיכום טיפול"
                        >
                          <VisibilityIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                          sx={{
                            width: 35,
                            height: 35,
                            backgroundColor: '#ff9800',
                            color: 'white',
                            '&:hover': { backgroundColor: '#f57c00' },
                          }}
                          size="small"
                          title="הורדת סיכום טיפול"
                        >
                          <FileDownloadIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  {status === 'succeeded' ? 'לא נמצאו טיפולים' : ''}
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
  if (status === 'loading' || kidStatus === 'loading') {
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
    <Box sx={{ p: 3 }} dir="rtl">
      {renderTitle()}
      {content}

      {/* דיאלוגים */}
      <TreatmentViewDialog />
      <AddTreatmentDialog kidId={kidId} treatmentType={treatmentType} />
    </Box>
  );
};

export default TreatmentsList;