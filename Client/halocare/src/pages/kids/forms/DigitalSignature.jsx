// src/components/common/DigitalSignature.jsx
import React, { useRef, useState, useEffect } from 'react';
import {
  Box, Button, Paper, Typography, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip
} from '@mui/material';
import {
  Edit as SignIcon,
  Clear as ClearIcon,
  Check as SaveIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

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

  // Loading existing signature
  useEffect(() => {
    if (value && canvasRef.current) {
      loadSignature(value);
    }
  }, [value, dialogOpen]);

  // loadSignature
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

  // getMousePos
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

  // Start drawing - updated
  const startDrawing = (e) => {
    if (readOnly) return;
    
    setIsDrawing(true);
    const pos = getMousePos(e);
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    
    // Drawing settings
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';
  };

  // Drawing - updated
  const draw = (e) => {
    if (!isDrawing || readOnly) return;
    
    const pos = getMousePos(e);
    const ctx = canvasRef.current.getContext('2d');
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  // handleTouchStart
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
    
    // Basic settings
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  
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
    setHasSignature(false);
  };

  // saveSignature
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
    <Box>
      {/* Signature display */}
      <Paper 
        sx={{ 
          p: 2, 
          border: required && !value ? '2px solid red' : '1px solid #ddd',
          borderRadius: 2,
          backgroundColor: value ? 'white' : 'grey.50'
        }}
      >
        {/* <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {label} {required && '*dqdwq'}
        </Typography> */}
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          minHeight: 80
        }}>
          {value ? (
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
               <img 
                src={value} 
                alt="חתימה דיגיטלית"
                style={{ 
                    display: 'block',
                  maxHeight: 60, 
                  maxWidth: 200,
                  border: '1px solid #eee',
                  borderRadius: 4
                }}
              />

              <Typography variant="body2" color="success.main">
                ✓ נחתם
              </Typography>
            </Box>
          ) : (
           
            <Typography variant="body2" color="text.secondary">
              לא נחתם
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {value && (
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
  }}title="צפייה בחתימה">
                <IconButton 
                  size="small" 
                  onClick={() => setDialogOpen(true)}
                  color="primary"
                >
                  <ViewIcon />
                </IconButton>
              </Tooltip>
            )}
            
            {!readOnly && (
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
  }}title={value ? "עריכת חתימה" : "חתימה"}>
                <IconButton 
                  size="small" 
                  onClick={() => setDialogOpen(true)}
                  color="primary"
                >
                  <SignIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Signature Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={cancelSignature}
        maxWidth="sm"
        fullWidth
         TransitionProps={{
    onEntered: () => {
      if (readOnly && value && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          // ClearRect and drawImage
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = value;
      }
    }
  }}
      >
        <DialogTitle>
          {readOnly ? 'צפייה בחתימה' : 'חתימה דיגיטלית'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            {!readOnly && (
              <Typography variant="body2" color="text.secondary">
                צייר את החתימה שלך באזור הלבן למטה
              </Typography>
            )}
          </Box>
          
          
          <Paper 
            sx={{ 
              p: 1, 
              border: '2px solid #ddd',
              borderRadius: 2,
              backgroundColor: 'white',
              textAlign: 'center'
            }}
          >
            <canvas
              ref={canvasRef}
              height={150}
              style={{ 
                border: '1px solid #eee',
                borderRadius: 4,
                width: '100%',
                cursor: readOnly ? 'default' : 'crosshair',
                display: 'block',
                touchAction: 'none'
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </Paper>
          
          {!readOnly && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                startIcon={<ClearIcon />}
                onClick={clearSignature}
                color="secondary"
                disabled={!hasSignature}
              >
                נקה חתימה
              </Button>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={cancelSignature}>
            {readOnly ? 'סגור' : 'ביטול'}
          </Button>
          
          {!readOnly && (
            <Button 
              onClick={saveSignature}
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={!hasSignature}
            >
              שמור חתימה
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DigitalSignature;