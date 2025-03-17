import { AppBar, Toolbar, IconButton, Typography, Avatar, Box, Menu, MenuItem } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useState, useEffect } from "react";

// eslint-disable-next-line react/prop-types
const Navbar = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  
  useEffect(() => {
    // קריאת פרטי המשתמש מהלוקל סטורג'
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    onLogout();
  };

  return (
    <AppBar position="static" sx={{ 
      backgroundColor: "#f5f5f5", 
      color: "#333", 
      direction: "rtl",
      height: '%',
      boxShadow: 2
    }}>
      <Toolbar>
        {/* לוגו */}
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", color: "#0077C2" }}>
          HALO CARE
        </Typography>

        {/* אייקונים ופרופיל */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleMenuOpen}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              {user?.name || 'משתמש'}
            </Typography>
            <Avatar 
              alt={user?.name || 'User Avatar'} 
              src="/static/images/avatar.jpg" 
              sx={{ width: 36, height: 36 }}
            />
          </Box>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <MenuItem onClick={handleMenuClose}>הפרופיל שלי</MenuItem>
            <MenuItem onClick={handleMenuClose}>הגדרות</MenuItem>
            <MenuItem onClick={handleLogout}>התנתקות</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;