import { useNavigate } from "react-router-dom";
import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Box,
    Typography,
    Button,
  } from "@mui/material";
  import {
    ExpandLess,
    ExpandMore,
    Dashboard,
    People,
    CalendarMonth,
    BarChart,
    ExitToApp,
    Edit,
  } from "@mui/icons-material";
import { useState } from "react";


const Sidebar = () => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);

  const handleClick = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const menuItems = [
    { 
      title: "ניהול ילדים", 
      icon: <People />, 
      path: "/kids",
      submenu: [
        { title: "רשימת ילדים", path: "/kids" },
        { title: "הוספת ילד", path: "/kids/add" }
      ]
    },
    { 
      title: "ניהול צוות", 
      icon: <People />, 
      path: "/employees",
      submenu: [
        { title: "רשימת צוות", path: "/employees" },
        { title: "הוספת איש צוות", path: "/employees/add" }
      ]
    },
    { 
      title: "יומן", 
      icon: <CalendarMonth />, 
      path: "/calendar",
      submenu: [
        { title: "לוח שנה", path: "/calendar" }
      ]
    },
    { 
      title: "ניהול", 
      icon: <Edit />, 
      path: "/admin",
      submenu: [] 
    }
  ];

  return (
    <Drawer
      variant="permanent"
      anchor="right"
      sx={{
        width: 250,
        "& .MuiDrawer-paper": {
          width: 250,
          backgroundColor: "#F8FAFC",
        },
      }}
    >
      {/* Clickable Dashboard */}
      <Box sx={{ p: 1 }}>
        <ListItemButton onClick={() => navigate('/')}>
          <ListItemText primary="עמוד הבית" sx={{ textAlign: "right", fontWeight: "bold", color: "#0077C2" }} />
          <ListItemIcon sx={{ minWidth: 36, padding: 1 }}>
            <Dashboard />
          </ListItemIcon>
        </ListItemButton>
      </Box>

      {/* Menu Items */}
      <List>
        {menuItems.map((item) => (
          <div key={item.title}>
            <ListItemButton
              onClick={() => {
                handleClick(item.title);
                if (item.path) navigate(item.path);
              }}
              sx={{
                px: 2,
                p: 1.5,
                display: "flex",
                flexDirection: "row-reverse",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, justifyContent: "flex-end" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} sx={{ textAlign: "right" }} />
              {item.submenu.length > 0 &&
                (openMenu === item.title ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>

            <Collapse in={openMenu === item.title} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.submenu.map((subItem) => (
                  <ListItemButton
                    key={subItem.title}
                    onClick={() => navigate(subItem.path)}
                    sx={{
                      pr: 6,
                      display: "flex",
                      flexDirection: "row-reverse",
                    }}
                  >
                    <ListItemText primary={subItem.title} sx={{ textAlign: "right" }} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </div>
        ))}
      </List>

      {/* Logout Button */}
      <Box sx={{ mt: "auto", p: 2, textAlign: "center" }}>
        <Button
          variant="contained"
          color="inherit"
          fullWidth
          startIcon={<ExitToApp />}
          onClick={() => {
            // לוגיקת התנתקות כאן
            navigate('/login');
          }}
          sx={{
            bgcolor: "#E5E7EB",
            color: "#6B7280",
            "&:hover": { bgcolor: "#D1D5DB" },
            display: "flex",
            flexDirection: "row-reverse",
          }}
        >
          התנתקות
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar