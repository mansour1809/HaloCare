// src/Redux/features/documentsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// אסינק תנקס לטעינת מסמכים לפי ישות
export const fetchDocumentsByEntityId = createAsyncThunk(
  'documents/fetchByEntityId',
  async ({ entityId, entityType }, { rejectWithValue }) => {
    try {
      // שימוש בנתיב דינמי בהתאם לסוג הישות
      const endpoint = `/Documents/${entityType}/${entityId}`;
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('שגיאה בטעינת מסמכים:', error);
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת מסמכים');
    }
  }
);

// אסינק תנקס לטעינת מסמך בודד
export const fetchDocumentsById = createAsyncThunk(
  'documents/fetchById',
  async ({ documentId }, { rejectWithValue }) => {
    try {
      const endpoint = `/Documents/${documentId}`;
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('שגיאה בטעינת מסמך:', error);
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת מסמך');
    }
  }
);

// אסינק תנקס להעלאת מסמך - **תיקון קריטי**
export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async ({ document, file }, { rejectWithValue }) => {
    try {
      // בדיקות תקינות בסיסיות
      if (!file) {
        throw new Error('לא נבחר קובץ');
      }
      
      if (!document || (!document.KidId && !document.EmployeeId)) {
        throw new Error('חובה לציין ילד או עובד');
      }

      const formData = new FormData();
      
      // הוספת הקובץ
      formData.append('File', file);
      
      // **תיקון הקריטי - הוספת פרטי המסמך בפורמט שהשרת מצפה**
      if (document.KidId) {
        formData.append('Document.KidId', document.KidId.toString());
      }
      
      if (document.EmployeeId) {
        formData.append('Document.EmployeeId', document.EmployeeId.toString());
      }
      
      if (document.DocType) {
        formData.append('Document.DocType', document.DocType);
      }

      // וידוא שיש שם למסמך
      const docName = document.DocName || file.name;
      formData.append('Document.DocName', docName);

      console.log('שליחת מסמך:', {
        fileName: file.name,
        fileSize: file.size,
        docType: document.DocType,
        entityId: document.KidId || document.EmployeeId,
        entityType: document.KidId ? 'Kid' : 'Employee'
      });

      // שליחת הבקשה עם headers מתאימים
      const response = await axios.post('/Documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 שניות timeout
      });
      
      console.log('מסמך הועלה בהצלחה:', response.data);
      return response.data;
    } catch (error) {
      console.error('שגיאה בהעלאת מסמך:', error);
      
      // לוגינג מפורט של השגיאה
      if (error.response) {
        console.error('פרטי שגיאה מהשרת:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      return rejectWithValue(
        error.response?.data || 
        error.message || 
        'שגיאה בהעלאת מסמך'
      );
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
      console.error('שגיאה במחיקת מסמך:', error);
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
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // טעינת מסמכים לפי ישות
      .addCase(fetchDocumentsByEntityId.pending, (state) => {
        state.status = 'loading';
        state.error = null;
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
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.documents.push(action.payload);
        state.error = null;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.error('Redux: העלאת מסמך נכשלה:', action.payload);
      })
      
      // מחיקת מסמך
      .addCase(deleteDocument.pending, (state) => {
        state.status = 'loading';
        state.error = null;
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

export const { clearDocuments, clearError } = documentsSlice.actions;
export default documentsSlice.reducer;

// פונקציות עזר לתאימות לאחור
export const fetchDocumentsByEmployeeId = (employeeId) => 
  fetchDocumentsByEntityId({ entityId: employeeId, entityType: 'employee' });
  
export const fetchDocumentsByKidId = (kidId) => 
  fetchDocumentsByEntityId({ entityId: kidId, entityType: 'kid' });