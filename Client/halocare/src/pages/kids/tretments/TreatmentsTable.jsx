// src/components/treatments/TreatmentsTable.jsx
import React from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TableSortLabel,
  TablePagination,
  Box,
  IconButton,
  Chip
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { useTreatmentContext } from './TreatmentContext';

const TreatmentsTable = () => {
  const { 
    filteredTreatments,
    page, 
    setPage,
    rowsPerPage, 
    setRowsPerPage,
    orderBy,
    order,
    handleRequestSort,
    openViewDialog,
    getColorForTreatmentType,
    getTreatmentName,
    formatDate
  } = useTreatmentContext();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: '10px' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'treatmentTypeId'}
                  direction={orderBy === 'treatmentTypeId' ? order : 'asc'}
                  onClick={() => handleRequestSort('treatmentTypeId')}
                >
                  שם הטיפול
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'treatmentDate'}
                  direction={orderBy === 'treatmentDate' ? order : 'asc'}
                  onClick={() => handleRequestSort('treatmentDate')}
                >
                  תאריך
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'employeeName'}
                  direction={orderBy === 'employeeName' ? order : 'asc'}
                  onClick={() => handleRequestSort('employeeName')}
                >
                  מטפל
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                היילייט
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                פעולות
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTreatments.length > 0 ? (
              filteredTreatments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((treatment) => (
                  <TableRow hover key={treatment.treatmentId || treatment.id}>
                    <TableCell align="right">
                      <Chip 
                        label={getTreatmentName(treatment.treatmentTypeId)}
                        size="small"
                        sx={{ 
                          backgroundColor: getColorForTreatmentType(treatment.treatmentTypeId),
                          color: '#fff',
                          fontWeight: 'medium'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">{formatDate(treatment.treatmentDate)}</TableCell>
                    <TableCell align="right">{treatment.employeeName || 'לא צוין'}</TableCell>
                    <TableCell align="right" 
                      sx={{ 
                        maxWidth: '250px', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {treatment.highlight || '—'}
                    </TableCell>
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
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
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
};

export default TreatmentsTable;