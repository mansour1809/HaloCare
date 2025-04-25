import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../components/common/axiosConfig';

// פונקציית עזר להמרת אירוע לפורמט קלנדר
const formatEventForCalendar = (event) => {
  return {
    id: event.eventId,
    title: event.eventTitle || event.eventType,
    start: event.startTime,
    end: event.endTime,
    backgroundColor: event.color || '#1976d2',
    borderColor: event.color || '#1976d2',
    extendedProps: {
      location: event.location,
      description: event.description,
      eventTypeId: event.eventTypeId,
      type: event.eventType,
      color: event.color,
      createdBy: event.createdBy,
      kidIds: event.kidIds || [],
      employeeIds: event.employeeIds || []
    }
  };
};

// פעולה אסינכרונית לטעינת האירועים
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/Events');
      return response.data.map(formatEventForCalendar);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export default eventsSlice.reducer;