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
  Typography,
  Tooltip,
  styled,
  Avatar,
  Stack,
  alpha,
  Fade,
  Zoom
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { useTreatmentContext } from './TreatmentContext';
import { baseURL } from '../../../components/common/axiosConfig';
import PropTypes from 'prop-types';

// Enhanced Styled Components with modern design
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha('#ffffff', 0.2)}`,
  boxShadow: '0 20px 60px rgba(76, 181, 195, 0.15)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 8s ease infinite',
  },
  '& .MuiTableHead-root': {
    '& .MuiTableRow-root': {
      background: 'linear-gradient(135deg, #f8fafb 0%, #ffffff 100%)',
      '& .MuiTableCell-root': {
        borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        fontWeight: 700,
        fontSize: '1rem',
        color: theme.palette.text.primary,
        padding: '24px 16px',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '50%',
          width: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #4cb5c3, #ff7043)',
          transition: 'all 0.3s ease',
          transform: 'translateX(-50%)',
        },
        '&:hover::after': {
          width: '80%',
        }
      }
    }
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(76, 181, 195, 0.15)',
    '& .MuiTableCell-root': {
      borderBottomColor: alpha(theme.palette.primary.main, 0.2),
    }
  },
  '&:nth-of-type(even)': {
    backgroundColor: alpha(theme.palette.background.default, 0.3),
  },
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    padding: '20px 16px',
    transition: 'all 0.3s ease',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    background: 'linear-gradient(45deg, #4cb5c3, #ff7043)',
    transform: 'scaleY(0)',
    transition: 'transform 0.3s ease',
    transformOrigin: 'bottom',
  },
  '&:hover::before': {
    transform: 'scaleY(1)',
  }
}));

const AnimatedAvatar = styled(Avatar)(({ theme }) => ({
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 4px 15px rgba(76, 181, 195, 0.3)',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: '0 8px 25px rgba(76, 181, 195, 0.4)',
  }
}));

const ActionButton = styled(IconButton)(({ actiontype, theme }) => {
  const colors = {
    view: { 
      bg: 'linear-gradient(45deg, #4fc3f7 30%, #29b6f6 90%)', 
      hover: 'linear-gradient(45deg, #29b6f6 30%, #0277bd 90%)',
      shadow: 'rgba(79, 195, 247, 0.4)'
    },
    download: { 
      bg: 'linear-gradient(45deg, #ff9800 30%, #f57c00 90%)', 
      hover: 'linear-gradient(45deg, #f57c00 30%, #e65100 90%)',
      shadow: 'rgba(255, 152, 0, 0.4)'
    }
  };
  
  const color = colors[actiontype] || colors.view;
  
  return {
    width: 44,
    height: 44,
    background: color.bg,
    color: 'white',
    boxShadow: `0 6px 20px ${color.shadow}`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      background: color.hover,
      transform: 'translateY(-3px) scale(1.05)',
      boxShadow: `0 12px 35px ${color.shadow}`,
    },
    '&:active': {
      transform: 'translateY(-1px) scale(0.98)',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
      transition: 'all 0.5s ease',
    },
    '&:hover::after': {
      left: '100%',
    }
  };
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha('#ffffff', 0.2)}`,
  boxShadow: '0 20px 60px rgba(76, 181, 195, 0.15)',
  borderRadius: '20px',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 8s ease infinite',
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  }
}));

const CooperationRating = ({ level }) => {
  const stars = [];
  
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Box 
        key={i} 
        sx={{ 
          color: i <= level ? '#ffc107' : '#e0e0e0',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.2)',
            filter: 'drop-shadow(0 2px 4px rgba(255, 193, 7, 0.4))'
          }
        }}
      >
        {i <= level ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
      </Box>
    );
  }
  
  return (
    <Tooltip placement="top" 
  PopperProps={{
    disablePortal: true,
    modifiers: [
      {
        name: 'flip',
        enabled: false 
      },
      {
        name: 'preventOverflow',
        options: {
          boundary: 'window', 
        },
      },
    ],
  }}title={`רמת שיתוף פעולה: ${level}/5`}>
      <Stack direction="row" spacing={0.5} alignItems="center">
        {stars}
        <Typography 
          variant="caption" 
          sx={{ 
            ml: 1, 
            fontWeight: 600,
            color: 'text.primary',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          {level}/5
        </Typography>
      </Stack>
    </Tooltip>
  );
};

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
    <Fade in timeout={1200}>
      <StyledPaper elevation={0}>
        <StyledTableContainer>
          <Table stickyHeader>
            <TableHead>
              {/* <TableRow> */}
                <StyledTableRow 
                     >
                <TableCell align="center">
                  <TableSortLabel
                    active={orderBy === 'treatmentDate'}
                    direction={orderBy === 'treatmentDate' ? order : 'asc'}
                    onClick={createSortHandler('treatmentDate')}
                    sx={{ 
                      fontSize: '1rem',
                      fontWeight: 700,
                      '& .MuiTableSortLabel-icon': {
                        color: '#4cb5c3 !important',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AnimatedAvatar sx={{ width: 28, height: 28, bgcolor: '#4cb5c3', fontSize: '0.8rem' }}>
                        📅
                      </AnimatedAvatar>
                      תאריך טיפול
                    </Box>
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={orderBy === 'employeeId'}
                    direction={orderBy === 'employeeId' ? order : 'asc'}
                    onClick={createSortHandler('employeeId')}
                    sx={{ 
                      fontSize: '1rem',
                      fontWeight: 700,
                      '& .MuiTableSortLabel-icon': {
                        color: '#4cb5c3 !important',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AnimatedAvatar sx={{ width: 28, height: 28, bgcolor: '#4cb5c3', fontSize: '0.8rem' }}>
                        👨‍⚕️
                      </AnimatedAvatar>
                      מטפל
                    </Box>
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                    <AnimatedAvatar sx={{ width: 28, height: 28, bgcolor: '#4cb5c3', fontSize: '0.8rem' }}>
                      🤝
                    </AnimatedAvatar>
                    שיתוף פעולה
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={orderBy === 'description'}
                    direction={orderBy === 'description' ? order : 'asc'}
                    onClick={createSortHandler('description')}
                    sx={{ 
                      fontSize: '1rem',
                      fontWeight: 700,
                      '& .MuiTableSortLabel-icon': {
                        color: '#4cb5c3 !important',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AnimatedAvatar sx={{ width: 28, height: 28, bgcolor: '#4cb5c3', fontSize: '0.8rem' }}>
                        📝
                      </AnimatedAvatar>
                      תיאור הטיפול
                    </Box>
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                    <AnimatedAvatar sx={{ width: 28, height: 28, bgcolor: '#4cb5c3', fontSize: '0.8rem' }}>
                      ⚡
                    </AnimatedAvatar>
                    פעולות
                  </Box>
                </TableCell>
                                    </StyledTableRow>

              {/* </TableRow> */}
            </TableHead>
            <TableBody>
              {paginatedTreatments.length > 0 ? (
                paginatedTreatments.map((treatment, index) => (
                  <Zoom in timeout={300 + index * 100} key={treatment.treatmentId}>
                     <StyledTableRow 
                      onClick={() => openViewDialog(treatment)}
                     >
{/* <TableRow> */}
                      <TableCell align="center">
                        <Box>
                          <Typography 
                            variant="body2" 
                            fontWeight={600} 
                            color="text.primary"
                            sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                          >
                            {formatDate(treatment.treatmentDate)}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontWeight: 500 }}
                          >
                            {new Date(treatment.treatmentDate).toLocaleDateString('he-IL', { weekday: 'long' })}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                          <AnimatedAvatar 
                            src={
                              getEmployeePhoto(treatment.employeeId) ? 
                              `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(getEmployeePhoto(treatment.employeeId))}` : 
                              undefined
                            }
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              bgcolor: getColorForTreatmentType(treatment.treatmentTypeId),
                              fontSize: '1rem',
                              fontWeight: 600
                            }}
                          >
                            {!getEmployeePhoto(treatment.employeeId) && 
                              (getEmployeeName(treatment.employeeId) ? getEmployeeName(treatment.employeeId).charAt(0) : '?')
                            }
                          </AnimatedAvatar>
                          <Box>
                            <Typography 
                              variant="body2" 
                              fontWeight={600}
                              sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                            >
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
                          <Typography 
                            variant="body2" 
                            fontWeight={600} 
                            color="text.primary" 
                            sx={{ 
                              mb: 0.5,
                              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}
                          >
                            {treatment.description?.substring(0, 40)}
                            {treatment.description?.length > 40 && '...'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip placement="top" 
  PopperProps={{
    disablePortal: true,
    modifiers: [
      {
        name: 'flip',
        enabled: false 
      },
      {
        name: 'preventOverflow',
        options: {
          boundary: 'window', 
        },
      },
    ],
  }}title="צפייה בפרטי הטיפול">
                            <ActionButton
                              actiontype="view"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                openViewDialog(treatment);
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </ActionButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </StyledTableRow>
                  {/* </TableRow> */}

                                    </Zoom>

                ))
              ) : (
                <StyledTableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: 2,
                      opacity: 0.7
                    }}>
                      <AnimatedAvatar sx={{ 
                        width: 80, 
                        height: 80, 
                        bgcolor: alpha('#4cb5c3', 0.1),
                        fontSize: '2rem'
                      }}>
                        📋
                      </AnimatedAvatar>
                      <Typography variant="h6" color="text.secondary" fontWeight={600}>
                        לא נמצאו טיפולים להצגה
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        לחץ על כפתור הוספה כדי להוסיף טיפול חדש
                      </Typography>
                    </Box>
                  </TableCell>
                </StyledTableRow>
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>
        
        {filteredTreatments.length > 0 && (
          <Box sx={{ 
            p: 3, 
            borderTop: `1px solid ${alpha('#4cb5c3', 0.1)}`,
            background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%)',
            backdropFilter: 'blur(10px)'
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
                  minHeight: '64px',
                },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontWeight: 600,
                  color: 'text.primary',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                },
                '& .MuiTablePagination-select': {
                  borderRadius: '12px',
                  border: `1px solid ${alpha('#4cb5c3', 0.2)}`,
                  background: 'rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(76, 181, 195, 0.1)',
                    borderColor: '#4cb5c3'
                  }
                },
                '& .MuiTablePagination-actions button': {
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: alpha('#4cb5c3', 0.1),
                    transform: 'scale(1.05)'
                  },
                  '&:disabled': {
                    opacity: 0.3
                  }
                }
              }}
            />
          </Box>
        )}
      </StyledPaper>
    </Fade>
  );
};

CooperationRating.propTypes = {
  level: PropTypes.number.isRequired,
};

export default TreatmentsTable;