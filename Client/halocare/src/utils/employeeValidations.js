const Validations = (name, value, extraParams = {}) => {
  // ביטויים רגולריים לבדיקות
  const hebrewLettersRegex = /^[\u0590-\u05FF\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(?:(?:\+|00)972[-\s]?|0)(?:[23489]|5[0-9]|77)[-\s]?\d{7}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  // const licenseRegex = /^\d{5,10}$/;

  const birthDate = new Date(value);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
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
      return value.length < 2 ? "שם חייב להכיל לפחות 2 תווים" : hebrewLettersRegex.test(value)? "" : "יש להזין שם בעברית בלבד";
          
    case "email":
      if (!emailRegex.test(value)) {
        return "כתובת אימייל אינה תקינה";
      }
      
      // בדיקה אם האימייל כבר קיים
      if (extraParams.existingEmails && extraParams.existingEmails.includes(value)) {
        return "כתובת אימייל זו כבר קיימת במערכת";
      }
      
      return "";
        
    case "mobilePhone":
      return !phoneRegex.test(value)
        ? "מספר טלפון אינו תקין"
        : "";
        
    case "password":
      return !passwordRegex.test(value) 
        ? "הסיסמה חייבת להכיל לפחות 6 תווים, אות גדולה, אות קטנה ומספר" 
        : "";

    case "roleName":
      return value ? "" : "יש לבחור תפקיד";
      
    case "cityName":
      return value ? "" : "יש לבחור עיר";
      
    case "birthDate":
      if (!value) return "";
      

      // אם עוד לא הגיע החודש של יום ההולדת, או אם הוא באותו חודש אבל עוד לא הגיע היום, מחסירים שנה
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        if (age - 1 < 18) {
          return "העובד חייב להיות מעל גיל 18";
        }
      } else {
        if (age < 18) {
          return "העובד חייב להיות מעל גיל 18";
        }
      }
      
      return "";

    default:
      return "";
  }
};

export default Validations;