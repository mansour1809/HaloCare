// src/services/axiosConfig.js
import axios from 'axios';

// קבע כתובת בסיס
axios.defaults.baseURL = 'https://localhost:7225/api';
// axios.defaults.baseURL = 'https://proj.ruppin.ac.il/bgroup3/test2/tar1/api';


// 🔥 רשימת endpoints ציבוריים שלא צריכים token
const publicEndpoints = [
  '/ParentForm/validate',
  '/ParentForm/form/',
  '/ParentForm/submit',
  '/Auth/reset-password', 
  '/Auth/forgot-password', // אם יש
  '/Auth/login' 

];

// 🔥 בדיקה אם הנתיב ציבורי
const isPublicEndpoint = (url) => {
  return publicEndpoints.some(endpoint => url.includes(endpoint));
};



// הוסף interceptor שיוסיף את הטוקן רק לבקשות פרטיות
axios.interceptors.request.use(
  (config) => {
    //  הוסף token רק אם זה לא endpoint ציבורי
    if (!isPublicEndpoint(config.url)) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
      // 🔥 בדיקה מורחבת לדפים ציבוריים
      const currentPath = window.location.pathname + window.location.hash;
      const publicPaths = ["/login", "/reset-password", "/parent-form"];
      const isPublicPage = publicPaths.some(path => currentPath.includes(path));
      
      // 🔥 הפנה ל-login רק אם זה לא דף ציבורי
      if (!isPublicPage) {
        window.location.href = "/bgroup3/test2/halocare/#/login";
      }
      
      return Promise.reject({ silent: true });
    }
    return Promise.reject(error);
  }
);

export default axios;

export const baseURL=axios.defaults.baseURL;