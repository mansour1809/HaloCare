
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar/Navbar';
import Sidebar from './components/layout/Sidebar/Sidebar';
import Calendar from './pages/calendar/Calendar';
import { Box } from '@mui/material';


function App() {
  // קבוע של רוחב הסייד-בר
  const SIDEBAR_WIDTH = 250;

  return (
    <BrowserRouter>
      {/* קונטיינר ראשי */}
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* נאב-בר עליון */}
        <Navbar />

        {/* קונטיינר לסייד-בר ולתוכן */}
        <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          {/* אזור התוכן - יהיה משמאל לסייד-בר */}
          <Box sx={{ 
            flexGrow: 1, 
            height: '100%', 
            overflow: 'auto',
            p: 2,
            bgcolor: '#f5f5f5'
          }}>
            <Routes>
              <Route path="/" element={<Calendar />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/kids" element={<div>עמוד ניהול ילדים</div>} />
              <Route path="/kids/add" element={<div>עמוד הוספת ילד</div>} />
              <Route path="/employees" element={<div>עמוד ניהול צוות</div>} />
              <Route path="/employees/add" element={<div>עמוד הוספת איש צוות</div>} />
              <Route path="/admin" element={<div>עמוד ניהול</div>} />
              <Route path="/login" element={<div>עמוד התחברות</div>} />
              <Route path="*" element={<div>דף לא נמצא</div>} />
            </Routes>
          </Box>

          {/* סייד-בר בצד ימין */}
          <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}>
            <Sidebar />
          </Box>
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;