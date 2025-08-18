import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Checkbox, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Typography, CircularProgress,
  Box, Avatar, IconButton, Card, CardContent,
  Stack, Chip, Fade, Zoom, alpha, useTheme, Tooltip
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { 
  Edit as EditIcon,
  CalendarToday as CalendarTodayIcon,
  Save as SaveIcon,
  School as SchoolIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Today as TodayIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Groups as GroupsIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { useAttendance } from "./AttendanceContext";
import Swal from "sweetalert2";
import { baseURL } from "../../components/common/axiosConfig";
import HebrewReactDatePicker from "../../components/common/HebrewReactDatePicker";

// Styled main card
const MainCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  overflow: 'visible',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: 'linear-gradient(90deg, #667eea, #10b981, #f59e0b)',
    borderRadius: '20px 20px 0 0',
  }
}));

// Styled class card
const ClassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 16,
  boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
  overflow: 'visible',
  position: 'relative',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    borderRadius: '16px 16px 0 0',
  }
}));

// Styled navigation button
const NavButton = styled(IconButton)(({ theme }) => ({
  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
  color: 'white',
  width: 48,
  height: 48,
  boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
    background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
  },
  '&:disabled': {
    background: 'rgba(0,0,0,0.12)',
    color: 'rgba(0,0,0,0.26)',
    transform: 'none',
    boxShadow: 'none',
  }
}));

// Styled save button
const SaveButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: '12px 24px',
  fontWeight: 600,
  background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
    background: 'linear-gradient(45deg, #059669 30%, #10b981 90%)',
  },
  '&:disabled': {
    background: 'rgba(0,0,0,0.12)',
    color: 'rgba(0,0,0,0.26)',
    transform: 'none',
    boxShadow: 'none',
  }
}));

// Styled attendance cell
const AttendanceCell = styled(TableCell)(({ theme }) => ({
  padding: '16px',
  textAlign: 'center',
  position: 'relative',
}));

// Styled checkbox
const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  '&.Mui-checked': {
    transform: 'scale(1.2)',
    '& .MuiSvgIcon-root': {
      filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))',
    }
  },
  '&:hover': {
    transform: 'scale(1.1)',
  },
  transition: 'all 0.3s ease',
}));

// Styled dialog
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 20,
    boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
    backdropFilter: 'blur(20px)',
    background: 'rgba(255, 255, 255, 0.98)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    overflow: 'visible',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '6px',
      background: 'linear-gradient(90deg, #667eea, #764ba2, #10b981)',
      borderRadius: '20px 20px 0 0',
    }
  }
}));

const AttendanceMarking = () => {
  const { kids } = useSelector((state) => state.kids);
  const { 
    attendance, absenceReasons, today,
    handleAttendanceChange, handleReasonChange,
    loadTodayAttendance, saveAttendance, isLoading
  } = useAttendance();
  
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  
  // New states
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedClass, setSelectedClass] = useState('all');
  
  
  useEffect(() => {
    loadTodayAttendance(selectedDate.format('YYYY-MM-DD'));
    
  }, [selectedDate]);
  
 
  const changeDay = (days) => {
    setSelectedDate(prevDate => prevDate.add(days, 'day'));
  };
  
  
  const handleSaveClick = (classId = null) => {
    setSelectedClass(classId === null ? 'all' : classId.toString());
    setOpenDialog(true);
  };
  
  // Save attendance to the server
  const handleDialogConfirm = async () => {
    setLoadingSave(true);
    try {
      const result = await saveAttendance(selectedDate.format('YYYY-MM-DD'), selectedClass !== 'all' ? parseInt(selectedClass) : null);
      
      if (result) {
        Swal.fire({
          title: 'נשמר בהצלחה!',
          text: 'נתוני הנוכחות נשמרו במערכת',
          icon: 'success',
          confirmButtonText: 'אישור',
          timer: 3000
        });
      } else {
        Swal.fire({
          title: 'שגיאה',
          text: 'אירעה שגיאה בשמירת הנתונים',
          icon: 'error',
          confirmButtonText: 'אישור'
        });
      }
      
      setOpenDialog(false);
    } catch (err) {
      console.error("שגיאה בשמירת נוכחות:", err);
      Swal.fire({
        title: 'שגיאה',
        text: 'אירעה שגיאה בשמירת הנתונים',
        icon: 'error',
        confirmButtonText: 'אישור'
      });
    } finally {
      setLoadingSave(false);
    }
  };
  
  // Groups of kids by class
  const class1 = kids?.filter(k => k.classId === 1 && k.isActive) || [];
  const class2 = kids?.filter(k => k.classId === 2 && k.isActive) || [];
  
  // Calculate attendance statistics
  const getAttendanceStats = (classKids) => {
    const currentDate = selectedDate.format("YYYY-MM-DD");
    const present = classKids.filter(kid => attendance[kid.id]?.[currentDate]).length;
    const total = classKids.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { present, total, percentage };
  };
  
  // Create attendance table for a class
  const renderTable = (classKids, title, classId) => {
    const currentDate = selectedDate.format("YYYY-MM-DD");
    const stats = getAttendanceStats(classKids);
    
    return (
      <Fade in timeout={800 + (classId * 200)}>
        <ClassCard>
          <CardContent sx={{ p: 2 }}>
            {/* Class header with statistics */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ 
                  background: `linear-gradient(45deg, ${classId === 1 ? '#667eea' : '#10b981'} 30%, ${classId === 1 ? '#764ba2' : '#34d399'} 90%)`,
                  boxShadow: `0 4px 14px ${alpha(classId === 1 ? '#667eea' : '#10b981', 0.3)}`
                }}>
                  <SchoolIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {title}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip 
                      label={`${stats.present}/${stats.total}`}
                      size="small"
                      color={stats.percentage >= 80 ? "success" : stats.percentage >= 60 ? "warning" : "error"}
                      icon={<GroupsIcon />}
                    />
                    <Chip 
                      label={`${stats.percentage}%`}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                </Box>
              </Stack>
              
              <SaveButton
                size="small"
                onClick={() => handleSaveClick(classId)}
                disabled={loadingSave || isLoading}
                startIcon={loadingSave ? <CircularProgress size={16} /> : <SaveIcon />}
              >
                שמור {title}
              </SaveButton>
            </Stack>
            
            <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ 
                    bgcolor: alpha(classId === 1 ? '#667eea' : '#10b981', 0.1),
                    '& th': { fontWeight: 700, fontSize: '0.9rem' }
                  }}>
                    <TableCell align="center">תלמיד/ה</TableCell>
                    <TableCell align="center">
                      נוכחות {selectedDate.format("DD/MM")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classKids.map((kid, index) => {
                    const isPresent = !!attendance[kid.id]?.[currentDate];
                    return (
                      <TableRow 
                        key={kid.id} 
                        hover
                        sx={{ 
                          '&:hover': {
                            bgcolor: alpha(classId === 1 ? '#667eea' : '#10b981', 0.05),
                          },
                          bgcolor: isPresent ? alpha('#10b981', 0.05) : alpha('#ef4444', 0.03),
                        }}
                      >
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar 
                              src={kid.photo ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(kid.photo)}` : kid.photo || undefined}
                              alt={`${kid.firstName} ${kid.lastName}`}
                              sx={{ 
                                width: 40, 
                                height: 40,
                                border: `2px solid ${isPresent ? '#10b981' : '#ef4444'}`,
                                boxShadow: `0 2px 8px ${alpha(isPresent ? '#10b981' : '#ef4444', 0.3)}`,
                                transition: 'all 0.3s ease'
                              }}
                            >
                              {!kid.photo && kid.firstName?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {kid.firstName} {kid.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {kid.id}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <AttendanceCell>
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
  }}title={isPresent ? "נוכח - לחץ לסמן כנעדר" : "נעדר - לחץ לסמן כנוכח"} arrow>
                            <StyledCheckbox
                              icon={<CancelIcon color="error" />}
                              checkedIcon={<CheckCircleIcon color="success" />}
                              checked={isPresent}
                              onChange={() => handleAttendanceChange(kid.id, currentDate)}
                            />
                          </Tooltip>
                        </AttendanceCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </ClassCard>
      </Fade>
    );
  };
  
  // Display date picker
  const renderDatePicker = () => (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
      <StyledDialog open={showDatePicker} onClose={() => setShowDatePicker(false)}>
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <Avatar sx={{ 
            width: 60, 
            height: 60, 
            margin: '0 auto 16px',
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)'
          }}>
            <CalendarTodayIcon sx={{ fontSize: '2rem' }} />
          </Avatar>
          בחר תאריך לסימון נוכחות
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <HebrewReactDatePicker
            maxDate={new Date()}
            minDate={new Date('2010-01-01')}
            value={selectedDate}
            onChange={(newDate) => {
              setSelectedDate(newDate);
              setShowDatePicker(false);
            }}
            disableFuture
            slotProps={{ 
              textField: { 
                fullWidth: true, 
                margin: 'normal',
                sx: {
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  }
                }
              } 
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setShowDatePicker(false)}
            variant="outlined"
            sx={{ borderRadius: 3 }}
          >
            סגור
          </Button>
        </DialogActions>
      </StyledDialog>
    </LocalizationProvider>
  );
  
  const totalStats = getAttendanceStats([...class1, ...class2]);
  
  return (
    <Box>
      {/* Date navigation card */}
      <Fade in timeout={500}>
        <MainCard sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
              {/* Date information */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ 
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)'
                }}>
                  <CalendarTodayIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    נוכחות ליום {selectedDate.format("DD/MM/YYYY")}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {selectedDate.format("dddd")} • 
                    </Typography>
                    <Chip 
                      label={`${totalStats.present}/${totalStats.total} נוכחים`}
                      size="small"
                      color={totalStats.percentage >= 80 ? "success" : "warning"}
                      icon={<GroupsIcon />}
                    />
                    <Chip 
                      label={`${totalStats.percentage}%`}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                </Box>
                
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
  }}title="בחר תאריך אחר" arrow>
                  <IconButton 
                    color="primary" 
                    onClick={() => setShowDatePicker(true)}
                    sx={{ 
                      background: alpha('#667eea', 0.1),
                      '&:hover': {
                        background: alpha('#667eea', 0.2),
                        transform: 'scale(1.1)',
                      }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
              
              {/* Navigation buttons */}
              <Stack direction="row" spacing={1} alignItems="center">
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
  }}title="יום קודם" arrow>
                  <NavButton onClick={() => changeDay(-1)}>
                    <NavigateBeforeIcon />
                  </NavButton>
                </Tooltip>
                
                {!selectedDate.isSame(dayjs(), 'day') && (
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
  }}title="חזור להיום" arrow>
                    <NavButton 
                      onClick={() => setSelectedDate(dayjs())}
                      sx={{ 
                        background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #059669 30%, #10b981 90%)',
                        }
                      }}
                    >
                      <TodayIcon />
                    </NavButton>
                  </Tooltip>
                )}
                
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
  }}title="יום הבא" arrow>
                  <NavButton 
                    onClick={() => selectedDate.isSame(dayjs(), 'day') ? null : changeDay(1)}
                    disabled={selectedDate.isSame(dayjs(), 'day')}
                  >
                    <NavigateNextIcon />
                  </NavButton>
                </Tooltip>
              </Stack>
            </Stack>
          </CardContent>
        </MainCard>
      </Fade>
      
      {/* Class tables */}
      <Grid container spacing={3}>
        <Grid item size={{xs:12 , sm:6}}>
          {renderTable(class1, "כיתה א'", 1)}
        </Grid>
        <Grid item size={{xs:12 , sm:6}}>
          {renderTable(class2, "כיתה ב'", 2)}
        </Grid>
      </Grid>
      
      {/* General save button */}
      <Zoom in timeout={1200}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <SaveButton
            size="large"
            onClick={() => handleSaveClick()}
            disabled={loadingSave || isLoading}
            startIcon={loadingSave ? <CircularProgress size={24} /> : <SaveIcon />}
            sx={{ 
              px: 6, 
              py: 2,
              fontSize: '1.1rem',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
            }}
          >
            {loadingSave ? "שומר..." : "שמור את כל הנוכחות"}
          </SaveButton>
        </Box>
      </Zoom>
      
      {/* Mini attendance analytics card */}
      <Fade in timeout={1400}>
        <Card sx={{ 
          mt: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #d97706)',
            borderRadius: '20px 20px 0 0',
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Avatar sx={{ 
                background: 'linear-gradient(45deg, #f59e0b 30%, #fbbf24 90%)',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)'
              }}>
                <TimelineIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#d97706' }}>
                  סיכום נוכחות שבועי
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  מגמות ונתונים אנליטיים
                </Typography>
              </Box>
            </Stack>
            
            <Box sx={{ height: 300, borderRadius: 2, overflow: 'hidden' }}>
            </Box>
          </CardContent>
        </Card>
      </Fade>
      
      {/* Absence reasons dialog */}
      <StyledDialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <Avatar sx={{ 
            width: 60, 
            height: 60, 
            margin: '0 auto 16px',
            background: 'linear-gradient(45deg, #ef4444 30%, #f87171 90%)',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
          }}>
            <EditIcon sx={{ fontSize: '2rem' }} />
          </Avatar>
          סיבות היעדרות
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {kids?.filter(k => {
            if (selectedClass !== 'all' && k.classId !== parseInt(selectedClass)) {
              return false;
            }
            return k.isActive && !attendance[k.id]?.[selectedDate.format("YYYY-MM-DD")];
          }).map(kid => (
            <Box key={kid.id} sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar
                  src={kid.photo ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(kid.photo)}` : ''}
                  alt={`${kid.firstName} ${kid.lastName}`}
                  sx={{
                    width: 48,
                    height: 48,
                    border: "2px solid #ef4444",
                    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
                  }}
                >
                  {!kid.photo && (
                    <>
                      {kid.firstName && kid.firstName[0]}
                      {kid.lastName && kid.lastName[0]}
                    </>
                  )}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {kid.firstName} {kid.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    כיתה {kid.classId === 1 ? "א'" : "ב'"}
                  </Typography>
                </Box>
              </Stack>
              <TextField
                fullWidth
                variant="outlined"
                size="medium"
                placeholder="הזן סיבת היעדרות..."
                value={absenceReasons[kid.id] || ""}
                onChange={(e) => handleReasonChange(kid.id, e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  }
                }}
              />
            </Box>
          ))}
          
          {kids?.filter(k => {
            if (selectedClass !== 'all' && k.classId !== parseInt(selectedClass)) {
              return false;
            }
            return k.isActive && !attendance[k.id]?.[selectedDate.format("YYYY-MM-DD")];
          }).length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                margin: '0 auto 16px',
                background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
              }}>
                <CheckCircleIcon sx={{ fontSize: '3rem' }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                כל הילדים נוכחים!
              </Typography>
              <Typography color="text.secondary">
                אין צורך בסיבות היעדרות
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button 
            onClick={() => setOpenDialog(false)} 
            color="secondary"
            variant="outlined"
            sx={{ borderRadius: 3 }}
          >
            ביטול
          </Button>
          <SaveButton
            onClick={handleDialogConfirm} 
            disabled={loadingSave}
            startIcon={loadingSave ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {loadingSave ? "שומר..." : "שמור"}
          </SaveButton>
        </DialogActions>
      </StyledDialog>
      
      {/* Date picker component */}
      {renderDatePicker()}
    </Box>
  );
};

export default AttendanceMarking;