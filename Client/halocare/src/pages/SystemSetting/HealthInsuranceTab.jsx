import React, { useState, useEffect } from 'react';
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
  InputAdornment,
  Fab,
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
  styled,
  keyframes
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocalHospital as HealthIcon,
  AutoAwesome as AutoAwesomeIcon,
  Star as StarIcon,
  MedicalServices as MedicalIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Swal from 'sweetalert2';

import { fetchHealthInsurances, addHealthInsurance, updateHealthInsurance, clearError, resetActionStatus } from '../../Redux/features/healthinsurancesSlice';

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

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 0 30px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.4); }
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
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(255, 112, 67, 0.1) 100%)',
          color: '#dc2626',
          borderBottom: '2px solid rgba(239, 68, 68, 0.2)'
        }
      }
    }
  }
});

// Professional styled components
const FullScreenContainer = styled(Box)(({ theme }) => ({
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
    background: 'linear-gradient(90deg, #ef4444, #dc2626, #f87171, #ef4444)',
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
    background: 'linear-gradient(90deg, #ef4444, #f59e0b, #10b981, #4cb5c3)',
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
  background: 'linear-gradient(45deg, #ef4444 30%, #dc2626 90%)',
  boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 35px rgba(239, 68, 68, 0.4)',
    background: 'linear-gradient(45deg, #dc2626 30%, #b91c1c 90%)',
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
      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.15)',
    },
    '& fieldset': {
      borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: '#ef4444',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#ef4444',
      borderWidth: 2,
    }
  }
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: 12,
  '&:hover': {
    transform: 'scale(1.15) rotate(5deg)',
    boxShadow: '0 6px 20px rgba(239, 68, 68, 0.25)',
  }
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 70,
  height: 70,
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
  animation: `${float} 3s ease-in-out infinite`,
  marginRight: theme.spacing(2),
}));

const HealthCard = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  borderRadius: 12,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0 12px 30px rgba(239, 68, 68, 0.2)',
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',
    animation: `${glow} 2s infinite`,
  }
}));

const HealthInsuranceTab = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  // Redux state 
  const { healthInsurances, status, actionStatus, error } = useSelector(state => state.healthInsurances || { healthInsurances: [], status: 'idle', actionStatus: 'idle', error: null });

  // Local state 
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newHealthInsuranceName, setNewHealthInsuranceName] = useState('');

  // Filter health insurances based on search term 
  const filteredHealthInsurances = healthInsurances.filter(insurance =>
    insurance.hName.toLowerCase().includes(searchTerm.toLowerCase())
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

  // All handler functions 
  const handleEditStart = (insurance) => {
    setEditingId(insurance.hName);
    setEditValue(insurance.hName);
  };

  const handleEditSave = async () => {
    if (editValue.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'שם קופת החולים לא יכול להיות ריק',
        confirmButtonText: 'אישור'
      });
      return;
    }

    if (editValue === editingId) {
      setEditingId(null);
      return;
    }

    if (healthInsurances.some(insurance => insurance.hName === editValue && insurance.hName !== editingId)) {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'קופת חולים בשם זה כבר קיימת',
        confirmButtonText: 'אישור'
      });
      return;
    }

    await dispatch(updateHealthInsurance({
      oldName: editingId,
      newData: { NewHName: editValue }
    }));

    setEditingId(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleAddHealthInsurance = async () => {
    if (newHealthInsuranceName.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'שם קופת החולים לא יכול להיות ריק',
        confirmButtonText: 'אישור'
      });
      return;
    }

    if (healthInsurances.some(insurance => insurance.hName === newHealthInsuranceName)) {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'קופת חולים בשם זה כבר קיימת',
        confirmButtonText: 'אישור'
      });
      return;
    }

    await dispatch(addHealthInsurance({ HName: newHealthInsuranceName }));

    setOpenDialog(false);
    setNewHealthInsuranceName('');
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewHealthInsuranceName('');
  };

  if (status === 'loading') {
    return (
      <ThemeProvider theme={rtlTheme}>
        <FullScreenContainer>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <CircularProgress size={80} sx={{ color: '#ef4444' }} />
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
                      <HealthIcon sx={{ fontSize: '2.5rem' }} />
                    </StyledAvatar>
                    <Box>
                      <Typography variant="h4" sx={{
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                      }}>
                        ניהול קופות חולים
                      </Typography>
                      <Typography variant="body1" sx={{
                        color: 'text.secondary',
                        fontWeight: 500
                      }}>
                        מערכת ניהול קופות חולים וביטוח בריאות
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
                    placeholder="🔍 חיפוש קופת חולים..."
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
                    הוסף קופת חולים
                  </AnimatedButton>
                </Stack>
              </Paper>
            </Fade>

            {/* Professional health insurance table */}
            <Fade in timeout={1200}>
              <StyledTableContainer component={Paper} align="center" dir="rtl">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>🏥 שם קופת החולים</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>⚡ פעולות</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredHealthInsurances.map((insurance) => (
                      <TableRow
                        key={insurance.hName}
                        hover
                        sx={{
                          '&:nth-of-type(odd)': {
                            backgroundColor: alpha(theme.palette.action.hover, 0.05),
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(239, 68, 68, 0.05)',
                            transform: 'scale(1.01)',
                            transition: 'all 0.3s ease'
                          }
                        }}
                      >
                        <TableCell align="center">
                          {editingId === insurance.hName ? (
                            <StyledTextField
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              size="small"
                              autoFocus
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleEditSave();
                                } else if (e.key === 'Escape') {
                                  handleEditCancel();
                                }
                              }}
                            />
                          ) : (
                            <HealthCard>
                              <Typography
                                variant="h6"
                                onDoubleClick={() => handleEditStart(insurance)}
                                sx={{
                                  fontWeight: 600,
                                  color: '#dc2626',
                                }}
                              >
                                {insurance.hName}
                              </Typography>
                            </HealthCard>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {editingId === insurance.hName ? (
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
                              onClick={() => handleEditStart(insurance)}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(239, 68, 68, 0.1)',
                                '&:hover': {
                                  bgcolor: '#ef4444',
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
                    {filteredHealthInsurances.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} align="center" sx={{ py: 8 }}>
                          <Box textAlign="center">
                            <Avatar sx={{
                              width: 80,
                              height: 80,
                              margin: '0 auto 16px',
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)'
                            }}>
                              <HealthIcon sx={{ fontSize: '3rem' }} />
                            </Avatar>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              {searchTerm ? '🔍 לא נמצאו קופות חולים מתאימות לחיפוש' : '🏥 אין קופות חולים במערכת'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {!searchTerm && 'התחל על ידי הוספת קופת החולים הראשונה'}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </Fade>

            {/* Professional health insurance add dialog */}
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
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(255, 112, 67, 0.1) 100%)',
                color: '#dc2626',
                mb: 2,
                borderBottom: '2px solid rgba(239, 68, 68, 0.2)'
              }}>
                הוספת קופת חולים חדשה
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <StyledTextField
                  autoFocus
                  margin="dense"
                  label="שם קופת החולים"
                  fullWidth
                  variant="outlined"
                  value={newHealthInsuranceName}
                  onChange={(e) => setNewHealthInsuranceName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddHealthInsurance();
                    }
                  }}
                  sx={{ mt: 2 }}
                />
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
                  onClick={handleAddHealthInsurance}
                  variant="contained"
                  disabled={actionStatus === 'loading'}
                  startIcon={actionStatus === 'loading' ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                >
                  הוסף קופת חולים
                </AnimatedButton>
              </DialogActions>
            </Dialog>
          </Container>
        </Box>
      </FullScreenContainer>
    </ThemeProvider>
  );
};

export default HealthInsuranceTab;