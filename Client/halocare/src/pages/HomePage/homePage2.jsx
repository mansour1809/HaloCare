import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Chip,
  LinearProgress,
  IconButton,
  Badge,
  Tooltip,
  Alert,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Group,
  Person,
  CheckCircle,
  Warning,
  Schedule,
  Assignment,
  Phone,
  Refresh,
  TrendingUp,
  Class,
  Event,
  Notifications,
  Description,
  BarChart
} from '@mui/icons-material';

// קומפוננט מעוצב לכרטיס דשבורד
const DashboardCard = ({ children, gradient, onClick, height = "auto" }) => (
  <Card
    onClick={onClick}
    sx={{
      background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: 3,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.3s ease',
      height,
      position: 'relative',
      overflow: 'hidden',
      '&:hover': onClick ? {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      } : {},
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255,255,255,0.1)',
        opacity: 0,
        transition: 'opacity 0.3s ease',
      },
      '&:hover::before': onClick ? {
        opacity: 1,
      } : {},
    }}
  >
    {children}
  </Card>
);

// קומפוננט לסטטיסטיקות מהירות
const QuickStat = ({ icon, label, value, color, trend }) => (
  <Box textAlign="center">
    <Avatar sx={{ 
      bgcolor: `${color}.light`, 
      color: `${color}.main`,
      mb: 1,
      mx: 'auto',
      width: 56,
      height: 56
    }}>
      {icon}
    </Avatar>
    <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    {trend && (
      <Chip 
        icon={<TrendingUp />} 
        label={trend} 
        size="small" 
        color="success" 
        sx={{ mt: 0.5 }} 
      />
    )}
  </Box>
);

const HomePage2 = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalKids: 18,
    attendanceToday: 16,
    staffPresent: 8,
    pendingTasks: 5,
    activeClasses: 3,
    todayEvents: 4
  });

  // עדכון שעה
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // סימולציה של נתונים (במציאות יבוא מה-API)
  const [todayData, setTodayData] = useState({
    attendance: {
      present: [
        { name: 'שרה כהן', time: '07:45', class: 'כיתה א' },
        { name: 'דוד לוי', time: '08:15', class: 'כיתה ב' },
        { name: 'מיכל אברהם', time: '08:00', class: 'כיתה א' },
        { name: 'יוסף מזרחי', time: '07:50', class: 'כיתה ג' }
      ],
      absent: [
        { name: 'רונן ישראל', reason: 'חולה', notified: true },
        { name: 'נועה דוד', reason: 'לא דווח', notified: false }
      ]
    },
    urgentTasks: [
      { task: 'צור קשר עם הורי רונן ישראל', priority: 'high', type: 'call' },
      { task: 'השלם דוח טיפול לשרה כהן', priority: 'medium', type: 'document' },
      { task: 'אשר בקשת חופש לסייעת', priority: 'low', type: 'approval' }
    ],
    todayEvents: [
      { time: '09:00', event: 'טיפול פיזיותרפיה - דוד לוי', therapist: 'ד"ר רחל כהן' },
      { time: '10:30', event: 'הערכה התפתחותית - מיכל אברהם', therapist: 'יעל לוי' },
      { time: '14:00', event: 'פגישת צוות שבועית', therapist: 'כל הצוות' }
    ],
    recentAchievements: [
      { child: 'שרה כהן', achievement: 'הצליחה לומר "אמא" בבירור', time: 'לפני שעה' },
      { child: 'דוד לוי', achievement: 'עמד לבד למשך 30 שניות', time: 'אתמול' }
    ]
  });

  const formatTime = (date) => {
    return date.toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('he-IL', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* כותרת ראשית */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              🌟 ברוכה הבאה, מנהלת הגן
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {formatDate(currentTime)} • {formatTime(currentTime)}
            </Typography>
          </Box>
          <IconButton onClick={() => window.location.reload()} color="primary">
            <Refresh />
          </IconButton>
        </Stack>
        
        {/* התראה דחופה (אם יש) */}
        {todayData.attendance.absent.some(child => !child.notified) && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography fontWeight="bold">
              שים לב! יש ילדים שלא הגיעו ועדיין לא התקבל דיווח מההורים
            </Typography>
          </Alert>
        )}
      </Box>

      <Grid container spacing={3}>
        
        {/* סטטיסטיקות מהירות */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={3} color="primary.main">
              📊 מבט מהיר על הגן
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} md={2}>
                <QuickStat
                  icon={<Group />}
                  label="סך ילדים במעון"
                  value={stats.totalKids}
                  color="primary"
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <QuickStat
                  icon={<CheckCircle />}
                  label="נוכחים היום"
                  value={`${stats.attendanceToday}/${stats.totalKids}`}
                  color="success"
                  trend="+2 מאתמול"
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <QuickStat
                  icon={<Person />}
                  label="צוות נוכח"
                  value={stats.staffPresent}
                  color="info"
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <QuickStat
                  icon={<Class />}
                  label="כיתות פעילות"
                  value={stats.activeClasses}
                  color="secondary"
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <QuickStat
                  icon={<Event />}
                  label="אירועים היום"
                  value={stats.todayEvents}
                  color="warning"
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <QuickStat
                  icon={<Assignment />}
                  label="משימות דחופות"
                  value={stats.pendingTasks}
                  color="error"
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* נוכחות היום */}
        <Grid item xs={12} md={6}>
          <DashboardCard gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" height="400px">
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Stack direction="row" alignItems="center" mb={2}>
                <CheckCircle sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  נוכחות היום
                </Typography>
                <Chip 
                  label={`${((stats.attendanceToday/stats.totalKids)*100).toFixed(0)}%`}
                  sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.2)' }}
                />
              </Stack>
              
              <LinearProgress 
                variant="determinate" 
                value={(stats.attendanceToday/stats.totalKids)*100}
                sx={{ 
                  mb: 2, 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'white'
                  }
                }}
              />

              <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                ילדים שהגיעו ({todayData.attendance.present.length}):
              </Typography>
              
              <Box sx={{ 
                maxHeight: 180, 
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-thumb': { 
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  borderRadius: 2 
                }
              }}>
                {todayData.attendance.present.map((child, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 0.5,
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <Typography variant="body2">{child.name}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip 
                        label={child.class} 
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}
                      />
                      <Typography variant="caption">{child.time}</Typography>
                    </Stack>
                  </Box>
                ))}
              </Box>

              {todayData.attendance.absent.length > 0 && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                  <Typography variant="body2" sx={{ mb: 1, color: '#ffeb3b' }}>
                    נעדרים ({todayData.attendance.absent.length}):
                  </Typography>
                  {todayData.attendance.absent.map((child, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2">{child.name}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption">{child.reason}</Typography>
                        {!child.notified && (
                          <Badge color="error" variant="dot">
                            <Phone sx={{ fontSize: 16 }} />
                          </Badge>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </DashboardCard>
        </Grid>

        {/* משימות דחופות */}
        <Grid item xs={12} md={6}>
          <DashboardCard gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)" height="400px">
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Stack direction="row" alignItems="center" mb={2}>
                <Warning sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  משימות לטיפול דחוף
                </Typography>
                <Badge badgeContent={todayData.urgentTasks.length} color="error" sx={{ ml: 'auto' }}>
                  <Assignment />
                </Badge>
              </Stack>

              <List sx={{ py: 0 }}>
                {todayData.urgentTasks.map((task, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {task.type === 'call' && <Phone sx={{ color: 'white' }} />}
                        {task.type === 'document' && <Description sx={{ color: 'white' }} />}
                        {task.type === 'approval' && <CheckCircle sx={{ color: 'white' }} />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {task.task}
                          </Typography>
                        }
                        secondary={
                          <Chip
                            label={task.priority === 'high' ? 'דחוף' : task.priority === 'medium' ? 'בינוני' : 'נמוך'}
                            size="small"
                            color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'success'}
                            sx={{ mt: 0.5 }}
                          />
                        }
                      />
                    </ListItem>
                    {index < todayData.urgentTasks.length - 1 && (
                      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                    )}
                  </React.Fragment>
                ))}
              </List>

              <Button
                variant="contained"
                fullWidth
                sx={{ 
                  mt: 2,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              >
                צפה בכל המשימות
              </Button>
            </CardContent>
          </DashboardCard>
        </Grid>

        {/* יומן היום */}
        <Grid item xs={12} md={6}>
          <DashboardCard gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" height="350px">
            <CardContent sx={{ p: 3, height: '100%', color: '#333' }}>
              <Stack direction="row" alignItems="center" mb={2}>
                <Schedule sx={{ mr: 1, color: '#666' }} />
                <Typography variant="h6" fontWeight="bold" color="#333">
                  לוח הזמנים היום
                </Typography>
              </Stack>

              <List sx={{ py: 0 }}>
                {todayData.todayEvents.map((event, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 60 }}>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                          {event.time}
                        </Typography>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="500" color="#333">
                            {event.event}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="#666">
                            {event.therapist}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < todayData.todayEvents.length - 1 && (
                      <Divider sx={{ bgcolor: 'rgba(51,51,51,0.1)' }} />
                    )}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </DashboardCard>
        </Grid>

        {/* הישגים אחרונים */}
        <Grid item xs={12} md={6}>
          <DashboardCard gradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" height="350px">
            <CardContent sx={{ p: 3, height: '100%', color: '#333' }}>
              <Stack direction="row" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold" color="#333">
                  🎉 הישגים אחרונים
                </Typography>
              </Stack>

              <List sx={{ py: 0 }}>
                {todayData.recentAchievements.map((achievement, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                          ⭐
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="bold" color="#333">
                            {achievement.child}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="#666" sx={{ mb: 0.5 }}>
                              {achievement.achievement}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {achievement.time}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < todayData.recentAchievements.length - 1 && (
                      <Divider sx={{ bgcolor: 'rgba(51,51,51,0.1)' }} />
                    )}
                  </React.Fragment>
                ))}
              </List>

              <Button
                variant="outlined"
                fullWidth
                sx={{ 
                  mt: 2,
                  borderColor: '#666',
                  color: '#666',
                  '&:hover': { borderColor: '#333', color: '#333' }
                }}
              >
                רשום הישג חדש
              </Button>
            </CardContent>
          </DashboardCard>
        </Grid>

        {/* כפתורי פעולות מהירות */}
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2} color="primary.main">
              🚀 פעולות מהירות
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Person />}
                  sx={{ py: 1.5 }}
                >
                  רשום ילד חדש
                </Button>
              </Grid>
              <Grid item xs={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CheckCircle />}
                  sx={{ py: 1.5 }}
                >
                  דווח נוכחות
                </Button>
              </Grid>
              <Grid item xs={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Event />}
                  sx={{ py: 1.5 }}
                >
                  הוסף אירוע
                </Button>
              </Grid>
              <Grid item xs={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<BarChart />}
                  sx={{ py: 1.5 }}
                >
                  צפה בדוחות
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default HomePage2;