// src/components/kids/SimpleFlowerProfile.jsx - פרח CSS פשוט לשליטה
import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Button,
  styled,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { baseURL } from '../../components/common/axiosConfig';

// Styled Components
const FlowerContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '500px',
  height: '500px',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const CenterCircle = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: '4px solid white',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  zIndex: 10,
  position: 'relative',
}));

const Petal = styled(Box)(({ theme, angle, petalcolor, isHovered }) => ({
  position: 'absolute',
  width: 140,
  height: 140,
  borderRadius: '50% 10% 50% 10%',
  backgroundColor: petalcolor || theme.palette.primary.main,
  cursor: 'pointer',
  transformOrigin: 'center center',
  transform: `rotate(${angle}deg) translateY(-120px) ${isHovered ? 'scale(1.1)' : 'scale(1)'}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: isHovered 
    ? `0 8px 25px ${petalcolor}60`
    : `0 4px 15px ${petalcolor}30`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    transform: `rotate(${angle}deg) translateY(-120px) scale(1.15)`,
    zIndex: 5,
  }
}));

const PetalLabel = styled(Typography)(({ theme, angle }) => ({
  position: 'absolute',
  transform: `rotate(${-angle}deg)`,
  fontWeight: 600,
  fontSize: '0.9rem',
  color: 'white',
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  textAlign: 'center',
  width: '100px',
  lineHeight: 1.2,
}));



const SimpleFlowerProfile = ({ kid }) => {
  const navigate = useNavigate();
  const [hoveredPetal, setHoveredPetal] = useState(null);
  const [clickedPetal, setClickedPetal] = useState(null);
  
  //  Fetch treatment types from Redux
  const treatmentTypes = useSelector(state => state.treatmentTypes.treatmentTypes);

  // handle Petal Click
  const handlePetalClick = (treatmentType) => {
    setClickedPetal(treatmentType.treatmentTypeId);
    console.log(kid)
    // Ripple effect
    setTimeout(() => {
      navigate(`/kids/${kid.id}/treatments/${treatmentType.treatmentTypeId}`);
    }, 200);
    
    //  Reset the effect
    setTimeout(() => {
      setClickedPetal(null);
    }, 300);
  };

  // calculate Petal Angle
  const calculatePetalAngle = (index, total) => {
    return (360 / total) * index;
  };

  // Function to get a lighter color for hover
  const lightenColor = (color, percent = 20) => {
    if (!color || !color.startsWith('#')) return color;
    
    const num = parseInt(color.slice(1), 16);
    const r = Math.min(255, Math.floor((num >> 16) * (1 + percent / 100)));
    const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) * (1 + percent / 100)));
    const b = Math.min(255, Math.floor((num & 0x0000FF) * (1 + percent / 100)));
    
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  };

  // Function to get a darker color for click (active state)
  const darkenColor = (color, percent = 15) => {
    if (!color || !color.startsWith('#')) return color;
    
    const num = parseInt(color.slice(1), 16);
    const r = Math.max(0, Math.floor((num >> 16) * (1 - percent / 100)));
    const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - percent / 100)));
    const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - percent / 100)));
    
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  };

  if (!treatmentTypes || treatmentTypes.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          לא נמצאו סוגי טיפולים
        </Typography>
      </Box>
    );
  }

  return (
    <FlowerContainer>
      {/* The leaves */}
      {treatmentTypes.map((treatmentType, index) => {
        const angle = calculatePetalAngle(index, treatmentTypes.length);
        const isHovered = hoveredPetal === treatmentType.treatmentTypeId;
        const isClicked = clickedPetal === treatmentType.treatmentTypeId;
        const baseColor = treatmentType.treatmentColor;
        const hoverColor = lightenColor(baseColor, 25);
        const clickColor = darkenColor(baseColor, 5);
        const shadowColor = isHovered ? lightenColor(baseColor, 10) : baseColor;
        
        return (
          <Tooltip placement="top" 
  PopperProps={{
    disablePortal: true,
    modifiers: [
      {
        name: 'flip',
        enabled: false 
      },
      {
        name: 'preventOverflow',
        options: {
          boundary: 'window', 
        },
      },
    ],
  }}
            key={treatmentType.treatmentTypeId}

          >
            <Petal
              angle={angle}
              petalcolor={isClicked ? clickColor : (isHovered ? hoverColor : baseColor)}
              isHovered={isHovered}
              onMouseEnter={() => setHoveredPetal(treatmentType.treatmentTypeId)}
              onMouseLeave={() => setHoveredPetal(null)}
              onClick={() => handlePetalClick(treatmentType)}
              sx={{
                // Adding additional effects with colors
                boxShadow: isClicked
                  ? `0 0 20px ${shadowColor}90, 0 0 40px ${shadowColor}50, inset 0 0 10px rgba(0,0,0,0.2)`
                  : isHovered 
                    ? `0 12px 30px ${shadowColor}70, 0 0 0 3px ${lightenColor(baseColor, 40)}30`
                    : `0 4px 15px ${baseColor}30`,
                border: isHovered ? `2px solid ${lightenColor(baseColor, 50)}` : 'none',
                transform: isClicked 
                  ? `rotate(${angle}deg) translateY(-120px) scale(1.2)`
                  : isHovered
                    ? `rotate(${angle}deg) translateY(-120px) scale(1.1)`
                    : `rotate(${angle}deg) translateY(-120px) scale(1)`,
                '&:active': {
                  backgroundColor: darkenColor(baseColor, 10),
                  transform: `rotate(${angle}deg) translateY(-120px) scale(1.05)`,
                }
              }}
            >
              <PetalLabel 
                angle={angle}
                sx={{
                  color: 'white',
                  textShadow: isHovered || isClicked
                    ? '0 2px 8px rgba(0,0,0,0.6)' 
                    : '0 2px 4px rgba(0,0,0,0.3)',
                  transform: `rotate(${-angle}deg) ${isClicked ? 'scale(1.2)' : isHovered ? 'scale(1.1)' : 'scale(1)'}`,
                  transition: 'all 0.3s ease',
                  fontWeight: isClicked || isHovered ? 700 : 600
                }}
              >
                {treatmentType.treatmentTypeName}
              </PetalLabel>
              
      
            </Petal>
          </Tooltip>
        );
      })}

      {/* Center - child's photo */}
      <CenterCircle
        src={kid?.photoPath ? 
          `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(kid.photoPath)}` : 
          undefined
        }
        sx={{
          bgcolor: kid?.photoPath ? 'transparent' : 'primary.main',
          fontSize: kid?.photoPath ? 0 : '2rem',
          // Center hover effects
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: hoveredPetal 
              ? `0 8px 30px ${treatmentTypes.find(t => t.treatmentTypeId === hoveredPetal)?.treatmentColor || 'rgba(0,0,0,0.15)'}50`
              : '0 8px 30px rgba(0,0,0,0.2)',
          }
        }}
      >
        {!kid?.photo && (
          <>
            {kid?.firstName?.charAt(0)}
            {kid?.lastName?.charAt(0)}
          </>
        )}
      </CenterCircle>

      {/* Additional information in the center */}
      <Box sx={{
        position: 'absolute',
        bottom: -40,
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 10
      }}>
        <Typography variant="body2" color="text.secondary">
          {treatmentTypes.length} תחומי טיפול
        </Typography>
      </Box>
    </FlowerContainer>
  );
};

export default SimpleFlowerProfile;