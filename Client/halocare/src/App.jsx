import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { rtlCache } from './common/rtlCache';
import { CacheProvider } from '@emotion/react';
import { ProSidebarProvider } from 'react-pro-sidebar';

// קומפוננטים
import Navbar from './components/layout/Navbar/Navbar';
import ProSidebar from './components/layout/Sidebar/Sidebar';

// דפים
import Calendar from './pages/calendar/Calendar';
import NewEmployeeForm from './pages/Employees/NewEmployeeForm';
import EmployeesManagement from './pages/Employees/EmployeesManagement';
import KidsManagment from './pages/kids/KidsManagement';
import { CalendarProvider } from './pages/calendar/CalendarContext';
import HomePage from './pages/HomePage/homePage';
import LoginPage from './components/login/login';
import AttendanceTable from './pages/Kids/KidsAttendance';
import EventsList from './pages/calendar/EventsList';
import KidFile from './pages/Kids/KidFile';
import PrivateRoute from './components/PrivateRoute';
import { useState } from 'react';
// import AuthProvider from './components/AuthProvider'; // הוספת AuthProvider כאן
// import Dashboard from './pages/Dashboard';
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
  const [isAuthenticated, setIsAuthenticated] = useState(true
    // localStorage.getItem('token') ? true : false
  );

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <ProSidebarProvider>
          {/* <AuthProvider> הוספת AuthProvider כאן */}
            <CssBaseline />
            <CalendarProvider>
              <Router>
                <Box
                  sx={{ display: "flex", flexDirection: "column", height: "100vh" }}
                >
                  {isAuthenticated && <Navbar />} {/* נציג את ה-Navbar רק למשתמשים מחוברים */}
                  
                  {/* מיכל לתוכן ולסרגל צדדי */}
                  <Box
                    sx={{
                      display: "flex",
                      flexGrow: 1,
                      position: "relative",
                      pt: isAuthenticated ? `${NAVBAR_HEIGHT}px` : 0, // פדינג למעלה רק אם יש נאבבר
                    }}
                  >
                    {/* סרגל צדדי - רק למשתמשים מחוברים */}
                    {isAuthenticated && <ProSidebar />}
                    
                    {/* אזור התוכן הראשי */}
                    <Box
                      component="main"
                      sx={{
                        flexGrow: 1,
                        p: 3,
                        backgroundColor: "#f5f5f5",
                        ml: isAuthenticated ? `${DRAWER_WIDTH}px !important` : '0 !important', // מרווח משמאל רק אם יש סייד בר
                        mr: '0 !important',
                        width: isAuthenticated ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%', // רוחב התוכן
                        minHeight: isAuthenticated ? `calc(100vh - ${NAVBAR_HEIGHT}px)` : '100vh', // גובה מינימלי
                        overflow: "auto",
                      }}
                    >
                      <Routes>
                        {/* דף התחברות - פתוח לכולם */}
                        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
                        
                        {/* כל השאר - רק למחוברים */}
                        <Route path="/" element={
                          <PrivateRoute>
                            <HomePage />
                          </PrivateRoute>
                        } />

                        {/* ניהול ילדים */}
                        <Route path="/kids/list" element={
                          <PrivateRoute>
                            <KidsManagment />
                          </PrivateRoute>
                        } />
                        <Route path="/kids/add" element={
                          <PrivateRoute>
                            <div>kids add</div>
                          </PrivateRoute>
                        } />
                        
                        {/* ניהול צוות */}
                        <Route path="/employees/list" element={
                          <PrivateRoute>
                            <EmployeesManagement />
                          </PrivateRoute>
                        } />
                        <Route path="/employees/add" element={
                          <PrivateRoute>
                            <NewEmployeeForm />
                          </PrivateRoute>
                        } />

                        {/* יומן ופגישות */}
                        <Route path="/calendar/schedule" element={
                          <PrivateRoute>
                            <Calendar />
                          </PrivateRoute>
                        } />
                        <Route path="/calendar/meetings" element={
                          <PrivateRoute>
                            <EventsList />
                          </PrivateRoute>
                        } />

                        {/* משימות */}
                        <Route path="/tasks" element={
                          <PrivateRoute>
                            <LoginPage />
                          </PrivateRoute>
                        } />

                        {/* דוחות */}
                        <Route path="/reports/attendance" element={
                          <PrivateRoute>
                            <AttendanceTable />
                          </PrivateRoute>
                        } />
                        <Route path="/reports/treatments" element={
                          <PrivateRoute>
                            <KidFile />
                          </PrivateRoute>
                        } />
                        
                        {/* שגיאה 404 */}
                        <Route path="*" element={<Navigate to="/login" />} />
                      </Routes>
                    </Box>
                  </Box>
                </Box>
              </Router>
            </CalendarProvider>
          {/* </AuthProvider> */}
        </ProSidebarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;