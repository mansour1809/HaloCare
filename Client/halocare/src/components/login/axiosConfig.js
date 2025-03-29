// // src/services/axiosConfig.js
// import axios from 'axios';
// import authService from './authService';

// // קבע כתובת בסיס
// axios.defaults.baseURL = 'https://localhost:7225/api';

// // הוסף interceptor שיוסיף את הטוקן לכל בקשה
// axios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // מונע לולאות בעת התנתקות
// let isLoggingOut = false;

// axios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401 && !isLoggingOut) {
//       isLoggingOut = true;
//       authService.logout();
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default axios;