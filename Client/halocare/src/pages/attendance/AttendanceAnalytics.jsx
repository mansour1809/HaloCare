import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  Box, Typography, Card, CardContent, FormControl, Select, MenuItem, 
  InputLabel, ToggleButtonGroup, ToggleButton, CircularProgress,
  Paper, Grid
} from '@mui/material';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMonthlySummary } from '../../Redux/features/attendanceSlice';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import Swal from 'sweetalert2';

// מערך צבעים לגרפים
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AttendanceAnalytics = ({ miniVersion = false }) => {
  const dispatch = useDispatch();
  const { monthlySummary, status } = useSelector(state => state.attendance);
  const { kids } = useSelector(state => state.kids);
  
  // מצבים
  const [timeRange, setTimeRange] = useState('week');
  const [classFilter, setClassFilter] = useState('all');
  const [chartType, setChartType] = useState('bar');
  const [attendanceData, setAttendanceData] = useState([]);
  
  // טעינת נתוני הנוכחות מהשרת
  useEffect(() => {
    const loadData = async () => {
      try {
        const currentMonth = dayjs().month() + 1;
        const currentYear = dayjs().year();
        
        await dispatch(fetchMonthlySummary({ year: currentYear, month: currentMonth }));
      } catch (error) {
        Swal.fire({
          title: 'שגיאה בטעינת נתונים',
          text: 'לא ניתן היה לטעון את נתוני הנוכחות. מוצגים נתוני דוגמה.',
          icon: 'warning',
          confirmButtonText: 'אישור'
        });
      }
    };
    
    loadData();
  }, [dispatch]);
  
  // עיבוד הנתונים לתצוגה בגרף
  useEffect(() => {
    if (!monthlySummary || Object.keys(monthlySummary).length === 0) {
      // נתוני דמה
      const demoData = createDemoData(timeRange);
      setAttendanceData(demoData);
      return;
    }
    
    // הכנת הנתונים לפורמט המתאים לגרף
    const formattedData = [];
    const totalKids = kids.filter(k => k.isActive).length || 20; // ברירת מחדל ל-20 אם אין נתונים
    // אם הנתונים הם בפורמט של מילון (מפתח-ערך)
    if (typeof monthlySummary === 'object' && !Array.isArray(monthlySummary)) {
      Object.keys(monthlySummary).forEach(date => {
        const dayJsDate = dayjs(date);
        
        // סינון לפי טווח התאריכים שנבחר
        if (timeRange === 'week' && 
            (dayJsDate.isBefore(dayjs().startOf('week')) || 
             dayJsDate.isAfter(dayjs().endOf('week')))) {
          return;
        }
        
        // סינון לפי כיתה (אם הנתונים מאפשרים זאת)
        let filteredCount = monthlySummary[date];
        
        formattedData.push({
          date: dayJsDate.format('DD/MM'),
          day: getDayNameInHebrew(dayJsDate.day()),
          percentage: Math.round((filteredCount / totalKids) * 100)
        });
      });
      
      // מיון לפי תאריך
      formattedData.sort((a, b) => {
        return dayjs(a.date, 'DD/MM').diff(dayjs(b.date, 'DD/MM'));
      });
      
      const filteredByWorkingDays = formattedData.filter(item => {
        const dayIndex = dayjs(item.date, 'DD/MM').day();
        return dayIndex !== 5 && dayIndex !== 6; // 5=שישי, 6=שבת
      });
      
      setAttendanceData(filteredByWorkingDays);

    } else {
      // נתוני דמה
      const demoData = createDemoData(timeRange);
      setAttendanceData(demoData);
    }
  }, [monthlySummary, timeRange, classFilter, kids]);
  
  // פונקצית עזר ליצירת נתוני דמה
  const createDemoData = (range) => {
    const demoData = [];
    
    if (range === 'week') {
      // נשתמש ב-7 ימים אחורנית במקום השבוע הנוכחי
      for (let i = 0; i < 7; i++) {
        const currentDate = dayjs().subtract(6 - i, 'day'); // מ-6 ימים אחורה ועד היום
        
        demoData.push({
          date: currentDate.format('DD/MM'),
          day: getDayNameInHebrew(currentDate.day()),
          percentage: Math.floor(Math.random() * 30) + 70
        });
      }
    }
    else{
    for (let i = 0; i < 30; i++) {
      const currentDate =  dayjs().startOf('month').add(i, 'day');
      demoData.push({
        date: currentDate.format('DD/MM'),
        day: getDayNameInHebrew(currentDate.day()),
        percentage: Math.floor(Math.random() * 30) + 70 // אחוז רנדומלי בין 70-100
      });
    }
  }
    return demoData;
  };
  
  // המרת מספר היום לשם בעברית
  const getDayNameInHebrew = (dayNumber) => {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[dayNumber];
  };
  
  // ניתוח הנתונים להצגת תובנות
  const getInsights = () => {
  if (!attendanceData.length) return null;
  
  const sortedData = [...attendanceData].sort((a, b) => a.percentage - b.percentage);
  const lowestDay = sortedData[0];
  const highestDay = sortedData[sortedData.length - 1];
  
  const totalPercentage = attendanceData.reduce((sum, item) => sum + item.percentage, 0);
  const avgPercentage = Math.round(totalPercentage / attendanceData.length);
  
  return {
    lowestDay,
    highestDay,
    avgPercentage,
  };
};
  
  const insights = getInsights();
  
  // במקרה של גרסה קטנה, נחזיר גרף בלבד
  if (miniVersion) {
    return (
      <Box sx={{ height: '100%', width: '100%', borderRadius: 1, overflow: 'hidden' }}>
        <ResponsiveContainer>
          <AreaChart data={attendanceData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={timeRange === 'week' ? 'day' : 'date'} axisLine={false} />
            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
            <Tooltip formatter={(value) => [`${value}%`, 'נוכחות']} />
            <Area type="monotone" dataKey="percentage" name="אחוז נוכחות" 
              stroke="#8884d8" fillOpacity={1} fill="url(#colorAttendance)" />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    );
  }
  
  // אם עדיין טוען
  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>טוען נתוני נוכחות...</Typography>
      </Box>
    );
  }
  
  // פונקציה להצגת הגרף המתאים
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={timeRange === 'week' ? 'day' : 'date'} />
            <YAxis domain={[0, 100]} label={{ value: 'אחוז נוכחות', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Bar dataKey="percentage" name="אחוז נוכחות" fill="#8884d8" />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={attendanceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="percentage"
              nameKey={timeRange === 'week' ? 'day' : 'date'}
              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
            >
              {attendanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
          </PieChart>
        );
      case 'area':
        return (
          <AreaChart data={attendanceData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={timeRange === 'week' ? 'day' : 'date'} />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Area type="monotone" dataKey="percentage" name="אחוז נוכחות" 
              stroke="#8884d8" fillOpacity={1} fill="url(#colorAttendance)" />
          </AreaChart>
        );
      default:
        return (
          <BarChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={timeRange === 'week' ? 'day' : 'date'} />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Bar dataKey="percentage" name="אחוז נוכחות" fill="#8884d8" />
          </BarChart>
        );
    }
  };
  
  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            <EqualizerIcon sx={{ mr: 1 }} />
            אנליטיקת נוכחות - {timeRange === 'week' ? 'שבועית' : 'חודשית'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {/* בורר טווח זמן */}
            <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
              <InputLabel>טווח זמן</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="טווח זמן"
              >
                <MenuItem value="week">שבועי</MenuItem>
                <MenuItem value="month">חודשי</MenuItem>
              </Select>
            </FormControl>
            
            {/* בורר כיתה */}
            <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
              <InputLabel>כיתה</InputLabel>
              <Select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                label="כיתה"
              >
                <MenuItem value="all">כל הכיתות</MenuItem>
                <MenuItem value="1">כיתה א</MenuItem>
                <MenuItem value="2">כיתה ב</MenuItem>
              </Select>
            </FormControl>
            
            {/* בורר סוג גרף */}
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={(e, newValue) => newValue && setChartType(newValue)}
              size="small"
            >
              <ToggleButton value="bar" title="גרף עמודות">
                <BarChartIcon />
              </ToggleButton>
              <ToggleButton value="pie" title="גרף עוגה">
                <PieChartIcon />
              </ToggleButton>
              <ToggleButton value="area" title="גרף אזורי">
                <TimelineIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
        
        {/* הצגת הגרף המתאים לפי הבחירה */}
        <Paper variant="outlined" sx={{ height: 350, width: '100%', p: 2 }}>
          <ResponsiveContainer>
            {renderChart()}
          </ResponsiveContainer>
        </Paper>
        
        {/* תובנות מהנתונים */}
        {insights && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2, borderRight: 4, borderColor: 'primary.main' }}>
                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <EqualizerIcon sx={{ mr: 1, fontSize: 20 }} />
                  ממוצע נוכחות
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{insights.avgPercentage}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  ממוצע נוכחות שבועי
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2, borderRight: 4, borderColor: 'success.main' }}>
                <Typography variant="subtitle2" color="success.main" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ mr: 1, fontSize: 20 }} />
                  נוכחות גבוהה ביותר
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{insights.highestDay.percentage}%</Typography>
                <Typography variant="body2" color="text.secondary">
                ביום {insights.highestDay.day} ({insights.highestDay.date})
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2, borderRight: 4, borderColor: 'error.main' }}>
                <Typography variant="subtitle2" color="error" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingDownIcon sx={{ mr: 1, fontSize: 20 }} />
                  נוכחות נמוכה ביותר
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{insights.lowestDay.percentage}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  ביום {insights.lowestDay.day} ({insights.lowestDay.date})
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
        
        {/* הצגת המלצות */}
        {insights && insights.lowestDay.percentage < 80 && (
          <Paper variant="outlined" sx={{ mt: 3, p: 2, bgcolor: '#fff9c4', borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              המלצות לשיפור הנוכחות:
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • ליצור קשר עם הורי הילדים הנעדרים באופן תדיר ולהבין את הסיבות להיעדרות.
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • לבחון אם יש דפוס היעדרות ביום {insights.lowestDay.day} ולשקול התאמת הפעילויות ביום זה.
            </Typography>
            <Typography variant="body2">
              • לעקוב אחר סיבות היעדרות נפוצות ולטפל בהן באופן יזום.
            </Typography>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceAnalytics;