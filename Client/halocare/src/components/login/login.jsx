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

const LoginPage = () => {
  const navigate = useNavigate();
  const { 
    login, 
    handleRequestPasswordReset, 
    showForgotPassword, 
    setShowForgotPassword, 
    message, 
    isSubmitting,
    setEmail: setAuthEmail // Rename to avoid conflict with local state
  } = useAuth();
  
  const passwordRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Clear localStorage when user navigates to the login page
    localStorage.clear();
    const hash = window.location.hash; 
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    const emailParam = params.get('email');

    if (emailParam) {
      setEmail(emailParam);
      passwordRef.current?.focus();
    }
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    // Basic validation check
    if (!email || !password) {
      setError('יש להזין אימייל וסיסמה');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Login
      await login(email, password);
      
      // Show success message
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

  // Pass the email to the context before opening the dialog
  const handleForgotPasswordClick = () => {
    setAuthEmail(email);
    setShowForgotPassword(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        direction: "rtl",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "50px",
          width: "65%",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            padding: "20px",
          }}
        >
          <img
            src={"/logo.png"}
            alt="Halo Care Logo"
            style={{
              height: "250px",
              borderRadius: "10px",
            }}
          />
        </Box>
        <Paper
          elevation={3}
          sx={{
            padding: "30px",
            borderRadius: "10px",
            textAlign: "center",
            width: { xs: "90%", sm: "100%" },
            backgroundColor: "white",
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            👋 ברוכים הבאים
          </Typography>
          <Typography
            variant="subtitle1"
            color="textSecondary"
            gutterBottom
            sx={{ mb: 3 }}
          >
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
                <InputAdornment position="start" sx={{ paddingRight: "14px" }}>
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
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            inputRef={passwordRef} // Focuses the input
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
              if (e.key === "Enter") {
                handleLogin();
              }
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: "pointer" }}
              onClick={handleForgotPasswordClick}
            >שכחת סימה
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
              height: "50px",
              borderRadius: "8px",
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            {loading ? "...מעביר אותך" : "התחבר"}
          </Button>
        </Paper>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Successfully logged in! Redirecting...
        </Alert>
      </Snackbar>


      {/* Password reset dialog - handled in AuthContext */}
      <Dialog open={showForgotPassword} onClose={() => setShowForgotPassword(false)} fullWidth>
        <DialogTitle>Password Reset</DialogTitle>
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
          />
          {message && <div style={{ color: 'green', marginTop: '10px' }}>{message}</div>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowForgotPassword(false)}>ביטול</Button>
          <Button 
            onClick={() => handleRequestPasswordReset(email)} 
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'שלח'}
          </Button>
שלח         </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoginPage;