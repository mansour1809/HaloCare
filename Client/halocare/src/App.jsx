import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar/Navbar';
import Sidebar from './components/layout/Sidebar/Sidebar';
import Calendar from './pages/calendar/Calendar';
import { Box} from '@mui/material';

function App() {
  // קבועים
  const SIDEBAR_WIDTH = 250;
  const NAVBAR_HEIGHT = 64; // או כל גובה אחר שמתאים לנאב-בר שלך

  return (
    <BrowserRouter>
      {/* קונטיינר ראשי */}
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* נאב-בר עליון - מוחלט כדי שלא יתפוס מקום בזרימה */}
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1100,
          height: `${NAVBAR_HEIGHT}px`
        }}>
          <Navbar />
        </Box>

        {/* קונטיינר לסייד-בר ולתוכן - עם מרווח עליון עבור הנאב-בר */}
        <Box sx={{ 
          display: 'flex', 
          width: '100%',
          height: '100%',
          mt: `${NAVBAR_HEIGHT}px` // מרווח עליון בגובה הנאב-בר
        }}>
          {/* אזור התוכן - משמאל לסייד-בר */}
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

          {/* סייד-בר בצד ימין - עם גובה מלא */}
          <Box sx={{ 
            width: SIDEBAR_WIDTH, 
            flexShrink: 0,
            height: '100%',
            position: 'relative'
          }}>
            <Sidebar />
          </Box>
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;