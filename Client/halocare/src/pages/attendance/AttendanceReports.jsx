// AttendanceReports.jsx
import { useState, useEffect } from "react";
import {
  Paper, Grid, Typography, FormControl, Select, MenuItem,
  InputLabel, Button, Box, CircularProgress, Alert, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, Card, CardContent, Divider, Tooltip,
  Chip
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { useAttendance } from "../../components/context/AttendanceContext";
import { generateAttendanceReport } from '../../utils/pdfGenerator';
import 'dayjs/locale/he';

// אייקונים
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Swal from 'sweetalert2';

// רכיבי גרף
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import { fetchAttendanceByKidId } from "../../Redux/features/attendanceSlice";
import { useDispatch } from "react-redux";

// מערך צבעים לגרפים
const COLORS = ['#4CAF50', '#F44336'];

// קומפוננטה לצפייה בתוכן הדוח
const ReportPreview = ({ child, attendanceRecords, startDate, endDate }) => {
  if (!child || !attendanceRecords) return null;

  const total = attendanceRecords.length;
  const present = attendanceRecords.filter(r => r.isPresent).length;
  const absent = total - present;
  const percent = total > 0 ? Math.round((present / total) * 100) : 0;
  
  // הכנת נתונים לגרף פאי
  const pieData = [
    { name: 'נוכחות', value: present },
    { name: 'היעדרות', value: absent }
  ];
  
  // הכנת נתונים לגרף מגמות
  const trendData = [];
  let currentDate = dayjs(startDate);
  const endDateObj = dayjs(endDate);
  
  while (currentDate.isBefore(endDateObj) || currentDate.isSame(endDateObj, 'day')) {
    const dateString = currentDate.format('YYYY-MM-DD');
    const record = attendanceRecords.find(r => 
      dayjs(r.attendanceDate).format('YYYY-MM-DD') === dateString
    );
    
    trendData.push({
      date: currentDate.format('DD/MM'),
      isPresent: record ? (record.isPresent ? 1 : 0) : 0
    });
    
    currentDate = currentDate.add(1, 'day');
  }
  
  // ניתוח רצף נוכחות
  let longestStreak = 0;
  let currentStreak = 0;
  let recentTrend = null;
  
  attendanceRecords.sort((a, b) => 
    dayjs(a.attendanceDate).diff(dayjs(b.attendanceDate))
  ).forEach(record => {
    if (record.isPresent) {
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
      recentTrend = 'עולה';
    } else {
      currentStreak = 0;
      recentTrend = 'יורדת';
    }
  });
  
  // ניתוח דפוסי היעדרות
  const absencesByReason = {};
  attendanceRecords.filter(r => !r.isPresent).forEach(record => {
    const reason = record.absenceReason || 'לא צוין';
    absencesByReason[reason] = (absencesByReason[reason] || 0) + 1;
  });
  
  return (
    <Card elevation={2} sx={{ mt: 3, overflow: 'visible' }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: '4px 4px 0 0', position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              src={child.photo || undefined}
              alt={`${child.firstName} ${child.lastName}`}
              sx={{ width: 56, height: 56, mr: 2, border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              {child.firstName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{child.firstName} {child.lastName}</Typography>
              <Typography variant="body2" color="text.secondary">
                דוח נוכחות לתקופה: {dayjs(startDate).format("DD/MM/YYYY")} - {dayjs(endDate).format("DD/MM/YYYY")}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 200 }}>
                <Typography variant="subtitle2" gutterBottom align="center">סיכום נוכחות</Typography>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 200 }}>
                <Typography variant="subtitle2" gutterBottom align="center">מגמת נוכחות</Typography>
                <ResponsiveContainer>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 1]} ticks={[0, 1]} />
                    <Tooltip formatter={(value) => [value === 1 ? 'נוכח' : 'נעדר', 'סטטוס']} />
                    <Line 
                      type="monotone" 
                      dataKey="isPresent" 
                      name="נוכחות" 
                      stroke="#4CAF50" 
                      strokeWidth={2}
                      dot={{ stroke: '#4CAF50', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="h5" color="primary">{total}</Typography>
                <Typography variant="body2">סה"כ ימים</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', borderLeft: 3, borderColor: '#4CAF50' }}>
                <Typography variant="h5" color="success.main">{present}</Typography>
                <Typography variant="body2">ימי נוכחות</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', borderLeft: 3, borderColor: '#F44336' }}>
                <Typography variant="h5" color="error">{absent}</Typography>
                <Typography variant="body2">ימי היעדרות</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', borderLeft: 3, borderColor: '#2196F3' }}>
                <Typography variant="h5">{percent}%</Typography>
                <Typography variant="body2">אחוז נוכחות</Typography>
              </Paper>
            </Grid>
          </Grid>
          
          {/* ניתוח נוסף */}
          {total > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>ניתוח נוסף</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon sx={{ mr: 1, fontSize: 20 }} />
                      מגמות ורצפים
                    </Typography>
                    
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>רצף נוכחות ארוך ביותר:</strong> {longestStreak} ימים רצופים
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>מגמה נוכחית:</strong> {' '}
                        <Chip 
                          size="small" 
                          label={recentTrend === 'עולה' ? 'חיובית' : 'לשיפור'} 
                          color={recentTrend === 'עולה' ? 'success' : 'warning'}
                        />
                      </Typography>
                      {percent < 75 && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          אחוז הנוכחות נמוך מהממוצע. מומלץ לבצע שיחה עם ההורים.
                        </Alert>
                      )}
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <AssessmentIcon sx={{ mr: 1, fontSize: 20 }} />
                      ניתוח היעדרויות
                    </Typography>
                    
                    {Object.keys(absencesByReason).length > 0 ? (
                      <Box sx={{ mt: 1 }}>
                        {Object.entries(absencesByReason).map(([reason, count], index) => (
                          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">{reason}:</Typography>
                            <Typography variant="body2">{count} ימים</Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        אין היעדרויות בתקופה זו
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* טבלת הנוכחות */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>פירוט נוכחות יומי</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold', bgcolor: '#f5f5f5' } }}>
                    <TableCell align="center">תאריך</TableCell>
                    <TableCell align="center">יום בשבוע</TableCell>
                    <TableCell align="center">סטטוס</TableCell>
                    <TableCell>סיבת היעדרות</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceRecords.map((record, index) => {
                    const recordDate = dayjs(record.attendanceDate);
                    return (
                      <TableRow 
                        key={index}
                        hover
                        sx={{ 
                          bgcolor: record.isPresent ? 'rgba(76, 175, 80, 0.08)' : 'rgba(244, 67, 54, 0.08)'
                        }}
                      >
                        <TableCell align="center">{recordDate.format("DD/MM/YYYY")}</TableCell>
                        <TableCell align="center">{['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][recordDate.day()]}</TableCell>
                        <TableCell align="center">
                          {record.isPresent ? (
                            <Tooltip title="נוכח">
                              <CheckCircleIcon color="success" />
                            </Tooltip>
                          ) : (
                            <Tooltip title="נעדר">
                              <CancelIcon color="error" />
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell>{record.absenceReason || "-"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const AttendanceReports = () => {
  const dispatch = useDispatch();
  const { kids } = useSelector((state) => state.kids);
  const { attData } = useSelector((state) => state.attendance);
  const { selectedDateRange, updateDateRange, loadKidAttendance } = useAttendance();
  
  const [childId, setChildId] = useState("");
  const [rangeType, setRangeType] = useState("week");
  const [startDate, setStartDate] = useState(dayjs().startOf("week"));
  const [endDate, setEndDate] = useState(dayjs().endOf("week"));
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // עדכון הילד הנבחר לדוח
  useEffect(() => {
    if (childId && kids?.length > 0) {
      const child = kids.find(k => k.id.toString() === childId);
      setSelectedChild(child || null);
    } else {
      setSelectedChild(null);
    }
  }, [childId, kids]);
  
  // עדכון תאריכים לפי הטווח הנבחר
  useEffect(() => {
    if (rangeType === "week") {
      setStartDate(dayjs().startOf("week"));
      setEndDate(dayjs().endOf("week"));
      updateDateRange("week");
    } else if (rangeType === "month") {
      setStartDate(dayjs().startOf("month"));
      setEndDate(dayjs().endOf("month"));
      updateDateRange("month");
    } else {
      updateDateRange("custom", startDate, endDate);
    }
  }, [rangeType, updateDateRange]);
  
  // טעינת נתוני נוכחות לדוח
  // תיקון פונקציית fetchAttendanceData

const fetchAttendanceData = async () => {
  if (!childId || !startDate || !endDate) {
    Swal.fire({
      title: 'שגיאה',
      text: 'נא למלא את כל השדות הנדרשים',
      icon: 'error',
      confirmButtonText: 'אישור'
    });
    return null;
  }

  if (endDate.isBefore(startDate)) {
    Swal.fire({
      title: 'שגיאה',
      text: 'תאריך סיום חייב להיות אחרי תאריך התחלה',
      icon: 'error',
      confirmButtonText: 'אישור'
    });
    return null;
  }

  setLoading(true);
  setPdfError(null);
  try {
     const data = await loadKidAttendance(childId);
    
    // סינון לפי טווח תאריכים
    const filteredData = data?.filter(record => {
      const recordDate = dayjs(record.attendanceDate);
      // בדיקה אם התאריך בטווח - מתחשב גם בתאריך זהה לתחילת/סוף הטווח
      return (!startDate || recordDate.isAfter(startDate.startOf('day')) || recordDate.isSame(startDate.startOf('day'), 'day')) && 
             (!endDate || recordDate.isBefore(endDate.endOf('day')) || recordDate.isSame(endDate.endOf('day'), 'day'));
    }) || [];
    
    setAttendanceData(filteredData);
    return filteredData;
  } catch (err) {
    console.error("שגיאה בטעינת נתוני נוכחות:", err);
    Swal.fire({
      title: 'שגיאה',
      text: 'אירעה שגיאה בטעינת נתוני הנוכחות',
      icon: 'error',
      confirmButtonText: 'אישור'
    });
    return null;
  } finally {
    setLoading(false);
  }
};
  
  // יצירת תצוגה מקדימה של הדוח
  const handlePreviewReport = async () => {
    
    const data = await fetchAttendanceData();
    console.log(data);
    if (data?.length > 0 && selectedChild) {
      setShowPreview(true);
    } else if (data?.length === 0 && selectedChild) {
      Swal.fire({
        title: 'אין נתונים',
        text: 'לא נמצאו נתוני נוכחות בטווח התאריכים שנבחר',
        icon: 'info',
        confirmButtonText: 'אישור'
      });
    }
  };
  
  // יצירת דוח והורדתו
  const handleGenerateReport = async () => {
    try {
      if (!attendanceData.length && !showPreview) {
        const data = await fetchAttendanceData();
        if (!data || !selectedChild || data.length === 0) {
          return;
        }
      }
      
      await generateAttendanceReport({
        child: selectedChild,
        attendanceRecords: attendanceData,
        startDate: startDate?.toDate(),
        endDate: endDate?.toDate(),
      });
      
      Swal.fire({
        title: 'הדוח נוצר בהצלחה!',
        text: 'הקובץ הורד למחשב שלך',
        icon: 'success',
        confirmButtonText: 'אישור'
      });
    } catch (err) {
      console.error("שגיאה ביצירת דוח PDF:", err);
      Swal.fire({
        title: 'שגיאה',
        text: 'אירעה שגיאה ביצירת קובץ PDF',
        icon: 'error',
        confirmButtonText: 'אישור'
      });
    }
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
      <Box sx={{ pb: 4 }}>
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AssessmentIcon sx={{ mr: 1 }} />
              הפקת דוח נוכחות
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>בחר ילד</InputLabel>
                  <Select 
                    value={childId} 
                    onChange={(e) => {
                      setChildId(e.target.value);
                      setShowPreview(false);
                      setAttendanceData([]);
                    }}
                    label="בחר ילד"
                    startAdornment={
                      childId && (
                        <Avatar 
                          src={selectedChild?.photo || undefined}
                          alt={selectedChild?.firstName || ''}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        >
                          {selectedChild?.firstName?.charAt(0)}
                        </Avatar>
                      )
                    }
                  >
                    {kids?.filter(k => k.isActive).map(kid => (
                      <MenuItem key={kid.id} value={kid.id.toString()}>
                        {kid.firstName} {kid.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>טווח זמן</InputLabel>
                  <Select 
                    value={rangeType} 
                    onChange={(e) => {
                      setRangeType(e.target.value);
                      setShowPreview(false);
                      setAttendanceData([]);
                    }}
                    label="טווח זמן"
                    startAdornment={<CalendarTodayIcon sx={{ mr: 1, fontSize: 20 }} />}
                  >
                    <MenuItem value="week">שבועי</MenuItem>
                    <MenuItem value="month">חודשי</MenuItem>
                    <MenuItem value="custom">מותאם אישית</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {rangeType === "custom" && (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <DatePicker
                      label="מתאריך"
                      value={startDate}
                      onChange={(date) => {
                        setStartDate(date);
                        setShowPreview(false);
                        setAttendanceData([]);
                      }}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true,
                          variant: 'outlined',
                          InputProps: {
                            startAdornment: <CalendarTodayIcon sx={{ mr: 1, fontSize: 20 }} />
                          }
                        } 
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <DatePicker
                      label="עד תאריך"
                      value={endDate}
                      onChange={(date) => {
                        setEndDate(date);
                        setShowPreview(false);
                        setAttendanceData([]);
                      }}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true,
                          variant: 'outlined',
                          InputProps: {
                            startAdornment: <CalendarTodayIcon sx={{ mr: 1, fontSize: 20 }} />
                          }
                        }
                      }}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                  <Button 
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={handlePreviewReport} 
                    disabled={loading || !childId}
                    size="large"
                  >
                    צפה בדוח
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<PictureAsPdfIcon />}
                    onClick={handleGenerateReport} 
                    disabled={loading || !childId || (!showPreview && attendanceData.length === 0)}
                    color="primary"
                    size="large"
                  >
                    הורד כ-PDF
                  </Button>
                </Box>
              </Grid>
            </Grid>
            
            {loading && (
              <Box display="flex" justifyContent="center" mt={4} mb={2}>
                <CircularProgress />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* תצוגה מקדימה של הדוח */}
        {showPreview && attendanceData.length > 0 && (
          <ReportPreview 
            child={selectedChild}
            attendanceRecords={attendanceData}
            startDate={startDate}
            endDate={endDate}
          />
        )}
        
        {showPreview && attendanceData.length === 0 && (
          <Alert 
            severity="info" 
            sx={{ mt: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => setShowPreview(false)}
              >
                חזור
              </Button>
            }
          >
            לא נמצאו נתוני נוכחות בטווח התאריכים שנבחר
          </Alert>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default AttendanceReports;