// App.jsx
import { HashRouter   as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import EmployeeForm from './pages/Employees/EmployeeForm';
import EmployeesManagement from './pages/Employees/EmployeesManagement';
// import KidsManagment from './pages/kids/KidsManagement';
import KidsManagment from './pages/addKid/KidsManagement';
import { CalendarProvider } from './pages/calendar/CalendarContext';
import HomePage from './pages/HomePage/homePage';
import LoginPage from './components/login/login';
// import AttendanceTable from './pages/Kids/KidsAttendance';
import EventsList from './pages/calendar/EventsList';
import ResetPassword from './components/login/ResetPassword';

// אותנטיקציה
import { useAuth, AuthProvider } from './components/login/AuthContext';
import { EmployeesProvider } from './pages/Employees/EmployeesContext';
import TreatmentsList from './pages/Kids/tretments/TreatmentsList';
import {TreatmentProvider} from './pages/Kids/tretments/TreatmentContext';
import KidProfilePage from './pages/kids/KidProfilePage';
import { AttendanceProvider } from './components/context/AttendanceContext';
import AttendanceDashboard from './pages/attendance/AttendanceDashboard';
import Profile from './pages/Employees/EmployeeProfile';
import SystemSettings from './pages/SystemSetting/SystemSettings';
// import KidRegistrationProcess from './pages/kids/KidRegistrationProcess';
// import KidProfile from './pages/addKid/KidProfile';
import { DynamicForm } from '@mui/icons-material';
// import KidOnboarding from './pages/kids/KidOnboarding';
import KidOnboarding from './pages/addKid/KidOnboarding';
import PublicParentFormPage from './pages/addKid/PublicParentFormPage';

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
              {/* login page*/}
              <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
              />
                <Route
                path="/parent-form/:token"
                element={
                   <PublicParentFormPage />
                }
              />
              <Route
                path="/reset-password"
                element={
                  // <PrivateRoute>

                  <ResetPassword />
                  // </PrivateRoute>
                }
              />

              {/* homepage*/}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <HomePage />
                  </PrivateRoute>
                }
              />

              {/* kids managment*/}
              <Route
                path="/kids/list"
                element={
                  <PrivateRoute>
                    <KidsManagment />
                  </PrivateRoute>
                }
              />
              <Route
                path="/kids/:kidId"
                element={
                  <PrivateRoute>
                    <KidProfilePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/kids/:kidId/treatments/:treatmentType"
                element={
                  <PrivateRoute>
                      <TreatmentsList />
                  </PrivateRoute>
                }
              />

              <Route
                path="/kids/onboarding/new"
                element={
                  <PrivateRoute>
                    <KidOnboarding />
                  </PrivateRoute>
                }
              />
              <Route
                path="/kids/onboarding/:kidId"
                element={
                  <PrivateRoute>
                    <KidOnboarding />
                  </PrivateRoute>
                }
              />

              <Route
                path="/kid-profile/:id"
                element={
                  <PrivateRoute>
                    {/* <KidProfile /> */}
                  </PrivateRoute>
                }
              />
              <Route
                path="/forms/:formId/:kidId?"
                element={
                  <PrivateRoute>
                    <DynamicForm />
                  </PrivateRoute>
                }
              />
              





              {/* employees managment*/}
              <Route
                path="/employees/list"
                element={
                  <PrivateRoute>
                      <EmployeesManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/employees/add"
                element={
                  <PrivateRoute>
                      <EmployeeForm />
                  </PrivateRoute>
                }
              />

              {/* calendar*/}
              <Route
                path="/calendar/schedule"
                element={
                  <PrivateRoute>
                      <Calendar />
                  </PrivateRoute>
                }
              />
              <Route
                path="/calendar/meetings"
                element={
                  <PrivateRoute>
                      <EventsList />
                  </PrivateRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <SystemSettings />
                  </PrivateRoute>
                }
              />

              {/* reports*/}
              <Route
                path="/reports/attendance"
                element={
                  <PrivateRoute>
                    {/* <AttendanceTable /> */}
                    <AttendanceDashboard/>
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports/treatments"
                element={
                  <PrivateRoute>
                      {/* <TreatmentsList /> */}
                      {/* <KidProfile/> */}
                  </PrivateRoute>
                }
              />
            
              <Route
                path="/kids/intake/:kidId"
                element={
                  <PrivateRoute>
                      {/* <KidRegistrationProcess /> */}
                  </PrivateRoute>
                }
              />

 <Route
                path="/profile"
                element={
                  <PrivateRoute>
                      <Profile />
                  </PrivateRoute>
                }
              />
              {/* error 404*/}
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
            <CalendarProvider>
              <TreatmentProvider>
                <AttendanceProvider>
                  <EmployeesProvider>
                    <AppContent />
                  </EmployeesProvider>
                </AttendanceProvider>
              </TreatmentProvider>
            </CalendarProvider>
          </ProSidebarProvider>
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;