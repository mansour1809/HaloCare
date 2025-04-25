
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// פעולה אסינכרונית לטעינת רשימת סוגי האירועים
export const fetchEventTypes = createAsyncThunk(
  'eventTypes/fetchEventTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/EventTypes');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const eventTypesSlice = createSlice({
  name: 'eventTypes',
  initialState: {
    eventTypes: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventTypes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEventTypes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.eventTypes = action.payload;
      })
      .addCase(fetchEventTypes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export default eventTypesSlice.reducer;