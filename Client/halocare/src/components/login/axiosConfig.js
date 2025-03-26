import axios from 'axios';
import authService from './authService';

// הגדרת ה-interceptor עבור כל הבקשות
axios.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// טיפול בשגיאות בתשובות מהשרת
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // במקרה של שגיאת אימות, התנתקות וניתוב לדף הכניסה
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;