// attendanceSlice.js - FIXED VERSION
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// Async Thunks
export const fetchAllAttendance = createAsyncThunk(
  'attendance/fetchAllAttendance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/Attendance');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת נתוני נוכחות');
    }
  }
);

export const fetchAttendanceByKidId = createAsyncThunk(
  'attendance/fetchAttendanceByKidId',
  async (kidId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Attendance/kid/${kidId}`);
      // Return data in consistent format
      return {
        kidId: kidId,
        data: response.data
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת נתוני הנוכחות לילד');
    }
  }
);

export const fetchAttendanceByDate = createAsyncThunk(
  'attendance/fetchAttendanceByDate',
  async (date, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Attendance/date/${date}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת נתוני הנוכחות לתאריך');
    }
  }
);

export const fetchMonthlySummary = createAsyncThunk(
  'attendance/fetchMonthlySummary',
  async ({ year, month }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Attendance/monthly-summary/${year}/${month}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת סיכום הנוכחות החודשי');
    }
  }
);

export const addAttendanceRecord = createAsyncThunk(
  'attendance/addAttendanceRecord',
  async (attendanceData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/Attendance', attendanceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בהוספת רשומת הנוכחות');
    }
  }
);

export const updateAttendanceRecord = createAsyncThunk(
  'attendance/updateAttendanceRecord',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/Attendance/${id}`, data);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון רשומת הנוכחות');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    allAttendance: [],
    todayRecords: [],
    kidRecords: {},
    monthlySummary: {},
    currentDate: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    lastUpdated: null
  },
  reducers: {
    clearAttendanceData: (state) => {
      state.todayRecords = [];
      state.kidRecords = {};
      state.error = null;
      state.status = 'idle';
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentDate: (state, action) => {
      state.currentDate = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchAllAttendance
      .addCase(fetchAllAttendance.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllAttendance.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allAttendance = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAllAttendance.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // fetchAttendanceByDate (today)
      .addCase(fetchAttendanceByDate.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAttendanceByDate.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.todayRecords = action.payload || [];
        state.currentDate = action.meta.arg;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAttendanceByDate.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.todayRecords = []; // Clear on error
      })
      
      // fetchAttendanceByKidId
      .addCase(fetchAttendanceByKidId.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAttendanceByKidId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Store data by kid ID
        if (action.payload.kidId) {
          state.kidRecords[action.payload.kidId] = action.payload.data || [];
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAttendanceByKidId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // fetchMonthlySummary
      .addCase(fetchMonthlySummary.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMonthlySummary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.monthlySummary = action.payload || {};
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchMonthlySummary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // addAttendanceRecord
      .addCase(addAttendanceRecord.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addAttendanceRecord.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Add the new record to todayRecords if it's for today
        if (action.payload && state.currentDate) {
          const recordDate = new Date(action.payload.attendanceDate).toISOString().split('T')[0];
          if (recordDate === state.currentDate) {
            // Check if record already exists
            const existingIndex = state.todayRecords.findIndex(r => r.kidId === action.payload.kidId);
            if (existingIndex === -1) {
              state.todayRecords.push(action.payload);
            } else {
              state.todayRecords[existingIndex] = action.payload;
            }
          }
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(addAttendanceRecord.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // updateAttendanceRecord
      .addCase(updateAttendanceRecord.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateAttendanceRecord.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update the record in todayRecords if it exists
        if (action.payload && action.payload.data) {
          const updatedRecord = action.payload.data;
          const index = state.todayRecords.findIndex(r => r.attendanceId === updatedRecord.attendanceId);
          if (index !== -1) {
            state.todayRecords[index] = updatedRecord;
          }
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateAttendanceRecord.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { clearAttendanceData, clearError, setCurrentDate } = attendanceSlice.actions;

// Selectors
export const selectTodayRecords = (state) => state.attendance.todayRecords;
export const selectKidRecords = (kidId) => (state) => state.attendance.kidRecords[kidId] || [];
export const selectAttendanceStatus = (state) => state.attendance.status;
export const selectAttendanceError = (state) => state.attendance.error;
export const selectCurrentDate = (state) => state.attendance.currentDate;

export default attendanceSlice.reducer;