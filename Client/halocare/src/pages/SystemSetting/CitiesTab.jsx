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
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocationCity as CityIcon,
  AutoAwesome as AutoAwesomeIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import Swal from 'sweetalert2';

import { fetchCities, addCity, updateCity, clearError, resetActionStatus } from '../../Redux/features/citiesSlice';

// יצירת theme מדהים עם תמיכה ב-RTL
const rtlTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    h1: {
      fontWeight: 700,
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
      light: '#ff9473',
      dark: '#cc5a36',
    },
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '100vh'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          fontSize: '1.1rem',
          background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
          color: 'white',
          borderBottom: 'none'
        }
      }
    }
  }
});

// קונטיינר מסך מלא מעוצב
const FullScreenContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 20%, rgba(76, 181, 195, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 112, 67, 0.3) 0%, transparent 50%)',
    pointerEvents: 'none'
  }
}));

// כרטיס הכותרת הראשית המעוצב
const HeroCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.95) 0%, rgba(42, 138, 149, 0.95) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 25,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
    pointerEvents: 'none'
  }
}));

// טבלה מעוצבת עם אפקטים
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
  }
}));

// כפתור מונפש מדהים
const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: '12px 24px',
  fontWeight: 600,
  fontSize: '1rem',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  boxShadow: '0 6px 20px rgba(76, 181, 195, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 35px rgba(76, 181, 195, 0.4)',
    background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
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

// Fab מעוצב
const StyledFab = styled(Fab)(({ theme }) => ({
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  boxShadow: '0 8px 30px rgba(76, 181, 195, 0.4)',
  '&:hover': {
    transform: 'scale(1.1) rotate(10deg)',
    background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
    boxShadow: '0 12px 40px rgba(76, 181, 195, 0.5)',
  },
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
}));

const CitiesTab = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Redux state
  const { cities, status, actionStatus, error } = useSelector(state => state.cities);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newCityName, setNewCityName] = useState('');

  // Filter cities based on search term
  const filteredCities = cities.filter(city =>
    city.cityName.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Handle edit start
  const handleEditStart = (city) => {
    setEditingId(city.cityName);
    setEditValue(city.cityName);
  };

  // Handle edit save
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

    // Check if new name already exists
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

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  // Handle add city
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

    // Check if city already exists
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
            
            {/* כרטיס הכותרת הראשית */}
            <Zoom in timeout={800}>
              <HeroCard>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <Box display="flex" alignItems="center">
                      <StarIcon sx={{ fontSize: '3rem', mr: 2, color: '#fbbf24' }} />
                      <Box textAlign="center">
                        <Typography variant="h4" sx={{ 
                          fontWeight: 700,
                          background: 'linear-gradient(45deg, #ffffff, #f0f9ff)',
                          backgroundClip: 'text',
                          textFillColor: 'transparent',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                           ניהול ערים
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                          מערכת ניהול רשימת הערים במערכת
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </HeroCard>
            </Zoom>

            {/* בר חיפוש וכפתור הוספה מעוצב */}
            <Fade in timeout={1000}>
              <Paper sx={{ 
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
                  <TextField
                    placeholder="🔍 חיפוש עיר..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 3,
                        background: 'rgba(76, 181, 195, 0.05)',
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
                      }
                    }}
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
              </Paper>
            </Fade>

            {/* טבלת ערים מעוצבת */}
            <Fade in timeout={1200}>
              <StyledTableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>🏙️ שם העיר</TableCell>
                      <TableCell align="center">⚡ פעולות</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCities.map((city, index) => (
                      <TableRow 
                        key={city.cityName}
                        hover
                        sx={{
                          '&:nth-of-type(odd)': {
                            backgroundColor: alpha(theme.palette.action.hover, 0.5),
                          },
                          '&:hover': {
                            backgroundColor: alpha('#4cb5c3', 0.1),
                            transform: 'scale(1.02)',
                            transition: 'all 0.3s ease'
                          }
                        }}
                      >
                        <TableCell>
                          {editingId === city.cityName ? (
                            <TextField
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
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  background: 'rgba(76, 181, 195, 0.1)'
                                }
                              }}
                            />
                          ) : (
                            <Typography 
                              variant="body1" 
                              onDoubleClick={() => handleEditStart(city)}
                              sx={{ 
                                cursor: 'pointer',
                                p: 2,
                                borderRadius: 2,
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                '&:hover': {
                                  bgcolor: alpha('#4cb5c3', 0.1),
                                  transform: 'scale(1.05)',
                                  transition: 'all 0.2s ease'
                                }
                              }}
                            >
                              {city.cityName}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {editingId === city.cityName ? (
                            <Box display="flex" gap={1} justifyContent="center">
                              <IconButton
                                onClick={handleEditSave}
                                color="primary"
                                size="small"
                                disabled={actionStatus === 'loading'}
                                sx={{
                                  bgcolor: alpha('#10b981', 0.1),
                                  '&:hover': {
                                    bgcolor: '#10b981',
                                    color: 'white',
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <SaveIcon />
                              </IconButton>
                              <IconButton
                                onClick={handleEditCancel}
                                color="error"
                                size="small"
                                sx={{
                                  bgcolor: alpha('#ef4444', 0.1),
                                  '&:hover': {
                                    bgcolor: '#ef4444',
                                    color: 'white',
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton
                              onClick={() => handleEditStart(city)}
                              color="primary"
                              size="small"
                              sx={{
                                bgcolor: alpha('#4cb5c3', 0.1),
                                '&:hover': {
                                  bgcolor: '#4cb5c3',
                                  color: 'white',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredCities.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} align="center" sx={{ py: 8 }}>
                          <Box textAlign="center">
                            <CityIcon sx={{ fontSize: '4rem', color: '#9ca3af', mb: 2 }} />
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



            {/* דיאלוג הוספת עיר מעוצב */}
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
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              <DialogTitle sx={{ 
                textAlign: 'center', 
                fontWeight: 'bold',
                fontSize: '1.5rem',
                background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                color: 'white',
                mb: 2
              }}>
                ✨ הוספת עיר חדשה
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <TextField
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
                  sx={{
                    mt: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      background: 'rgba(76, 181, 195, 0.05)',
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
                  }}
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