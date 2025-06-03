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

// עיצוב מותאם לשאלה
const QuestionContainer = styled(Paper)(({ theme, required }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: required ? `2px solid ${theme.palette.warning.light}` : `1px solid ${theme.palette.divider}`,
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.light,
  },
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
  }
}));

const QuestionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

const QuestionText = styled(Typography)(({ theme, required }) => ({
  fontWeight: 600,
  color: required ? theme.palette.text.primary : theme.palette.text.secondary,
  fontSize: '1.1rem',
  lineHeight: 1.4,
}));

const RequiredChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.75rem',
  height: 20,
  '& .MuiChip-label': {
    padding: '0 6px',
  }
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
      <QuestionHeader>
        <Box sx={{ flexGrow: 1 }}>
          <QuestionText required={question.isMandatory}>
            {question.questionText}
          </QuestionText>
          {question.category && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              קטגוריה: {question.category}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {question.isMandatory && (
            <RequiredChip 
              label="חובה" 
              color="warning" 
              size="small" 
              variant="filled"
            />
          )}
          {question.questionType && (
            <Tooltip title={`סוג שאלה: ${question.questionType}`}>
              <RequiredChip 
                label={question.questionType} 
                color="info" 
                size="small" 
                variant="outlined"
              />
            </Tooltip>
          )}
        </Box>
      </QuestionHeader>

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