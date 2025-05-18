// src/Redux/features/answersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// אסינק ת'אנק לשליפת תשובות לטופס ספציפי
export const fetchAnswers = createAsyncThunk(
  'answers/fetchAnswers',
  async ({ kidId, formId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Kids/${kidId}/Forms/${formId}/answers`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת תשובות');
    }
  }
);

// אסינק ת'אנק לשליפת כל התשובות של ילד
export const fetchAllKidAnswers = createAsyncThunk(
  'answers/fetchAllKidAnswers',
  async (kidId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Kids/${kidId}/answers`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת כל התשובות');
    }
  }
);

// אסינק ת'אנק לשמירת תשובות
export const saveAnswers = createAsyncThunk(
  'answers/saveAnswers',
  async (answers, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/Answers`, answers);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בשמירת תשובות');
    }
  }
);

const answersSlice = createSlice({
  name: 'answers',
  initialState: {
    answers: [],
    allKidAnswers: [],
    status: 'idle',
    saveStatus: 'idle',
    error: null,
    saveError: null
  },
  reducers: {
    resetSaveStatus: (state) => {
      state.saveStatus = 'idle';
      state.saveError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // FetchAnswers
      .addCase(fetchAnswers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAnswers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.answers = action.payload;
      })
      .addCase(fetchAnswers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת תשובות';
      })
      
      // FetchAllKidAnswers
      .addCase(fetchAllKidAnswers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllKidAnswers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allKidAnswers = action.payload;
      })
      .addCase(fetchAllKidAnswers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת כל התשובות';
      })
      
      // SaveAnswers
      .addCase(saveAnswers.pending, (state) => {
        state.saveStatus = 'loading';
      })
      .addCase(saveAnswers.fulfilled, (state) => {
        state.saveStatus = 'succeeded';
      })
      .addCase(saveAnswers.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.saveError = action.payload || 'שגיאה בשמירת תשובות';
      });
  }
});

export const { resetSaveStatus } = answersSlice.actions;

export default answersSlice.reducer;