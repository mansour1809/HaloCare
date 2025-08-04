// App.jsx - revised version:

import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { rtlCache } from './components/common/rtlCache';
import { CacheProvider } from '@emotion/react';
import { ProSidebarProvider } from 'react-pro-sidebar';

// All your imports...
import Navbar from './components/layout/Navbar/Navbar';
import ProSidebar from './components/layout/Sidebar/ProSidebar';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Calendar from './pages/calendar/Calendar';
import EmployeeForm from './pages/Employees/EmployeeForm';
import EmployeesManagement from './pages/Employees/EmployeesManagement';
import KidsManagment from './pages/addKid/KidsManagement';
import { CalendarProvider } from './pages/calendar/CalendarContext';
import HomePage from './pages/HomePage/homePage';
import LoginPage from './components/login/login';
import EventsList from './pages/calendar/EventsList';
import ResetPassword from './components/login/ResetPassword';

// Authentication
import { useAuth, AuthProvider } from './components/login/AuthContext';
import { EmployeesProvider } from './pages/Employees/EmployeesContext';
import TreatmentsList from './pages/Kids/tretments/TreatmentsList';
import {TreatmentProvider} from './pages/Kids/tretments/TreatmentContext';
import KidProfilePage from './pages/kid/KidProfilePage';
import { AttendanceProvider } from './components/context/AttendanceContext';
import AttendanceDashboard from './pages/attendance/AttendanceDashboard';
import SystemSettings from './pages/SystemSetting/SystemSettings';
import KidOnboarding from './pages/addKid/KidOnboarding';
import PublicParentFormPage from './pages/addKid/PublicParentFormPage';
import EmployeeProfile from './pages/Employees/EmployeeProfile';


// Create a theme
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

const DRAWER_WIDTH = 260;
const NAVBAR_HEIGHT = 64;

// Function to check a public page - simple and effective
const isCurrentPathPublic = () => {
  const hash = window.location.hash;
  const publicPaths = [ '/reset-password', '/parent-form'];
  return publicPaths.some(path => hash.includes(path));
};

// Internal component that uses the authentication context
const AppContent = () => {
  const { isAuthenticated } = useAuth();
  
  // Check public page on every render
  const isPublicPath = isCurrentPathPublic();

  const showLayout = isAuthenticated && !isPublicPath;
  
  console.log('Debug:', {
    pathname: location.pathname,
    isPublicPath,
    isAuthenticated,
    showLayout
  });
  

  return (
    <Router>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
{/* Show navbar only if logged in and not on a public page */}{showLayout && <Navbar />}
        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            position: "relative",
            pt: (isAuthenticated && !isPublicPath) ? `${NAVBAR_HEIGHT}px` : 0,
          }}
        >
{/* Show sidebar only if logged in and not on a public page */}          {isAuthenticated && !isPublicPath && <ProSidebar />}

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: isPublicPath ? 0 : 3,
              backgroundColor: isPublicPath ? "#ffffff" : "#f5f5f5",
              ml: (isAuthenticated && !isPublicPath)
                ? `${DRAWER_WIDTH}px !important`
                : "0 !important",
              mr: "0 !important",
              width: (isAuthenticated && !isPublicPath)
                ? `calc(100% - ${DRAWER_WIDTH}px)`
                : "100%",
              minHeight: (isAuthenticated && !isPublicPath)
                ? `calc(100vh - ${NAVBAR_HEIGHT}px)`
                : "100vh",
              overflow: "hidden" ,
            }}
          >
            <Routes>
{/* Public pages */}              <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
              />
              
              <Route
                path="/reset-password"
                element={<ResetPassword />}
              />
              
              <Route
                path="/parent-form/:token"
                element={<PublicParentFormPage />}
              />

{/* Home page */}              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <HomePage />
                  </PrivateRoute>
                }
              />

{/* Child management */}              <Route
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
                    <KidOnboarding  />
                    {/* <PersonalInfoForm/> */}
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

{/* Employee Management */}              <Route
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

{/* Calendar */}              <Route
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

{/* Reports */}              <Route
                path="/reports/attendance"
                element={
                  <PrivateRoute>
                    <AttendanceDashboard/>
                  </PrivateRoute>
                }
              />

              <Route
                path="/employees/profile/:employeeId"
                element={
                  <PrivateRoute>
                      <EmployeeProfile />
                  </PrivateRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </Router>
  );
};

// The main component of the application
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