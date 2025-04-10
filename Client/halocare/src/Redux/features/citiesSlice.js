import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { citiesAPI } from './citiesAPI';

export const fetchCities = createAsyncThunk(
  'cities/fetchCities',
  async (_, { rejectWithValue }) => {
    try {
      return await citiesAPI.fetchCities();
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const citiesSlice = createSlice({
    name: 'cities',
    initialState: {
      cities: [],
      status: 'idle',
      error: null
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchCities.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(fetchCities.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.cities = action.payload;
        })
        .addCase(fetchCities.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload || 'שגיאה בטעינת רשימת הערים';
        });
    }
  });
  
  export default citiesSlice.reducer;