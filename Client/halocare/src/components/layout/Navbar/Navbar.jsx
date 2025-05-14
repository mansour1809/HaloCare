import React, { useState } from 'react';
import { 
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  InputBase,
  Badge,
  Divider
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatIcon from '@mui/icons-material/Chat';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// import haloCareLogoSrc from '/logo.jpeg'; // עדכן את הנתיב ללוגו

// חיפוש מעוצב
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  border: '1px solid #e0e0e0',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: 'auto',
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
  color: '#757575',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '25ch',
    },
  },
}));

const Navbar = () => {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  
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
  
  const userSettings = ['פרופיל', 'הגדרות חשבון', 'הגדרות מערכת', 'התנתקות'];
  
  // דוגמה להתראות
  const notifications = [
    { id: 1, content: 'התקבלה בקשת הרשמה חדשה', time: 'לפני 5 דקות' },
    { id: 2, content: 'הוספת ילד חדש', time: 'לפני שעה' },
    { id: 3, content: 'ישיבת צוות ב-10:00', time: 'לפני 3 שעות' },
  ];
  
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        color: 'black',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Toolbar>
          <Box sx={{ flexGrow: 0, marginRight: 2 }}>
            <Tooltip title="הגדרות משתמש">
              <Box 
                onClick={handleOpenUserMenu} 
                sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            padding: '4px 8px 4px 12px'
                }}
              >
                <KeyboardArrowDownIcon fontSize="small" />
                <Avatar 
            alt="צוות" 
            src="/static/images/avatar/1.jpg" 
            sx={{ width: 32, height: 32, ml: 1 }}
                />
              </Box>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {userSettings.map((setting) => (
                <MenuItem 
            key={setting} 
            onClick={() => {
              handleCloseUserMenu();
              if (setting === 'פרופיל') {
                window.location.href = '/#/profile';
              }
            }}
                >
            <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          
          {/* התראות והודעות - בצד ימין */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, marginRight: 2 }}>
          <IconButton size="large" color="inherit">
            <Badge badgeContent={3} color="error">
              <ChatIcon />
            </Badge>
          </IconButton>
          
          <IconButton
            size="large"
            color="inherit"
            onClick={handleOpenNotificationsMenu}
          >
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            sx={{ mt: '45px' }}
            id="notifications-menu"
            anchorEl={anchorElNotifications}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElNotifications)}
            onClose={handleCloseNotificationsMenu}
          >
            <Typography sx={{ p: 2, fontWeight: 'bold' }}>התראות</Typography>
            <Divider />
            {notifications.map((notification) => (
              <MenuItem key={notification.id} onClick={handleCloseNotificationsMenu}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2">{notification.content}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notification.time}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
            <Divider />
            <MenuItem sx={{ justifyContent: 'center' }}>
              <Typography variant="button" color="primary">
                הצג את כל ההתראות
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
        
        {/* חיפוש */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            dir='rtl'
            placeholder="חיפוש..."
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>
        
        {/* מרווח אוטומטי */}
        <Box sx={{ flexGrow: 1 }} />
        
        {/* לוגו בצד שמאל */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ 
              display: { xs: 'none', sm: 'block' }, 
              fontWeight: 'bold',
              color: '#4fc3f7'
            }}
          >
            HALO CARE
          </Typography>
          <img 
            src={'./logo.jpeg'} 
            alt="HALO CARE" 
            style={{ height: '30px', marginLeft: '10px' }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;