// src/pages/ResetPasswordPage.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, LockReset } from '@mui/icons-material';
import { useAuth } from './AuthContext';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  
  useEffect(() => {
    // קבלת הטוקן והאימייל מפרמטרי ה-URL
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');
    const emailFromUrl = params.get('email');

    if (!tokenFromUrl || !emailFromUrl) {
      setError('קישור לא תקין. אנא בקש קישור חדש לאיפוס סיסמה.');
      return;
    }
    
    setToken(tokenFromUrl);
    setEmail(emailFromUrl);
  }, [location]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // בדיקת תקינות סיסמאות
    if (password !== confirmPassword) {
      setError('הסיסמאות לא תואמות');
      return;
    }
    
    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // שימוש בפונקציה מה-AuthContext
      const response = await resetPassword(email, token, password);
      
      setMessage(response.message || 'הסיסמה עודכנה בהצלחה');
      setIsSuccess(true);
      
      // מעבר לדף ההתחברות אחרי השהייה
      setTimeout(() => {
        navigate(`/login?email=${encodeURIComponent(email)}`);
      }, 3000);
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'אירעה שגיאה באיפוס הסיסמה. ייתכן שהקישור פג תוקף.'
      );
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // תצוגת שגיאה אם הקישור לא תקין
  if (error && !token) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom dir="rtl">
            שגיאה באיפוס סיסמה
          </Typography>
          <Alert severity="error" sx={{ mt: 2 }} dir="rtl">
            {error}
          </Alert>
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/login')}
            >
              חזרה לדף התחברות
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <LockReset color="primary" sx={{ fontSize: 48 }} />
          <Typography variant="h5" gutterBottom dir="rtl">
            איפוס סיסמה
          </Typography>
          <Typography variant="body2" color="textSecondary" dir="rtl">
            אנא הזן את הסיסמה החדשה שלך
          </Typography>
        </Box>
        
        {isSuccess ? (
          <Alert severity="success" sx={{ mt: 2 }} dir="rtl">
            {message}
            <Typography variant="body2" sx={{ mt: 1 }}>
              מעביר אותך לדף ההתחברות...
            </Typography>
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} dir="rtl">
                {error}
              </Alert>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="סיסמה חדשה"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              dir="rtl"
              InputProps={{
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
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="אימות סיסמה"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              dir="rtl"
              InputProps={{
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
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, height: "50px" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'איפוס סיסמה'}
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Button 
                variant="text" 
                color="primary"
                onClick={() => navigate('/login')}
                sx={{ mt: 1 }}
              >
                חזרה לדף התחברות
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ResetPassword;