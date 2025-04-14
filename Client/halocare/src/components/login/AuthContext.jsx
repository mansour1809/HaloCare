// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import axios from '../../common/axiosConfig';
import PropTypes from 'prop-types';


// יצירת קונטקסט
export const AuthContext = createContext(null);

// הוק שימושי לגישה לקונטקסט
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
      
      const response = await axios.post(`/auth/login`, { email, password });
      
      if (response.data && response.data.token) {
        // שמירה ב-localStorage
        localStorage.setItem('token', response.data.token);
        const userData = {
          id: response.data.id,
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || email,
          role: response.data.role || ''
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        // עדכון המצב
        setCurrentUser(userData);
        setIsAuthenticated(true);
      }
      
      return response.data;
    } catch (error) {
      console.error("שגיאת התחברות:", error);
      throw error;
    }
  };

  // פונקציית התנתקות
  const logout = () => {
    // ניקוי localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // ניקוי state
    setCurrentUser(null);
    setIsAuthenticated(false);
   window.location.href = '/login';
    };


const sendPasswordResetEmail = async (email) => {
  try {
    // כאן צריך להיות הקוד לשליחת בקשת איפוס סיסמה לשרת
    const response = await axios.post('/api/auth/reset-password', { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'שגיאה בבקשת איפוס סיסמה');
  }
};

  // נתונים שיהיו זמינים בקונטקסט
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    logout,
  sendPasswordResetEmail
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;