import { AppBar, Toolbar, IconButton, Typography, Avatar, Box } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";

const Navbar = () => {
  return (
    <AppBar position="static" sx={{ 
        backgroundColor: "#f5f5f5", 
        color: "#333", 
        direction: "rtl",
        height: '64px' // תופס את כל הגובה של ההורה
      }}>
      <Toolbar>
        {/* Logo on the right */}
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", color: "#0077C2" }}>
          הלוגו שלי
        </Typography>

        {/* Icons on the left */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <Avatar alt="User Avatar" src="/static/images/avatar.jpg" />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
