// src/Redux/features/questionsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// שליפת שאלות לפי טופס
export const fetchQuestionsByFormId = createAsyncThunk(
  'questions/fetchQuestionsByFormId',
  async (formId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Forms/${formId}/questions`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת שאלות הטופס');
    }
  }
);

// הוספת שאלה חדשה
export const addQuestion = createAsyncThunk(
  'questions/addQuestion',
  async (questionData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/Forms/questions', questionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בהוספת השאלה');
    }
  }
);

// עדכון שאלה
export const updateQuestion = createAsyncThunk(
  'questions/updateQuestion',
  async ({ formId, questionNo, questionData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/Forms/questions/${formId}/${questionNo}`, questionData);
      return { formId, questionNo, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון השאלה');
    }
  }
);

// מחיקת שאלה
export const deleteQuestion = createAsyncThunk(
  'questions/deleteQuestion',
  async ({ formId, questionNo }, { rejectWithValue }) => {
    try {
      await axios.delete(`/Forms/questions/${formId}/${questionNo}`);
      return { formId, questionNo };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה במחיקת השאלה');
    }
  }
);

const questionsSlice = createSlice({
  name: 'questions',
  initialState: {
    questionsByForm: {}, // { formId: [questions] }
    currentFormQuestions: [], // השאלות של הטופס הנוכחי
    status: 'idle',
    error: null,
    currentFormId: null
  },
  reducers: {
    clearQuestions: (state) => {
      state.currentFormQuestions = [];
      state.error = null;
      state.currentFormId = null;
    },
    setCurrentFormId: (state, action) => {
      state.currentFormId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch questions by form ID
      .addCase(fetchQuestionsByFormId.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchQuestionsByFormId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const formId = action.meta.arg;
        state.questionsByForm[formId] = action.payload;
        state.currentFormQuestions = action.payload;
        state.currentFormId = formId;
      })
      .addCase(fetchQuestionsByFormId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Add question
      .addCase(addQuestion.fulfilled, (state, action) => {
        const question = action.payload;
        if (state.questionsByForm[question.formId]) {
          state.questionsByForm[question.formId].push(question);
        }
        if (state.currentFormId === question.formId) {
          state.currentFormQuestions.push(question);
        }
      })
      
      // Update question
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const { formId, questionNo } = action.payload;
        if (state.questionsByForm[formId]) {
          const index = state.questionsByForm[formId].findIndex(q => q.questionNo === questionNo);
          if (index !== -1) {
            state.questionsByForm[formId][index] = action.payload;
          }
        }
        if (state.currentFormId === formId) {
          const index = state.currentFormQuestions.findIndex(q => q.questionNo === questionNo);
          if (index !== -1) {
            state.currentFormQuestions[index] = action.payload;
          }
        }
      })
      
      // Delete question
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        const { formId, questionNo } = action.payload;
        if (state.questionsByForm[formId]) {
          state.questionsByForm[formId] = state.questionsByForm[formId].filter(
            q => q.questionNo !== questionNo
          );
        }
        if (state.currentFormId === formId) {
          state.currentFormQuestions = state.currentFormQuestions.filter(
            q => q.questionNo !== questionNo
          );
        }
      });
  }
});

export const { clearQuestions, setCurrentFormId } = questionsSlice.actions;
export default questionsSlice.reducer;