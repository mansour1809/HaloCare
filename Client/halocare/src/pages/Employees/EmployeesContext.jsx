// src/contexts/EmployeesContext.jsx
import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from '../../components/common/axiosConfig';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { fetchCities } from '../../Redux/features/citiesSlice';
import { fetchRoles } from '../../Redux/features/rolesSlice';
import { fetchClasses } from '../../Redux/features/classesSlice';
import { fetchEmployees } from '../../Redux/features/employeesSlice';
import Swal from 'sweetalert2';

// יצירת קונטקסט לעובדים
const EmployeesContext = createContext();

// הוק שמאפשר גישה לקונטקסט בכל קומפוננטה
export const useEmployees = () => useContext(EmployeesContext);

// קונטקסט פרובידר לעובדים
export const EmployeesProvider = ({ children }) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState("");

  // קבלת נתונים מהרדקס סטור
  const { employees } = useSelector((state) => state.employees);
  const { cities } = useSelector((state) => state.cities);
  const { roles } = useSelector((state) => state.roles);
  const { classes } = useSelector((state) => state.classes);
  
  const employeesStatus = useSelector((state) => state.employees.status);
  const citiesStatus = useSelector((state) => state.cities.status);
  const rolesStatus = useSelector((state) => state.roles.status);
  const classesStatus = useSelector((state) => state.classes.status);

  // טעינת הנתונים מהשרת באמצעות Redux
  useEffect(() => {
    if (citiesStatus === "idle") {
      dispatch(fetchCities());
    }
    if (rolesStatus === "idle") {
      dispatch(fetchRoles());
    }
    if (classesStatus === "idle") {
      dispatch(fetchClasses());
    }
    if (employeesStatus === "idle") {
      dispatch(fetchEmployees());
    }
  }, [dispatch, citiesStatus, rolesStatus, classesStatus, employeesStatus]);



  // פונקציה לרענון רשימת העובדים
const refreshEmployees = useCallback(() => {
  dispatch(fetchEmployees());
}, [dispatch]);

  // פונקציה להוספת עובד חדש
  const addEmployee = async (employeeData) => {
    try {
      setLoading(true);

      // שליחת נתוני העובד החדש לשרת
      const response = await axios.post(`/Employees`, employeeData);

      // רענון רשימת העובדים
      // refreshEmployees();
      
      setLoading(false);
      
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error("שגיאה בהוספת עובד חדש:", err);
      setLoading(false);

      // הצגת הודעת שגיאה
      Swal.fire({
        icon: 'error',
        title: 'שגיאה!',
        text: err.response?.data || "שגיאה בהוספת עובד חדש. אנא בדוק את הנתונים ונסה שוב.",
        confirmButtonText: 'אישור'
      });
      
      return {
        success: false,
        error: err.response?.data || "שגיאה בהוספת עובד חדש. אנא בדוק את הנתונים ונסה שוב.",
      };
    }
  };

  // פונקציה לעדכון עובד
  const updateEmployee = async (updatedEmployee) => {
    try {
      setLoading(true);
      // שליחת עדכון העובד לשרת
      await axios.put(`/Employees/${updatedEmployee.employeeId}`, updatedEmployee);
      
      // רענון רשימת העובדים
      refreshEmployees();
      
      setLoading(false);
      
      // הצגת הודעת הצלחה
      Swal.fire({
        icon: 'success',
        title: 'העובד עודכן בהצלחה!',
        text: 'פרטי העובד עודכנו במערכת',
        confirmButtonText: 'אישור'
      });
      
      return { success: true };
    } catch (err) {
      console.error("שגיאה בעדכון פרטי העובד:", err);
      setLoading(false);
      
      // הצגת הודעת שגיאה
      Swal.fire({
        icon: 'error',
        title: 'שגיאה!',
        text: err.response?.data?.message || "שגיאה בעדכון פרטי העובד. אנא בדוק את הנתונים ונסה שוב.",
        confirmButtonText: 'אישור'
      });
      
      return {
        success: false,
        error: err.response?.data?.message || "שגיאה בעדכון פרטי העובד. אנא בדוק את הנתונים ונסה שוב.",
      };
    }
  };

  // פונקציה לעדכון סטטוס עובד
  const toggleEmployeeStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      
      // שאלת אישור לפני שינוי הסטטוס
      const result = await Swal.fire({
        icon: 'question',
        title: `האם אתה בטוח שברצונך ${currentStatus ? 'להשבית' : 'להפעיל'} את העובד?`,
        text: `העובד יהיה ${currentStatus ? 'לא פעיל' : 'פעיל'} במערכת`,
        showCancelButton: true,
        confirmButtonText: 'כן, בצע שינוי',
        cancelButtonText: 'ביטול'
      });
      
      if (!result.isConfirmed) {
        setLoading(false);
        return { success: false };
      }
      
      // עדכון מצב העובד בשרת
      await axios.patch(`/Employees/${id}/deactivate`, {
        isActive: !currentStatus,
      });
      
      // רענון רשימת העובדים
      refreshEmployees();
      
      setLoading(false);
      
      // הצגת הודעת הצלחה
      Swal.fire({
        icon: 'success',
        title: 'הסטטוס עודכן בהצלחה!',
        text: `העובד ${!currentStatus ? 'פעיל' : 'לא פעיל'} כעת`,
        confirmButtonText: 'אישור'
      });
      
      return { success: true };
    } catch (err) {
      console.error("שגיאה בעדכון סטטוס העובד:", err);
      setLoading(false);
      
      Swal.fire({
        icon: 'error',
        title: 'שגיאה!',
        text: "שגיאה בעדכון סטטוס העובד. אנא נסה שוב.",
        confirmButtonText: 'אישור'
      });
      
      return {
        success: false,
        error: "שגיאה בעדכון סטטוס העובד. אנא נסה שוב.",
      };
    }
  };

  // פונקציה לשליחת מייל ברוכים הבאים
  const sendWelcomeEmail = async (email, password, firstName, lastName) => {

    try {
      const response = await axios.post(`/Employees/sendWelcomeEmail`, {
        email,
        password,
        firstName,
        lastName,
        // loginUrl: window.location.origin + "/bgroup3/test2/halocare/#/login",
        loginUrl: window.location.origin + "/#/login",
      });

      // הצגת הודעת הצלחה
      Swal.fire({
        icon: 'success',
        title: 'המייל נשלח בהצלחה!',
        text: `מייל ברוכים הבאים נשלח ל-${email}`,
        confirmButtonText: 'אישור'
      });

      return { success: true, data: response.data };
    } catch (err) {
      console.error("שגיאה בשליחת המייל:", err);
      
      // הצגת הודעת שגיאה
      Swal.fire({
        icon: 'error',
        title: 'שגיאה!',
        text: err.response?.data?.message || "שגיאה בשליחת אימייל ברוכים הבאים.",
        confirmButtonText: 'אישור'
      });
      
      return {
        success: false,
        error: err.response?.data?.message || "שגיאה בשליחת אימייל ברוכים הבאים.",
      };
    }
  };

  // פונקציה ליצירת סיסמה אקראית
  const generateRandomPassword = (length = 10) => {
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";

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
    cities,
    loading,
    sendWelcomeEmail,
    addEmployee,
    updateEmployee,
    toggleEmployeeStatus,
    generateRandomPassword,
    refreshEmployees,
  };

  return (
    <EmployeesContext.Provider value={value}>
      {children}
    </EmployeesContext.Provider>
  );
};