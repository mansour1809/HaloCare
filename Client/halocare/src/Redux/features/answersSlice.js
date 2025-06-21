// src/Redux/features/answersSlice.js - גרסה שלמה ומעודכנת
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

// שמירת תשובה יחידה (ללא עדכון סטטוס)
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

// 🔥 שמירת תשובה עם עדכון אוטומטי של סטטוס קליטה
export const saveAnswerWithStatusCheck = createAsyncThunk(
  'answers/saveAnswerWithStatusCheck',
  async (answerData, { dispatch, rejectWithValue }) => {
    try {
      // 1. שמירת התשובה
      const response = await axios.post('/Forms/answers', answerData);
      
      // 2. בדיקת השלמת טופס אוטומטית
      await dispatch(checkFormCompletion({
        kidId: answerData.kidId,
        formId: answerData.formId
      }));
      
      // 3. טעינה מחדש של סטטוס קליטה (בשביל העדכון בזמן אמת)
      setTimeout(() => {
        dispatch(fetchOnboardingStatus(answerData.kidId));
      }, 100); // מעט דיליי כדי שהשרת יספיק לעדכן
      
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
    console.log('Updating answer:', answerId, answerData);
    try {
      const response = await axios.put(`/Forms/answers/${answerId}`, answerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון התשובה');
    }
  }
);

// 🔥 עדכון תשובה עם בדיקת סטטוס
export const updateAnswerWithStatusCheck = createAsyncThunk(
  'answers/updateAnswerWithStatusCheck',
  async ({ answerId, answerData }, { dispatch, rejectWithValue }) => {
    try {
      // 1. עדכון התשובה
      const response = await axios.put(`/Forms/answers/${answerId}`, answerData);
      
      // 2. בדיקת השלמת טופס
      await dispatch(checkFormCompletion({
        kidId: answerData.kidId,
        formId: answerData.formId
      }));
      
      // 3. עדכון סטטוס קליטה
      setTimeout(() => {
        dispatch(fetchOnboardingStatus(answerData.kidId));
      }, 100);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון התשובה');
    }
  }
);

// 🔥 שמירת טופס שלם עם עדכון סטטוס
export const saveFormAnswersWithStatusUpdate = createAsyncThunk(
  'answers/saveFormAnswersWithStatusUpdate',
  async ({ kidId, formId, answers }, { dispatch, rejectWithValue }) => {
    try {
      const savedAnswers = [];
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;

      // שמירת כל התשובות אחת אחת
      for (const answer of answers) {
        const answerData = {
          kidId,
          formId,
          questionNo: answer.questionNo,
          ansDate: new Date().toISOString(),
          answer: answer.answer,
          other: answer.other || "",
          employeeId: answer.byParent ? null : userId,
          byParent: answer.byParent || false
        };

        const response = await axios.post('/Forms/answers', answerData);
        savedAnswers.push(response.data);
      }

      // בדיקת השלמה אוטומטית אחרי שמירת כל התשובות
      await dispatch(checkFormCompletion({ kidId, formId }));
      
      // עדכון סטטוס קליטה
      setTimeout(() => {
        dispatch(fetchOnboardingStatus(kidId));
      }, 200);

      return { kidId, formId, answers: savedAnswers };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בשמירת תשובות הטופס');
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

// 🔥 מחיקת תשובה עם עדכון סטטוס
export const deleteAnswerWithStatusCheck = createAsyncThunk(
  'answers/deleteAnswerWithStatusCheck',
  async ({ answerId, kidId, formId }, { dispatch, rejectWithValue }) => {
    try {
      // 1. מחיקת התשובה
      await axios.delete(`/Forms/answers/${answerId}`);
      
      // 2. בדיקת השלמת טופס
      await dispatch(checkFormCompletion({ kidId, formId }));
      
      // 3. עדכון סטטוס קליטה
      setTimeout(() => {
        dispatch(fetchOnboardingStatus(kidId));
      }, 100);
      
      return answerId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה במחיקת התשובה');
    }
  }
);

// 🆕 שמירת תשובה עם מידע מורכב
export const saveAnswerWithMultipleEntries = createAsyncThunk(
  'answers/saveAnswerWithMultipleEntries',
  async (answerData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/Forms/answers/with-multiple-entries', answerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בשמירת התשובה עם מידע מורכב');
    }
  }
);

// 🆕 עדכון תשובה עם מידע מורכב
export const updateAnswerWithMultipleEntries = createAsyncThunk(
  'answers/updateAnswerWithMultipleEntries',
  async ({ answerId, answerData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/Forms/answers/${answerId}/with-multiple-entries`, answerData);
      return { answerId, ...answerData };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון התשובה עם מידע מורכב');
    }
  }
);

// 🆕 שליפת מידע רפואי קריטי
export const fetchCriticalMedicalInfo = createAsyncThunk(
  'answers/fetchCriticalMedicalInfo',
  async (kidId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Forms/critical-medical-info/${kidId}`);
      console.log('Fetched critical medical info:', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת מידע רפואי קריטי');
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
    
    // מצבי טעינה
    status: 'idle', // idle, loading, succeeded, failed
    saveStatus: 'idle', // מצב שמירה נפרד
    error: null,
    saveError: null,
    
    // מטמון מקומי לעדכונים
    localChanges: {}, // שינויים שטרם נשמרו

     // 🆕 מידע רפואי קריטי
    criticalMedicalInfo: [],
    criticalInfoStatus: 'idle',
    criticalInfoError: null,
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
    },
    
    // 🆕 עדכון מקומי של מידע מורכב
    updateLocalMultipleEntries: (state, action) => {
      const { questionNo, multipleEntries } = action.payload;
      const key = `${state.currentKidId}_${state.currentFormId}_${questionNo}`;
      
      state.localChanges[key] = {
        questionNo,
        answer: 'כן', // תמיד "כן" אם יש מידע מורכב
        multipleEntries,
        timestamp: Date.now()
      };
    },

    // ✏️ עדכון תשובה מקומית (לפני שמירה)
    updateLocalAnswer: (state, action) => {
      const { questionNo, answer, other } = action.payload;
      const key = `${state.currentKidId}_${state.currentFormId}_${questionNo}`;
      
      state.localChanges[key] = {
        questionNo,
        answer,
        other,
        timestamp: Date.now()
      };
    },
    
    // 💾 שמירת שינויים מקומיים לעדכון
    applyLocalChanges: (state) => {
      Object.values(state.localChanges).forEach(change => {
        const existingAnswer = state.currentFormAnswers.find(
          a => a.questionNo === change.questionNo
        );
        
        if (existingAnswer) {
          existingAnswer.answer = change.answer;
          existingAnswer.other = change.other;
        } else {
          // תשובה חדשה - נוסיף אותה זמנית
          state.currentFormAnswers.push({
            questionNo: change.questionNo,
            answer: change.answer,
            other: change.other,
            kidId: state.currentKidId,
            formId: state.currentFormId,
            isLocal: true // סימון שזה עדכון מקומי
          });
        }
      });
      
      // ניקוי השינויים המקומיים
      state.localChanges = {};
    },
    
    // 🧹 ניקוי תשובות נוכחיות (כשעוזבים טופס)
    clearCurrentFormAnswers: (state) => {
      state.currentFormAnswers = [];
      state.currentKidId = null;
      state.currentFormId = null;
      state.localChanges = {};
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
        state.localChanges = {};
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
      
      // 💾 שמירת תשובה יחידה
      .addCase(saveAnswer.pending, (state) => {
        state.saveStatus = 'loading';
        state.saveError = null;
      })
      .addCase(saveAnswer.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        const answer = action.payload;
        
        // עדכון ברשת התשובות
        const key = `${answer.kidId}_${answer.formId}`;
        if (!state.answersByKidAndForm[key]) {
          state.answersByKidAndForm[key] = [];
        }
        
        // בדיקה אם התשובה כבר קיימת (עדכון) או חדשה (הוספה)
        const existingIndex = state.answersByKidAndForm[key].findIndex(
          a => a.questionNo === answer.questionNo
        );
        
        if (existingIndex !== -1) {
          state.answersByKidAndForm[key][existingIndex] = answer;
        } else {
          state.answersByKidAndForm[key].push(answer);
        }
        
        // עדכון בטופס הנוכחי אם רלוונטי
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
        state.saveError = action.payload;
      })
      
      // 🔥 שמירת תשובה עם עדכון סטטוס
      .addCase(saveAnswerWithStatusCheck.pending, (state) => {
        state.saveStatus = 'loading';
        state.saveError = null;
      })
      .addCase(saveAnswerWithStatusCheck.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        // אותה לוגיקה כמו saveAnswer.fulfilled
        const answer = action.payload;
        
        const key = `${answer.kidId}_${answer.formId}`;
        if (!state.answersByKidAndForm[key]) {
          state.answersByKidAndForm[key] = [];
        }
        
        const existingIndex = state.answersByKidAndForm[key].findIndex(
          a => a.questionNo === answer.questionNo
        );
        
        if (existingIndex !== -1) {
          state.answersByKidAndForm[key][existingIndex] = answer;
        } else {
          state.answersByKidAndForm[key].push(answer);
        }
        
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
      .addCase(saveAnswerWithStatusCheck.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.saveError = action.payload;
      })
      
      // ✏️ עדכון תשובה
      .addCase(updateAnswer.fulfilled, (state, action) => {
        const answer = action.payload;
        const key = `${answer.kidId}_${answer.formId}`;
        
        // עדכון ברשת התשובות
        if (state.answersByKidAndForm[key]) {
          const index = state.answersByKidAndForm[key].findIndex(
            a => a.answerId === answer.answerId
          );
          if (index !== -1) {
            state.answersByKidAndForm[key][index] = answer;
          }
        }
        
        // עדכון בטופס הנוכחי
        if (state.currentKidId === answer.kidId && state.currentFormId === answer.formId) {
          const currentIndex = state.currentFormAnswers.findIndex(
            a => a.answerId === answer.answerId
          );
          if (currentIndex !== -1) {
            state.currentFormAnswers[currentIndex] = answer;
          }
        }
      })
      
      // 🔥 עדכון תשובה עם בדיקת סטטוס
      .addCase(updateAnswerWithStatusCheck.fulfilled, (state, action) => {
        // אותה לוגיקה כמו updateAnswer.fulfilled
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
        
        if (state.currentKidId === answer.kidId && state.currentFormId === answer.formId) {
          const currentIndex = state.currentFormAnswers.findIndex(
            a => a.answerId === answer.answerId
          );
          if (currentIndex !== -1) {
            state.currentFormAnswers[currentIndex] = answer;
          }
        }
      })
      
      // 💾 שמירת טופס שלם
      .addCase(saveFormAnswersWithStatusUpdate.pending, (state) => {
        state.saveStatus = 'loading';
        state.saveError = null;
      })
      .addCase(saveFormAnswersWithStatusUpdate.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        const { kidId, formId, answers } = action.payload;
        const key = `${kidId}_${formId}`;
        
        // שמירת כל התשובות
        state.answersByKidAndForm[key] = answers;
        
        // עדכון הטופס הנוכחי
        if (state.currentKidId === kidId && state.currentFormId === formId) {
          state.currentFormAnswers = answers;
        }
        
        // ניקוי שינויים מקומיים
        state.localChanges = {};
      })
      .addCase(saveFormAnswersWithStatusUpdate.rejected, (state, action) => {
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
      })
      
      // 🔥 מחיקת תשובה עם בדיקת סטטוס
      .addCase(deleteAnswerWithStatusCheck.fulfilled, (state, action) => {
        // אותה לוגיקה כמו deleteAnswer.fulfilled
        const answerId = action.payload;
        
        Object.keys(state.answersByKidAndForm).forEach(key => {
          state.answersByKidAndForm[key] = state.answersByKidAndForm[key].filter(
            a => a.answerId !== answerId
          );
        });
        
        state.currentFormAnswers = state.currentFormAnswers.filter(
          a => a.answerId !== answerId
        );
      })

       // 🆕 Save answer with multiple entries
      .addCase(saveAnswerWithMultipleEntries.pending, (state) => {
        state.saveStatus = 'loading';
        state.saveError = null;
      })
      .addCase(saveAnswerWithMultipleEntries.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        
        // עדכון התשובה ברשימה הנוכחית
        const newAnswer = action.payload;
        const existingIndex = state.currentFormAnswers.findIndex(
          a => a.questionNo === newAnswer.questionNo
        );
        
        if (existingIndex !== -1) {
          state.currentFormAnswers[existingIndex] = newAnswer;
        } else {
          state.currentFormAnswers.push(newAnswer);
        }
        
        // עדכון במטמון הכללי
        const key = `${state.currentKidId}_${state.currentFormId}`;
        if (!state.answersByKidAndForm[key]) {
          state.answersByKidAndForm[key] = [];
        }
        const cacheIndex = state.answersByKidAndForm[key].findIndex(
          a => a.questionNo === newAnswer.questionNo
        );
        if (cacheIndex !== -1) {
          state.answersByKidAndForm[key][cacheIndex] = newAnswer;
        } else {
          state.answersByKidAndForm[key].push(newAnswer);
        }
        
        // ניקוי שינויים מקומיים
        const localKey = `${state.currentKidId}_${state.currentFormId}_${newAnswer.questionNo}`;
        delete state.localChanges[localKey];
      })
      .addCase(saveAnswerWithMultipleEntries.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.saveError = action.payload;
      })
      
      // 🆕 Update answer with multiple entries
      .addCase(updateAnswerWithMultipleEntries.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        // לוגיקה דומה לsave
        const updatedAnswer = action.payload;
const existingIndex = state.currentFormAnswers.findIndex(
          a => a.questionNo === updatedAnswer.questionNo
        );
        
        if (existingIndex !== -1) {
          state.currentFormAnswers[existingIndex] = updatedAnswer;
        } else {
          state.currentFormAnswers.push(updatedAnswer);
        }
        
        // עדכון במטמון הכללי
        const key = `${state.currentKidId}_${state.currentFormId}`;
        if (!state.answersByKidAndForm[key]) {
          state.answersByKidAndForm[key] = [];
        }
        const cacheIndex = state.answersByKidAndForm[key].findIndex(
          a => a.questionNo === updatedAnswer.questionNo
        );
        if (cacheIndex !== -1) {
          state.answersByKidAndForm[key][cacheIndex] = updatedAnswer;
        } else {
          state.answersByKidAndForm[key].push(updatedAnswer);
        }
        
        // ניקוי שינויים מקומיים
        const localKey = `${state.currentKidId}_${state.currentFormId}_${updatedAnswer.questionNo}`;
        delete state.localChanges[localKey];
      })

      // 🆕 Fetch critical medical info
      .addCase(fetchCriticalMedicalInfo.pending, (state) => {
        state.criticalInfoStatus = 'loading';
        state.criticalInfoError = null;
      })
      .addCase(fetchCriticalMedicalInfo.fulfilled, (state, action) => {
        state.criticalInfoStatus = 'succeeded';
        state.criticalMedicalInfo = action.payload;
      })
      .addCase(fetchCriticalMedicalInfo.rejected, (state, action) => {
        state.criticalInfoStatus = 'failed';
        state.criticalInfoError = action.payload;
      });
  }
});

// SELECTORS - לגישה נוחה לנתונים

export const selectCurrentFormAnswers = (state) => state.answers.currentFormAnswers;
export const selectAnswersByKidAndForm = (kidId, formId) => (state) => {
  const key = `${kidId}_${formId}`;
  return state.answers.answersByKidAndForm[key] || [];
};
export const selectAnswersStatus = (state) => state.answers.status;
export const selectSaveStatus = (state) => state.answers.saveStatus;
export const selectAnswersError = (state) => state.answers.error;
export const selectSaveError = (state) => state.answers.saveError;
export const selectLocalChanges = (state) => state.answers.localChanges;

// בדיקה אם יש שינויים מקומיים שטרם נשמרו
export const selectHasUnsavedChanges = (state) => 
  Object.keys(state.answers.localChanges).length > 0;

// קבלת תשובה לשאלה ספציפית
export const selectAnswerForQuestion = (questionNo) => (state) => 
  state.answers.currentFormAnswers.find(a => a.questionNo === questionNo);

export const { 
  clearError, 
  setCurrentForm, 
  updateLocalAnswer, 
  applyLocalChanges,
  clearAnswers,
  clearCurrentFormAnswers, // 🔥 הוספה
  clearKidAnswers,
    updateLocalMultipleEntries 

} = answersSlice.actions;

export default answersSlice.reducer;