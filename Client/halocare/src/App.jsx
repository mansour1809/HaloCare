import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Toolbar, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { rtlCache } from './common/rtlCache';
import { CacheProvider } from '@emotion/react';
import { ProSidebarProvider } from 'react-pro-sidebar';

// קומפוננטים
import Navbar from './components/layout/Navbar/Navbar';
import ProSidebar from './components/layout/Sidebar/Sidebar';

// דפים
import Calendar from './pages/calendar/Calendar';
import NewEmployeeForm from './pages/Employees/NewEmployeeForm';
// import Dashboard from './pages/Dashboard';
// import KidsManagement from './pages/KidsManagement';
// import EmployeesManagement from './pages/EmployeesManagement';
// import Tasks from './pages/Tasks';
// import Reports from './pages/Reports';

// יצירת ערכת נושא מותאמת אישית
const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#4fc3f7',
      light: 'rgba(79, 195, 247, 0.1)',
      dark: '#0095c5',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#f5f5f5',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    }
  },
  typography: {
    fontFamily: '"Assistant", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
        },
      },
    },
  },
});

// רוחב הסרגל הצדדי
const DRAWER_WIDTH = 240;
const NAVBAR_HEIGHT = 64;

function App() {
  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <ProSidebarProvider>
          <CssBaseline />
          <Router>
            <Box
              sx={{ display: "flex", flexDirection: "column", height: "100vh" }}
            >
              <Navbar />
              {/* מיכל לתוכן ולסרגל צדדי */}
              <Box
                sx={{
                  display: "flex",
                  flexGrow: 1,
                  position: "relative",
                  pt: `${NAVBAR_HEIGHT}px`, // פדינג למעלה כמו גובה ה-navbar
                }}
              >
                {/* סרגל צדדי */}
                <ProSidebar />
                {/* אזור התוכן הראשי */}
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    p: 3,
                    backgroundColor: "#f5f5f5",
                    ml: `${DRAWER_WIDTH}px !important` , // מרווח משמאל לסרגל הצדדי (זה יהפוך למרווח מימין ב-RTL)
                    mr: '0 !important',
                    width: `calc(100% - ${DRAWER_WIDTH}px)`, // רוחב התוכן
                    minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`, // גובה מינימלי
                    overflow: "auto",
                  }}
                >
                  <Routes>
                    {/* דף הבית - דשבורד */}
                    <Route path="/" element={<Calendar />} />

                    {/* ניהול ילדים <KidsManagement /><KidsManagement />*/}
                    <Route path="/kids/list" element={"kids list"} />
                    <Route path="/kids/add" element={"kids add"} />

                    {/* ניהול צוות <EmployeesManagement /><EmployeesManagement />*/}
                    <Route path="/employees/list" element={"employees list"} />
                    <Route
                      path="/employees/add"
                      element={<NewEmployeeForm />}
                    />

                    {/* יומן */}
                    <Route path="/calendar" element={<Calendar />} />

                    {/* משימות <Tasks />*/}
                    <Route path="/tasks" element={"tasks"} />

                    {/* דוחות <Reports /> <Reports />*/}
                    <Route path="/reports/attendance" element={"attendance"} />
                    <Route path="/reports/treatments" element={"treatments"} />
                  </Routes>
                </Box>
              </Box>
            </Box>
          </Router>
        </ProSidebarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;