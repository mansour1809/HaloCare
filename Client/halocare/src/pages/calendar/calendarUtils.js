

// // הגדרת צבעים לסוגי אירועים שונים
// export const eventColors = {
//   'טיפול פיזיותרפיה': '#F4A261', // כתום
//   'טיפול רגשי': '#E76F51', // אדום-כתום
//   'טיפול בעיסוק': '#2A9D8F', // טורקיז
//   'פגישת הורים': '#E9C46A', // צהוב
//   'מפגש קבוצתי': '#8AB17D', // ירוק
//   'ביקור בית': '#9E86C8', // סגול
//   'אחר': '#6C757D' // אפור
// };


// פורמט תאריך עברי
export const formatHebrewDate = (date) => {
  if (!date) return '';
  
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleDateString('he-IL', options);
};

// המרת תאריך ל-ISO string ללא ה-timezone
export const toISOStringWithoutTimezone = (date) => {
  if (!date) return '';
  
  const dt = new Date(date);
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
  return dt.toISOString().slice(0, 16);
};

// בדיקה אם שני תאריכים הם באותו יום
export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// חישוב משך זמן בין שני תאריכים בדקות
export const getDurationInMinutes = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return Math.round((end - start) / 60000);
};

// המרת דקות למחרוזת שעות + דקות
export const formatDuration = (minutes) => {
  if (!minutes) return '';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} דקות`;
  } else if (mins === 0) {
    return `${hours} ${hours === 1 ? 'שעה' : 'שעות'}`;
  } else {
    return `${hours} ${hours === 1 ? 'שעה' : 'שעות'} ו-${mins} דקות`;
  }
};

// חישוב תאריך סיום לפי תאריך התחלה ומשך בדקות
export const calculateEndTime = (startDate, durationMinutes) => {
  if (!startDate || !durationMinutes) return '';
  
  const start = new Date(startDate);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationMinutes);
  
  return end.toISOString();
};