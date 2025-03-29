// src/services/authService.js
import axios from 'axios';

const API_URL = 'https://localhost:7225/api';

const authService = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.data.id,
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || email,
          role: response.data.role || ''
        }));
      }
      
      return response.data;
    } catch (error) {
      console.error('שגיאת התחברות:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    return localStorage.getItem('token') ? true : false;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('שגיאה בפענוח המשתמש מ-localStorage:', e);
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;