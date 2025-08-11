import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// יצירת דוח תש"ה חדש
export const generateTasheReport = createAsyncThunk(
  'tasheReports/generateReport',
  async (reportData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/TasheReports/generate', reportData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה ביצירת הדוח');
    }
  }
);

// שליפת דוחות תש"ה לפי ילד
export const fetchTasheReportsByKid = createAsyncThunk(
  'tasheReports/fetchByKid',
  async (kidId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/TasheReports/kid/${kidId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת הדוחות');
    }
  }
);

// שליפת טיפולים לתצוגה מקדימה
export const fetchTreatmentsPreview = createAsyncThunk(
  'tasheReports/fetchTreatmentsPreview',
  async ({ kidId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/TasheReports/treatments-preview', {
        params: { kidId, startDate, endDate }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בשליפת הטיפולים');
    }
  }
);

// אישור דוח תש"ה
export const approveTasheReport = createAsyncThunk(
  'tasheReports/approveReport',
  async ({ reportId, approvedByEmployeeId }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/TasheReports/approve', {
        reportId,
        approvedByEmployeeId
      });
      return { reportId, approvedByEmployeeId };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה באישור הדוח');
    }
  }
);

// מחיקת דוח תש"ה
export const deleteTasheReport = createAsyncThunk(
  'tasheReports/deleteReport',
  async ({ reportId, deletedByEmployeeId }, { rejectWithValue }) => {
    try {
      await axios.delete(`/TasheReports/${reportId}?deletedByEmployeeId=${deletedByEmployeeId}`);
      return reportId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה במחיקת הדוח');
    }
  }
);
// עדכון דוח תש"ה
export const updateTasheReport = createAsyncThunk(
  'tasheReports/updateReport',
  async ({ reportId, reportData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/TasheReports/${reportId}`, reportData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון הדוח');
    }
  }
);

// בדיקת הרשאות עריכה
export const checkCanEditReport = createAsyncThunk(
  'tasheReports/checkCanEdit',
  async ({ reportId, employeeId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/TasheReports/${reportId}/can-edit?employeeId=${employeeId}`);
      return { reportId, canEdit: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בבדיקת הרשאות');
    }
  }
);

// שליפת סטטיסטיקות דוחות
export const fetchReportStatistics = createAsyncThunk(
  'tasheReports/fetchStatistics',
  async (kidId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/TasheReports/statistics/${kidId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בשליפת הסטטיסטיקות');
    }
  }
);


const tasheReportsSlice = createSlice({
  name: 'tasheReports',
  initialState: {
    reports: [],
    treatmentsPreview: [],
    currentReport: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    generateStatus: 'idle',
    previewStatus: 'idle',
    error: null,
    generateError: null,
    previewError: null,
    statistics: null,
    editPermissions: {}, // { reportId: boolean }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.generateError = null;
      state.previewError = null;
    },
    clearReports: (state) => {
      state.reports = [];
      state.status = 'idle';
      state.error = null;
    },
    clearTreatmentsPreview: (state) => {
      state.treatmentsPreview = [];
      state.previewStatus = 'idle';
      state.previewError = null;
    },
    setCurrentReport: (state, action) => {
      state.currentReport = action.payload;
    },
    resetGenerateStatus: (state) => {
      state.generateStatus = 'idle';
      state.generateError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Generate report
      .addCase(generateTasheReport.pending, (state) => {
        state.generateStatus = 'loading';
        state.generateError = null;
      })
      .addCase(generateTasheReport.fulfilled, (state, action) => {
        state.generateStatus = 'succeeded';
        state.reports.unshift(action.payload); // הוסף בתחילת הרשימה
        state.currentReport = action.payload;
      })
      .addCase(generateTasheReport.rejected, (state, action) => {
        state.generateStatus = 'failed';
        state.generateError = action.payload;
      })
      
      // Fetch reports by kid
      .addCase(fetchTasheReportsByKid.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTasheReportsByKid.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reports = action.payload;
      })
      .addCase(fetchTasheReportsByKid.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch treatments preview
      .addCase(fetchTreatmentsPreview.pending, (state) => {
        state.previewStatus = 'loading';
        state.previewError = null;
      })
      .addCase(fetchTreatmentsPreview.fulfilled, (state, action) => {
        state.previewStatus = 'succeeded';
        state.treatmentsPreview = action.payload;
      })
      .addCase(fetchTreatmentsPreview.rejected, (state, action) => {
        state.previewStatus = 'failed';
        state.previewError = action.payload;
      })
      
      // Approve report
      .addCase(approveTasheReport.fulfilled, (state, action) => {
        const { reportId } = action.payload;
        const reportIndex = state.reports.findIndex(r => r.reportId === reportId);
        if (reportIndex !== -1) {
          state.reports[reportIndex].isApproved = true;
        }
      })
      
      // Delete report
      .addCase(deleteTasheReport.fulfilled, (state, action) => {
        state.reports = state.reports.filter(r => r.reportId !== action.payload);
      })

      .addCase(updateTasheReport.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateTasheReport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.reports.findIndex(report => report.reportId === action.payload.reportId);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
      })
      .addCase(updateTasheReport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(checkCanEditReport.fulfilled, (state, action) => {
        state.editPermissions[action.payload.reportId] = action.payload.canEdit;
      })

      .addCase(fetchReportStatistics.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchReportStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      })
      .addCase(fetchReportStatistics.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { 
  clearError, 
  clearReports, 
  clearTreatmentsPreview, 
  setCurrentReport,
  resetGenerateStatus ,
  clearStatistics
} = tasheReportsSlice.actions;

export default tasheReportsSlice.reducer;
