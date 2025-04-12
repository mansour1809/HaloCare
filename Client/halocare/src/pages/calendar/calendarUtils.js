// // פורמט תאריך עברי
// export const formatHebrewDate = (date) => {
//   if (!date) return '';
  
//   const options = { 
//     year: 'numeric', 
//     month: 'long', 
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit'
//   };
  
//   return new Date(date).toLocaleDateString('he-IL', options);
// };

// המרת תאריך ל-ISO string ללא ה-timezone (לשימוש בשדות input מסוג datetime-local)
export const toISOStringWithoutTimezone = (date) => {
  if (!date) return '';
  
  const dt = new Date(date);
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
  return dt.toISOString().slice(0, 16);
};

// // בדיקה אם שני תאריכים הם באותו יום
// export const isSameDay = (date1, date2) => {
//   const d1 = new Date(date1);
//   const d2 = new Date(date2);
  
//   return (
//     d1.getFullYear() === d2.getFullYear() &&
//     d1.getMonth() === d2.getMonth() &&
//     d1.getDate() === d2.getDate()
//   );
// };

// // חישוב משך זמן בין שני תאריכים בדקות
// export const getDurationInMinutes = (startDate, endDate) => {
//   if (!startDate || !endDate) return 0;
  
//   const start = new Date(startDate);
//   const end = new Date(endDate);
  
//   return Math.round((end - start) / 60000);
// };

// // המרת דקות למחרוזת שעות + דקות
// export const formatDuration = (minutes) => {
//   if (!minutes) return '';
  
//   const hours = Math.floor(minutes / 60);
//   const mins = minutes % 60;
  
//   if (hours === 0) {
//     return `${mins} דקות`;
//   } else if (mins === 0) {
//     return `${hours} ${hours === 1 ? 'שעה' : 'שעות'}`;
//   } else {
//     return `${hours} ${hours === 1 ? 'שעה' : 'שעות'} ו-${mins} דקות`;
//   }
// };

// // חישוב תאריך סיום לפי תאריך התחלה ומשך בדקות
// export const calculateEndTime = (startDate, durationMinutes) => {
//   if (!startDate || !durationMinutes) return '';
  
//   const start = new Date(startDate);
//   const end = new Date(start);
//   end.setMinutes(end.getMinutes() + durationMinutes);
  
//   return end.toISOString();
// };

// // פורמט שעה בלבד (HH:MM)
// export const formatTimeOnly = (date) => {
//   if (!date) return '';
  
//   const d = new Date(date);
//   return d.toLocaleTimeString('he-IL', {
//     hour: '2-digit',
//     minute: '2-digit',
//     hour12: false
//   });
// };

// // קבלת מחרוזת תאריך בפורמט יום, תאריך חודש
// export const formatDateShort = (date) => {
//   if (!date) return '';
  
//   const d = new Date(date);
  
//   // שמות ימים בעברית
//   const dayNames = ['יום א\'', 'יום ב\'', 'יום ג\'', 'יום ד\'', 'יום ה\'', 'יום ו\'', 'שבת'];
  
//   return `${dayNames[d.getDay()]}, ${d.getDate()} ב${d.toLocaleString('he-IL', { month: 'long' })}`;
// };

// // חישוב תאריך יחסי (היום, מחר, אתמול או תאריך מלא)
// export const getRelativeDate = (date) => {
//   if (!date) return '';
  
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
  
//   const targetDate = new Date(date);
//   targetDate.setHours(0, 0, 0, 0);
  
//   const diffDays = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));
  
//   if (diffDays === 0) return 'היום';
//   if (diffDays === 1) return 'מחר';
//   if (diffDays === -1) return 'אתמול';
  
//   return formatDateShort(date);
// };

// // שינוי צבע לפי בהירות (כדי לבחור צבע טקסט שיתאים לרקע)
// // export const getContrastColor = (hexColor) => {
// //   // ברירת מחדל אם אין צבע
// //   if (!hexColor) return '#ffffff';
  
// //   // הסרת ה-# אם קיים
// //   const color = hexColor.replace('#', '');
  
// //   // המרה מהקס לערכי RGB
// //   const r = parseInt(color.substr(0, 2), 16);
// //   const g = parseInt(color.substr(2, 2), 16);
// //   const b = parseInt(color.substr(4, 2), 16);
  
// //   // חישוב בהירות (לפי נוסחת YIQ)
// //   const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
// //   // החזרת צבע לבן או שחור בהתאם לבהירות הרקע
// //   return (yiq >= 128) ? '#000000' : '#ffffff';
// // };

// // יצירת צבע אקראי לשימוש בממשק
// // export const getRandomColor = () => {
// //   const letters = '0123456789ABCDEF';
// //   let color = '#';
  
// //   for (let i = 0; i < 6; i++) {
// //     color += letters[Math.floor(Math.random() * 16)];
// //   }
  
// //   return color;
// // };