// AttendanceContext.js 
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { 
  fetchAttendanceByDate, 
  fetchAttendanceByKidId, 
  fetchMonthlySummary,
  addAttendanceRecord,
  updateAttendanceRecord
} from '../../Redux/features/attendanceSlice';
import PropTypes from 'prop-types';
import { useAuth } from '../../components/login/AuthContext';

const AttendanceContext = createContext();

export const useAttendance = () => useContext(AttendanceContext);

export const AttendanceProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { todayRecords, kidRecords, monthlySummary, status, error } = useSelector(state => state.attendance);
  const { kids } = useSelector(state => state.kids);
  const { currentUser } = useAuth();

  // States
  const [attendance, setAttendance] = useState({});
  const [absenceReasons, setAbsenceReasons] = useState({});
  const [selectedDateRange, setSelectedDateRange] = useState({
    rangeType: 'week',
    startDate: dayjs().startOf('week'),
    endDate: dayjs().endOf('week')
  });
  
  // Helper functions
  const today = dayjs().format("YYYY-MM-DD");
  
  useEffect(() => {
    if (todayRecords && todayRecords.length > 0) {
      const newAttendance = {};
      const newReasons = {};
      
      // First, initialize all active kids as absent
      const activeKids = kids.filter(k => k.isActive);
      activeKids.forEach(kid => {
        if (!newAttendance[kid.id]) {
          newAttendance[kid.id] = {};
        }
        newAttendance[kid.id][today] = false;
      });
      
      // Then update with actual data from server
      todayRecords.forEach(record => {
        if (!newAttendance[record.kidId]) {
          newAttendance[record.kidId] = {};
        }
        
        newAttendance[record.kidId][today] = record.isPresent;
        newAttendance[record.kidId].attendanceId = record.attendanceId;
        
        if (!record.isPresent && record.absenceReason) {
          newReasons[record.kidId] = record.absenceReason;
        }
      });
      
      setAttendance(newAttendance);
      setAbsenceReasons(newReasons);
    }
  }, [todayRecords, kids, today]);
  
  const loadTodayAttendance = useCallback(async (dateStr = today) => {
    try {
      // Fetch data from server
      const result = await dispatch(fetchAttendanceByDate(dateStr)).unwrap();
      
      // Initialize attendance state
      const initialAttendance = {};
      const initialReasons = {};
      
      // Set initial value for all active kids
      const activeKids = kids.filter(k => k.isActive);
      activeKids.forEach(kid => {
        if (!initialAttendance[kid.id]) {
          initialAttendance[kid.id] = {};
        }
        initialAttendance[kid.id][dateStr] = false;
      });
      
      // Update based on server data
      if (result && Array.isArray(result)) {
        result.forEach(record => {
          if (!initialAttendance[record.kidId]) {
            initialAttendance[record.kidId] = {};
          }
          
          initialAttendance[record.kidId][dateStr] = record.isPresent;
          initialAttendance[record.kidId].attendanceId = record.attendanceId;
          
          if (!record.isPresent && record.absenceReason) {
            initialReasons[record.kidId] = record.absenceReason;
          }
        });
      }
      
      setAttendance(initialAttendance);
      setAbsenceReasons(initialReasons);
      
      return result;
    } catch (err) {
      console.error("שגיאה בטעינת נתוני נוכחות:", err);
      throw err;
    }
  }, [dispatch, kids]);
  
  const handleAttendanceChange = useCallback((kidId, dateStr = today) => {
    setAttendance(prev => {
      const updatedState = { ...prev };
      
      if (!updatedState[kidId]) {
        updatedState[kidId] = {};
      }
      
      // Toggle the attendance state
      const currentValue = updatedState[kidId][dateStr] || false;
      updatedState[kidId] = {
        ...updatedState[kidId],
        [dateStr]: !currentValue
      };
      
      // Clear absence reason if marking as present
      if (!currentValue === true) {
        setAbsenceReasons(prevReasons => {
          const newReasons = { ...prevReasons };
          delete newReasons[kidId];
          return newReasons;
        });
      }
      
      return updatedState;
    });
  }, []);
  
  // Update absence reason
  const handleReasonChange = useCallback((kidId, reason) => {
    setAbsenceReasons(prev => ({
      ...prev,
      [kidId]: reason
    }));
  }, []);
  
  const saveAttendance = useCallback(async (dateStr = today, classId = null) => {
    const activeKids = kids.filter(k => {
      if (classId !== null && k.classId !== classId) {
        return false;
      }
      return k.isActive;
    });
    
    const userId = currentUser?.id;
    
    if (!userId) {
      console.error("משתמש לא מחובר");
      return false;
    }
    
    const promises = [];
    
    try {
      // Prepare all save operations
      for (const kid of activeKids) {
        // Find existing record
        const existingRecord = todayRecords.find(r => 
          r.kidId === kid.id && 
          dayjs(r.attendanceDate).format('YYYY-MM-DD') === dateStr
        );
        
        const recordId = existingRecord?.attendanceId || 0;
        const isPresent = attendance[kid.id]?.[dateStr] || false;
        
        const record = {
          attendanceId: recordId,
          kidId: kid.id,
          attendanceDate: new Date(dateStr).toISOString(),
          isPresent: isPresent,
          absenceReason: !isPresent ? (absenceReasons[kid.id] || "") : " ",
          reportedBy: userId
        };
        
        if (recordId === 0) {
          // Create new record
          promises.push(dispatch(addAttendanceRecord(record)).unwrap());
        } else {
          // Update existing record
          promises.push(dispatch(updateAttendanceRecord({ id: recordId, data: record })).unwrap());
        }
      }
      
      // Execute all saves
      await Promise.all(promises);
      
      // Reload data to sync with server
      await loadTodayAttendance(dateStr);
      
      return true;
    } catch (err) {
      console.error("שגיאה בשמירת נוכחות:", err);
      
      // Reload to sync with server even on error
      try {
        await loadTodayAttendance(dateStr);
      } catch (reloadErr) {
        console.error("שגיאה ברענון נתונים:", reloadErr);
      }
      
      return false;
    }
  }, [dispatch, kids, attendance, absenceReasons, todayRecords, currentUser, loadTodayAttendance]);
  
  const loadKidAttendance = useCallback(async (kidId) => {
    if (!kidId) return null;
    
    try {
      const result = await dispatch(fetchAttendanceByKidId(kidId)).unwrap();
      
      // The API returns { kidId, data: [...] }
      if (result && result.data) {
        return result.data;
      } else if (Array.isArray(result)) {
        return result;
      }
      
      return [];
    } catch (err) {
      console.error("שגיאה בטעינת נתוני נוכחות לילד:", err);
      return [];
    }
  }, [dispatch]);
  
  // Load monthly attendance summary
  const loadMonthlySummary = useCallback(async (year, month) => {
    try {
      const result = await dispatch(fetchMonthlySummary({ year, month })).unwrap();
      return result;
    } catch (err) {
      console.error("שגיאה בטעינת סיכום נוכחות חודשי:", err);
      return {};
    }
  }, [dispatch]);
  
  // Update date range
  const updateDateRange = useCallback((rangeType, startDate = null, endDate = null) => {
    const newRange = { rangeType };
    
    if (rangeType === 'week') {
      newRange.startDate = dayjs().startOf('week');
      newRange.endDate = dayjs().endOf('week');
    } else if (rangeType === 'month') {
      newRange.startDate = dayjs().startOf('month');
      newRange.endDate = dayjs().endOf('month');
    } else if (rangeType === 'custom') {
      newRange.startDate = startDate || dayjs().startOf('week');
      newRange.endDate = endDate || dayjs().endOf('week');
    }
    
    setSelectedDateRange(newRange);
  }, []);
  
  const hasAttendanceData = useCallback((dateStr = today) => {
    const activeKids = kids.filter(k => k.isActive);
    return activeKids.some(kid => 
      attendance[kid.id] && 
      attendance[kid.id][dateStr] !== undefined
    );
  }, [kids, attendance]);
  
  const clearAttendance = useCallback(() => {
    setAttendance({});
    setAbsenceReasons({});
  }, []);
  
  const value = {
    // States
    attendance,
    absenceReasons,
    selectedDateRange,
    today,
    isLoading: status === 'loading',
    error,
    
    // Functions
    loadTodayAttendance,
    handleAttendanceChange,
    handleReasonChange,
    saveAttendance,
    loadKidAttendance,
    loadMonthlySummary,
    updateDateRange,
    hasAttendanceData,
    clearAttendance,
    
    // Redux data
    todayRecords,
    kidRecords,
    monthlySummary
  };
  
  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

AttendanceProvider.propTypes = {
  children: PropTypes.node.isRequired
};