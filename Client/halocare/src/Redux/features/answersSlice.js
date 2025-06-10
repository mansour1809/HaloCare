// src/Redux/features/answersSlice.js - גרסה מתוקנת ללא שמירה אוטומטית
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// ייבוא thunks מ-onboardingSlice לעדכון סטטוס
import { checkFormCompletion, fetchOnboardingStatus } from './onboardingSlice';

// =============================================================================
// ASYNC THUNKS - פעולות אסינכרוניות
// =============================================================================

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

// 🔥 שמירת תשובה יחידה - מתוקן להתמודד עם עדכונים
export const saveOrUpdateAnswer = createAsyncThunk(
  'answers/saveOrUpdateAnswer',
  async ({ kidId, formId, questionNo, answer, other = '' }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      
      // בדיקה אם כבר יש תשובה לשאלה הזו
      const existingAnswer = state.answers.currentFormAnswers.find(
        a => a.kidId === kidId && a.formId === formId && a.questionNo === questionNo
      );

      const answerData = {
        kidId,
        formId,
        questionNo,
        answer,
        other,
        ansDate: new Date().toISOString(),
        byParent: false,
        employeeId: getCurrentUserId()
      };

      let response;
      
      if (existingAnswer && existingAnswer.answerId) {
        // 🔥 עדכון תשובה קיימת
        response = await axios.put(`/Forms/answers/${existingAnswer.answerId}`, answerData);
        return { ...response.data, isUpdate: true };
      } else {
        // 🔥 יצירת תשובה חדשה
        response = await axios.post('/Forms/answers', answerData);
        return { ...response.data, isUpdate: false };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בשמירת התשובה');
    }
  }
);

// 🔥 שמירת טופס שלם - מתוקן
export const saveFormAnswers = createAsyncThunk(
  'answers/saveFormAnswers',
  async ({ kidId, formId, answers }, { dispatch, rejectWithValue, getState }) => {
    try {
      const savedAnswers = [];
      
      // שמירת כל התשובות אחת אחת
      for (const answerData of answers) {
        try {
          const result = await dispatch(saveOrUpdateAnswer({
            kidId,
            formId,
            questionNo: answerData.questionNo,
            answer: answerData.answer,
            other: answerData.other || ''
          })).unwrap();
          
          savedAnswers.push(result);
        } catch (error) {
          console.error(`שגיאה בשמירת שאלה ${answerData.questionNo}:`, error);
          // ממשיכים עם השאר גם אם אחת נכשלה
        }
      }

      // בדיקת השלמה אוטומטית אחרי שמירת כל התשובות
      await dispatch(checkFormCompletion({ kidId, formId }));
      
      // עדכון סטטוס קליטה
      setTimeout(() => {
        dispatch(fetchOnboardingStatus(kidId));
      }, 500);

      return { kidId, formId, answers: savedAnswers };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בשמירת תשובות הטופס');
    }
  }
);

// מחיקת תשובה
export const deleteAnswer = createAsyncThunk(
  'answers/deleteAnswer',
  async ({ answerId, kidId, formId }, { dispatch, rejectWithValue }) => {
    try {
      await axios.delete(`/Forms/answers/${answerId}`);
      
      // בדיקת השלמה אחרי מחיקה
      await dispatch(checkFormCompletion({ kidId, formId }));
      
      // עדכון סטטוס קליטה
      setTimeout(() => {
        dispatch(fetchOnboardingStatus(kidId));
      }, 500);
      
      return answerId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה במחיקת התשובה');
    }
  }
);

// =============================================================================
// SLICE DEFINITION
// =============================================================================

const answersSlice = createSlice({
  name: 'answers',
  initialState: {
    // תשובות לפי ילד וטופס
    answersByKidAndForm: {}, // { "kidId_formId": [answers] }
    
    // תשובות של הטופס הנוכחי
    currentFormAnswers: [],
    currentKidId: null,
    currentFormId: null,
    
    // 🔥 שינויים מקומיים (לא נשמרו עדיין)
    localAnswers: {}, // { questionNo: { answer, other } }
    hasLocalChanges: false,
    
    // מצבי טעינה
    status: 'idle', // idle, loading, succeeded, failed
    saveStatus: 'idle', // מצב שמירה נפרד
    error: null,
    saveError: null,
  },
  reducers: {
    // 🧹 ניקוי שגיאות
    clearError: (state) => {
      state.error = null;
      state.saveError = null;
    },
    
    // 🎯 הגדרת טופס נוכחי
    setCurrentForm: (state, action) => {
      const { kidId, formId } = action.payload;
      state.currentKidId = kidId;
      state.currentFormId = formId;
      
      // טעינת התשובות לטופס הנוכחי
      const key = `${kidId}_${formId}`;
      state.currentFormAnswers = state.answersByKidAndForm[key] || [];
      
      // איפוס שינויים מקומיים כשעוברים לטופס חדש
      state.localAnswers = {};
      state.hasLocalChanges = false;
    },
    
    // 🔥 עדכון תשובה מקומית (ללא שמירה)
    updateLocalAnswer: (state, action) => {
      const { questionNo, answer, other } = action.payload;
      
      state.localAnswers[questionNo] = {
        answer: answer || '',
        other: other || ''
      };
      
      state.hasLocalChanges = true;
    },
    
    // 🔥 איפוס שינוי מקומי לשאלה ספציפית
    resetLocalAnswer: (state, action) => {
      const questionNo = action.payload;
      delete state.localAnswers[questionNo];
      
      // בדיקה אם נשארו שינויים
      state.hasLocalChanges = Object.keys(state.localAnswers).length > 0;
    },
    
    // 🔥 איפוס כל השינויים המקומיים
    resetAllLocalAnswers: (state) => {
      state.localAnswers = {};
      state.hasLocalChanges = false;
    },
    
    // 🔥 קבלת ערך תשובה (מקומי או שמור)
    getCurrentAnswerValue: (state, action) => {
      const questionNo = action.payload;
      
      // אם יש ערך מקומי - נחזיר אותו
      if (state.localAnswers[questionNo]) {
        return state.localAnswers[questionNo];
      }
      
      // אחרת נחזיר את הערך השמור
      const savedAnswer = state.currentFormAnswers.find(a => a.questionNo === questionNo);
      return {
        answer: savedAnswer?.answer || '',
        other: savedAnswer?.other || ''
      };
    },
    
    // 🧹 ניקוי תשובות
    clearAnswers: (state) => {
      state.currentFormAnswers = [];
      state.answersByKidAndForm = {};
      state.localAnswers = {};
      state.hasLocalChanges = false;
      state.error = null;
      state.saveError = null;
    },
    
    // 🧹 ניקוי נתוני ילד ספציפי
    clearKidAnswers: (state, action) => {
      const kidId = action.payload;
      Object.keys(state.answersByKidAndForm).forEach(key => {
        if (key.startsWith(`${kidId}_`)) {
          delete state.answersByKidAndForm[key];
        }
      });
      
      // אם זה הילד הנוכחי, נקה גם את הנתונים הנוכחיים
      if (state.currentKidId === kidId) {
        state.currentFormAnswers = [];
        state.localAnswers = {};
        state.hasLocalChanges = false;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // 📥 שליפת תשובות טופס
      .addCase(fetchFormAnswers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFormAnswers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { kidId, formId, answers } = action.payload;
        const key = `${kidId}_${formId}`;
        
        state.answersByKidAndForm[key] = answers;
        
        // אם זה הטופס הנוכחי, עדכן גם אותו
        if (state.currentKidId === kidId && state.currentFormId === formId) {
          state.currentFormAnswers = answers;
        }
      })
      .addCase(fetchFormAnswers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // 💾 שמירת/עדכון תשובה יחידה
      .addCase(saveOrUpdateAnswer.pending, (state) => {
        state.saveStatus = 'loading';
        state.saveError = null;
      })
      .addCase(saveOrUpdateAnswer.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        const answer = action.payload;
        
        // עדכון ברשת התשובות
        const key = `${answer.kidId}_${answer.formId}`;
        if (!state.answersByKidAndForm[key]) {
          state.answersByKidAndForm[key] = [];
        }
        
        // 🔥 בדיקה אם זה עדכון או הוספה
        if (answer.isUpdate) {
          // עדכון תשובה קיימת
          const existingIndex = state.answersByKidAndForm[key].findIndex(
            a => a.questionNo === answer.questionNo
          );
          if (existingIndex !== -1) {
            state.answersByKidAndForm[key][existingIndex] = answer;
          }
        } else {
          // הוספת תשובה חדשה
          state.answersByKidAndForm[key].push(answer);
        }
        
        // עדכון בטופס הנוכחי אם רלוונטי
        if (state.currentKidId === answer.kidId && state.currentFormId === answer.formId) {
          if (answer.isUpdate) {
            const currentIndex = state.currentFormAnswers.findIndex(
              a => a.questionNo === answer.questionNo
            );
            if (currentIndex !== -1) {
              state.currentFormAnswers[currentIndex] = answer;
            }
          } else {
            state.currentFormAnswers.push(answer);
          }
          
          // 🔥 ניקוי השינוי המקומי שנשמר
          delete state.localAnswers[answer.questionNo];
          state.hasLocalChanges = Object.keys(state.localAnswers).length > 0;
        }
      })
      .addCase(saveOrUpdateAnswer.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.saveError = action.payload;
      })
      
      // 💾 שמירת טופס שלם
      .addCase(saveFormAnswers.pending, (state) => {
        state.saveStatus = 'loading';
        state.saveError = null;
      })
      .addCase(saveFormAnswers.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        const { kidId, formId, answers } = action.payload;
        const key = `${kidId}_${formId}`;
        
        // שמירת כל התשובות
        state.answersByKidAndForm[key] = answers;
        
        // עדכון הטופס הנוכחי
        if (state.currentKidId === kidId && state.currentFormId === formId) {
          state.currentFormAnswers = answers;
        }
        
        // 🔥 ניקוי כל השינויים המקומיים
        state.localAnswers = {};
        state.hasLocalChanges = false;
      })
      .addCase(saveFormAnswers.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.saveError = action.payload;
      })
      
      // 🗑️ מחיקת תשובה
      .addCase(deleteAnswer.fulfilled, (state, action) => {
        const answerId = action.payload;
        
        // מחיקה מכל המקומות
        Object.keys(state.answersByKidAndForm).forEach(key => {
          state.answersByKidAndForm[key] = state.answersByKidAndForm[key].filter(
            a => a.answerId !== answerId
          );
        });
        
        // מחיקה מהטופס הנוכחי
        state.currentFormAnswers = state.currentFormAnswers.filter(
          a => a.answerId !== answerId
        );
      });
  }
});

// =============================================================================
// SELECTORS - לגישה נוחה לנתונים
// =============================================================================

export const selectCurrentFormAnswers = (state) => state.answers.currentFormAnswers;
export const selectAnswersByKidAndForm = (kidId, formId) => (state) => {
  const key = `${kidId}_${formId}`;
  return state.answers.answersByKidAndForm[key] || [];
};
export const selectAnswersStatus = (state) => state.answers.status;
export const selectSaveStatus = (state) => state.answers.saveStatus;
export const selectAnswersError = (state) => state.answers.error;
export const selectSaveError = (state) => state.answers.saveError;
export const selectLocalAnswers = (state) => state.answers.localAnswers;
export const selectHasLocalChanges = (state) => state.answers.hasLocalChanges;

// 🔥 בדיקה אם יש שינויים מקומיים לשאלה ספציפית
export const selectHasLocalAnswerForQuestion = (questionNo) => (state) => 
  !!state.answers.localAnswers[questionNo];

// 🔥 קבלת ערך תשובה לשאלה ספציפית (מקומי או שמור)
export const selectAnswerForQuestion = (questionNo) => (state) => {
  // אם יש ערך מקומי - נחזיר אותו
  if (state.answers.localAnswers[questionNo]) {
    return state.answers.localAnswers[questionNo];
  }
  
  // אחרת נחזיר את הערך השמור
  const savedAnswer = state.answers.currentFormAnswers.find(a => a.questionNo === questionNo);
  return {
    answer: savedAnswer?.answer || '',
    other: savedAnswer?.other || ''
  };
};

// Helper function
const getCurrentUserId = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user?.id || null;
};

export const { 
  clearError, 
  setCurrentForm, 
  updateLocalAnswer,
  resetLocalAnswer,
  resetAllLocalAnswers,
  clearAnswers,
  clearKidAnswers
} = answersSlice.actions;

export default answersSlice.reducer;