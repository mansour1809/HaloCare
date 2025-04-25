import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// פעולה אסינכרונית לטעינת רשימת הכיתות
export const fetchClasses = createAsyncThunk(
  'classes/fetchClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/Classes');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const classesSlice = createSlice({
  name: 'classes',
  initialState: {
    classes: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      });
  }
});

export default classesSlice.reducer;