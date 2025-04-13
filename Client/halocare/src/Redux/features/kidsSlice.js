// src/Redux/features/kids/kidsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// פעולה אסינכרונית לטעינת רשימת הילדים
export const fetchKids = createAsyncThunk(
  'kids/fetchKids',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/Kids');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const kidsSlice = createSlice({
  name: 'kids',
  initialState: {
    kids: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKids.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchKids.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.kids = action.payload;
      })
      .addCase(fetchKids.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export default kidsSlice.reducer;