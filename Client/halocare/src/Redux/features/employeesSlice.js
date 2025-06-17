// src/Redux/features/employeesSlice.js - עם תוספת fetchEmployeeById
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// פעולה אסינכרונית לטעינת רשימת העובדים
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/Employees');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// פעולה אסינכרונית לטעינת עובד ספציפי לפי ID
export const fetchEmployeeById = createAsyncThunk(
  'employees/fetchEmployeeById',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Employees/${employeeId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת פרטי העובד');
    }
  }
);

const employeesSlice = createSlice({
  name: 'employees',
  initialState: {
    employees: [],
    selectedEmployee: null, // עובד נבחר ספציפי
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    employeeStatus: 'idle', // עבור טעינת עובד ספציפי
    error: null
  },
  reducers: {
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
      state.employeeStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // טעינת כל העובדים
      .addCase(fetchEmployees.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // טעינת עובד ספציפי
      .addCase(fetchEmployeeById.pending, (state) => {
        state.employeeStatus = 'loading';
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.employeeStatus = 'succeeded';
        state.selectedEmployee = action.payload;
        
        // גם מעדכנים ברשימה הכללית אם העובד קיים שם
        const existingIndex = state.employees.findIndex(emp => emp.employeeId === action.payload.employeeId);
        if (existingIndex !== -1) {
          state.employees[existingIndex] = action.payload;
        }
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.employeeStatus = 'failed';
        state.error = action.payload;
      });
  }
});

export const { clearSelectedEmployee } = employeesSlice.actions;
export default employeesSlice.reducer;