import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Box,
  Button,
  styled
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';

// קבוע רוחב ה-Sidebar
const DRAWER_WIDTH = 240;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    marginTop: '64px', // גובה ה-Navbar
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    border: 'none',
    backgroundColor: '#f8f9fa',
  },
}));

const MainButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  borderRadius: '20px',
  padding: '10px 20px',
  margin: '16px auto',
  display: 'block',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  width: '80%',
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
  borderRadius: '8px',
  margin: '4px 8px',
  backgroundColor: active ? 'rgba(0, 150, 136, 0.08)' : 'transparent',
  '&:hover': {
    backgroundColor: active ? 'rgba(0, 150, 136, 0.12)' : 'rgba(0, 0, 0, 0.04)',
  },
  '& .MuiListItemIcon-root': {
    color: active ? theme.palette.primary.main : '#666',
  },
  '& .MuiListItemText-primary': {
    color: active ? theme.palette.primary.main : '#333',
    fontWeight: active ? '600' : '400',
  },
}));

const menuItems = [
  { text: 'ניהול ילדים', icon: <PeopleIcon />, path: '/kids' },
  { text: 'ניהול כיתה', icon: <SchoolIcon />, path: '/classes' },
  { text: 'יומן', icon: <CalendarMonthIcon />, path: '/calendar' },
  { text: 'לוח מודעות', icon: <NotificationsIcon />, path: '/notices' },
  { text: 'ניהול', icon: <PersonIcon />, path: '/profile' },
];

const Sidebar = ({ open, handleDrawerToggle, permanentDrawer = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigate = (path) => {
    navigate(path);
    if (!permanentDrawer) {
      handleDrawerToggle();
    }
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <MainButton 
        variant="contained" 
        startIcon={<AddCircleOutlineIcon />}
        onClick={() => handleNavigate('/new-kid')}
      >
        הוספה
      </MainButton>
      
      <Divider sx={{ mx: 2 }} />
      
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <StyledListItemButton
              active={location.pathname === item.path ? 1 : 0}
              onClick={() => handleNavigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ textAlign: 'right' }} />
              {item.text === 'ניהול' && (
                <EditIcon sx={{ fontSize: 18, ml: 1, color: '#666' }} />
              )}
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Button
          variant="outlined"
          color="primary"
          sx={{ borderRadius: '20px', width: '80%' }}
        >
          כל ההודעות
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {/* תצוגת מסך גדול - קבוע */}
      {permanentDrawer && (
        <StyledDrawer
          variant="permanent"
          open
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          {drawerContent}
        </StyledDrawer>
      )}
      
      {/* תצוגת מסך קטן - נפתח וסוגר */}
      {!permanentDrawer && (
        <StyledDrawer
          variant="temporary"
          open={open}
          onClose={handleDrawerToggle}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          {drawerContent}
        </StyledDrawer>
      )}
    </>
  );
};

export default Sidebar;