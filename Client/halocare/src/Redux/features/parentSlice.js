// src/Redux/features/parentsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

export const fetchParents = createAsyncThunk(
  'parents/fetchParents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/Parents');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת רשימת ההורים');
    }
  }
);

export const fetchParentById = createAsyncThunk(
  'parents/fetchParentById',
  async (parentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Parents/${parentId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת פרטי ההורה');
    }
  }
);

export const createParent = createAsyncThunk(
  'parents/createParent',
  async (parentData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/Parents', parentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה ביצירת הורה חדש');
    }
  }
);

export const updateParent = createAsyncThunk(
  'parents/updateParent',
  async (parentData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/Parents/${parentData.parentId}`, parentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון פרטי ההורה');
    }
  }
);

const parentsSlice = createSlice({
  name: 'parents',
  initialState: {
    parents: [],
    selectedParent: null,
    status: 'idle',
    error: null
  },
  reducers: {
    clearSelectedParent: (state) => {
      state.selectedParent = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch parents
      .addCase(fetchParents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchParents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.parents = action.payload;
      })
      .addCase(fetchParents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת רשימת ההורים';
      })
      
      // Fetch parent by ID
      .addCase(fetchParentById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchParentById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedParent = action.payload;
      })
      .addCase(fetchParentById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת פרטי ההורה';
      })
      
      // Create parent
      .addCase(createParent.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createParent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.parents.push(action.payload);
        state.selectedParent = action.payload;
      })
      .addCase(createParent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה ביצירת הורה חדש';
      })
      
      // Update parent
      .addCase(updateParent.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateParent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // עדכון ההורה ברשימה
        const index = state.parents.findIndex(parent => parent.parentId === action.payload.parentId);
        if (index !== -1) {
          state.parents[index] = action.payload;
        }
        state.selectedParent = action.payload;
      })
      .addCase(updateParent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בעדכון פרטי ההורה';
      });
  }
});

export const { clearSelectedParent } = parentsSlice.actions;

export default parentsSlice.reducer;