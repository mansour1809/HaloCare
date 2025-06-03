// src/Redux/features/answersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// שליפת תשובות לטופס מסוים של ילד מסוים
export const fetchFormAnswers = createAsyncThunk(
  'answers/fetchFormAnswers',
  async ({ kidId, formId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Forms/answers/kid/${kidId}/form/${formId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת תשובות הטופס');
    }
  }
);

// שמירת תשובה יחידה
export const saveAnswer = createAsyncThunk(
  'answers/saveAnswer',
  async (answerData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/Forms/answers', answerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בשמירת התשובה');
    }
  }
);

// עדכון תשובה קיימת
export const updateAnswer = createAsyncThunk(
  'answers/updateAnswer',
  async ({ answerId, answerData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/Forms/answers/${answerId}`, answerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון התשובה');
    }
  }
);

// שמירת מספר תשובות במקביל (לטופס שלם)
export const saveFormAnswers = createAsyncThunk(
  'answers/saveFormAnswers',
  async ({ kidId, formId, answers }, { dispatch, rejectWithValue }) => {
    try {
      const savedAnswers = [];
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id; // optional chaining to avoid errors if user is null

      for (const answer of answers) {
        const answerData = {
          kidId,
          formId,
          questionNo: answer.questionNo,
          ansDate: new Date().toISOString(),
          answer: answer.answer,
          other: answer.other || "",
          employeeId: answer.byParent ? "" : userId,
          byParent: answer.byParent || false
        };
        
        const result = await dispatch(saveAnswer(answerData)).unwrap();
        savedAnswers.push(result);
      }
      
      return { kidId, formId, answers: savedAnswers };
    } catch (error) {
      return rejectWithValue(error.message || 'שגיאה בשמירת תשובות הטופס');
    }
  }
);

// מחיקת תשובה
export const deleteAnswer = createAsyncThunk(
  'answers/deleteAnswer',
  async (answerId, { rejectWithValue }) => {
    try {
      await axios.delete(`/Forms/answers/${answerId}`);
      return answerId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה במחיקת התשובה');
    }
  }
);

const answersSlice = createSlice({
  name: 'answers',
  initialState: {
    answersByKidAndForm: {}, // { "kidId_formId": [answers] }
    currentFormAnswers: [], // התשובות של הטופס הנוכחי
    status: 'idle',
    saveStatus: 'idle',
    error: null,
    currentKidId: null,
    currentFormId: null
  },
  reducers: {
    clearAnswers: (state) => {
      state.currentFormAnswers = [];
      state.error = null;
      state.currentKidId = null;
      state.currentFormId = null;
    },
    setCurrentForm: (state, action) => {
      const { kidId, formId } = action.payload;
      state.currentKidId = kidId;
      state.currentFormId = formId;
      
      const key = `${kidId}_${formId}`;
      state.currentFormAnswers = state.answersByKidAndForm[key] || [];
    },
    // עדכון תשובה מקומית (לפני שמירה)
    updateLocalAnswer: (state, action) => {
      const { questionNo, answer, other } = action.payload;
      const existingIndex = state.currentFormAnswers.findIndex(a => a.questionNo === questionNo);
      
      if (existingIndex !== -1) {
        state.currentFormAnswers[existingIndex] = {
          ...state.currentFormAnswers[existingIndex],
          answer,
          other: other || null
        };
      } else {
        state.currentFormAnswers.push({
          kidId: state.currentKidId,
          formId: state.currentFormId,
          questionNo,
          answer,
          other: other || null,
          byParent: false,
          ansDate: new Date().toISOString()
        });
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch form answers
      .addCase(fetchFormAnswers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFormAnswers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { kidId, formId } = action.meta.arg;
        const key = `${kidId}_${formId}`;
        
        state.answersByKidAndForm[key] = action.payload;
        state.currentFormAnswers = action.payload;
        state.currentKidId = kidId;
        state.currentFormId = formId;
      })
      .addCase(fetchFormAnswers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Save single answer
      .addCase(saveAnswer.pending, (state) => {
        state.saveStatus = 'loading';
      })
      .addCase(saveAnswer.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        const answer = action.payload;
        const key = `${answer.kidId}_${answer.formId}`;
        
        if (!state.answersByKidAndForm[key]) {
          state.answersByKidAndForm[key] = [];
        }
        
        // עדכון או הוספה
        const existingIndex = state.answersByKidAndForm[key].findIndex(
          a => a.questionNo === answer.questionNo
        );
        
        if (existingIndex !== -1) {
          state.answersByKidAndForm[key][existingIndex] = answer;
        } else {
          state.answersByKidAndForm[key].push(answer);
        }
        
        // עדכון התשובות הנוכחיות אם זה הטופס הנוכחי
        if (state.currentKidId === answer.kidId && state.currentFormId === answer.formId) {
          const currentIndex = state.currentFormAnswers.findIndex(
            a => a.questionNo === answer.questionNo
          );
          
          if (currentIndex !== -1) {
            state.currentFormAnswers[currentIndex] = answer;
          } else {
            state.currentFormAnswers.push(answer);
          }
        }
      })
      .addCase(saveAnswer.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.error = action.payload;
      })
      
      // Update answer
      .addCase(updateAnswer.fulfilled, (state, action) => {
        const answer = action.payload;
        const key = `${answer.kidId}_${answer.formId}`;
        
        if (state.answersByKidAndForm[key]) {
          const index = state.answersByKidAndForm[key].findIndex(
            a => a.answerId === answer.answerId
          );
          if (index !== -1) {
            state.answersByKidAndForm[key][index] = answer;
          }
        }
        
        // עדכון התשובות הנוכחיות
        if (state.currentKidId === answer.kidId && state.currentFormId === answer.formId) {
          const currentIndex = state.currentFormAnswers.findIndex(
            a => a.answerId === answer.answerId
          );
          if (currentIndex !== -1) {
            state.currentFormAnswers[currentIndex] = answer;
          }
        }
      })
      
      // Save form answers (batch)
      .addCase(saveFormAnswers.fulfilled, (state, action) => {
        const { kidId, formId, answers } = action.payload;
        const key = `${kidId}_${formId}`;
        
        state.answersByKidAndForm[key] = answers;
        
        if (state.currentKidId === kidId && state.currentFormId === formId) {
          state.currentFormAnswers = answers;
        }
      })
      
      // Delete answer
      .addCase(deleteAnswer.fulfilled, (state, action) => {
        const answerId = action.payload;
        
        // מחיקה מכל המקומות
        Object.keys(state.answersByKidAndForm).forEach(key => {
          state.answersByKidAndForm[key] = state.answersByKidAndForm[key].filter(
            a => a.answerId !== answerId
          );
        });
        
        state.currentFormAnswers = state.currentFormAnswers.filter(
          a => a.answerId !== answerId
        );
      });
  }
});

export const { clearAnswers, setCurrentForm, updateLocalAnswer } = answersSlice.actions;
export default answersSlice.reducer;