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
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
  Palette as ColorIcon,
  AutoAwesome as AutoAwesomeIcon,
  Star as StarIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import Swal from 'sweetalert2';

import { fetchEventTypes, addEventType, updateEventType, clearError, resetActionStatus } from '../../Redux/features/eventTypesSlice';

// Create a theme with RTL support
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

// Fullscreen container designed
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

// The formatted main title card
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

// Table formatted with effects
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

// Animated button
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

// Designed Fab
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

const EventTypesTab = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Redux state
  const { eventTypes, status, actionStatus, error } = useSelector(state => state.eventTypes);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editColor, setEditColor] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newEventTypeName, setNewEventTypeName] = useState('');
  const [newEventColor, setNewEventColor] = useState('#1976d2');

  // Filter event types based on search term
  const filteredEventTypes = eventTypes.filter(type =>
    type.eventType.toLowerCase().includes(searchTerm.toLowerCase())
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
  const handleEditStart = (type) => {
    setEditingId(type.eventTypeId);
    setEditValue(type.eventType);
    setEditColor(type.color || '#1976d2');
  };

  // Handle edit save
  const handleEditSave = async () => {
    if (editValue.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'שם סוג האירוע לא יכול להיות ריק',
        confirmButtonText: 'אישור'
      });
      return;
    }

    const originalType = eventTypes.find(type => type.eventTypeId === editingId);
    if (editValue === originalType.eventType && editColor === originalType.color) {
      setEditingId(null);
      return;
    }

    // Check if new name already exists (for different type)
    if (eventTypes.some(type => type.eventType === editValue && type.eventTypeId !== editingId)) {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'סוג אירוע בשם זה כבר קיים',
        confirmButtonText: 'אישור'
      });
      return;
    }

    await dispatch(updateEventType({
      eventTypeId: editingId,
      eventType: editValue,
      color: editColor
    }));

    setEditingId(null);
    setEditValue('');
    setEditColor('');
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
    setEditColor('');
  };

  // Handle add event type
  const handleAddEventType = async () => {
    if (newEventTypeName.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'שם סוג האירוע לא יכול להיות ריק',
        confirmButtonText: 'אישור'
      });
      return;
    }

    // Check if event type already exists
    if (eventTypes.some(type => type.eventType === newEventTypeName)) {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'סוג אירוע בשם זה כבר קיים',
        confirmButtonText: 'אישור'
      });
      return;
    }

    await dispatch(addEventType({
      eventType: newEventTypeName,
      color: newEventColor
    }));

    setOpenDialog(false);
    setNewEventTypeName('');
    setNewEventColor('#1976d2');
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewEventTypeName('');
    setNewEventColor('#1976d2');
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
                         ניהול סוגי אירועים
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                          מערכת ניהול סוגי אירועים ולוח שנה מותאם אישית
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </HeroCard>
            </Zoom>

{/* Search bar and add button designed */}            <Fade in timeout={1000}>
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
                  <TextField
                    placeholder="🔍 חיפוש סוג אירוע..."
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
                     הוסף סוג אירוע
                  </AnimatedButton>
                </Stack>
              </Paper>
            </Fade>

{/* Formatted event type table */}            <Fade in timeout={1200}>
              <StyledTableContainer dir="rtl" component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">📅 שם סוג האירוע</TableCell>
                      <TableCell align="center">🎨 צבע</TableCell>
                      <TableCell align="center">⚡ פעולות</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEventTypes.map((type) => (
                      <TableRow 
                      align="center"
                        key={type.eventTypeId}
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
                        <TableCell align="center">
                          {editingId === type.eventTypeId ? (
                            <TextField
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              size="small"
                              fullWidth
                              autoFocus
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  background: 'rgba(76, 181, 195, 0.1)'
                                }
                              }}
                            />
                          ) : (
                            <Box>
                              <Typography 
                                variant="body1" 
                                onDoubleClick={() => handleEditStart(type)}
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
                                {type.eventType}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {editingId === type.eventTypeId ? (
                            <Box display="flex" alignItems="center" gap={2}>
                              <input
                                type="color"
                                value={editColor}
                                onChange={(e) => setEditColor(e.target.value)}
                                style={{
                                  width: 50,
                                  height: 40,
                                  border: '3px solid #e5e7eb',
                                  borderRadius: 12,
                                  cursor: 'pointer',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                              />
                              <TextField
                                value={editColor}
                                onChange={(e) => setEditColor(e.target.value)}
                                size="small"
                                sx={{ 
                                  width: 120,
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    background: 'rgba(76, 181, 195, 0.1)'
                                  }
                                }}
                              />
                            </Box>
                          ) : (
                            <Chip
                              size="medium"
                              sx={{
                                backgroundColor: type.color || '#1976d2',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                px: 2,
                                py: 1,
                                height: 'auto',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  transition: 'all 0.2s ease'
                                }
                              }}
                              label={type.color || '#1976d2'}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {editingId === type.eventTypeId ? (
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
                              onClick={() => handleEditStart(type)}
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
                    {filteredEventTypes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                          <Box textAlign="center">
                            <EventIcon sx={{ fontSize: '4rem', color: '#9ca3af', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              {searchTerm ? '🔍 לא נמצאו סוגי אירועים מתאימים לחיפוש' : '📅 אין סוגי אירועים במערכת'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {!searchTerm && 'התחל על ידי הוספת סוג האירוע הראשון'}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </Fade>



{/* Add event type dialog designed */}            <Dialog 
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
                ✨ הוספת סוג אירוע חדש
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <TextField
                  autoFocus
                  margin="dense"
                  label="שם סוג האירוע"
                  fullWidth
                  variant="outlined"
                  value={newEventTypeName}
                  onChange={(e) => setNewEventTypeName(e.target.value)}
                  sx={{
                    mt: 2,
                    mb: 3,
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
                <Box display="flex" alignItems="center" gap={3} sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'rgba(76, 181, 195, 0.05)',
                  border: '1px solid rgba(76, 181, 195, 0.2)'
                }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>🎨 צבע:</Typography>
                  <input
                    type="color"
                    value={newEventColor}
                    onChange={(e) => setNewEventColor(e.target.value)}
                    style={{
                      width: 60,
                      height: 50,
                      border: '3px solid #e5e7eb',
                      borderRadius: 12,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <TextField
                    value={newEventColor}
                    onChange={(e) => setNewEventColor(e.target.value)}
                    size="small"
                    sx={{ 
                      width: 140,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(76, 181, 195, 0.3)',
                        }
                      }
                    }}
                  />
                </Box>
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
                  onClick={handleAddEventType}
                  variant="contained"
                  disabled={actionStatus === 'loading'}
                  startIcon={actionStatus === 'loading' ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                >
                  הוסף סוג אירוע
                </AnimatedButton>
              </DialogActions>
            </Dialog>
          </Container>
        </Box>
      </FullScreenContainer>
    </ThemeProvider>
  );
};

export default EventTypesTab;