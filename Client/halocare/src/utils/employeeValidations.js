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
  // Check if the value is empty
  if (value === null || value === undefined || value === '') {
   // If field is required and empty, return an error
    if (extraParams.required) {
      return `שדה ${name} הוא שדה חובה`;
    }
    // Otherwise, if empty and not required, OK
    return '';
  }
  
  // Tests by field type
  switch (name) {
    case "firstName":
    case "lastName":
      return value.length < 2 ? "שם חייב להכיל לפחות 2 תווים" : hebrewLettersRegex.test(value)? "" : "יש להזין שם בעברית בלבד";
          
    case "email":
      if (!emailRegex.test(value)) {
        return "כתובת אימייל אינה תקינה";
      }
      
      // Check if the email already exists
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
      

// If the month of the birthday has not yet arrived, or if it is in the same month but the day has not yet arrived, subtract a year
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