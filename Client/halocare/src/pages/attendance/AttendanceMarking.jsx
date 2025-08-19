import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Checkbox, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Typography, CircularProgress,
  Box, Avatar, IconButton, Card, CardContent,
  Stack, Chip, Fade, Tooltip, alpha,
  LinearProgress
} from "@mui/material";
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
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { useAttendance } from "./AttendanceContext";
import Swal from "sweetalert2";
import { baseURL } from "../../components/common/axiosConfig";
import HebrewReactDatePicker from "../../components/common/HebrewReactDatePicker";

// Simple, functional styled components without heavy animations
const MainCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid rgba(76, 181, 195, 0.1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981)',
    borderRadius: '16px 16px 0 0',
  }
}));

const ClassCard = styled(Card)(({ theme }) => ({
  background: 'white',
  borderRadius: 12,
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  transition: 'box-shadow 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
  }
}));

const NavButton = styled(IconButton)(({ theme }) => ({
  background: '#4cb5c3',
  color: 'white',
  width: 40,
  height: 40,
  '&:hover': {
    background: '#3da1af',
  },
  '&:disabled': {
    background: 'rgba(0,0,0,0.12)',
    color: 'rgba(0,0,0,0.26)',
  }
}));

const SaveButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  padding: '8px 20px',
  background: '#10b981',
  color: 'white',
  '&:hover': {
    background: '#059669',
  },
  '&:disabled': {
    background: 'rgba(0,0,0,0.12)',
  }
}));

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  padding: 8,
  '& .MuiSvgIcon-root': {
    fontSize: 28,
  }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 8,
  '& .MuiTable-root': {
    '& .MuiTableHead-root': {
      '& .MuiTableRow-root': {
        background: alpha('#4cb5c3', 0.08),
      }
    }
  }
}));

const AttendanceMarking = () => {
  const { kids } = useSelector((state) => state.kids);
  const { 
    attendance, 
    absenceReasons, 
    handleAttendanceChange, 
    handleReasonChange,
    loadTodayAttendance, 
    saveAttendance, 
    isLoading,
    hasAttendanceData,
    clearAttendance
  } = useAttendance();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedClass, setSelectedClass] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  
  // Load attendance data when date changes
  useEffect(() => {
    const loadData = async () => {
      setRefreshing(true);
      try {
        await loadTodayAttendance(selectedDate.format('YYYY-MM-DD'));
      } finally {
        setRefreshing(false);
      }
    };
    
    loadData();
  }, [selectedDate, loadTodayAttendance]);
  
  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    clearAttendance();
    try {
      await loadTodayAttendance(selectedDate.format('YYYY-MM-DD'));
      Swal.fire({
        icon: 'success',
        title: 'רוענן בהצלחה',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'שגיאה ברענון',
        text: 'נסה שוב'
      });
    } finally {
      setRefreshing(false);
    }
  };
  
  // Change day
  const changeDay = (days) => {
    setSelectedDate(prevDate => prevDate.add(days, 'day'));
  };
  
  // Handle save click
  const handleSaveClick = (classId = null) => {
    setSelectedClass(classId === null ? 'all' : classId.toString());
    setOpenDialog(true);
  };
  
  // Save attendance to server
  const handleDialogConfirm = async () => {
    setLoadingSave(true);
    try {
      const result = await saveAttendance(
        selectedDate.format('YYYY-MM-DD'), 
        selectedClass !== 'all' ? parseInt(selectedClass) : null
      );
      
      if (result) {
        Swal.fire({
          title: 'נשמר בהצלחה!',
          text: 'נתוני הנוכחות נשמרו במערכת',
          icon: 'success',
          confirmButtonText: 'אישור',
          timer: 2000
        });
      } else {
        throw new Error('Failed to save');
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
  
  // Filter kids by class
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
  
  // Render attendance table for a class
  const renderTable = (classKids, title, classId) => {
    const currentDate = selectedDate.format("YYYY-MM-DD");
    const stats = getAttendanceStats(classKids);
    
    return (
      <ClassCard>
        <CardContent>
          {/* Class header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ 
                bgcolor: classId === 1 ? '#4cb5c3' : '#10b981',
                width: 48,
                height: 48
              }}>
                <SchoolIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {title}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip 
                    label={`${stats.present}/${stats.total}`}
                    size="small"
                    color={stats.percentage >= 80 ? "success" : stats.percentage >= 60 ? "warning" : "error"}
                  />
                  <Chip 
                    label={`${stats.percentage}%`}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              </Box>
            </Stack>
            
            <SaveButton
              size="small"
              onClick={() => handleSaveClick(classId)}
              disabled={loadingSave || isLoading || refreshing}
              startIcon={loadingSave ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            >
              שמור כיתה
            </SaveButton>
          </Stack>
          
          <StyledTableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>תלמיד/ה</TableCell>
                  <TableCell align="center" width="120">נוכחות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classKids.map((kid) => {
                  const isPresent = !!attendance[kid.id]?.[currentDate];
                  return (
                    <TableRow 
                      key={kid.id} 
                      hover
                      sx={{ 
                        bgcolor: isPresent ? alpha('#10b981', 0.04) : 'transparent',
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar 
                            src={kid.photoPath ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(kid.photoPath)}` : undefined}
                            alt={`${kid.firstName} ${kid.lastName}`}
                            sx={{ 
                              width: 36, 
                              height: 36,
                              border: `2px solid ${isPresent ? '#10b981' : '#ef4444'}`,
                            }}
                          >
                            {!kid.photoPath && kid.firstName?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {kid.firstName} {kid.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {isPresent ? 'נוכח' : 'נעדר'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <StyledCheckbox
                          icon={<CancelIcon color="error" />}
                          checkedIcon={<CheckCircleIcon color="success" />}
                          checked={isPresent}
                          onChange={() => handleAttendanceChange(kid.id, currentDate)}
                          disabled={isLoading || refreshing}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </CardContent>
      </ClassCard>
    );
  };
  
  const totalStats = getAttendanceStats([...class1, ...class2]);
  
  return (
    <Box>
      {/* Date navigation */}
      <MainCard sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#4cb5c3' }}>
                <CalendarTodayIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
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
                  />
                  <Chip 
                    label={`${totalStats.percentage}%`}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              </Box>
              
              <Tooltip title="רענן נתונים">
                <IconButton 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{ ml: 1 }}
                >
                  {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title="בחר תאריך">
                <IconButton 
                  onClick={() => setShowDatePicker(true)}
                  sx={{ ml: 1 }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </Stack>
            
            {/* Navigation buttons */}
            <Stack direction="row" spacing={1} alignItems="center">
              <NavButton onClick={() => changeDay(-1)}>
                <NavigateBeforeIcon />
              </NavButton>
              
              {!selectedDate.isSame(dayjs(), 'day') && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<TodayIcon />}
                  onClick={() => setSelectedDate(dayjs())}
                  sx={{ mx: 1 }}
                >
                  היום
                </Button>
              )}
              
              <NavButton 
                onClick={() => changeDay(1)}
                disabled={selectedDate.isSame(dayjs(), 'day')}
              >
                <NavigateNextIcon />
              </NavButton>
            </Stack>
          </Stack>
        </CardContent>
      </MainCard>
      
      {/* Loading indicator */}
      {(isLoading || refreshing) && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
        </Box>
      )}
      
      {/* Class tables */}
      <Grid container spacing={3}>
        <Grid item size={{xs:12,md:6}}>
          {renderTable(class1, "כיתה 1", 1)}
        </Grid>
        <Grid item size={{xs:12,md:6}} >
          {renderTable(class2, "כיתה 2", 2)}
        </Grid>
      </Grid>
      
      {/* Save all button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <SaveButton
          size="large"
          onClick={() => handleSaveClick()}
          disabled={loadingSave || isLoading || refreshing}
          startIcon={loadingSave ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
          sx={{ 
            px: 4, 
            py: 1.5,
            fontSize: '1.1rem',
          }}
        >
          {loadingSave ? "שומר..." : "שמור את כל הנוכחות"}
        </SaveButton>
      </Box>
      
      {/* Absence reasons dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          סיבות היעדרות
        </DialogTitle>
        <DialogContent dividers>
          {kids?.filter(k => {
            if (selectedClass !== 'all' && k.classId !== parseInt(selectedClass)) {
              return false;
            }
            return k.isActive && !attendance[k.id]?.[selectedDate.format("YYYY-MM-DD")];
          }).map(kid => (
            <Box key={kid.id} sx={{ mb: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Avatar
                  src={kid.photoPath ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(kid.photoPath)}` : ''}
                  alt={`${kid.firstName} ${kid.lastName}`}
                  sx={{ width: 40, height: 40 }}
                >
                  {!kid.photoPath && kid.firstName?.charAt(0)}
                </Avatar>
                <Typography variant="subtitle1" fontWeight={500}>
                  {kid.firstName} {kid.lastName}
                </Typography>
              </Stack>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="הזן סיבת היעדרות..."
                value={absenceReasons[kid.id] || ""}
                onChange={(e) => handleReasonChange(kid.id, e.target.value)}
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
              <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6">
                כל הילדים נוכחים!
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            ביטול
          </Button>
          <SaveButton
            onClick={handleDialogConfirm} 
            disabled={loadingSave}
            startIcon={loadingSave ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          >
            {loadingSave ? "שומר..." : "שמור"}
          </SaveButton>
        </DialogActions>
      </Dialog>
      
      {/* Date picker */}
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
        <Dialog open={showDatePicker} onClose={() => setShowDatePicker(false)}>
          <DialogTitle>
            בחר תאריך
          </DialogTitle>
          <DialogContent>
            <HebrewReactDatePicker
              maxDate={new Date()}
              minDate={new Date('2010-01-01')}
              value={selectedDate}
              onChange={(newDate) => {
                setSelectedDate(newDate);
                setShowDatePicker(false);
              }}
              disableFuture
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDatePicker(false)}>
              סגור
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </Box>
  );
};

export default AttendanceMarking;