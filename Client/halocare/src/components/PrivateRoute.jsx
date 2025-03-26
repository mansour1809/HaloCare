// components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import authService from './login/authService';

const PrivateRoute = ({ children }) => {
  // אם המשתמש אינו מחובר, העבר אותו לדף ההתחברות
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // אם המשתמש מחובר, הראה את התוכן המבוקש
  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default PrivateRoute;