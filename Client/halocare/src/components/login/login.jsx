// src/pages/LoginPage.jsx - שינויים
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
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useAuth } from './AuthContext';
import axios from 'axios';

const API_URL = 'https://localhost:7225/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loading, setLoading] = useState(false);
  
  // משתנים לדיאלוג שכחתי סיסמה
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

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
      setSnackbarMessage('התחברת בהצלחה! מעביר אותך...');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      // ניווט לדף הבית אחרי התחברות מוצלחת
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
    } catch (err) {
      setError('התחברות נכשלה, אנא נסה שוב');
    } finally {
      setLoading(false);
    }
  };
  
  // פתיחת דיאלוג שכחתי סיסמה
  const handleOpenForgotPassword = () => {
    setForgotPasswordOpen(true);
    setResetEmail(email); // נשתמש באימייל שכבר הוזן אם קיים
  };
  
  // סגירת דיאלוג שכחתי סיסמה
  const handleCloseForgotPassword = () => {
    setForgotPasswordOpen(false);
    setResetEmail('');
  };
  
  // שליחת בקשה לאיפוס סיסמה
  const handleResetPassword = async () => {
    if (!resetEmail) {
      setError('יש להזין כתובת אימייל');
      return;
    }
    
    setResetLoading(true);
    
    try {
      await axios.post(`${API_URL}/Auth/reset-password`, { email: resetEmail });
      
      // הצגת הודעת הצלחה
      setSnackbarMessage('נשלח אימייל עם סיסמה חדשה');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      // סגירת הדיאלוג
      handleCloseForgotPassword();
    } catch (err) {
      // טיפול בשגיאות ספציפיות
      if (err.response && err.response.status === 404) {
        setError('כתובת האימייל לא נמצאה במערכת');
      } else {
        setError('אירעה שגיאה. אנא נסה שוב מאוחר יותר');
      }
    } finally {
      setResetLoading(false);
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
                <InputAdornment position="start">
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
          
          <Box sx={{ justifyContent: 'flex-start', mb: 2 }}>
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ cursor: 'pointer' }}
              onClick={handleOpenForgotPassword}
            >
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

      {/* דיאלוג שכחתי סיסמה */}
      <Dialog open={forgotPasswordOpen} onClose={handleCloseForgotPassword} dir="rtl">
        <DialogTitle>איפוס סיסמה</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            הזן את כתובת האימייל שלך ואנו נשלח לך סיסמה חדשה.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="אימייל"
            type="email"
            fullWidth
            variant="outlined"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForgotPassword} color="inherit">
            ביטול
          </Button>
          <Button 
            onClick={handleResetPassword} 
            variant="contained" 
            color="primary"
            disabled={resetLoading}
          >
            {resetLoading ? 'שולח...' : 'שלח'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;