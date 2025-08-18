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
  keyframes,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocationCity as CityIcon,
  AutoAwesome as AutoAwesomeIcon,
  Star as StarIcon,
  Place as PlaceIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Swal from 'sweetalert2';

import { fetchCities, addCity, updateCity, clearError, resetActionStatus } from '../../Redux/features/citiesSlice';

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
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  boxShadow: '0 6px 20px rgba(76, 181, 195, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 35px rgba(76, 181, 195, 0.4)',
                        background: 'linear-gradient(135deg, #0ea170ff 0%, #059669 100%)',
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
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
  animation: `${float} 3s ease-in-out infinite`,
  marginRight: theme.spacing(2),
}));

const CityChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
  border: '1px solid rgba(16, 185, 129, 0.3)',
  fontWeight: 600,
  fontSize: '1.1rem',
  padding: theme.spacing(1.5, 2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)',
  }
}));

const CitiesTab = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Redux state - PRESERVED EXACTLY
  const { cities, status, actionStatus, error } = useSelector(state => state.cities);
  
  // Local state - PRESERVED EXACTLY
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newCityName, setNewCityName] = useState('');

  // Filter cities based on search term - PRESERVED EXACTLY
  const filteredCities = cities.filter(city =>
    city.cityName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle success/error messages - PRESERVED EXACTLY
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

  // All handler functions - PRESERVED EXACTLY
  const handleEditStart = (city) => {
    setEditingId(city.cityName);
    setEditValue(city.cityName);
  };

  const handleEditSave = async () => {
    if (editValue.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'שם העיר לא יכול להיות ריק',
        confirmButtonText: 'אישור'
      });
      return;
    }

    if (editValue === editingId) {
      setEditingId(null);
      return;
    }

    if (cities.some(city => city.cityName === editValue && city.cityName !== editingId)) {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'עיר בשם זה כבר קיימת',
        confirmButtonText: 'אישור'
      });
      return;
    }

    await dispatch(updateCity({
      oldName: editingId,
      newData: { NewCityName: editValue }
    }));

    setEditingId(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleAddCity = async () => {
    if (newCityName.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'שם העיר לא יכול להיות ריק',
        confirmButtonText: 'אישור'
      });
      return;
    }

    if (cities.some(city => city.cityName === newCityName)) {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'עיר בשם זה כבר קיימת',
        confirmButtonText: 'אישור'
      });
      return;
    }

    await dispatch(addCity({ CityName: newCityName }));
    setOpenDialog(false);
    setNewCityName('');
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewCityName('');
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
                      <CityIcon sx={{ fontSize: '2.5rem' }} />
                    </StyledAvatar>
                    <Box>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                      }}>
                        ניהול ערים
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: 'text.secondary',
                        fontWeight: 500
                      }}>
                        מערכת ניהול רשימת הערים במערכת
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
                    placeholder="🔍 חיפוש עיר..."
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
                    הוסף עיר
                  </AnimatedButton>
                </Stack>
                
                {/* Cities count */}
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Chip
                    icon={<PlaceIcon />}
                    label={`${filteredCities.length} ערים במערכת`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Paper>
            </Fade>

            {/* Professional cities table */}
            <Fade in timeout={1200}>
              <StyledTableContainer component={Paper} dir="rtl">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ fontWeight: 700, width: '10%' }}>#</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>🏙️ שם העיר</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, width: '20%' }}>⚡ פעולות</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCities.map((city, index) => (
                      <TableRow 
                        key={city.cityName}
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
                          <Chip
                            label={index + 1}
                            size="small"
                            sx={{
                              background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {editingId === city.cityName ? (
                            <StyledTextField
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              size="small"
                              fullWidth
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
                            <Box
                              onDoubleClick={() => handleEditStart(city)}
                              sx={{ 
                                cursor: 'pointer',
                                display: 'inline-block',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  transform: 'scale(1.02)',
                                }
                              }}
                            >
                              <CityChip
                                icon={<PlaceIcon />}
                                label={city.cityName}
                              />
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {editingId === city.cityName ? (
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
                              onClick={() => handleEditStart(city)}
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
                    {filteredCities.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                          <Box textAlign="center">
                            <Avatar sx={{ 
                              width: 80, 
                              height: 80,
                              margin: '0 auto 16px',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                            }}>
                              <CityIcon sx={{ fontSize: '3rem' }} />
                            </Avatar>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              {searchTerm ? '🔍 לא נמצאו ערים מתאימות לחיפוש' : '📝 אין ערים במערכת'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {!searchTerm && 'התחל על ידי הוספת העיר הראשונה'}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </Fade>

            {/* Professional Add city dialog */}
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
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                color: '#059669',
                mb: 2,
                borderBottom: '2px solid rgba(16, 185, 129, 0.2)'
              }}>
                ✨ הוספת עיר חדשה
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <StyledTextField
                  autoFocus
                  margin="dense"
                  label="🏙️ שם העיר"
                  fullWidth
                  variant="outlined"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCity();
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
                  onClick={handleAddCity}
                  variant="contained"
                  disabled={actionStatus === 'loading'}
                  startIcon={actionStatus === 'loading' ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                >
                  הוסף עיר
                </AnimatedButton>
              </DialogActions>
            </Dialog>
          </Container>
        </Box>
      </FullScreenContainer>
    </ThemeProvider>
  );
};

export default CitiesTab;