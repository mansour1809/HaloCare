// src/components/common/HebrewReactDatePicker.jsx
import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { he } from 'date-fns/locale';
import { TextField, styled, alpha } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import dayjs from 'dayjs'; // ייבוא dayjs

// CSS של react-datepicker - חובה לייבא!
import 'react-datepicker/dist/react-datepicker.css';

// רישום השפה העברית
registerLocale('he', he);

// Custom CSS עם styled-components לעיצוב מותאם
const DatePickerWrapper = styled('div')(({ theme }) => ({
  '& .react-datepicker-wrapper': {
    width: '100%',
    position: 'relative',
  },
  '& .react-datepicker__input-container': {
    width: '100%',
  },
  // עיצוב הלוח עצמו
  '& .react-datepicker': {
    fontFamily: 'Rubik, Heebo, Arial, sans-serif',
    border: 'none',
    borderRadius: 20,
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    padding: theme.spacing(2),
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    fontSize: '1rem',
  },
  // כותרת החודש
  '& .react-datepicker__header': {
    background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
    borderBottom: 'none',
    borderRadius: '16px 16px 0 0',
    padding: theme.spacing(2),
    marginTop: -theme.spacing(2),
    marginLeft: -theme.spacing(2),
    marginRight: -theme.spacing(2),
  },
  '& .react-datepicker__current-month': {
    color: 'white',
    fontWeight: 700,
    fontSize: '1.2rem',
    marginBottom: theme.spacing(1),
  },
  // ימי השבוע
  '& .react-datepicker__day-names': {
    marginTop: theme.spacing(1),
  },
  '& .react-datepicker__day-name': {
    color: 'white',
    fontWeight: 600,
    width: 36,
    lineHeight: '36px',
    margin: '0 2px',
  },
  // הימים
  '& .react-datepicker__day': {
    width: 36,
    height: 36,
    lineHeight: '36px',
    margin: '2px',
    borderRadius: 10,
    transition: 'all 0.2s ease',
    fontWeight: 500,
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.2),
      transform: 'scale(1.1)',
    },
  },
  '& .react-datepicker__day--selected': {
    background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
    color: 'white',
    fontWeight: 700,
    '&:hover': {
      background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
    },
  },
  '& .react-datepicker__day--today': {
    background: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    fontWeight: 700,
    border: `2px solid ${theme.palette.primary.main}`,
  },
  '& .react-datepicker__day--outside-month': {
    color: theme.palette.text.disabled,
    opacity: 0.5,
  },
  '& .react-datepicker__day--disabled': {
    color: theme.palette.text.disabled,
    opacity: 0.3,
    cursor: 'not-allowed',
    '&:hover': {
      background: 'transparent',
      transform: 'none',
    },
  },
  // חיצי ניווט
  '& .react-datepicker__navigation': {
    marginLeft: theme.spacing(2),
    top: theme.spacing(3.5),
  },
  '& .react-datepicker__navigation--previous': {
    left: theme.spacing(6),
    borderRightColor: 'white',
    '&:hover': {
      borderRightColor: 'white',
    },
  },
  '& .react-datepicker__navigation--next': {
    right: theme.spacing(6),
    borderLeftColor: 'white',
    '&:hover': {
      borderLeftColor: 'white',
    },
  },
  // שנה וחודש dropdowns
  '& .react-datepicker__year-dropdown-container': {
    marginLeft: theme.spacing(1),
  },
  '& .react-datepicker__month-dropdown-container': {
    marginRight: theme.spacing(1),
  },
  '& .react-datepicker__month-select, & .react-datepicker__year-select': {
    padding: '4px 8px',
    borderRadius: 8,
    border: '1px solid white',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'rgba(47, 114, 118, 1)',
    fontWeight: 600,
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.3)',
    },
  },
  // Time picker אם צריך
  '& .react-datepicker-time__header': {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  '& .react-datepicker__time-list-item': {
    transition: 'all 0.2s ease',
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.1),
    },
    '&--selected': {
      background: `${theme.palette.primary.main} !important`,
      color: 'white !important',
      fontWeight: 700,
    },
  },
}));

// Custom Input Component
const CustomInput = styled(TextField)(({ theme }) => ({
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
  },
  '& input': {
    textAlign: 'center',
    fontFamily: 'Rubik, Heebo, Arial, sans-serif',
    fontSize: '1rem',
    letterSpacing: '0.5px',
    cursor: 'pointer',
  }
}));

/**
 * HebrewReactDatePicker - קומפוננטת תאריך עם react-datepicker ותמיכה מלאה בעברית
 */
const HebrewReactDatePicker = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  required = false,
  fullWidth = true,
  helperText,
  error = false,
  placeholder = "בחר תאריך",
  showTimeSelect = false,
  showYearDropdown = true,
  showMonthDropdown = true,
  dropdownMode = "select",
  dateFormat = "dd/MM/yyyy",
  timeFormat = "HH:mm",
  ...otherProps
}) => {
  
  // המרה מ-dayjs ל-Date אם צריך
  const dateValue = value ? (value.toDate ? value.toDate() : value instanceof Date ? value : new Date(value)) : null;
  const minDateValue = minDate ? (minDate.toDate ? minDate.toDate() : minDate instanceof Date ? minDate : new Date(minDate)) : undefined;
  const maxDateValue = maxDate ? (maxDate.toDate ? maxDate.toDate() : maxDate instanceof Date ? maxDate : new Date(maxDate)) : undefined;

  // פונקציית onChange מותאמת - תמיד מחזירה dayjs object
  const handleChange = (date) => {
    if (!date) {
      onChange(null);
      return;
    }
    
    // תמיד מחזירים dayjs object
    onChange(dayjs(date));
  };

  return (
    <DatePickerWrapper>
      <DatePicker
        selected={dateValue}
        onChange={handleChange}
        locale="he"
        dateFormat={showTimeSelect ? `${dateFormat} ${timeFormat}` : dateFormat}
        minDate={minDateValue}
        maxDate={maxDateValue}
        disabled={disabled}
        placeholderText={placeholder}
        showTimeSelect={showTimeSelect}
        timeFormat={timeFormat}
        timeIntervals={15}
        showYearDropdown={showYearDropdown}
        showMonthDropdown={showMonthDropdown}
        dropdownMode={dropdownMode}
        yearDropdownItemNumber={20}
        scrollableYearDropdown
        customInput={
          <CustomInput
            withPortal={false}
            inline
            label={label}
            required={required}
            fullWidth={fullWidth}
            error={error}
            helperText={helperText}
            InputProps={{
              endAdornment: (
                <CalendarTodayIcon 
                  sx={{ 
                    color: 'action.active',
                    cursor: 'pointer',
                    mr: -1
                  }} 
                />
              ),
            }}
          />
        }
        // popperPlacement="bottom"
        // popperModifiers={[
        //   {
        //     name: 'offset',
        //     options: {
        //       offset: [10, 4],
        //     },
        //   },
        // ]}
        {...otherProps}
      />
    </DatePickerWrapper>
  );
};

export default HebrewReactDatePicker;

/**
 * דוגמאות שימוש:
 * 
 * import HebrewReactDatePicker from './components/common/HebrewReactDatePicker';
 * import dayjs from 'dayjs';
 * 
 * 1. שימוש בסיסי:
 * <HebrewReactDatePicker
 *   label="תאריך לידה"
 *   value={birthDate}
 *   onChange={(newDate) => setBirthDate(newDate)}
 * />
 * 
 * 2. עם הגבלות תאריך:
 * <HebrewReactDatePicker
 *   label="תאריך התחלה"
 *   value={startDate}
 *   onChange={(newDate) => setStartDate(newDate)}
 *   minDate={dayjs().subtract(1, 'year')}
 *   maxDate={dayjs()}
 *   helperText="בחר תאריך מהשנה האחרונה"
 * />
 * 
 * 3. עם בחירת שעה:
 * <HebrewReactDatePicker
 *   label="תאריך ושעה"
 *   value={dateTime}
 *   onChange={(newDateTime) => setDateTime(newDateTime)}
 *   showTimeSelect
 *   dateFormat="dd/MM/yyyy"
 *   timeFormat="HH:mm"
 * />
 * 
 * 4. ללא dropdowns:
 * <HebrewReactDatePicker
 *   label="תאריך"
 *   value={date}
 *   onChange={setDate}
 *   showYearDropdown={false}
 *   showMonthDropdown={false}
 * />
 */