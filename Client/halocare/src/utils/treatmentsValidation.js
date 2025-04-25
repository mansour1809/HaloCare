// src/utils/TreatmentValidations.js
const TreatmentValidations = (fieldName, value, extraParams = {}) => {
    // ביטויים רגולריים לבדיקות אם יהיו צורך
    // const hebrewLettersRegex = /^[\u0590-\u05FF\s,.!?()-]+$/;
    
    // בדיקה אם הערך ריק
    if (value === null || value === undefined || value === '') {
      // אם שדה חובה וריק, החזר שגיאה
      if (extraParams.required) {
        return `שדה ${fieldName} הוא שדה חובה`;
      }
      // אחרת, אם ריק ולא חובה, תקין
      return '';
    }
    const selectedDate = new Date(value);
    const today = new Date();
    // בדיקות לפי סוג השדה
    switch (fieldName) {
      case "treatmentType":
        return value ? "" : "יש לבחור סוג טיפול";
        
      case "treatmentDate":
        // בדיקת תקינות התאריך
        
        
        // התאריך לא יכול להיות בעתיד
        if (selectedDate > today) {
          return "תאריך הטיפול לא יכול להיות בעתיד";
        }
        
        // אם יש הגבלה על תאריך מינימלי (נניח לא יותר מחצי שנה לאחור)
        if (extraParams.minDate) {
          const minDate = new Date(extraParams.minDate);
          if (selectedDate < minDate) {
            return "לא ניתן להזין טיפולים מלפני יותר מחצי שנה";
          }
        }
        
        return "";
        
      case "description":
        if (value.trim().length < 10) {
          return "תיאור הטיפול חייב להכיל לפחות 10 תווים";
        }
        
        if (value.trim().length > 1000) {
          return "תיאור הטיפול ארוך מדי (מקסימום 1000 תווים)";
        }
   
        return "";
        
      case "highlight":
        // אם לא חובה, והערך ריק, אז תקין
        if (!extraParams.required && (!value || value.trim() === '')) {
          return '';
        }
        
        if (value.trim().length > 200) {
          return "נקודות חשובות ארוכות מדי (מקסימום 200 תווים)";
        }
        
        return "";
        
        
      default:
        return "";
    }
  };
  
  export default TreatmentValidations;