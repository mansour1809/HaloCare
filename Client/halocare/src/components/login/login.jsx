import { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';

const LoginPage = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleLogin = () => {
    // בדיקת אימות בסיסית (בפרויקט אמיתי, זה יתחבר לשרת)
    if (!email || !password) {
      setError('יש להזין אימייל וסיסמה');
      return;
    }

    // אימות למטרות הדגמה (יוחלף בקריאת API אמיתית)
    if (email === 'admin@example.com' && password === 'password') {
      // שמירת פרטי ההתחברות בלוקל סטורג'
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify({ 
        email, 
        name: 'מנהל המערכת',
        role: 'admin'
      }));
      
      setIsAuthenticated(true);
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate('/calendar');
      }, 1000);
    } else {
      setError('פרטי התחברות שגויים');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        // backgroundColor: '#f0f4f8',
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
                <InputAdornment position="start"sx={{paddingRight:'14px'}}>
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
            sx={{ 
              mt: 2,
              height: '50px',
              borderRadius: '8px',
              fontWeight: 'bold',
              textTransform: 'none'
            }}
          >
            התחבר
          </Button>

          <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
            למטרות הדגמה: admin@example.com / password
          </Typography>
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
              height: '450px',
              borderRadius: '10px',
            //   boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
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
          התחברת בהצלחה! מעביר אותך ליומן...
        </Alert>
      </Snackbar>
    </Box>
  );
};
LoginPage.propTypes = {
  setIsAuthenticated: PropTypes.func.isRequired,
};

export default LoginPage;