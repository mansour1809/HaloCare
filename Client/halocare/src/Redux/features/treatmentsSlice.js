// src/Redux/features/treatmentsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

export const fetchTreatmentsByKid = createAsyncThunk(
  'treatments/fetchTreatmentsByKid',
  async ({ kidId, treatmentType }, { rejectWithValue }) => {
    const treatmentTypeId = treatmentType; 
    try {
      const response = await axios.get(`/Treatments/kid/${kidId}/${treatmentTypeId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת רשימת הטיפולים');
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
  reducers: {
    clearTreatments: (state) => {
      state.treatments = [];
      state.status = 'idle';
      state.error = null;
    }
  },
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

export const { clearTreatments } = treatmentsSlice.actions;

export default treatmentsSlice.reducer;