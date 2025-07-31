/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';
import { fetchTreatmentsByKid } from '../../../Redux/features/treatmentsSlice';
import { fetchTreatmentTypes } from '../../../Redux/features/treatmentTypesSlice';
import { fetchEmployees } from '../../../Redux/features/employeesSlice';
const TreatmentContext = createContext();

export const useTreatmentContext = () => useContext(TreatmentContext);

export const TreatmentProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { treatments } = useSelector(state => state.treatments);
  const treatmentTypes = useSelector(state => state.treatmentTypes.treatmentTypes);
  const { employees } = useSelector(state => state.employees);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentTreatment, setCurrentTreatment] = useState(null);
  
  // Basic search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [employeeFilter, setEmployeeFilter] = useState('');
  
  // Additional filter states
  const [cooperationLevelFilter, setCooperationLevelFilter] = useState(null);
  const [quickFilterPreset, setQuickFilterPreset] = useState(null);
  
  const [filteredTreatments, setFilteredTreatments] = useState([]);
  
  // Page and sorting states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('treatmentDate');
  const [order, setOrder] = useState('desc');
  
  // Additional logic
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update filtered treatments 
  useEffect(() => {

    if(treatmentTypes.length === 0) {
      dispatch(fetchTreatmentTypes());
    }

    if (!treatments || treatments.length === 0) {
      setFilteredTreatments([]);
      return;
    }
    
    // Ensure employees are loaded before filtering
    if (!employees || employees.length === 0) {
      // If employees are not loaded yet, load them
      dispatch(fetchEmployees());
      return;
    }
    
    // Improved filtering function
    const filterTreatments = () => {
      return treatments.filter(treatment => {
        // Filter by free text search
        const searchMatches = searchTerm.trim() === '' ? true : 
          (treatment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          treatment.highlight?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          treatment.treatmentTypeId?.toString().includes(searchTerm.toLowerCase()) ||
          treatment.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Filter by dates
        const treatmentDate = treatment.treatmentDate ? new Date(treatment.treatmentDate) : null;
        const dateFromMatches = !dateFrom || !treatmentDate ? true : treatmentDate >= dateFrom;
        const dateToMatches = !dateTo || !treatmentDate ? true : treatmentDate <= dateTo;
        
        // Filter by employee
        const employeeMatches = !employeeFilter ? true : 
          getEmployeeName(treatment.employeeId)?.toLowerCase().includes(employeeFilter.toLowerCase());
        
        // Filter by cooperation level
        const cooperationMatches = !cooperationLevelFilter ? true :
          (treatment.cooperationLevel >= cooperationLevelFilter[0] && 
           treatment.cooperationLevel <= cooperationLevelFilter[1]);
        
        return searchMatches && dateFromMatches && dateToMatches && 
               employeeMatches && cooperationMatches;
      });
    };
    
    // Filtering and sorting
    let filtered = filterTreatments();
    
    // Sort treatments
    filtered = filtered.sort((a, b) => {
      // Handle sorting by date
      if (orderBy === 'treatmentDate') {
        const dateA = a.treatmentDate ? new Date(a.treatmentDate) : new Date(0);
        const dateB = b.treatmentDate ? new Date(b.treatmentDate) : new Date(0);
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Sort by cooperation level
      if (orderBy === 'cooperationLevel') {
        const levelA = a.cooperationLevel || 0;
        const levelB = b.cooperationLevel || 0;
        return order === 'asc' ? levelA - levelB : levelB - levelA;
      }
      
     
      // Sort by other text fields
      const valueA = a[orderBy] || '';
      const valueB = b[orderBy] || '';
      
      return order === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });
    
    setFilteredTreatments(filtered);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Sorting function
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Improved clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom(null);
    setDateTo(null);
    setEmployeeFilter('');
    setCooperationLevelFilter(null);
    setQuickFilterPreset(null);
    setPage(0);
  };

  // Dialog functions
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

  // Add new treatment
  const addTreatment = async ( treatmentData) => {
    setLoading(true);
    setError(null);
    try {
      console.log(treatmentData);
      const response = await axios.post(`/Treatments`, 
        treatmentData
      );
      setLoading(false);
      closeAddDialog();
      
      // Refresh the list after adding
      dispatch(fetchTreatmentsByKid({ kidId: treatmentData.kidId, treatmentType: treatmentData.treatmentTypeId }));
      
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'שגיאה בהוספת טיפול');
      throw err;
    }
  };

  // Update existing treatment
  const updateTreatment = async (treatmentId, treatmentData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`/treatments/${treatmentId}`, treatmentData);
      
      setLoading(false);
      closeViewDialog();
      
      // Refresh the list
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

  // Delete treatment
  const deleteTreatment = async (treatmentId, kidId, treatmentTypeId) => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.delete(`/treatments/${treatmentId}`);
      
      setLoading(false);
      closeViewDialog();
      
      // Update the list
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
  
  // Additional helpers
  const getColorForTreatmentType = (typeId) => {
    const treatmentType = treatmentTypes.find(t => t.treatmentTypeId == typeId);
    return treatmentType?.treatmentColor || '#cccccc';
  };

  const getTreatmentName = (typeId) => {
  console.log(typeId)
    const treatmentType = treatmentTypes.find(t => t.treatmentTypeId == typeId);
    console.log(treatmentTypes)
    return treatmentType?.treatmentTypeName || 'לא ידוע';
  };

  // Function to get employee name by ID
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

  // Functions for quick statistics
  const getFilteredTreatmentStats = () => {
    if (!filteredTreatments.length) return {};
    
    const stats = {
      total: filteredTreatments.length,
      averageCooperation: 0,
      employeeDistribution: {},
      monthlyDistribution: {}
    };
    
    // Calculate average cooperation
    const cooperationSum = filteredTreatments.reduce((sum, t) => sum + (t.cooperationLevel || 0), 0);
    stats.averageCooperation = (cooperationSum / filteredTreatments.length).toFixed(1);
    
    // Distribution by employees
    filteredTreatments.forEach(treatment => {
      const employeeName = getEmployeeName(treatment.employeeId) || 'לא ידוע';
      stats.employeeDistribution[employeeName] = 
        (stats.employeeDistribution[employeeName] || 0) + 1;
    });
    
    // Group by month
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
    // Dialog states
    isAddDialogOpen,
    isViewDialogOpen,
    currentTreatment,
    
    // Dialog functions
    openAddDialog,
    closeAddDialog,
    openViewDialog,
    closeViewDialog,
    
    // CRUD actions
    addTreatment,
    updateTreatment,
    deleteTreatment,
    
    // Basic filtering and sorting
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
    
    // Additional filtering
    cooperationLevelFilter,
    setCooperationLevelFilter,
    quickFilterPreset,
    setQuickFilterPreset,
    
    filteredTreatments,
    clearFilters,
    
    // Pagination
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    
    // Sorting
    orderBy,
    order,
    handleRequestSort,
    
    // States
    loading,
    error,
    
    // Helpers
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

TreatmentProvider.propTypes = {
  children: PropTypes.node.isRequired,
};