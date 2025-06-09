// src/Redux/features/answersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// שליפת תשובות לטופס מסוים של ילד מסוים
export const fetchFormAnswers = createAsyncThunk(
  'answers/fetchFormAnswers',
  async ({ kidId, formId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Forms/answers/kid/${kidId}/form/${formId}`);
      return { kidId, formId, answers: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת תשובות הטופס');
    }
  }
);

// שמירת תשובה יחידה עם עדכון אוטומטי של תהליך קליטה
export const saveAnswer = createAsyncThunk(
  'answers/saveAnswer',
  async (answerData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post('/Forms/answers', answerData);
      
      // עדכון אוטומטי של התקדמות הטופס (קורה אוטומטית בשרת)
      // אין צורך להפעיל updateFormProgress ידנית
      
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
    currentKidId: null,
    currentFormId: null,
    status: 'idle',
    error: null,
    savingAnswer: false
  },
  reducers: {
    clearAnswers: (state) => {
      state.currentFormAnswers = [];
      state.currentKidId = null;
      state.currentFormId = null;
      state.error = null;
    },
    setCurrentForm: (state, action) => {
      const { kidId, formId } = action.payload;
      state.currentKidId = kidId;
      state.currentFormId = formId;
      
      const key = `${kidId}_${formId}`;
      state.currentFormAnswers = state.answersByKidAndForm[key] || [];
    },
    updateLocalAnswer: (state, action) => {
      // עדכון מקומי של תשובה (לפני שמירה בשרת)
      const { questionNo, answer, other } = action.payload;
      
      const existingIndex = state.currentFormAnswers.findIndex(
        a => a.questionNo === questionNo
      );
      
      if (existingIndex !== -1) {
        state.currentFormAnswers[existingIndex] = {
          ...state.currentFormAnswers[existingIndex],
          answer,
          other: other || ""
        };
      } else {
        state.currentFormAnswers.push({
          kidId: state.currentKidId,
          formId: state.currentFormId,
          questionNo,
          answer,
          other: other || "",
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
        const { kidId, formId, answers } = action.payload;
        const key = `${kidId}_${formId}`;
        
        state.answersByKidAndForm[key] = answers;
        
        if (state.currentKidId === kidId && state.currentFormId === formId) {
          state.currentFormAnswers = answers;
        }
      })
      .addCase(fetchFormAnswers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Save answer
      .addCase(saveAnswer.pending, (state) => {
        state.savingAnswer = true;
        state.error = null;
      })
      .addCase(saveAnswer.fulfilled, (state, action) => {
        state.savingAnswer = false;
        const answer = action.payload;
        
        // עדכון התשובה ברשימה הנוכחית
        const existingIndex = state.currentFormAnswers.findIndex(
          a => a.questionNo === answer.questionNo
        );
        
        if (existingIndex !== -1) {
          state.currentFormAnswers[existingIndex] = answer;
        } else {
          state.currentFormAnswers.push(answer);
        }
        
        // עדכון גם במטמון לפי מפתח
        const key = `${answer.kidId}_${answer.formId}`;
        if (state.answersByKidAndForm[key]) {
          const cacheIndex = state.answersByKidAndForm[key].findIndex(
            a => a.questionNo === answer.questionNo
          );
          if (cacheIndex !== -1) {
            state.answersByKidAndForm[key][cacheIndex] = answer;
          } else {
            state.answersByKidAndForm[key].push(answer);
          }
        }
      })
      .addCase(saveAnswer.rejected, (state, action) => {
        state.savingAnswer = false;
        state.error = action.payload;
      })
      
      // Update answer
      .addCase(updateAnswer.fulfilled, (state, action) => {
        const answer = action.payload;
        
        // עדכון בכל המקומות הרלוונטיים
        const updateAnswerInArray = (answers) => {
          const index = answers.findIndex(a => a.answerId === answer.answerId);
          if (index !== -1) {
            answers[index] = answer;
          }
        };
        
        updateAnswerInArray(state.currentFormAnswers);
        
        Object.keys(state.answersByKidAndForm).forEach(key => {
          updateAnswerInArray(state.answersByKidAndForm[key]);
        });
      })
      
      // Delete answer
      .addCase(deleteAnswer.fulfilled, (state, action) => {
        const answerId = action.payload;
        
        // מחיקה מכל המקומות
        const removeAnswerFromArray = (answers) => {
          return answers.filter(a => a.answerId !== answerId);
        };
        
        state.currentFormAnswers = removeAnswerFromArray(state.currentFormAnswers);
        
        Object.keys(state.answersByKidAndForm).forEach(key => {
          state.answersByKidAndForm[key] = removeAnswerFromArray(state.answersByKidAndForm[key]);
        });
      });
  }
});

export const { clearAnswers, setCurrentForm, updateLocalAnswer } = answersSlice.actions;
export default answersSlice.reducer;