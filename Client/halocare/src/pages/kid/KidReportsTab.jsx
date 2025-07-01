// src/components/kids/tabs/KidReportsTab.jsx - טאב דוחות תקופתיים (ריק לעתיד)
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Avatar,
  Stack,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import {
  Assessment as ReportsIcon,
  TrendingUp as ProgressIcon,
  BarChart as ChartIcon,
  Description as DocumentIcon,
  CalendarToday as CalendarIcon,
  Psychology as DevelopmentIcon,
  School as EducationIcon,
  MedicalServices as MedicalIcon,
  Construction as BuildIcon
} from '@mui/icons-material';

const KidReportsTab = ({ selectedKid }) => {
  
  //future Features
  const futureFeatures = [
    {
      icon: <ProgressIcon />,
      title: 'דוח התקדמות תקופתי',
      description: 'מעקב אחר התקדמות הילד בתחומים שונים לאורך זמן',
      color: 'primary.main',
      status: 'בפיתוח'
    },
    {
      icon: <ChartIcon />,
      title: 'גרפים וויזואליזציה',
      description: 'הצגה גרפית של נתוני התקדמות ושיפור',
      color: 'success.main',
      status: 'מתוכנן'
    },
    {
      icon: <DevelopmentIcon />,
      title: 'הערכת התפתחות',
      description: 'דוחות מפורטים על התפתחות קוגניטיבית, חברתית ורגשית',
      color: 'warning.main',
      status: 'מתוכנן'
    },
    {
      icon: <EducationIcon />,
      title: 'דוח חינוכי',
      description: 'סיכום התקדמות לימודית והמלצות חינוכיות',
      color: 'info.main',
      status: 'מתוכנן'
    },
    {
      icon: <MedicalIcon />,
      title: 'דוח רפואי מסכם',
      description: 'סיכום מצב רפואי והמלצות טיפוליות',
      color: 'error.main',
      status: 'מתוכנן'
    },
    {
      icon: <DocumentIcon />,
      title: 'יצוא דוחות',
      description: 'יצוא דוחות ל-PDF, Word ופורמטים נוספים',
      color: 'secondary.main',
      status: 'מתוכנן'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'בפיתוח': return 'warning';
      case 'מתוכנן': return 'info';
      case 'זמין': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box dir="rtl" sx={{ p: 3, bgcolor: 'background.default' }}>
      {/* Main Title */}
      <Paper sx={{ 
        p: 4, 
        mb: 4, 
        borderRadius: 2, 
        background: 'linear-gradient(135deg, #f8fafb 0%, #ffffff 100%)',
        textAlign: 'center'
      }}>
        <Avatar sx={{ 
          width: 80, 
          height: 80, 
          mx: 'auto', 
          mb: 3,
          bgcolor: 'primary.main',
          fontSize: '2rem'
        }}>
          <ReportsIcon sx={{ fontSize: '2.5rem' }} />
        </Avatar>
        
        <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
          📊 דוחות תקופתיים
        </Typography>
        
        <Typography variant="h6" color="text.secondary" mb={3}>
          {selectedKid.firstName} {selectedKid.lastName}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          אזור זה יכיל דוחות מפורטים על התקדמות הילד, הערכות תקופתיות וניתוחים סטטיסטיים.
          הפונקציות נמצאות כעת בפיתוח ויהיו זמינות בקרוב.
        </Typography>
        
        <Chip 
          icon={<BuildIcon />}
          label="בפיתוח - זמין בקרוב" 
          color="warning" 
          size="large"
          sx={{ fontWeight: 600, fontSize: '1rem', py: 2, px: 3 }}
        />
      </Paper>

      {/* Future Features */}
      <Typography variant="h5" fontWeight="bold" color="text.primary" mb={3}>
        🚀 תכונות שיתווספו בעתיד
      </Typography>
      
      <Grid container spacing={3}>
        {futureFeatures.map((feature, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card sx={{ 
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              }
            }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ 
                    bgcolor: feature.color, 
                    mr: 2,
                    width: 48,
                    height: 48
                  }}>
                    {feature.icon}
                  </Avatar>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Chip 
                      label={feature.status}
                      color={getStatusColor(feature.status)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Detailed description of future features */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" color="primary.main" mb={3}>
          💡 מה יכלול מודל הדוחות התקופתיים?
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary" mb={1}>
                  📈 מעקב אחר התקדמות
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  גרפים המציגים את השיפור בכל תחום טיפולי לאורך זמן, כולל השוואה בין תקופות שונות
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary" mb={1}>
                  🎯 יעדים והישגים
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  מעקב אחר יעדים טיפוליים, אחוזי השגה ותוכניות עבודה עתידיות
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary" mb={1}>
                  👨‍⚕️ המלצות מקצועיות
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  המלצות מקצועיות מהצוות הטיפולי לשיפור ופיתוח נוספים
                </Typography>
              </Box>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary" mb={1}>
                  📊 ניתוח סטטיסטי
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  נתונים מפורטים על תדירות טיפולים, רמות שיתוף פעולה וטרנדים
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary" mb={1}>
                  📑 דוחות לגורמים חיצוניים
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  דוחות מותאמים למשרד הרווחה, קופות חולים ומוסדות חינוך
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary" mb={1}>
                  🔄 עדכונים אוטומטיים
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  יצירת דוחות אוטומטית בהתאם לתדירות שנקבעה (שבועי/חודשי/תקופתי)
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Update message */}
      <Paper sx={{ 
        p: 3, 
        mt: 4, 
        borderRadius: 2,
        bgcolor: 'info.light',
        border: '1px solid',
        borderColor: 'info.main'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarIcon sx={{ color: 'info.main', mr: 2 }} />
          <Typography variant="h6" fontWeight={600} color="info.dark">
            📅 לוח זמנים לפיתוח
          </Typography>
        </Box>
        
        <Typography variant="body2" color="info.dark" paragraph>
          צוות הפיתוח עובד על מימוש התכונות הללו. המודול הראשון של דוחות התקדמות צפוי להיות זמין 
          במהלך החודשים הקרובים.
        </Typography>
        
        <Typography variant="body2" color="info.dark">
          <strong>שלב ראשון:</strong> דוחות התקדמות בסיסיים וגרפים<br />
          <strong>שלב שני:</strong> יצוא דוחות והתאמה אישית<br />
          <strong>שלב שלישי:</strong> ניתוחים מתקדמים והמלצות אוטומטיות
        </Typography>
      </Paper>
    </Box>
  );
};

export default KidReportsTab;