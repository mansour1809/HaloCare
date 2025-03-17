import React from 'react';
import { TextField, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';


const LoginPage = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();

    const handleLogin = () => {
        setIsAuthenticated(true);
        navigate('/calendar'); // ניווט לעמוד היומן אחרי התחברות
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '50px' }}>
                <img src={'/Logo (2).jpeg'} alt="Halo Care Logo" style={{ height: '150px' }} />
                <Paper elevation={3} style={{ padding: '30px', borderRadius: '10px', textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        👋 ברוכים הבאים
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                        התחבר למשתמש קיים
                    </Typography>
                    <TextField fullWidth label="אימייל" variant="outlined" margin="normal" />
                    <TextField fullWidth label="סיסמה" variant="outlined" margin="normal" type="password" />
                    <Typography variant="body2" color="primary" style={{ textAlign: 'right', cursor: 'pointer', marginBottom: '10px' }}>
                        שכחת סיסמה?
                    </Typography>
                    <Button fullWidth variant="contained" color="primary" size="large" onClick={handleLogin}>
                        התחבר
                    </Button>
                </Paper>
            </div>
        </div>
    );
};

export default LoginPage;
