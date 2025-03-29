// src/services/axiosConfig.js
import axios from 'axios';

// קבע כתובת בסיס
axios.defaults.baseURL = 'https://localhost:7225/api';

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

// טיפול בשגיאות אימות (401)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // ניקוי localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // הפניה לדף התחברות
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;