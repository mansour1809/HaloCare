// src/components/login/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import axios from '../../components/common/axiosConfig';
import PropTypes from 'prop-types';

// Creating the context
export const AuthContext = createContext(null);

// Useful hook for accessing the context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // State variables for authentication
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State variables for password reset
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Check if the user is logged in during the initial load
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

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(`/auth/login`, { email, password });
      
      if (response.data && response.data.token) {
        // Save to localStorage
        localStorage.setItem('token', response.data.token);
        const userData = {
          id: response.data.id,
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || email,
          role: response.data.role || ''
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update state
        setCurrentUser(userData);
        setIsAuthenticated(true);
      }
      
      return response.data;
    } catch (error) {
      console.error("שגיאת התחברות:", error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
// window.location.href = '/bgroup3/test2/halocare/#/login';
    window.location.href = '/#/login';
  };

  // Function to request password reset
  const handleRequestPasswordReset = async (emailToReset) => {
    // Use the email passed as a parameter, if not available use the internal email state
    const emailToUse = emailToReset || email;
    
    if (!emailToUse) {
      setMessage('אנא הכנס כתובת מייל');
      return;
    }
    
    setIsSubmitting(true);
    setMessage('');
    
    try {
      // Call the server to request password reset
      const response = await axios.post('/Auth/request-password-reset', { email: emailToUse });
      
      // Display success message
      setMessage(response.data.message || 'קישור לאיפוס סיסמה נשלח למייל');
      
      // Close the dialog after a delay
      setTimeout(() => {
        setShowForgotPassword(false);
        setMessage('');
      }, 3000);
    } catch (error) {
      // Display error message
      setMessage(
        error.response?.data?.message || 
        'אירעה שגיאה בשליחת בקשת איפוס סיסמה'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to reset the password itself (used on the password reset page)
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

  // Data that will be available in the context
  const value = {
    // Authentication state
    currentUser,
    isAuthenticated,
    loading,
    
    // Login/logout functions
    login,
    logout,
    
    // Password reset state
    email,
    setEmail,
    isSubmitting,
    message,
    showForgotPassword,
    setShowForgotPassword,
    
    // Password reset functions
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