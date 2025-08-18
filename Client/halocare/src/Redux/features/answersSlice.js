// src/Redux/features/answersSlice.js - גרסה שלמה ומעודכנת
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// ייבוא thunks מ-onboardingSlice לעדכון סטטוס
import { checkFormCompletion, fetchOnboardingStatus } from './onboardingSlice';
import { useAuth } from '../../components/login/AuthContext';

// =============================================================================
// ASYNC THUNKS 
// =============================================================================

// Retrieving answers to a specific form for a specific child
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

// Save a single reply (without status update)
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

// Saving a response with automatic update of reception status
export const saveAnswerWithStatusCheck = createAsyncThunk(
  'answers/saveAnswerWithStatusCheck',
  async (answerData, { dispatch, rejectWithValue }) => {
    try {
// 1. Saving the answer
      const response = await axios.post('/Forms/answers', answerData);
      
      // 2. Automatic form completion test
      await dispatch(checkFormCompletion({
        kidId: answerData.kidId,
        formId: answerData.formId
      }));
      
      // // 3. Reload reception status (for real-time update)
      setTimeout(() => {
        dispatch(fetchOnboardingStatus(answerData.kidId));
      }, 100); // A little delay so the server has time to update
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בשמירת התשובה');
    }
  }
);

// Update an existing answer
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

// Update answer with status check
export const updateAnswerWithStatusCheck = createAsyncThunk(
  'answers/updateAnswerWithStatusCheck',
  async ({ answerId, answerData }, { dispatch, rejectWithValue }) => {
    try {
      // 1. Update the answer
      const response = await axios.put(`/Forms/answers/${answerId}`, answerData);
      
      // 2. Form completion check
      await dispatch(checkFormCompletion({
        kidId: answerData.kidId,
        formId: answerData.formId
      }));
      
      // 3. Update reception status
      setTimeout(() => {
        dispatch(fetchOnboardingStatus(answerData.kidId));
      }, 100);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון התשובה');
    }
  }
);

// Save entire form with status update
export const saveFormAnswersWithStatusUpdate = createAsyncThunk(
  'answers/saveFormAnswersWithStatusUpdate',
  async ({ kidId, formId, answers }, { dispatch, rejectWithValue }) => {
    try {
      const savedAnswers = [];
  const {currentUser} = useAuth();
      const userId = currentUser?.id;

      // Saving all answers one by one
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

// Autocomplete check after saving all answers
      await dispatch(checkFormCompletion({ kidId, formId }));
      
// Update reception status
      setTimeout(() => {
        dispatch(fetchOnboardingStatus(kidId));
      }, 200);

      return { kidId, formId, answers: savedAnswers };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בשמירת תשובות הטופס');
    }
  }
);

// Delete Answer
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

// Delete reply with status update
export const deleteAnswerWithStatusCheck = createAsyncThunk(
  'answers/deleteAnswerWithStatusCheck',
  async ({ answerId, kidId, formId }, { dispatch, rejectWithValue }) => {
    try {
      // 1. Deleting the answer
      await axios.delete(`/Forms/answers/${answerId}`);
      
      // 2. Form completion check
      await dispatch(checkFormCompletion({ kidId, formId }));
      
      // 3. Update reception status
      setTimeout(() => {
        dispatch(fetchOnboardingStatus(kidId));
      }, 100);
      
      return answerId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה במחיקת התשובה');
    }
  }
);

// Saving a response with complex information
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

// Update answer with complex information
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

// Retrieving critical medical information
export const fetchCriticalMedicalInfo = createAsyncThunk(
  'answers/fetchCriticalMedicalInfo',
  async (kidId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Forms/critical-medical-info/${kidId}`);
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
    // Answers by child and form
    answersByKidAndForm: {}, // { "kidId_formId": [answers] }
    
    // Responses of the current form
    currentFormAnswers: [],
    currentKidId: null,
    currentFormId: null,
    
    // Charging modes
    status: 'idle', // idle, loading, succeeded, failed
    saveStatus: 'idle', // Separate save mode
    error: null,
    saveError: null,
    
    // Local cache for updates
    localChanges: {}, // Unsaved changes

     // Critical medical information
    criticalMedicalInfo: [],
    criticalInfoStatus: 'idle',
    criticalInfoError: null,
  },
  reducers: {
    // Error cleaning
    clearError: (state) => {
      state.error = null;
      state.saveError = null;
    },
    
    // Set current form
    setCurrentForm: (state, action) => {
      const { kidId, formId } = action.payload;
      state.currentKidId = kidId;
      state.currentFormId = formId;
      
      // Load the answers to the current form
      const key = `${kidId}_${formId}`;
      state.currentFormAnswers = state.answersByKidAndForm[key] || [];
    },
    
    // Local update of complex information
    updateLocalMultipleEntries: (state, action) => {
      const { questionNo, multipleEntries } = action.payload;
      const key = `${state.currentKidId}_${state.currentFormId}_${questionNo}`;
      
      state.localChanges[key] = {
        questionNo,
        answer: 'כן', // Always "yes" if there is complex information
        multipleEntries,
        timestamp: Date.now()
      };
    },

    // Update local answer (before saving)
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
    
    // Save local changes for update
    applyLocalChanges: (state) => {
      Object.values(state.localChanges).forEach(change => {
        const existingAnswer = state.currentFormAnswers.find(
          a => a.questionNo === change.questionNo
        );
        
        if (existingAnswer) {
          existingAnswer.answer = change.answer;
          existingAnswer.other = change.other;
        } else {
          // New answer - we'll add it temporarily
          state.currentFormAnswers.push({
            questionNo: change.questionNo,
            answer: change.answer,
            other: change.other,
            kidId: state.currentKidId,
            formId: state.currentFormId,
            isLocal: true // Mark this as a local update
          });
        }
      });
      
      // Clear local changes
      state.localChanges = {};
    },
    
    // Clear current responses (when leaving a form)
    clearCurrentFormAnswers: (state) => {
      state.currentFormAnswers = [];
      state.currentKidId = null;
      state.currentFormId = null;
      state.localChanges = {};
      state.error = null;
      state.saveError = null;
    },
    
    // Clearing specific child data
    clearKidAnswers: (state, action) => {
      const kidId = action.payload;
      Object.keys(state.answersByKidAndForm).forEach(key => {
        if (key.startsWith(`${kidId}_`)) {
          delete state.answersByKidAndForm[key];
        }
      });
      
// If this is the current child, clear the current data as well
      if (state.currentKidId === kidId) {
        state.currentFormAnswers = [];
        state.localChanges = {};
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Retrieve form answers
      .addCase(fetchFormAnswers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFormAnswers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { kidId, formId, answers } = action.payload;
        const key = `${kidId}_${formId}`;
        
        state.answersByKidAndForm[key] = answers;
        
        // If this is the current form, update it too
        if (state.currentKidId === kidId && state.currentFormId === formId) {
          state.currentFormAnswers = answers;
        }
      })
      .addCase(fetchFormAnswers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Save a single answer
      .addCase(saveAnswer.pending, (state) => {
        state.saveStatus = 'loading';
        state.saveError = null;
      })
      .addCase(saveAnswer.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        const answer = action.payload;
        
        // Update the answer grid
        const key = `${answer.kidId}_${answer.formId}`;
        if (!state.answersByKidAndForm[key]) {
          state.answersByKidAndForm[key] = [];
        }
        
// Check if the answer already exists (update) or is new (add)
        const existingIndex = state.answersByKidAndForm[key].findIndex(
          a => a.questionNo === answer.questionNo
        );
        
        if (existingIndex !== -1) {
          state.answersByKidAndForm[key][existingIndex] = answer;
        } else {
          state.answersByKidAndForm[key].push(answer);
        }
        
        // Update the current form if applicable
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
      
      // Save reply with status update
      .addCase(saveAnswerWithStatusCheck.pending, (state) => {
        state.saveStatus = 'loading';
        state.saveError = null;
      })
      .addCase(saveAnswerWithStatusCheck.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
// Same logic as saveAnswer.fulfilled
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
      
      // Update answer
      .addCase(updateAnswer.fulfilled, (state, action) => {
        const answer = action.payload;
        const key = `${answer.kidId}_${answer.formId}`;
        
      // Update the answer grid
        if (state.answersByKidAndForm[key]) {
          const index = state.answersByKidAndForm[key].findIndex(
            a => a.answerId === answer.answerId
          );
          if (index !== -1) {
            state.answersByKidAndForm[key][index] = answer;
          }
        }
        
        // Update the current form
        if (state.currentKidId === answer.kidId && state.currentFormId === answer.formId) {
          const currentIndex = state.currentFormAnswers.findIndex(
            a => a.answerId === answer.answerId
          );
          if (currentIndex !== -1) {
            state.currentFormAnswers[currentIndex] = answer;
          }
        }
      })
      
      // Update answer with status check
      .addCase(updateAnswerWithStatusCheck.fulfilled, (state, action) => {
        // Same logic as updateAnswer.fulfilled
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
      
      // Save entire form
      .addCase(saveFormAnswersWithStatusUpdate.pending, (state) => {
        state.saveStatus = 'loading';
        state.saveError = null;
      })
      .addCase(saveFormAnswersWithStatusUpdate.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        const { kidId, formId, answers } = action.payload;
        const key = `${kidId}_${formId}`;
        
        // Saving all answers
        state.answersByKidAndForm[key] = answers;
        
       // Update the current form
        if (state.currentKidId === kidId && state.currentFormId === formId) {
          state.currentFormAnswers = answers;
        }
        
        // Clean up local changes
        state.localChanges = {};
      })
      .addCase(saveFormAnswersWithStatusUpdate.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.saveError = action.payload;
      })
      
      // Delete answer
      .addCase(deleteAnswer.fulfilled, (state, action) => {
        const answerId = action.payload;
        
        // Delete from all places
        Object.keys(state.answersByKidAndForm).forEach(key => {
          state.answersByKidAndForm[key] = state.answersByKidAndForm[key].filter(
            a => a.answerId !== answerId
          );
        });
        
        // Delete from the current form
        state.currentFormAnswers = state.currentFormAnswers.filter(
          a => a.answerId !== answerId
        );
      })
      
      // Delete reply with status check
      .addCase(deleteAnswerWithStatusCheck.fulfilled, (state, action) => {
        // Same logic as deleteAnswer.fulfilled
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

       //  Save answer with multiple entries
      .addCase(saveAnswerWithMultipleEntries.pending, (state) => {
        state.saveStatus = 'loading';
        state.saveError = null;
      })
      .addCase(saveAnswerWithMultipleEntries.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        
        // Update the answer in the current list
        const newAnswer = action.payload;
        const existingIndex = state.currentFormAnswers.findIndex(
          a => a.questionNo === newAnswer.questionNo
        );
        
        if (existingIndex !== -1) {
          state.currentFormAnswers[existingIndex] = newAnswer;
        } else {
          state.currentFormAnswers.push(newAnswer);
        }
        
        // Update the global cache
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
        
        // Clean up local changes
        const localKey = `${state.currentKidId}_${state.currentFormId}_${newAnswer.questionNo}`;
        delete state.localChanges[localKey];
      })
      .addCase(saveAnswerWithMultipleEntries.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.saveError = action.payload;
      })
      
      //  Update answer with multiple entries
      .addCase(updateAnswerWithMultipleEntries.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        // Similar logic to save
        const updatedAnswer = action.payload;
const existingIndex = state.currentFormAnswers.findIndex(
          a => a.questionNo === updatedAnswer.questionNo
        );
        
        if (existingIndex !== -1) {
          state.currentFormAnswers[existingIndex] = updatedAnswer;
        } else {
          state.currentFormAnswers.push(updatedAnswer);
        }
        
        // Update the global cache
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
        
       // Clean up local changes
        const localKey = `${state.currentKidId}_${state.currentFormId}_${updatedAnswer.questionNo}`;
        delete state.localChanges[localKey];
      })

      //  Fetch critical medical info
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

// SELECTORS - for easy data access

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

// Check if there are any local changes that have not yet been saved
export const selectHasUnsavedChanges = (state) => 
  Object.keys(state.answers.localChanges).length > 0;

// Getting an answer to a specific question
export const selectAnswerForQuestion = (questionNo) => (state) => 
  state.answers.currentFormAnswers.find(a => a.questionNo === questionNo);

export const { 
  clearError, 
  setCurrentForm, 
  updateLocalAnswer, 
  applyLocalChanges,
  clearAnswers,
  clearCurrentFormAnswers, // Add
  clearKidAnswers,
    updateLocalMultipleEntries 

} = answersSlice.actions;

export default answersSlice.reducer;