// attendanceSlice.js
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
      return response.data;
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
      return { id, ...data };
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
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {
    clearAttendanceData: (state) => {
      state.todayRecords = [];
      state.kidRecords = {};
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchAllAttendance
      .addCase(fetchAllAttendance.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllAttendance.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allAttendance = action.payload;
      })
      .addCase(fetchAllAttendance.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // fetchAttendanceByDate (today)
      .addCase(fetchAttendanceByDate.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAttendanceByDate.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.todayRecords = action.payload;
        state.currentDate = action.meta.arg;
      })
      .addCase(fetchAttendanceByDate.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // fetchAttendanceByKidId
      .addCase(fetchAttendanceByKidId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAttendanceByKidId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // שמירת הנתונים לפי ID של הילד
        state.kidRecords[action.meta.arg] = action.payload;
        state.kidRecords[action.payload.kidId] = action.payload.data;

      })
      .addCase(fetchAttendanceByKidId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // fetchMonthlySummary
      .addCase(fetchMonthlySummary.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMonthlySummary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.monthlySummary = action.payload;
      })
      .addCase(fetchMonthlySummary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      
      
      // addAttendanceRecord
      .addCase(addAttendanceRecord.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      
      // updateAttendanceRecord
      .addCase(updateAttendanceRecord.fulfilled, (state, action) => {
        state.status = 'succeeded';
      });

      
  }
});

export const { clearAttendanceData } = attendanceSlice.actions;

export default attendanceSlice.reducer;