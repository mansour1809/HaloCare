// src/pages/kids/QuestionRenderer.jsx
import React, { useState, useEffect } from 'react';
import {
  TextField, FormControl, FormLabel, RadioGroup, FormControlLabel,
  Radio, Checkbox, FormGroup, Select, MenuItem, InputLabel,
  FormHelperText, Typography, Box, Paper, Chip, Switch,
  InputAdornment, IconButton, Tooltip, Fade, Zoom, Card,
  CardContent, Avatar, Stack, Divider, Alert
} from '@mui/material';
import {
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Numbers as NumberIcon,
  TextFields as TextIcon,
  CheckCircle as CheckIcon,
  RadioButtonChecked as RadioIcon,
  List as ListIcon,
  ToggleOn as SwitchIcon,
  Edit as SignatureIcon,
  HelpOutline as HelpIcon,
  Star as RequiredIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled } from '@mui/material/styles';
import DigitalSignature from '../addKid/DigitalSignature';

// עיצוב מותאם לכרטיס שאלה מודרני
const QuestionCard = styled(Card)(({ theme, required, questiontype }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  position: 'relative',
  overflow: 'visible',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `2px solid ${required ? theme.palette.warning.light : 'transparent'}`,
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    borderColor: theme.palette.primary.light,
  },
  
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
  },

  // אייקון סוג שאלה בפינה העליונה
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -8,
    right: 16,
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: getQuestionTypeColor(questiontype, theme),
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 2,
  }
}));

// פונקציה לקבלת צבע על פי סוג השאלה
function getQuestionTypeColor(questionType, theme) {
  const colors = {
    text: theme.palette.info.main,
    textArea: theme.palette.info.main,
    email: theme.palette.secondary.main,
    phone: theme.palette.secondary.main,
    number: theme.palette.success.main,
    date: theme.palette.warning.main,
    radio: theme.palette.primary.main,
    checkbox: theme.palette.primary.main,
    select: theme.palette.grey[600],
    boolean: theme.palette.info.main,
    switch: theme.palette.info.main,
    signature: theme.palette.error.main,
  };
  return colors[questionType] || theme.palette.grey[500];
}

const QuestionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  position: 'relative',
}));

const QuestionTypeIcon = styled(Avatar)(({ theme, questiontype }) => ({
  width: 40,
  height: 40,
  background: `linear-gradient(45deg, ${getQuestionTypeColor(questiontype, theme)}, ${getQuestionTypeColor(questiontype, theme)}dd)`,
  fontSize: '1.2rem',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
}));

const QuestionText = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  fontSize: '1.1rem',
  lineHeight: 1.4,
  flex: 1,
}));

const RequiredBadge = styled(Chip)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
  color: 'white',
  fontWeight: 'bold',
  fontSize: '0.75rem',
  height: 24,
  '& .MuiChip-icon': {
    color: 'white',
  }
}));

// שדה קלט מעוצב
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    transition: 'all 0.3s ease',
    background: 'rgba(255,255,255,0.8)',
    
    '&:hover': {
      background: 'rgba(255,255,255,0.95)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.light,
      }
    },
    
    '&.Mui-focused': {
      background: 'white',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }
  }
}));

// פורמקונטרול מעוצב
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiSelect-select': {
    borderRadius: theme.spacing(1.5),
    background: 'rgba(255,255,255,0.8)',
    transition: 'all 0.3s ease',
  }
}));

// אפשרויות רדיו/צ'קבוקס מעוצבות
const OptionContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const OptionItem = styled(FormControlLabel)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1.5),
  background: 'rgba(255,255,255,0.6)',
  border: '1px solid transparent',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    background: 'rgba(255,255,255,0.9)',
    borderColor: theme.palette.primary.light,
    transform: 'translateX(4px)',
  },
  
  '&:has(.Mui-checked)': {
    background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}10)`,
    borderColor: theme.palette.primary.main,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  }
}));

// קומפוננטת שדה "אחר"
const OtherField = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  background: `linear-gradient(135deg, ${theme.palette.grey[50]}, ${theme.palette.grey[100]})`,
  border: `1px solid ${theme.palette.grey[300]}`,
}));

const QuestionRenderer = ({
  question,
  value,
  otherValue,
  error,
  onChange,
  onBlur,
  readOnly = false
}) => {
  const [showOther, setShowOther] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // אנימציה בטעינת השאלה
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // פיצול הערכים האפשריים
  const possibleValues = question.possibleValues ? 
    question.possibleValues.split(',').map(val => val.trim()) : [];

  // קבלת אייקון לסוג השאלה
  const getQuestionTypeIcon = () => {
    const iconProps = { fontSize: 'small' };
    switch (question.questionType) {
      case 'text':
      case 'textArea':
        return <TextIcon {...iconProps} />;
      case 'email':
        return <EmailIcon {...iconProps} />;
      case 'phone':
        return <PhoneIcon {...iconProps} />;
      case 'number':
        return <NumberIcon {...iconProps} />;
      case 'date':
        return <CalendarIcon {...iconProps} />;
      case 'radio':
      case 'singleChoice':
        return <RadioIcon {...iconProps} />;
      case 'checkbox':
      case 'multiChoice':
        return <CheckIcon {...iconProps} />;
      case 'select':
      case 'dropdown':
        return <ListIcon {...iconProps} />;
      case 'boolean':
      case 'yesNo':
      case 'switch':
        return <SwitchIcon {...iconProps} />;
      case 'signature':
      case 'digitalSignature':
        return <SignatureIcon {...iconProps} />;
      default:
        return <InfoIcon {...iconProps} />;
    }
  };

  // טיפול בשינוי ערך
  const handleValueChange = (newValue, newOtherValue = null) => {
    onChange(newValue, newOtherValue);
    
    // הצגת שדה "אחר"
    if (question.hasOther && (newValue === 'אחר' || newValue?.includes?.('אחר'))) {
      setShowOther(true);
    } else {
      setShowOther(false);
    }
  };

  // רנדור קלט השאלה
  const renderQuestionInput = () => {
    switch (question.questionType) {
      case 'text':
      case 'textArea':
        return (
          <StyledTextField
            fullWidth
            multiline={question.questionType === 'textArea'}
            rows={question.questionType === 'textArea' ? 4 : 1}
            value={value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            onBlur={onBlur}
            error={!!error}
            helperText={error}
            placeholder={`הזן ${question.questionText}`}
            disabled={readOnly}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TextIcon color="primary" fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        );

      case 'email':
        return (
          <StyledTextField
            fullWidth
            type="email"
            value={value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            onBlur={onBlur}
            error={!!error}
            helperText={error}
            placeholder="example@mail.com"
            disabled={readOnly}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="primary" fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        );

      case 'phone':
        return (
          <StyledTextField
            fullWidth
            type="tel"
            value={value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            onBlur={onBlur}
            error={!!error}
            helperText={error}
            placeholder="05X-XXXXXXX"
            disabled={readOnly}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="primary" fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        );

      case 'number':
        return (
          <StyledTextField
            fullWidth
            type="number"
            value={value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            onBlur={onBlur}
            error={!!error}
            helperText={error}
            placeholder="הזן מספר"
            disabled={readOnly}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <NumberIcon color="primary" fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        );

      case 'date':
        return (
          <DatePicker
            value={value ? new Date(value) : null}
            onChange={(newDate) => handleValueChange(newDate?.toISOString())}
            disabled={readOnly}
            slots={{
              textField: StyledTextField
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!error,
                helperText: error,
                variant: 'outlined',
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon color="primary" fontSize="small" />
                    </InputAdornment>
                  )
                }
              }
            }}
          />
        );

      case 'boolean':
      case 'yesNo':
        return (
          <OptionContainer>
            <FormControl component="fieldset" error={!!error}>
              <RadioGroup
                value={value || ''}
                onChange={(e) => handleValueChange(e.target.value)}
              >
                <OptionItem
                  value="כן"
                  control={<Radio disabled={readOnly} color="primary" />}
                  label={
                    <Typography variant="body1" fontWeight="medium">
                      כן
                    </Typography>
                  }
                />
                <OptionItem
                  value="לא"
                  control={<Radio disabled={readOnly} color="primary" />}
                  label={
                    <Typography variant="body1" fontWeight="medium">
                      לא
                    </Typography>
                  }
                />
              </RadioGroup>
              {error && <FormHelperText>{error}</FormHelperText>}
            </FormControl>
          </OptionContainer>
        );

      case 'signature':
      case 'digitalSignature':
        return (
          <Box sx={{ mt: 2 }}>
            <DigitalSignature
              value={value}
              onChange={(signatureData) => onChange(signatureData)}
              readOnly={readOnly}
              required={question.isMandatory}
              label={question.questionText}
            />
          </Box>
        );

      case 'radio':
      case 'singleChoice':
        return (
          <OptionContainer>
            <FormControl component="fieldset" error={!!error} fullWidth>
              <RadioGroup
                value={value || ''}
                onChange={(e) => handleValueChange(e.target.value)}
              >
                {possibleValues.map((option, index) => (
                  <Fade in={true} timeout={300 + (index * 100)} key={option}>
                    <OptionItem
                      value={option}
                      control={<Radio disabled={readOnly} color="primary" />}
                      label={
                        <Typography variant="body1" fontWeight="medium">
                          {option}
                        </Typography>
                      }
                    />
                  </Fade>
                ))}
                {question.hasOther && (
                  <Fade in={true} timeout={300 + (possibleValues.length * 100)}>
                    <OptionItem
                      value="אחר"
                      control={<Radio disabled={readOnly} color="primary" />}
                      label={
                        <Typography variant="body1" fontWeight="medium">
                          אחר
                        </Typography>
                      }
                    />
                  </Fade>
                )}
              </RadioGroup>
              {error && <FormHelperText>{error}</FormHelperText>}
            </FormControl>
          </OptionContainer>
        );

      case 'checkbox':
      case 'multiChoice':
        const selectedValues = value ? value.split(',').map(v => v.trim()) : [];
        
        const handleCheckboxChange = (optionValue, checked) => {
          let newValues = [...selectedValues];
          
          if (checked) {
            if (!newValues.includes(optionValue)) {
              newValues.push(optionValue);
            }
          } else {
            newValues = newValues.filter(v => v !== optionValue);
          }
          
          // בדיקת מגבלת כמות הערכים
          if (question.howManyValues && newValues.length > question.howManyValues) {
            newValues = newValues.slice(0, question.howManyValues);
          }
          
          handleValueChange(newValues.join(', '));
        };

        return (
          <OptionContainer>
            <FormControl component="fieldset" error={!!error} fullWidth>
              <FormGroup>
                {possibleValues.map((option, index) => (
                  <Fade in={true} timeout={300 + (index * 100)} key={option}>
                    <OptionItem
                      control={
                        <Checkbox
                          checked={selectedValues.includes(option)}
                          onChange={(e) => handleCheckboxChange(option, e.target.checked)}
                          disabled={readOnly}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body1" fontWeight="medium">
                          {option}
                        </Typography>
                      }
                    />
                  </Fade>
                ))}
                {question.hasOther && (
                  <Fade in={true} timeout={300 + (possibleValues.length * 100)}>
                    <OptionItem
                      control={
                        <Checkbox
                          checked={selectedValues.includes('אחר')}
                          onChange={(e) => handleCheckboxChange('אחר', e.target.checked)}
                          disabled={readOnly}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body1" fontWeight="medium">
                          אחר
                        </Typography>
                      }
                    />
                  </Fade>
                )}
              </FormGroup>
              {question.howManyValues && (
                <FormHelperText>
                  ניתן לבחור עד {question.howManyValues} אפשרויות
                </FormHelperText>
              )}
              {error && <FormHelperText>{error}</FormHelperText>}
            </FormControl>
          </OptionContainer>
        );

      case 'select':
      case 'dropdown':
        return (
          <StyledFormControl fullWidth error={!!error} variant="outlined">
            <InputLabel>בחר אפשרות</InputLabel>
            <Select
              value={value || ''}
              onChange={(e) => handleValueChange(e.target.value)}
              onBlur={onBlur}
              label="בחר אפשרות"
              disabled={readOnly}
            >
              <MenuItem value="">
                <em>בחר אפשרות</em>
              </MenuItem>
              {possibleValues.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
              {question.hasOther && (
                <MenuItem value="אחר">אחר</MenuItem>
              )}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </StyledFormControl>
        );

      case 'switch':
        return (
          <Box sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={value === 'true' || value === true}
                  onChange={(e) => handleValueChange(e.target.checked.toString())}
                  disabled={readOnly}
                  color="primary"
                />
              }
              label={
                <Typography variant="body1" fontWeight="medium">
                  {value === 'true' || value === true ? 'כן' : 'לא'}
                </Typography>
              }
            />
          </Box>
        );

      default:
        return (
          <StyledTextField
            fullWidth
            value={value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            onBlur={onBlur}
            error={!!error}
            helperText={error}
            placeholder={`הזן ${question.questionText}`}
            disabled={readOnly}
            variant="outlined"
          />
        );
    }
  };

  return (
    <Zoom in={!isAnimating} timeout={300}>
      <QuestionCard 
        required={question.isMandatory} 
        questiontype={question.questionType}
        elevation={0}
      >
        <CardContent sx={{ p: 3 }}>
          <QuestionHeader>
            <QuestionTypeIcon questiontype={question.questionType}>
              {getQuestionTypeIcon()}
            </QuestionTypeIcon>
            
            <QuestionText>
              {question.questionText}
            </QuestionText>
            
            {question.isMandatory && (
              <RequiredBadge 
                icon={<RequiredIcon />}
                label="חובה"
                size="small"
              />
            )}
          </QuestionHeader>

          {renderQuestionInput()}

          {/* הצגת שגיאות */}
          {error && (
            <Fade in={true} timeout={200}>
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            </Fade>
          )}

          {/* שדה "אחר" */}
          {question.hasOther && (showOther || (value === 'אחר' || value?.includes?.('אחר'))) && (
            <Fade in={true} timeout={300}>
              <OtherField>
                <StyledTextField
                  fullWidth
                  label="פרט:"
                  value={otherValue || ''}
                  onChange={(e) => onChange(value, e.target.value)}
                  disabled={readOnly}
                  placeholder="הזן פירוט נוסף..."
                  size="small"
                  variant="outlined"
                />
              </OtherField>
            </Fade>
          )}
        </CardContent>
      </QuestionCard>
    </Zoom>
  );
};

export default QuestionRenderer;