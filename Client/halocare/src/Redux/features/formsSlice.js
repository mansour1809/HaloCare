// src/redux/features/formsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// אסינק תאנק לטעינת הגדרות כל הטפסים
export const fetchFormDefinitions = createAsyncThunk(
  'forms/fetchFormDefinitions',
  async (_, { rejectWithValue }) => {
    try {
      // נניח שיש לנו אנדפוינט שמחזיר את כל הגדרות הטפסים
      const response = await axios.get('/Forms/definitions');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת הגדרות הטפסים');
    }
  }
);

// אסינק תאנק לטעינת שאלות של טופס מסוים
export const fetchFormQuestions = createAsyncThunk(
  'forms/fetchFormQuestions',
  async (formId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Forms/${formId}/questions`);
      return { formId, questions: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת שאלות הטופס');
    }
  }
);

// אסינק תאנק לטעינת תשובות של טופס עבור ילד מסוים
export const fetchFormAnswers = createAsyncThunk(
  'forms/fetchFormAnswers',
  async ({ formId, kidId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Forms/${formId}/answers/${kidId}`);
      return { formId, kidId, answers: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת תשובות הטופס');
    }
  }
);

// אסינק תאנק לשמירת תשובות לטופס
export const saveFormAnswers = createAsyncThunk(
  'forms/saveFormAnswers',
  async ({ formId, kidId, answers, byParent }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/Forms/${formId}/answers/${kidId}`, {
        answers,
        byParent: byParent || false
      });
      return { formId, kidId, answers: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בשמירת תשובות הטופס');
    }
  }
);

// יצירת סלייס
const formsSlice = createSlice({
  name: 'forms',
  initialState: {
    formDefinitions: [],        // הגדרות כל הטפסים
    formQuestions: {},          // שאלות לכל טופס (המפתח הוא מזהה הטופס)
    formAnswers: {},            // תשובות לכל טופס עבור ילד מסוים (המפתח הוא "formId-kidId")
    currentFormData: {          // נתונים של הטופס הנוכחי בתהליך העריכה
      formId: null,
      kidId: null,
      answers: {},
      changed: false,
      validationErrors: {}
    },
    status: 'idle',             // מצב הבקשה האחרונה
    error: null                 // שגיאה אחרונה
  },
  reducers: {
    // העברה לטופס חדש (ניקוי נתוני טופס נוכחי)
    setCurrentForm: (state, action) => {
      const { formId, kidId } = action.payload;
      state.currentFormData = {
        formId,
        kidId,
        answers: {},
        changed: false,
        validationErrors: {}
      };

      // אם יש תשובות שמורות לטופס זה, נטען אותן
      const answerKey = `${formId}-${kidId}`;
      if (state.formAnswers[answerKey]) {
        state.currentFormData.answers = { ...state.formAnswers[answerKey] };
      }
    },

    // עדכון תשובה בודדת בטופס הנוכחי
    updateAnswer: (state, action) => {
      const { questionNo, answer, other } = action.payload;
      
      state.currentFormData.answers[questionNo] = {
        ...state.currentFormData.answers[questionNo],
        answer,
        other: other || null
      };
      
      state.currentFormData.changed = true;
      
      // ניקוי שגיאת ולידציה אם קיימת
      if (state.currentFormData.validationErrors[questionNo]) {
        delete state.currentFormData.validationErrors[questionNo];
      }
    },

    // נקה שגיאות ולידציה
    clearValidationErrors: (state) => {
      state.currentFormData.validationErrors = {};
    },

    // הוסף שגיאת ולידציה
    addValidationError: (state, action) => {
      const { questionNo, error } = action.payload;
      state.currentFormData.validationErrors[questionNo] = error;
    },

    // סימון הטופס כלא השתנה (אחרי שמירה)
    resetFormChanged: (state) => {
      state.currentFormData.changed = false;
    },

    // ניקוי מצב הטופס הנוכחי
    clearCurrentForm: (state) => {
      state.currentFormData = {
        formId: null,
        kidId: null,
        answers: {},
        changed: false,
        validationErrors: {}
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // טיפול בבקשת טעינת הגדרות טפסים
      .addCase(fetchFormDefinitions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFormDefinitions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.formDefinitions = action.payload;
      })
      .addCase(fetchFormDefinitions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת הגדרות הטפסים';
      })

      // טיפול בבקשת טעינת שאלות טופס
      .addCase(fetchFormQuestions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFormQuestions.fulfilled, (state, action) => {
        const { formId, questions } = action.payload;
        state.status = 'succeeded';
        state.formQuestions[formId] = questions;
      })
      .addCase(fetchFormQuestions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת שאלות הטופס';
      })

      // טיפול בבקשת טעינת תשובות טופס
      .addCase(fetchFormAnswers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFormAnswers.fulfilled, (state, action) => {
        const { formId, kidId, answers } = action.payload;
        state.status = 'succeeded';
        
        // שמירת התשובות במבנה מפתח ייחודי
        const key = `${formId}-${kidId}`;
        state.formAnswers[key] = answers;
        
        // אם הטופס הנוכחי הוא הטופס שנטען, נעדכן גם את התשובות הנוכחיות
        if (state.currentFormData.formId === formId && state.currentFormData.kidId === kidId) {
          state.currentFormData.answers = { ...answers };
          state.currentFormData.changed = false;
        }
      })
      .addCase(fetchFormAnswers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת תשובות הטופס';
      })

      // טיפול בבקשת שמירת תשובות טופס
      .addCase(saveFormAnswers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(saveFormAnswers.fulfilled, (state, action) => {
        const { formId, kidId, answers } = action.payload;
        state.status = 'succeeded';
        
        // שמירת התשובות במבנה מפתח ייחודי
        const key = `${formId}-${kidId}`;
        state.formAnswers[key] = answers;
        
        // עדכון התשובות הנוכחיות והורדת דגל "השתנה"
        if (state.currentFormData.formId === formId && state.currentFormData.kidId === kidId) {
          state.currentFormData.answers = { ...answers };
          state.currentFormData.changed = false;
        }
      })
      .addCase(saveFormAnswers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בשמירת תשובות הטופס';
      });
  }
});

// ייצוא פעולות
export const { 
  setCurrentForm, 
  updateAnswer, 
  clearValidationErrors, 
  addValidationError,
  resetFormChanged,
  clearCurrentForm 
} = formsSlice.actions;

// סלקטורים
export const selectFormDefinitions = (state) => state.forms.formDefinitions;
export const selectFormQuestions = (state, formId) => state.forms.formQuestions[formId] || [];
export const selectFormAnswers = (state, formId, kidId) => {
  const key = `${formId}-${kidId}`;
  return state.forms.formAnswers[key] || {};
};
export const selectCurrentFormData = (state) => state.forms.currentFormData;
export const selectFormsStatus = (state) => state.forms.status;
export const selectFormsError = (state) => state.forms.error;

// ייצוא הרדיוסר
export default formsSlice.reducer;