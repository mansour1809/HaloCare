// src/components/login/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import axios from '../../components/common/axiosConfig';
import PropTypes from 'prop-types';

// יצירת קונטקסט
export const AuthContext = createContext(null);

// הוק שימושי לגישה לקונטקסט
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // משתני מצב להתחברות
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // משתני מצב לאיפוס סיסמה
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);


  

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
    window.location.href = '/bgroup3/test2/halocare/#/login';
    // window.location.href = '/#/login';
  };

  // פונקציה לבקשת איפוס סיסמה
  const handleRequestPasswordReset = async (emailToReset) => {
    // השתמש באימייל שהועבר כפרמטר, אם לא קיים השתמש במצב האימייל הפנימי
    const emailToUse = emailToReset || email;
    
    if (!emailToUse) {
      setMessage('אנא הכנס כתובת מייל');
      return;
    }
    
    setIsSubmitting(true);
    setMessage('');
    
    try {
      // קריאה לשרת לבקשת איפוס סיסמה
      const response = await axios.post('/Auth/request-password-reset',{ email: emailToUse });
      
      // הצגת הודעת הצלחה
      setMessage(response.data.message || 'קישור לאיפוס סיסמה נשלח למייל');
      
      // סגירת הדיאלוג אחרי השהייה
      setTimeout(() => {
        setShowForgotPassword(false);
        setMessage('');
      }, 3000);
    } catch (error) {
      // הצגת הודעת שגיאה
      setMessage(
        error.response?.data?.message || 
        'אירעה שגיאה בשליחת בקשת איפוס סיסמה'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // פונקציה לאיפוס הסיסמה עצמה (תשומש בעמוד איפוס הסיסמה)
  const resetPassword = async (email, token, newPassword) => {
    try {
      const response = await axios.post('/Auth/reset-password', {
        email,
        token,
        newPassword
      });
      
      return response.data;
    } catch (error) {
      console.error("שגיאה באיפוס סיסמה:", error);
      throw error;
    }
  };

  // נתונים שיהיו זמינים בקונטקסט
  const value = {
    // מצב התחברות
    currentUser,
    isAuthenticated,
    loading,
    
    // פונקציות התחברות/התנתקות
    login,
    logout,
    
    // מצב איפוס סיסמה
    email,
    setEmail,
    isSubmitting,
    message,
    showForgotPassword,
    setShowForgotPassword,
    
    // פונקציות איפוס סיסמה
    handleRequestPasswordReset,
    resetPassword
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// PropTypes
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;