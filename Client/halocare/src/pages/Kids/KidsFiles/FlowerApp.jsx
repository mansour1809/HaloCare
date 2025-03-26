@ -1,78 +0,0 @@
import React from 'react';
import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

// עיצוב מותאם אישית עם styled components של Material UI
const FlowerContainer = styled(Paper)(({ theme }) => ({
  width: '400px',
  height: '400px',
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: 'auto',
  backgroundColor: theme.palette.background.default,
}));

const BasicFlower = () => {
  // הצבעים שהוגדרו
  const petalColors = ['#7AC7D7', '#8FD3C3', '#FF9F9F', '#DDE16A', '#F4B183'];
  
  // מיקומים וזוויות עם יותר מרחק כדי למנוע חפיפה
  const petals = [
    { angle: 0, distance: 100, rx: 45, ry: 75, color: petalColors[0], rotateAngle:50 },
    { angle: 72, distance: 100, rx: 45, ry: 75, color: petalColors[1] },
    { angle: 144, distance: 100, rx: 45, ry: 75, color: petalColors[2] },
    { angle: 216, distance: 100, rx: 45, ry: 75, color: petalColors[3] },
    { angle: 288, distance: 100, rx: 45, ry: 75, color: petalColors[4] }
  ];
  
  return (
    <FlowerContainer elevation={3}>
      <Box component="svg" viewBox="0 0 400 400" sx={{ width: '100%', height: '100%' }}>
        {/* מרכז הפרח */}
        <circle 
          cx="200" 
          cy="200" 
          r="30" 
          fill="#FFFFFF" 
          stroke="#555555" 
          strokeWidth="1"
        />
        
        {/* עלי כותרת - כל אחד בצבע וגודל משלו, ללא חפיפה */}
        {petals.map((petal, index) => {
          // חישוב מיקום העלה בהתבסס על הזווית והמרחק
          const radians = (petal.angle * Math.PI) / 180;
          const x = 200 + petal.distance * Math.sin(radians);
          const y = 200 - petal.distance * Math.cos(radians);
          
          return (
            <ellipse
              key={`petal-${index}`}
              cx={x}
              cy={y}
              rx={petal.rx}
              ry={petal.ry}
              fill={petal.color}
              stroke="#555555"
              strokeWidth="1"
              transform={`rotate(${petal.angle}, 200, 200)`}
            />
          );
        })}
      </Box>
    </FlowerContainer>
  );
};

// לשימוש בתוך האפליקציה
const FlowerApp = () => {
  return (
    <Box sx={{ p: 3 }}>
      <BasicFlower />
    </Box>
  );
};

export default FlowerApp;
