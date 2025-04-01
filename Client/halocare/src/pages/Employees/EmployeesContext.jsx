// src/contexts/EmployeesContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const API_URL = 'https://localhost:7225/api';

// יצירת הקונטקסט
const EmployeesContext = createContext();

// הוק שימושי לגישה לקונטקסט
export const useEmployees = () => useContext(EmployeesContext);

// ספק הקונטקסט
export const EmployeesProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // טעינת נתונים מהשרת
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // טעינת רשימת עובדים
        const employeesResponse = await axios.get(`${API_URL}/Employees`);
        setEmployees(employeesResponse.data);
        
        // יצירת רשימת תפקידים ייחודיים
        const uniqueRoles = [...new Set(employeesResponse.data
          .filter(emp => emp.roleName) // מסנן ערכים null או undefined
          .map(emp => emp.roleName))];
        setRoles(uniqueRoles);
        
        setLoading(false);
      } catch (err) {
        console.error('שגיאה בטעינת נתונים:', err);
        setError('שגיאה בטעינת נתוני העובדים. אנא נסה שוב מאוחר יותר.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // פונקציה לעדכון עובד
  const updateEmployee = async (updatedEmployee) => {
    try {
      // שליחת עדכון העובד לשרת
      await axios.put(`${API_URL}/Employees/${updatedEmployee.employeeId}`, updatedEmployee);
      
      // עדכון העובד במצב המקומי
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => 
          emp.employeeId === updatedEmployee.employeeId ? updatedEmployee : emp
        )
      );
      
      return { success: true };
    } catch (err) {
      console.error('שגיאה בעדכון פרטי העובד:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'שגיאה בעדכון פרטי העובד. אנא בדוק את הנתונים ונסה שוב.' 
      };
    }
  };

  // פונקציה לעדכון סטטוס עובד
  const toggleEmployeeStatus = async (id, currentStatus) => {
    try {
      // עדכון מצב העובד בשרת
      await axios.patch(`${API_URL}/Employees/${id}/status`, { isActive: !currentStatus });
      
      // עדכון מצב העובד במצב המקומי
      setEmployees(prevEmployees =>
        prevEmployees.map(emp => (emp.employeeId === id ? { ...emp, isActive: !currentStatus } : emp))
      );
      
      return { success: true };
    } catch (err) {
      console.error('שגיאה בעדכון סטטוס העובד:', err);
      return { 
        success: false, 
        error: 'שגיאה בעדכון סטטוס העובד. אנא נסה שוב.'
      };
    }
  };

  // ערך הקונטקסט
  const value = {
    employees,
    roles,
    loading,
    error,
    updateEmployee,
    toggleEmployeeStatus
  };

  return (
    <EmployeesContext.Provider value={value}>
      {children}
    </EmployeesContext.Provider>
  );
};