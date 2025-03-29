// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Box, 
  InputAdornment, 
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useAuth } from './AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const from = location.state?.from || '/';
  
  // שימוש בקונטקסט
  const { login } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);

// React.useEffect(() => {
//   // נמנע ממעבר אוטומטי אם המשתמש הגיע ישירות לדף ההתחברות
//   if (isAuthenticated && location.pathname === '/login' && from !== '/login') {
//     navigate(from);
//   }
// }, [isAuthenticated, navigate, from, location.pathname]);

const handleLogin = async (e) => {
  if (e) e.preventDefault();
  
  // בדיקת אימות בסיסית
  if (!email || !password) {
    setError('יש להזין אימייל וסיסמה');
    return;
  }

  setLoading(true);
  setError('');

  try {
    // התחברות
    await login(email, password);
    
    // הצגת הודעת הצלחה
    setOpenSnackbar(true);
    
    // ניווט לדף הבית אחרי התחברות מוצלחת
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 1000);
  } catch (err) {
    console.error('התחברות נכשלה:', err);
    setError(err.response?.data?.message || 'התחברות נכשלה, אנא נסה שוב');
  } finally {
    setLoading(false);
  }
};

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        direction: 'rtl'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '50px',
          width: '65%',
          flexDirection: { xs: 'column', md: 'row' }
        }}
      >
       
        <Paper 
          elevation={3} 
          sx={{ 
            padding: '30px', 
            borderRadius: '10px', 
            textAlign: 'center',
            width: { xs: '90%', sm: '100%' },
            backgroundColor: 'white'
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            👋 ברוכים הבאים
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
            התחבר למשתמש קיים
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField 
            fullWidth 
            label="אימייל" 
            variant="outlined" 
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{paddingRight:'14px'}}>
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField 
            fullWidth 
            label="סיסמה" 
            variant="outlined" 
            margin="normal"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" >
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}    
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleLogin();
              }
            }}
          />
          
          <Box sx={{  justifyContent: 'flex-start', mb: 2 }}>
            <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
              שכחת סיסמה?
            </Typography>
          </Box>
          
          <Button 
            fullWidth 
            variant="contained" 
            color="primary" 
            size="large" 
            onClick={handleLogin}
            disabled={loading}
            sx={{ 
              mt: 2,
              height: '50px',
              borderRadius: '8px',
              fontWeight: 'bold',
              textTransform: 'none'
            }}
          >
            {loading ? 'מתחבר...' : 'התחבר'}
          </Button>
        </Paper>
        <Box
          sx={{
            textAlign: 'center',
            padding: '20px'
          }}
        >
          <img 
            src={'/logo.jpeg'} 
            alt="Halo Care Logo" 
            style={{ 
              height: '250px',
              borderRadius: '10px',
            }} 
          />
        </Box>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          התחברת בהצלחה! מעביר אותך ...
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;