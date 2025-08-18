import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';
import { updateFormStatus, fetchOnboardingStatus } from './onboardingSlice'; // 🔥 הוספה

export const fetchForms = createAsyncThunk(
  'forms/fetchForms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/Forms');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת רשימת הטפסים');
    }
  }
);

export const fetchFormQuestions = createAsyncThunk(
  'forms/fetchFormQuestions',
  async (formId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Forms/${formId}/questions`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת שאלות הטופס');
    }
  }
);

// Sending form to parent - updated with admission status update
export const sendFormToParent = createAsyncThunk(
  'forms/sendFormToParent',
  async ({ kidId, formId, parentEmail }, { dispatch, rejectWithValue }) => {
    try {
      // 1. Submitting the form
      const response = await axios.post('/Forms/send-to-parent', {
        kidId,
        formId,
        parentEmail
      });

     // 2. Update status in the absorption process
      await dispatch(updateFormStatus({
        kidId,
        formId,
        newStatus: 'SentToParent',
        notes: `נשלח להורה בתאריך ${new Date().toLocaleDateString('he-IL')}`
      }));

      // 3. Refresh reception status
      setTimeout(() => {
        dispatch(fetchOnboardingStatus(kidId));
      }, 100);

      return { kidId, formId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בשליחת הטופס להורה');
    }
  }
);

// Mark a form as completed by a parent
export const markFormCompletedByParent = createAsyncThunk(
  'forms/markFormCompletedByParent',
  async ({ kidId, formId, notes }, { dispatch, rejectWithValue }) => {
    try {
      // Update status for form completed by parent
      await dispatch(updateFormStatus({
        kidId,
        formId,
        newStatus: 'CompletedByParent',
        notes: notes || `הושלם על ידי הורה בתאריך ${new Date().toLocaleDateString('he-IL')}`
      }));

      // Refresh reception status
      setTimeout(() => {
        dispatch(fetchOnboardingStatus(kidId));
      }, 100);

      return { kidId, formId, status: 'CompletedByParent' };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון סטטוס הטופס');
    }
  }
);

export const fetchFormData = createAsyncThunk(
  'forms/fetchFormData',
  async ({ formId, kidId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Forms/${formId}/data/${kidId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת נתוני הטופס');
    }
  }
);

export const submitFormData = createAsyncThunk(
  'forms/submitFormData',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/Forms/submit', formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בשמירת נתוני הטופס');
    }
  }
);

const formsSlice = createSlice({
  name: 'forms',
  initialState: {
    forms: [],
    questions: [],
    selectedForm: null,
    formData: null,
    status: 'idle',
    error: null,
    
    // Send to parents statuses
    sendingToParent: false,
    sentForms: {}, // { kidId_formId: { sentDate, status } }
  },
  reducers: {
    clearSelectedForm: (state) => {
      state.selectedForm = null;
      state.questions = [];
      state.formData = null;
      state.error = null;
    },
    clearFormData: (state) => {
      state.formData = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
    
    // Tracking submitted forms
    markFormAsSent: (state, action) => {
      const { kidId, formId } = action.payload;
      const key = `${kidId}_${formId}`;
      state.sentForms[key] = {
        sentDate: new Date().toISOString(),
        status: 'sent'
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch forms
      .addCase(fetchForms.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchForms.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.forms = action.payload;
      })
      .addCase(fetchForms.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת רשימת הטפסים';
      })
      
      // Fetch form questions
      .addCase(fetchFormQuestions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFormQuestions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.questions = action.payload;
      })
      .addCase(fetchFormQuestions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת שאלות הטופס';
      })
      
      //  Send form to parent
      .addCase(sendFormToParent.pending, (state) => {
        state.sendingToParent = true;
        state.error = null;
      })
      .addCase(sendFormToParent.fulfilled, (state, action) => {
        state.sendingToParent = false;
        const { kidId, formId } = action.payload;
        
        // Mark the form as submitted
        const key = `${kidId}_${formId}`;
        state.sentForms[key] = {
          sentDate: new Date().toISOString(),
          status: 'sent'
        };
        
      })
      .addCase(sendFormToParent.rejected, (state, action) => {
        state.sendingToParent = false;
        state.error = action.payload || 'שגיאה בשליחת הטופס להורה';
      })
      
      //  Mark form completed by parent
      .addCase(markFormCompletedByParent.fulfilled, (state, action) => {
        const { kidId, formId } = action.payload;
        const key = `${kidId}_${formId}`;
        
        if (state.sentForms[key]) {
          state.sentForms[key].status = 'completed_by_parent';
          state.sentForms[key].completedDate = new Date().toISOString();
        }
        
      })
      
      // Fetch form data
      .addCase(fetchFormData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFormData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.formData = action.payload;
      })
      .addCase(fetchFormData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת נתוני הטופס';
      })
      
      // Submit form data
      .addCase(submitFormData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(submitFormData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.formData = action.payload;
      })
      .addCase(submitFormData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בשמירת נתוני הטופס';
      });
  }
});

export const { 
  clearSelectedForm, 
  clearFormData, 
  clearErrors,
  markFormAsSent
} = formsSlice.actions;

export default formsSlice.reducer;