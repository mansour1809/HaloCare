// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './login/AuthContext';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  
  // בדיקה אם עדיין טוען
  if (loading) {
    return <div>טוען...</div>;
  }
  
  // אם המשתמש לא מחובר והוא לא בדף ההתחברות, הפנה לדף התחברות
  if (!isAuthenticated) {
    // חשוב: וודא שאתה לא מנסה להפנות למסלול עם / ריק בסוף
    return <Navigate to="/login" state={{ from: location.pathname !== '/' ? location.pathname : '/' }} />;
  }
  
  // אם המשתמש מחובר, החזר את התוכן המבוקש
  return children;
};

export default ProtectedRoute;