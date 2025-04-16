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
  Chip,
  TextField,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { 
  Add as AddIcon, 
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Search as SearchIcon 
} from '@mui/icons-material';
import { getTreatmentsByKidId } from '../../store/actions/treatmentActions';
import { useTreatmentContext } from '../../context/TreatmentContext';
import TreatmentViewDialog from './TreatmentViewDialog';
import AddTreatmentDialog from './AddTreatmentDialog';

const TreatmentsList = () => {
  const { kidId, treatmentType } = useParams();
  const dispatch = useDispatch();
  const { treatments, loading, error } = useSelector(state => state.treatments);
  const { openAddDialog, openViewDialog } = useTreatmentContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTreatments, setFilteredTreatments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // טעינת טיפולים בעת טעינת הדף
  useEffect(() => {
    dispatch(getTreatmentsByKidId(kidId, treatmentType));
  }, [dispatch, kidId, treatmentType]);

  // סינון טיפולים על פי חיפוש
  useEffect(() => {
    if (!treatments) return;
    
    if (searchTerm.trim() === '') {
      setFilteredTreatments(treatments);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredTreatments(
        treatments.filter(treatment => 
          treatment.description?.toLowerCase().includes(term) ||
          treatment.highlight?.toLowerCase().includes(term) ||
          treatment.treatmentType?.toLowerCase().includes(term)
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

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>טוען נתונים...</Box>;
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, color: 'error.main' }}>
        {error}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          סיכומי טיפולים
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

      {/* סטטיסטיקה */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                {treatments?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                סה"כ טיפולים
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                85%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                אחוז התקדמות
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                {treatments?.filter(t => t.highlight)?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                יעדים שהושגו
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* פילטר חיפוש */}
      <Box sx={{ mb: 3 }}>
        <TextField
          variant="outlined"
          placeholder="חיפוש..."
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
              {filteredTreatments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((treatment) => (
                  <TableRow hover key={treatment.treatmentId}>
                    <TableCell align="right">{treatment.treatmentType}</TableCell>
                    <TableCell align="right">{formatDate(treatment.treatmentDate)}</TableCell>
                    <TableCell align="right" sx={{ display: 'flex', alignItems: 'center' }}>
                      {treatment.employeeName || 'XXXXX'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => openViewDialog(treatment)}
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="default"
                        size="small"
                      >
                        <FileDownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredTreatments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    לא נמצאו טיפולים
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
      </Paper>

      {/* דיאלוגים */}
      <TreatmentViewDialog />
      <AddTreatmentDialog kidId={kidId} />
    </Box>
  );
};

export default TreatmentsList;