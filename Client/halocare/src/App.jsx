import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// קומפוננטות של הפריימוורק
import Navbar from './components/layout/Navbar/Navbar';
import Sidebar from './components/layout/Sidebar/Sidebar';
import Calendar from './pages/calendar/Calendar';
import { Box } from '@mui/material';
import LoginPage from './components/login/login';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage/homePage';
import NewEmployeeForm from './pages/Employees/Employee';


// קומפוננטות של העמודים
// import Dashboard from './pages/Dashboard';
// import KidsManagement from './pages/KidsManagement';
// import KidDetails from './pages/KidDetails';
 import Calendar from './pages/calendar/Calendar';
// import ClassesManagement from './pages/ClassesManagement';
// import Treatments from './pages/Treatments';
// import TreatmentReports from './pages/TreatmentReports';
// import TSHA from './pages/TSHA';
// import Attendance from './pages/Attendance';
// import UserManagement from './pages/UserManagement';
// import Settings from './pages/Settings';
// import NotFound from './pages/NotFound';

// יצירת ערכת עיצוב מותאמת
let theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#3bafc3', // הצבע העיקרי שראיתי בתמונה
      light: '#65dfee',
      dark: '#008193',
    },
    secondary: {
      main: '#f48fb1',
      light: '#ffc1e3',
      dark: '#bf5f82',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Heebo", "Roboto", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// עדכון הפונטים להיות רספונסיביים
theme = responsiveFontSizes(theme);

// יצירת קאש לתמיכה ב-RTL
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <Router>
          <Box sx={{ display: 'flex', direction: 'rtl' }}>
            <CssBaseline />
            
            {/* Navbar קבוע בחלק העליון */}
            <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
            
            {/* Sidebar */}
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            {/* תוכן המערכת - מסך ראשי */}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                width: { sm: `calc(100% - ${isMobile ? 0 : 240}px)` },
                marginRight: { sm: isMobile ? 0 : '240px' },
                marginTop: '64px', // הזזה מתחת ל-Navbar
                transition: theme.transitions.create(['margin', 'width'], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
              }}
            >
              <Routes>
                <Route path="/" element={<Calendar />} />
                {/* <Route path="/kids" element={<KidsManagement />} />
                <Route path="/kids/:id" element={<KidDetails />} />
                <Route path="/" element={<NewEmployeeForm/>} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/classes" element={<ClassesManagement />} />
                <Route path="/treatments" element={<Treatments />} />
                <Route path="/treatment-reports" element={<TreatmentReports />} />
                <Route path="/tsha" element={<TSHA />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} /> */}
              </Routes>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </CacheProvider>
      ) : (
        // מסך התחברות
        <Routes>
          <Route path="/login" element={<NewEmployeeForm setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
};

export default App;