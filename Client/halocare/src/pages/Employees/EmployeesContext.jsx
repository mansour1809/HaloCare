// src/contexts/EmployeesContext.jsx
import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios, { baseURL } from '../../components/common/axiosConfig';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { fetchCities } from '../../Redux/features/citiesSlice';
import { fetchRoles } from '../../Redux/features/rolesSlice';
import { fetchClasses } from '../../Redux/features/classesSlice';
import { fetchEmployees } from '../../Redux/features/employeesSlice';
import Swal from 'sweetalert2';

const EmployeesContext = createContext();

export const useEmployees = () => useContext(EmployeesContext);

export const EmployeesProvider = ({ children }) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const { employees } = useSelector((state) => state.employees);
  const { cities } = useSelector((state) => state.cities);
  const { roles } = useSelector((state) => state.roles);
  const { classes } = useSelector((state) => state.classes);
  
  const employeesStatus = useSelector((state) => state.employees.status);
  const citiesStatus = useSelector((state) => state.cities.status);
  const rolesStatus = useSelector((state) => state.roles.status);
  const classesStatus = useSelector((state) => state.classes.status);

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

  const refreshEmployees = useCallback(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const addEmployee = async (employeeData) => {
    try {
      setLoading(true);

      const response = await axios.post(`/Employees`, employeeData);

      setLoading(false);
      
      // await Swal.fire({
      //   icon: 'success',
      //   title: '🎉 העובד נוסף בהצלחה!',
      //   text: 'העובד החדש נוסף למערכת בהצלחה',
      //   confirmButtonText: '👍 מעולה!',
      //   confirmButtonColor: '#4cb5c3',
      //   background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      //   customClass: {
      //     popup: 'rtl-popup',
      //     title: 'swal-title-success',
      //     content: 'swal-content-success'
      //   },
      //   showClass: {
      //     popup: 'animate__animated animate__fadeInDown'
      //   },
      //   hideClass: {
      //     popup: 'animate__animated animate__fadeOutUp'
      //   },
      //   timer: 3000,
      //   timerProgressBar: true
      // });
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error("שגיאה בהוספת עובד חדש:", err);
      setLoading(false);

      await Swal.fire({
        icon: 'error',
        title: '❌ שגיאה בהוספת עובד',
        text: err.response?.data || "שגיאה בהוספת עובד חדש. אנא בדוק את הנתונים ונסה שוב.",
        confirmButtonText: '🔄 נסה שוב',
        confirmButtonColor: '#ef4444',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        customClass: {
          popup: 'rtl-popup',
          title: 'swal-title-error',
          content: 'swal-content-error'
        },
        showClass: {
          popup: 'animate__animated animate__shakeX'
        }
      });
      
      return {
        success: false,
        error: err.response?.data || "שגיאה בהוספת עובד חדש. אנא בדוק את הנתונים ונסה שוב.",
      };
    }
  };

  // Update employee function
  const updateEmployee = async (updatedEmployee) => {
    try {
      setLoading(true);
      
      
      await axios.put(`/Employees/${updatedEmployee.employeeId}`, updatedEmployee);
      
      refreshEmployees();
      
      setLoading(false);
      
      // Success message
      await Swal.fire({
        icon: 'success',
        title: '✅ העובד עודכן בהצלחה!',
        text: 'פרטי העובד עודכנו במערכת',
        confirmButtonText: '👍 מצוין!',
        confirmButtonColor: '#10b981',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        customClass: {
          popup: 'rtl-popup',
          title: 'swal-title-success',
          content: 'swal-content-success'
        },
        showClass: {
          popup: 'animate__animated animate__bounceIn'
        },
        timer: 2500,
        timerProgressBar: true
      });
      
      return { success: true };
    } catch (err) {
      console.error("שגיאה בעדכון פרטי העובד:", err);
      setLoading(false);
      
      // Error message
      await Swal.fire({
        icon: 'error',
        title: '❌ שגיאה בעדכון',
        text: err.response?.data?.message || "שגיאה בעדכון פרטי העובד. אנא בדוק את הנתונים ונסה שוב.",
        confirmButtonText: '🔄 נסה שוב',
        confirmButtonColor: '#ef4444',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        customClass: {
          popup: 'rtl-popup',
          title: 'swal-title-error',
          content: 'swal-content-error'
        }
      });
      
      return {
        success: false,
        error: err.response?.data?.message || "שגיאה בעדכון פרטי העובד. אנא בדוק את הנתונים ונסה שוב.",
      };
    }
  };

  // Update employee status function
  const toggleEmployeeStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      
      // Confirmation dialog
      const result = await Swal.fire({
        icon: 'question',
        title: `🤔 ${currentStatus ? 'השבתת' : 'הפעלת'} עובד`,
        text: `האם אתה בטוח שברצונך ${currentStatus ? 'להשבית' : 'להפעיל'} את העובד?`,
        html: `
          <div style="text-align: center; font-family: 'Rubik', 'Heebo', Arial, sans-serif;">
            <p style="font-size: 1.1rem; margin-bottom: 20px;">
              העובד יהיה <strong style="color: ${currentStatus ? '#ef4444' : '#10b981'};">
                ${currentStatus ? '❌ לא פעיל' : '✅ פעיל'}
              </strong> במערכת
            </p>
            <div style="display: flex; justify-content: center; gap: 10px; margin-top: 15px;">
              <span style="background: ${currentStatus ? '#fee2e2' : '#dcfce7'}; 
                           color: ${currentStatus ? '#dc2626' : '#059669'}; 
                           padding: 8px 16px; 
                           border-radius: 20px; 
                           font-weight: 600;">
                ${currentStatus ? '🔴 השבתה' : '🟢 הפעלה'}
              </span>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: `✅ כן, ${currentStatus ? 'השבת' : 'הפעל'}`,
        cancelButtonText: '❌ ביטול',
        confirmButtonColor: currentStatus ? '#ef4444' : '#10b981',
        cancelButtonColor: '#6b7280',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        customClass: {
          popup: 'rtl-popup',
          title: 'swal-title-question',
          content: 'swal-content-question'
        },
        showClass: {
          popup: 'animate__animated animate__pulse'
        }
      });
      
      if (!result.isConfirmed) {
        setLoading(false);
        return { success: false };
      }
      
      await axios.patch(`/Employees/${id}/deactivate`, {
        isActive: !currentStatus,
      });
      
      refreshEmployees();
      
      setLoading(false);
      
      // Success message
      await Swal.fire({
        icon: 'success',
        title: `🎉 הסטטוס עודכן בהצלחה!`,
        text: `העובד ${!currentStatus ? '✅ פעיל' : '❌ לא פעיל'} כעת`,
        confirmButtonText: '👍 מעולה!',
        confirmButtonColor: '#4cb5c3',
        background: `linear-gradient(135deg, ${!currentStatus ? '#f0fdf4' : '#fef2f2'} 0%, ${!currentStatus ? '#dcfce7' : '#fee2e2'} 100%)`,
        customClass: {
          popup: 'rtl-popup',
          title: 'swal-title-success',
          content: 'swal-content-success'
        },
        showClass: {
          popup: 'animate__animated animate__tada'
        },
        timer: 2000,
        timerProgressBar: true
      });
      
      return { success: true };
    } catch (err) {
      console.error("שגיאה בעדכון סטטוס העובד:", err);
      setLoading(false);
      
      await Swal.fire({
        icon: 'error',
        title: '❌ שגיאה בעדכון סטטוס',
        text: "שגיאה בעדכון סטטוס העובד. אנא נסה שוב.",
        confirmButtonText: '🔄 נסה שוב',
        confirmButtonColor: '#ef4444',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        customClass: {
          popup: 'rtl-popup',
          title: 'swal-title-error',
          content: 'swal-content-error'
        }
      });
      
      return {
        success: false,
        error: "שגיאה בעדכון סטטוס העובד. אנא נסה שוב.",
      };
    }
  };

  // Welcome email function
  const sendWelcomeEmail = async (email, password, firstName, lastName) => {
    try {
      const response = await axios.post(`/Employees/sendWelcomeEmail`, {
        email,
        password,
        firstName,
        lastName,
        loginUrl: `${baseURL}/#/login`,
      });

      // Success email message
      await Swal.fire({
        icon: 'success',
        title: '🎉 העובד נוסף בהצלחה!',
        html: `
          <div style="text-align: center; font-family: 'Rubik', 'Heebo', Arial, sans-serif;">
            <p style="font-size: 1.1rem; margin-bottom: 15px;">
              מייל ברוכים הבאים נשלח בהצלחה ל:
            </p>
            <div style="background: #e0f2fe; 
                        border: 2px solid #4cb5c3; 
                        border-radius: 12px; 
                        padding: 15px; 
                        margin: 10px 0;">
              <strong style="color: #2a8a95; font-size: 1.2rem;">
                📧 ${email}
              </strong>
            </div>
            <p style="color: #6b7280; font-size: 0.9rem; margin-top: 15px;">
              העובד יקבל הוראות התחברות למערכת
            </p>
          </div>
        `,
        confirmButtonText: '👍 מצוין!',
        confirmButtonColor: '#4cb5c3',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        customClass: {
          popup: 'rtl-popup',
          title: 'swal-title-success',
          content: 'swal-content-success'
        },
        showClass: {
          popup: 'animate__animated animate__bounceIn'
        },
        timer: 5000,
        timerProgressBar: true
      });

      return { success: true, data: response.data };
    } catch (err) {
      console.error("שגיאה בשליחת המייל:", err);
      
      // Error email message
      await Swal.fire({
        icon: 'error',
        title: '📧 שגיאה בשליחת מייל',
        html: `
          <div style="text-align: center; font-family: 'Rubik', 'Heebo', Arial, sans-serif;">
            <p style="font-size: 1.1rem; margin-bottom: 15px; color: #dc2626;">
              לא הצלחנו לשלוח את המייל לכתובת:
            </p>
            <div style="background: #fee2e2; 
                        border: 2px solid #ef4444; 
                        border-radius: 12px; 
                        padding: 15px; 
                        margin: 10px 0;">
              <strong style="color: #dc2626; font-size: 1.2rem;">
                📧 ${email}
              </strong>
            </div>
            <p style="color: #6b7280; font-size: 0.9rem; margin-top: 15px;">
              ${err.response?.data?.message || "אנא בדוק את כתובת המייל ונסה שוב"}
            </p>
          </div>
        `,
        confirmButtonText: '🔄 נסה שוב',
        confirmButtonColor: '#ef4444',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        customClass: {
          popup: 'rtl-popup',
          title: 'swal-title-error',
          content: 'swal-content-error'
        }
      });
      
      return {
        success: false,
        error: err.response?.data?.message || "שגיאה בשליחת אימייל ברוכים הבאים.",
      };
    }
  };

  // Random password generator function
  const generateRandomPassword = (length = 12) => {
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";

    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      password += charset[randomValues[i] % charset.length];
    }

    return password;
  };

  // context value
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
      
      {/* CSS SweetAlert2 */}
      <style >{`
        .rtl-popup {
          direction: rtl !important;
          font-family: 'Rubik', 'Heebo', Arial, sans-serif !important;
        }
        
        .swal-title-success {
          color: #059669 !important;
          font-weight: 700 !important;
        }
        
        .swal-title-error {
          color: #dc2626 !important;
          font-weight: 700 !important;
        }
        
        .swal-title-question {
          color: #4cb5c3 !important;
          font-weight: 700 !important;
        }
        
        .swal-content-success {
          color: #374151 !important;
        }
        
        .swal-content-error {
          color: #374151 !important;
        }
        
        .swal-content-question {
          color: #374151 !important;
        }
        
        .swal2-popup {
          border-radius: 20px !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2) !important;
        }
        
        .swal2-timer-progress-bar {
          background: linear-gradient(90deg, #4cb5c3, #10b981) !important;
        }
      `}</style>
    </EmployeesContext.Provider>
  );
};