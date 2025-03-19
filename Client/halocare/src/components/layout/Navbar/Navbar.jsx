import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';

const NavbarRoot = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'white',
  boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
  zIndex: theme.zIndex.drawer + 1,
  position: 'fixed',
  width: '100%',
  height: '64px'
}));

const LogoContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 'auto',
  marginRight: '16px'
});

const Logo = styled('img')({
  height: '30px',
  objectFit: 'contain',
});

const LogoText = styled(Typography)({
  fontWeight: 'bold',
  color: '#333',
  marginLeft: '8px',
});

const Navbar = ({ handleDrawerToggle }) => {
  return (
    <NavbarRoot>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ color: '#666', display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <LogoContainer>
          <Logo src={'/logo.jpeg'} alt="Halo Care Logo" />
          <LogoText variant="h6">HALO CARE</LogoText>
        </LogoContainer>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton sx={{ color: '#666' }}>
          <SearchIcon />
        </IconButton>
        
        <IconButton sx={{ color: '#666' }}>
          <NotificationsIcon />
        </IconButton>
        
        <IconButton sx={{ color: '#666' }}>
          <ChatIcon />
        </IconButton>
        
        <Avatar
          alt="User Profile"
          src="/static/images/avatar/1.jpg"
          sx={{ width: 32, height: 32, ml: 1 }}
        />
      </Toolbar>
    </NavbarRoot>
  );
};

export default Navbar;