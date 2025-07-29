import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  Box, Typography, Card, CardContent, FormControl, Select, MenuItem, 
  InputLabel, ToggleButtonGroup, ToggleButton, CircularProgress,
   Grid, Avatar, Stack, Chip, Fade, Zoom, alpha, useTheme
} from '@mui/material';
import { 
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Equalizer as EqualizerIcon,
  Analytics as AnalyticsIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMonthlySummary } from '../../Redux/features/attendanceSlice';
import Swal from 'sweetalert2';

// Array of styled colors for graphs
const COLORS = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const GRADIENT_COLORS = [
  'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
  'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
  'linear-gradient(45deg, #f59e0b 30%, #fbbf24 90%)',
  'linear-gradient(45deg, #ef4444 30%, #f87171 90%)',
  'linear-gradient(45deg, #8b5cf6 30%, #a78bfa 90%)',
  'linear-gradient(45deg, #06b6d4 30%, #22d3ee 90%)'
];

// Styled control card
const ControlCard = styled(Card)(({ theme }) => ({
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

// Styled graph card
const ChartCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 20,
  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
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
}));

// Styled insights card
const InsightCard = styled(Card)(({ borderColor }) => ({
  height: '100%',
  borderRadius: 16,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(borderColor || '#667eea', 0.2)}`,
  boxShadow: `0 8px 24px ${alpha(borderColor || '#667eea', 0.15)}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 32px ${alpha(borderColor || '#667eea', 0.25)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: borderColor || '#667eea',
  }
}));

// Styled ToggleButton
const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  borderRadius: 12,
  border: 'none',
  padding: '12px 20px',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.2)',
  },
  '&.Mui-selected': {
    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
    color: 'white',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
    '&:hover': {
      background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
    }
  }
}));

// Styled Select
const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: 16,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.15)',
  },
  '&.Mui-focused': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.25)',
  }
}));

const AttendanceAnalytics = ({ miniVersion = false }) => {
  const dispatch = useDispatch();
  const { monthlySummary, status } = useSelector(state => state.attendance);
  const { kids } = useSelector(state => state.kids);
  const theme = useTheme();
  
  // States
  const [timeRange, setTimeRange] = useState('week');
  const [classFilter, setClassFilter] = useState('all');
  const [chartType, setChartType] = useState('bar');
  const [attendanceData, setAttendanceData] = useState([]);
  
  // Load attendance data from the server
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
  
  // Process data for graph display
  useEffect(() => {
    if (!monthlySummary || Object.keys(monthlySummary).length === 0) {
      const demoData = createDemoData(timeRange);
      setAttendanceData(demoData);
      return;
    }
    
    const formattedData = [];
    const totalKids = kids.filter(k => k.isActive).length || 20;
    
    if (typeof monthlySummary === 'object' && !Array.isArray(monthlySummary)) {
      Object.keys(monthlySummary).forEach(date => {
        const dayJsDate = dayjs(date);
        
        if (timeRange === 'week' && 
            (dayJsDate.isBefore(dayjs().startOf('week')) || 
             dayJsDate.isAfter(dayjs().endOf('week')))) {
          return;
        }
        
        let filteredCount = monthlySummary[date];
        
        formattedData.push({
          date: dayJsDate.format('DD/MM'),
          day: getDayNameInHebrew(dayJsDate.day()),
          percentage: Math.round((filteredCount / totalKids) * 100)
        });
      });
      
      formattedData.sort((a, b) => {
        return dayjs(a.date, 'DD/MM').diff(dayjs(b.date, 'DD/MM'));
      });
      
      const filteredByWorkingDays = formattedData.filter(item => {
        const dayIndex = dayjs(item.date, 'DD/MM').day();
        return dayIndex !== 5 && dayIndex !== 6;
      });
      
      setAttendanceData(filteredByWorkingDays);
    } else {
      const demoData = createDemoData(timeRange);
      setAttendanceData(demoData);
    }
  }, [monthlySummary, timeRange, classFilter, kids]);
  
  // Helper function to create demo data
  const createDemoData = (range) => {
    const demoData = [];
    
    if (range === 'week') {
      for (let i = 0; i < 7; i++) {
        const currentDate = dayjs().subtract(6 - i, 'day');
        
        demoData.push({
          date: currentDate.format('DD/MM'),
          day: getDayNameInHebrew(currentDate.day()),
          percentage: Math.floor(Math.random() * 30) + 70
        });
      }
    } else {
      for (let i = 0; i < 30; i++) {
        const currentDate = dayjs().startOf('month').add(i, 'day');
        demoData.push({
          date: currentDate.format('DD/MM'),
          day: getDayNameInHebrew(currentDate.day()),
          percentage: Math.floor(Math.random() * 30) + 70
        });
      }
    }
    return demoData;
  };
  
  // Convert day number to name in Hebrew
  const getDayNameInHebrew = (dayNumber) => {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[dayNumber];
  };
  
  // Analyze data to display insights
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
  
  // If mini version, return only the graph
  if (miniVersion) {
    return (
      <Box sx={{ height: '100%', width: '100%', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #667eea, #10b981, #f59e0b)',
            borderRadius: '3px 3px 0 0',
          }}
        />
        <ResponsiveContainer>
          <AreaChart data={attendanceData}
            margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={timeRange === 'week' ? 'day' : 'date'} axisLine={false} />
            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
            <Tooltip PopperProps={{ disablePortal: true }}
              formatter={(value) => [`${value}%`, 'נוכחות']}
              contentStyle={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
            />
            <Area type="monotone" dataKey="percentage" name="אחוז נוכחות" 
              stroke="#667eea" fillOpacity={1} fill="url(#colorAttendance)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    );
  }
  
  // If still loading
  if (status === 'loading') {
    return (
      <Fade in>
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="300px">
          <Avatar sx={{ 
            width: 80, 
            height: 80, 
            mb: 2,
            background: 'linear-gradient(45deg, #667eea 30%, #10b981 90%)',
            animation: 'pulse 2s infinite'
          }}>
            <AnalyticsIcon sx={{ fontSize: '2.5rem' }} />
          </Avatar>
          <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>טוען נתוני נוכחות...</Typography>
          <Typography variant="body2" color="text.secondary">מכין ניתוח מתקדם</Typography>
        </Box>
      </Fade>
    );
  }
  
  // Function to display the appropriate graph
  const renderChart = () => {
    const commonProps = {
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={attendanceData} {...commonProps}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#667eea" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#667eea" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={timeRange === 'week' ? 'day' : 'date'} 
              stroke="#666"
              fontSize={12}
              fontWeight={600}
            />
            <YAxis 
              domain={[0, 100]} 
              stroke="#666"
              fontSize={12}
              fontWeight={600}
              label={{ value: 'אחוז נוכחות', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip PopperProps={{ disablePortal: true }}
              formatter={(value) => [`${value}%`, 'נוכחות']}
              contentStyle={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
            />
            <Legend />
            <Bar 
              dataKey="percentage" 
              name="אחוז נוכחות" 
              fill="url(#barGradient)"
              radius={[4, 4, 0, 0]}
            />
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
              outerRadius={120}
              fill="#667eea"
              dataKey="percentage"
              nameKey={timeRange === 'week' ? 'day' : 'date'}
              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
            >
              {attendanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip PopperProps={{ disablePortal: true }}
              formatter={(value) => [`${value}%`, 'נוכחות']}
              contentStyle={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
            />
          </PieChart>
        );
      case 'area':
        return (
          <AreaChart data={attendanceData} {...commonProps}>
            <defs>
              <linearGradient id="colorAttendanceMain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={timeRange === 'week' ? 'day' : 'date'} 
              stroke="#666"
              fontSize={12}
              fontWeight={600}
            />
            <YAxis 
              domain={[0, 100]} 
              stroke="#666"
              fontSize={12}
              fontWeight={600}
            />
            <Tooltip PopperProps={{ disablePortal: true }}
              formatter={(value) => [`${value}%`, 'נוכחות']}
              contentStyle={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="percentage" 
              name="אחוז נוכחות" 
              stroke="#667eea" 
              fillOpacity={1} 
              fill="url(#colorAttendanceMain)"
              strokeWidth={3}
            />
          </AreaChart>
        );
      default:
        return null;
    }
  };
  
  return (
    <Box>
      {/* Control Card */}
      <Fade in timeout={500}>
        <ControlCard>
          <CardContent sx={{ p: 3 }}>
            <Stack 
              direction={{ xs: 'column', lg: 'row' }} 
              spacing={3} 
              alignItems={{ xs: 'stretch', lg: 'center' }} 
              justifyContent="space-between"
            >
              {/* Title and Statistics */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ 
                  background: 'linear-gradient(45deg, #667eea 30%, #10b981 90%)',
                  boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)'
                }}>
                  <EqualizerIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    אנליטיקת נוכחות - {timeRange === 'week' ? 'שבועית' : 'חודשית'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ניתוח מתקדם של דפוסי נוכחות וטרנדים
                  </Typography>
                </Box>
              </Stack>
              
              {/* Controls */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {/* Time Range Selector */}
                <FormControl size="small" variant="outlined" sx={{ minWidth: 140 }}>
                  <InputLabel>טווח זמן</InputLabel>
                  <StyledSelect
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    label="טווח זמן"
                  >
                    <MenuItem value="week">שבועי</MenuItem>
                    <MenuItem value="month">חודשי</MenuItem>
                  </StyledSelect>
                </FormControl>
                
                {/* Class Filter Selector */}
                <FormControl size="small" variant="outlined" sx={{ minWidth: 140 }}>
                  <InputLabel>כיתה</InputLabel>
                  <StyledSelect
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    label="כיתה"
                  >
                    <MenuItem value="all">כל הכיתות</MenuItem>
                    <MenuItem value="1">כיתה א</MenuItem>
                    <MenuItem value="2">כיתה ב</MenuItem>
                  </StyledSelect>
                </FormControl>
                
                {/* Chart Type Selector */}
                <ToggleButtonGroup
                  value={chartType}
                  exclusive
                  onChange={(e, newValue) => newValue && setChartType(newValue)}
                  size="small"
                  sx={{ height: 40 }}
                >
                  <StyledToggleButton value="bar" title="גרף עמודות">
                    <BarChartIcon />
                  </StyledToggleButton>
                  <StyledToggleButton value="pie" title="גרף עוגה">
                    <PieChartIcon />
                  </StyledToggleButton>
                  <StyledToggleButton value="area" title="גרף אזורי">
                    <TimelineIcon />
                  </StyledToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Stack>
          </CardContent>
        </ControlCard>
      </Fade>
      
      {/* Display the appropriate chart based on selection */}
      <Zoom in timeout={800}>
        <ChartCard sx={{ mt: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                {renderChart()}
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </ChartCard>
      </Zoom>
      
      {/* Insights from the data */}
      {insights && (
        <Fade in timeout={1200}>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item size={{xs:12, sm:4}}>
              <InsightCard borderColor="#667eea">
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar sx={{ 
                    background: 'linear-gradient(45deg, #667eea 30%, #818cf8 90%)',
                    width: 56,
                    height: 56,
                    margin: '0 auto 16px',
                    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)'
                  }}>
                    <EqualizerIcon sx={{ fontSize: '1.8rem' }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#667eea', mb: 1 }}>
                    {insights.avgPercentage}%
                  </Typography>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    ממוצע נוכחות
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ממוצע נוכחות {timeRange === 'week' ? 'שבועי' : 'חודשי'}
                  </Typography>
                </CardContent>
              </InsightCard>
            </Grid>
            
            <Grid item size={{xs:12, sm:4}}>
              <InsightCard borderColor="#10b981">
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar sx={{ 
                    background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
                    width: 56,
                    height: 56,
                    margin: '0 auto 16px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                  }}>
                    <TrendingUpIcon sx={{ fontSize: '1.8rem' }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#10b981', mb: 1 }}>
                    {insights.highestDay.percentage}%
                  </Typography>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    נוכחות גבוהה ביותר
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ביום {insights.highestDay.day} ({insights.highestDay.date})
                  </Typography>
                </CardContent>
              </InsightCard>
            </Grid>
            
            <Grid item size={{xs:12, sm:4}}>
              <InsightCard borderColor="#ef4444">
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar sx={{ 
                    background: 'linear-gradient(45deg, #ef4444 30%, #f87171 90%)',
                    width: 56,
                    height: 56,
                    margin: '0 auto 16px',
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
                  }}>
                    <TrendingDownIcon sx={{ fontSize: '1.8rem' }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#ef4444', mb: 1 }}>
                    {insights.lowestDay.percentage}%
                  </Typography>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    נוכחות נמוכה ביותר
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ביום {insights.lowestDay.day} ({insights.lowestDay.date})
                  </Typography>
                </CardContent>
              </InsightCard>
            </Grid>
          </Grid>
        </Fade>
      )}
      
      {/* Recommendations display */}
      {insights && insights.lowestDay.percentage < 80 && (
        <Fade in timeout={1500}>
          <Card sx={{ 
            mt: 3, 
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%)',
            border: `1px solid ${alpha('#f59e0b', 0.3)}`,
            borderRadius: 3,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
              borderRadius: '3px 3px 0 0',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar sx={{ 
                  background: 'linear-gradient(45deg, #f59e0b 30%, #fbbf24 90%)',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)'
                }}>
                  <InsightsIcon />
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d97706' }}>
                    המלצות לשיפור הנוכחות:
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label="1" 
                        size="small" 
                        sx={{ mr: 1, background: '#f59e0b', color: 'white', fontWeight: 600 }} 
                      />
                      ליצור קשר עם הורי הילדים הנעדרים באופן תדיר ולהבין את הסיבות להיעדרות.
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label="2" 
                        size="small" 
                        sx={{ mr: 1, background: '#f59e0b', color: 'white', fontWeight: 600 }} 
                      />
                      לבחון אם יש דפוס היעדרות ביום {insights.lowestDay.day} ולשקול התאמת הפעילויות ביום זה.
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label="3" 
                        size="small" 
                        sx={{ mr: 1, background: '#f59e0b', color: 'white', fontWeight: 600 }} 
                      />
                      לעקוב אחר סיבות היעדרות נפוצות ולטפל בהן באופן יזום.
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Fade>
      )}
    </Box>
  );
};

export default AttendanceAnalytics;