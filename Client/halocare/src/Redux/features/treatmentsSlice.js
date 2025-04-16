// src/store/slices/treatmentsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

export const fetchTreatmentsByKid = createAsyncThunk(
  'treatments/fetchTreatmentsByKid',
  async (kidId,treatmentType, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Treatments/kid/${kidId}/${treatmentType}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const treatmentsSlice = createSlice({
  name: 'treatments',
  initialState: {
    treatments: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTreatmentsByKid.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTreatmentsByKid.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.treatments = action.payload;
      })
      .addCase(fetchTreatmentsByKid.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת רשימת הטיפולים';
      });
  }
});

export default treatmentsSlice.reducer;