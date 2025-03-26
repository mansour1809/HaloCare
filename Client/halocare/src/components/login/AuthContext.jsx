import React, { createContext, useState, useEffect, useContext } from 'react';
import authService, { setAuthHeader } from '../services/authService';

// יצירת הקונטקסט
export const AuthContext = createContext();

// הוק שימושי לגישה לקונטקסט
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // בדיקה אם יש משתמש מחובר כשהאפליקציה נטענת
    const initAuth = () => {
      const user = authService.getCurrentUser();
      const token = authService.getToken();
      
      if (user && token) {
        setAuthHeader(token);
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // פונקציה להתחברות
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setCurrentUser({
        id: response.id,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role
      });
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // פונקציה להתנתקות
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};