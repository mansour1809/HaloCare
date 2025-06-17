// src/components/treatments/TreatmentsTable.jsx - גרסה משופרת
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
  Chip,
  Typography,
  useTheme,
  Tooltip,
  styled,
  Avatar,
  Stack
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { useTreatmentContext } from './TreatmentContext';
import { baseURL } from '../../../components/common/axiosConfig';

// Styled Components לעיצוב משופר
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.04)',
  overflow: 'hidden',
  '& .MuiTableHead-root': {
    '& .MuiTableRow-root': {
      background: 'linear-gradient(135deg, #f8fafb 0%, #f1f5f7 100%)',
      '& .MuiTableCell-root': {
        borderBottom: '2px solid #e2e8f0',
        fontWeight: 700,
        fontSize: '0.95rem',
        color: theme.palette.text.primary,
        padding: '20px 16px',
      }
    }
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(76, 181, 195, 0.04)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  '&:nth-of-type(even)': {
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
  },
  '& .MuiTableCell-root': {
    borderBottom: '1px solid rgba(224, 224, 224, 0.3)',
    padding: '16px',
  }
}));

const TreatmentTypeChip = styled(Chip)(({ theme, treatmentcolor }) => ({
  fontWeight: 600,
  fontSize: '0.85rem',
  height: '32px',
  borderRadius: '16px',
  backgroundColor: treatmentcolor || theme.palette.primary.light,
  color: 'white',
  boxShadow: `0 2px 8px ${treatmentcolor}40`,
  '& .MuiChip-icon': {
    color: 'white',
  },
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 4px 12px ${treatmentcolor}60`,
  }
}));

const CooperationRating = ({ level }) => {
  const theme = useTheme();
  const stars = [];
  
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Box key={i} sx={{ color: i <= level ? '#ffc107' : '#e0e0e0' }}>
        {i <= level ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
      </Box>
    );
  }
  
  return (
    <Tooltip title={`רמת שיתוף פעולה: ${level}/5`}>
      <Stack direction="row" spacing={0.5} alignItems="center">
        {stars}
        <Typography variant="caption" sx={{ ml: 1, fontWeight: 600 }}>
          {level}/5
        </Typography>
      </Stack>
    </Tooltip>
  );
};

const ActionButton = styled(IconButton)(({ theme, actiontype }) => {
  const colors = {
    view: { bg: '#4fc3f7', hover: '#29b6f6' },
    download: { bg: '#ff9800', hover: '#f57c00' }
  };
  
  const color = colors[actiontype] || colors.view;
  
  return {
    width: 40,
    height: 40,
    backgroundColor: color.bg,
    color: 'white',
    boxShadow: `0 2px 8px ${color.bg}40`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: color.hover,
      transform: 'translateY(-2px) scale(1.05)',
      boxShadow: `0 4px 16px ${color.bg}60`,
    },
    '&:active': {
      transform: 'translateY(0) scale(0.95)',
    }
  };
});

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
    getEmployeePhoto,
    getEmployeeName,
    formatDate
  } = useTreatmentContext();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const createSortHandler = (property) => () => {
    handleRequestSort(property);
  };

  const paginatedTreatments = filteredTreatments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper elevation={0} sx={{ width: '100%', overflow: 'hidden' }}>
      <StyledTableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              
              <TableCell align="center">
                <TableSortLabel
                  active={orderBy === 'treatmentDate'}
                  direction={orderBy === 'treatmentDate' ? order : 'asc'}
                  onClick={createSortHandler('treatmentDate')}
                  sx={{ 
                    fontSize: '0.95rem',
                    '& .MuiTableSortLabel-icon': {
                      color: '#4fc3f7 !important',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: '#4fc3f7', fontSize: '0.75rem' }}>
                      📅
                    </Avatar>
                    תאריך טיפול
                  </Box>
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={orderBy === 'employeeName'}
                  direction={orderBy === 'employeeName' ? order : 'asc'}
                  onClick={createSortHandler('employeeName')}
                  sx={{ 
                    fontSize: '0.95rem',
                    '& .MuiTableSortLabel-icon': {
                      color: '#4fc3f7 !important',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: '#4fc3f7', fontSize: '0.75rem' }}>
                      👤
                    </Avatar>
                    מטפל
                  </Box>
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: '#4fc3f7', fontSize: '0.75rem' }}>
                    ⭐
                  </Avatar>
                  רמת שיתוף פעולה
                </Box>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={orderBy === 'description'}
                  direction={orderBy === 'description' ? order : 'asc'}
                  onClick={createSortHandler('description')}
                  sx={{ 
                    fontSize: '0.95rem',
                    '& .MuiTableSortLabel-icon': {
                      color: '#4fc3f7 !important',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: '#4fc3f7', fontSize: '0.75rem' }}>
                      📝
                    </Avatar>
                    תיאור הטיפול
                  </Box>
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: '#4fc3f7', fontSize: '0.75rem' }}>
                    ⚡
                  </Avatar>
                  פעולות
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTreatments.length > 0 ? (
              paginatedTreatments.map((treatment) => (
                <StyledTableRow 
                  key={treatment.treatmentId}
                  onClick={() => openViewDialog(treatment)}
                >
                  
                  <TableCell align="center">
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {formatDate(treatment.treatmentDate)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(treatment.treatmentDate).toLocaleDateString('he-IL', { weekday: 'long' })}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar 
                      src={
                        getEmployeePhoto(treatment.employeeId) ? 
                        `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(getEmployeePhoto(treatment.employeeId))}` : 
                        getEmployeeName(treatment.employeeId) ? getEmployeeName(treatment.employeeId).charAt(0) : '?'
                      }
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: getColorForTreatmentType(treatment.treatmentTypeId),
                          fontSize: '0.8rem'
                        }}
                      >
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {getEmployeeName(treatment.employeeId)}
                        </Typography>

                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <CooperationRating level={treatment.cooperationLevel || 0} />
                  </TableCell>
                  <TableCell align="center">
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
                        {treatment.description?.substring(0, 40)}
                        {treatment.description?.length >40 && '...'}
                      </Typography>
                    
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="צפייה בפרטי הטיפול">
                        <ActionButton
                          actiontype="view"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openViewDialog(treatment);
                          }}
                        >
                          <VisibilityIcon sx={{ fontSize: 18 }} />
                        </ActionButton>
                      </Tooltip>
                      <Tooltip title="הורדת סיכום טיפול">
                        <ActionButton
                          actiontype="download"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            // כאן תהיה הפונקציה להורדת PDF
                            console.log('הורדת PDF עבור טיפול:', treatment.treatmentId);
                          }}
                        >
                          <FileDownloadIcon sx={{ fontSize: 18 }} />
                        </ActionButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </StyledTableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 2,
                    color: 'text.secondary'
                  }}>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: 'grey.100', color: 'grey.400' }}>
                      🔍
                    </Avatar>
                    <Typography variant="h6" color="text.secondary">
                      לא נמצאו טיפולים
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      נסה לשנות את הפילטרים או להוסיף טיפול חדש
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>
      
      {filteredTreatments.length > 0 && (
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid rgba(224, 224, 224, 0.3)',
          background: 'linear-gradient(135deg, #fafbfc 0%, #f8fafb 100%)'
        }}>
          <TablePagination
            component="div"
            count={filteredTreatments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="שורות בעמוד:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} מתוך ${count}`}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              '& .MuiTablePagination-toolbar': {
                minHeight: '52px',
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontWeight: 600,
                color: 'text.primary',
              },
              '& .MuiTablePagination-select': {
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.1)',
              },
              '& .MuiTablePagination-actions button': {
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(76, 181, 195, 0.1)',
                }
              }
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default TreatmentsTable;