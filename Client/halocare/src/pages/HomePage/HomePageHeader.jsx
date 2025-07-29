import  { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Stack,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  AccessTime as TimeIcon,
  Groups as GroupsIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';

const HomePageHeader = ({ onRefresh }) => {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const date = new Date().toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCurrentDate(date);
  }, []);

  return (
    <Paper
    dir='rtl'
      elevation={3}
      sx={{
        p: 3,
        mb: 3,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            color="primary.main"
            sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}
          >
            👋 ברוכה הבאה, מנהלת הגן
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            📅 {currentDate}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={3} alignItems="center">
          {/* סטטיסטיקות מהירות */}
          <Stack direction="row" spacing={3}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" color="success.main">15/18</Typography>
              <Typography variant="caption" color="text.secondary">נוכחות היום</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" color="primary.main">12</Typography>
              <Typography variant="caption" color="text.secondary">אירועים היום</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" color="warning.main">5</Typography>
              <Typography variant="caption" color="text.secondary">בתהליך קליטה</Typography>
            </Box>
          </Stack>
          
          <Tooltip PopperProps={{ disablePortal: true }} title="רענון נתונים">
            <IconButton 
              onClick={onRefresh}
              color="primary"
              sx={{ 
                bgcolor: 'primary.light',
                '&:hover': { bgcolor: 'primary.main', color: 'white' }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
};


export default HomePageHeader;