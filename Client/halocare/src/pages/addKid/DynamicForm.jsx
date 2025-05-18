// pages/DynamicForm.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, Alert } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import DynamicFormRenderer from '../components/forms/DynamicFormRenderer';
import { toast } from 'react-toastify';

const DynamicForm = () => {
  const { formId, kidId } = useParams();
  const navigate = useNavigate();
  
  const formNames = {
    '1003': 'רקע התפתחותי',
    '1004': 'מצב בריאותי',
    '1005': 'שאלון תזונתי',
    '1006': 'אישורים',
    '1007': 'ביקור בית'
  };
  
  const handleFormUpdate = () => {
    toast.success('הטופס נשמר בהצלחה!');
    navigate(`/kid-profile/${kidId}`);
  };
  
  if (!kidId) {
    return (
      <Box sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
        <Alert severity="error">
          לא ניתן למלא טופס ללא בחירת ילד. אנא חזור לדף הקודם ונסה שוב.
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          חזרה
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {formNames[formId] || 'טופס'}
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/kid-profile/${kidId}`)}
          >
            חזרה לתיק הילד
          </Button>
        </Box>
        
        <DynamicFormRenderer 
          formId={Number(formId)}
          kidId={Number(kidId)}
          onUpdate={handleFormUpdate}
        />
      </Paper>
    </Box>
  );
};

export default DynamicForm;