// src/context/AuthContext.jsx
import {  useState, useEffect, useContext } from 'react';
import authService from './authService';
import { AuthContext } from './authContextt';

import PropTypes from 'prop-types';



export const useAuth = () => useContext(AuthContext);


export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // בדיקת אם המשתמש מחובר בטעינה הראשונית
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
            setIsAuthenticated(true);
          } catch (e) {
            console.error("שגיאה בפענוח המשתמש:", e);
            // ניקוי במקרה של שגיאה
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error("שגיאה בטעינת הפרטים מ-localStorage:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // פונקציית התחברות
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      // מגדירים את המשתמש המחובר
      setCurrentUser({
        id: response.id,
        email: response.email || email,
        firstName: response.firstName || '',
        lastName: response.lastName || '',
        role: response.role || ''
      });
      
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      console.error("שגיאת התחברות:", error);
      throw error;
    }
  };

  // פונקציית התנתקות עם פונקציונליות מינימלית
  const logout = () => {
    // ניקוי state
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    // ניקוי localStorage - שימוש בניקוי ישיר במקום להסתמך על שירות
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // אין ניווט כאן - נעשה בנפרד בקומפוננטות
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    logout
  }
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};  