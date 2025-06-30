// src/pages/LoginPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Box, 
  InputAdornment, 
  IconButton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useAuth } from './AuthContext';

// Floating Element
const FloatingElement = ({ children, delay = 0, duration = 4, top, left, zIndex = 1 }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: top,
        left: left,
        zIndex: zIndex,
        animation: `float ${duration}s ease-in-out ${delay}s infinite`,
        '@keyframes float': {
          '0%, 100%': { 
            transform: 'translateY(0px) rotate(0deg)',
            opacity: 0.7
          },
          '50%': { 
            transform: 'translateY(-20px) rotate(5deg)',
            opacity: 1
          }
        }
      }}
    >
      {children}
    </Box>
  );
};

// Rainbow Text
const RainbowText = ({ children, variant = "h4", sx = {}, ...props }) => (
  <Typography
    variant={variant}
    {...props}
    sx={{
      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3)',
      backgroundSize: '400% 400%',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: 'rainbow 3s ease infinite',
      '@keyframes rainbow': {
        '0%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
        '100%': { backgroundPosition: '0% 50%' }
      },
      fontWeight: 'bold',
      ...sx
    }}
  >
    {children}
  </Typography>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const { 
    login, 
    handleRequestPasswordReset, 
    showForgotPassword, 
    setShowForgotPassword, 
    message, 
    isSubmitting,
    setEmail: setAuthEmail
  } = useAuth();
  
  const passwordRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // נתוני האלמנטים הרחפים - מיקום קבוע לכל אחד
  const floatingItems = [
    { emoji: '🎨', top: '10%', left: '5%', delay: 0, duration: 6 },
    { emoji: '📚', top: '15%', left: '85%', delay: 0.5, duration: 5.5 },
    { emoji: '🖍️', top: '25%', left: '10%', delay: 1, duration: 6.5 },
    { emoji: '✏️', top: '35%', left: '90%', delay: 1.5, duration: 5 },
    { emoji: '🎒', top: '45%', left: '8%', delay: 2, duration: 6.2 },
    { emoji: '🧸', top: '55%', left: '92%', delay: 0.3, duration: 5.8 },
    { emoji: '🌈', top: '65%', left: '12%', delay: 0.8, duration: 6.3 },
    { emoji: '⭐', top: '75%', left: '88%', delay: 1.3, duration: 5.3 },
    { emoji: '🎈', top: '80%', left: '6%', delay: 1.8, duration: 6.8 },
    { emoji: '🦋', top: '20%', left: '75%', delay: 2.3, duration: 5.5 }
  ];

  const clouds = [
    { top: '5%', left: '20%', delay: 0, duration: 8 },
    { top: '12%', left: '60%', delay: 1, duration: 7.5 },
    { top: '22%', left: '80%', delay: 2, duration: 8.5 },
    { top: '40%', left: '15%', delay: 0.5, duration: 7.8 },
    { top: '68%', left: '70%', delay: 1.5, duration: 8.2 },
    { top: '85%', left: '40%', delay: 2.5, duration: 7.3 }
  ];

  useEffect(() => {
    localStorage.clear();
    
    const hash = window.location.hash; 
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    const emailParam = params.get('email');

    if (emailParam) {
      setEmail(emailParam);
      passwordRef.current?.focus();
    }

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    if (!email || !password) {
      setError('יש להזין אימייל וסיסמה');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
    } catch (err) {
      setError('התחברות נכשלה, אנא נסה שוב');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setAuthEmail(email);
    setShowForgotPassword(true);
  };

  return (
    <Box
      sx={{
        minHeight: "130vh",
        maxHeight:'200vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        direction: "rtl",
        position: 'relative',
        overflow: 'hidden',
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      }}
    >
      {/* background*/}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        {/* clouds */}
        {clouds.map((cloud, index) => (
          <FloatingElement
            key={`cloud-${index}`}
            top={cloud.top}
            left={cloud.left}
            delay={cloud.delay}
            duration={cloud.duration}
          >
            <Box
              sx={{
                fontSize: { xs: '40px', md: '60px' },
                opacity: 0.8,
                filter: 'drop-shadow(0 4px 8px rgba(255,255,255,0.3))'
              }}
            >
              ☁️
            </Box>
          </FloatingElement>
        ))}

        {/* floating items */}
        {floatingItems.map((item, index) => (
          <FloatingElement
            key={`item-${index}`}
            top={item.top}
            left={item.left}
            delay={item.delay}
            duration={item.duration}
          >
            <Box
              sx={{
                fontSize: { xs: '25px', md: '35px' },
                opacity: 0.7,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }}
            >
              {item.emoji}
            </Box>
          </FloatingElement>
        ))}

        {/* interactiv mouse */}
        <Box
          sx={{
            position: 'absolute',
            width: '20px',
            height: '20px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            transform: `translate(${mousePosition.x - 10}px, ${mousePosition.y - 10}px)`,
            transition: 'transform 0.1s ease-out',
            zIndex: 10
          }}
        />
      </Box>

      {/* Main content */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "50px",
          width: "65%",
          flexDirection: { xs: "column", md: "row" },
          zIndex: 5,
          position: 'relative'
        }}
      >
        {/* Logo*/}
        <Box
          sx={{
            textAlign: "center",
            padding: "20px",
            animation: 'logoFloat 6s ease-in-out infinite',
            '@keyframes logoFloat': {
              '0%, 100%': { transform: 'translateY(0px) scale(1)' },
              '50%': { transform: 'translateY(-15px) scale(1.05)' }
            }
          }}
        >
          <Box
            sx={{
              position: 'relative',
              display: 'inline-block',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-20px',
                left: '-20px',
                right: '-20px',
                bottom: '-20px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
                  '50%': { transform: 'scale(1.1)', opacity: 0.3 }
                }
              }
            }}
          >
            <img
              src={"/logo.png"}
              alt="Halo Care Logo"
              style={{
                height: "250px",

                // borderRadius: "50%",
                // border: '5px solid rgba(255,255,255,0.5)',
                // boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease',
                position: 'relative',
                zIndex: 2
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.2) rotate(5deg) ';
                // e.target.style.boxShadow = '0 30px 60px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1) rotate(0deg)';
                // e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
              }}
            />
          </Box>
        </Box>

        {/* Connection form */}
        <Paper
          elevation={0}
          sx={{
            padding: "40px",
            borderRadius: "25px",
            textAlign: "center",
            width: { xs: "90%", sm: "100%" },
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255,255,255,0.3)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden',
            animation: 'formFloat 8s ease-in-out infinite',
            '@keyframes formFloat': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-10px)' }
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              animation: 'shine 3s ease-in-out infinite',
              '@keyframes shine': {
                '0%': { left: '-100%' },
                '100%': { left: '100%' }
              }
            }
          }}
        >
          {/* Main headline*/}
          <Box sx={{ mb: 4, position: 'relative' }}>
            <RainbowText variant="h4" gutterBottom>
               ברוכים הבאים 
            </RainbowText>
            <Typography
              variant="h6"
              sx={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                animation: 'bounce 2s ease infinite',
                '@keyframes bounce': {
                  '0%, 100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(-5px)' }
                }
              }}
            >
              למערכת גן הילדים שלנו 
            </Typography>
          </Box>

          {/* error */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                borderRadius: '15px',
                animation: 'shake 0.5s ease-in-out',
                '@keyframes shake': {
                  '0%, 100%': { transform: 'translateX(0)' },
                  '25%': { transform: 'translateX(-5px)' },
                  '75%': { transform: 'translateX(5px)' }
                }
              }}
            >
              {error}
            </Alert>
          )}

          {/* Email */}
          <TextField
            fullWidth
            label="אימייל"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '15px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255,255,255,1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 15px 30px rgba(102, 126, 234, 0.3)'
                }
              },
              '& .MuiInputLabel-root': {
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ paddingRight: "14px" }}>
                  <Email 
                    sx={{ 
                      color: '#667eea',
                      animation: 'iconPulse 2s ease infinite',
                      '@keyframes iconPulse': {
                        '0%, 100%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.1)' }
                      }
                    }} 
                  />
                </InputAdornment>
              ),
            }}
          />

          {/* Password */}
          <TextField
            fullWidth
            label="סיסמה"
            variant="outlined"
            margin="normal"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            inputRef={passwordRef}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '15px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255,255,255,1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 15px 30px rgba(118, 75, 162, 0.3)'
                }
              },
              '& .MuiInputLabel-root': {
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock 
                    sx={{ 
                      color: '#764ba2',
                      animation: 'iconPulse 2s ease infinite 0.5s'
                    }} 
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        color: '#667eea'
                      }
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleLogin();
              }
            }}
          />

          {/* forgot my password link */}
          <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 3, mt: 1 }}>
            <Typography
              variant="body2"
              sx={{ 
                cursor: "pointer",
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }
              }}
              onClick={handleForgotPasswordClick}
            >
              🤔 שכחת סיסמה?
            </Typography>
          </Box>

          {/* connection button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleLogin}
            disabled={loading}
            sx={{
              mt: 2,
              height: "60px",
              borderRadius: "20px",
              fontWeight: "bold",
              fontSize: '1.2rem',
              textTransform: "none",
              background: loading 
                ? 'linear-gradient(45deg, #ccc, #999)'
                : 'linear-gradient(45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
              backgroundSize: '400% 400%',
              animation: loading ? 'none' : 'buttonGradient 3s ease infinite',
              border: 'none',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover:not(:disabled)': {
                transform: 'translateY(-3px)',
                boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
                backgroundSize: '200% 200%'
              },
              '&:active:not(:disabled)': {
                transform: 'translateY(-1px)'
              },
              '@keyframes buttonGradient': {
                '0%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
                '100%': { backgroundPosition: '0% 50%' }
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                transition: 'left 0.5s ease',
              },
              '&:hover::before': {
                left: '100%'
              }
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={24} sx={{ color: 'white' }} />
                🚀 מעביר אותך לגן...
              </Box>
            ) : (
              '🌈 בואו נכנס לגן! 🌈'
            )}
          </Button>
        </Paper>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          severity="success" 
          sx={{ 
            width: "100%",
            borderRadius: '15px',
            background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          🎉 ברוכים הבאים לגן! מעביר אותך...
        </Alert>
      </Snackbar>

      {/* set new password dialog */}
      <Dialog 
        open={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            textAlign: 'center', 
            background: 'linear-gradient(45deg, #667eea, #764ba2)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            fontWeight: 'bold' 
          }}
        >
          🔑 איפוס סיסמה
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="כתובת מייל"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="rtl"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '15px'
              }
            }}
          />
          {message && (
            <Box sx={{ color: '#4ecdc4', marginTop: '10px', fontWeight: 'bold', textAlign: 'center' }}>
              {message}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
          <Button 
            onClick={() => setShowForgotPassword(false)}
            sx={{
              borderRadius: '15px',
              px: 3
            }}
          >
            ביטול
          </Button>
          <Button 
            onClick={() => handleRequestPasswordReset(email)} 
            variant="contained"
            disabled={isSubmitting}
            sx={{
              borderRadius: '15px',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              px: 3
            }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'שלח'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoginPage;