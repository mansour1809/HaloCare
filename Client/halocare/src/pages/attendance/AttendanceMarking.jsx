
import  { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Checkbox, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Typography, CircularProgress,
  Box, Avatar, IconButton, Card, CardContent,
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { useAttendance } from "../../components/context/AttendanceContext";
import AttendanceAnalytics from "./AttendanceAnalytics";
import Swal from "sweetalert2";
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SaveIcon from '@mui/icons-material/Save';
import SchoolIcon from '@mui/icons-material/School';
import HowToRegIcon from '@mui/icons-material/HowToReg';

import { baseURL } from "../../components/common/axiosConfig";

const AttendanceMarking = () => {
  const { kids } = useSelector((state) => state.kids);
  const { 
    attendance, absenceReasons, today,
    handleAttendanceChange, handleReasonChange,
    loadTodayAttendance, saveAttendance, isLoading
  } = useAttendance();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  
  // מצבים חדשים
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedClass, setSelectedClass] = useState('all');
  
  // טעינת נתוני נוכחות ליום הנבחר
  useEffect(() => {
    loadTodayAttendance(selectedDate.format('YYYY-MM-DD'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);
  
  // פונקציה למעבר בין ימים
  const changeDay = (days) => {
    setSelectedDate(prevDate => prevDate.add(days, 'day'));
  };
  
  // פתיחת דיאלוג סיבות היעדרות
  const handleSaveClick = (classId = null) => {
    setSelectedClass(classId === null ? 'all' : classId.toString());
    setOpenDialog(true);
  };
  
  // שמירת הנוכחות לשרת
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
  
  // קבוצות ילדים לפי כיתה
  const class1 = kids?.filter(k => k.classId === 1 && k.isActive) || [];
  const class2 = kids?.filter(k => k.classId === 2 && k.isActive) || [];
  
  // יצירת טבלת נוכחות לכיתה
  const renderTable = (classKids, title, classId) => {
    const currentDate = selectedDate.format("YYYY-MM-DD");
    
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
              <SchoolIcon sx={{ mr: 1 }} />
              {title}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="small"
              onClick={() => handleSaveClick(classId)}
              disabled={loadingSave || isLoading}
              startIcon={<SaveIcon />}
            >
              שמור {title}
            </Button>
          </Box>
          
          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>תלמיד/ה</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>נוכחות {selectedDate.format("DD/MM")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classKids.map(kid => (
                  <TableRow key={kid.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={kid.photo || undefined} 
                          alt={`${kid.firstName} ${kid.lastName}`}
                          sx={{ mr: 2, width: 36, height: 36 }}
                        >
                          {kid.firstName?.charAt(0)}
                        </Avatar>
                        <Typography>{kid.firstName} {kid.lastName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        icon={<HowToRegIcon color="disabled" />}
                        checkedIcon={<HowToRegIcon color="success" />}
                        checked={!!attendance[kid.id]?.[currentDate]}
                        onChange={() => handleAttendanceChange(kid.id, currentDate)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };
  
  // הצגת בחירת תאריך
  const renderDatePicker = () => (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
      <Dialog open={showDatePicker} onClose={() => setShowDatePicker(false)}>
        <DialogTitle>בחר תאריך לסימון נוכחות</DialogTitle>
        <DialogContent>
          <DatePicker
            value={selectedDate}
            onChange={(newDate) => {
              setSelectedDate(newDate);
              setShowDatePicker(false);
            }}
            disableFuture
            slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDatePicker(false)}>סגור</Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
  
  return (
    <>
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6">
              נוכחות ליום {selectedDate.format("DD/MM/YYYY")}
            </Typography>
            <IconButton color="primary" onClick={() => setShowDatePicker(true)} title="בחר תאריך">
              <CalendarTodayIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
          {!selectedDate.isSame(dayjs(), 'day') && (
              <Button 
                variant="contained" 
                onClick={() => setSelectedDate(dayjs())}
              >
                היום
              </Button>
            )}
            <Button 
              variant="outlined" 
              onClick={() => selectedDate.isSame(dayjs(), 'day') ? null : changeDay(1)}
              endIcon={<span>▶</span>}
              disabled={selectedDate.isSame(dayjs(), 'day')}
            >
              יום הבא
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => changeDay(-1)}
              startIcon={<span>◀</span>}
            >
              יום קודם
            </Button>
            
            
          </Box>
        </Box>
      </Card>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>{renderTable(class1, "כיתה א", 1)}</Grid>
        <Grid item xs={12} md={6}>{renderTable(class2, "כיתה ב", 2)}</Grid>
      </Grid>
      <Box mt={2} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleSaveClick()}
          disabled={loadingSave || isLoading}
          startIcon={<SaveIcon />}
          size="large"
          sx={{ px: 4 }}
        >
          {loadingSave ? <CircularProgress size={24} /> : "שמור את כל הנוכחות"}
        </Button>
      </Box>
      
      {/* גרף מיני בדף הבית */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <EditIcon sx={{ mr: 1 }} />
          סיכום נוכחות שבועי
        </Typography>
        <Card sx={{ p: 2 }}>
          <Box sx={{ height: 250 }}>
            <AttendanceAnalytics miniVersion={true} />
          </Box>
        </Card>
      </Box>
      
      {/* דיאלוג סיבות היעדרות */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>סיבות היעדרות</DialogTitle>
        <DialogContent dividers>
          {kids?.filter(k => {
            // סינון לפי כיתה אם נבחרה
            if (selectedClass !== 'all' && k.classId !== parseInt(selectedClass)) {
              return false;
            }
            // רק ילדים פעילים שלא מסומנים כנוכחים
            return k.isActive && !attendance[k.id]?.[selectedDate.format("YYYY-MM-DD")];
          }).map(kid => (
            <Box key={kid.id} mb={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar
                                        src={kid.photo ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(kid.photo)}` : ''}
                                        alt={`${kid.firstName} ${kid.lastName}`}
                                        sx={{
                                          width: 40,
                                          height: 40,
                                          ml: 1,
                                          border: "2px solid #fff",
                                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                        }}
                                      >
                                        {!kid.photo && (
                                          <>
                                            {kid.firstName && kid.firstName[0]}
                                            {kid.lastName && kid.lastName[0]}
                                          </>
                                        )}
                                      </Avatar>
                <Typography><strong>{kid.firstName} {kid.lastName}</strong></Typography>
              </Box>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="סיבת היעדרות"
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
            <Typography align="center" color="textSecondary" sx={{ py: 2 }}>
              כל הילדים נוכחים - אין צורך בסיבות היעדרות
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">ביטול</Button>
          <Button 
            onClick={handleDialogConfirm} 
            color="primary" 
            variant="contained"
            disabled={loadingSave}
            startIcon={loadingSave ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {loadingSave ? "שומר..." : "שמור"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* רכיב בחירת תאריך */}
      {renderDatePicker()}
    </>
  );
};

export default AttendanceMarking;