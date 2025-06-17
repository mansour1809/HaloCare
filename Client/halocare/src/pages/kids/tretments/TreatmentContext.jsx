// src/context/TreatmentContext.jsx - גרסה משופרת עם פילטרים נוספים
import { createContext, useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { fetchTreatmentsByKid } from '../../../Redux/features/treatmentsSlice';
import { fetchEmployees } from '../../../Redux/features/employeesSlice';
import { fetchTreatmentTypes } from '../../../Redux/features/treatmentTypesSlice';
const TreatmentContext = createContext();

export const useTreatmentContext = () => useContext(TreatmentContext);

export const TreatmentProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { treatments } = useSelector(state => state.treatments);
  const treatmentTypes = useSelector(state => state.treatmentTypes.treatmentTypes);
  const { employees } = useSelector(state => state.employees);
  
  // מצבי הדיאלוגים
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentTreatment, setCurrentTreatment] = useState(null);
  
  // מצבי החיפוש והסינון - בסיסיים
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [employeeFilter, setEmployeeFilter] = useState('');
  
  // מצבי סינון נוספים
  const [cooperationLevelFilter, setCooperationLevelFilter] = useState(null);
  const [quickFilterPreset, setQuickFilterPreset] = useState(null);
  
  const [filteredTreatments, setFilteredTreatments] = useState([]);
  
  // מצבי העמוד והמיון
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('treatmentDate');
  const [order, setOrder] = useState('desc');
  
  // לוגיקה נוספת
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // עדכון הטיפולים המסוננים - לוגיקה משופרת
  useEffect(() => {
    if (!treatments || treatments.length === 0) {
      setFilteredTreatments([]);
          // dispatch(fetchTreatmentTypes());

      return;
    }
    
    // ודא שהעובדים נטענו לפני הסינון
    if (!employees || employees.length === 0) {
      // אם העובדים לא נטענו עדיין, נטען אותם
      dispatch(fetchEmployees());
      return;
    }
    
    // פונקציית סינון משופרת
    const filterTreatments = () => {
      return treatments.filter(treatment => {
        // סינון לפי חיפוש חופשי
        const searchMatches = searchTerm.trim() === '' ? true : 
          (treatment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          treatment.highlight?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          treatment.treatmentTypeId?.toString().includes(searchTerm.toLowerCase()) ||
          treatment.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // סינון לפי תאריכים
        const treatmentDate = treatment.treatmentDate ? new Date(treatment.treatmentDate) : null;
        const dateFromMatches = !dateFrom || !treatmentDate ? true : treatmentDate >= dateFrom;
        const dateToMatches = !dateTo || !treatmentDate ? true : treatmentDate <= dateTo;
        
        // סינון לפי עובד
        const employeeMatches = !employeeFilter ? true : 
          getEmployeeName(treatment.employeeId)?.toLowerCase().includes(employeeFilter.toLowerCase());
        
        // סינון לפי רמת שיתוף פעולה
        const cooperationMatches = !cooperationLevelFilter ? true :
          (treatment.cooperationLevel >= cooperationLevelFilter[0] && 
           treatment.cooperationLevel <= cooperationLevelFilter[1]);
        
        return searchMatches && dateFromMatches && dateToMatches && 
               employeeMatches && cooperationMatches;
      });
    };
    
    // סינון וגם מיון
    let filtered = filterTreatments();
    
    // מיון הטיפולים
    filtered = filtered.sort((a, b) => {
      // טיפול במיון לפי תאריך
      if (orderBy === 'treatmentDate') {
        const dateA = a.treatmentDate ? new Date(a.treatmentDate) : new Date(0);
        const dateB = b.treatmentDate ? new Date(b.treatmentDate) : new Date(0);
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // מיון לפי רמת שיתוף פעולה
      if (orderBy === 'cooperationLevel') {
        const levelA = a.cooperationLevel || 0;
        const levelB = b.cooperationLevel || 0;
        return order === 'asc' ? levelA - levelB : levelB - levelA;
      }
      
     
      // מיון לפי שדות טקסט אחרים
      const valueA = a[orderBy] || '';
      const valueB = b[orderBy] || '';
      
      return order === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });
    
    setFilteredTreatments(filtered);
  }, [
    treatments, 
    searchTerm, 
    dateFrom, 
    dateTo, 
    employeeFilter, 
    cooperationLevelFilter,
    orderBy, 
    order,
    treatmentTypes,
    employees
  ]);

  // פונקציית מיון
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // ניקוי פילטרים משופר
  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom(null);
    setDateTo(null);
    setEmployeeFilter('');
    setCooperationLevelFilter(null);
    setQuickFilterPreset(null);
    setPage(0);
  };

  // פונקציות דיאלוגים
  const openAddDialog = () => {
    setCurrentTreatment(null);
    setIsAddDialogOpen(true);
  };

  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  const openViewDialog = (treatment) => {
    setCurrentTreatment(treatment);
    setIsViewDialogOpen(true);
  };

  const closeViewDialog = () => {
    setIsViewDialogOpen(false);
    setCurrentTreatment(null);
  };

  // הוספת טיפול חדש
  const addTreatment = async (kidId, treatmentData) => {
    setLoading(true);
    setError(null);
    console.log('dsvcedsscsdcsdcddddddddddddddddddddddd',treatmentData)
    try {
      const response = await axios.post(`/treatments`, {
        ...treatmentData,
        kidId
      });
      
      setLoading(false);
      closeAddDialog();
      
      // עדכון הרשימה אחרי הוספה
      dispatch(fetchTreatmentsByKid({ kidId, treatmentType: treatmentData.treatmentTypeId }));
      
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'שגיאה בהוספת טיפול');
      throw err;
    }
  };

  // עדכון טיפול קיים
  const updateTreatment = async (treatmentId, treatmentData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`/treatments/${treatmentId}`, treatmentData);
      
      setLoading(false);
      closeViewDialog();
      
      // עדכון הרשימה
      if (treatmentData.kidId) {
        dispatch(fetchTreatmentsByKid({ 
          kidId: treatmentData.kidId, 
          treatmentType: treatmentData.treatmentTypeId 
        }));
      }
      
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'שגיאה בעדכון טיפול');
      throw err;
    }
  };

  // מחיקת טיפול
  const deleteTreatment = async (treatmentId, kidId, treatmentTypeId) => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.delete(`/treatments/${treatmentId}`);
      
      setLoading(false);
      closeViewDialog();
      
      // עדכון הרשימה
      if (kidId) {
        dispatch(fetchTreatmentsByKid({ kidId, treatmentType: treatmentTypeId }));
      }
      
      return true;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'שגיאה במחיקת טיפול');
      throw err;
    }
  };
  
  // עזרים נוספים
  const getColorForTreatmentType = (typeId) => {
    const treatmentType = treatmentTypes.find(t => t.treatmentTypeId == typeId);
    return treatmentType?.treatmentColor || '#cccccc';
  };

  const getTreatmentName = (typeId) => {
  
    const treatmentType = treatmentTypes.find(t => t.treatmentTypeId == typeId);
    return treatmentType?.treatmentTypeName || 'לא ידוע';
  };

  // פונקציה לקבלת שם העובד לפי ID
  const getEmployeeName = (employeeId) => {
    if (!employeeId || !employees) return 'לא ידוע';
    const employee = employees.find(emp => emp.employeeId == employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'לא ידוע';
  };
const getEmployeePhoto = (employeeId) => {
    if (!employeeId || !employees) return 'לא ידוע';
    const employee = employees.find(emp => emp.employeeId == employeeId);
    return employee ? employee.photo : null;
  };
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };

  // פונקציות עבור סטטיסטיקות מהירות
  const getFilteredTreatmentStats = () => {
    if (!filteredTreatments.length) return {};
    
    const stats = {
      total: filteredTreatments.length,
      averageCooperation: 0,
      employeeDistribution: {},
      monthlyDistribution: {}
    };
    
    // חישוב ממוצע שיתוף פעולה
    const cooperationSum = filteredTreatments.reduce((sum, t) => sum + (t.cooperationLevel || 0), 0);
    stats.averageCooperation = (cooperationSum / filteredTreatments.length).toFixed(1);
    
    // חלוקה לפי מטפלים
    filteredTreatments.forEach(treatment => {
      const employeeName = getEmployeeName(treatment.employeeId) || 'לא ידוע';
      stats.employeeDistribution[employeeName] = 
        (stats.employeeDistribution[employeeName] || 0) + 1;
    });
    
    // חלוקה לפי חודש
    filteredTreatments.forEach(treatment => {
      if (treatment.treatmentDate) {
        const month = new Date(treatment.treatmentDate).toLocaleDateString('he-IL', { 
          year: 'numeric', 
          month: 'long' 
        });
        stats.monthlyDistribution[month] = (stats.monthlyDistribution[month] || 0) + 1;
      }
    });
    
    return stats;
  };

  const value = {
    // מצבי דיאלוגים
    isAddDialogOpen,
    isViewDialogOpen,
    currentTreatment,
    
    // פונקציות דיאלוגים
    openAddDialog,
    closeAddDialog,
    openViewDialog,
    closeViewDialog,
    
    // פעולות CRUD
    addTreatment,
    updateTreatment,
    deleteTreatment,
    
    // סינון ומיון - בסיסי
    searchTerm,
    setSearchTerm,
    filterOpen,
    setFilterOpen,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    employeeFilter,
    setEmployeeFilter,
    
    // סינון נוסף
    cooperationLevelFilter,
    setCooperationLevelFilter,
    quickFilterPreset,
    setQuickFilterPreset,
    
    filteredTreatments,
    clearFilters,
    
    // דפדוף
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    
    // מיון
    orderBy,
    order,
    handleRequestSort,
    
    // מצבים
    loading,
    error,
    
    // עזרים
    getColorForTreatmentType,
    getTreatmentName,
    getEmployeeName,
    getEmployeePhoto,
    formatDate,
    getFilteredTreatmentStats
  };

  return (
    <TreatmentContext.Provider value={value}>
      {children}
    </TreatmentContext.Provider>
  );
};

export default TreatmentProvider;