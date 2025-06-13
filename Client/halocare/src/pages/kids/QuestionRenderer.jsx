// src/pages/kids/QuestionRenderer.jsx
import React, { useState } from 'react';
import {
  TextField, FormControl, FormLabel, RadioGroup, FormControlLabel,
  Radio, Checkbox, FormGroup, Select, MenuItem, InputLabel,
  FormHelperText, Typography, Box, Paper, Chip, Switch,
  InputAdornment, IconButton, Tooltip
} from '@mui/material';
import {
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Numbers as NumberIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled } from '@mui/material/styles';
import DigitalSignature from '../addKid/DigitalSignature';

// עיצוב מותאם לשאלה - פשוט יותר
const QuestionContainer = styled(Box)(({ theme, required }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  border: required ? `1px solid ${theme.palette.warning.light}` : `1px solid ${theme.palette.grey[300]}`,
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.2s ease',
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 1px ${theme.palette.primary.main}25`,
  }
}));

const QuestionText = styled(Typography)(({ theme, required }) => ({
  fontWeight: 500,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1.5),
  fontSize: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1)
}));

const RequiredIndicator = () => (
  <Typography component="span" sx={{ color: 'error.main', fontWeight: 'bold' }}>
    *
  </Typography>
);

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

  // פיצול הערכים האפשריים (מופרדים בפסיקים)
  const possibleValues = question.possibleValues ? 
    question.possibleValues.split(',').map(val => val.trim()) : [];

  // טיפול בשינוי ערך
  const handleValueChange = (newValue, newOtherValue = null) => {
    onChange(newValue, newOtherValue);
    
    // הצגת שדה "אחר" אם נבחרה האפשרות "אחר"
    if (question.hasOther && (newValue === 'אחר' || newValue?.includes?.('אחר'))) {
      setShowOther(true);
    } else {
      setShowOther(false);
    }
  };

  // רנדור לפי סוג השאלה
  const renderQuestionInput = () => {
    switch (question.questionType) {
      case 'text':
      case 'textArea':
        return (
          <TextField
            fullWidth
            multiline={question.questionType === 'textArea'}
            rows={question.questionType === 'textArea' ? 4 : 1}
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
            onBlur={onBlur}
            error={!!error}
            helperText={error}
            placeholder={`הזן ${question.questionText}`}
            disabled={readOnly}
            InputProps={{
              startAdornment: question.questionType === 'textArea' ? null : (
                <InputAdornment position="start">
                  <InfoIcon color="action" fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        );

      case 'email':
        return (
          <TextField
            fullWidth
            type="email"
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
            onBlur={onBlur}
            error={!!error}
            helperText={error}
            placeholder="example@mail.com"
            disabled={readOnly}
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
          <TextField
            fullWidth
            type="tel"
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
            onBlur={onBlur}
            error={!!error}
            helperText={error}
            placeholder="05X-XXXXXXX"
            disabled={readOnly}
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
          <TextField
            fullWidth
            type="number"
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
            onBlur={onBlur}
            error={!!error}
            helperText={error}
            placeholder="הזן מספר"
            disabled={readOnly}
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
              textField: TextField
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!error,
                helperText: error,
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
          <FormControl component="fieldset" error={!!error}>
            <RadioGroup
              row
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
            >
              <FormControlLabel
                value="כן"
                control={<Radio disabled={readOnly} />}
                label="כן"
              />
              <FormControlLabel
                value="לא"
                control={<Radio disabled={readOnly} />}
                label="לא"
              />
            </RadioGroup>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );
        case 'signature':
    case 'digitalSignature':
      return (
        <DigitalSignature
          value={value}
          onChange={(signatureData) => onChange(signatureData)}
          readOnly={readOnly}
          required={question.isMandatory}
          label={question.questionText}
        />
      );

      case 'radio':
      case 'singleChoice':
        return (
          <FormControl component="fieldset" error={!!error} fullWidth>
            <RadioGroup
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
            >
              {possibleValues.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio disabled={readOnly} />}
                  label={option}
                />
              ))}
              {question.hasOther && (
                <FormControlLabel
                  value="אחר"
                  control={<Radio disabled={readOnly} />}
                  label="אחר"
                />
              )}
            </RadioGroup>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
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
          <FormControl component="fieldset" error={!!error} fullWidth>
            <FormGroup>
              {possibleValues.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={selectedValues.includes(option)}
                      onChange={(e) => handleCheckboxChange(option, e.target.checked)}
                      disabled={readOnly}
                    />
                  }
                  label={option}
                />
              ))}
              {question.hasOther && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedValues.includes('אחר')}
                      onChange={(e) => handleCheckboxChange('אחר', e.target.checked)}
                      disabled={readOnly}
                    />
                  }
                  label="אחר"
                />
              )}
            </FormGroup>
            {question.howManyValues && (
              <FormHelperText>
                ניתן לבחור עד {question.howManyValues} אפשרויות
              </FormHelperText>
            )}
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case 'select':
      case 'dropdown':
        return (
          <FormControl fullWidth error={!!error}>
            <InputLabel>בחר אפשרות</InputLabel>
            <Select
              value={value}
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
          </FormControl>
        );

      case 'switch':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={value === 'true' || value === true}
                onChange={(e) => handleValueChange(e.target.checked.toString())}
                disabled={readOnly}
              />
            }
            label={value === 'true' || value === true ? 'כן' : 'לא'}
          />
        );

      default:
        return (
          <TextField
            fullWidth
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
            onBlur={onBlur}
            error={!!error}
            helperText={error}
            placeholder={`הזן ${question.questionText}`}
            disabled={readOnly}
          />
        );
    }
  };

  return (
    <QuestionContainer required={question.isMandatory}>
      <QuestionText required={question.isMandatory}>
        {question.questionText}
        {question.isMandatory && <RequiredIndicator />}
      </QuestionText>

      {renderQuestionInput()}

      {/* שדה "אחר" */}
      {question.hasOther && (showOther || (value === 'אחר' || value?.includes?.('אחר'))) && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="פרט:"
            value={otherValue || ''}
            onChange={(e) => onChange(value, e.target.value)}
            disabled={readOnly}
            placeholder="הזן פירוט נוסף..."
            size="small"
          />
        </Box>
      )}
    </QuestionContainer>
  );
};

export default QuestionRenderer;