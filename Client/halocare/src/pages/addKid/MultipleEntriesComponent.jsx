// MultipleEntriesComponent.jsx - עיצוב מתקדם מבוסס על Employee components
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateLocalMultipleEntries } from '../../Redux/features/answersSlice';
import {
  Box, Typography, TextField, Button, Card, IconButton, 
  Paper, Chip, Fade, Stack, Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  LocalHospital as HospitalIcon,
  AutoAwesome as AutoAwesomeIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled, alpha } from '@mui/material/styles';

// יצירת theme מתקדם עם תמיכה ב-RTL כמו ב-Employee components
const rtlTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    h6: {
      fontWeight: 600,
      fontSize: '1.4rem'
    }
  },
  palette: {
    primary: {
      main: '#4cb5c3',
      light: '#7cd8e5',
      dark: '#2a8a95',
    },
    secondary: {
      main: '#ff7043',
      light: '#ffa270',
      dark: '#c63f17',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#047857',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    }
  },
});

// קונטיינר ראשי מעוצב
const MainContainer = styled(Box)(({ theme, uiconfig }) => ({
  border: `2px solid ${uiconfig?.borderColor || 'rgba(76, 181, 195, 0.3)'}`,
  borderRadius: 20,
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  background: uiconfig?.bgGradient || 'linear-gradient(135deg, rgba(76, 181, 195, 0.05) 0%, rgba(76, 181, 195, 0.1) 100%)',
  backdropFilter: 'blur(10px)',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: uiconfig?.gradient || 'linear-gradient(90deg, #4cb5c3, #ff7043)',
    borderRadius: '20px 20px 0 0',
  }
}));

// כותרת מעוצבת
const SectionTitle = styled(Box)(({ theme, uiconfig }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(uiconfig?.color || '#4cb5c3', 0.1)}, ${alpha(uiconfig?.color || '#4cb5c3', 0.05)})`,
  borderRadius: 16,
  border: `1px solid ${alpha(uiconfig?.color || '#4cb5c3', 0.2)}`,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: '2px',
    background: uiconfig?.gradient || 'linear-gradient(90deg, #4cb5c3, #ff7043)',
  }
}));

// כרטיס פריט מעוצב
const ItemCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #4cb5c3, #10b981)',
  }
}));

// כותרת פריט
const ItemHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.05), rgba(16, 185, 129, 0.05))',
  borderBottom: '1px solid rgba(76, 181, 195, 0.1)',
}));

// כפתור מונפש מתקדם
const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: '12px 24px',
  fontWeight: 600,
  fontSize: '1rem',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  boxShadow: '0 6px 20px rgba(76, 181, 195, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 35px rgba(76, 181, 195, 0.4)',
    background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'all 0.5s ease',
  },
  '&:hover::after': {
    left: '100%',
  }
}));

// כפתור מחיקה מעוצב
const DeleteButton = styled(IconButton)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
  color: 'white',
  borderRadius: '50%',
  width: 40,
  height: 40,
  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    transform: 'scale(1.1) rotate(15deg)',
    boxShadow: '0 6px 20px rgba(239, 68, 68, 0.5)',
  }
}));

// שדה קלט מעוצב
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#4cb5c3',
      borderWidth: 2,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#4cb5c3',
      borderWidth: 2,
      boxShadow: '0 0 0 3px rgba(76, 181, 195, 0.1)',
    }
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
    '&.Mui-focused': {
      color: '#4cb5c3',
    }
  }
}));

// סיכום מידע מעוצב
const InfoSummary = styled(Alert)(({ theme }) => ({
  marginTop: theme.spacing(4),
  borderRadius: 16,
  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
  border: '2px solid rgba(16, 185, 129, 0.3)',
  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)',
  '& .MuiAlert-icon': {
    fontSize: '1.5rem',
  }
}));

const MultipleEntriesComponent = ({ 
  question, 
  existingAnswer, 
  onDataChange 
}) => {
  const dispatch = useDispatch();

  // הגדרת שדות לכל סוג מידע
  const getFieldsConfig = (type) => {
    const configs = {
      'medications': [
        { name: 'medicationName', label: 'שם התרופה', type: 'text', required: true },
        { name: 'dosage', label: 'מינון', type: 'text', required: true },
        { name: 'times', label: 'זמני נטילה', type: 'text', required: true },
        { name: 'notes', label: 'הערות', type: 'textarea', required: false }
      ],
      'allergies': [
        { name: 'allergen', label: 'חומר אלרגני', type: 'text', required: true },
        { name: 'reaction', label: 'סוג התגובה', type: 'text', required: true },
        { name: 'severity', label: 'חומרה', type: 'select', options: ['קלה', 'בינונית', 'חמורה'], required: true },
        { name: 'notes', label: 'הערות', type: 'textarea', required: false }
      ],
      'seizures': [
        { name: 'seizureType', label: 'סוג התקף', type: 'text', required: true },
        { name: 'frequency', label: 'תדירות', type: 'text', required: true },
        { name: 'triggers', label: 'טריגרים', type: 'textarea', required: false },
        { name: 'medications', label: 'תרופות רלוונטיות', type: 'text', required: false },
        { name: 'notes', label: 'הערות נוספות', type: 'textarea', required: false }
      ]
    };
    return configs[type] || [];
  };

  // הגדרת תצורת UI לכל סוג
  const getUIConfig = (type) => {
    const configs = {
      'medications': {
        title: '💊 פירוט תרופות',
        addButtonText: 'הוסף תרופה',
        icon: <MedicalIcon />,
        bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.1))',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        color: '#3b82f6',
        gradient: 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
      },
      'allergies': {
        title: '⚠️ פירוט אלרגיות ורגישויות',
        addButtonText: 'הוסף אלרגיה',
        icon: <WarningIcon />,
        bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(239, 68, 68, 0.1))',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        color: '#ef4444',
        gradient: 'linear-gradient(90deg, #ef4444, #dc2626)'
      },
      'seizures': {
        title: '🩺 פירוט התקפים/אפילפסיה',
        addButtonText: 'הוסף פירוט',
        icon: <HospitalIcon />,
        bgGradient: 'linear-gradient(135deg, rgba(147, 51, 234, 0.05), rgba(147, 51, 234, 0.1))',
        borderColor: 'rgba(147, 51, 234, 0.3)',
        color: '#9333ea',
        gradient: 'linear-gradient(90deg, #9333ea, #7c3aed)'
      }
    };
    return configs[type] || { 
      title: `📝 ${type}`, 
      addButtonText: 'הוסף פריט', 
      icon: <AutoAwesomeIcon />,
      bgGradient: 'linear-gradient(135deg, rgba(107, 114, 128, 0.05), rgba(107, 114, 128, 0.1))',
      borderColor: 'rgba(107, 114, 128, 0.3)',
      color: '#6b7280',
      gradient: 'linear-gradient(90deg, #6b7280, #4b5563)'
    };
  };

  const fields = getFieldsConfig(question.multipleEntryType);
  const uiConfig = getUIConfig(question.multipleEntryType);

  // יצירת פריט ריק
  const createEmptyEntry = () => {
    const entry = {};
    fields.forEach(field => {
      entry[field.name] = '';
    });
    return entry;
  };

  // טעינת נתונים קיימים או יצירת הפריט הראשון
  const initializeEntries = () => {
    if (existingAnswer?.multipleEntries) {
      try {
        const parsed = JSON.parse(existingAnswer.multipleEntries);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : [createEmptyEntry()];
      } catch (e) {
        console.error('Error parsing existing multiple entries:', e);
        return [createEmptyEntry()];
      }
    }
    return [createEmptyEntry()];
  };

  const [entries, setEntries] = useState(initializeEntries);

  // עדכון כאשר נתונים קיימים משתנים
  useEffect(() => {
    setEntries(initializeEntries());
  }, [existingAnswer]);

  // פונקציה לעדכון פריט
  const updateEntry = (index, fieldName, value) => {
    const newEntries = entries.map((entry, entryIndex) => {
      if (entryIndex === index) {
        return { ...entry, [fieldName]: value };
      }
      return entry;
    });
    
    setEntries(newEntries);
    
    dispatch && dispatch(updateLocalMultipleEntries({
      questionNo: question.questionNo,
      multipleEntries: newEntries
    }));
    
    onDataChange && onDataChange(newEntries);
  };

  // הוספת פריט חדש
  const addEntry = () => {
    const newEntries = [...entries, createEmptyEntry()];
    setEntries(newEntries);
    
    dispatch(updateLocalMultipleEntries({
      questionNo: question.questionNo,
      multipleEntries: newEntries
    }));
    
    onDataChange && onDataChange(newEntries);
  };

  // הסרת פריט
  const removeEntry = (index) => {
    if (entries.length > 1) {
      const newEntries = entries.filter((_, i) => i !== index);
      setEntries(newEntries);
      
      dispatch && dispatch(updateLocalMultipleEntries({
        questionNo: question.questionNo,
        multipleEntries: newEntries
      }));
      
      onDataChange && onDataChange(newEntries);
    }
  };

  // רינדור שדה יחיד
  const renderField = (field, entryIndex, value) => {
    const commonProps = {
      value: value || '',
      onChange: (e) => updateEntry(entryIndex, field.name, e.target.value),
      fullWidth: true,
      label: field.label + (field.required ? ' *' : ''),
      variant: 'outlined',
      size: 'medium'
    };

    switch (field.type) {
      case 'textarea':
        return (
          <StyledTextField
            {...commonProps}
            multiline
            rows={3}
            placeholder={`הזן ${field.label.toLowerCase()}`}
          />
        );
      case 'select':
        return (
          <StyledTextField
            {...commonProps}
            select
            placeholder={`בחר ${field.label.toLowerCase()}`}
          >
            <option value="">בחר {field.label.toLowerCase()}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </StyledTextField>
        );
      default:
        return (
          <StyledTextField
            {...commonProps}
            type={field.type || 'text'}
            placeholder={`הזן ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <ThemeProvider theme={rtlTheme}>
      <MainContainer dir="rtl" uiconfig={uiConfig}>
        {/* כותרת */}
        <SectionTitle uiconfig={uiConfig}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${uiConfig.color}, ${alpha(uiConfig.color, 0.7)})`,
            color: 'white',
            fontSize: '1.8rem',
            boxShadow: `0 4px 15px ${alpha(uiConfig.color, 0.4)}`
          }}>
            {uiConfig.icon}
          </Box>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: uiConfig.color,
            flex: 1
          }}>
            {uiConfig.title}
          </Typography>
        </SectionTitle>

        {/* רשימת פריטים */}
        <Box sx={{ marginBottom: 3 }}>
          {entries.map((entry, entryIndex) => (
            <Fade in key={entryIndex} timeout={300 + entryIndex * 100}>
              <ItemCard>
                {/* כותרת פריט */}
                <ItemHeader>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={`פריט ${entryIndex + 1}`}
                      size="small"
                      sx={{
                        background: `linear-gradient(135deg, ${uiConfig.color}, ${alpha(uiConfig.color, 0.8)})`,
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                    <Typography variant="body1" fontWeight="600" color="text.secondary">
                      מילוי פרטים
                    </Typography>
                  </Box>
                  {entries.length > 1 && (
                    <DeleteButton
                      onClick={() => removeEntry(entryIndex)}
                      size="small"
                    >
                      <DeleteIcon />
                    </DeleteButton>
                  )}
                </ItemHeader>

                {/* שדות הפריט */}
                <Box sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                    gap: 3 
                  }}>
                    {fields.map((field) => (
                      <Box 
                        key={field.name} 
                        sx={{ 
                          ...(field.type === 'textarea' && { 
                            gridColumn: { xs: '1', md: '1 / -1' } 
                          })
                        }}
                      >
                        {renderField(field, entryIndex, entry[field.name])}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </ItemCard>
            </Fade>
          ))}
        </Box>

        {/* כפתור הוספה */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <AnimatedButton
            onClick={addEntry}
            startIcon={<AddIcon />}
            sx={{
              background: `linear-gradient(45deg, ${uiConfig.color} 30%, ${alpha(uiConfig.color, 0.8)} 90%)`,
              '&:hover': {
                background: `linear-gradient(45deg, ${alpha(uiConfig.color, 0.8)} 30%, ${alpha(uiConfig.color, 0.6)} 90%)`,
              }
            }}
          >
            ➕ {uiConfig.addButtonText}
          </AnimatedButton>
        </Box>

        {/* סיכום מידע */}
        {entries.length > 0 && entries.some(entry => Object.values(entry).some(val => val && val.toString().trim())) && (
          <Fade in timeout={500}>
            <InfoSummary 
              severity="success"
              icon={<CelebrationIcon />}
            >
              <Typography variant="body1" fontWeight="600" sx={{ mb: 1 }}>
                ✅ מידע שנשמר בהצלחה:
              </Typography>
              <Typography variant="body2">
                {entries.filter(entry => Object.values(entry).some(val => val && val.toString().trim())).length} פריטים עם מידע מלא
              </Typography>
            </InfoSummary>
          </Fade>
        )}
      </MainContainer>
    </ThemeProvider>
  );
};

export default MultipleEntriesComponent;