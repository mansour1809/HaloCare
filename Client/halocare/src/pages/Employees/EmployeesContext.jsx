// src/contexts/EmployeesContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const API_URL = 'https://localhost:7225/api';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
     Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});
// יצירת הקונטקסט
const EmployeesContext = createContext();

// הוק שימושי לגישה לקונטקסט
export const useEmployees = () => useContext(EmployeesContext);

// ספק הקונטקסט
export const EmployeesProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // טעינת נתונים מהשרת
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // טעינת רשימת עובדים
      const employeesResponse = await api.get(`/Employees`);
      setEmployees(employeesResponse.data);
      setLoading(false);
    } catch (err) {
      console.error('שגיאה בטעינת נתוני עובדים:', err);
      setError('שגיאה בטעינת נתוני העובדים. אנא נסה שוב מאוחר יותר.');
      setLoading(false);
    }
  };

  // טעינת תפקידים מהשרת
  const fetchRoles = async () => {
    try {
      const rolesResponse = await api.get(`/ReferenceData/roles`);
      setRoles(rolesResponse.data || []);
    } catch (err) {
      console.error('שגיאה בטעינת תפקידים:', err);
      setError('שגיאה בטעינת רשימת התפקידים.');
    }
  };

  // טעינת כיתות מהשרת
  const fetchClasses = async () => {
    try {
      const classesResponse = await api.get(`/Classes`);
      setClasses(classesResponse.data || []);
    } catch (err) {
      console.error('שגיאה בטעינת כיתות:', err);
      setError('שגיאה בטעינת רשימת הכיתות.');
    }
  };

  // טעינת נתונים בטעינת הדף
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // טעינת כל הנתונים במקביל
        await Promise.all([
          fetchEmployees(),
          fetchRoles(),
          fetchClasses()
        ]);
      } catch (err) {
        console.error('שגיאה בטעינת נתונים:', err);
        setError('שגיאה בטעינת הנתונים. אנא נסה שוב מאוחר יותר.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // פונקציה להוספת עובד חדש
  const addEmployee = async (employeeData) => {
    try {
      setLoading(true);
console.log('נתוני העובד:', employeeData);
      // שליחת נתוני העובד החדש לשרת
      const response = await api.post(`/Employees`, employeeData);
      
      // עדכון רשימת העובדים במצב המקומי
      if (response.data) {
        const newEmployee = response.data;
        setEmployees(prevEmployees => [...prevEmployees, newEmployee]);
      } else {
        // אם אין נתונים בתשובה, רענן את הרשימה
        await fetchEmployees();
      }
      
      setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('שגיאה בהוספת עובד חדש:', err);
      setLoading(false);
      return { 
        success: false, 
        error: err.response?.data?.message || 'שגיאה בהוספת עובד חדש. אנא בדוק את הנתונים ונסה שוב.' 
      };
    }
  };

  // פונקציה לעדכון עובד
  const updateEmployee = async (updatedEmployee) => {
    try {
      setLoading(true);
      // שליחת עדכון העובד לשרת
      await api.put(`/Employees/${updatedEmployee.employeeId}`, updatedEmployee);
      
      // עדכון העובד במצב המקומי
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => 
          emp.employeeId === updatedEmployee.employeeId ? updatedEmployee : emp
        )
      );
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('שגיאה בעדכון פרטי העובד:', err);
      setLoading(false);
      return { 
        success: false, 
        error: err.response?.data?.message || 'שגיאה בעדכון פרטי העובד. אנא בדוק את הנתונים ונסה שוב.' 
      };
    }
  };

  // פונקציה לעדכון סטטוס עובד
  const toggleEmployeeStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      // עדכון מצב העובד בשרת
      await api.patch(`/Employees/${id}/status`, { isActive: !currentStatus });
      
      // עדכון מצב העובד במצב המקומי
      setEmployees(prevEmployees =>
        prevEmployees.map(emp => (emp.employeeId === id ? { ...emp, isActive: !currentStatus } : emp))
      );
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('שגיאה בעדכון סטטוס העובד:', err);
      setLoading(false);
      return { 
        success: false, 
        error: 'שגיאה בעדכון סטטוס העובד. אנא נסה שוב.'
      };
    }
  };

 
  const sendWelcomeEmail = async (email, password, firstName, lastName) => {
    try {
      const response = await api.post(`/Employees/sendWelcomeEmail`, {
        email,
        password,
        firstName,
        lastName,
        loginUrl: window.location.origin + '/login'
      });
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('שגיאה בשליחת המייל:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'שגיאה בשליחת אימייל ברוכים הבאים.' 
      };
    }
  };
  // פונקציה ליצירת סיסמה אקראית
  const generateRandomPassword = (length = 10) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      password += charset[randomValues[i] % charset.length];
    }
    
    return password;
  };

  // ערך הקונטקסט
  const value = {
    employees,
    roles,
    classes,
    loading,
    error,
    sendWelcomeEmail,
    addEmployee,
    updateEmployee,
    toggleEmployeeStatus,
    generateRandomPassword,
    refreshEmployees: fetchEmployees,
  };

  return (
    <EmployeesContext.Provider value={value}>
      {children}
    </EmployeesContext.Provider>
  );
};