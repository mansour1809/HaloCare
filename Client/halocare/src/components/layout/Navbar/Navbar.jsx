import React, { useState } from 'react';
import { 
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Avatar,
  Tooltip,
  MenuItem,
  InputBase,
  Badge,
  Divider,
  Chip
} from '@mui/material';
import { styled, alpha, createTheme, ThemeProvider } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatIcon from '@mui/icons-material/Chat';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

// Creating a professional theme
const navbarTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
  },
  palette: {
    primary: {
      main: '#4cb5c3',
      light: '#7ec8d3',
      dark: '#2a8a95',
    }
  }
});

// Styled AppBar
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: 'none',
  borderBottom: '1px solid rgba(76, 181, 195, 0.1)',
  color: '#2d3748',
  position: 'fixed',
  zIndex: 1300,
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
  }
}));

// Styled search container
const SearchContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 20,
  backgroundColor: 'rgba(76, 181, 195, 0.08)',
  border: '2px solid rgba(76, 181, 195, 0.15)',
  transition: 'all 0.3s ease',
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
  width: 'auto',
  '&:hover': {
    backgroundColor: 'rgba(76, 181, 195, 0.12)',
    borderColor: 'rgba(76, 181, 195, 0.3)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 15px rgba(76, 181, 195, 0.2)',
  },
  '&:focus-within': {
    backgroundColor: 'rgba(76, 181, 195, 0.12)',
    borderColor: '#4cb5c3',
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 20px rgba(76, 181, 195, 0.25)',
  },
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#4cb5c3',
  fontSize: '1.2rem'
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: '#2d3748',
  fontWeight: 500,
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.2, 1.5, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: '0.95rem',
    [theme.breakpoints.up('md')]: {
      width: '30ch',
      '&:focus': {
        width: '35ch',
      },
    },
  },
}));

// Styled action buttons
const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(76, 181, 195, 0.08)',
  border: '2px solid rgba(76, 181, 195, 0.15)',
  borderRadius: 16,
  margin: theme.spacing(0, 0.5),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: 'rgba(76, 181, 195, 0.15)',
    borderColor: '#4cb5c3',
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: '0 6px 20px rgba(76, 181, 195, 0.25)',
  },
  '& .MuiSvgIcon-root': {
    color: '#4cb5c3',
    fontSize: '1.3rem'
  }
}));

// Styled user profile container
const UserProfileContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  padding: theme.spacing(0.5, 1.5, 0.5, 1),
  borderRadius: 20,
  backgroundColor: 'rgba(76, 181, 195, 0.08)',
  border: '2px solid rgba(76, 181, 195, 0.15)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: 'rgba(76, 181, 195, 0.15)',
    borderColor: '#4cb5c3',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(76, 181, 195, 0.25)',
  }
}));

// Styled logo container
const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: theme.spacing(0.5, 2),
  borderRadius: 20,
  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1) 0%, rgba(42, 138, 149, 0.1) 100%)',
  border: '1px solid rgba(76, 181, 195, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 4px 15px rgba(76, 181, 195, 0.2)',
  }
}));

// Styled menu
const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 16,
    marginTop: theme.spacing(1),
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981)',
      borderRadius: '16px 16px 0 0',
    }
  },
  '& .MuiMenuItem-root': {
    borderRadius: 8,
    margin: theme.spacing(0.5, 1),
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(76, 181, 195, 0.1)',
      transform: 'translateX(4px)',
    }
  }
}));

const Navbar = () => {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const selectedEmployeeId = currentUser?.id; 
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleOpenNotificationsMenu = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };
  
  const handleCloseNotificationsMenu = () => {
    setAnchorElNotifications(null);
  };
  
  const userSettings = [
    { name: 'פרופיל', icon: <PersonIcon />, action: () => window.location.href = '/#/employees/profile/' + selectedEmployeeId },
    { name: 'הגדרות מערכת', icon: <SettingsIcon />, action: () => window.location.href = '/#/settings' },
    { name: 'התנתקות', icon: <LogoutIcon />, action: () => {} }
  ];
  
  const notifications = [
    { id: 1, content: 'התקבלה בקשת הרשמה חדשה', time: 'לפני 5 דקות', type: 'info' },
    { id: 2, content: 'הוספת ילד חדש למערכת', time: 'לפני שעה', type: 'success' },
    { id: 3, content: 'ישיבת צוות ב-10:00', time: 'לפני 3 שעות', type: 'warning' },
  ];
  
  return (
    <ThemeProvider theme={navbarTheme}>
      <StyledAppBar position="fixed">
        <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
          
          {/* Right side - Profile and buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            
            {/* User menu */}
            <Tooltip title="תפריט משתמש" arrow>
              <UserProfileContainer onClick={handleOpenUserMenu}>
                <KeyboardArrowDownIcon sx={{ color: '#4cb5c3', fontSize: '1.2rem' }} />
                <Avatar 
                  alt={currentUser?.firstName || "משתמש"} 
                  src="/static/images/avatar/1.jpg" 
                  sx={{ 
                    width: 36, 
                    height: 36, 
                    ml: 1,
                    border: '2px solid rgba(76, 181, 195, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      borderColor: '#4cb5c3'
                    }
                  }}
                />
                <Typography variant="body2" sx={{ 
                  ml: 1, 
                  fontWeight: 600, 
                  color: '#2d3748',
                  display: { xs: 'none', sm: 'block' }
                }}>
                  {currentUser?.firstName || "משתמש"}
                </Typography>
              </UserProfileContainer>
            </Tooltip>

            {/* User menu */}
            <StyledMenu
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {userSettings.map((setting) => (
                <MenuItem 
                  key={setting.name} 
                  onClick={() => {
                    handleCloseUserMenu();
                    setting.action();
                  }}
                  sx={{ gap: 2 }}
                >
                  {setting.icon}
                  <Typography>{setting.name}</Typography>
                </MenuItem>
              ))}
            </StyledMenu>
            
            {/* Action buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="הודעות" arrow>
                <ActionButton size="medium">
                  <Badge badgeContent={3} color="error">
                    <ChatIcon />
                  </Badge>
                </ActionButton>
              </Tooltip>
              
              <Tooltip title="התראות" arrow>
                <ActionButton size="medium" onClick={handleOpenNotificationsMenu}>
                  <Badge badgeContent={notifications.length} color="error">
                    <NotificationsIcon />
                  </Badge>
                </ActionButton>
              </Tooltip>
            </Box>

            {/* Notifications menu */}
            <StyledMenu
              id="notifications-menu"
              anchorEl={anchorElNotifications}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorElNotifications)}
              onClose={handleCloseNotificationsMenu}
              PaperProps={{ sx: { maxWidth: 350, minWidth: 300 } }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="#2d3748">
                  🔔 התראות
                </Typography>
              </Box>
              <Divider />
              
              {notifications.map((notification) => (
                <MenuItem 
                  key={notification.id} 
                  onClick={handleCloseNotificationsMenu}
                  sx={{ 
                    flexDirection: 'column', 
                    alignItems: 'flex-start',
                    py: 1.5,
                    borderBottom: '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                    <Chip 
                      size="small" 
                      label={notification.type} 
                      color={
                        notification.type === 'success' ? 'success' : 
                        notification.type === 'warning' ? 'warning' : 'info'
                      }
                      sx={{ fontSize: '0.7rem' }}
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {notification.content}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {notification.time}
                  </Typography>
                </MenuItem>
              ))}
            </StyledMenu>
          </Box>
          
          {/* Left side - Logo */}
          <LogoContainer>
            <img 
              src={'./logo.png'} 
              alt="HALO CARE" 
              style={{ 
                height: '45px', 
                marginLeft: '8px',
                borderRadius: '6px'
              }}
            />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ 
                display: { xs: 'none', sm: 'block' }, 
                fontWeight: 800,
                background: 'linear-gradient(45deg, #4cb5c3, #2a8a95)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.3rem'
              }}
            >
              HALO CARE
            </Typography>
          </LogoContainer>
        </Toolbar>
      </StyledAppBar>
    </ThemeProvider>
  );
};

export default Navbar;