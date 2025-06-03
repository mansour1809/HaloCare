// src/Redux/features/onboardingSlice.js - גרסה מחודשת
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// קבלת סטטוס תהליך קליטה
export const fetchOnboardingStatus = createAsyncThunk(
  'onboarding/fetchOnboardingStatus',
  async (kidId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/KidOnboarding/status/${kidId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת סטטוס התהליך');
    }
  }
);

// השלמת שלב
export const completeFormStep = createAsyncThunk(
  'onboarding/completeFormStep',
  async ({ kidId, formId }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/KidOnboarding/complete-step', {
        kidId,
        formId
      });
      return { kidId, formId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בהשלמת השלב');
    }
  }
);

// קבלת טפסים זמינים
export const fetchAvailableForms = createAsyncThunk(
  'onboarding/fetchAvailableForms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/KidOnboarding/forms');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת רשימת הטפסים');
    }
  }
);

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState: {
    currentOnboarding: null, // התהליך הנוכחי
    availableForms: [], // רשימת כל הטפסים
    status: 'idle',
    error: null
  },
  reducers: {
    clearOnboardingData: (state) => {
    state.currentOnboarding = null;
    state.error = null;
  },
    setCurrentKidForOnboarding: (state, action) => {
      state.currentKidId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch onboarding status
      .addCase(fetchOnboardingStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOnboardingStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentOnboarding = action.payload;
      })
      .addCase(fetchOnboardingStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Complete form step
      .addCase(completeFormStep.fulfilled, (state, action) => {
        // עדכון הסטטוס המקומי
        if (state.currentOnboarding) {
          const formIndex = state.currentOnboarding.forms.findIndex(
            f => f.form.formId === action.payload.formId
          );
          if (formIndex !== -1) {
            state.currentOnboarding.forms[formIndex].status = 'completed';
          }
        }
      })
      
      // Fetch available forms
      .addCase(fetchAvailableForms.fulfilled, (state, action) => {
        state.availableForms = action.payload;
      });
  }
});

export const { clearOnboardingData, setCurrentKidForOnboarding } = onboardingSlice.actions;
export default onboardingSlice.reducer;