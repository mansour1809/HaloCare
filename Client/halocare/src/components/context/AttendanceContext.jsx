// AttendanceContext.js
import { createContext, useContext, useState, useCallback } from 'react';
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

const AttendanceContext = createContext();

export const useAttendance = () => useContext(AttendanceContext);

export const AttendanceProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { todayRecords, kidRecords, monthlySummary, status, error } = useSelector(state => state.attendance);
  const { kids } = useSelector(state => state.kids);
  
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
  
  // Load attendance data for a specific day
  const loadTodayAttendance = useCallback(async (dateStr = today) => {
    try {
      await dispatch(fetchAttendanceByDate(dateStr));
      
      // Initialize attendance state based on server data
      const initialAttendance = {};
      const initialReasons = {};
      
      // Set initial value for all kids
      const activeKids = kids.filter(k => k.isActive);
      activeKids.forEach(kid => {
        initialAttendance[kid.id] = { ...initialAttendance[kid.id] };
        initialAttendance[kid.id][dateStr] = false;
      });
      
      // Update based on data received from the server
      todayRecords.forEach(record => {
        if (!initialAttendance[record.kidId]) {
          initialAttendance[record.kidId] = {};
        }
        
        initialAttendance[record.kidId][dateStr] = record.isPresent;
        initialAttendance[record.kidId].attendanceId = record.attendanceId;
        
        if (!record.isPresent && record.absenceReason) {
          initialReasons[record.kidId] = record.absenceReason;
        }
      });
      setAttendance(initialAttendance);
      setAbsenceReasons(initialReasons);
    } catch (err) {
      console.error("שגיאה בטעינת נתוני נוכחות להיום:", err);
    }
  }, [dispatch, kids, todayRecords, today]);
  
  // Change attendance status for a kid
  const handleAttendanceChange = useCallback((kidId, dateStr = today) => {
    setAttendance(prev => {
      const updatedState = { ...prev };
      
      if (!updatedState[kidId]) {
        updatedState[kidId] = {};
      }
      
      updatedState[kidId] = {
        ...updatedState[kidId],
        [dateStr]: !updatedState[kidId]?.[dateStr]
      };
      
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
  
  // Save attendance to the server
  const saveAttendance = useCallback(async (dateStr = today, classId = null) => {
    const activeKids = kids.filter(k => {
      // If a specific class is selected, filter only kids from that class
      if (classId !== null && k.classId !== classId) {
        return false;
      }
      return k.isActive;
    });
    
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;
    
    try {
      // Iterate over all kids and save/update data
      for (const kid of activeKids) {
        const existingRecord = todayRecords.find(r => r.kidId === kid.id);
        const recordId = attendance[kid.id]?.attendanceId || existingRecord?.attendanceId || 0;
        
        const record = {
          attendanceId: recordId,
          kidId: kid.id,
          attendanceDate: new Date(dateStr).toISOString(),
          isPresent: attendance[kid.id]?.[dateStr] || false,
          absenceReason: attendance[kid.id]?.[dateStr] ? "" : absenceReasons[kid.id] || "",
          reportedBy: userId
        };
        
        if (recordId === 0) {
          // Create a new record
          await dispatch(addAttendanceRecord(record));
        } else {
          // Update an existing record
          await dispatch(updateAttendanceRecord({ id: recordId, data: record }));
        }
      }
      
      // Update local data
      await loadTodayAttendance(dateStr);
      
      return true;
    } catch (err) {
      console.error("שגיאה בשמירת נוכחות:", err);
      return false;
    }
  }, [dispatch, kids, attendance, absenceReasons, todayRecords, loadTodayAttendance, today]);
  
  // Load attendance data for a specific kid within a date range
  const loadKidAttendance = useCallback(async (kidId) => {
    if (!kidId) return null;
    
    try {
      await dispatch(fetchAttendanceByKidId(kidId));
      return kidRecords[kidId] || [];
    } catch (err) {
      console.error("שגיאה בטעינת נתוני נוכחות לילד:", err);
      return [];
    }
  }, [dispatch, kidRecords]);
  
  // Load monthly attendance summary
  const loadMonthlySummary = useCallback(async (year, month) => {
    try {
      await dispatch(fetchMonthlySummary({ year, month }));
      return monthlySummary;
    } catch (err) {
      console.error("שגיאה בטעינת סיכום נוכחות חודשי:", err);
      return {};
    }
  }, [dispatch, monthlySummary]);
  
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
    updateDateRange
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