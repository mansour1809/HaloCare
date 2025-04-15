import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// Async thunks
export const fetchDocumentsByEmployeeId = createAsyncThunk(
  'documents/fetchByEmployeeId',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Documents/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת מסמכים');
    }
  }
);

export const fetchDocumentsByKidId = createAsyncThunk(
  'documents/fetchByKidId',
  async (kidId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Documents/kid/${kidId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת מסמכים');
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async ({ document, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('File', file);
      formData.append('Document.KidId', document.KidId || null);
      formData.append('Document.EmployeeId', document.EmployeeId || null);
      formData.append('Document.DocType', document.DocType);

      const response = await axios.post('/Documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בהעלאת מסמך');
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/delete',
  async (docId, { rejectWithValue }) => {
    try {
      await axios.delete(`/Documents/${docId}`);
      return docId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה במחיקת מסמך');
    }
  }
);

// Slice
const documentsSlice = createSlice({
  name: 'documents',
  initialState: {
    documents: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {
    clearDocuments: (state) => {
      state.documents = [];
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch by Employee ID
      .addCase(fetchDocumentsByEmployeeId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDocumentsByEmployeeId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.documents = action.payload;
        state.error = null;
      })
      .addCase(fetchDocumentsByEmployeeId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch by Kid ID
      .addCase(fetchDocumentsByKidId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDocumentsByKidId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.documents = action.payload;
        state.error = null;
      })
      .addCase(fetchDocumentsByKidId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Upload
      .addCase(uploadDocument.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.documents.push(action.payload);
        state.error = null;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Delete
      .addCase(deleteDocument.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.documents = state.documents.filter(doc => doc.docId !== action.payload);
        state.error = null;
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { clearDocuments } = documentsSlice.actions;
export default documentsSlice.reducer;