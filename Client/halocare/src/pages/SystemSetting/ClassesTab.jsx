import  { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Typography,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  Container,
  Card,
  CardContent,
  Fade,
  Zoom,
  Stack,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  styled,
  keyframes
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  School as ClassIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Swal from 'sweetalert2';

import {  addClass, updateClass, clearError, resetActionStatus } from '../../Redux/features/classesSlice';
import { fetchEmployees } from '../../Redux/features/employeesSlice';

// Professional animations
const gradientShift = keyframes`
  0% { backgroundPosition: 0% 50%; }
  50% { backgroundPosition: 100% 50%; }
  100% { backgroundPosition: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// RTL Theme with professional colors
const rtlTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '2.2rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.8rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.4rem'
    }
  },
  palette: {
    primary: {
      main: '#4cb5c3',
      light: '#7ec8d3',
      dark: '#2a8a95',
    },
    secondary: {
      main: '#ff7043',
      light: '#ff9575',
      dark: '#c63f17',
    },
    success: {
      main: '#10b981',
    }
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          fontSize: '1.1rem',
          background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1) 0%, rgba(255, 112, 67, 0.1) 100%)',
          color: '#2a8a95',
          borderBottom: '2px solid rgba(76, 181, 195, 0.2)'
        }
      }
    }
  }
});

// Professional styled components
const FullScreenContainer = styled(Box)(() => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 20s ease infinite`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
  }
}));

const HeroCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 20,
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    borderRadius: '20px 20px 0 0',
  }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 20,
  overflow: 'hidden',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  position: 'relative',
  zIndex: 2,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    animation: `${shimmer} 3s infinite`,
  }
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: '12px 24px',
  fontWeight: 600,
  fontSize: '1rem',
  position: 'relative',
  overflow: 'hidden',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  boxShadow: '0 6px 20px rgba(76, 181, 195, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 35px rgba(76, 181, 195, 0.4)',
                        background: 'linear-gradient(135deg, #7b52dbff 0%, #7c3aed 100%)',
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
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 15px rgba(76, 181, 195, 0.15)',
    },
    '& fieldset': {
      borderColor: 'rgba(76, 181, 195, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: '#4cb5c3',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#4cb5c3',
      borderWidth: 2,
    }
  }
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: 12,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(76, 181, 195, 0.3)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#4cb5c3',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#4cb5c3',
    borderWidth: 2,
  }
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: 12,
  '&:hover': {
    transform: 'scale(1.15) rotate(5deg)',
    boxShadow: '0 6px 20px rgba(76, 181, 195, 0.25)',
  }
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 70,
  height: 70,
  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
  animation: `${float} 3s ease-in-out infinite`,
  marginRight: theme.spacing(2),
}));

const TeacherChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1) 0%, rgba(76, 181, 195, 0.05) 100%)',
  border: '1px solid rgba(76, 181, 195, 0.3)',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.2) 0%, rgba(76, 181, 195, 0.1) 100%)',
  }
}));

const ClassesTab = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Redux state - Enhanced with employees
  const { classes, status, actionStatus, error } = useSelector(state => state.classes);
  const { employees } = useSelector(state => state.employees);
  
  // Local state 
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editTeacherId, setEditTeacherId] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newTeacherId, setNewTeacherId] = useState('');

  // Load employees on mount
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  // Filter classes based on search term 
  const filteredClasses = classes.filter(cls =>
    cls.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle success/error messages 
  useEffect(() => {
    if (actionStatus === 'succeeded') {
      Swal.fire({
        icon: 'success',
        title: 'הצלחה!',
        text: 'הפעולה בוצעה בהצלחה',
        timer: 2000,
        showConfirmButton: false
      });
      dispatch(resetActionStatus());
    } else if (actionStatus === 'failed' && error) {
      Swal.fire({
        icon: 'error',
        title: 'שגיאה',
        text: error,
        confirmButtonText: 'אישור'
      });
      dispatch(clearError());
      dispatch(resetActionStatus());
    }
  }, [actionStatus, error, dispatch]);

  // Helper function to get teacher name
  const getTeacherName = (teacherId) => {
    if (!teacherId) return null;
    const teacher = employees.find(emp => emp.employeeId === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : `מזהה: ${teacherId}`;
  };

  // Handle edit start 
  const handleEditStart = (cls) => {
    setEditingId(cls.classId);
    setEditValue(cls.className);
    setEditTeacherId(cls.teacherId || '');
  };

  // Handle edit save 
  const handleEditSave = async () => {
    if (editValue.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'שם הכיתה לא יכול להיות ריק',
        confirmButtonText: 'אישור'
      });
      return;
    }

    const originalClass = classes.find(cls => cls.classId === editingId);
    if (editValue === originalClass.className && editTeacherId === originalClass.teacherId) {
      setEditingId(null);
      return;
    }

    if (classes.some(cls => cls.className === editValue && cls.classId !== editingId)) {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'כיתה בשם זה כבר קיימת',
        confirmButtonText: 'אישור'
      });
      return;
    }

    await dispatch(updateClass({
      classId: editingId,
      className: editValue,
      teacherId: parseInt(editTeacherId) || 0
    }));

    setEditingId(null);
    setEditValue('');
    setEditTeacherId('');
  };

  // Handle edit cancel 
  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
    setEditTeacherId('');
  };

  // Handle add class 
  const handleAddClass = async () => {
    if (newClassName.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'שם הכיתה לא יכול להיות ריק',
        confirmButtonText: 'אישור'
      });
      return;
    }

    if (classes.some(cls => cls.className === newClassName)) {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'כיתה בשם זה כבר קיימת',
        confirmButtonText: 'אישור'
      });
      return;
    }

    await dispatch(addClass({
      className: newClassName,
      teacherId: parseInt(newTeacherId) || 0
    }));

    setOpenDialog(false);
    setNewClassName('');
    setNewTeacherId('');
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewClassName('');
    setNewTeacherId('');
  };

  if (status === 'loading') {
    return (
      <ThemeProvider theme={rtlTheme}>
        <FullScreenContainer>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <CircularProgress size={80} sx={{ color: '#4cb5c3' }} />
          </Box>
        </FullScreenContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={rtlTheme}>
      <FullScreenContainer>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Container maxWidth="xl" sx={{ py: 4 }}>
            
            {/* Professional Main title card */}
            <Zoom in timeout={800}>
              <HeroCard>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" justifyContent="center" dir="rtl">
                    <StyledAvatar>
                      <ClassIcon sx={{ fontSize: '2.5rem' }} />
                    </StyledAvatar>
                    <Box>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                      }}>
                        ניהול כיתות
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: 'text.secondary',
                        fontWeight: 500
                      }}>
                        מערכת ניהול כיתות ושיוך מורים
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </HeroCard>
            </Zoom>

            {/* Professional Search bar and add button */}
            <Fade in timeout={1000}>
              <Paper dir="rtl" sx={{ 
                p: 3, 
                mb: 4, 
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                position: 'relative',
                zIndex: 2
              }}>
                <Stack direction="row" alignItems="center" spacing={3}>
                  <StyledTextField
                    placeholder="🔍 חיפוש כיתה..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    variant="outlined"
                    fullWidth
                  />
                  <AnimatedButton 
                    onClick={() => setOpenDialog(true)}
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ minWidth: 160, py: 1.5 }}
                  >
                    הוסף כיתה
                  </AnimatedButton>
                </Stack>
              </Paper>
            </Fade>

            {/* Professional class table */}
            <Fade in timeout={1200}>
              <StyledTableContainer component={Paper} dir="rtl">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>🎓 שם הכיתה</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>👩‍🏫 מורה אחראי</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>⚡ פעולות</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredClasses.map((cls) => (
                      <TableRow 
                        key={cls.classId}
                        hover
                        sx={{
                          '&:nth-of-type(odd)': {
                            backgroundColor: alpha(theme.palette.action.hover, 0.05),
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(76, 181, 195, 0.05)',
                            transform: 'scale(1.01)',
                            transition: 'all 0.3s ease'
                          }
                        }}
                      >
                        <TableCell align="center">
                          {editingId === cls.classId ? (
                            <StyledTextField
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              size="small"
                              fullWidth
                              autoFocus
                            />
                          ) : (
                            <Typography 
                              variant="body1" 
                              onDoubleClick={() => handleEditStart(cls)}
                              sx={{ 
                                cursor: 'pointer',
                                p: 2,
                                borderRadius: 2,
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: 'rgba(76, 181, 195, 0.05)',
                                  transform: 'scale(1.02)',
                                }
                              }}
                            >
                              {cls.className}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {editingId === cls.classId ? (
                            <FormControl size="small" fullWidth>
                              <StyledSelect
                                value={editTeacherId}
                                onChange={(e) => setEditTeacherId(e.target.value)}
                                displayEmpty
                              >
                                <MenuItem value="">
                                  <em>ללא מורה</em>
                                </MenuItem>
                                {employees.filter(emp => emp.isActive).map(employee => (
                                  <MenuItem key={employee.employeeId} value={employee.employeeId}>
                                    {employee.firstName} {employee.lastName}
                                  </MenuItem>
                                ))}
                              </StyledSelect>
                            </FormControl>
                          ) : (
                            <Box>
                              {cls.teacherId ? (
                                <TeacherChip
                                  icon={<PersonIcon />}
                                  label={getTeacherName(cls.teacherId)}
                                />
                              ) : (
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: '#9ca3af',
                                    fontStyle: 'italic'
                                  }}
                                >
                                  לא מוגדר
                                </Typography>
                              )}
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {editingId === cls.classId ? (
                            <Box display="flex" gap={1} justifyContent="center">
                              <StyledIconButton
                                onClick={handleEditSave}
                                size="small"
                                disabled={actionStatus === 'loading'}
                                sx={{
                                  bgcolor: 'rgba(16, 185, 129, 0.1)',
                                  '&:hover': {
                                    bgcolor: '#10b981',
                                    color: 'white',
                                  }
                                }}
                              >
                                <SaveIcon />
                              </StyledIconButton>
                              <StyledIconButton
                                onClick={handleEditCancel}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                                  '&:hover': {
                                    bgcolor: '#ef4444',
                                    color: 'white',
                                  }
                                }}
                              >
                                <CancelIcon />
                              </StyledIconButton>
                            </Box>
                          ) : (
                            <StyledIconButton
                              onClick={() => handleEditStart(cls)}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(76, 181, 195, 0.1)',
                                '&:hover': {
                                  bgcolor: '#4cb5c3',
                                  color: 'white',
                                }
                              }}
                            >
                              <EditIcon />
                            </StyledIconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredClasses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                          <Box textAlign="center">
                            <Avatar sx={{ 
                              width: 80, 
                              height: 80,
                              margin: '0 auto 16px',
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
                            }}>
                              <ClassIcon sx={{ fontSize: '3rem' }} />
                            </Avatar>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              {searchTerm ? '🔍 לא נמצאו כיתות מתאימות לחיפוש' : '📚 אין כיתות במערכת'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {!searchTerm && 'התחל על ידי הוספת הכיתה הראשונה'}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </Fade>

            {/* Professional Add Class Dialog */}
            <Dialog 
              open={openDialog} 
              onClose={handleDialogClose}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  overflow: 'hidden'
                }
              }}
            >
              <DialogTitle sx={{ 
                textAlign: 'center', 
                fontWeight: 'bold',
                fontSize: '1.5rem',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                color: '#7c3aed',
                mb: 2,
                borderBottom: '2px solid rgba(139, 92, 246, 0.2)'
              }}>
                ✨ הוספת כיתה חדשה
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <StyledTextField
                  autoFocus
                  margin="dense"
                  label="🎓 שם הכיתה"
                  fullWidth
                  variant="outlined"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  sx={{ mt: 2, mb: 3 }}
                />
                <FormControl fullWidth variant="outlined">
                  <InputLabel>👩‍🏫 מורה אחראי</InputLabel>
                  <StyledSelect
                    value={newTeacherId}
                    onChange={(e) => setNewTeacherId(e.target.value)}
                    label="👩‍🏫 מורה אחראי"
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>ללא מורה</em>
                    </MenuItem>
                    {employees.filter(emp => emp.isActive).map(employee => (
                      <MenuItem key={employee.employeeId} value={employee.employeeId}>
                        {employee.firstName} {employee.lastName}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              </DialogContent>
              <DialogActions sx={{ p: 3, gap: 2 }}>
                <Button 
                  onClick={handleDialogClose}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    color: '#6b7280',
                    '&:hover': {
                      bgcolor: alpha('#6b7280', 0.1)
                    }
                  }}
                >
                  ביטול
                </Button>
                <AnimatedButton 
                  onClick={handleAddClass}
                  variant="contained"
                  disabled={actionStatus === 'loading'}
                  startIcon={actionStatus === 'loading' ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                >
                  הוסף כיתה
                </AnimatedButton>
              </DialogActions>
            </Dialog>
          </Container>
        </Box>
      </FullScreenContainer>
    </ThemeProvider>
  );
};

export default ClassesTab;