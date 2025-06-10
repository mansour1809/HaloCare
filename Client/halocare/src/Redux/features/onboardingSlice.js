
// src/Redux/features/onboardingSlice.js - גרסה חדשה לחלוטין
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// 🔥 ACTIONS החדשים - מותאמים לAPI החדש שבנינו

// יצירת תהליך קליטה לילד חדש
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

// קבלת סטטוס קליטה מלא
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

// עדכון סטטוס טופס
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

// בדיקת השלמת טופס (אוטומטי)
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

// 🎯 STATE החדש - פשוט ויעיל
const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState: {
    // נתוני קליטה לפי ילד
    onboardingData: {}, // { kidId: KidOnboardingStatusDto }
    
    // מצב נוכחי
    currentKidId: null,
    currentFormId: null,
    
    // מצבי טעינה
    status: 'idle', // idle, loading, succeeded, failed
    initializingKids: [], // רשימת ילדים שנמצאים בתהליך יצירה
    error: null,
    
    // סטטיסטיקות מהירות
    stats: {
      totalKids: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0
    }
  },
  reducers: {
    // 🧹 ניקוי שגיאות
    clearError: (state) => {
      state.error = null;
    },
    
    // 🎯 הגדרת ילד נוכחי
    setCurrentKid: (state, action) => {
      state.currentKidId = action.payload;
    },
    
    // 🎯 הגדרת טופס נוכחי
    setCurrentForm: (state, action) => {
      state.currentFormId = action.payload;
    },
    
    // 🧹 ניקוי נתוני קליטה (למשל כשיוצאים מהמסך)
    clearOnboardingData: (state) => {
      state.onboardingData = {};
      state.currentKidId = null;
      state.currentFormId = null;
      state.error = null;
    },
    
    // 📊 עדכון סטטיסטיקות
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
      // 🔥 יצירת תהליך קליטה
      .addCase(initializeKidOnboarding.pending, (state, action) => {
        state.status = 'loading';
        state.initializingKids.push(action.meta.arg); // kidId
        state.error = null;
      })
      .addCase(initializeKidOnboarding.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { kidId } = action.payload;
        
        // הסרה מרשימת היצירה
        state.initializingKids = state.initializingKids.filter(id => id !== kidId);
        
        // הודעת הצלחה - הנתונים יטענו בנפרד
        console.log(`תהליך קליטה נוצר בהצלחה לילד ${kidId}`);
      })
      .addCase(initializeKidOnboarding.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        
        // הסרה מרשימת היצירה
        const kidId = action.meta.arg;
        state.initializingKids = state.initializingKids.filter(id => id !== kidId);
      })
      
      // 📊 טעינת סטטוס קליטה
      .addCase(fetchOnboardingStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOnboardingStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const data = action.payload;
        
        // שמירת הנתונים
        state.onboardingData[data.kidId] = data;
        
        // עדכון סטטיסטיקות
        onboardingSlice.caseReducers.updateStats(state);
      })
      .addCase(fetchOnboardingStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // ✅ עדכון סטטוס טופס
      .addCase(updateFormStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateFormStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { kidId } = action.payload;
        
        // הנתונים יתעדכנו בטעינה הבאה - או שנוכל לעדכן מקומית
        console.log(`סטטוס טופס עודכן בהצלחה לילד ${kidId}`);
      })
      .addCase(updateFormStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // 🔍 בדיקת השלמה
      .addCase(checkFormCompletion.pending, (state) => {
        // לא משנים סטטוס כי זו פעולה ברקע
        state.error = null;
      })
      .addCase(checkFormCompletion.fulfilled, (state, action) => {
        const { kidId } = action.payload;
        console.log(`בדיקת השלמה בוצעה לילד ${kidId}`);
        
        // אפשר לטעון מחדש את הסטטוס אוטומטית
        // או לעדכן מקומית אם יש לנו את המידע
      })
      .addCase(checkFormCompletion.rejected, (state, action) => {
        // שגיאה בבדיקה - לא קריטי
        console.warn('שגיאה בבדיקת השלמת טופס:', action.payload);
      });
  }
});

// 🎯 SELECTORS - לגישה נוחה לנתונים
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

// בדיקה אם ילד נמצא בתהליך יצירה
export const selectIsKidInitializing = (kidId) => (state) => 
  state.onboarding.initializingKids.includes(kidId);

// קבלת טופס ספציפי לילד הנוכחי
export const selectCurrentKidForm = (formId) => (state) => {
  const currentData = selectCurrentKidOnboarding(state);
  return currentData?.forms?.find(form => form.formId === formId);
};

// בדיקה אם טופס זמין למילוי
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

