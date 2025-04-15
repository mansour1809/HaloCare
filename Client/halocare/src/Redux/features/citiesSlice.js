
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

export const fetchCities = createAsyncThunk(
  'cities/fetchCities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/ReferenceData/cities");
      return response.data;
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