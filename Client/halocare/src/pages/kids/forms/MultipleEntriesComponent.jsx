import  { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  Alert,
  Divider,
  Tooltip,
  Card,
  CardContent,
  styled,
  alpha,
  keyframes
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Medication as MedicationIcon,
  Warning as WarningIcon,
  LocalHospital as HospitalIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { updateLocalMultipleEntries } from '../../../Redux/features/answersSlice';

// Animation keyframes
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Enhanced Styled Components
const MainContainer = styled(Paper)(({ theme, bgcolor }) => ({
  borderRadius: 20,
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(bgcolor || theme.palette.primary.main, 0.03)} 0%, ${alpha(bgcolor || theme.palette.primary.main, 0.01)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `2px solid ${alpha(bgcolor || theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${bgcolor || theme.palette.primary.main}, ${alpha(bgcolor || theme.palette.primary.main, 0.5)})`,
  }
}));

const EntryCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: 16,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  animation: `${slideIn} 0.3s ease-out`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.9)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 1)',
      '& fieldset': {
        borderColor: theme.palette.primary.main,
      }
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 1)',
      '& fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
      }
    }
  }
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: 12,
  background: 'rgba(255, 255, 255, 0.9)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 1)',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 0, 0, 0.23)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
    borderWidth: '2px',
  }
}));

const AddButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1, 3),
  fontWeight: 600,
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  color: 'white',
  boxShadow: '0 4px 15px rgba(76, 181, 195, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(76, 181, 195, 0.4)',
  }
}));

const RemoveButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.error.main,
  background: alpha(theme.palette.error.main, 0.1),
  transition: 'all 0.3s ease',
  '&:hover': {
    background: alpha(theme.palette.error.main, 0.2),
    transform: 'rotate(90deg) scale(1.1)',
  }
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  borderRadius: 12,
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
}));

const SummaryAlert = styled(Alert)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: 12,
  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(129, 199, 132, 0.05) 100%)',
  border: '1px solid rgba(76, 175, 80, 0.2)',
  '& .MuiAlert-icon': {
    color: theme.palette.success.main,
  }
}));

const MultipleEntriesComponent = ({ 
  question, 
  existingAnswer, 
  onDataChange 
}) => {
  const dispatch = useDispatch();

  // Define fields for each type of information 
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

  // Define UI config for each type - Enhanced with MUI icons and colors
  const getUIConfig = (type) => {
    const configs = {
      'medications': {
        title: 'פירוט תרופות',
        addButtonText: 'הוסף תרופה',
        icon: <MedicationIcon sx={{ fontSize: 28 }} />,
        bgColor: '#2196f3',
        lightColor: alpha('#2196f3', 0.1)
      },
      'allergies': {
        title: 'פירוט אלרגיות ורגישויות',
        addButtonText: 'הוסף אלרגיה',
        icon: <WarningIcon sx={{ fontSize: 28 }} />,
        bgColor: '#f44336',
        lightColor: alpha('#f44336', 0.1)
      },
      'seizures': {
        title: 'פירוט התקפים/אפילפסיה',
        addButtonText: 'הוסף פירוט',
        icon: <HospitalIcon sx={{ fontSize: 28 }} />,
        bgColor: '#9c27b0',
        lightColor: alpha('#9c27b0', 0.1)
      }
    };
    return configs[type] || { 
      title: type, 
      addButtonText: 'הוסף פריט', 
      icon: <InfoIcon sx={{ fontSize: 28 }} />, 
      bgColor: '#757575',
      lightColor: alpha('#757575', 0.1)
    };
  };

  const fields = getFieldsConfig(question.multipleEntryType);
  const uiConfig = getUIConfig(question.multipleEntryType);

  // Create an empty entry 
  const createEmptyEntry = () => {
    const entry = {};
    fields.forEach(field => {
      entry[field.name] = '';
    });
    return entry;
  };

  // Loading existing data or creating the first entry 
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

  // Update when existing data changes 
  useEffect(() => {
    setEntries(initializeEntries());
  }, [existingAnswer]);

  // Function to update an entry 
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

  // Adding a new item 
  const addEntry = () => {
    const newEntries = [...entries, createEmptyEntry()];
    setEntries(newEntries);
    
    dispatch(updateLocalMultipleEntries({
      questionNo: question.questionNo,
      multipleEntries: newEntries
    }));
    
    onDataChange && onDataChange(newEntries);
  };

  // Remove item 
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

  // Render single field - Enhanced with MUI components
  const renderField = (field, entryIndex, value) => {
    const commonProps = {
      value: value || '',
      onChange: (e) => updateEntry(entryIndex, field.name, e.target.value),
      fullWidth: true,
      size: 'small',
      required: field.required
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
          <FormControl fullWidth size="small">
            <InputLabel>{field.label}</InputLabel>
            <StyledSelect
              value={value || ''}
              onChange={(e) => updateEntry(entryIndex, field.name, e.target.value)}
              label={field.label}
            >
              <MenuItem value="">
                <em>בחר {field.label.toLowerCase()}</em>
              </MenuItem>
              {field.options?.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </StyledSelect>
          </FormControl>
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

  const filledEntriesCount = entries.filter(entry => 
    Object.values(entry).some(val => val && val.toString().trim())
  ).length;

  return (
    <MainContainer bgcolor={uiConfig.bgColor} dir="rtl">
      {/* Header */}
      <HeaderBox>
        <Box sx={{ 
          color: uiConfig.bgColor,
          animation: `${pulse} 2s infinite`,
          filter: `drop-shadow(0 2px 4px ${alpha(uiConfig.bgColor, 0.3)})`
        }}>
          {uiConfig.icon}
        </Box>
        <Typography 
          variant="h6" 
          fontWeight="bold"
          sx={{
            background: `linear-gradient(45deg, ${uiConfig.bgColor} 30%, ${alpha(uiConfig.bgColor, 0.7)} 90%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {uiConfig.title}
        </Typography>
        <Chip 
          label={`${filledEntriesCount} פריטים`}
          size="small"
          sx={{
            ml: 'auto',
            background: `linear-gradient(45deg, ${uiConfig.bgColor} 30%, ${alpha(uiConfig.bgColor, 0.7)} 90%)`,
            color: 'white',
            fontWeight: 600
          }}
        />
      </HeaderBox>

      {/* List of items */}
      <Box>
        {entries.map((entry, entryIndex) => (
          <EntryCard key={entryIndex}>
            <CardContent>
              {/* Item header */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2 
              }}>
                <Chip 
                  label={`פריט ${entryIndex + 1}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
                {entries.length > 1 && (
                  <Tooltip title="הסר פריט">
                    <RemoveButton
                      size="small"
                      onClick={() => removeEntry(entryIndex)}
                    >
                      <DeleteIcon />
                    </RemoveButton>
                  </Tooltip>
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Item fields */}
              <Grid container spacing={2}>
                {fields.map((field) => (
                  <Grid 
                    item 
                    key={field.name} 
                    size={{xs:12}} 
                    md={field.type === 'textarea' ? 12 : 6}
                  >
                    <Typography 
                      variant="body2" 
                      fontWeight={600} 
                      color="text.secondary" 
                      gutterBottom
                    >
                      {field.label}
                      {field.required && (
                        <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                          *
                        </Typography>
                      )}
                    </Typography>
                    {renderField(field, entryIndex, entry[field.name])}
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </EntryCard>
        ))}
      </Box>

      {/* Add button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <AddButton
          startIcon={<AddIcon />}
          onClick={addEntry}
        >
          {uiConfig.addButtonText}
        </AddButton>
      </Box>

      {/* Summary of information */}
      {filledEntriesCount > 0 && (
        <SummaryAlert 
          severity="success"
          icon={<CheckIcon />}
        >
          <Typography variant="body2" fontWeight={600}>
            מידע שנשמר: {filledEntriesCount} פריטים עם מידע
          </Typography>
        </SummaryAlert>
      )}
    </MainContainer>
  );
};

export default MultipleEntriesComponent;