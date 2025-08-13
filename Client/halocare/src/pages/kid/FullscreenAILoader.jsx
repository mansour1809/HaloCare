import  { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress, 
  keyframes
} from '@mui/material';
import { 
  ChildCare, 
  Favorite, 
  Star,
  EmojiEvents,
  Cake
} from '@mui/icons-material';

// אנימציות חלקות וקלילות
const gentleBounce = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const fadeInOut = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// לודר עדין וחמוד לילדים
const KidsAILoader = ({ progress }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  
  const messages = [
    'אוסף מידע על הילד... 👶',
    'מנתח התקדמות... 📊', 
    'כותב המלצות... ✍️',
    'מכין דוח יפה... 🎨',
    'כמעט סיימתי... ⭐'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderRadius: 4,
        padding: 4,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        textAlign: 'center',
        minWidth: 300,
        maxWidth: 400
      }}
    >
      {/* אייקון מרכזי חמוד */}
      <Box sx={{ mb: 2, position: 'relative' }}>
        <ChildCare
          sx={{
            fontSize: 80,
            color: '#FF6B6B',
            animation: `${gentleBounce} 2s ease-in-out infinite`
          }}
        />
        
        {/* כוכבים קטנים מסביב */}
        <Star
          sx={{
            position: 'absolute',
            top: 0,
            right: 10,
            fontSize: 20,
            color: '#FFD700',
            animation: `${fadeInOut} 2s ease-in-out infinite`
          }}
        />
        <Favorite
          sx={{
            position: 'absolute',
            top: 10,
            left: 0,
            fontSize: 16,
            color: '#FF69B4',
            animation: `${fadeInOut} 2s ease-in-out infinite 0.5s`
          }}
        />
        <EmojiEvents
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            fontSize: 18,
            color: '#4ECDC4',
            animation: `${fadeInOut} 2s ease-in-out infinite 1s`
          }}
        />
      </Box>

      {/* הודעה משתנה */}
      <Typography
        variant="h6"
        sx={{
          color: '#333',
          mb: 3,
          fontWeight: 'bold',
          minHeight: 32,
          transition: 'all 0.3s ease'
        }}
      >
        {messages[currentMessage]}
      </Typography>

      {/* פס התקדמות חמוד */}
      <Box sx={{ mb: 2 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 12,
            borderRadius: 6,
            backgroundColor: '#F0F0F0',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 50%, #45B7D1 100%)',
              borderRadius: 6,
              transition: 'transform 0.4s ease'
            }
          }}
        />
      </Box>

      {/* אחוז עם אימוג'י */}
      <Typography
        variant="body1"
        sx={{
          color: '#666',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1
        }}
      >
        <Cake 
          sx={{ 
            color: '#FF6B6B',
            animation: progress > 80 ? `${rotate} 2s linear infinite` : 'none'
          }} 
        />
        {Math.round(progress)}% הושלם
        <Cake 
          sx={{ 
            color: '#4ECDC4',
            animation: progress > 80 ? `${rotate} 2s linear infinite reverse` : 'none'
          }} 
        />
      </Typography>

      {/* הודעה מעודדת */}
      {progress > 90 && (
        <Typography
          variant="body2"
          sx={{
            color: '#4CAF50',
            mt: 2,
            fontWeight: 'bold',
            animation: `${fadeInOut} 1s ease-in-out infinite`
          }}
        >
          🎉 כמעט מוכן! 🎉
        </Typography>
      )}
    </Box>
  );
};

// קומפוננטה ראשית פשוטה
const FullscreenAILoader = ({ open, progress = 0 }) => {
  if (!open) return null;

  return <KidsAILoader progress={progress} />;
};

export default FullscreenAILoader;

