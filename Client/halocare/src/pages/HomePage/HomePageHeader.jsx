import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Avatar,
  Zoom,
  Fade
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Refresh as RefreshIcon,
  Home as HomeIcon
} from '@mui/icons-material';

// 🎨 Stunning animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(76, 181, 195, 0.3); }
  50% { box-shadow: 0 0 30px rgba(76, 181, 195, 0.6), 0 0 40px rgba(76, 181, 195, 0.4); }
`;

// 🎭 Styled Components
const MainCard = styled(Paper)(() => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.2)',
  border: 'none',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981)',
    borderRadius: '24px 24px 0 0',
  }
}));

const GlowingButton = styled(IconButton)(({ glowColor = '#4cb5c3' }) => ({
  borderRadius: '16px',
  padding: '12px',
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${glowColor} 0%, ${glowColor}dd 100%)`,
  boxShadow: `0 8px 25px ${glowColor}40`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  color: 'white',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 15px 35px ${glowColor}60`,
    animation: `${pulse} 1.5s infinite`,
    color: 'white',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  }
}));

const FloatingAvatar = styled(Avatar)(() => ({
  position: 'relative',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
  border: '3px solid rgba(255,255,255,0.8)',
  boxShadow: '0 8px 25px rgba(76, 181, 195, 0.4)',
  '&:hover': {
    transform: 'scale(1.15) rotate(5deg)',
    animation: `${float} 2s ease-in-out infinite`,
    boxShadow: '0 15px 35px rgba(76, 181, 195, 0.6)',
  }
}));

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
    <Fade in timeout={800}>
      <MainCard
        elevation={0}
        dir='rtl'
        sx={{ mb: 3 }}
      >
        {/* Header Content */}
        <Box sx={{ 
          p: 4,
          background: 'linear-gradient(135deg, rgba(76,181,195,0.1) 0%, rgba(42,138,149,0.1) 100%)',
          borderRadius: '24px 24px 0 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><defs><pattern id=\'grain\' width=\'100\' height=\'100\' patternUnits=\'userSpaceOnUse\'><circle cx=\'50\' cy=\'50\' r=\'1\' fill=\'%234cb5c3\' opacity=\'0.1\'/></pattern></defs><rect width=\'100\' height=\'100\' fill=\'url(%23grain)\'/></svg>")',
            opacity: 0.3
          }} />
          
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center"
            sx={{ position: 'relative', zIndex: 1 }}
          >
            {/* Left side - Welcome content */}
            <Stack direction="row" spacing={3} alignItems="center">
              <Zoom in timeout={600}>
                <FloatingAvatar sx={{ 
                  width: 70, 
                  height: 70,
                  animation: `${float} 3s ease-in-out infinite`
                }}>
                  <HomeIcon sx={{ fontSize: '2rem' }} />
                </FloatingAvatar>
              </Zoom>
              
              <Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  ברוכים הבאים 
                </Typography>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  📅 {currentDate}
                </Typography>
              </Box>
            </Stack>
            
            {/* Right side - Refresh button */}
            <Stack direction="row" spacing={2}>
              <Tooltip 
                placement="top" 
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
                title="רענון נתונים"
                arrow
              >
                <GlowingButton
                  onClick={onRefresh}
                  glowColor="#4cb5c3"
                  sx={{
                    animation: `${glow} 3s ease-in-out infinite`,
                    '&:hover': {
                      animation: `${glow} 1s ease-in-out infinite, ${pulse} 1.5s infinite`,
                    }
                  }}
                >
                  <RefreshIcon sx={{ fontSize: '1.5rem' }} />
                </GlowingButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Shimmer effect overlay */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #4cb5c3, transparent)',
            animation: `${shimmer} 4s infinite`,
            zIndex: 2
          }} />
        </Box>
      </MainCard>
    </Fade>
  );
};

export default HomePageHeader;