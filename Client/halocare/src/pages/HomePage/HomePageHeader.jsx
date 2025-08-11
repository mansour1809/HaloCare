import  { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon
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
            ברוכים הבאים 👋
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            📅 {currentDate}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={3} alignItems="center">
          
          <Tooltip placement="top" 
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
  }}title="רענון נתונים">
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