// src/components/common/DigitalSignature.jsx - עיצוב מתקדם מבוסס על Employee components
import React, { useRef, useState, useEffect } from 'react';
import {
  Box, Button, Paper, Typography, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip
} from '@mui/material';
import {
  Edit as SignIcon,
  Clear as ClearIcon,
  Check as SaveIcon,
  Visibility as ViewIcon,
  AutoAwesome as AutoAwesomeIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled, alpha } from '@mui/material/styles';

// יצירת theme מתקדם עם תמיכה ב-RTL כמו ב-Employee components
const rtlTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    h6: {
      fontWeight: 600,
      fontSize: '1.4rem'
    }
  },
  palette: {
    primary: {
      main: '#4cb5c3',
      light: '#7cd8e5',
      dark: '#2a8a95',
    },
    secondary: {
      main: '#ff7043',
      light: '#ffa270',
      dark: '#c63f17',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#047857',
    },
  },
});

// קונטיינר החתימה המתקדם
const SignatureContainer = styled(Paper)(({ theme, required, hasSignature }) => ({
  padding: theme.spacing(3),
  borderRadius: 20,
  background: hasSignature 
    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.1) 100%)'
    : 'linear-gradient(135deg, rgba(76, 181, 195, 0.05) 0%, rgba(76, 181, 195, 0.1) 100%)',
  border: required && !hasSignature 
    ? '2px solid #ef4444' 
    : hasSignature
      ? '2px solid rgba(16, 185, 129, 0.3)'
      : '2px solid rgba(76, 181, 195, 0.3)',
  boxShadow: hasSignature 
    ? '0 8px 32px rgba(16, 185, 129, 0.2)'
    : '0 8px 32px rgba(76, 181, 195, 0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: hasSignature 
      ? 'linear-gradient(90deg, #10b981, #34d399)'
      : 'linear-gradient(90deg, #4cb5c3, #7cd8e5)',
    borderRadius: '20px 20px 0 0',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: hasSignature 
      ? '0 12px 40px rgba(16, 185, 129, 0.3)'
      : '0 12px 40px rgba(76, 181, 195, 0.3)',
  }
}));

// תמונת החתימה המעוצבת
const SignatureImage = styled('img')(({ theme }) => ({
  maxHeight: 80,
  maxWidth: 250,
  border: '2px solid rgba(255, 255, 255, 0.8)',
  borderRadius: 12,
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  background: 'white',
  padding: '8px',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  }
}));

// כפתור מונפש מתקדם
const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: '12px 24px',
  fontWeight: 600,
  fontSize: '1rem',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  boxShadow: '0 6px 20px rgba(76, 181, 195, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 35px rgba(76, 181, 195, 0.4)',
    background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'all 0.5s ease',
  },
  '&:hover::after': {
    left: '100%',
  }
}));

// אייקון מעוצב עם אנימציות
const StyledIconButton = styled(IconButton)(({ theme, variant = 'primary' }) => ({
  width: 50,
  height: 50,
  borderRadius: '50%',
  background: variant === 'primary' 
    ? 'linear-gradient(135deg, #4cb5c3, #2a8a95)'
    : variant === 'success'
    ? 'linear-gradient(135deg, #10b981, #047857)'
    : 'linear-gradient(135deg, #ff7043, #c63f17)',
  color: 'white',
  boxShadow: `0 6px 20px ${alpha(theme.palette[variant]?.main || '#4cb5c3', 0.4)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: `0 8px 25px ${alpha(theme.palette[variant]?.main || '#4cb5c3', 0.5)}`,
  },
  '&:active': {
    transform: 'scale(0.95)',
  }
}));

// קונטיינר התוכן המרכזי
const ContentContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: 100,
  position: 'relative',
}));

// דיאלוג מעוצב
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 24,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
    overflow: 'visible',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
      borderRadius: '24px 24px 0 0',
    }
  }
}));

// אזור הציור המעוצב
const CanvasContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  border: '3px solid rgba(76, 181, 195, 0.3)',
  borderRadius: 16,
  backgroundColor: 'white',
  textAlign: 'center',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.05)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    background: 'linear-gradient(45deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    borderRadius: 16,
    zIndex: -1,
    opacity: 0.7,
  }
}));

// Canvas מעוצב
const StyledCanvas = styled('canvas')(({ readOnly }) => ({
  border: '2px solid rgba(229, 231, 235, 0.5)',
  borderRadius: 12,
  width: '100%',
  cursor: readOnly ? 'default' : 'crosshair',
  display: 'block',
  touchAction: 'none',
  background: 'white',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  '&:hover': {
    boxShadow: readOnly ? '0 4px 12px rgba(0, 0, 0, 0.05)' : '0 6px 16px rgba(76, 181, 195, 0.2)',
  }
}));

// טקסט מצב החתימה
const SignatureStatus = styled(Box)(({ theme, hasSignature }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  flex: 1,
  padding: theme.spacing(2),
  borderRadius: 12,
  background: hasSignature 
    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))'
    : 'linear-gradient(135deg, rgba(156, 163, 175, 0.1), rgba(156, 163, 175, 0.05))',
  border: `1px solid ${hasSignature ? 'rgba(16, 185, 129, 0.2)' : 'rgba(156, 163, 175, 0.2)'}`,
}));

const DigitalSignature = ({ 
  value, 
  onChange, 
  readOnly = false, 
  required = false,
  label = "חתימה דיגיטלית"
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // טעינת חתימה קיימת
  useEffect(() => {
    if (value && canvasRef.current) {
      loadSignature(value);
    }
  }, [value, dialogOpen]);

  // טעינת חתימה מ-base64
  const loadSignature = (base64Data) => {
    if (!base64Data || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setHasSignature(true);
    };
    
    img.src = base64Data;
  };

  // פונקציה לחישוב המיקום הנכון של העכבר
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;   
    const scaleY = canvas.height / rect.height; 
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // התחלת ציור - מעודכן
  const startDrawing = (e) => {
    if (readOnly) return;
    
    setIsDrawing(true);
    const pos = getMousePos(e);
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    
    // הגדרות ציור
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1f2937';
  };

  // ציור - מעודכן
  const draw = (e) => {
    if (!isDrawing || readOnly) return;
    
    const pos = getMousePos(e);
    const ctx = canvasRef.current.getContext('2d');
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  // תמיכה במגע (טאבלט/מובייל)
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    startDrawing(mouseEvent);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    draw(mouseEvent);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    stopDrawing();
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // הגדרות בסיסיות
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 3;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // אתחול כשהדיאלוג נפתח
  useEffect(() => {
    if (dialogOpen && canvasRef.current) {
      initCanvas();
      if (value) {
        setTimeout(() => loadSignature(value), 100);
      }
    }
  }, [dialogOpen]);

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setHasSignature(true);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // שמירת החתימה
  const saveSignature = () => {
    if (!hasSignature) return;
    
    const canvas = canvasRef.current;
    const base64Data = canvas.toDataURL('image/png');
    onChange && onChange(base64Data);
    setDialogOpen(false);
  };

  const cancelSignature = () => {
    setDialogOpen(false);
    if (value) {
      setTimeout(() => loadSignature(value), 100);
    } else {
      clearSignature();
    }
  };

  return (
    <ThemeProvider theme={rtlTheme}>
      <Box dir="rtl">
        {/* הצגת החתימה */}
        <SignatureContainer 
          elevation={3}
          required={required}
          hasSignature={!!value}
        >
          <ContentContainer>
            {value ? (
              <SignatureStatus hasSignature={true}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    padding: 1,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #047857)',
                    color: 'white',
                    minWidth: 40,
                    minHeight: 40,
                    justifyContent: 'center'
                  }}>
                    <CelebrationIcon />
                  </Box>
                  
                  <SignatureImage 
                    src={value} 
                    alt="חתימה דיגיטלית"
                  />

                  <Box>
                    <Typography variant="h6" sx={{ 
                      color: 'success.main',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <AutoAwesomeIcon fontSize="small" />
                      מסמך חתום בהצלחה!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      החתימה נשמרה במערכת
                    </Typography>
                  </Box>
                </Box>
              </SignatureStatus>
            ) : (
              // אין חתימה
              <SignatureStatus hasSignature={false}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  padding: 1,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                  color: 'white',
                  minWidth: 40,
                  minHeight: 40,
                  justifyContent: 'center'
                }}>
                  <SignIcon />
                </Box>
                <Box>
                  <Typography variant="body1" color="text.secondary" fontWeight={600}>
                    ⏳ טרם נחתם
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    לחץ על כפתור החתימה למילוי
                  </Typography>
                </Box>
              </SignatureStatus>
            )}
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {value && (
                <Tooltip title="צפייה בחתימה" arrow>
                  <StyledIconButton 
                    variant="primary"
                    onClick={() => setDialogOpen(true)}
                  >
                    <ViewIcon />
                  </StyledIconButton>
                </Tooltip>
              )}
              
              {!readOnly && (
                <Tooltip title={value ? "עריכת חתימה" : "חתימה על המסמך"} arrow>
                  <StyledIconButton 
                    variant={value ? "secondary" : "primary"}
                    onClick={() => setDialogOpen(true)}
                  >
                    <SignIcon />
                  </StyledIconButton>
                </Tooltip>
              )}
            </Box>
          </ContentContainer>
        </SignatureContainer>

        {/* דיאלוג החתימה */}
        <StyledDialog 
          open={dialogOpen} 
          onClose={cancelSignature}
          maxWidth="md"
          fullWidth
          TransitionProps={{
            onEntered: () => {
              if (readOnly && value && canvasRef.current) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.onload = () => {
                  // ניקוי תוכן קודם וציור התמונה
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.src = value;
              }
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1), rgba(255, 112, 67, 0.1))',
            borderBottom: '1px solid rgba(76, 181, 195, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            fontSize: '1.3rem',
            fontWeight: 700
          }}>
            <AutoAwesomeIcon color="primary" />
            {readOnly ? '👁️ צפייה בחתימה' : '✍️ חתימה דיגיטלית'}
          </DialogTitle>
          
          <DialogContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              {!readOnly && (
                <Typography variant="body1" color="text.secondary" sx={{
                  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1), rgba(76, 181, 195, 0.05))',
                  padding: 2,
                  borderRadius: 2,
                  border: '1px solid rgba(76, 181, 195, 0.2)'
                }}>
                  ✍️ צייר את החתימה שלך באזור הלבן למטה
                </Typography>
              )}
            </Box>
            
            <CanvasContainer elevation={3}>
              <StyledCanvas
                ref={canvasRef}
                width={600}
                height={200}
                readOnly={readOnly}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            </CanvasContainer>
            
            {!readOnly && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <AnimatedButton
                  startIcon={<ClearIcon />}
                  onClick={clearSignature}
                  variant="outlined"
                  disabled={!hasSignature}
                  sx={{
                    background: 'linear-gradient(45deg, #ff7043 30%, #c63f17 90%)',
                    color: 'white',
                    border: 'none',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #c63f17 30%, #b91c1c 90%)',
                    },
                    '&:disabled': {
                      background: '#e5e7eb',
                      color: '#9ca3af',
                    }
                  }}
                >
                  🗑️ נקה חתימה
                </AnimatedButton>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ 
            p: 3, 
            borderTop: '1px solid rgba(76, 181, 195, 0.1)',
            background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.02), rgba(255, 112, 67, 0.02))'
          }}>
            <AnimatedButton 
              onClick={cancelSignature}
              variant="outlined"
              sx={{
                color: '#6b7280',
                borderColor: '#d1d5db',
                '&:hover': {
                  borderColor: '#9ca3af',
                  background: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              {readOnly ? '✖️ סגור' : '❌ ביטול'}
            </AnimatedButton>
            
            {!readOnly && (
              <AnimatedButton 
                onClick={saveSignature}
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={!hasSignature}
                sx={{
                  background: 'linear-gradient(45deg, #10b981 30%, #047857 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #047857 30%, #065f46 90%)',
                  },
                  '&:disabled': {
                    background: '#e5e7eb',
                    color: '#9ca3af',
                  }
                }}
              >
                💾 שמור חתימה
              </AnimatedButton>
            )}
          </DialogActions>
        </StyledDialog>
      </Box>
    </ThemeProvider>
  );
};

export default DigitalSignature;