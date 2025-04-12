// import axios from 'axios';

// // הגדרת כתובת הבסיס לשרת
// const API_BASE_URL = 'https://localhost:7225/api';
// const EVENTS_ENDPOINT = `${API_BASE_URL}/Events`;
// const KIDS_ENDPOINT = `${API_BASE_URL}/Kids`;
// const EMPLOYEES_ENDPOINT = `${API_BASE_URL}/Employees`;
// const EVENT_TYPES_ENDPOINT = `${API_BASE_URL}/EventTypes`;
// // יצירת מופע axios עם הגדרות בסיס
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//      Authorization: `Bearer ${localStorage.getItem('token')}`
//   }
// });

// // לוכד שגיאות גלובלי
// api.interceptors.response.use(
//   response => response,
//   error => {
//     console.error('שגיאת API:', error.response?.data || error.message);
//     return Promise.reject(error);
//   }
// );

// // ===== שירותי סוגי אירועים =====
// export const eventTypeService = {
//   // קבלת כל סוגי האירועים
//   async getAllEventTypes() {
//     try {
//       const response = await api.get('/api/EventTypes');
//       return Array.isArray(response.data) ? response.data : [];
//     } catch (error) {
//       console.error('שגיאה בטעינת סוגי אירועים:', error);
//       return [];
//     }
//   }
// };

// // ===== שירותי אירועים =====
// export const eventService = {
//   // קבלת כל האירועים
//   async getAllEvents() {
//     try {
//       const response = await api.get('/api/Events');
//       return Array.isArray(response.data) ? response.data : [];
//     } catch (error) {
//       console.error('שגיאה בטעינת אירועים:', error);
//       return [];
//     }
//   },

//   // קבלת אירוע לפי מזהה
//   async getEventById(id) {
//     try {
//       const response = await api.get(`/api/Events/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error(`שגיאה בטעינת אירוע ${id}:`, error);
//       throw error;
//     }
//   },

//   // קבלת ילדים באירוע
//   async getEventKids(eventId) {
//     try {
//       const response = await api.get(`/api/Events/${eventId}/kids`);
//       return Array.isArray(response.data) ? response.data : [];
//     } catch (error) {
//       console.error(`שגיאה בטעינת ילדים לאירוע ${eventId}:`, error);
//       return [];
//     }
//   },

//   // קבלת עובדים באירוע
//   async getEventEmployees(eventId) {
//     try {
//       const response = await api.get(`/api/Events/${eventId}/employees`);
//       return Array.isArray(response.data) ? response.data : [];
//     } catch (error) {
//       console.error(`שגיאה בטעינת עובדים לאירוע ${eventId}:`, error);
//       return [];
//     }
//   },

//   // הוספת אירוע חדש
//   // `async addEvent(eventData) {
//   //   try {
//   //     const response = await api.post('/api/Events', eventData);
//   //     return response.data;
//   //   } catch (error) {
//   //     console.error('שגיאה בהוספת אירוע:', error);
//   //     throw error;
//   //   }
//   // },`

//   // עדכון אירוע קיים
//   async updateEvent(eventId, eventData) {
//     try {
//       const response = await api.put(`/api/Events/${eventId}`, eventData);
//       return response.data;
//     } catch (error) {
//       console.error(`שגיאה בעדכון אירוע ${eventId}:`, error);
//       throw error;
//     }
//   },

//   // מחיקת אירוע
//   async deleteEvent(eventId) {
//     try {
//       const response = await api.delete(`/api/Events/${eventId}`);
//       return response.data;
//     } catch (error) {
//       console.error(`שגיאה במחיקת אירוע ${eventId}:`, error);
//       throw error;
//     }
//   }
// };

// // ===== שירותי עובדים =====
// export const employeeService = {
//   // קבלת כל העובדים
//   async getAllEmployees() {
//     try {
//       const response = await api.get('/api/Employees');
//       return Array.isArray(response.data) ? response.data : [];
//     } catch (error) {
//       console.error('שגיאה בטעינת עובדים:', error);
//       return [];
//     }
//   }
// };

// // ===== שירותי ילדים =====
// export const kidService = {
//   // קבלת כל הילדים
//   async getAllKids() {
//     try {
//       const response = await api.get('/api/Kids');
//       return Array.isArray(response.data) ? response.data : [];
//     } catch (error) {
//       console.error('שגיאה בטעינת ילדים:', error);
//       return [];
//     }
//   }
// };

// export default {
//   eventTypeService,
//   eventService,
//   employeeService,
//   kidService
// };