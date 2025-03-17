import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/layout/Navbar/Navbar';
import Sidebar from './components/layout/Sidebar/Sidebar';
import Calendar from './pages/calendar/Calendar';
import { Box } from '@mui/material';
import LoginPage from './components/login/login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // מצב התחברות
  const SIDEBAR_WIDTH = 250;

  return (
    <BrowserRouter>
      {!isAuthenticated ? (
        // אם המשתמש לא מחובר, להציג את מסך ההתחברות בלבד
        <LoginPage setIsAuthenticated={setIsAuthenticated} />
      ) : (
        // אם המשתמש מחובר, להציג את הניווט והדפים
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <Navbar />
          <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
            <Box sx={{ flexGrow: 1, height: '100%', overflow: 'auto', p: 2, bgcolor: '#f5f5f5' }}>
              <Routes>
                <Route path="/" element={<Navigate to="/calendar" />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/kids" element={<div>עמוד ניהול ילדים</div>} />
                <Route path="/employees" element={<div>עמוד ניהול צוות</div>} />
                <Route path="/admin" element={<div>עמוד ניהול</div>} />
                <Route path="*" element={<div>דף לא נמצא</div>} />
              </Routes>
            </Box>
            <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}>
              <Sidebar />
            </Box>
          </Box>
        </Box>
      )}
    </BrowserRouter>
  );
}

export default App;
