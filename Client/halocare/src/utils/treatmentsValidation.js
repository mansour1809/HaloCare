// src/utils/TreatmentValidations.js
const TreatmentValidations = (fieldName, value, extraParams = {}) => {
// Regular expressions for testing if necessary    // const hebrewLettersRegex = /^[\u0590-\u05FF\s,.!?()-]+$/;
    
   // Check if the value is empty
    if (value === null || value === undefined || value === '') {
      // If field is required and empty, return an error
      if (extraParams.required) {
        return `שדה ${fieldName} הוא שדה חובה`;
      }
     // Otherwise, if empty and not required, OK
      return '';
    }
    const selectedDate = new Date(value);
    const today = new Date();
// Tests by field type
    switch (fieldName) {
      case "treatmentType":
        return value ? "" : "יש לבחור סוג טיפול";
        
      case "treatmentDate":
        // Checking the validity of the date
        
        
        // The date cannot be in the future
        if (selectedDate > today) {
          return "תאריך הטיפול לא יכול להיות בעתיד";
        }
        
// If there is a minimum date restriction (say no more than six months back)
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
        // If not required, and the value is empty, then OK
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