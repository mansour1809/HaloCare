// src/pages/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
  Avatar,
  Chip,
  Button,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  Group as GroupIcon,
  PersonAdd as AddIcon,
  Timeline as ProgressIcon,
  Assessment as ReportsIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as CompleteIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const quickActions = [
    {
      title: 'הוסף ילד חדש',
      description: 'התחל תהליך קליטה לילד חדש',
      icon: <AddIcon />,
      color: 'primary',
      path: '/kids/new'
    },
    {
      title: 'ניהול ילדים',
      description: 'צפה ונהל את כל הילדים במערכת',
      icon: <GroupIcon />,
      color: 'secondary',
      path: '/kids'
    },
    {
      title: 'דוחות קליטה',
      description: 'צפה בדוחות והתקדמות',
      icon: <ReportsIcon />,
      color: 'success',
      path: '/reports'
    }
  ];

  const stats = [
    {
      title: 'סה"כ ילדים',
      value: '24',
      change: '+3',
      changeType: 'positive',
      icon: <GroupIcon />
    },
    {
      title: 'הושלמו השבוע',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: <CompleteIcon />
    },
    {
      title: 'בתהליך כעת',
      value: '12',
      change: '-1',
      changeType: 'negative',
      icon: <ProgressIcon />
    },
    {
      title: 'אחוז השלמה',
      value: '85%',
      change: '+5%',
      changeType: 'positive',
      icon: <TrendingIcon />
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          ברוכים הבאים למערכת הקליטה
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          ניהול מקצועי ויעיל של תהליכי קליטת ילדים
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Chip
                      label={stat.change}
                      size="small"
                      color={stat.changeType === 'positive' ? 'success' : 'error'}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 56,
                      height: 56
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          פעולות מהירות
        </Typography>
        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardActionArea
                  onClick={() => navigate(action.path)}
                  sx={{ height: '100%', p: 3 }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: `${action.color}.main`,
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      {action.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight="medium" gutterBottom>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Recent Activity */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          פעילות אחרונה
        </Typography>
        <Box sx={{ mt: 2 }}>
          {[
            { action: 'הושלם תהליך קליטה', kid: 'יוסי כהן', time: 'לפני 2 שעות' },
            { action: 'נוצר ילד חדש', kid: 'שרה לוי', time: 'לפני 4 שעות' },
            { action: 'עודכן טופס', kid: 'דוד מזרחי', time: 'לפני יום' }
          ].map((activity, index) => (
            <Box 
              key={index}
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                py: 2,
                borderBottom: index < 2 ? `1px solid ${theme.palette.divider}` : 'none'
              }}
            >
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {activity.action}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activity.kid}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {activity.time}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};

export default HomePage;