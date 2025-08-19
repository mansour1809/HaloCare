import { useState, useEffect } from "react";
import {
  Paper, Grid, Typography, FormControl, Select, MenuItem,
  InputLabel, Button, Box, CircularProgress, Alert, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, Card, CardContent, Divider, Tooltip,
  Chip, Stack, Fade, Zoom, alpha, useTheme, keyframes
} from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { 
  PictureAsPdf as PictureAsPdfIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarTodayIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  Analytics as AnalyticsIcon,
  Insights as InsightsIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { useAttendance } from "./AttendanceContext";
import { generateAttendanceReport } from '../../utils/pdfGenerator';
import 'dayjs/locale/he';

// Graph components
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { useDispatch } from "react-redux";
import Swal from 'sweetalert2';
import HebrewReactDatePicker from "../../components/common/HebrewReactDatePicker";
import { baseURL } from "../../components/common/axiosConfig";

// Professional animations matching our style
const gradientShift = keyframes`
  0% { backgroundPosition: 0% 50%; }
  50% { backgroundPosition: 100% 50%; }
  100% { backgroundPosition: 0% 50%; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(76, 181, 195, 0.3); }
  50% { box-shadow: 0 0 30px rgba(76, 181, 195, 0.6), 0 0 40px rgba(76, 181, 195, 0.4); }
`;

// Professional theme with our colors
const reportsTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '2rem',
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
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'visible',
          position: 'relative',
        }
      }
    }
  }
});

// Styled color array for graphs
const COLORS = ['#10b981', '#ef4444'];

// Styled control card
const ControlCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 20,
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  overflow: 'visible',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    borderRadius: '20px 20px 0 0',
    animation: `${gradientShift} 3s ease infinite`,
  }
}));

// Styled report card
const ReportCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 20,
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  overflow: 'visible',
  position: 'relative',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 15px 50px rgba(76, 181, 195, 0.15)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #2a8a95, #10b981)',
    borderRadius: '20px 20px 0 0',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(76, 181, 195, 0.05), transparent)',
    animation: `${shimmer} 3s infinite`,
  }
}));

// Styled glowing button
const GlowButton = styled(Button)(({ theme, glowColor = '#4cb5c3' }) => ({
  borderRadius: 16,
  fontWeight: 600,
  padding: '12px 24px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(glowColor, 0.3)}, transparent)`,
    transition: 'left 0.5s',
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 12px 35px ${alpha(glowColor, 0.4)}`,
    animation: `${pulse} 1.5s infinite`,
  },
  '&:hover::before': {
    left: '100%',
  }
}));

// Styled select
const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: 16,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  '& .MuiOutlinedInput-notchedOutline': {
    border: '1px solid rgba(76, 181, 195, 0.2)',
    transition: 'all 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#4cb5c3',
      boxShadow: '0 4px 15px rgba(76, 181, 195, 0.15)',
    },
  },
  '&.Mui-focused': {
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#4cb5c3',
      borderWidth: '2px',
      boxShadow: '0 6px 20px rgba(76, 181, 195, 0.2)',
    },
  }
}));

// Styled statistics card
const StatCard = styled(Card)(({ borderColor }) => ({
  height: '100%',
  borderRadius: 16,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(borderColor || '#4cb5c3', 0.2)}`,
  boxShadow: `0 6px 20px ${alpha(borderColor || '#4cb5c3', 0.15)}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 12px 35px ${alpha(borderColor || '#4cb5c3', 0.25)}`,
    animation: `${glow} 2s infinite`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: borderColor || '#4cb5c3',
  }
}));

const AnimatedAvatar = styled(Avatar)(({ theme }) => ({
  animation: `${float} 3s ease-in-out infinite`,
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  overflow: 'hidden',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
}));

// Component for viewing report content - Enhanced styling only
const ReportPreview = ({ child, attendanceRecords, startDate, endDate }) => {
  const theme = useTheme();

  if (!child || !attendanceRecords) return null;

  const total = attendanceRecords.length;
  const present = attendanceRecords.filter(r => r.isPresent).length;
  const absent = total - present;
  const percent = total > 0 ? Math.round((present / total) * 100) : 0;
  
  // Prepare data for pie chart 
  const pieData = [
    { name: 'נוכחות', value: present },
    { name: 'היעדרות', value: absent }
  ];
  
  // Prepare data for trend chart 
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
  
  // Analyze attendance streaks 
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
  
  // Analyze absence patterns 
  const absencesByReason = {};
  attendanceRecords.filter(r => !r.isPresent).forEach(record => {
    const reason = record.absenceReason || 'לא צוין';
    absencesByReason[reason] = (absencesByReason[reason] || 0) + 1;
  });
  
  return (
    <Fade in timeout={800}>
      <ReportCard sx={{ mt: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {/* Report title - Enhanced styling */}
          <Box sx={{ 
            p: 4, 
            background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
            borderRadius: '20px 20px 0 0', 
            position: 'relative' 
          }}>
            <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
              <AnimatedAvatar 
                src={child.photo || undefined}
                alt={`${child.firstName} ${child.lastName}`}
                sx={{ 
                  width: 80, 
                  height: 80, 
                  border: '4px solid white', 
                  boxShadow: '0 8px 25px rgba(76, 181, 195, 0.3)',
                  background: 'linear-gradient(45deg, #4cb5c3 30%, #10b981 90%)'
                }}
              >
                {child.firstName?.charAt(0)}
              </AnimatedAvatar>
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}>
                  {child.firstName} {child.lastName}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  דוח נוכחות מפורט
                </Typography>
                <Stack direction="row" spacing={1}>
                  <StyledChip 
                    label={`${dayjs(startDate).format("DD/MM/YYYY")} - ${dayjs(endDate).format("DD/MM/YYYY")}`}
                    icon={<CalendarTodayIcon />}
                    color="primary"
                    variant="outlined"
                  />
                  <StyledChip 
                    label={`כיתה ${child.classId === 1 ? "א" : "ב"}`}
                    icon={<SchoolIcon />}
                    color="secondary"
                    variant="outlined"
                  />
                </Stack>
              </Box>
            </Stack>
            
            <Divider sx={{ mb: 3 }} />
            
            {/* Graphs - Enhanced styling */}
            <Grid container spacing={4}>
              <Grid item size={{xs:12, md:6}}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 700,
                    color: '#2a8a95'
                  }}>
                    פילוח נוכחות
                  </Typography>
                  <Box sx={{ height: 220 }}>
                    <ResponsiveContainer>
                      <PieChart>
                     <Pie
  data={pieData}
  cx="50%"
  cy="50%"
  labelLine={false}
  outerRadius={90}
  fill="#8884d8"
  dataKey="value"
  label={({name, percent, cx, cy, midAngle, innerRadius, outerRadius}) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30; // מרחק מהגרף
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#000000" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12px"
        fontWeight="bold"
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  }}
>
  {pieData.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
  ))}
</Pie>
                        <RechartsTooltip 
                          contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(10px)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </Grid>
              <Grid item size={{xs:12, md:6}}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 700,
                    color: '#2a8a95'
                  }}>
                    מגמת נוכחות יומית
                  </Typography>
                  <Box sx={{ height: 220 }}>
                    <ResponsiveContainer>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis domain={[0, 1]} ticks={[0, 1]} fontSize={12} />
                        <RechartsTooltip 
                          formatter={(value) => [value === 1 ? 'נוכח' : 'נעדר', 'סטטוס']}
                          contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(10px)'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="isPresent" 
                          name="נוכחות" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ stroke: '#10b981', strokeWidth: 3, r: 5, fill: '#10b981' }}
                          activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          {/* Detailed statistics - Enhanced styling */}
          <Box sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontWeight: 700, 
              mb: 3,
              color: '#2a8a95'
            }}>
              סיכום נתונים
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item size={{xs:6, sm:3}}>
                <StatCard borderColor="#4cb5c3">
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <AnimatedAvatar sx={{ 
                      background: 'linear-gradient(45deg, #4cb5c3 30%, #7ec8d3 90%)',
                      width: 48,
                      height: 48,
                      margin: '0 auto 12px',
                      boxShadow: '0 6px 20px rgba(76, 181, 195, 0.3)'
                    }}>
                      <CalendarTodayIcon />
                    </AnimatedAvatar>
                    <Typography variant="h3" color="#4cb5c3" fontWeight={700}>
                      {total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      סה"כ ימים
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              <Grid item size={{xs:6, sm:3}}>
                <StatCard borderColor="#10b981">
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <AnimatedAvatar sx={{ 
                      background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
                      width: 48,
                      height: 48,
                      margin: '0 auto 12px',
                      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
                      animationDelay: '0.2s'
                    }}>
                      <CheckCircleIcon />
                    </AnimatedAvatar>
                    <Typography variant="h3" color="#10b981" fontWeight={700}>
                      {present}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ימי נוכחות
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              <Grid item size={{xs:6, sm:3}}>
                <StatCard borderColor="#ef4444">
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <AnimatedAvatar sx={{ 
                      background: 'linear-gradient(45deg, #ef4444 30%, #f87171 90%)',
                      width: 48,
                      height: 48,
                      margin: '0 auto 12px',
                      boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)',
                      animationDelay: '0.4s'
                    }}>
                      <CancelIcon />
                    </AnimatedAvatar>
                    <Typography variant="h3" color="#ef4444" fontWeight={700}>
                      {absent}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ימי היעדרות
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              <Grid item size={{xs:6, sm:3}}>
                <StatCard borderColor="#f59e0b">
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <AnimatedAvatar sx={{ 
                      background: 'linear-gradient(45deg, #f59e0b 30%, #fbbf24 90%)',
                      width: 48,
                      height: 48,
                      margin: '0 auto 12px',
                      boxShadow: '0 6px 20px rgba(245, 158, 11, 0.3)',
                      animationDelay: '0.6s'
                    }}>
                      <AssessmentIcon />
                    </AnimatedAvatar>
                    <Typography variant="h3" color="#f59e0b" fontWeight={700}>
                      {percent}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      אחוז נוכחות
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
            </Grid>
            
            {/* Additional analysis - Enhanced styling */}
            {total > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontWeight: 700, 
                  mb: 3,
                  color: '#2a8a95'
                }}>
                  ניתוח מתקדם
                </Typography>
                <Grid container spacing={3}>
                  <Grid item size={{xs:12, md:6}}>
                    <Card variant="outlined" sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(139, 92, 246, 0.15)'
                      }
                    }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <AnimatedAvatar sx={{ 
                          background: 'linear-gradient(45deg, #8b5cf6 30%, #a78bfa 90%)',
                          boxShadow: '0 6px 20px rgba(139, 92, 246, 0.3)'
                        }}>
                          <TrendingUpIcon />
                        </AnimatedAvatar>
                        <Typography variant="h6" fontWeight={700}>
                          מגמות ורצפים
                        </Typography>
                      </Stack>
                      
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                            רצף נוכחות ארוך ביותר:
                          </Typography>
                          <StyledChip 
                            label={`${longestStreak} ימים רצופים`}
                            color="success"
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                            מגמה נוכחית:
                          </Typography>
                          <StyledChip 
                            label={recentTrend === 'עולה' ? 'חיובית' : 'לשיפור'}
                            color={recentTrend === 'עולה' ? 'success' : 'warning'}
                            size="small"
                          />
                        </Box>
                        {percent < 75 && (
                          <Alert severity="warning" sx={{ 
                            mt: 2, 
                            borderRadius: 2,
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.3)'
                          }}>
                            אחוז הנוכחות נמוך מהממוצע. מומלץ לבצע שיחה עם ההורים.
                          </Alert>
                        )}
                      </Stack>
                    </Card>
                  </Grid>
                  <Grid item size={{xs:12, md:6}}>
                    <Card variant="outlined" sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(6, 182, 212, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(6, 182, 212, 0.15)'
                      }
                    }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <AnimatedAvatar sx={{ 
                          background: 'linear-gradient(45deg, #06b6d4 30%, #22d3ee 90%)',
                          boxShadow: '0 6px 20px rgba(6, 182, 212, 0.3)'
                        }}>
                          <InsightsIcon />
                        </AnimatedAvatar>
                        <Typography variant="h6" fontWeight={700}>
                          ניתוח היעדרויות
                        </Typography>
                      </Stack>
                      
                      {Object.keys(absencesByReason).length > 0 ? (
                        <Stack spacing={1}>
                          {Object.entries(absencesByReason).map(([reason, count], index) => (
                            <Box key={index} sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              p: 1,
                              borderRadius: 2,
                              bgcolor: alpha('#ef4444', 0.05),
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: alpha('#ef4444', 0.1),
                                transform: 'translateX(-4px)'
                              }
                            }}>
                              <Typography variant="body2" fontWeight={500}>
                                {reason}
                              </Typography>
                              <StyledChip 
                                label={`${count} ימים`}
                                size="small"
                                color="error"
                                variant="outlined"
                              />
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                          <AnimatedAvatar sx={{ 
                            width: 60, 
                            height: 60, 
                            margin: '0 auto 12px',
                            background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
                            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)'
                          }}>
                            <CheckCircleIcon sx={{ fontSize: '2rem' }} />
                          </AnimatedAvatar>
                          <Typography variant="body2" color="text.secondary">
                            אין היעדרויות בתקופה זו
                          </Typography>
                        </Box>
                      )}
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Attendance table - Enhanced styling */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                fontWeight: 700, 
                mb: 2,
                color: '#2a8a95'
              }}>
                פירוט נוכחות יומי
              </Typography>
              <StyledTableContainer 
                component={Paper} 
                variant="outlined" 
                sx={{ maxHeight: 400 }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ 
                      '& th': { 
                        background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                        fontWeight: 700,
                        borderBottom: '2px solid rgba(76, 181, 195, 0.2)',
                        color: '#2a8a95'
                      }
                    }}>
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
                            bgcolor: record.isPresent ? 
                              alpha('#10b981', 0.05) : 
                              alpha('#ef4444', 0.05),
                            '&:hover': {
                              bgcolor: record.isPresent ? 
                                alpha('#10b981', 0.1) : 
                                alpha('#ef4444', 0.1),
                              transform: 'scale(1.01)',
                              transition: 'all 0.2s ease',
                            }
                          }}
                        >
                          <TableCell align="center" sx={{ fontWeight: 600 }}>
                            {recordDate.format("DD/MM/YYYY")}
                          </TableCell>
                          <TableCell align="center">
                            {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][recordDate.day()]}
                          </TableCell>
                          <TableCell align="center">
                            {record.isPresent ? (
                              <Tooltip placement="top" title="נוכח" arrow
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
                                }}
                              >
                                <CheckCircleIcon color="success" sx={{ fontSize: '1.5rem' }} />
                              </Tooltip>
                            ) : (
                              <Tooltip placement="top" title="נעדר" arrow
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
                                }}
                              >
                                <CancelIcon color="error" sx={{ fontSize: '1.5rem' }} />
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.absenceReason ? (
                              <StyledChip 
                                label={record.absenceReason}
                                size="small"
                                color="error"
                                variant="outlined"
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </Box>
          </Box>
        </CardContent>
      </ReportCard>
    </Fade>
  );
};

const AttendanceReports = () => {
  const dispatch = useDispatch();
  const { kids } = useSelector(state => state.kids);
  const { attData } = useSelector(state => state.attendance);
  const { selectedDateRange, updateDateRange, loadKidAttendance } = useAttendance();
  
  // States 
  const [childId, setChildId] = useState("");
  const [rangeType, setRangeType] = useState("week");
  const [startDate, setStartDate] = useState(dayjs().startOf("week"));
  const [endDate, setEndDate] = useState(dayjs().endOf("week"));
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const theme = useTheme();
  
  // Update selected child for report 
  useEffect(() => {
    if (childId && kids?.length > 0) {
      const child = kids.find(k => k.id.toString() === childId);
      setSelectedChild(child || null);
    } else {
      setSelectedChild(null);
    }
  }, [childId, kids]);
  
  // Update dates based on selected range 
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
  
  // Load attendance data for report 
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
      
      // Filter by date range
      const filteredData = data?.filter(record => {
        const recordDate = dayjs(record.attendanceDate);
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
  
  // Generate report preview 
  const handlePreviewReport = async () => {
    const data = await fetchAttendanceData();
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
  
  // Generate and download report 
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
    <ThemeProvider theme={reportsTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
        <Box>
          {/* Control Card - Enhanced styling */}
          <Fade in timeout={500}>
            <ControlCard>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                  <AnimatedAvatar sx={{ 
                    background: 'linear-gradient(45deg, #4cb5c3 30%, #10b981 90%)',
                    boxShadow: '0 6px 20px rgba(76, 181, 195, 0.3)',
                    width: 56,
                    height: 56
                  }}>
                    <AssessmentIcon sx={{ fontSize: '2rem' }} />
                  </AnimatedAvatar>
                  <Box>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 800,
                      background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      הפקת דוח נוכחות מתקדם
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      צור דוח מפורט עם ניתוח ותובנות על נוכחות הילד
                    </Typography>
                  </Box>
                </Stack>
                
                <Grid container spacing={3} alignItems="center">
                  <Grid item size={{xs:12, sm:6, md:3}}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>בחר ילד</InputLabel>
                      <StyledSelect 
                        value={childId} 
                        onChange={(e) => {
                          setChildId(e.target.value);
                          setShowPreview(false);
                          setAttendanceData([]);
                        }}
                        label="בחר ילד"
                      >
                        {kids?.filter(k => k.isActive).map(kid => (
                          <MenuItem key={kid.id} value={kid.id.toString()} dir="rtl">
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar sx={{ width: 24, height: 24 }}
                                src={
                                          kid.photoPath
                                            ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(kid.photoPath)}`
                                            : ''
                                        }
                                        alt={`${kid.firstName} ${kid.lastName}`}
                                        >
                                          {!kid.photoPath && (
                                          <>
                                            {`${kid.firstName?.[0] || ''}${kid.lastName?.[0] || ''}`}
                                          </>
                                        )}
                              </Avatar>
                              <Typography>
                                {kid.firstName} {kid.lastName}
                              </Typography>
                            </Stack>
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </FormControl>
                  </Grid>
                  
                  <Grid item size={{xs:12, sm:6, md:3}}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>טווח זמן</InputLabel>
                      <StyledSelect 
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
                      </StyledSelect>
                    </FormControl>
                  </Grid>
                  
                  {rangeType === "custom" && (
                    <>
                      <Grid item size={{xs:12, sm:6, md:3}}>
                        <HebrewReactDatePicker
                          maxDate={new Date()}
                          minDate={new Date('2020-01-01')}
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
                              sx: {
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 4,
                                  background: 'rgba(255, 255, 255, 0.9)',
                                  backdropFilter: 'blur(10px)',
                                }
                              }
                            } 
                          }}
                        />
                      </Grid>
                      <Grid item size={{xs:12, sm:6, md:3}}>
                        <HebrewReactDatePicker
                          maxDate={new Date()}
                          minDate={startDate}
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
                              sx: {
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 4,
                                  background: 'rgba(255, 255, 255, 0.9)',
                                  backdropFilter: 'blur(10px)',
                                }
                              }
                            }
                          }}
                        />
                      </Grid>
                    </>
                  )}
                  
                  <Grid item size={{xs:12}}>
                    <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                      <GlowButton 
                        variant="outlined"
                        size="large"
                        startIcon={<VisibilityIcon />}
                        onClick={handlePreviewReport} 
                        disabled={loading || !childId}
                        glowColor="#4cb5c3"
                        sx={{ 
                          color: '#4cb5c3',
                          borderColor: '#4cb5c3',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                            color: 'white',
                            borderColor: 'transparent',
                          }
                        }}
                      >
                        {loading ? (
                          <>
                            <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                            טוען...
                          </>
                        ) : (
                          'צפה בדוח'
                        )}
                      </GlowButton>
                      
                      <GlowButton 
                        variant="contained"
                        size="large"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={handleGenerateReport} 
                        disabled={loading || !childId || (!showPreview && attendanceData.length === 0)}
                        glowColor="#10b981"
                        sx={{
                          background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
                          boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #059669 30%, #10b981 90%)',
                          }
                        }}
                      >
                        הורד כ-PDF
                      </GlowButton>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </ControlCard>
          </Fade>

          {/* Report Preview */}
          {showPreview && attendanceData.length > 0 && (
            <ReportPreview 
              child={selectedChild}
              attendanceRecords={attendanceData}
              startDate={startDate}
              endDate={endDate}
            />
          )}
          
          {/* No data message - Enhanced styling */}
          {showPreview && attendanceData.length === 0 && (
            <Fade in>
              <Card sx={{ 
                mt: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 20,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #06b6d4, #22d3ee, #0891b2)',
                  borderRadius: '20px 20px 0 0',
                }
              }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <AnimatedAvatar sx={{ 
                    width: 80, 
                    height: 80, 
                    margin: '0 auto 16px',
                    background: 'linear-gradient(45deg, #06b6d4 30%, #22d3ee 90%)',
                    boxShadow: '0 6px 20px rgba(6, 182, 212, 0.3)'
                  }}>
                    <AnalyticsIcon sx={{ fontSize: '3rem' }} />
                  </AnimatedAvatar>
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                    לא נמצאו נתוני נוכחות
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    לא נמצאו נתוני נוכחות בטווח התאריכים שנבחר
                  </Typography>
                  <GlowButton 
                    variant="outlined"
                    startIcon={<ArrowForwardIcon />}
                    onClick={() => setShowPreview(false)}
                    glowColor="#06b6d4"
                    sx={{ 
                      color: '#06b6d4',
                      borderColor: '#06b6d4',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #06b6d4 30%, #22d3ee 90%)',
                        color: 'white',
                        borderColor: 'transparent',
                      }
                    }}
                  >
                    חזור לבחירות
                  </GlowButton>
                </CardContent>
              </Card>
            </Fade>
          )}
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default AttendanceReports;