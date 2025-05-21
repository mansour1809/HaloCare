
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

export const fetchHealthInsurances = createAsyncThunk(
  'healthinsurances/fetchHealthInsurances',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/ReferenceData/healthinsurances");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const healthInsurancesSlice = createSlice({
    name: 'healthinsurances',
    initialState: {
      healthInsurances: [],
      status: 'idle',
      error: null
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchHealthInsurances.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(fetchHealthInsurances.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.healthInsurances = action.payload;
        })
        .addCase(fetchHealthInsurances.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload || 'שגיאה בטעינת רשימת קופות חולים';
        });
    }
  });

  export default healthInsurancesSlice.reducer;