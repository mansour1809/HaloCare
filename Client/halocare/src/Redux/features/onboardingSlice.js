
// src/Redux/features/onboardingSlice.js - גרסה חדשה לחלוטין
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

//New ACTIONS - adapted to the new API we built

// Creating a new child intake process
export const initializeKidOnboarding = createAsyncThunk(
  'onboarding/initializeKidOnboarding',
  async (kidId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/KidOnboarding/initialize/${kidId}`);
      return { kidId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'שגיאה ביצירת תהליך קליטה');
    }
  }
);

// Get full reception status
export const fetchOnboardingStatus = createAsyncThunk(
  'onboarding/fetchOnboardingStatus',
  async (kidId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/KidOnboarding/status/${kidId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'שגיאה בטעינת סטטוס התהליך');
    }
  }
);

// Update form status
export const updateFormStatus = createAsyncThunk(
  'onboarding/updateFormStatus',
  async ({ kidId, formId, newStatus, completedBy = null, notes = null }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/KidOnboarding/form-status', {
        kidId,
        formId,
        newStatus,
        completedBy,
        notes
      });
      return { kidId, formId, newStatus, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'שגיאה בעדכון סטטוס');
    }
  }
);

// Form completion check (automatic)
export const checkFormCompletion = createAsyncThunk(
  'onboarding/checkFormCompletion',
  async ({ kidId, formId }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/KidOnboarding/check-completion', {
        kidId,
        formId
      });
      return { kidId, formId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'שגיאה בבדיקת השלמה');
    }
  }
);

// The new STATE - simple and effective
const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState: {
   // Absorption data per child
    onboardingData: {}, // { kidId: KidOnboardingStatusDto }
    
    // Current status
    currentKidId: null,
    currentFormId: null,
    
    // Charging modes
    status: 'idle', // idle, loading, succeeded, failed
    initializingKids: [], // List of children in the process of being created
    error: null,
    
    // Quick statistics
    stats: {
      totalKids: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0
    }
  },
  reducers: {
    // Error cleaning
    clearError: (state) => {
      state.error = null;
    },
    
    // Set current child
    setCurrentKid: (state, action) => {
      state.currentKidId = action.payload;
    },
    
    // Set current form
    setCurrentForm: (state, action) => {
      state.currentFormId = action.payload;
    },
    
    // Clearing reception data (e.g. when exiting the screen)
    clearOnboardingData: (state) => {
      state.onboardingData = {};
      state.currentKidId = null;
      state.currentFormId = null;
      state.error = null;
    },
    
// Update statistics
    updateStats: (state) => {
      const allData = Object.values(state.onboardingData);
      state.stats = {
        totalKids: allData.length,
        completed: allData.filter(data => data.overallStatus === 'Completed').length,
        inProgress: allData.filter(data => data.overallStatus === 'InProgress').length,
        notStarted: allData.filter(data => data.overallStatus === 'NotStarted').length
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Create a receiving process
      .addCase(initializeKidOnboarding.pending, (state, action) => {
        state.status = 'loading';
        state.initializingKids.push(action.meta.arg); // kidId
        state.error = null;
      })
      .addCase(initializeKidOnboarding.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { kidId } = action.payload;
        
        // Remove from creation list
        state.initializingKids = state.initializingKids.filter(id => id !== kidId);
        
        // Success message - data will be loaded separately
        console.log(`תהליך קליטה נוצר בהצלחה לילד ${kidId}`);
      })
      .addCase(initializeKidOnboarding.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        
        // Remove from creation list
        const kidId = action.meta.arg;
        state.initializingKids = state.initializingKids.filter(id => id !== kidId);
      })
      
      // Load reception status
      .addCase(fetchOnboardingStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOnboardingStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const data = action.payload;
        
        // Saving the data
        state.onboardingData[data.kidId] = data;
        
       // Update statistics
        onboardingSlice.caseReducers.updateStats(state);
      })
      .addCase(fetchOnboardingStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Update form status
      .addCase(updateFormStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateFormStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { kidId } = action.payload;
        
// The data will be updated on the next load - or we can update locally
        console.log(`סטטוס טופס עודכן בהצלחה לילד ${kidId}`);
      })
      .addCase(updateFormStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Completion check
      .addCase(checkFormCompletion.pending, (state) => {
        // We don't change status because this is a background operation
        state.error = null;
      })
      .addCase(checkFormCompletion.fulfilled, (state, action) => {
        const { kidId } = action.payload;
        console.log(`בדיקת השלמה בוצעה לילד ${kidId}`);
        
        // Can reload status automatically
// or update locally if we have the information
      })
      .addCase(checkFormCompletion.rejected, (state, action) => {
        // Error in testing - non-critical
        console.warn('שגיאה בבדיקת השלמת טופס:', action.payload);
      });
  }
});

// SELECTORS - for easy data access
export const selectOnboardingData = (state) => state.onboarding.onboardingData;
export const selectCurrentKidOnboarding = (state) => {
  const { currentKidId, onboardingData } = state.onboarding;
  return currentKidId ? onboardingData[currentKidId] : null;
};
export const selectOnboardingStats = (state) => state.onboarding.stats;
export const selectCurrentKidId = (state) => state.onboarding.currentKidId;
export const selectCurrentFormId = (state) => state.onboarding.currentFormId;
export const selectOnboardingStatus = (state) => state.onboarding.status;
export const selectOnboardingError = (state) => state.onboarding.error;

// Check if a child is in the process of being created
export const selectIsKidInitializing = (kidId) => (state) => 
  state.onboarding.initializingKids.includes(kidId);

// Get a specific form for the current child
export const selectCurrentKidForm = (formId) => (state) => {
  const currentData = selectCurrentKidOnboarding(state);
  return currentData?.forms?.find(form => form.formId === formId);
};

// Check if a form is available to fill out
export const selectIsFormAvailable = (formId) => (state) => {
  const form = selectCurrentKidForm(formId)(state);
  return form && ['NotStarted', 'InProgress'].includes(form.status);
};

export const { 
  clearError, 
  setCurrentKid, 
  setCurrentForm, 
  clearOnboardingData,
  updateStats 
} = onboardingSlice.actions;

export default onboardingSlice.reducer;

