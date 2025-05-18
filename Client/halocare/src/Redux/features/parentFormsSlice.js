// src/Redux/features/parentFormsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// אסינק ת'אנק לאימות גישה לטופס
export const verifyFormAccess = createAsyncThunk(
  'parentForms/verifyFormAccess',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/ParentForms/verify/${token}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'הקישור אינו תקף או שפג תוקפו');
    }
  }
);

// אסינק ת'אנק לשליחת קוד אימות
export const sendVerificationCode = createAsyncThunk(
  'parentForms/sendVerificationCode',
  async ({ formId, phoneNumber }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/ParentForms/send-verification`, {
        formId,
        phoneNumber
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בשליחת קוד אימות');
    }
  }
);

// אסינק ת'אנק לאימות קוד
export const verifyCode = createAsyncThunk(
  'parentForms/verifyCode',
  async ({ formId, phoneNumber, code }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/ParentForms/verify-code`, {
        formId,
        phoneNumber,
        code
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'קוד אימות שגוי');
    }
  }
);

const parentFormsSlice = createSlice({
  name: 'parentForms',
  initialState: {
    kidInfo: null,
    accessVerified: false,
    verificationSent: false,
    status: 'idle',
    error: null
  },
  reducers: {
    resetVerification: (state) => {
      state.verificationSent = false;
      state.accessVerified = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // VerifyFormAccess
      .addCase(verifyFormAccess.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(verifyFormAccess.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.kidInfo = action.payload;
        state.accessVerified = true;
      })
      .addCase(verifyFormAccess.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'הקישור אינו תקף או שפג תוקפו';
      })
      
      // SendVerificationCode
      .addCase(sendVerificationCode.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendVerificationCode.fulfilled, (state) => {
        state.status = 'succeeded';
        state.verificationSent = true;
      })
      .addCase(sendVerificationCode.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בשליחת קוד אימות';
      })
      
      // VerifyCode
      .addCase(verifyCode.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(verifyCode.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.kidInfo = action.payload;
        state.accessVerified = true;
      })
      .addCase(verifyCode.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'קוד אימות שגוי';
      });
  }
});

export const { resetVerification } = parentFormsSlice.actions;

export default parentFormsSlice.reducer;