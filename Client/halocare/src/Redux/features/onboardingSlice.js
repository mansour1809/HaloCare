// src/Redux/features/onboardingSlice.js - גרסה מחודשת
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// קבלת סטטוס תהליך קליטה מלא
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

// השלמת טופס
export const completeForm = createAsyncThunk(
  'onboarding/completeForm',
  async ({ kidId, formId }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/KidOnboarding/complete-form', {
        kidId,
        formId
      });
      return { kidId, formId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בהשלמת הטופס');
    }
  }
);

// שליחת טופס להורים
export const sendFormToParent = createAsyncThunk(
  'onboarding/sendFormToParent',
  async ({ kidId, formId }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/KidOnboarding/send-to-parent', {
        kidId,
        formId
      });
      return { kidId, formId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בשליחת הטופס');
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
    currentProcess: null, // התהליך הנוכחי עם כל הטפסים
    availableForms: [], // רשימת כל הטפסים
    selectedFormId: null, // הטופס שנבחר כרגע
    status: 'idle',
    error: null
  },
  reducers: {
    clearOnboardingData: (state) => {
      state.currentProcess = null;
      state.selectedFormId = null;
      state.error = null;
    },
    setSelectedForm: (state, action) => {
      state.selectedFormId = action.payload;
    },
    updateFormStatus: (state, action) => {
      const { formId, status, completedAt } = action.payload;
      if (state.currentProcess && state.currentProcess.forms) {
        const form = state.currentProcess.forms.find(f => f.formId === formId);
        if (form) {
          form.status = status;
          if (completedAt) {
            form.completedAt = completedAt;
          }
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
      })
      .addCase(fetchOnboardingStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Complete form
      .addCase(completeForm.fulfilled, (state, action) => {
        const { formId } = action.payload;
        if (state.currentProcess && state.currentProcess.forms) {
          const form = state.currentProcess.forms.find(f => f.formId === formId);
          if (form) {
            form.status = 'completed';
            form.completedAt = new Date().toISOString();
          }
          // עדכון אחוז ההתקדמות
          const totalForms = state.currentProcess.forms.length;
          const completedForms = state.currentProcess.forms.filter(
            f => f.status === 'completed' || f.status === 'returned_from_parent'
          ).length;
          state.currentProcess.completionPercentage = Math.round((completedForms / totalForms) * 100);
        }
      })
      
      // Send to parent
      .addCase(sendFormToParent.fulfilled, (state, action) => {
        const { formId } = action.payload;
        if (state.currentProcess && state.currentProcess.forms) {
          const form = state.currentProcess.forms.find(f => f.formId === formId);
          if (form) {
            form.status = 'sent_to_parent';
            form.sentToParentAt = new Date().toISOString();
          }
        }
      })
      
      // Fetch available forms
      .addCase(fetchAvailableForms.fulfilled, (state, action) => {
        state.availableForms = action.payload;
      });
  }
});

export const { clearOnboardingData, setSelectedForm, updateFormStatus } = onboardingSlice.actions;
export default onboardingSlice.reducer;