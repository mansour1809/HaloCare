// src/utils/validationUtils.js

/**
 * ספריית ולידציות לטפסים שונים במערכת
 * הספרייה תומכת בסוגי ולידציות שונים ומאפשרת הרחבה קלה
 */

// טיפוסי ולידציה תומכים
export const VALIDATION_TYPES = {
    REQUIRED: 'required',
    EMAIL: 'email',
    PHONE: 'phone',
    PASSWORD: 'password',
    LETTERS_ONLY: 'lettersOnly',
    NUMBERS_ONLY: 'numbersOnly',
    HEBREW_ONLY: 'hebrewOnly',
    MIN_LENGTH: 'minLength',
    MAX_LENGTH: 'maxLength',
    ID_NUMBER: 'idNumber',
    LICENSE_NUM: 'licenseNum',
    MATCH_FIELD: 'matchField',
  };
  
  /**
   * פונקציה לבדיקת ערך לפי סוג ולידציה
   * @param {string} type - סוג הולידציה
   * @param {any} value - הערך לבדיקה
   * @param {object} options - אפשרויות נוספות לבדיקה
   * @returns {boolean} - האם הערך תקין
   */
  export const validateField = (type, value, options = {}) => {
    // אם הערך ריק ולא חובה, אז הוא תקין
    if ((value === null || value === undefined || value === '') && type !== VALIDATION_TYPES.REQUIRED) {
      return true;
    }
  
    // ביצוע ולידציה לפי סוג
    switch (type) {
      case VALIDATION_TYPES.REQUIRED:
        return value !== null && value !== undefined && value !== '';
  
      case VALIDATION_TYPES.EMAIL:
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  
      case VALIDATION_TYPES.PHONE:
        // מקבל מספרי טלפון ישראליים במבנים שונים
        return /^(?:(?:\+|00)972[-\s]?|0)(?:[23489]|5[0-9]|77)[-\s]?\d{7}$/.test(value);
  
      case VALIDATION_TYPES.PASSWORD:
        // מינימום 6 תווים, לפחות אות גדולה אחת, אות קטנה אחת ומספר אחד
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(value);
  
      case VALIDATION_TYPES.LETTERS_ONLY:
        return /^[a-zA-Z\s]+$/.test(value);
  
      case VALIDATION_TYPES.NUMBERS_ONLY:
        return /^\d+$/.test(value);
      
      case VALIDATION_TYPES.HEBREW_ONLY:
        return /^[\u0590-\u05FF\s]+$/.test(value);
  
      case VALIDATION_TYPES.MIN_LENGTH:
        return value.length >= options.length;
  
      case VALIDATION_TYPES.MAX_LENGTH:
        return value.length <= options.length;
  
      case VALIDATION_TYPES.ID_NUMBER:
        // ולידציה למספר זהות ישראלי (9 ספרות עם ביקורת)
        if (!/^\d{9}$/.test(value)) return false;
        
        // חישוב ספרת ביקורת
        const id = value.toString();
        let sum = 0;
        
        for (let i = 0; i < 9; i++) {
          let digit = parseInt(id.charAt(i));
          if (i % 2 === 0) {
            digit *= 1;
          } else {
            digit *= 2;
            if (digit > 9) {
              digit = digit % 10 + Math.floor(digit / 10);
            }
          }
          sum += digit;
        }
        
        return sum % 10 === 0;
  
      case VALIDATION_TYPES.MATCH_FIELD:
        return value === options.matchValue;
  
      default:
        // במקרה של סוג לא מוכר, נחזיר אמת כברירת מחדל
        return true;
    }
  };
  
  /**
   * פונקציית עזר לולידציה של אובייקט שלם
   * @param {object} values - אובייקט הערכים לבדיקה
   * @param {object} validationRules - חוקי הולידציה
   * @returns {object} - אובייקט השגיאות
   */
  export const validateForm = (values, validationRules) => {
    const errors = {};
  
    // עוברים על כל השדות בחוקי הולידציה
    Object.keys(validationRules).forEach(fieldName => {
      const fieldRules = validationRules[fieldName];
      const fieldValue = values[fieldName];
  
      // עוברים על כל חוקי הולידציה של השדה
      for (const rule of fieldRules) {
        const { type, message, options } = rule;
        
        // אם הולידציה נכשלה, מוסיפים הודעת שגיאה
        if (!validateField(type, fieldValue, options)) {
          errors[fieldName] = message;
          break;
        }
      }
    });
  
    return errors;
  };
  
  /**
   * הגדרת חוקי ולידציה לטופס עובד
   */
  export const employeeValidationRules = {
    firstName: [
      { type: VALIDATION_TYPES.REQUIRED, message: 'שם פרטי הוא שדה חובה' },
      { type: VALIDATION_TYPES.MIN_LENGTH, options: { length: 2 }, message: 'שם פרטי חייב להכיל לפחות 2 תווים ללא מספרים' }
    ],
    lastName: [
      { type: VALIDATION_TYPES.REQUIRED, message: 'שם משפחה הוא שדה חובה' },
      { type: VALIDATION_TYPES.MIN_LENGTH, options: { length: 2 }, message: 'שם משפחה חייב להכיל לפחות 2 תווים ללא מספרים' }
    ],
    email: [
      { type: VALIDATION_TYPES.EMAIL, message: 'כתובת אימייל אינה תקינה' }
    ],
    mobilePhone: [
      { type: VALIDATION_TYPES.PHONE, message: 'מספר טלפון אינו תקין' }
    ],
    licenseNum: [
      { type: VALIDATION_TYPES.LICENSE_NUM, message: 'מספר רישיון אינו תקין' }
    ],
    password: [
      { type: VALIDATION_TYPES.REQUIRED, message: 'סיסמה היא שדה חובה' },
      { type: VALIDATION_TYPES.MIN_LENGTH, options: { length: 6 }, message: 'סיסמה חייבת להכיל לפחות 6 תווים כולל אותיות באנגלית' }
    ],
    roleName: [
      { type: VALIDATION_TYPES.REQUIRED, message: 'תפקיד הוא שדה חובה' }
    ]
  };