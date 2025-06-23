
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sidebar, 
  Menu, 
  MenuItem, 
  SubMenu,
  menuClasses,
} from 'react-pro-sidebar';
import { Box, Typography, Button, Divider, Chip } from '@mui/material';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';

// אייקונים מינימליסטיים ונקיים
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import EventIcon from '@mui/icons-material/Event';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EditNoteIcon from '@mui/icons-material/EditNote';

import { useAuth } from '../../login/AuthContext.jsx';

// יצירת theme מקצועי
const sidebarTheme = createTheme({
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

// רוחב הסרגל הצדדי
const DRAWER_WIDTH = 240;

// כפתור התנתקות מעוצב אבל קומפקטי יותר
const LogoutButton = styled(Button)(({ theme }) => ({
  width: '85%',
  margin: '8px auto',
  borderRadius: 12,
  padding: '8px 16px',
  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  color: '#dc2626',
  fontWeight: 600,
  fontSize: '0.85rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
    borderColor: '#dc2626',
    transform: 'translateY(-1px)',
  }
}));

// כותרת קטגוריה קומפקטית יותר
const CategoryHeader = styled(Box)(({ theme }) => ({
  padding: '8px 16px 4px 16px',
  marginTop: '8px',
  marginBottom: '2px',
  borderBottom: '1px solid rgba(76, 181, 195, 0.1)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: '-1px',
    right: '16px',
    width: '20px',
    height: '1px',
    background: '#4cb5c3',
  }
}));

// Styled SubMenu שיכפה את הסגנונות
const StyledSubMenu = styled(SubMenu)(({ theme }) => ({
  margin: '1px 6px !important',
  borderRadius: '8px !important',
  
  '& .ps-submenu-expand-icon': {
    color: '#4cb5c3 !important',
  },
  
  '& .ps-menu-button': {
    padding: '8px 12px !important',
    borderRadius: '8px !important',
    backgroundColor: 'rgba(76, 181, 195, 0.05) !important',
    border: '1px solid rgba(76, 181, 195, 0.1) !important',
    fontWeight: '700 !important',
    fontSize: '0.9rem !important',
    color: '#2a8a95 !important',
    
    '&:hover': {
      backgroundColor: 'rgba(76, 181, 195, 0.1) !important',
      transform: 'translateX(1px) !important',
    }
  },
  
  '& .ps-menu-icon': {
    color: '#4cb5c3 !important',
    fontSize: '1.1rem !important',
    marginLeft: '6px !important',
  }
}));

const ProSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // עיצוב קומפקטי יותר לפריטי התפריט
  const menuItemStyles = {
    root: {
      fontSize: '0.85rem',
      fontWeight: 500,
      margin: '1px 6px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
    },
    icon: {
      color: '#64748b',
      fontSize: '1.1rem',
      marginLeft: '6px',
    },
    button: {
      padding: '8px 12px',
      borderRadius: '8px',
      '&:hover': {
        backgroundColor: 'rgba(76, 181, 195, 0.08)',
        color: '#2a8a95',
        transform: 'translateX(2px)',
      },
    },
    label: {
      fontWeight: 600,
      fontSize: '0.85rem',
    },
  };
  
  // עיצוב פריט פעיל
  const getActiveStyle = (path) => {
    const isActive = location.pathname === path || location.pathname.startsWith(path);
    return isActive ? {
      backgroundColor: 'rgba(76, 181, 195, 0.15)',
      color: '#2a8a95',
      fontWeight: 700,
      borderLeft: '3px solid #4cb5c3',
      transform: 'translateX(2px)',
    } : {};
  };
  
  // כותרת קטגוריה קומפקטית
  const CategoryLabel = ({ children, emoji }) => (
    <CategoryHeader>
      <Typography
        variant="body2"
        sx={{
          color: '#4cb5c3',
          fontWeight: 700,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}
      >
        <span style={{ fontSize: '0.9rem' }}>{emoji}</span>
        {children}
      </Typography>
    </CategoryHeader>
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <ThemeProvider theme={sidebarTheme}>
      <Sidebar
        rtl
        width={`${DRAWER_WIDTH}px`}
        style={{
          height: "calc(100% - 64px)",
          position: "fixed",
          top: 64,
          right: 0,
          border: "none",
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
        rootStyles={{
          backgroundColor: "transparent",
          borderLeft: "1px solid rgba(76, 181, 195, 0.1)",
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '2px',
            height: '100%',
            background: 'linear-gradient(180deg, #4cb5c3, #ff7043, #10b981)',
          }
        }}
      >
        <Box sx={{ padding: "8px 0", height: '100%', display: 'flex', flexDirection: 'column' }}>
          
          {/* תפריט ראשי */}
          <Menu menuItemStyles={menuItemStyles}>
            <MenuItem
              icon={<DashboardIcon />}
              onClick={() => navigate("/")}
              style={getActiveStyle("/")}
            >
              דף הבית
            </MenuItem>

            <CategoryLabel emoji="👶">ילדים</CategoryLabel>

            <StyledSubMenu
              label="ניהול ילדים"
              icon={<ChildCareIcon />}
            >
              <MenuItem
                icon={<GroupIcon />}
                onClick={() => navigate("/kids/list")}
                style={getActiveStyle("/kids/list")}
              >
                רשימת ילדים
              </MenuItem>
              <MenuItem
                icon={<PersonAddIcon />}
                onClick={() => navigate("/kids/onboarding/new")}
                style={getActiveStyle("/kids/onboarding/new")}
              >
                הוספת ילד
              </MenuItem>
            </StyledSubMenu>

            <CategoryLabel emoji="👥">צוות</CategoryLabel>

            <StyledSubMenu 
              label="ניהול צוות" 
              icon={<PeopleAltIcon />}
            >
              <MenuItem
                icon={<GroupIcon />}
                onClick={() => navigate("/employees/list")}
                style={getActiveStyle("/employees/list")}
              >
                רשימת צוות
              </MenuItem>
              <MenuItem
                icon={<PersonAddIcon />}
                onClick={() => navigate("/employees/add")}
                style={getActiveStyle("/employees/add")}
              >
                הוספת צוות
              </MenuItem>
            </StyledSubMenu>

            <CategoryLabel emoji="📅">יומן</CategoryLabel>

            <StyledSubMenu 
              label="לוח זמנים" 
              icon={<CalendarMonthIcon />}
            >
              <MenuItem
                icon={<EventIcon />}
                onClick={() => navigate("/calendar/schedule")}
                style={getActiveStyle("/calendar/schedule")}
              >
                לוח שנה
              </MenuItem>
              <MenuItem
                icon={<MeetingRoomIcon />}
                onClick={() => navigate("/calendar/meetings")}
                style={getActiveStyle("/calendar/meetings")}
              >
                פגישות
              </MenuItem>
            </StyledSubMenu>

            <CategoryLabel emoji="⚙️">מערכת</CategoryLabel>

            <MenuItem
              icon={<SettingsIcon />}
              onClick={() => navigate("/settings")}
              style={getActiveStyle("/settings")}
            >
              הגדרות
            </MenuItem>

            <StyledSubMenu 
              label="דוחות" 
              icon={<AssessmentIcon />}
            >
              <MenuItem
                icon={<AutoStoriesIcon />}
                onClick={() => navigate("/reports/attendance")}
                style={getActiveStyle("/reports/attendance")}
              >
                נוכחות
              </MenuItem>
              <MenuItem
                icon={<EditNoteIcon />}
                onClick={() => navigate("/reports/treatments")}
                style={getActiveStyle("/reports/treatments")}
              >
                טיפולים
              </MenuItem>
            </StyledSubMenu>
          </Menu>

          {/* מרווח אוטומטי */}
          <Box sx={{ flex: 1 }} />

          {/* קטע תחתון קומפקטי */}
          <Box sx={{ px: 1, pb: 1 }}>
            <Divider sx={{ mb: 1, borderColor: 'rgba(76, 181, 195, 0.2)' }} />
            
            {/* כפתור התנתקות */}
            <LogoutButton
              onClick={handleLogout}
              startIcon={<LogoutIcon sx={{ fontSize: '1rem' }} />}
              fullWidth
            >
              התנתקות
            </LogoutButton>
          </Box>
        </Box>
      </Sidebar>
    </ThemeProvider>
  );
};

export default ProSidebar;
  