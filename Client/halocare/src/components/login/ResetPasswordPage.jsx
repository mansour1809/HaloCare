// src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Box, 
  InputAdornment, 
  Alert,
  Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Email } from '@mui/icons-material';
import { useAuth } from './AuthContext';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { sendPasswordResetEmail } = useAuth(); // נניח שיש לנו פונקציה כזו בקונטקסט
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // בדיקת אימות בסיסית
    if (!email) {
      setError('יש להזין אימייל');
      return;
    }

    // בדיקת פורמט אימייל בסיסית
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('יש להזין כתובת אימייל תקינה');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // שליחת אימייל לאיפוס סיסמה
      await sendPasswordResetEmail(email);
      
      // הצגת הודעת הצלחה
      setSuccess(true);
    } catch (err) {
      setError('שליחת הבקשה לאיפוס סיסמה נכשלה, אנא נסה שוב מאוחר יותר');
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
      <Paper 
        elevation={3} 
        sx={{ 
          padding: '30px', 
          borderRadius: '10px', 
          textAlign: 'center',
          width: { xs: '90%', sm: '450px' },
          backgroundColor: 'white'
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          איפוס סיסמה
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
          הזן את כתובת האימייל שלך ונשלח לך הוראות לאיפוס הסיסמה
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success ? (
          <Box sx={{ textAlign: 'center', my: 3 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              הוראות לאיפוס הסיסמה נשלחו לאימייל שהזנת
            </Alert>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => navigate('/login')}
            >
              חזרה לדף התחברות
            </Button>
          </Box>
        ) : (
          <form onSubmit={handleResetPassword}>
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
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                color="inherit"
                onClick={() => navigate('/login')}
              >
                ביטול
              </Button>
              
              <Button 
                type="submit"
                variant="contained" 
                color="primary" 
                disabled={loading}
              >
                {loading ? 'שולח...' : 'שלח הוראות איפוס'}
              </Button>
            </Box>
          </form>
        )}
      </Paper>

    </Box>
  );
};

export default ResetPasswordPage;