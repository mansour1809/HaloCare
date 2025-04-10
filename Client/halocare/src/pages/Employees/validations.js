
const Validations = (name, value, extraParams = {}) => {
  // ביטויים רגולריים לבדיקות
  const hebrewLettersRegex = /^[\u0590-\u05FF\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(?:(?:\+|00)972[-\s]?|0)(?:[23489]|5[0-9]|77)[-\s]?\d{7}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  const licenseRegex = /^\d{5,10}$/;
  
  // בדיקה אם הערך ריק
  if (value === null || value === undefined || value === '') {
    // אם שדה חובה וריק, החזר שגיאה
    if (extraParams.required) {
      return `שדה ${name} הוא שדה חובה`;
    }
    // אחרת, אם ריק ולא חובה, תקין
    return '';
  }
  
  // בדיקות לפי סוג השדה
  switch (name) {
    case "firstName":
    case "lastName":
      return value.length < 2 
        ? "שם חייב להכיל לפחות 2 תווים" 
        : hebrewLettersRegex.test(value) 
          ? "" 
          : "יש להזין שם בעברית בלבד";
          
    case "email":
      return !emailRegex.test(value)
        ? "כתובת אימייל אינה תקינה"
        : "";
        
    case "mobilePhone":
      return !phoneRegex.test(value)
        ? "מספר טלפון אינו תקין"
        : "";
        
    case "password":
      return !passwordRegex.test(value) 
        ? "הסיסמה חייבת להכיל לפחות 6 תווים, אות גדולה, אות קטנה ומספר" 
        : "";
        
    case "confirmPassword":
      return extraParams.password === value 
        ? "" 
        : "הסיסמאות אינן זהות";
        
    case "licenseNum":
      return !licenseRegex.test(value)
        ? "מספר רישיון אינו תקין"
        : "";
        
    case "roleName":
      return value ? "" : "יש לבחור תפקיד";
      
    case "cityName":
      return value ? "" : "יש לבחור עיר";
        
    // אפשר להוסיף בדיקות נוספות כאן...
        
    default:
      return "";
  }
};

export default Validations;