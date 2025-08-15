import React, { useState } from 'react';
import { 
  Box, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  CircularProgress,
  Typography,
  Paper,
  Fade,
  Alert
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const LanguageSelector = ({ onLanguageChange, loading = false }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('he');
  const [translated, setTranslated] = useState(false);

  const languages = [
    { code: 'he', name: 'עברית', flag: '🇮🇱', dir: 'rtl' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺', dir: 'ltr' },
    { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
    { code: 'am', name: 'አማርኛ', flag: '🇪🇹', dir: 'ltr' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
    { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' }
  ];

  const handleChange = async (event) => {
    const newLanguage = event.target.value;
    setSelectedLanguage(newLanguage);
    setTranslated(false);
    
    await onLanguageChange(newLanguage);
    
    if (newLanguage !== 'he') {
      setTimeout(() => setTranslated(true), 500);
      setTimeout(() => setTranslated(false), 3000);
    }
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        mb: 3, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 3
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <TranslateIcon sx={{ fontSize: 28 }} />
        
        <Typography variant="h6" sx={{ flex: 1 }}>
          בחר שפה / Choose Language
        </Typography>

        <FormControl 
          size="small" 
          sx={{ 
            minWidth: 200,
            backgroundColor: 'white',
            borderRadius: 1
          }}
        >
          <Select
            value={selectedLanguage}
            onChange={handleChange}
            disabled={loading}
            displayEmpty
            sx={{
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }
            }}
          >
            {languages.map((lang) => (
              <MenuItem 
                key={lang.code} 
                value={lang.code}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <span style={{ fontSize: '1.2em' }}>{lang.flag}</span>
                <span>{lang.name}</span>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} sx={{ color: 'white' }} />
            <Typography variant="body2">מתרגם...</Typography>
          </Box>
        )}
      </Box>

      <Fade in={translated}>
        <Alert 
          severity="success" 
          icon={<CheckCircleIcon />}
          sx={{ 
            mt: 2,
            backgroundColor: 'rgba(255,255,255,0.9)'
          }}
        >
          הטופס תורגם בהצלחה!
        </Alert>
      </Fade>

      {selectedLanguage !== 'he' && !loading && (
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            mt: 2, 
            opacity: 0.9,
            textAlign: 'center'
          }}
        >
          💡 התשובות שלך יתורגמו אוטומטית לעברית בעת השליחה
        </Typography>
      )}
    </Paper>
  );
};

export default LanguageSelector;