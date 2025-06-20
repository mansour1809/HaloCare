// src/pages/kids/QuestionRenderer.jsx - בסטייל טופס נייר קלאסי
import React, { useState } from 'react';
import {
  TextField, FormControl, FormLabel, RadioGroup, FormControlLabel,
  Radio, Checkbox, FormGroup, Select, MenuItem, InputLabel,
  FormHelperText, Typography, Box, Stack, useTheme
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled } from '@mui/material/styles';
import DigitalSignature from '../addKid/DigitalSignature';

// 🎨 עיצוב טופס נייר קלאסי
const QuestionRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  minHeight: '40px',
  paddingBottom: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  gap: theme.spacing(2),
  '&:last-child': {
    borderBottom: 'none',
    marginBottom: 0
  }
}));

const QuestionNumber = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.text.primary,
  minWidth: '30px',
  fontSize: '1rem'
}));

const QuestionText = styled(Typography)(({ theme }) => ({
  flex: 1,
  fontSize: '0.95rem',
  fontWeight: 500,
  color: theme.palette.text.primary,
  lineHeight: 1.4
}));

const RequiredMark = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
  fontWeight: 'bold',
  marginLeft: theme.spacing(0.5)
}));

// 🎨 שדה תשובה בסטייל נייר
const AnswerField = styled(Box)(({ theme }) => ({
  minWidth: '300px',
  '& .MuiTextField-root': {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'transparent',
      '& fieldset': {
        borderColor: theme.palette.divider,
        borderWidth: '1px'
      },
      '&:hover fieldset': {
        borderColor: theme.palette.primary.main
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px'
      }
    }
  }
}));

// 🎨 אפשרויות בסגנון נייר
const OptionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  alignItems: 'center'
}));

const OptionItem = styled(FormControlLabel)(({ theme }) => ({
  margin: 0,
  '& .MuiFormControlLabel-label': {
    fontSize: '0.9rem',
    color: theme.palette.text.primary
  }
}));

const UnderlineField = styled(Box)(({ theme, width = '200px' }) => ({
  borderBottom: `1px solid ${theme.palette.text.primary}`,
  minWidth: width,
  height: '24px',
  marginRight: theme.spacing(1),
  marginLeft: theme.spacing(1),
  position: 'relative',
  '& input': {
    border: 'none',
    outline: 'none',
    width: '100%',
    background: 'transparent',
    padding: '2px 4px',
    fontSize: '0.9rem'
  }
}));

const QuestionRenderer = ({
  question,
  value,
  otherValue,
  error,
  onChange,
  onBlur,
  readOnly = false,
  questionIndex = 1
}) => {
  const theme = useTheme();
  const [showOther, setShowOther] = useState(false);

  const possibleValues = question.possibleValues ? 
    question.possibleValues.split(',').map(val => val.trim()) : [];

  const handleValueChange = (newValue, newOtherValue = null) => {
    onChange(newValue, newOtherValue);
    
    if (question.hasOther && (newValue === 'אחר' || newValue?.includes?.('אחר'))) {
      setShowOther(true);
    } else {
      setShowOther(false);
    }
  };

  // 🎨 רנדור שדות טקסט פשוטים
  const renderSimpleField = () => {
    const isEmail = question.questionType === 'email';
    const isPhone = question.questionType === 'phone';
    const isNumber = question.questionType === 'number';
    const isTextArea = question.questionType === 'textArea';

    return (
      <AnswerField>
        <TextField
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
          onBlur={onBlur}
          error={!!error}
          helperText={error}
          disabled={readOnly}
          size="small"
          variant="outlined"
          multiline={isTextArea}
          rows={isTextArea ? 3 : 1}
          type={isEmail ? 'email' : isPhone ? 'tel' : isNumber ? 'number' : 'text'}
          placeholder={
            isEmail ? 'example@mail.com' : 
            isPhone ? '05X-XXXXXXX' : 
            isNumber ? 'הזן מספר' : 
            'הזן תשובה'
          }
          sx={{ minWidth: isTextArea ? '400px' : '250px' }}
        />
      </AnswerField>
    );
  };

  // 🎨 רנדור תאריך
  const renderDateField = () => (
    <AnswerField>
      <DatePicker
        value={value ? new Date(value) : null}
        onChange={(newDate) => handleValueChange(newDate?.toISOString())}
        disabled={readOnly}
        slotProps={{
          textField: {
            size: 'small',
            error: !!error,
            helperText: error,
            sx: { minWidth: '200px' }
          }
        }}
      />
    </AnswerField>
  );

  // 🎨 רנדור כן/לא בסגנון נייר
  const renderYesNoField = () => (
    <OptionsContainer>
      <OptionItem
        control={
          <Radio
            checked={value === 'כן'}
            onChange={() => !readOnly && handleValueChange('כן')}
            size="small"
          />
        }
        label="כן"
      />
      <OptionItem
        control={
          <Radio
            checked={value === 'לא'}
            onChange={() => !readOnly && handleValueChange('לא')}
            size="small"
          />
        }
        label="לא"
      />
      {error && (
        <FormHelperText error sx={{ mt: 0, mr: 2 }}>
          {error}
        </FormHelperText>
      )}
    </OptionsContainer>
  );

  // 🎨 רנדור רדיו בסגנון נייר
  const renderRadioField = () => (
    <Box>
      <OptionsContainer>
        {possibleValues.map((option, index) => (
          <OptionItem
            key={index}
            control={
              <Radio
                checked={value === option}
                onChange={() => !readOnly && handleValueChange(option)}
                size="small"
              />
            }
            label={option}
          />
        ))}
        {question.hasOther && (
          <OptionItem
            control={
              <Radio
                checked={value === 'אחר'}
                onChange={() => !readOnly && handleValueChange('אחר')}
                size="small"
              />
            }
            label="אחר"
          />
        )}
      </OptionsContainer>
      {error && (
        <FormHelperText error sx={{ mt: 1 }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );

  // 🎨 רנדור צ'קבוקס בסגנון נייר
  const renderCheckboxField = () => {
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
      
      if (question.howManyValues && newValues.length > question.howManyValues) {
        newValues = newValues.slice(0, question.howManyValues);
      }
      
      handleValueChange(newValues.join(', '));
    };

    return (
      <Box>
        <OptionsContainer>
          {possibleValues.map((option, index) => (
            <OptionItem
              key={index}
              control={
                <Checkbox
                  checked={selectedValues.includes(option)}
                  onChange={(e) => !readOnly && handleCheckboxChange(option, e.target.checked)}
                  size="small"
                />
              }
              label={option}
            />
          ))}
          {question.hasOther && (
            <OptionItem
              control={
                <Checkbox
                  checked={selectedValues.includes('אחר')}
                  onChange={(e) => !readOnly && handleCheckboxChange('אחר', e.target.checked)}
                  size="small"
                />
              }
              label="אחר"
            />
          )}
        </OptionsContainer>
        
        {question.howManyValues && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            (ניתן לבחור עד {question.howManyValues} אפשרויות)
          </Typography>
        )}
        {error && (
          <FormHelperText error sx={{ mt: 1 }}>
            {error}
          </FormHelperText>
        )}
      </Box>
    );
  };

  // 🎨 רנדור דרופ-דאון
  const renderSelectField = () => (
    <AnswerField>
      <FormControl size="small" sx={{ minWidth: 200 }} error={!!error}>
        <Select
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
          onBlur={onBlur}
          disabled={readOnly}
          displayEmpty
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
    </AnswerField>
  );

  // 🎨 בחירת רנדור לפי סוג השאלה
  const renderQuestionInput = () => {
    switch (question.questionType) {
      case 'text':
      case 'textArea':
      case 'email':
      case 'phone':
      case 'number':
        return renderSimpleField();
      
      case 'date':
        return renderDateField();
      
      case 'boolean':
      case 'yesNo':
        return renderYesNoField();
        
      case 'signature':
      case 'digitalSignature':
        return (
          <AnswerField>
            <DigitalSignature
              value={value}
              onChange={(signatureData) => onChange(signatureData)}
              readOnly={readOnly}
              required={question.isMandatory}
              label=""
            />
          </AnswerField>
        );
      
      case 'radio':
      case 'singleChoice':
        return renderRadioField();
      
      case 'checkbox':
      case 'multiChoice':
        return renderCheckboxField();
      
      case 'select':
      case 'dropdown':
        return renderSelectField();
      
      default:
        return renderSimpleField();
    }
  };

  return (
    <QuestionRow>
      <QuestionNumber>{question.questionNo}.</QuestionNumber>
      
      <QuestionText>
        {question.questionText}
        {question.isMandatory && <RequiredMark>*</RequiredMark>}
      </QuestionText>

      {renderQuestionInput()}

      {/* שדה "אחר" */}
      {question.hasOther && (showOther || (value === 'אחר' || value?.includes?.('אחר'))) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
          <Typography variant="body2">פרט:</Typography>
          <UnderlineField width="150px">
            <input
              type="text"
              value={otherValue || ''}
              onChange={(e) => onChange(value, e.target.value)}
              disabled={readOnly}
              placeholder="הזן פירוט..."
            />
          </UnderlineField>
        </Box>
      )}
    </QuestionRow>
  );
};

export default QuestionRenderer;