// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './login/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  console.log(loading)
  // בדיקה אם עדיין טוען
  if (loading) {
    return <div>טוען...</div>;
  }
  
  console.log(loading)
  // אם המשתמש לא מחובר והוא לא בדף ההתחברות, הפנה לדף התחברות
  if (!isAuthenticated) {
    return <Navigate to="/login"  />;//state={{ from: location.pathname !== '/' ? location.pathname : '/' }}
  }
  
  return children;
};

export default PrivateRoute;