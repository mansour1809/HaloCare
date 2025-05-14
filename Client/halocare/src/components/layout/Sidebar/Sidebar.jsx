import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sidebar, 
  Menu, 
  MenuItem, 
  SubMenu,
  menuClasses,

} from 'react-pro-sidebar';
import { Box, Typography, Button } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import LogoutIcon from '@mui/icons-material/Logout';
// אייקונים
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import EditNoteIcon from '@mui/icons-material/EditNote';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { useAuth } from '../../login/AuthContext.jsx';

// רוחב הסרגל הצדדי
const DRAWER_WIDTH = 240;


const ProSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // עיצוב לפריטי התפריט
  const menuItemStyles = {
    root: {
      fontSize: '0.9rem',
      fontWeight: 400,
    },
    icon: {
      color: '#607489',
      [`&.${menuClasses.disabled}`]: {
        color: '#9fb6cf',
      },
    },
    button: {
      [`&.${menuClasses.disabled}`]: {
        color: '#9fb6cf',
      },
      '&:hover': {
        backgroundColor: 'rgba(79, 195, 247, 0.08)',
        color: '#4fc3f7',
      },
    },
    label: ({ open }) => ({
      fontWeight: open ? 600 : undefined,
    }),
  };
  
  // עיצוב פריט פעיל
  const activeMenuItemStyles = {
    backgroundColor: 'rgba(79, 195, 247, 0.08)',
    color: '#4fc3f7',
    fontWeight: 600,
  };
  
  // כותרת קטגוריה
  const CategoryLabel = ({ children }) => (
    <Box
      sx={{
        padding: '0 24px',
        marginTop: '16px',
        marginBottom: '8px',
      }}
    >
      <Typography
        variant="body2"
        fontWeight={600}
        style={{
          opacity: 0.7,
          letterSpacing: '0.5px',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
        }}
      >
        {children}
      </Typography>
    </Box>
  );

  
  const handleLogout = () => {
    // מבצע התנתקות
    logout();
    
    // מנווט לדף התחברות
    navigate('/login');
  };
  
  return (
    <Sidebar
      rtl
      width={`${DRAWER_WIDTH}px`}
      style={{
        height: "calc(100% - 64px)",
        position: "fixed",
        top: 64, // לאחר ה-navbar
        right: 0,
        // zoom: 0.7,
        border: "none",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
      }}
      rootStyles={{
        backgroundColor: "white",
        borderLeft: "none",
      }}
    >
      <Box sx={{ marginTop: "16px" }}>
        <Menu menuItemStyles={menuItemStyles}>
          <MenuItem
            icon={<DashboardIcon />}
            onClick={() => navigate("/")}
            style={location.pathname === "/" ? activeMenuItemStyles : {}}
          >
            דף הבית
          </MenuItem>

          <CategoryLabel>ניהול ילדים</CategoryLabel>

          <SubMenu
            label="ניהול ילדים"
            icon={<ChildCareIcon />}
            defaultOpen={true}
          >
            <MenuItem
              icon={<GroupIcon />}
              onClick={() => navigate("/kids/list")}
              style={
                location.pathname === "/kids/list" ? activeMenuItemStyles : {}
              }
            >
              רשימת ילדים
            </MenuItem>
            <MenuItem
              icon={<PersonAddIcon />}
              onClick={() => navigate("/kids/add")}
              style={
                location.pathname === "/kids/add" ? activeMenuItemStyles : {}
              }
            >
              הוספת ילד
            </MenuItem>
          </SubMenu>

          <CategoryLabel>ניהול צוות</CategoryLabel>

          <SubMenu label="ניהול צוות" icon={<PeopleAltIcon />}>
            <MenuItem
              icon={<GroupIcon />}
              onClick={() => navigate("/employees/list")}
              style={
                location.pathname === "/employees/list"
                  ? activeMenuItemStyles
                  : {}
              }
            >
              רשימת אנשי צוות
            </MenuItem>
            <MenuItem
              icon={<PersonAddIcon />}
              onClick={() => navigate("/employees/add")}
              style={
                location.pathname === "/employees/add"
                  ? activeMenuItemStyles
                  : {}
              }
            >
              הוספת איש צוות
            </MenuItem>
          </SubMenu>

          <CategoryLabel>אחר</CategoryLabel>

          <SubMenu label="יומן" icon={<CalendarMonthIcon />}>
            <MenuItem
              icon={<EventIcon />}
              onClick={() => navigate("/calendar/schedule")}
              style={
                location.pathname === "/calendar/schedule"
                  ? activeMenuItemStyles
                  : {}
              }
            >
              לוח שנה
            </MenuItem>
            <MenuItem
              icon={<MeetingRoomIcon />}
              onClick={() => navigate("/calendar/meetings")}
              style={
                location.pathname === "/calendar/meetings"
                  ? activeMenuItemStyles
                  : {}
              }
            >
              לוח פגישות
            </MenuItem>
          </SubMenu>

          <MenuItem
            icon={<FormatListBulletedIcon />}
            onClick={() => navigate("/settings")}
            style={location.pathname === "/settings" ? activeMenuItemStyles : {}}
          >
            הגדרות מערכת
          </MenuItem>

          <SubMenu label="דוחות" icon={<AssessmentIcon />}>
            <MenuItem
              icon={<AutoStoriesIcon />}
              onClick={() => navigate("/reports/attendance")}
              style={
                location.pathname === "/reports/attendance"
                  ? activeMenuItemStyles
                  : {}
              }
            >
              דוחות נוכחות
            </MenuItem>
            <MenuItem
              icon={<EditNoteIcon />}
              onClick={() => navigate("/reports/treatments")}
              style={
                location.pathname === "/reports/treatments"
                  ? activeMenuItemStyles
                  : {}
              }
            >
              דוחות טיפולים
            </MenuItem>
          </SubMenu>
          <Button 
        onClick={handleLogout}
        variant="outlined"
        startIcon={<LogoutIcon />}
        sx={{ mt: 2 }}
      >
        התנתקות
      </Button>        
      </Menu>
      </Box>
    </Sidebar>
  );
};

export default ProSidebar;