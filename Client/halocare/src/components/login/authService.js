import axios from 'axios';

const API_URL = 'https://localhost:7225/api'; // כתובת השרת שלכם - יש להתאים לפי הצורך

const authService = {
  // פונקציה להתחברות
  login: async (email, password) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      if (response.data.token) {
        // שמירת הטוקן ופרטי המשתמש ב-localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.data.id,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role
        }));
        
        // הגדרת הטוקן כברירת מחדל לבקשות הבאות
        setAuthHeader(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // פונקציה להתנתקות
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthHeader(null);
  },

  // קבלת המשתמש הנוכחי
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },

  // קבלת הטוקן
  getToken: () => {
    return localStorage.getItem('token');
  },

  // בדיקה אם המשתמש מחובר
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  }
};

// פונקציה להגדרת הדר אימות עבור כל הבקשות
export const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export default authService;