// src/Redux/features/kidsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

export const fetchKids = createAsyncThunk(
  'kids/fetchKids',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/Kids');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת רשימת הילדים');
    }
  }
);

export const fetchKidById = createAsyncThunk(
  'kids/fetchKidById',
  async (kidId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Kids/${kidId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת פרטי הילד');
    }
  }
);
export const fetchKidProfile = createAsyncThunk(
  'kids/fetchKidProfile',
  async (kidId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Kids/${kidId}/file`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת פרופיל הילד');
    }
  }
);

export const createKid = createAsyncThunk(
  'kids/createKid',
  async (kidData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/Kids', kidData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה ביצירת ילד חדש');
    }
  }
);

export const updateKid = createAsyncThunk(
  'kids/updateKid',
  async (kidData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/Kids/${kidData.id}`, kidData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון פרטי הילד');
    }
  }
);
const kidsSlice = createSlice({
  name: 'kids',
  initialState: {
    kids: [],
    selectedKid: null,
    status: 'idle',
    error: null
  },
  reducers: {
    clearSelectedKid: (state) => {
      state.selectedKid = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch kids
      .addCase(fetchKids.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchKids.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.kids = action.payload;
      })
      .addCase(fetchKids.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת רשימת הילדים';
      })
      
      // Fetch kid by ID
      .addCase(fetchKidById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchKidById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedKid = action.payload;
      })
      .addCase(fetchKidById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'שגיאה בטעינת פרטי הילד';
      })
      .addCase(fetchKidProfile.pending, (state) => {
  state.status = 'loading';
})
.addCase(fetchKidProfile.fulfilled, (state, action) => {
  state.status = 'succeeded';
  state.selectedKid = action.payload;
})
.addCase(fetchKidProfile.rejected, (state, action) => {
  state.status = 'failed';
  state.error = action.payload || 'שגיאה בטעינת פרופיל הילד';
})
.addCase(createKid.pending, (state) => {
  state.status = 'loading';
})
.addCase(createKid.fulfilled, (state, action) => {
  state.status = 'succeeded';
  state.kids.push(action.payload);
  state.selectedKid = action.payload;
})
.addCase(createKid.rejected, (state, action) => {
  state.status = 'failed';
  state.error = action.payload || 'שגיאה ביצירת ילד חדש';
})
.addCase(updateKid.pending, (state) => {
  state.status = 'loading';
})
.addCase(updateKid.fulfilled, (state, action) => {
  state.status = 'succeeded';
  // עדכון הילד ברשימה
  const index = state.kids.findIndex(kid => kid.id === action.payload.id);
  if (index !== -1) {
    state.kids[index] = action.payload;
  }
  state.selectedKid = action.payload;
})
.addCase(updateKid.rejected, (state, action) => {
  state.status = 'failed';
  state.error = action.payload || 'שגיאה בעדכון פרטי הילד';
});
  }
});

export const { clearSelectedKid } = kidsSlice.actions;

export default kidsSlice.reducer;