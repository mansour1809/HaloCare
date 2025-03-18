import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar/Navbar';
import Sidebar from './components/layout/Sidebar/Sidebar';
import Calendar from './pages/calendar/Calendar';
import { Box } from '@mui/material';
import LoginPage from './components/login/login';
import { useState, useEffect } from 'react';

function App() {
  // קבועים
  const SIDEBAR_WIDTH = 250;
  const NAVBAR_HEIGHT = 64;

  // מצב האימות - זמני
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // בדיקת מצב האימות בטעינה ראשונית - זמני
  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // יציאה מהמערכת - זמני
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        // מבנה המערכת כשהמשתמש מחובר
        <Box >
          {/* סייד-בר בצד ימין - קבוע */}
          <Box sx={{ 
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            // position: 'fixed',
            // top: 0,
            // right: 0,
            // bottom: 0,
            zIndex: 1300,
            bgcolor: '#F8FAFC',
            boxShadow: '0px 0px 10px rgba(0,0,0,0.1)'
          }}>
            <Sidebar onLogout={handleLogout} />
          </Box>

          {/* מכל לנאב-בר והתוכן - עם מרווח מימין */}
          <Box sx={{ 
            marginRight: SIDEBAR_WIDTH, 
            width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',  
            minHeight: '100vh',
          }}>
            {/* נאב-בר עליון - קבוע */}
            <Box sx={{ 
              position: 'sticky',
              top: 0,
              zIndex: 1200,
              height: NAVBAR_HEIGHT,
              bgcolor: '#f5f5f5',
              boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Navbar onLogout={handleLogout} />
            </Box>

            {/* אזור התוכן - עם גלילה עצמאית */}
            <Box sx={{ 
              flexGrow: 1,
              p: 2,
              bgcolor: '#f5f5f5',
              overflow: 'auto'
            }}>
              <Routes>
                <Route path="/" element={<homePage/>} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/kids" element={<div>עמוד ניהול ילדים</div>} />
                <Route path="/kids/add" element={<div>עמוד הוספת ילד</div>} />
                <Route path="/employees" element={<div>עמוד ניהול צוות</div>} />
                <Route path="/employees/add" element={<div>עמוד הוספת איש צוות</div>} />
                <Route path="/admin" element={<div>עמוד ניהול</div>} />
                <Route path="*" element={<div>דף לא נמצא</div>} />
              </Routes>
            </Box>
          </Box>
        </Box>
      ) : (
        // מסך התחברות
        <Routes>
          <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;