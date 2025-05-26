// src/Redux/features/formsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

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
// אסינק ת'אנק לשליפת שאלות הטופס
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

export const sendFormToParent = createAsyncThunk(
  'forms/sendFormToParent',
  async ({ kidId, formId }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/Forms/send-to-parent', {
        kidId,
        formId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בשליחת הטופס להורה');
    }
  }
);

export const fetchFormData = createAsyncThunk(
  'forms/fetchFormData',
  async ({ formId, kidId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Forms/${formId}/kid/${kidId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת נתוני הטופס');
    }
  }
);

export const submitFormData = createAsyncThunk(
  'forms/submitFormData',
  async ({ formId, kidId, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/Forms/${formId}/kid/${kidId}`, formData);
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
    selectedForm: null,
    formData: null,
    status: 'idle',
    error: null,
    sendStatus: 'idle',
    sendError: null
  },
  reducers: {
    clearSelectedForm: (state) => {
      state.selectedForm = null;
      state.formData = null;
    },
    clearFormData: (state) => {
      state.formData = null;
    },
    clearErrors: (state) => {
      state.error = null;
      state.sendError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch forms info
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
       // FetchFormQuestions
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
      
      // Send form to parent
      .addCase(sendFormToParent.pending, (state) => {
        state.sendStatus = 'loading';
        state.sendError = null;
      })
      .addCase(sendFormToParent.fulfilled, (state, action) => {
        state.sendStatus = 'succeeded';
      })
      .addCase(sendFormToParent.rejected, (state, action) => {
        state.sendStatus = 'failed';
        state.sendError = action.payload || 'שגיאה בשליחת הטופס להורה';
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

export const { clearSelectedForm, clearFormData, clearErrors } = formsSlice.actions;

export default formsSlice.reducer;