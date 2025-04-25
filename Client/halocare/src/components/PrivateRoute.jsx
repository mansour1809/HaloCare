// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './login/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // בדיקה אם עדיין טוען
  if (loading) {
    return <div>טוען...</div>;
  }
  
  // אם המשתמש לא מחובר, הפנה לדף התחברות
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default ProtectedRoute;