// src/Redux/features/formsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// אסינק ת'אנק לשליפת פרטי הטופס
export const fetchFormInfo = createAsyncThunk(
  'forms/fetchFormInfo',
  async (formId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Forms/${formId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת פרטי הטופס');
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

// אסינק ת'אנק לשליחת טופס להורה
export const sendFormToParent = createAsyncThunk(
  'forms/sendFormToParent',
  async ({ kidId, formId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/Forms/send-to-parent`, { kidId, formId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בשליחת הטופס להורה');
    }
  }
);

const formsSlice = createSlice({
  name: 'forms',
  initialState: {
    formInfo: null,
    questions: [],
    status: 'idle',
    error: null,
    sendStatus: 'idle',
    sendError: null
  },
  reducers: {
    resetSendStatus: (state) => {
      state.sendStatus = 'idle';
      state.sendError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // FetchFormInfo
      .addCase(fetchFormInfo.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFormInfo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.formInfo = action.payload;
      })
      .addCase(fetchFormInfo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת פרטי הטופס';
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
      
      // SendFormToParent
      .addCase(sendFormToParent.pending, (state) => {
        state.sendStatus = 'loading';
      })
      .addCase(sendFormToParent.fulfilled, (state) => {
        state.sendStatus = 'succeeded';
      })
      .addCase(sendFormToParent.rejected, (state, action) => {
        state.sendStatus = 'failed';
        state.sendError = action.payload || 'שגיאה בשליחת הטופס להורה';
      });
  }
});

export const { resetSendStatus } = formsSlice.actions;

export default formsSlice.reducer;