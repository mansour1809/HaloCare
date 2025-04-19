// src/Redux/features/kidsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

export const fetchKids = createAsyncThunk(
  'kids/fetchKids',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/Kids');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת רשימת הילדים');
    }
  }
);

export const fetchKidById = createAsyncThunk(
  'kids/fetchKidById',
  async (kidId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Kids/${kidId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת פרטי הילד');
    }
  }
);

const kidsSlice = createSlice({
  name: 'kids',
  initialState: {
    kids: [],
    selectedKid: null,
    status: 'idle',
    error: null
  },
  reducers: {
    clearSelectedKid: (state) => {
      state.selectedKid = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch kids
      .addCase(fetchKids.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchKids.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.kids = action.payload;
      })
      .addCase(fetchKids.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת רשימת הילדים';
      })
      
      // Fetch kid by ID
      .addCase(fetchKidById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchKidById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedKid = action.payload;
      })
      .addCase(fetchKidById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת פרטי הילד';
      });
  }
});

export const { clearSelectedKid } = kidsSlice.actions;

export default kidsSlice.reducer;