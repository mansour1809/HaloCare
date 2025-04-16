// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { rtlCache } from './components/common/rtlCache';
import { CacheProvider } from '@emotion/react';
import { ProSidebarProvider } from 'react-pro-sidebar';

// קומפוננטים
import Navbar from './components/layout/Navbar/Navbar';
import ProSidebar from './components/layout/Sidebar/Sidebar';
import PrivateRoute from './components/PrivateRoute';

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
// import Flowerapp from './pages/kids/KidsFiles/FlowerApp';
import ResetPassword from './components/login/ResetPassword';
import tretmentType from './pages/Kids/tretments/TreatmentsList';

// אותנטיקציה
import { useAuth, AuthProvider } from './components/login/AuthContext';
import { EmployeesProvider } from './pages/Employees/EmployeesContext';
import TreatmentsList from './pages/Kids/tretments/TreatmentsList';

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

// רכיב פנימי שמשתמש בקונטקסט האותנטיקציה
const AppContent = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Router>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {isAuthenticated && <Navbar />}

        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            position: "relative",
            pt: isAuthenticated ? `${NAVBAR_HEIGHT}px` : 0,
          }}
        >
          {isAuthenticated && <ProSidebar />}

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              backgroundColor: "#f5f5f5",
              ml: isAuthenticated
                ? `${DRAWER_WIDTH}px !important`
                : "0 !important",
              mr: "0 !important",
              width: isAuthenticated
                ? `calc(100% - ${DRAWER_WIDTH}px)`
                : "100%",
              minHeight: isAuthenticated
                ? `calc(100vh - ${NAVBAR_HEIGHT}px)`
                : "100vh",
              overflow: "auto",
            }}
          >
            <Routes>
              {/* דף התחברות - פתוח לכולם */}
              <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
              />
              {/* <Route path="/reset-password" element={<ResetPasswordPage />} /> */}

              {/* // Add this to your routes */}
              <Route path="/reset-password" element={
                                  // <PrivateRoute>

                <ResetPassword />
                                  // </PrivateRoute>

                } />

              {/* כל השאר - רק למחוברים */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <HomePage />
                  </PrivateRoute>
                }
              />

              {/* ניהול ילדים */}
              <Route
                path="/kids/list"
                element={
                  <PrivateRoute>
                    <KidsManagment />
                  </PrivateRoute>
                }
              />
              <Route
                path="/kids/add"
                element={
                  <PrivateRoute>
                    <div>kids add</div>
                  </PrivateRoute>
                }
              />

              {/* ניהול צוות */}
              <Route
                path="/employees/list"
                element={
                  <PrivateRoute>
                    <EmployeesProvider>
                      <EmployeesManagement />
                    </EmployeesProvider>
                  </PrivateRoute>
                }
              />
              <Route
                path="/employees/add"
                element={
                  <PrivateRoute>
                    <EmployeesProvider>
                      <NewEmployeeForm />
                    </EmployeesProvider>
                  </PrivateRoute>
                }
              />

              {/* יומן ופגישות */}
              <Route
                path="/calendar/schedule"
                element={
                  <PrivateRoute>
                    <CalendarProvider>
                      <Calendar />
                    </CalendarProvider>
                  </PrivateRoute>
                }
              />
              <Route
                path="/calendar/meetings"
                element={
                  <PrivateRoute>
                    <CalendarProvider>
                      <EventsList />
                    </CalendarProvider>
                  </PrivateRoute>
                }
              />

              {/* משימות */}
              <Route
                path="/tasks"
                element={
                  <PrivateRoute>
                    <div>Tasks Page</div>
                  </PrivateRoute>
                }
              />

              {/* דוחות */}
              <Route
                path="/reports/attendance"
                element={
                  <PrivateRoute>
                    <AttendanceTable />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports/treatments"
                element={
                  <PrivateRoute>
                    <TreatmentsList />
                  </PrivateRoute>
                }
              />

              {/* שגיאה 404 */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </Router>
  );
};

// הרכיב הראשי של האפליקציה
function App() {
  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <ProSidebarProvider>
            <CssBaseline />
            {/* <CalendarProvider> */}
              {/* <EmployeesProvider> */}
              <AppContent />
              {/* </EmployeesProvider> */}
            {/* </CalendarProvider> */}
          </ProSidebarProvider>
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;