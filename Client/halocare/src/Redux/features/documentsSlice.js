// src/Redux/features/documentsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// אסינק תנקס לטעינת מסמכים
export const fetchDocumentsByEntityId = createAsyncThunk(
  'documents/fetchByEntityId',
  async ({ entityId, entityType }, { rejectWithValue }) => {
    try {
      // שימוש בנתיב דינמי בהתאם לסוג הישות
      const endpoint = 
        `/Documents/${entityType}/${entityId}`;
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת מסמכים');
    }
  }
);

export const fetchDocumentsById = createAsyncThunk(
  'documents/fetchById',
  async ({ documentId }, { rejectWithValue }) => {
    try {
      // שימוש בנתיב דינמי בהתאם לסוג הישות
      const endpoint = 
        `/Documents/${documentId}`;
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת מסמך');
    }
  }
);

// אסינק תנקס להעלאת מסמך
export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async ({ document, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // הוספת הקובץ
      formData.append('File', file);
      
      // הוספת פרטי המסמך בתצורה שהשרת מצפה
      if (document.KidId) {
        formData.append('Document.KidId', document.KidId);
      }
      
      formData.append('Document.DocName', file.name);

      
      if (document.EmployeeId) {
        formData.append('Document.EmployeeId', document.EmployeeId);
      }
      
      if (document.DocType) {
        formData.append('Document.DocType', document.DocType);
      }

      // שליחת הבקשה
      const response = await axios.post('/Documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('שגיאה בהעלאת מסמך:', error);
      if (error.response && error.response.data) {
        console.error('פרטי שגיאה:', error.response.data);
      }
      return rejectWithValue(error.response?.data || 'שגיאה בהעלאת מסמך');
    }
  }
);

// אסינק תנקס למחיקת מסמך
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

// יצירת סלייס
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
      // טעינת מסמכים
      .addCase(fetchDocumentsByEntityId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDocumentsByEntityId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.documents = action.payload;
        state.error = null;
      })
      .addCase(fetchDocumentsByEntityId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // העלאת מסמך
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
      
      // מחיקת מסמך
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

// נייצא את הפונקציות המקוריות לצורך תאימות לאחור
export const fetchDocumentsByEmployeeId = (employeeId) => 
  fetchDocumentsByEntityId({ entityId: employeeId, entityType: 'employee' });
  
export const fetchDocumentsByKidId = (kidId) => 
  fetchDocumentsByEntityId({ entityId: kidId, entityType: 'kid' });