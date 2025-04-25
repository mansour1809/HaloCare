// src/services/axiosConfig.js
import axios from 'axios';

// קבע כתובת בסיס
// axios.defaults.baseURL = 'https://localhost:7225/api';
axios.defaults.baseURL = 'https://proj.ruppin.ac.il/bgroup3/test2/tar1/api';

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
      // בדיקה שאנחנו לא מנסים להיכנס לדף ההתחברות כבר
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/bgroup3/test2/halocare/#/login';
        // window.location.href = '/#/login';
      }
      // החזרת שגיאה ריקה להמשך זרימת התוכנית
      return Promise.reject({ silent: true });
    }
    return Promise.reject(error);
  }
);

export default axios;

export const baseURL=axios.defaults.baseURL;