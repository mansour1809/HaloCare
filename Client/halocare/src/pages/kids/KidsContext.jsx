// // src/components/kids/KidsContext.jsx
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import axios from '../../components/common/axiosConfig';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchKids, fetchKidById } from '../../Redux/features/kidsSlice';
// import { fetchClasses } from '../../Redux/features/classesSlice';
// import Swal from 'sweetalert2';

// // יצירת הקונטקסט
// const KidsContext = createContext();

// // יצירת Provider
// export const KidsProvider = ({ children }) => {
//   const dispatch = useDispatch();
//   const { kids, selectedKid, kidStatus } = useSelector(state => state.kids);
//   const { classes, classStatus } = useSelector(state => state.classes);
//   const [loading, setLoading] = useState(false);

  
//   useEffect(() => {
//     dispatch(fetchKids())
//     dispatch(fetchClasses())
//   }, [dispatch]);



//   // פונקציה לטעינת רשימת הילדים
//   const refreshKids = () => {
//     return dispatch(fetchKids());
//   };

//   // פונקציה לטעינת ילד ספציפי לפי מזהה
//   const fetchKid = (kidId) => {
//     return dispatch(fetchKidById(kidId));
//   };

//   // פונקציה לשינוי סטטוס הילד (פעיל/לא פעיל)
//   const toggleKidStatus = async (kidId, currentStatus) => {
//     try {
//       setLoading(true);

//       // שאלת אישור לפני שינוי הסטטוס
//       const result = await Swal.fire({
//         icon: 'question',
//         title: `האם אתה בטוח שברצונך ${currentStatus ? 'להשבית' : 'להפעיל'} את הילד?`,
//         text: `הילד יהיה ${currentStatus ? 'לא פעיל' : 'פעיל'} במערכת`,
//         showCancelButton: true,
//         confirmButtonText: 'כן, בצע שינוי',
//         cancelButtonText: 'ביטול',
//         customClass: {
//           container: 'swal-rtl'
//         }
//       });

//       if (!result.isConfirmed) {
//         setLoading(false);
//         return { success: false };
//       }

//       // עדכון מצב הילד בשרת
//       await axios.patch(`/Kids/${kidId}/deactivate`, {
//         isActive: !currentStatus,
//       });

//       // רענון רשימת הילדים
//       await refreshKids();

//       setLoading(false);

//       // הצגת הודעת הצלחה
//       Swal.fire({
//         icon: 'success',
//         title: 'הסטטוס עודכן בהצלחה!',
//         text: `הילד ${!currentStatus ? 'פעיל' : 'לא פעיל'} כעת`,
//         confirmButtonText: 'אישור',
//         customClass: {
//           container: 'swal-rtl'
//         }
//       });

//       return { success: true };
//     } catch (err) {
//       console.error("שגיאה בעדכון סטטוס הילד:", err);
//       setLoading(false);

//       Swal.fire({
//         icon: 'error',
//         title: 'שגיאה!',
//         text: "שגיאה בעדכון סטטוס הילד. אנא נסה שוב.",
//         confirmButtonText: 'אישור',
//         customClass: {
//           container: 'swal-rtl'
//         }
//       });

//       return {
//         success: false,
//         error: "שגיאה בעדכון סטטוס הילד. אנא נסה שוב.",
//       };
//     }
//   };

//   // פונקציה לעדכון פרטי ילד
//   const updateKid = async (kidId, kidData) => {
//     try {
//       setLoading(true);
//       await axios.put(`/Kids/${kidId}`, kidData);
//       await refreshKids();
//       setLoading(false);

//       Swal.fire({
//         icon: 'success',
//         title: 'העדכון בוצע בהצלחה!',
//         text: 'פרטי הילד עודכנו במערכת',
//         confirmButtonText: 'אישור',
//         customClass: {
//           container: 'swal-rtl'
//         }
//       });

//       return { success: true };
//     } catch (err) {
//       console.error("שגיאה בעדכון פרטי ילד:", err);
//       setLoading(false);

//       Swal.fire({
//         icon: 'error',
//         title: 'שגיאה!',
//         text: "שגיאה בעדכון פרטי הילד. אנא נסה שוב.",
//         confirmButtonText: 'אישור',
//         customClass: {
//           container: 'swal-rtl'
//         }
//       });

//       return {
//         success: false,
//         error: "שגיאה בעדכון פרטי הילד. אנא נסה שוב.",
//       };
//     }
//   };

//   // פונקציה להוספת ילד חדש
//   const addKid = async (kidData) => {
//     try {
//       setLoading(true);
//       const response = await axios.post('/Kids', kidData);
//       await refreshKids();
//       setLoading(false);

//       Swal.fire({
//         icon: 'success',
//         title: 'הילד נוסף בהצלחה!',
//         text: 'פרטי הילד נשמרו במערכת',
//         confirmButtonText: 'אישור',
//         customClass: {
//           container: 'swal-rtl'
//         }
//       });

//       return {
//         success: true,
//         kidId: response.data.id
//       };
//     } catch (err) {
//       console.error("שגיאה בהוספת ילד:", err);
//       setLoading(false);

//       Swal.fire({
//         icon: 'error',
//         title: 'שגיאה!',
//         text: "שגיאה בהוספת ילד חדש. אנא נסה שוב.",
//         confirmButtonText: 'אישור',
//         customClass: {
//           container: 'swal-rtl'
//         }
//       });

//       return {
//         success: false,
//         error: "שגיאה בהוספת ילד חדש. אנא נסה שוב.",
//       };
//     }
//   };

//   // פונקציה לחישוב גיל
//   const calculateAge = (birthDateString) => {
//     if (!birthDateString) return '–';

//     const birthDate = new Date(birthDateString);
//     const today = new Date();

//     let age = today.getFullYear() - birthDate.getFullYear();
//     const monthDiff = today.getMonth() - birthDate.getMonth();

//     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//       age--;
//     }

//     return age.toString();
//   };

//   // פונקציה לפורמט תאריך
//   const formatDate = (dateString) => {
//     if (!dateString) return '–';

//     const date = new Date(dateString);
//     return date.toLocaleDateString('he-IL');
//   };

//   // ערך הקונטקסט לאקספורט
//   const value = {
//     kids,
//     selectedKid,
//     classes,
//     kidStatus,
//     // error: error || localError,
//     loading,
//     refreshKids,
//     fetchKid,
//     toggleKidStatus,
//     updateKid,
//     addKid,
//     calculateAge,
//     formatDate
//   };

//   return <KidsContext.Provider value={value}>{children}</KidsContext.Provider>;
// };

// // הוק לשימוש בקונטקסט
// export const useKids = () => {
//   const context = useContext(KidsContext);
//   if (!context) {
//     throw new Error('useKids must be used within a KidsProvider');
//   }
//   return context;
// };

// export default KidsContext;