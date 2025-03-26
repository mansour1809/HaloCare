import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  // בדיקה אם יש טוקן בלוקל סטורג'
  const isAuthenticated = localStorage.getItem('token') !== null;

  if (!isAuthenticated) {
    // אם לא מחובר - מעבר לדף התחברות עם שמירת הנתיב הנוכחי
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // אם מחובר - הצגת הדף המבוקש
  return children;
};

export default PrivateRoute;