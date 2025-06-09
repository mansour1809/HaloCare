// src/Redux/features/onboardingSlice.js - עדכון מלא לשרת החדש
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// קבלת סטטוס תהליך קליטה
export const fetchOnboardingStatus = createAsyncThunk(
  'onboarding/fetchOnboardingStatus',
  async (kidId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Onboarding/status/${kidId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת סטטוס התהליך');
    }
  }
);

// התחלת תהליך קליטה חדש
export const startOnboardingProcess = createAsyncThunk(
  'onboarding/startOnboardingProcess',
  async (kidId, { rejectWithValue }) => {
    try {
      const response = await axios.post('/Onboarding/start', { kidId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בהתחלת תהליך קליטה');
    }
  }
);

// התחלת מילוי טופס
export const startForm = createAsyncThunk(
  'onboarding/startForm',
  async ({ kidId, formId }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/Onboarding/forms/start', {
        kidId,
        formId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בהתחלת טופס');
    }
  }
);

// עדכון התקדמות טופס
export const updateFormProgress = createAsyncThunk(
  'onboarding/updateFormProgress',
  async ({ kidId, formId }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/Onboarding/forms/progress', {
        kidId,
        formId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון התקדמות');
    }
  }
);

// השלמת טופס
export const completeForm = createAsyncThunk(
  'onboarding/completeForm',
  async ({ kidId, formId }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/Onboarding/forms/complete', {
        kidId,
        formId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בהשלמת טופס');
    }
  }
);

// שליחת טופס להורים
export const sendFormToParent = createAsyncThunk(
  'onboarding/sendFormToParent',
  async ({ kidId, formId }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/Onboarding/forms/send-to-parent', {
        kidId,
        formId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בשליחת טופס להורים');
    }
  }
);

// קבלת סיכום תהליך קליטה
export const fetchOnboardingSummary = createAsyncThunk(
  'onboarding/fetchOnboardingSummary',
  async (kidId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Onboarding/summary/${kidId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת סיכום');
    }
  }
);

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState: {
    currentProcess: null, // התהליך הנוכחי (OnboardingStatusDto)
    processId: null,
    status: 'idle', // idle, loading, succeeded, failed
    error: null,
    formActions: {
      starting: false,
      completing: false,
      sendingToParent: false,
      updating: false
    }
  },
  reducers: {
    clearOnboardingData: (state) => {
      state.currentProcess = null;
      state.processId = null;
      state.error = null;
      state.status = 'idle';
    },
    clearError: (state) => {
      state.error = null;
    },
    updateLocalFormStatus: (state, action) => {
      const { formId, status: newStatus } = action.payload;
      if (state.currentProcess?.forms) {
        const formIndex = state.currentProcess.forms.findIndex(f => f.formId === formId);
        if (formIndex !== -1) {
          state.currentProcess.forms[formIndex].status = newStatus;
          state.currentProcess.forms[formIndex].lastUpdated = new Date().toISOString();
          
          // עדכון סטטיסטיקות
          const completedForms = state.currentProcess.forms.filter(
            f => f.status === 'completed' || f.status === 'completed_by_parent'
          ).length;
          state.currentProcess.stats.completedForms = completedForms;
          state.currentProcess.stats.completionPercentage = Math.round(
            (completedForms / state.currentProcess.stats.totalForms) * 100
          );
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch onboarding status
      .addCase(fetchOnboardingStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOnboardingStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentProcess = action.payload;
        state.processId = action.payload.process.processId;
      })
      .addCase(fetchOnboardingStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.currentProcess = null;
      })
      
      // Start onboarding process
      .addCase(startOnboardingProcess.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(startOnboardingProcess.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.processId = action.payload.processId;
      })
      .addCase(startOnboardingProcess.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Start form
      .addCase(startForm.pending, (state) => {
        state.formActions.starting = true;
      })
      .addCase(startForm.fulfilled, (state, action) => {
        state.formActions.starting = false;
        // הסטטוס יתעדכן ברענון הבא
      })
      .addCase(startForm.rejected, (state, action) => {
        state.formActions.starting = false;
        state.error = action.payload;
      })
      
      // Complete form
      .addCase(completeForm.pending, (state) => {
        state.formActions.completing = true;
      })
      .addCase(completeForm.fulfilled, (state, action) => {
        state.formActions.completing = false;
        // עדכון מקומי של הסטטוס
        // הנתונים המדויקים יתעדכנו ברענון הבא
      })
      .addCase(completeForm.rejected, (state, action) => {
        state.formActions.completing = false;
        state.error = action.payload;
      })
      
      // Send form to parent
      .addCase(sendFormToParent.pending, (state) => {
        state.formActions.sendingToParent = true;
      })
      .addCase(sendFormToParent.fulfilled, (state, action) => {
        state.formActions.sendingToParent = false;
      })
      .addCase(sendFormToParent.rejected, (state, action) => {
        state.formActions.sendingToParent = false;
        state.error = action.payload;
      })
      
      // Update form progress
      .addCase(updateFormProgress.pending, (state) => {
        state.formActions.updating = true;
      })
      .addCase(updateFormProgress.fulfilled, (state, action) => {
        state.formActions.updating = false;
      })
      .addCase(updateFormProgress.rejected, (state, action) => {
        state.formActions.updating = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearOnboardingData, 
  clearError, 
  updateLocalFormStatus 
} = onboardingSlice.actions;

export default onboardingSlice.reducer;


