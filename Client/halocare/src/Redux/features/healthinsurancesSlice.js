import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// Loading the list of health insurance funds
export const fetchHealthInsurances = createAsyncThunk(
  'healthInsurances/fetchHealthInsurances',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/ReferenceData/healthinsurances");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת רשימת קופות החולים');
    }
  }
);

// Adding a new health insurance plan
export const addHealthInsurance = createAsyncThunk(
  'healthInsurances/addHealthInsurance',
  async (healthInsuranceData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/ReferenceData/healthinsurances", healthInsuranceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בהוספת קופת החולים');
    }
  }
);

// Health insurance update
export const updateHealthInsurance = createAsyncThunk(
  'healthInsurances/updateHealthInsurance',
  async ({ oldName, newData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/ReferenceData/healthinsurances/${oldName}`, newData);
      return { oldName, newData: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון קופת החולים');
    }
  }
);

const healthInsuranceSlice = createSlice({
  name: 'healthInsurances',
  initialState: {
    healthInsurances: [],
    status: 'idle',
    error: null,
    actionStatus: 'idle'
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetActionStatus: (state) => {
      state.actionStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Health Insurances
      .addCase(fetchHealthInsurances.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHealthInsurances.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.healthInsurances = action.payload;
      })
      .addCase(fetchHealthInsurances.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Add Health Insurance
      .addCase(addHealthInsurance.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(addHealthInsurance.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.healthInsurances.push(action.payload);
      })
      .addCase(addHealthInsurance.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })
      
      // Update Health Insurance
      .addCase(updateHealthInsurance.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(updateHealthInsurance.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const { oldName, newData } = action.payload;
        const index = state.healthInsurances.findIndex(insurance => insurance.hName === oldName);
        if (index !== -1) {
          state.healthInsurances[index] = newData;
        }
      })
      .addCase(updateHealthInsurance.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      });
  }
});

export const { clearError, resetActionStatus } = healthInsuranceSlice.actions;
export default healthInsuranceSlice.reducer;