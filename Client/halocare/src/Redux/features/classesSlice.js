import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// טעינת רשימת הכיתות
export const fetchClasses = createAsyncThunk(
  'classes/fetchClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/Classes');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת רשימת הכיתות');
    }
  }
);

// הוספת כיתה חדשה
export const addClass = createAsyncThunk(
  'classes/addClass',
  async (classData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/Classes', classData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בהוספת הכיתה');
    }
  }
);

// עדכון כיתה
export const updateClass = createAsyncThunk(
  'classes/updateClass',
  async (classData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/Classes/${classData.classId}`, classData);
      return classData;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון הכיתה');
    }
  }
);

const classesSlice = createSlice({
  name: 'classes',
  initialState: {
    classes: [],
    status: 'idle',
    error: null,
    actionStatus: 'idle'
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetActionStatus: (state) => {
      state.actionStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Classes
      .addCase(fetchClasses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.classes = action.payload;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Add Class
      .addCase(addClass.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(addClass.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.classes.push(action.payload);
      })
      .addCase(addClass.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })
      
      // Update Class
      .addCase(updateClass.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(updateClass.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const index = state.classes.findIndex(cls => cls.classId === action.payload.classId);
        if (index !== -1) {
          state.classes[index] = action.payload;
        }
      })
      .addCase(updateClass.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      });
  }
});

export const { clearError, resetActionStatus } = classesSlice.actions;
export default classesSlice.reducer;