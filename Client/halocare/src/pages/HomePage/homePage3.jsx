import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Chip, 
  Stack,
  IconButton,
  Divider,
  Button,
  LinearProgress,
  Paper
} from '@mui/material';
import { 
  School as SchoolIcon,
  People as PeopleIcon,
  EventAvailable as EventIcon,
  TrendingUp as TrendingIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  EmojiEvents as TrophyIcon,
  Refresh as RefreshIcon,
  Groups as GroupsIcon
} from '@mui/icons-material';

// נתוני דמה מבוססי המבנה האמיתי
const mockData = {
  statistics: {
    totalKids: 18,
    presentToday: 15,
    totalEmployees: 8,
    todayEvents: 12
  },
  classes: [
    {
      classId: 1,
      className: "כיתת הפרפרים",
      teacherName: "רותי כהן",
      kids: [
        { id: 7, firstName: "דני", lastName: "כהן", isPresent: true, age: "שנתיים ו-5 חודשים" },
        { id: 8, firstName: "מיה", lastName: "לוי", isPresent: true, age: "שנה ו-8 חודשים" },
        { id: 9, firstName: "נועם", lastName: "אבני", isPresent: false, age: "שנתיים ו-3 חודשים" },
        { id: 10, firstName: "תמר", lastName: "משה", isPresent: true, age: "שנה ו-11 חודשים" },
        { id: 11, firstName: "יוסף", lastName: "דוד", isPresent: true, age: "שנתיים ו-7 חודשים" },
        { id: 12, firstName: "שרה", lastName: "בן שמעון", isPresent: true, age: "שנתיים ו-2 חודשים" },
        { id: 13, firstName: "אור", lastName: "גרין", isPresent: true, age: "שנה ו-9 חודשים" },
        { id: 14, firstName: "עדן", lastName: "סימון", isPresent: false, age: "שנתיים ו-4 חודשים" },
        { id: 15, firstName: "רון", lastName: "אליהו", isPresent: true, age: "שנה ו-10 חודשים" }
      ]
    },
    {
      classId: 2,
      className: "כיתת הדבורים",
      teacherName: "מירי שלום",
      kids: [
        { id: 16, firstName: "ליה", lastName: "זוהר", isPresent: true, age: "2 שנים ו-8 חודשים" },
        { id: 17, firstName: "גיל", lastName: "כץ", isPresent: true, age: "2 שנים ו-6 חודשים" },
        { id: 18, firstName: "טל", lastName: "בר", isPresent: true, age: "2 שנים ו-9 חודשים" },
        { id: 19, firstName: "רועי", lastName: "נחמני", isPresent: false, age: "2 שנים ו-7 חודשים" },
        { id: 20, firstName: "מעיין", lastName: "שמיר", isPresent: true, age: "2 שנים ו-5 חודשים" },
        { id: 21, firstName: "איתי", lastName: "פרץ", isPresent: true, age: "2 שנים ו-10 חודשים" },
        { id: 22, firstName: "נגה", lastName: "רוזן", isPresent: true, age: "2 שנים ו-4 חודשים" },
        { id: 23, firstName: "אביב", lastName: "חן", isPresent: true, age: "2 שנים ו-8 חודשים" },
        { id: 24, firstName: "יעל", lastName: "גולד", isPresent: true, age: "2 שנים ו-6 חודשים" }
      ]
    }
  ],
  todayEvents: [
    { time: "09:00", title: "פיזיותרפיה - דני כהן", type: "פיזיותרפיה", color: "#7AC7D7" },
    { time: "10:30", title: "טיפול רגשי - מיה לוי", type: "טיפול רגשי", color: "#8FD3C3" },
    { time: "11:00", title: "ריפוי בעיסוק - תמר משה", type: "ריפוי בעיסוק", color: "#FF9F9F" },
    { time: "14:00", title: "פגישת הורים - משפחת אבני", type: "פגישת הורים", color: "#93CE85" },
    { time: "15:30", title: "ישיבת צוות שבועית", type: "ישיבת צוות", color: "#DEC49F" }
  ],
  recentAchievements: [
    { kidName: "דני כהן", achievement: "הצליח לקפוץ 3 פעמים על רגל אחת", time: "היום", type: "פיזיותרפיה" },
    { kidName: "מיה לוי", achievement: "הביעה רגשות דרך ציור", time: "אתמול", type: "טיפול רגשי" },
    { kidName: "תמר משה", achievement: "השתמשה בכפית באופן עצמאי", time: "לפני יומיים", type: "ריפוי בעיסוק" },
    { kidName: "יוסף דוד", achievement: "אמר 'תודה' לראשונה", time: "לפני 3 ימים", type: "תקשורת" }
  ]
};

// קומפוננט כרטיס סטטיסטיקה
const StatCard = ({ icon, title, value, subtitle, color, onClick }) => (
  <Card 
    sx={{ 
      background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
      border: `1px solid ${color}40`,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.3s ease',
      '&:hover': onClick ? { 
        transform: 'translateY(-2px)', 
        boxShadow: `0 8px 20px ${color}30` 
      } : {}
    }}
    onClick={onClick}
  >
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar sx={{ bgcolor: color, width: 50, height: 50 }}>
          {icon}
        </Avatar>
        <Box flex={1}>
          <Typography variant="h4" fontWeight="bold" color={color}>
            {value}
          </Typography>
          <Typography variant="subtitle1" fontWeight="600" color="text.primary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

// קומפוננט כרטיס ילד
const KidCard = ({ kid, onClick }) => (
  <Card 
    sx={{ 
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '1px solid #e0e0e0',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        borderColor: '#4fc3f7'
      }
    }}
    onClick={() => onClick(kid.id)}
  >
    <CardContent sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar 
          sx={{ 
            bgcolor: kid.isPresent ? '#4caf50' : '#f44336',
            width: 40, 
            height: 40,
            fontSize: '1.1rem'
          }}
        >
          {kid.firstName.charAt(0)}
        </Avatar>
        <Box flex={1}>
          <Typography variant="subtitle2" fontWeight="600">
            {kid.firstName} {kid.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {kid.age}
          </Typography>
        </Box>
        <Chip 
          label={kid.isPresent ? "נוכח" : "נעדר"} 
          size="small"
          color={kid.isPresent ? "success" : "error"}
          variant="outlined"
        />
      </Stack>
    </CardContent>
  </Card>
);

// קומפוננט ראשי
const HomePage3 = () => {
  const [selectedClass, setSelectedClass] = useState(null);

  const handleKidClick = (kidId) => {
    // בעתיד - ניתוב לפרופיל הילד
    console.log(`Navigate to kid profile: ${kidId}`);
    alert(`מעבר לפרופיל ילד מספר ${kidId}`);
  };

  const handleStatClick = (type) => {
    console.log(`Navigate to ${type}`);
  };

  const calculateClassStats = (classData) => {
    const total = classData.kids.length;
    const present = classData.kids.filter(kid => kid.isPresent).length;
    return { total, present, absent: total - present };
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* כותרת עם רענון */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary.main">
            ברוכה הבאה, מנהלת הגן 👋
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            סקירה יומית - {new Date().toLocaleDateString('he-IL')}
          </Typography>
        </Box>
        <IconButton 
          color="primary" 
          sx={{ 
            bgcolor: 'primary.light', 
            '&:hover': { bgcolor: 'primary.main', color: 'white' } 
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Stack>

      <Grid container spacing={3}>
        {/* כרטיסי סטטיסטיקה */}
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            icon={<SchoolIcon />}
            title="סך ילדים"
            value={mockData.statistics.totalKids}
            subtitle="רשומים בגן"
            color="#4fc3f7"
            onClick={() => handleStatClick('kids')}
          />
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            icon={<EventIcon />}
            title="נוכחים היום"
            value={mockData.statistics.presentToday}
            subtitle={`מתוך ${mockData.statistics.totalKids} ילדים`}
            color="#66bb6a"
            onClick={() => handleStatClick('attendance')}
          />
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            icon={<PeopleIcon />}
            title="צוות"
            value={mockData.statistics.totalEmployees}
            subtitle="עובדים פעילים"
            color="#ff7043"
            onClick={() => handleStatClick('employees')}
          />
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            icon={<TimeIcon />}
            title="אירועים היום"
            value={mockData.statistics.todayEvents}
            subtitle="בלוח השנה"
            color="#ab47bc"
            onClick={() => handleStatClick('calendar')}
          />
        </Grid>

        {/* תצוגת כיתות */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <GroupsIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  ילדים לפי כיתות
                </Typography>
              </Stack>
              
              <Grid container spacing={3}>
                {mockData.classes.map((classData) => {
                  const stats = calculateClassStats(classData);
                  return (
                    <Grid item xs={12} md={6} key={classData.classId}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          border: '1px solid #e0e0e0',
                          borderRadius: 2,
                          bgcolor: 'grey.50'
                        }}
                      >
                        <Stack spacing={2}>
                          {/* כותרת כיתה */}
                          <Box>
                            <Typography variant="h6" color="primary.main" fontWeight="bold">
                              {classData.className}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              גננת: {classData.teacherName}
                            </Typography>
                            <Box mt={1}>
                              <Stack direction="row" spacing={1}>
                                <Chip 
                                  label={`${stats.present} נוכחים`} 
                                  size="small" 
                                  color="success" 
                                  variant="outlined" 
                                />
                                <Chip 
                                  label={`${stats.absent} נעדרים`} 
                                  size="small" 
                                  color="error" 
                                  variant="outlined" 
                                />
                              </Stack>
                            </Box>
                          </Box>
                          
                          {/* רשימת ילדים */}
                          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                            <Stack spacing={1}>
                              {classData.kids.map((kid) => (
                                <KidCard 
                                  key={kid.id} 
                                  kid={kid} 
                                  onClick={handleKidClick}
                                />
                              ))}
                            </Stack>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* עמודה ימנית - אירועים והישגים */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* אירועים היום */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <TimeIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    אירועים להיום
                  </Typography>
                </Stack>
                
                <Stack spacing={2}>
                  {mockData.todayEvents.map((event, index) => (
                    <Box key={index}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip 
                          label={event.time} 
                          size="small" 
                          sx={{ 
                            bgcolor: event.color + '20',
                            color: event.color,
                            fontWeight: 'bold',
                            minWidth: 60
                          }}
                        />
                        <Box flex={1}>
                          <Typography variant="subtitle2" fontWeight="600">
                            {event.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.type}
                          </Typography>
                        </Box>
                      </Stack>
                      {index < mockData.todayEvents.length - 1 && (
                        <Divider sx={{ mt: 1.5 }} />
                      )}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* הישגים אחרונים */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <TrophyIcon color="warning" />
                  <Typography variant="h6" fontWeight="bold">
                    הישגים אחרונים
                  </Typography>
                </Stack>
                
                <Stack spacing={2}>
                  {mockData.recentAchievements.map((achievement, index) => (
                    <Box key={index}>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="subtitle2" fontWeight="600" color="primary.main">
                            {achievement.kidName}
                          </Typography>
                          <Chip 
                            label={achievement.type} 
                            size="small" 
                            variant="outlined"
                            color="primary"
                          />
                        </Stack>
                        <Typography variant="body2" color="text.primary">
                          {achievement.achievement}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {achievement.time}
                        </Typography>
                      </Stack>
                      {index < mockData.recentAchievements.length - 1 && (
                        <Divider sx={{ mt: 1.5 }} />
                      )}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage3;