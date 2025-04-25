// src/context/TreatmentContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { fetchTreatmentsByKid } from '../../../Redux/features/treatmentsSlice';

const TreatmentContext = createContext();

export const useTreatmentContext = () => useContext(TreatmentContext);

export const TreatmentProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { treatments } = useSelector(state => state.treatments);
  const treatmentTypes = useSelector(state => state.treatmentTypes.treatmentTypes);
  
  // מצבי הדיאלוגים
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentTreatment, setCurrentTreatment] = useState(null);
  
  // מצבי החיפוש והסינון
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [filteredTreatments, setFilteredTreatments] = useState([]);
  
  // מצבי העמוד והמיון
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('treatmentDate');
  const [order, setOrder] = useState('desc');
  
  // לוגיקה נוספת
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // עדכון הטיפולים המסוננים
  useEffect(() => {
    if (!treatments || treatments.length === 0) {
      setFilteredTreatments([]);
      return;
    }
    
    // פונקציית סינון
    const filterTreatments = () => {
      return treatments.filter(treatment => {
        // סינון לפי חיפוש חופשי
        const matchesSearch = searchTerm.trim() === '' ? true : 
          (treatment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          treatment.highlight?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          treatment.treatmentTypeId?.toString().includes(searchTerm.toLowerCase()) ||
          treatment.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // סינון לפי תאריכים
        const treatmentDate = treatment.treatmentDate ? new Date(treatment.treatmentDate) : null;
        const matchesDateFrom = !dateFrom || !treatmentDate ? true : treatmentDate >= dateFrom;
        const matchesDateTo = !dateTo || !treatmentDate ? true : treatmentDate <= dateTo;
        
        // סינון לפי עובד
        const matchesEmployee = !employeeFilter ? true : 
          treatment.employeeName?.toLowerCase().includes(employeeFilter.toLowerCase());
        
        return matchesSearch && matchesDateFrom && matchesDateTo && matchesEmployee;
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
      
      // מיון לפי שדות טקסט
      const valueA = a[orderBy] || '';
      const valueB = b[orderBy] || '';
      
      return order === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });
    
    setFilteredTreatments(filtered);
  }, [treatments, searchTerm, dateFrom, dateTo, employeeFilter, orderBy, order]);

  // פונקציית מיון
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // ניקוי פילטרים
  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom(null);
    setDateTo(null);
    setEmployeeFilter('');
    setPage(0);
  };

  // הפונקציות הבאות כבר היו בקונטקסט
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
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
    
    // סינון ומיון
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
    formatDate
  };

  return (
    <TreatmentContext.Provider value={value}>
      {children}
    </TreatmentContext.Provider>
  );
};

export default TreatmentProvider;