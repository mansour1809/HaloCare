import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// טעינת רשימת סוגי האירועים
export const fetchEventTypes = createAsyncThunk(
  'eventTypes/fetchEventTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/EventTypes");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת רשימת סוגי האירועים');
    }
  }
);

// הוספת סוג אירוע חדש
export const addEventType = createAsyncThunk(
  'eventTypes/addEventType',
  async (eventTypeData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/EventTypes", eventTypeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בהוספת סוג האירוע');
    }
  }
);

// עדכון סוג אירוע
export const updateEventType = createAsyncThunk(
  'eventTypes/updateEventType',
  async (eventTypeData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/EventTypes/${eventTypeData.eventTypeId}`, eventTypeData);
      return eventTypeData;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון סוג האירוע');
    }
  }
);

const eventTypesSlice = createSlice({
  name: 'eventTypes',
  initialState: {
    eventTypes: [],
    status: 'idle',
    error: null,
    actionStatus: 'idle'
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetActionStatus: (state) => {
      state.actionStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Event Types
      .addCase(fetchEventTypes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEventTypes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.eventTypes = action.payload;
      })
      .addCase(fetchEventTypes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Add Event Type
      .addCase(addEventType.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(addEventType.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.eventTypes.push(action.payload);
      })
      .addCase(addEventType.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })
      
      // Update Event Type
      .addCase(updateEventType.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(updateEventType.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const index = state.eventTypes.findIndex(type => type.eventTypeId === action.payload.eventTypeId);
        if (index !== -1) {
          state.eventTypes[index] = action.payload;
        }
      })
      .addCase(updateEventType.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      });
  }
});

export const { clearError, resetActionStatus } = eventTypesSlice.actions;
export default eventTypesSlice.reducer;