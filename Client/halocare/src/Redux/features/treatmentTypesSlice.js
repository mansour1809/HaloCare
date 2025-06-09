import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// טעינת רשימת סוגי הטיפולים
export const fetchTreatmentTypes = createAsyncThunk(
  'treatmentTypes/fetchTreatmentTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/ReferenceData/treatmenttypes");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת רשימת סוגי הטיפולים');
    }
  }
);

// הוספת סוג טיפול חדש
export const addTreatmentType = createAsyncThunk(
  'treatmentTypes/addTreatmentType',
  async (treatmentTypeData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/ReferenceData/treatmenttypes", treatmentTypeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בהוספת סוג הטיפול');
    }
  }
);

// עדכון סוג טיפול
export const updateTreatmentType = createAsyncThunk(
  'treatmentTypes/updateTreatmentType',
  async (treatmentTypeData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/ReferenceData/treatmenttypes/${treatmentTypeData.treatmentTypeId}`, {
        NewTreatmentTypeName: treatmentTypeData.treatmentTypeName
      });
      return treatmentTypeData;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון סוג הטיפול');
    }
  }
);

const treatmentTypesSlice = createSlice({
  name: 'treatmentTypes',
  initialState: {
    treatmentTypes: [],
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
      // Fetch Treatment Types
      .addCase(fetchTreatmentTypes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTreatmentTypes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.treatmentTypes = action.payload;
      })
      .addCase(fetchTreatmentTypes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Add Treatment Type
      .addCase(addTreatmentType.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(addTreatmentType.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.treatmentTypes.push(action.payload);
      })
      .addCase(addTreatmentType.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })
      
      // Update Treatment Type
      .addCase(updateTreatmentType.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(updateTreatmentType.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const index = state.treatmentTypes.findIndex(type => type.treatmentTypeId === action.payload.treatmentTypeId);
        if (index !== -1) {
          state.treatmentTypes[index] = action.payload;
        }
      })
      .addCase(updateTreatmentType.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      });
  }
});

export const { clearError, resetActionStatus } = treatmentTypesSlice.actions;
export default treatmentTypesSlice.reducer;