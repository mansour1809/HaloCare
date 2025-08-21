import  { useState } from 'react';
import { 
  AppBar,
  Box,
  Toolbar,
  Typography,
  Menu,
  Avatar,
  Tooltip,
  MenuItem
} from '@mui/material';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { baseURL } from '../common/axiosConfig';

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

import { useAuth } from '../login/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const {currentUser} = useAuth();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const { logout} = useAuth();
  const navigate = useNavigate();

  const selectedEmployeeId = currentUser?.id; 
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userSettings = [
    { name: 'פרופיל', icon: <PersonIcon />, action: () => window.location.href = '/#/employees/profile/' + selectedEmployeeId },
    { name: 'הגדרות מערכת', icon: <SettingsIcon />, action: () => window.location.href = '/#/settings' },
    { name: 'התנתקות', icon: <LogoutIcon />, action: () => handleLogout() }
  ];
  
  return (
    <ThemeProvider theme={navbarTheme}>
      <StyledAppBar position="fixed">
        <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
          
          {/* Right side - Profile only */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            
            {/* User menu */}
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
              title="תפריט משתמש" 
              arrow
            >
              <UserProfileContainer onClick={handleOpenUserMenu}>
                <KeyboardArrowDownIcon sx={{ color: '#4cb5c3', fontSize: '1.2rem' }} />
                <Avatar 
                  alt={currentUser?.firstName || "משתמש"} 
                  src={`${baseURL}/Documents/content-by-path?path=${encodeURIComponent(currentUser.photo)}`}
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
          </Box>
          
          {/* Left side - Logo */}
          <LogoContainer>
            <img 
              src={"/bgroup3/prod/logo.png"} 
              alt="HALO CARE" 
              style={{ 
                height: '45px', 
                marginLeft: '8px',
                borderRadius: '6px',
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