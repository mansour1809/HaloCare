// src/store/slices/treatmentTypesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

export const fetchTreatmentTypes = createAsyncThunk(
  'treatmentTypes/fetchTreatmentTypes',
  async (_, { rejectWithValue }) => {
    try {

      const response = await axios.get("/TreatmentTypes");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const treatmentTypesSlice = createSlice({
  name: 'treatmentTypes',
  initialState: {
    treatmentTypes: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTreatmentTypes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTreatmentTypes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.treatmentTypes = action.payload;
      })
      .addCase(fetchTreatmentTypes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת סוגי הטיפולים';
      });
  }
});

export default treatmentTypesSlice.reducer;