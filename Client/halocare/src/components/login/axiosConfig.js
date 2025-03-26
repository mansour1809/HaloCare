// services/axiosConfig.js
import axios from 'axios';
import authService from './authService';

// קבע כתובת בסיס
axios.defaults.baseURL = 'https://localhost:7092/api';

// הוסף interceptor שיוסיף את הטוקן לכל בקשה
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// טיפול בשגיאות כגון תוקף טוקן פג
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // אם יש שגיאת אימות (401), התנתק וחזור לדף התחברות
    if (error.response && error.response.status === 401) {
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;