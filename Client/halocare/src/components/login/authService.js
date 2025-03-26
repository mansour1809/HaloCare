// services/authService.js
import axios from 'axios';

// כתובת בסיס לשרת - יש להתאים למיקום השרת שלך
const API_URL = 'https://localhost:7225/api';

const authService = {
  // התחברות למערכת
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      // שמירת הטוקן וכניסה למערכת
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.data.id,
          name: response.data.name,
          role: response.data.role
        }));
      }
      
      return response.data;
    } catch (error) {
      console.error('שגיאת התחברות:', error);
      throw error;
    }
  },

  // התנתקות מהמערכת
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // בדיקה האם המשתמש מחובר
  isAuthenticated: () => {
    return localStorage.getItem('token') ? true : false;
  },

  // קבלת פרטי המשתמש המחובר
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },

  // קבלת הטוקן עבור בקשות אחרות
  getAuthHeader: () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};

export default authService;